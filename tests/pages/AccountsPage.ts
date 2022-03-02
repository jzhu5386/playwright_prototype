import { expect, Locator, Page } from "@playwright/test";
import { User } from "../helpers/TestObjects";
import { generateRandomHumanNames } from "../helpers/Utils";

export class AccountsPage {
  readonly page: Page;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly createAccountButton: Locator;
  readonly userCreateErrors: Locator;
  readonly multiError: string;
  readonly multiProgress: Locator;

  constructor(page: Page) {
    this.page = page;
    this.firstNameInput = page.locator(
      'div[data-testid="welcome_first_name"] input'
    );
    this.lastNameInput = page.locator(
      'div[data-testid="welcome_last_name"] input'
    );
    this.emailInput = page.locator('div[data-testid="welcome_email"] input');
    this.passwordInput = page.locator(
      'div[data-testid="welcome_password"] input'
    );
    this.confirmPasswordInput = page.locator(
      'div[data-testid="welcome_confirm_password"] input'
    );
    this.createAccountButton = page.locator("span:has-text('Create account')"); //'button[data-testid="welcome_submit"]
    this.multiError = 'p[class*="Mui-error"]';
    this.userCreateErrors = page.locator('p[class*="Mui-error"]');
    this.multiProgress = page.locator("div.MuiCircularProgress-root");
  }

  async goto() {
    await this.page.goto("/welcome");
  }

  async fillNewAccountForm(user: User) {
    await this.firstNameInput.type(user.firstName);
    await this.lastNameInput.type(user.lastName);
    await this.emailInput.type(user.email);
    await this.passwordInput.type(user.password);
    let confirm =
      user.confirmPassword === undefined ? user.password : user.confirmPassword;
    await this.confirmPasswordInput.type(confirm);
  }

  async proceedToCreateAccount() {
    await this.createAccountButton.click();
    // There is a loading mask if the account creation is successful, need to wait for that to disappear
    await this.multiProgress.waitFor({ state: "hidden" });
    // TODO assert we are navigated to the question page
  }

  async checkForErrors(expectedErrors: Array<string>) {
    // await this.page.waitForNavigation() // Waits for the next navigation
    await this.userCreateErrors
      .first()
      .waitFor({ state: "visible", timeout: 5000 });
    const foundErrors = await this.userCreateErrors.allTextContents();
    expect(foundErrors).toEqual(expectedErrors);
  }

  async createNewAccount(user: User, url?: string) {
    if (url === undefined) {
      await this.goto();
    } else {
      await this.page.goto(url);
    }

    await this.fillNewAccountForm(user);
    await this.proceedToCreateAccount();
  }

  /**
   * Create a new account, email is tied to qaminstreet@gmail.com, one can add more info such as prefix and
   * timestamp to generate a unique email account.
   * @param timestamp
   * @param prefix
   * @returns
   */
  async createDefaultNewAccount(
    prefix?: string,
    timestamp?: number
  ): Promise<User> {
    const defaultUser = this.buildDefaultUserInfo({
      prefix: prefix,
      timestamp: timestamp,
    });
    await this.createNewAccount(defaultUser);
    return defaultUser;
  }

  buildDefaultUserInfo(options?: {
    prefix?: string;
    timestamp?: number;
  }): User {
    const timestamp =
      options !== undefined && options!.timestamp !== undefined
        ? options!.timestamp
        : Math.floor(Date.now() / 1000);
    const prefix =
      options !== undefined && options!.prefix !== undefined
        ? options.prefix
        : "";
    const defaultUser: User = {
      firstName: generateRandomHumanNames(),
      lastName: generateRandomHumanNames(),
      email: `qamainstreet+${prefix}${timestamp}@gmail.com`,
      password: "Temp12345",
      confirmPassword: "Temp12345",
      timestamp: timestamp,
    };
    return defaultUser;
  }
}
