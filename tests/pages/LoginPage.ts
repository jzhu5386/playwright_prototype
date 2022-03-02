import { expect, Locator, Page } from "@playwright/test";
import { getTokenViaServiceAccount } from "../helpers/TokenHelpers";

export class LoginPage {
  readonly page: Page;
  readonly email: Locator;
  readonly localEmail: Locator;
  readonly passWord: Locator;
  readonly localPassword: Locator;
  readonly loginButton: Locator;
  readonly localLoginButton: Locator;
  readonly profileMenuTrigger: Locator;
  readonly logoutButton: Locator;
  readonly mainstreetLogo: Locator;

  constructor(page: Page) {
    this.page = page;
    this.email = page.locator("#username");
    this.localEmail = page.locator('input.MuiInputBase-input[type="text"]');
    this.passWord = page.locator("#password");
    this.localPassword = page.locator(
      'input.MuiInputBase-input[type="password"]'
    );
    this.loginButton = page.locator('button[name="action"]');
    this.localLoginButton = page.locator('span:text-is("Sign in")');
    this.profileMenuTrigger = page.locator("button svg");
    this.logoutButton = page.locator('text="Logout"');
    this.mainstreetLogo = page.locator('img[alt="MainStreet"]');
  }

  async goto() {
    await this.page.goto("/");
  }

  async logIn(email: string, passWord: string, loginURL?: string) {
    if (loginURL === undefined) {
      await this.goto();
    } else {
      await this.page.goto(loginURL);
    }

    try {
      await this.email.waitFor({ timeout: 5000 });
    } catch {}
    if (await this.email.isVisible()) {
      await this.email.type(email);
      await this.passWord.type(passWord);
      await this.loginButton.click();
    } else {
      await this.localEmail.type(email);
      await this.localPassword.type(passWord);
      await this.localLoginButton.click();
    }

    // await this.page.waitForNavigation({ waitUntil: 'networkidle' });
    // const url = await this.page.url();
    // console.log(url)
    // try {
    //     await this.mainstreetLogo.waitFor({state: "visible", timeout: 5000})
    // } catch (error) {
    //     await this.profileMenuTrigger.waitFor({state: 'visible'})
    // }
  }

  async logOut() {
    await this.profileMenuTrigger.click();
    await this.logoutButton.click();
  }
}
