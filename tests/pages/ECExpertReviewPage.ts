import { BrowserContext, Locator, Page } from "@playwright/test";
import { CommonOperations } from "./CommonOperations";

export class ECExpertReviewPage extends CommonOperations {
  readonly page: Page;
  readonly pageTitle: string;
  readonly context: BrowserContext;
  readonly backToDashBoardButton: Locator;
  readonly claimYourUmbrellaButton: Locator;
  readonly submittedConfirmation: Locator;

  constructor(context: BrowserContext, page: Page) {
    super(page);
    this.page = page;
    this.pageTitle = "Expert Review";
    this.context = context;
    this.backToDashBoardButton = this.page.locator(
      'button[aria-label="Back to dashboard"]'
    );
    this.claimYourUmbrellaButton = this.page.locator(
      'a:text("Claim your free umbrella!")'
    );
    this.submittedConfirmation = this.page.locator(
      'h2:text("Thanks for submitting your info!")'
    );
  }

  async isCurrentlyActive(): Promise<boolean> {
    const step = await this.activeStep();
    return step === this.pageTitle;
  }

  async returnToDashBoard() {
    await this.backToDashBoardButton.click();
  }

  async claimUmbrella() {
    const newPage = await this.openTarget_blankLink(
      this.context,
      this.claimYourUmbrellaButton
    );
    // validate we do see expected form on new page and we do see expected heading text
    await newPage.locator("#new_order_recipient").waitFor();
    await newPage
      .locator('#signup_form  h2:text("It\'s raining money.")')
      .waitFor();
    await newPage.close();
  }

  async validateSubmittedText() {
    await this.submittedConfirmation.waitFor();
  }
}
