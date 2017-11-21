"use strict";

var defaultOptions = {
    decimal: 0
};

var index = {
    interest: [10.9, 2.7, 2.6, 1.6, 1.2, 0.5],
    debt: [1, 2.6, 4.1, 4.9, 5.1, 12.6],
    ebit: [31, 16, 12, 9, 2, -5]
};

function calculateBalanceAndIndicators() {
    var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    var result = {};

    result.balance = calculateDREBalance(data, options);

    result.indicators = calculateIndicators(Object.assign(data, result.balance), options);

    result.theoretic_rating = calculateTheoreticRating({
        interest_coverage: result.indicators.interest_coverage,
        ebitda: result.indicators.ebitda,
        liquid_debit: result.balance.liquid_debit,
        operational_result: result.balance.operational_result,
        net_income: data.net_income }, options);

    return result;
}

function calculateDREBalance() {
    var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var options = arguments[1];

    var result = {};
    options = options || defaultOptions;

    result.growth = calcGrowth(data.net_income_year_before, data.net_income);
    result.growth_year_before = calcGrowth(data.net_income_year_before_before, data.net_income_year_before);
    result.gross_result = calcGrossResult(data.net_income, data.sold_product_cost);
    result.operational_result = calcOperationalResult(result.gross_result, data.adm_cost, data.sell_team_cost, data.op_cost);
    result._ebitda = calcEbitda(result.operational_result, data.depreciation);
    result.liquid_profit_before_ir = calcLiquidProfitBeforeIR(result.operational_result, data.financial_result, data.rev_exp_no_rec, data.other);
    result.liquid_profit = calcLiquidProfit(result.liquid_profit_before_ir, data.exp_ir_csll);
    result.total_tax_liability = calcTotalTaxLiability(data.taxes_cp, data.taxes_lp);
    result.liquid_debit = calcLiquidDebit(data.cash_availability, data.onerous_liability_cp, data.onerous_liability_lp, data.adjust_liquid_debit);
    result.liquid_debit_with_liability = calcLiquidDebitWithLiability(result.liquid_debit, result.total_tax_liability);
    result.bills_pay_before = calcBills(data.taxes_cp_before, data.liabilities_cp_before, data.related_parts_cp_before, data.onerous_liability_cp_before);
    result.bills_pay = calcBills(data.taxes_cp, data.liabilities_cp, data.related_parts_cp, data.onerous_liability_cp);
    result.k_variation = calcKVariation(data.customer_receive_year_before, data.stock_year_before, result.bills_pay_before, data.customer_receive, data.stock, result.bills_pay);
    result.additional_leverage_total = calcAdditionalLeverage(data.leverage_quotient, data.target_value);
    result.financial_debits = calcFinancialDebits(result.additional_leverage_total, data.cdi);
    result.additional_leverage_cp = calcAdditionalLeverageCP(result.additional_leverage_total, data.target_term);
    result.total_revenue = data.gross_revenue || 0;
    result.total_debit = calcTotalDebit(data.onerous_liability_cp, data.onerous_liability_lp);

    return result;
}

function calcGrowth(net_income_year_before, net_income) {
    if (isNaN(parseFloat(net_income)) || isNaN(parseFloat(net_income_year_before)) || parseFloat(net_income_year_before) == 0) {
        return "";
    }

    return (parseFloat(net_income) - parseFloat(net_income_year_before)) / parseFloat(net_income_year_before) * 100;
}

function calcGrossResult(net_income, sold_product_cost) {
    if (isNaN(parseFloat(net_income) - parseFloat(sold_product_cost))) {
        return "";
    }

    return parseFloat(net_income) - parseFloat(sold_product_cost);
}

function calcOperationalResult(gross_result) {
    var adm_cost = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
    var sell_team_cost = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
    var op_cost = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;

    if (isNaN(gross_result - parseFloat(adm_cost) - parseFloat(sell_team_cost) - parseFloat(op_cost))) {
        return "";
    }

    return gross_result - parseFloat(adm_cost) - parseFloat(sell_team_cost) - parseFloat(op_cost);
}

function calcEbitda(operational_result) {
    var depreciation = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

    if (isNaN(operational_result)) {
        return 0;
    }

    return operational_result + parseFloat(depreciation);
}

function calcLiquidProfitBeforeIR(operational_result) {
    var financial_result = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
    var rev_exp_no_rec = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
    var other = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;

    if (isNaN(operational_result + parseFloat(financial_result) + parseFloat(rev_exp_no_rec) + parseFloat(other))) {
        return "";
    }

    return operational_result + parseFloat(financial_result) + parseFloat(rev_exp_no_rec) + parseFloat(other);
}

function calcLiquidProfit(liquid_profit_before_ir) {
    var exp_ir_csll = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

    if (isNaN(liquid_profit_before_ir - parseFloat(exp_ir_csll))) {
        return "";
    }

    return liquid_profit_before_ir - parseFloat(exp_ir_csll);
}

function calcTotalTaxLiability(taxes_cp, taxes_lp) {
    if (isNaN(parseFloat(taxes_cp) + parseFloat(taxes_lp))) {
        return "";
    }

    return parseFloat(taxes_cp) + parseFloat(taxes_lp);
}

function calcLiquidDebit(cash_availability, onerous_liability_cp, onerous_liability_lp, adjust_liquid_debit) {
    if (isNaN(parseFloat(cash_availability)) || isNaN(parseFloat(onerous_liability_cp)) || isNaN(parseFloat(onerous_liability_lp))) {
        return "";
    }

    var l_debit = parseFloat(onerous_liability_cp) + parseFloat(onerous_liability_lp) - parseFloat(cash_availability);

    if (!isNaN(parseFloat(adjust_liquid_debit))) {
        l_debit += parseFloat(adjust_liquid_debit);
    }

    return l_debit;
}

function calcLiquidDebitWithLiability(liquid_debit, total_tax_liability) {
    if (isNaN(liquid_debit + total_tax_liability)) {
        return "";
    }

    return liquid_debit + total_tax_liability;
}

function calcKVariation() {
    var customer_receive_year_before = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
    var stock_year_before = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
    var bills_pay_before = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
    var customer_receive = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
    var stock = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 0;
    var bills_pay = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 0;

    var k_variation = Math.max(parseFloat(customer_receive), 0) + Math.max(parseFloat(stock), 0) - Math.max(parseFloat(bills_pay), 0);

    var k_variation_year_before = Math.max(parseFloat(customer_receive_year_before), 0) + Math.max(parseFloat(stock_year_before), 0) - Math.max(parseFloat(bills_pay_before), 0);

    if (isNaN(k_variation - k_variation_year_before)) {
        return "";
    }

    return k_variation - k_variation_year_before;
}

function calcFinancialDebits(additional_leverage_total) {
    var cdi = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

    if (isNaN(parseFloat(cdi)) || isNaN(additional_leverage_total)) {
        return 0;
    }

    return (parseFloat(cdi) + 8) / 100 * additional_leverage_total * -1;
}

function calcAdditionalLeverage() {
    var leverage_quotient = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
    var target_value = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

    if (isNaN(parseFloat(leverage_quotient) * parseFloat(target_value))) {
        return 0;
    }

    return parseFloat(leverage_quotient) * parseFloat(target_value);
}

function calcAdditionalLeverageCP(additional_leverage_total, target_term) {
    if (isNaN(parseFloat(target_term)) || parseFloat(target_term) == 0) {
        return 0;
    }

    return additional_leverage_total * 12 / parseFloat(target_term);
}

function calcTotalDebit(onerous_liability_cp, onerous_liability_lp) {
    if (isNaN(parseFloat(onerous_liability_cp) + parseFloat(onerous_liability_lp))) {
        return 0;
    }

    return parseFloat(onerous_liability_cp) + parseFloat(onerous_liability_lp);
}

function calcBills() {
    var taxes_cp = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
    var liabilities_cp = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
    var related_parts_cp = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
    var onerous_liability_cp = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;

    if (isNaN(parseFloat(liabilities_cp) - parseFloat(taxes_cp) - parseFloat(related_parts_cp) - parseFloat(onerous_liability_cp))) {
        return 0;
    }

    return parseFloat(liabilities_cp) - parseFloat(taxes_cp) - parseFloat(related_parts_cp) - parseFloat(onerous_liability_cp);
}

function calculateIndicators() {
    var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var options = arguments[1];

    var result = {};
    options = options || defaultOptions;

    result.anual_gross_revenue = calcGrossRevenue(data.gross_revenue, data.month_quantity);
    result.liquid_revenue = calcLiquidRevenue(data.net_income, data.month_quantity);
    result.equity = parseFloat(data.liquid_assets);
    result.ebitda = calcLajida(data._ebitda, data.month_quantity);
    result.ebitda_by_net_revenue = calcLajidaNetRevenue(result.ebitda, result.liquid_revenue);
    result.net_earnings = calcNetEarnings(data.liquid_profit, data.month_quantity);
    result.net_earnings_by_net_revenue = calcNetEarningsNetRevenue(result.net_earnings, result.liquid_revenue);
    result.net_debt_by_equity = calcNetDebitEquity(data.additional_leverage_total, data.liquid_debit, data.liquid_assets);
    result.net_debt_by_ebitda = calcNetDebitEbitda(data.liquid_debit, data.additional_leverage_total, result.ebitda, data.month_quantity);
    result.net_debt_plus_taxes_by_ebitda = calcNetDebitTaxesEbitda(data.liquid_debit_with_liability, data.additional_leverage_total, result.ebitda);
    result.net_debt_by_ebitda_interest = calcNetDebitEbitdaInterest(data.liquid_debit, data.additional_leverage_total, data.financial_result, data.financial_debits, data._ebitda, data.month_quantity);
    result.gross_debt_by_monthly_revenue = calcGrossDebtMonthlyRevenue(data.onerous_liability_cp, data.onerous_liability_lp, data.additional_leverage_total, data.gross_revenue, data.month_quantity);
    result.current_debt_by_monthly_revenue = calcCurrentDebtMonthlyRevenue(data.onerous_liability_cp, data.additional_leverage_total, data.gross_revenue, data.month_quantity);
    result.current_ratio = calcCurrentRatio(data.current_assets, data.liabilities_cp);
    result.quick_ratio = calcQuickRatio(data.current_assets, data.stock, data.additional_leverage_total, data.liabilities_lp);
    result.debt_ratio = calcDebitRatio(data.current_assets, data.no_current_assets, data.liabilities_cp, data.liabilities_lp);
    result.interest_coverage = calcInterestCoverage(data._ebitda, data.financial_result, data.financial_debits);
    result.interest_coveraty_minus_working_capital = calcInterestCoveratyMinusWorkingCapital(data._ebitda, data.financial_result, data.financial_debits, data.k_variation);
    result.usd_income = !isNaN(parseFloat(data.dollar_revenue) / parseFloat(data.gross_revenue)) ? parseFloat(data.dollar_revenue) / parseFloat(data.gross_revenue) : "";
    result.default_ninetydays_by_equity = calcDefaultNinetydaysEquity(data.liquid_assets, data.serasa, data.refin);
    result.home_equity = calcHomeEquity(data.related_parts_cp, data.related_parts_lp, data.liquid_assets, result.ebitda_by_net_revenue);
    var growthRevenue = calcGrowthRevenue(data.growth_year_before, data.growth);

    if (growthRevenue) {
        result.avg_growth = growthRevenue.average;
        result.max_growth = growthRevenue.max;
        result.min_growth = growthRevenue.min;
    }

    return result;
}

function calcGrossRevenue(gross_revenue, month_quantity) {
    if (parseInt(month_quantity) != 0) {
        return parseFloat(gross_revenue) / parseInt(month_quantity) * 12;
    }

    return "";
}

function calcLiquidRevenue(net_income, month_quantity) {
    if (parseFloat(month_quantity) != 0) {
        return parseFloat(net_income) / parseInt(month_quantity) * 12;
    }

    return "";
}

function calcLajida(ebitda, month_quantity) {
    if (parseFloat(month_quantity) != 0) {
        return parseFloat(ebitda) / parseFloat(month_quantity) * 12;
    }

    return "";
}

function calcLajidaNetRevenue(ebitda, liquid_revenue) {
    if (parseFloat(liquid_revenue) != 0) {
        return ebitda / liquid_revenue;
    }

    return "";
}

function calcNetEarnings(liquid_profit, month_quantity) {
    if (parseFloat(month_quantity) != 0) {
        return parseFloat(liquid_profit) / parseInt(month_quantity) * 12;
    }

    return "";
}

function calcNetEarningsNetRevenue(net_earnings, liquid_revenue) {
    if (parseFloat(liquid_revenue) != 0) {
        return net_earnings / liquid_revenue;
    }

    return "";
}

function calcNetDebitEquity(additional_leverage_total, liquid_debit, liquid_assets) {
    if (parseFloat(liquid_assets) != 0) {
        return (parseFloat(liquid_debit) + parseFloat(additional_leverage_total)) / parseFloat(liquid_assets);
    }

    return "";
}

function calcNetDebitEbitda(additional_leverage_total, liquid_debit, ebitda, month_quantity) {
    if (ebitda <= 0 || month_quantity <= 0) {
        return 100;
    }

    var yearProjection = parseInt(ebitda) / parseInt(month_quantity) * 12;

    return (parseFloat(liquid_debit) + parseFloat(additional_leverage_total)) / yearProjection;
}

function calcNetDebitTaxesEbitda(liquid_debit_with_liability, additional_leverage_total, ebitda) {
    if (parseFloat(ebitda) != 0) {
        return (parseFloat(liquid_debit_with_liability) + additional_leverage_total) / parseFloat(ebitda);
    }

    return "";
}

function calcNetDebitEbitdaInterest(liquid_debit, additional_leverage_total, financial_result, financial_debits, ebitda, month_quantity) {
    if (parseFloat(ebitda) <= 0 || parseFloat(ebitda) + parseFloat(financial_result) <= 0) {
        return 100;
    }

    var ebitdaResut = parseFloat(ebitda) + parseFloat(financial_result);

    var yearProjectionResult = month_quantity * 12;

    return (liquid_debit + additional_leverage_total) / (ebitdaResut / yearProjectionResult + financial_debits);
}

function calcGrossDebtMonthlyRevenue(onerous_liability_cp, onerous_liability_lp, additional_leverage_total, gross_revenue, month_quantity) {
    if (parseFloat(gross_revenue) != 0 && parseFloat(month_quantity) != 0) {
        return (onerous_liability_cp + onerous_liability_lp + additional_leverage_total) / (gross_revenue / month_quantity);
    }

    return "";
}

function calcCurrentDebtMonthlyRevenue(onerous_liability_cp, additional_leverage_total, gross_revenue, month_quantity) {
    if (parseFloat(gross_revenue) != 0 && parseFloat(month_quantity) != 0) {
        return (onerous_liability_cp + additional_leverage_total) / (gross_revenue / month_quantity);
    }

    return "";
}

function calcCurrentRatio(current_assets, liabilities_cp) {
    if (parseFloat(liabilities_cp) != 0) {
        return parseFloat(current_assets) / parseFloat(liabilities_cp);
    }

    return "";
}

function calcQuickRatio(current_assets) {
    var stock = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
    var additional_leverage_total = arguments[2];
    var liabilities_cp = arguments[3];

    if (parseFloat(liabilities_cp) != 0) {
        return (parseFloat(current_assets) - parseFloat(stock) + parseFloat(additional_leverage_total)) / parseFloat(liabilities_cp);
    }

    return "";
}

function calcDebitRatio(current_assets, no_current_assets, liabilities_cp, liabilities_lp) {
    if (parseFloat(liabilities_cp) + parseFloat(liabilities_lp) > 0) {
        return (parseFloat(current_assets) + parseFloat(no_current_assets)) / (parseFloat(liabilities_cp) + parseFloat(liabilities_lp));
    }

    return "";
}

function calcInterestCoverage(ebitda, financial_result, financial_debits) {
    var financial = (parseFloat(financial_result) + parseFloat(financial_debits)) * -1;

    if (ebitda <= 0) {
        return 0;
    }

    if (financial_result >= 0) {
        return 100;
    }

    if (financial != 0) {
        return ebitda / financial;
    }

    return "";
}

function calcInterestCoveratyMinusWorkingCapital(ebitda, financial_result, financial_debits, k_variation) {
    var financial = (parseFloat(financial_result) + parseFloat(financial_debits) - parseFloat(k_variation)) * -1;

    if (ebitda <= 0) {
        return 0;
    }

    if (financial_result >= 0) {
        return 100;
    }

    if (financial != 0) {
        return ebitda / financial;
    }

    return "";
}

function calcDefaultNinetydaysEquity(liquid_assets, serasa, refin) {
    if (liquid_assets <= 0 && serasa + refin > 0) {
        return 10;
    }

    return (serasa + refin) / liquid_assets;
}

function calcGrowthRevenue(growth_year_before, growth) {
    growth_year_before = parseFloat(growth_year_before);
    growth = parseFloat(growth);

    if (isNaN(growth)) {
        return "";
    }

    if (isNaN(growth_year_before)) {
        return {
            average: growth,
            max: growth,
            min: growth

        };
    }

    return {
        average: (growth_year_before + growth) / 2,
        max: Math.max(growth_year_before, growth),
        min: Math.min(growth_year_before, growth)

    };
}

function calcHomeEquity(related_parts_cp, related_parts_lp, liquid_assets, ebitda_by_net_revenue) {
    if (isNaN(parseFloat(related_parts_cp)) || isNaN(parseFloat(related_parts_lp)) || isNaN(parseFloat(liquid_assets))) {
        return 1;
    }

    if (parseFloat(related_parts_cp) + parseFloat(related_parts_lp) <= 0) {
        return 1;
    }

    if (parseFloat(related_parts_cp) + parseFloat(related_parts_lp) < parseFloat(liquid_assets) * 0.6) {
        return 1;
    }

    if (ebitda_by_net_revenue >= 0.05) {
        return 1;
    }

    return 0;
}

function calculateTheoreticRating() {
    var data = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var options = arguments[1];

    var rating = {
        1: 'aaa',
        2: 'aa',
        3: 'a',
        4: 'bbb',
        5: 'bb',
        6: 'bb-'
    };

    options = options || defaultOptions;

    var j = calcRatingInterestCoverage(data.interest_coverage);
    var d = calcRatingTotalDebt(data.ebitda, data.liquid_debit);
    var e = calcRatingEbit(data.operational_result, data.net_income);

    result = Math.ceil((j + d + e) / 3);

    return rating[result];
}

function calcRatingInterestCoverage(interest_coverage) {
    var j = index.interest.length;

    interest_coverage = Math.ceil(interest_coverage * 100) / 100;

    index.interest.every(function (r) {
        if (interest_coverage >= r) {
            j = index.interest.indexOf(r) + 1;
            return false;
        }

        return true;
    });

    return j;
}

function calcRatingTotalDebt(ebitda, liquid_debit) {
    var d = index.debt.length;

    if (ebitda <= 0 || liquid_debit <= 0) {
        return d;
    }

    debt_ebitda = Math.ceil(liquid_debit / ebitda * 100) / 100;

    index.debt.every(function (r) {
        if (debt_ebitda <= r) {
            d = index.debt.indexOf(r) + 1;
            return false;
        }

        return true;
    });

    return d;
}

function calcRatingEbit(operational_result, net_income) {
    var e = index.ebit.length;

    if (net_income == 0) {
        return e;
    }

    margin_ebit = operational_result / net_income * 100;

    index.ebit.every(function (r) {
        if (margin_ebit >= r) {
            e = index.ebit.indexOf(r) + 1;
            return false;
        }

        return true;
    });

    return e;
}

window.module = window.module || {};

module.exports = {
    calculateDREBalance: calculateDREBalance,
    calculateIndicators: calculateIndicators,
    calculateBalanceAndIndicators: calculateBalanceAndIndicators,
    calculateTheoreticRating: calculateTheoreticRating
};