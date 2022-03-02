import { expect, Frame, FrameLocator, Locator, Page } from "@playwright/test";
import { StripeCardInfo, User } from "../helpers/TestObjects";
import { scrollElementIntoView } from "../helpers/Utils";
import { CommonOperations } from "./CommonOperations";

export class BillingPage {
  readonly page: Page;
  readonly commonOperations: CommonOperations;
  readonly stripeCardInput: Locator;
  readonly stripeSecCode: Locator;
  readonly stripeExpiration: Locator;
  readonly stripeZipCode: Locator;
  readonly saveCardButton: Locator;
  readonly acceptButton: Locator;
  readonly acceptButtonSelector: string;
  readonly stripeFrameSelector: string;
  readonly stripeFrame: FrameLocator;
  readonly allSetDialog: Locator;
  readonly backToOrder: Locator;
  readonly useDifferentCard: Locator;
  readonly paymentMethod: Locator;
  readonly backToDashBoard: Locator;
  readonly stripeCard: StripeCardInfo = {
    cardNumber: "5555555555554444",
    expDate: "11/23",
    secCode: "123",
    zipCode: "73074",
  };

  readonly expiredStripeCard: StripeCardInfo = {
    cardNumber: "4000000000000069",
    expDate: "11/23",
    secCode: "123",
    zipCode: "73074",
  };

  readonly declinedStripeCard: StripeCardInfo = {
    cardNumber: "4000000000000002",
    expDate: "11/23",
    secCode: "123",
    zipCode: "73074",
  };

  constructor(page: Page) {
    this.page = page;
    this.commonOperations = new CommonOperations(page);
    this.stripeFrameSelector = 'iframe[name*="privateStripeFrame"]';
    this.stripeFrame = this.page.frameLocator(this.stripeFrameSelector);
    this.stripeCardInput = this.stripeFrame.locator('input[name="cardnumber"]');
    this.stripeExpiration = this.stripeFrame.locator('input[name="exp-date"]');
    this.stripeSecCode = this.stripeFrame.locator('input[name="cvc"]');
    this.stripeZipCode = this.stripeFrame.locator('input[name="postal"]');
    this.saveCardButton = this.page.locator('span:text("Save card")');
    this.acceptButtonSelector = 'button[aria-label="Accept"]';
    this.acceptButton = this.page.locator(this.acceptButtonSelector);
    this.allSetDialog = this.page.locator("div.MuiDialogTitle-root");
    this.backToOrder = this.page.locator('button:has-text("Back to orders")');
    this.useDifferentCard = this.page.locator(
      'button:text("use a different card")'
    );
    this.paymentMethod = this.page.locator('p:text("Payment method")');
    this.backToDashBoard = this.page.locator(
      'button:has-text("Back to dashboard")'
    );
  }

  async goto() {
    await this.page.goto("/billing");
  }

  async fillStripeCardInfo(cardInfo?: StripeCardInfo) {
    cardInfo = cardInfo === undefined ? this.stripeCard : cardInfo;
    await this.page.waitForTimeout(2000);
    await scrollElementIntoView(
      this.page,
      'iframe[name*="privateStripeFrame"]'
    );
    await this.stripeCardInput.click();
    await this.stripeCardInput.type(cardInfo.cardNumber, { delay: 100 });
    await this.stripeExpiration.type(cardInfo.expDate, { delay: 100 });
    await this.stripeSecCode.type(cardInfo.secCode, { delay: 100 });
    await this.stripeZipCode.type(cardInfo.zipCode, { delay: 100 });
    await this.saveCardButton.click({ delay: 1000 });
  }

  async accecptOrder() {
    await this.paymentMethod.waitFor({ timeout: 10000 });
    await this.acceptButton.waitFor({ state: "visible" });
    await this.page.waitForTimeout(5000);
    if (
      !(await this.acceptButton.isEnabled()) &&
      (await this.stripeCardInput.isVisible())
    ) {
      await this.page.waitForSelector(this.stripeFrameSelector);
      await this.fillStripeCardInfo();
      // await this.useDifferentCard.waitFor({timeout: 10000})
      await this.acceptButton.isEnabled();
    }
    await this.useDifferentCard.waitFor({ timeout: 10000 });
    await scrollElementIntoView(this.page, this.acceptButtonSelector);
    await this.acceptButton.click({ delay: 1000 });
  }

  async handleAllSetPrompt(lastOrder: boolean = false) {
    await this.allSetDialog.waitFor();
    if (lastOrder) {
      await this.backToDashBoard.click({ delay: 1000 });
    } else {
      await this.backToOrder.click({ delay: 1000 });
    }
  }

  async reviewAndAccept(title: string) {
    await this.page.waitForSelector(
      `div[class*="Card__content"]:has-text("${title}") a[class*="Button"]`
    );
    await this.page
      .locator(
        `div[class*="Card__content"]:has-text("${title}") a[class*="Button"]`
      )
      .click();
    await this.page
      .locator(`p:has-text("Order form for the ${title}")`)
      .waitFor();
    await this.commonOperations.waitForLoadingMaskToDisappear();
    await this.accecptOrder();
  }
}
