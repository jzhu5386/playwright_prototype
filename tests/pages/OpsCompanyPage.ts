import { expect, Locator, Page } from "@playwright/test";
import { CompanyTokenInfo, User } from "../helpers/TestObjects";
import { generateRandomNumber } from "../helpers/Utils";
import { CommonOperations } from "./CommonOperations";

export class OpsCompanyPage extends CommonOperations {
  readonly opsPage: Page;
  tokenInfo?: CompanyTokenInfo;
  readonly company: Locator;
  readonly includeTestAccountToggle: Locator;
  readonly searchButton: Locator;
  readonly searchInput: Locator;
  readonly companyCell: Locator;
  readonly viewTreasuryManagementLink: Locator;
  readonly confirmPromptButton: Locator;
  readonly createPromissoryNoteButton: Locator;
  readonly promissoryNoteAmmountInput: Locator;
  readonly promissoryNoteConfigInput: Locator;
  readonly backToCompanyPage: Locator;
  readonly viewKYCApplicationLink: Locator;
  readonly kycApplicationTableHeader: Locator;

  constructor(opsPage: Page) {
    super(opsPage);
    this.opsPage = opsPage;
    this.company = this.opsPage.locator('a>div:text-is("View Companies")');
    this.includeTestAccountToggle = this.opsPage.locator("span.MuiSwitch-root");
    this.searchButton = this.opsPage.locator(
      'button[data-testid="Search-iconButton"]'
    );
    this.searchInput = this.opsPage.locator('div[data-test-id="Search"] input');
    this.companyCell = this.opsPage.locator(
      'td[data-testid="MuiDataTableBodyCell-1-0"] a'
    );
    this.viewTreasuryManagementLink = this.opsPage.locator(
      'a:text-is("View Treasury Management Details")'
    );
    this.confirmPromptButton = this.opsPage.locator(
      'button[aria-label="Confirm"]'
    );
    this.createPromissoryNoteButton = this.opsPage.locator(
      'button[aria-label="Add New Promissory Note"]'
    );
    this.promissoryNoteAmmountInput = this.opsPage.locator(
      'input[aria-label="Principal Amount"]'
    );
    this.promissoryNoteConfigInput = this.opsPage.locator(
      'input[aria-label="Promissory Note Config"]'
    );
    this.backToCompanyPage = this.page.locator(
      'div:text-is(" Back to Company Page")'
    );
    this.viewKYCApplicationLink = this.page.locator(
      'a:has-text("View KYC Applications")'
    );
    this.kycApplicationTableHeader = this.page.locator(
      'div[class*="MuiTypography-h2"]:text-is("KYC Applications Table")'
    );
  }

  async navigateToCompanyDetailPage(searchKey: string) {
    await this.company.waitFor();
    await this.company.click();
    await this.includeTestAccountToggle.waitFor();
    await this.includeTestAccountToggle.click();
    await this.searchButton.waitFor();
    await this.searchButton.click();
    await this.searchInput.waitFor();
    await this.searchInput.fill(searchKey);
    await this.opsPage.waitForTimeout(2000);
    expect(await this.companyCell.count()).toEqual(1);
    await this.companyCell.first().click();
  }

  async enableTreasuryManagment(companyName: string) {
    await this.opsPage.click('button[aria-label="Enable Treasury Management"]');
    await this.confirmPromptButton.click();
  }

  /**
   * this assumes we are already on TM page with promissory creation note option visible
   * @param options
   */
  async createPromissoryNote(options?: {
    amount?: number;
    config?: string;
  }): Promise<number> {
    let amount: number;
    let config: string;
    amount =
      options?.amount === undefined
        ? generateRandomNumber(1, 20) * 1000000
        : options.amount;
    config =
      options?.config === undefined
        ? "MainStreet Yield LLC, Promissory Note 1"
        : options.config;
    await this.page.waitForTimeout(2000);
    await this.viewTreasuryManagementLink.click();
    await this.createPromissoryNoteButton.click();
    await this.promissoryNoteAmmountInput.fill(amount.toString());
    await this.promissoryNoteConfigInput.click();
    await this.opsPage.click(`span:has-text("${config}")`);
    await this.submitButton.click();
    console.log("Promissory Note Value: " + amount);
    return amount;
  }

  /**
   * This assumes you are already in the company detail page, most likely in promissory
   * notes page of the company and neeeds to go back to company detail view > kyc view link
   * then filter with company id and refresh status. OR if you can provide a companyID,
   * we take a short cut and navigate to /companies/{companyID}/kyc directly
   * @param companyId
   */
  async updateKYCStatusforCompany(
    status: "approved" | "rejected" | "in_review" = "approved",
    companyId?: string
  ) {
    if (!(await this.kycApplicationTableHeader.isVisible())) {
      await this.backToCompanyPage.click();
      await this.viewKYCApplicationLink.click();
    }
    await this.page.locator(`tr > td:nth-child(2):text-is("${companyId}")`)
      .waitFor;
    await this.page.waitForTimeout(2000);
    await this.page.click("tr > td:nth-child(10) > svg");
    let found_status = await this.page
      .locator("tr > td:nth-child(3)")
      .textContent();
    let retry = 3;
    while (found_status !== status && retry > 0) {
      await this.page.waitForTimeout(2000);
      found_status = await this.page
        .locator("tr > td:nth-child(3)")
        .textContent();
      retry--;
    }
    expect(found_status).toEqual(status);
  }

  /**
   * wrapper method, given a user, and companyID, navigate to the KYC applicaation, create
   * promissory note and enable treasury management
   * @param newUser
   * @param companyId
   * @returns
   */
  async setUserUpForTM(newUser: User, companyId: string): Promise<number> {
    let promissoryAmount = 0;
    await this.page.waitForTimeout(1000);
    await this.navigateToCompanyDetailPage(newUser.email);
    await this.page.waitForTimeout(1000);
    promissoryAmount = await this.createPromissoryNote({
      amount: generateRandomNumber(1, 15) * 1000000 + Number(companyId),
    });
    await this.enableTreasuryManagment(newUser.email);
    return promissoryAmount;
  }
}
