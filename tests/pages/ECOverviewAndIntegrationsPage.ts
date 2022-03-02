import { expect, Locator, Page, BrowserContext } from "@playwright/test";
import { CommonOperations } from "./CommonOperations";

export class ECOverviewAndIntegrationsPage extends CommonOperations {
  readonly page: Page;
  readonly pageTitle: string;
  readonly context: BrowserContext;
  readonly payrollNotInList: Locator;
  readonly connectAnotherPayroll: Locator;
  readonly continueButtonInContainerSelector: string;
  readonly continueButtonInContainer: Locator;
  readonly calloutContainer: Locator;
  readonly requiredBadge: Locator;
  readonly stepsInTaxProcessingExperienceLink: Locator;
  readonly sideDrawerHeader: Locator;
  readonly sideDrawerSteps: Locator;
  readonly sideDrawerCloseButton: Locator;
  readonly inviteLink: Locator;
  readonly inviteToEditLink: Locator;

  constructor(context: BrowserContext, page: Page) {
    super(page);
    this.page = page;
    this.pageTitle = "Overview & Integrations";
    this.context = context;
    this.payrollNotInList = this.page.locator(
      'span:text("I do not use any payroll system listed above")'
    );
    this.connectAnotherPayroll = this.page.locator(
      'a:text("+ Connect another payroll provider")'
    );
    this.continueButtonInContainerSelector =
      'div[class*="Expandable__content"] button[aria-label="Continue"]';
    this.continueButtonInContainer = this.page.locator(
      this.continueButtonInContainerSelector
    );
    this.calloutContainer = this.page.locator(
      'div[class^="Callout__content"] div[class^="Card__content"] p'
    );
    this.requiredBadge = this.page.locator(
      'div[class*="Card__content"] div:text-is("Required")'
    );
    this.stepsInTaxProcessingExperienceLink = this.page.locator(
      'a span:text("See where this step fits in your Tax Processing experience with MainStreet")'
    );
    this.sideDrawerHeader = this.page.locator(
      'div[class^="SideDrawer__header"]:has-text("Your R&D Tax Credits journey")'
    );
    this.sideDrawerSteps = this.page.locator(
      'div[class^="SideDrawer"] div[class^="Stepper__step"] p[class*="Text__medium"]'
    );
    this.sideDrawerCloseButton = this.page.locator(
      'button[data-testid*="side-drawer-close-button"]'
    );
    this.inviteLink = this.page.locator(
      'a:has-text("invite them to edit this form")'
    );
    this.inviteToEditLink = this.page.locator('a:text("Invite to edit")');
  }

  /**
   * when user doesn't have payroll connection, user can opt out of setting it up by checking
   * on the payroll not listed option
   */
  async selectPayRollNotListedOption() {
    await this.payrollNotInList.click();
  }

  /**
   * click on add New Payroll
   */
  async addNewPayRollConnection(payRollName: string) {
    await this.connectAnotherPayroll.click();
    await this.makePayRollSelection({ payRollName: payRollName });
  }

  /***
   * make sure we see connect another payroll option when we already have a connection or
   * payroll not in list option if user have not connection yet
   */
  async validateConnectedState(connected: boolean, payrollConnection?: string) {
    if (await this.isCurrentlyActive()) {
      if (connected) {
        await this.connectAnotherPayroll.waitFor();
        if (payrollConnection !== undefined) {
          if (payrollConnection === "Rippling") {
            await this.page
              .locator('div:text-is("Connected to Rippling")')
              .waitFor();
          } else {
            await this.page
              .locator('div:text-is("Connected to Finch")')
              .waitFor();
          }
        }
      } else {
        await this.payrollNotInList.waitFor();
        await this.requiredBadge.waitFor();
      }
    }
  }

  /**
   * validate that call out text appear on the splash screen
   */
  async validateCallOutsOnPage() {
    const expectedCallOutText = [
      "This process may take you between 20 and 30 minutes.",
      "You can save your progress, exit, and return at any moment.",
      "You will need to have some information handy:",
      "Previous tax forms (up to 5 years). Your business structure, ownership, payroll, and supplies you use for R&D.",
      "If you need help from your CPA or someone else at your company,  invite them to edit this form",
    ];
    await this.calloutContainer.last().waitFor();
    await this.page.waitForTimeout(1000);
    const callOutText = await this.calloutContainer.allInnerTexts();
    for (let i = 0; i < expectedCallOutText.length; i++) {
      expect(expectedCallOutText[i] === callOutText[i]);
    }
  }

  /**
   * validate that the where you are link will trigger a draw appear on the side showing user
   * which stage they are at in tax filing process
   */
  async validateStepInTaxProcessing() {
    const expectedSteps = [
      "Initial qualificationJanuary 2021",
      "Expense classification",
      "Mainstreet expert review",
      "We generate the forms for you",
      "Your CPA files your taxesYour filing day",
      "Redeem your credits",
    ];
    await this.stepsInTaxProcessingExperienceLink.click();
    await this.sideDrawerHeader.waitFor();
    const steps = await this.sideDrawerSteps.allTextContents();
    expect(expectedSteps).toEqual(steps);
    await this.sideDrawerCloseButton.click();
  }

  /**
   * detect current page is actually the active page, return true/false
   */
  async isCurrentlyActive(): Promise<boolean> {
    await this.page.waitForSelector('p:text("Expense Classification")');
    await this.activeSteps.waitFor();
    const step = await this.activeStep();
    return step === this.pageTitle;
  }

  /**
   * validate invitation link embedded in text
   */
  async validateInvitationLinks() {
    const inviteButton = "data-testid=footer-invite-button";
    const newPage = await this.openTarget_blankLink(
      this.context,
      this.inviteLink
    );
    await newPage.locator(inviteButton).waitFor();
    await newPage.close();

    const newPage_1 = await this.openTarget_blankLink(
      this.context,
      this.inviteToEditLink
    );
    await newPage_1.locator(inviteButton).waitFor();
    await newPage_1.close();
  }

  async navigateBackToCurrentPage() {
    while (!(await this.isCurrentlyActive())) {
      await this.backButton.click();
    }
  }
}
