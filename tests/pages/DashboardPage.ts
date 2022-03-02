import { expect, Locator, Page } from "@playwright/test";
import { scrollElementIntoView } from "../helpers/Utils";
import { CommonOperations } from "./CommonOperations";

export class DashboardPage extends CommonOperations {
  readonly page: Page;
  readonly startRAndDQualification: Locator;
  readonly startProcurementSaving: Locator;
  readonly qualifyLink: Locator;
  readonly connectToPayRoll: Locator;
  readonly connectToAccounting: Locator;
  readonly govCreditNames: Locator;
  readonly classifyExpensesSelector: string;
  readonly disqualifiedRDCreditText: Locator;

  constructor(page: Page) {
    super(page);
    this.page = page;
    this.startRAndDQualification = this.page.locator(
      'a[href*="qualifying"]:right-of(:text("Finish your Federal R&D Tax Credit qualification"))'
    );
    this.startProcurementSaving = this.page.locator('a[href*="procurement"]');
    this.qualifyLink = this.page.locator('a:has-text("Qualify")');
    this.connectToPayRoll = this.page.locator(
      'a:right-of(:text("Connect your payroll system"), 200)'
    );
    this.connectToAccounting = this.page.locator(
      'a:right-of(:text("Connect your accounting system"), 200)'
    );
    this.govCreditNames = this.page.locator("p.program-name");
    this.classifyExpensesSelector = 'a:text("Classify expenses")';
    this.disqualifiedRDCreditText = this.page.locator(
      "p:text-is(\"There are no active credits at this moment. Don't worry, we're always searching for new savings alternatives for you behind the scenes.\")"
    );
  }

  async goto() {
    this.page.goto("/");
  }

  async navigateToTab(tabName: string) {
    expect(
      [
        "Dashboard",
        "Documents",
        "Integrations",
        "Refer & Earn",
        "Settings",
        "Billing",
        "Treasury Management",
      ].includes(tabName)
    );
    await this.page.waitForSelector(`a:has-text("${tabName}")`);
    await this.page.waitForTimeout(1000);
    await this.page.click(`a:has-text("${tabName}")`);
  }

  async navigateToQualifyViaStartSaving() {
    await this.startRAndDQualification.click();
  }

  async navigateToQualifyViaQualifyLink() {
    await this.qualifyLink.click();
  }

  async navigateToProcurement() {
    await this.startProcurementSaving.click();
  }

  async navigateToConnectToPayRoll() {
    await this.connectToPayRoll.click();
  }

  async navigateToConnectToAccounting() {
    await this.connectToAccounting.click();
  }

  async validateGovPrograms(expectedPrograms: string[]) {
    const programs = await this.govCreditNames.allTextContents();
    expect(programs).toEqual(expectedPrograms);
  }

  async proceedToCreditClassification() {
    await this.page.locator(this.classifyExpensesSelector).waitFor();
    await scrollElementIntoView(this.page, this.classifyExpensesSelector);
    await this.page.click(this.classifyExpensesSelector);
    // await this.waitForLoadingMaskToDisappear();
    await this.page.waitForTimeout(1000);
  }

  async validateECLink() {
    await this.page.locator(this.classifyExpensesSelector).waitFor();
  }

  async validateDisqualifiedState() {
    await this.qualifyLink.isHidden();
    await this.startRAndDQualification.isHidden();
    await this.disqualifiedRDCreditText.waitFor();
  }
}
