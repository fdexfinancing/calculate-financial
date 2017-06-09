const {calculateDREBalance} = require('../index');

test('functions should be defined', () => {
  expect(calculateDREBalance).toBeDefined();
});

test('should return expected schema', () => {
    const res = calculateDREBalance({}, {});

    expect(res).toHaveProperty('growth', NaN);
    expect(res).toHaveProperty('gross_result', '');
    expect(res).toHaveProperty('operational_result', 0);
    expect(res).toHaveProperty('_ebitda', 0);
    expect(res).toHaveProperty('liquid_profit_before_ir', 0);
    expect(res).toHaveProperty('liquid_profit', 0);
    expect(res).toHaveProperty('total_tax_liability', '');
    expect(res).toHaveProperty('liquid_debit', '');
    expect(res).toHaveProperty('liquid_debit_with_liability', '');
    expect(res).toHaveProperty('k_variation', 0);
    expect(res).toHaveProperty('financial_debits', 0);
    expect(res).toHaveProperty('additional_leverage_cp', NaN);
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
