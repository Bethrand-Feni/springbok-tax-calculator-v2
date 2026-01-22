
const TAX_BRACKETS = [
    { min: 0, max: 237100, baseTax: 0, rate: 0.18 },
    { min: 237101, max: 370500, baseTax: 42678, rate: 0.26 },
    { min: 370501, max: 512800, baseTax: 77362, rate: 0.31 },
    { min: 512801, max: 673000, baseTax: 121475, rate: 0.36 },
    { min: 673001, max: 857900, baseTax: 179147, rate: 0.39 },
    { min: 857901, max: 1817000, baseTax: 251258, rate: 0.41 },
    { min: 1817001, max: Infinity, baseTax: 644489, rate: 0.45 }
];

const TAX_REBATES = {
    1: 17235,  // Under 65
    2: 26679,  // 65-75 
    3: 29824   // 75+ 
};

const RETIREMENT_DEDUCTION_CAP = {
    percentage: 0.275,  // 27.5% of taxable income
    maxAmount: 350000   // Maximum R350,000 per year
};

const MEDICAL_AID_CREDITS = {
    mainMember: 364,           // Monthly credit for main member
    firstDependent: 364,       // Monthly credit for first dependent
    additionalDependent: 246   // Monthly credit per additional dependent
};

export function getTaxRebate(ageGroup) {
    return TAX_REBATES[ageGroup] || TAX_REBATES[1];
}

export function calculateTaxForBracket(annualIncome) {
    const bracket = TAX_BRACKETS.find(
        b => annualIncome >= b.min && annualIncome <= b.max
    );

    if (!bracket) {
        throw new Error('Invalid income amount');
    }

    const taxableAboveMin = annualIncome - bracket.min;
    const marginalTax = taxableAboveMin * bracket.rate;
    const totalTax = bracket.baseTax + marginalTax;

    return Math.max(0, totalTax);
}

export function calculateTax(income, ageGroup, paymentFrequency, options = {}) {
    if (!income || income < 0) {
        throw new Error('Invalid income amount');
    }

    if (![1, 2, 3].includes(ageGroup)) {
        throw new Error('Invalid age group. Must be 1 (under 65), 2 (65-75), or 3 (75+)');
    }

    if (!['monthly', 'yearly'].includes(paymentFrequency.toLowerCase())) {
        throw new Error('Invalid payment frequency. Must be "monthly" or "yearly"');
    }

    const isMonthly = paymentFrequency.toLowerCase() === 'monthly';
    const multiplier = isMonthly ? 12 : 1;

    // Convert all inputs to annual amounts
    const annualPrimaryIncome = income * multiplier;
    const annualOtherIncome = (options.otherIncome || 0) * multiplier;
    const annualOtherIncomeDeductions = (options.otherIncomeDeductions || 0) * multiplier;

    const totalGrossIncome = annualPrimaryIncome + annualOtherIncome;

    //Adding of all retirment contributions
    const pensionContributions = ((options.pensionEmployee || 0) + (options.pensionEmployer || 0)) * multiplier;
    const providentContributions = ((options.providentEmployee || 0) + (options.providentEmployer || 0)) * multiplier;
    const retirementAnnuityContributions = (options.retirementAnnuity || 0) * multiplier;

    const totalRetirementContributions = pensionContributions + providentContributions + retirementAnnuityContributions;

    // Apply retirement deduction cap: 27.5% of income, max R350,000
    const retirementCap = Math.min(
        totalGrossIncome * RETIREMENT_DEDUCTION_CAP.percentage,
        RETIREMENT_DEDUCTION_CAP.maxAmount
    );
    const retirementDeduction = Math.min(totalRetirementContributions, retirementCap);

    const taxableIncome = totalGrossIncome - annualOtherIncomeDeductions - retirementDeduction;

    const taxBeforeCredits = calculateTaxForBracket(taxableIncome);

    const rebate = getTaxRebate(ageGroup);

    let medicalCredits = 0;

    if (options.medicalDependents !== undefined && options.medicalDependents !== null && options.medicalAid) {
        const dependents = options.medicalDependents;
        medicalCredits = MEDICAL_AID_CREDITS.mainMember * 12; // Main member

        if (dependents >= 1) {
            medicalCredits += MEDICAL_AID_CREDITS.firstDependent * 12; // First dependent
        }
        if (dependents >= 2) {
            medicalCredits += MEDICAL_AID_CREDITS.additionalDependent * 12 * (dependents - 1); // Additional dependents
        }
    }

    // Calculate final tax
    const yearlyTax = Math.max(0, taxBeforeCredits - rebate - medicalCredits);
    const monthlyTax = yearlyTax / 12;

    // Calculate net income
    const monthlyNetIncome = isMonthly
        ? income + (options.otherIncome || 0) - (options.otherIncomeDeductions || 0) - monthlyTax
        : ((income + (options.otherIncome || 0) - (options.otherIncomeDeductions || 0)) * multiplier - yearlyTax) / 12;

    return {
        monthlyTax: Math.round(monthlyTax * 100) / 100,
        yearlyTax: Math.round(yearlyTax * 100) / 100,
        rebate: rebate,
        netIncome: Math.round(monthlyNetIncome * 100) / 100,
        breakdown: {
            totalIncome: totalGrossIncome,
            retirementDeductions: retirementDeduction,
            retirementDeductionsCap: retirementCap,
            taxableIncome: taxableIncome,
            taxBeforeCredits: taxBeforeCredits,
            medicalCredits: medicalCredits
        }
    };
}


export default {
    calculateTax,
};
