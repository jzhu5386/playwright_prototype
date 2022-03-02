import { Locator, Page } from "@playwright/test";
import { EmployeeDetails, questionMap } from "../helpers/TestObjects";
import { CommonOperations } from "./CommonOperations";

export class EmployeePage extends CommonOperations {
  readonly page: Page;
  readonly salaryInput: Locator;
  readonly fiscalYearEndDate: Locator;
  readonly contractorQuestion: Locator;
  readonly yesButton: Locator;
  readonly noButton: Locator;
  readonly contractorSpendingQuestion: Locator;
  readonly contractorSpendingInput: Locator;
  readonly contractorNewProductQuestion: Locator;
  readonly stateWithRandDEmployee: Locator;
  readonly technicalPercentageQuestion: Locator;
  readonly employeeCountInput: Locator;
  readonly muiCircularProgress: Locator;

  constructor(page: Page) {
    super(page);
    this.page = page;
    // this.salary = this.page.locator('div[class*="Card"] input');
    this.salaryInput = this.page.locator(
      `input:below(:text("${questionMap.salaryLastMonth}"))`
    );
    this.fiscalYearEndDate = this.page.locator("#fiscalYearEndDate");
    this.contractorQuestion = this.page.locator(
      `text="${questionMap.contractorsNotInPayRoll}"`
    );
    this.yesButton = this.page.locator('button[aria-label="Yes"]');
    this.noButton = this.page.locator('button[aria-label="No"]');
    this.contractorSpendingQuestion = this.page.locator(
      `text="${questionMap.contractorPayrollSpending}"`
    );
    this.contractorSpendingInput = this.page.locator(
      'input:below(:text("contractors or contracting firms outside your payroll last month?"))'
    );
    this.contractorNewProductQuestion = this.page.locator(
      `text="${questionMap.developingNewProduct}"`
    );
    this.stateWithRandDEmployee = this.page.locator("div.MuiInputBase-root");
    this.technicalPercentageQuestion = this.page.locator(
      `text="${questionMap.technicalPercentage}"`
    );
    this.employeeCountInput = this.page.locator(
      'input:below(:text("How many employees do you currently have?"))'
    );
    this.muiCircularProgress = this.page.locator(
      "div.MuiCircularProgress-root"
    );
  }

  async goto() {
    await this.page.goto("/employee-details");
  }

  static buildDefaultEmployeeDetails(randDState?: string[]): EmployeeDetails {
    const _default: EmployeeDetails = {
      salaryLastMonth: 100000,
      firstPayrollMonth: "January",
      contractorsNotInPayRoll: "Yes",
      contractorPayrollSpending: 100000,
      developingNewProduct: "Yes",
      mostRAndDStates:
        randDState === undefined ? ["California", "Massachusetts"] : randDState,
      employeeCountJan: 5,
      expectedEmployeeCountDec: 5,
      technicalPercentage: "More than 50%",
    };
    return _default;
  }

  /**
   * This is a wrapper method that calls different methods to complete employee details based
   * on which payroll connection we are using
   * @param payrollConnection
   * @param employeeDetails
   */
  async completeEmployeeDetailsBasedOnPayrollConnection(
    payrollConnection: string,
    employeeDetails?: EmployeeDetails
  ): Promise<EmployeeDetails> {
    if (payrollConnection === "Rippling") {
      return await this.completeEmployeeDetailAfterRippling(employeeDetails);
    } else if (
      ["skipped", "skip", "Manually add"].includes(payrollConnection)
    ) {
      return await this.completeEmployeeDetailSkippedConnection(
        employeeDetails
      );
    } else {
      return await this.completeEmployeeDetailAfterFinch(employeeDetails);
    }
  }

  /**
   * This is when user had skipped payroll connection, they will be prompted with many more
   * questions
   */
  async completeEmployeeDetailSkippedConnection(
    employeeDetails?: EmployeeDetails
  ): Promise<EmployeeDetails> {
    if (employeeDetails === undefined) {
      employeeDetails = EmployeePage.buildDefaultEmployeeDetails();
    }

    await this.handleInputQuestions(
      questionMap.salaryLastMonth,
      employeeDetails.salaryLastMonth.toString()
    );
    // await this.salaryInput.type(employeeDetails.salaryLastMonth.toString());
    await this.handleDropDownQuestions(
      questionMap.firstPayrollMonth,
      employeeDetails.firstPayrollMonth
    );

    await this.completeEmployeeDetailCommonQuestions(employeeDetails);
    return employeeDetails;
  }

  async completeEmployeeDetailAfterFinch(
    employeeDetails?: EmployeeDetails
  ): Promise<EmployeeDetails> {
    if (employeeDetails === undefined) {
      employeeDetails = EmployeePage.buildDefaultEmployeeDetails();
    }

    await this.completeEmployeeDetailCommonQuestions(employeeDetails);
    return employeeDetails;
  }

  async completeEmployeeDetailAfterRippling(
    employeeDetails?: EmployeeDetails
  ): Promise<EmployeeDetails> {
    if (employeeDetails === undefined) {
      employeeDetails = EmployeePage.buildDefaultEmployeeDetails();
    }
    await this.handleInputQuestions(
      questionMap.salaryLastMonth,
      employeeDetails.salaryLastMonth.toString()
    );
    await this.handleDropDownQuestions(
      questionMap.firstPayrollMonth,
      employeeDetails.firstPayrollMonth
    );
    await this.completeEmployeeDetailCommonQuestions(employeeDetails);
    return employeeDetails;
  }

  async completeEmployeeDetailCommonQuestions(
    employeeDetails: EmployeeDetails
  ) {
    await this.handleButtonQuestions(
      questionMap.contractorsNotInPayRoll,
      employeeDetails.contractorsNotInPayRoll
    );
    if (employeeDetails.contractorsNotInPayRoll === "Yes") {
      await this.handleInputQuestions(
        questionMap.contractorPayrollSpending,
        employeeDetails.contractorPayrollSpending.toString()
      );
    }

    await this.contractorNewProductQuestion.isVisible();
    await this.handleButtonQuestions(
      questionMap.developingNewProduct,
      employeeDetails.developingNewProduct
    );
    if (employeeDetails.developingNewProduct === "Yes") {
      await this.handleRadioButtonQuestions(
        questionMap.technicalPercentage,
        employeeDetails.technicalPercentage
      );
    }

    for (let i = 0; i < employeeDetails.mostRAndDStates.length; i++) {
      await this.stateWithRandDEmployee.click();
      await this.page.click(
        `li:has-text("${employeeDetails.mostRAndDStates[i]}")`
      );
    }

    await this.handleInputQuestions(
      questionMap.employeeCountJan,
      employeeDetails.employeeCountJan.toString()
    );
    await this.proceedToContinue();
  }
}
