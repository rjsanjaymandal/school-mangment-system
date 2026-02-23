/**
 * Institutional Fiscal Engine (v4.0)
 * Handles deep financial logic for installments, late fees, and payroll calculations.
 */

export interface InstallmentPlan {
    total: number;
    count: number;
    interestRate: number; // e.g., 0.05 for 5%
}

export interface PayrollInput {
    baseSalary: number;
    unpaidLeaveDays: number;
    totalWorkingDays: number;
    performanceBonus: number;
}

export const FiscalEngine = {
    /**
     * Calculates installment schedules based on plan type.
     */
    calculateInstallments(plan: InstallmentPlan) {
        const principalPerInstallment = plan.total / plan.count;
        const interest = (plan.total * plan.interestRate) / plan.count;
        
        return Array.from({ length: plan.count }).map((_, i) => ({
            index: i + 1,
            amount: Number((principalPerInstallment + interest).toFixed(2)),
            dueDate: new Date(Date.now() + (i + 1) * 30 * 24 * 60 * 60 * 1000).toISOString()
        }));
    },

    /**
     * Deep Payroll Logic: Attendance-to-Salary Mapping
     */
    computeDisbursement(input: PayrollInput) {
        const dailyRate = input.baseSalary / input.totalWorkingDays;
        const deduction = dailyRate * input.unpaidLeaveDays;
        
        const finalSalary = input.baseSalary - deduction + input.performanceBonus;
        
        return {
            grossPay: input.baseSalary + input.performanceBonus,
            deductions: Number(deduction.toFixed(2)),
            netPay: Number(finalSalary.toFixed(2))
        };
    }
};
