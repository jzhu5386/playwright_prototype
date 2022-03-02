import { Locator, Page } from "@playwright/test";

export class SettingsPage {
  readonly page: Page;
  readonly inviteButton: Locator;
  readonly changePwdButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.changePwdButton = this.page.locator(
      "data-testid=change-password-button"
    );
    this.inviteButton = this.page.locator("data-testid=footer-invite-button");
  }

  async goto() {
    await this.page.goto("/settings");
  }
}
