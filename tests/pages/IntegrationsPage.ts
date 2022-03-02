import { Locator, Page } from "@playwright/test";
import { CommonOperations } from "./CommonOperations";

export class IntegrationsPage extends CommonOperations {
  readonly page: Page;
  readonly plaidConectButton: Locator;
  readonly codacConnectButon: Locator;

  constructor(page: Page) {
    super(page);
    this.page = page;
    this.plaidConectButton = this.page.locator(
      'button[aria-label="Connect"]:below(p:text-is("Connect your bank account"))'
    );
    this.codacConnectButon = this.page.locator(
      'button[aria-label="Connect"]:below(p:text-is("Connect your accounting software"))'
    );
  }

  async connectToPlaid(
    accountName:
      | "plaid_accredited"
      | "plaid_unqualified"
      | "plaid_nonDepository"
      | "plaid_sandbox"
      | "plaid_investmentdepository"
  ) {
    await this.plaidConectButton.waitFor();
    await this.page.waitForTimeout(1000);
    await this.plaidConectButton.click();
    await this.page.waitForTimeout(1000);
    if (
      !(
        await this.page.waitForSelector('iframe[id^="plaid-link-iframe"]')
      ).isVisible()
    ) {
      await this.plaidConectButton.click();
    }
    await this.page.waitForSelector('iframe[id^="plaid-link-iframe"]');
    await this.completePlaidLogin(accountName);
    await this.page.waitForSelector(
      'div:has-text("Successfully connected to")'
    );
  }
}
