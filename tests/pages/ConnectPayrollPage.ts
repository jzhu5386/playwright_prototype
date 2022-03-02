import {
  expect,
  FrameLocator,
  Locator,
  Page,
  BrowserContext,
} from "@playwright/test";
import { CommonOperations } from "./CommonOperations";

export class ConnectPayrollPage extends CommonOperations {
  readonly page: Page;
  readonly context?: BrowserContext;
  readonly doThisLaterButton: Locator;
  readonly tosLink: Locator;
  readonly connectRollProgress: string;
  readonly tocTitle: Locator;
  readonly policyLink: Locator;
  readonly policyPageTitle: Locator;
  readonly multiProgress: Locator;
  readonly commonOperation: CommonOperations;

  constructor(context: BrowserContext, page: Page) {
    super(page);
    this.page = page;
    this.context = context;
    this.commonOperation = new CommonOperations(page);
    this.doThisLaterButton = page.locator(
      'div[style*="height: auto"] button[aria-label="Do this later"]'
    );
    this.tosLink = page.locator("data-testid=tos-box");
    this.connectRollProgress =
      'span.MuiStepLabel-label:has-text("Connect payroll")';
    this.tocTitle = page.locator(
      'text="MainStreet Guarantee Terms and Conditions"'
    );
    this.policyLink = page.locator('a[href="privacy"]');
    this.multiProgress = page.locator("div.MuiCircularProgress-root");
    this.policyPageTitle = page.locator('text="MainStreet Privacy Policy"');
  }

  async goto() {
    await this.page.goto("/signup-payroll");
  }

  async isComplete() {
    const status = await this.page.getAttribute(
      this.connectRollProgress,
      "class"
    );
    return status?.includes("MuiStepLabel-completed");
  }

  async continueToNextStep() {
    await this.connectButton.click();
    await this.page.waitForNavigation({ waitUntil: "domcontentloaded" });
  }

  async skipPayRollConnection() {
    await this.makePayRollSelection({ skipConnection: true });
    await this.doThisLaterButton.click();
  }

  async checkTOC() {
    await this.tosLink.click();
    await this.tocTitle.isVisible();
    await this.page.goBack();
    await this.tosLink.waitFor();
  }

  async checkPolicy(context: BrowserContext) {
    if (context != undefined) {
      await this.policyLink.isVisible();
      const newPage = await this.openTarget_blankLink(context, this.policyLink);
      await newPage.locator('text="MainStreet Privacy Policy"').isVisible();
    } else {
      console.warn("This check can be only used when context is provided!");
    }
  }
}
