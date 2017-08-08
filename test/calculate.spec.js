const {calculateDREBalance, calculateIndicators, calculateBalanceAndIndicators} = require('../index');

const {balanceData} = require('./fixture');


test('functions should be defined', () => {
  expect(calculateDREBalance).toBeDefined();
});

test('should return expected schema', () => {
    const res = calculateDREBalance({}, {});

    expect(res).toHaveProperty('growth', '');
    expect(res).toHaveProperty('gross_result', '');
    expect(res).toHaveProperty('operational_result', 0);
    expect(res).toHaveProperty('_ebitda', 0);
    expect(res).toHaveProperty('liquid_profit_before_ir', 0);
    expect(res).toHaveProperty('liquid_profit', 0);
    expect(res).toHaveProperty('total_tax_liability', '');
    expect(res).toHaveProperty('liquid_debit', '');
    expect(res).toHaveProperty('liquid_debit_with_liability', '');
    expect(res).toHaveProperty('k_variation', 0);
    expect(res).toHaveProperty('financial_debits', -0);
    expect(res).toHaveProperty('additional_leverage_cp', 0);
    expect(res).toHaveProperty('additional_leverage_total', 0);

    expect(res).toHaveProperty('total_revenue', 0);
    expect(res).toHaveProperty('total_debit', 0);
});

test('should return correct value to growth', () => {
    const res = calculateDREBalance({
        net_income_year_before: 88670000,
        net_income: 54650123
    }, {});

    expect(parseInt(res.growth)).toEqual(-38);
});

test('should return correct value to with all fields', () => {
    const res = calculateDREBalance(balanceData, {});

    expect(parseInt(res.growth)).toEqual(-38);
    expect(res.gross_result).toEqual(5200000);
    expect(res.operational_result).toEqual(-2327053);
    expect(res._ebitda).toEqual(-1142036);
    expect(res.liquid_profit_before_ir).toEqual(-8455395);
    expect(res.liquid_profit).toEqual(-8455395);
    expect(res.total_tax_liability).toEqual(11044837);
    expect(res.liquid_debit).toEqual(17601019);
    expect(res.liquid_debit_with_liability).toEqual(28645856);
    expect(res.k_variation).toEqual(-4849465);
    expect(res.additional_leverage_total).toEqual(1500000);
    expect(parseInt(res.financial_debits)).toEqual(-301950);
    expect(res.additional_leverage_cp).toEqual(1500000);
    expect(res.total_revenue).toEqual(70855981);
    expect(res.total_debit).toEqual(19340929);
});

test('should return correct value to with all fields', () => {
    const balanceDataCalc = calculateDREBalance(balanceData, {});

    const res = calculateIndicators(Object.assign(balanceData, balanceDataCalc), {});

    expect(res.anual_gross_revenue).toEqual(70855981);
    expect(res.liquid_revenue).toEqual(54650123);
    expect(res.equity).toEqual(5393734);
    expect(res.ebitda).toEqual(-1142036);
    expect(res.ebitda_by_net_revenue).toEqual(-0.02089722652591285);
    expect(res.net_earnings).toEqual(-8455395);
    expect(res.net_earnings_by_net_revenue).toEqual(-0.1547186819689317);
    expect(res.net_debt_by_equity).toEqual(3.5413350009473956);
    expect(res.net_debt_by_ebitda).toEqual(100);
    expect(res.net_debt_plus_taxes_by_ebitda).toEqual(-26.396589949878987);
    expect(res.net_debt_by_ebitda_interest).toEqual(100);
    expect(res.gross_debt_by_monthly_revenue).toEqual(3.52957004434107);
    expect(res.current_debt_by_monthly_revenue).toEqual(1.8626538245232962);
    expect(res.current_ratio).toEqual(0.6668152976767132);
    expect(res.quick_ratio).toEqual(0.4562765981030733);
    expect(res.debt_ratio).toEqual(1.0825785914747377);
    expect(res.interest_coverage).toEqual(0);
    expect(res.interest_coveraty_minus_working_capital).toEqual(0);
    expect(res.usd_income).toEqual('');
    expect(res.default_ninetydays_by_equity).toEqual(0);
    expect(res.home_equity).toEqual(0);
});

test('should return indicators and balance', () => {
    const res = calculateBalanceAndIndicators(balanceData, {});

    expect(res).toHaveProperty('balance');
    expect(res).toHaveProperty('indicators');
});
