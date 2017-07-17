# Package to calculate financial data based on DRE and balance

### Available Function
    calculateBalanceAndIndicators(data, options)

Input data example

  ```json
{
    gross_revenue: 70855981,
    net_income_year_before_before: 0,
    net_income_year_before: 88670000,
    net_income: 54650123,
    sold_product_cost: 49450123,
    adm_cost: 5977920,
    sell_team_cost: 3031763,
    op_cost: -1482630,
    depreciation: 1185017,
    financial_result: -6128342,
    rev_exp_no_rec: 0,
    other: 0,
    exp_ir_csll: 0,
    current_assets: 20724088,
    cash_availability: 1739910,
    customer_receive_year_before: 13740000,
    customer_receive: 4368477,
    stock_year_before: 11752000,
    stock: 6602469,
    no_current_assets: 49986018,
    bills_pay_before: 26095000,
    bills_pay: 16423411,
    taxes_cp: 5157445,
    taxes_lp: 5887392,
    liabilities_cp: 31079203,
    liabilities_lp: 34237169,
    onerous_liability_cp: 9498347,
    onerous_liability_lp: 9842582,
    liquid_assets: 5393734,
    leverage_quotient: 0.5,
    adjust_liquid_debit: "",
    target_value: 3000000,
    cdi: 12.13,
    target_term: 12,
    month_quantity: 12,
    dollar_revenue: "",
    serasa: "",
    refin: ""
}
  ```

  Full answer output data example

  ```json

{
    balance: {
        growth: -38.36683996842224,
        gross_result: 5200000,
        operational_result: -2327053,
        _ebitda: -1142036,
        liquid_profit_before_ir: -8455395,
        liquid_profit: -8455395,
        total_tax_liability: 11044837,
        liquid_debit: 17601019,
        liquid_debit_with_liability: 28645856,
        k_variation: -4849465,
        additional_leverage_total: 1500000,
        financial_debits: -301950.00000000006,
        additional_leverage_cp: 1500000,
        total_revenue: 70855981,
        total_debit: 19340929
    },
    indicators: {
        anual_gross_revenue: 70855981,
        liquid_revenue: 54650123,
        equity: 5393734,
        ebitda: -1142036,
        ebitda_by_net_revenue: -0.02089722652591285,
        net_earnings: -8455395,
        net_earnings_by_net_revenue: -0.1547186819689317,
        net_debt_by_equity: 3.5413350009473956,
        net_debt_by_ebitda: 100,
        net_debt_plus_taxes_by_ebitda: -26.396589949878987,
        net_debt_by_ebitda_interest: 100,
        gross_debt_by_monthly_revenue: 3.52957004434107,
        current_debt_by_monthly_revenue: 1.8626538245232962,
        current_ratio: 0.6668152976767132,
        quick_ratio: 0.4562765981030733,
        debt_ratio: 1.0825785914747377,
        interest_coverage: 0,
        interest_coveraty_minus_working_capital: 0,
        usd_income: '',
        default_ninetydays_by_equity: 0,
        avgGrowth: -38.36683996842224,
        maxGrowth: -38.36683996842224,
        minGrowth: -38.36683996842224
    }
}
