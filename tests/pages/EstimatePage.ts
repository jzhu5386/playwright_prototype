import { expect, Locator, Page } from "@playwright/test";
import {
  CompanyDetails,
  EmployeeDetails,
  questionMap,
} from "../helpers/TestObjects";
import { CommonOperations } from "./CommonOperations";
import { CompanyDetailPage } from "./CompanyDetailPage";

export class EstimatePage extends CommonOperations {
  readonly page: Page;
  readonly estimateHeaderUser: Locator;
  readonly multiSummaryDollar: Locator;
  readonly multiSummaryText: Locator;
  readonly multiSummaryRoot: Locator;
  readonly expandedItemizedDollar: Locator;
  readonly expandedItemizedText: Locator;
  readonly expandedItemizedRoot: Locator;
  readonly getEstimateButton: Locator;
  readonly procurementEstimates: Locator;
  readonly noPaymentsInPayroll: Locator;
  readonly roughPayrollLastMonth: Locator;
  readonly muiCircularProgress: Locator;
  readonly findingYourMoneyText: Locator;
  readonly availableCreditItems: Locator;

  constructor(page: Page) {
    super(page);
    this.page = page;
    this.estimateHeaderUser = this.page.locator(
      "div[data-testid=available-credit-estimate] h2"
    );
    this.multiSummaryRoot = this.page.locator(
      "div.MuiAccordionSummary-content"
    );
    this.multiSummaryDollar = this.page.locator(
      'div.MuiAccordionSummary-content span[class^="Dollar"]'
    );
    this.multiSummaryText = this.page.locator(
      'div.MuiAccordionSummary-content p[class^="Text"]'
    );
    this.expandedItemizedRoot = this.page.locator(
      "div.MuiAccordionDetails-root"
    );
    this.expandedItemizedDollar = this.page.locator(
      'div.MuiAccordionDetails-root span[class^="Dollar"]'
    );
    this.expandedItemizedText = this.page.locator(
      'div.MuiAccordionDetails-root p[class^="Text"]'
    );
    this.muiCircularProgress = this.page.locator(
      "div.MuiCircularProgress-root"
    );
    this.findingYourMoneyText = this.page.locator(
      'div.MuiTypography-root:has-text("Finding all of your money")'
    );
    this.getEstimateButton = this.page.locator(
      'button:has-text("Get estimation")'
    );
    this.procurementEstimates = this.page.locator(
      'p:has-text("Save up to 20% on your largest expenses")'
    );
    this.noPaymentsInPayroll = this.page.locator(
      'div[class*="Card__content"] p:has-text("We couldn\'t find any payments in your payroll system.")'
    );
    this.roughPayrollLastMonth = this.page.locator(
      'span[class*="TextField__"] input'
    );
    this.availableCreditItems = this.page.locator(
      "div[data-testid=available-credit-estimate] > div p"
    );
  }

  async goto() {
    await this.page.goto("/credit-estimate", { waitUntil: "domcontentloaded" });
  }

  async handleNoPayrollFoundQuestions(employeeDetail: EmployeeDetails) {
    // await this.findingYourMoneyText.waitFor()
    await this.findingYourMoneyText.waitFor({
      timeout: 15000,
      state: "hidden",
    });
    // depending on if there is payroll gaps (2Months) in the system, we
    // might or might not see this extra page for additional info. so neeced to
    // wrap in try catch statement for now until we can arrive at this in a
    // more deterministic way.
    try {
      await this.noPaymentsInPayroll.waitFor({ timeout: 5000 });
      await this.handleRadioButtonQuestions(
        questionMap.noPaymentFoundInPayroll,
        "You don't have the right permissions in your payroll software"
      );
      await this.handleInputQuestions(
        questionMap.salaryLastMonth,
        employeeDetail.salaryLastMonth.toString()
      );
      await this.getEstimateButton.click();
    } catch {
      console.log("We are probably already on estimate page");
    }
  }

  async validateCreditEstimateContent(
    buzName: string,
    expectedTotal: string[],
    expectedItemizedEstimate: string[]
  ) {
    await this.waitForEstimatePageLoadingComplete();

    //checking headers
    const userInHeading = await this.estimateHeaderUser.textContent();
    console.log(`found company name header: ${userInHeading}`);

    let summary: string[] = [""];
    // check for multiSummary title and make sure numbers and count wording is correct
    if (await this.multiSummaryText.last().isVisible()) {
      // not all state tax items are loaded at one time, so we did a retry logic here
      let retry = 3;
      summary = await this.multiSummaryText.allTextContents();
      while (retry > 0 && summary != expectedTotal) {
        await this.page.waitForTimeout(2000);
        retry--;
      }
      // expand into itemized credit estimates and make sure all wordings and numbers are correct
      await this.multiSummaryRoot.click();
      await this.expandedItemizedRoot.isVisible();
      const itemizedText = await this.expandedItemizedText.allTextContents();
      console.log(`found itemized estimates: ${itemizedText}`);
      expect(itemizedText.sort()).toEqual(expectedItemizedEstimate.sort());
    } else if (await this.availableCreditItems.last().isVisible()) {
      summary = await this.availableCreditItems.allTextContents();
    }

    console.log(`found total estimates: ${summary}`);
    expect(userInHeading).toEqual(expect.stringContaining(buzName));
    expect(summary).toEqual(expectedTotal);

    // make sure we do see a segment about procurement as well
    await this.procurementEstimates.isVisible();
  }

  async waitForEstimatePageLoadingComplete() {
    // we have async loading here, so we'd have to wait for 10-15 s before we actually get data fully populated
    try {
      await this.findingYourMoneyText.waitFor({ timeout: 5000 });
      await this.findingYourMoneyText.waitFor({
        timeout: 5000,
        state: "hidden",
      });
    } catch {
      console.log("we are already on estimate page");
    }

    await this.estimateHeaderUser.waitFor({ timeout: 10000, state: "visible" });
  }
}
