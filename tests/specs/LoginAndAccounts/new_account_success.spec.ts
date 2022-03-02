import { test, expect, BrowserContext } from "@playwright/test";
import { AccountsPage } from "../../pages/AccountsPage";
import { getHrefLinkValue } from "../../helpers/GmailActions";
import { User } from "../../helpers/TestObjects";

test.describe("check account creation success label:SMOKE", () => {
  let accountPage: AccountsPage;
  let newUser: User;

  test.beforeEach(async ({ page }, testInfo) => {
    // console.log(`Running: ${testInfo.title}`);
    accountPage = new AccountsPage(page);
  });

  test("create a new user account and make sure we are redirected to correct page after success", async ({
    page,
  }) => {
    await accountPage.goto();
    newUser = await accountPage.createDefaultNewAccount("userCreation");
    console.log(`created user: ${newUser.email}`);
  });

  test("Attempt to create the same account from previous test and check for account exists error", async ({
    page,
  }) => {
    await accountPage.goto();
    await accountPage.fillNewAccountForm(newUser);
    await accountPage.proceedToCreateAccount();
    await accountPage.checkForErrors([
      "A company with that email already has signed up.",
    ]);
  });

  test("validate we get verify email and can complete verification process", async ({
    page,
  }) => {
    const q: string = `subject: Welcome to MainStreet! Please verify your email, to: ${newUser.email}`;
    const verifyLink: string = await getHrefLinkValue(
      "qamainstreet@gmail.com",
      q,
      'a[href*="email-verification"]'
    );
    await page.goto(verifyLink);
    await page.locator(
      'div:has-text("Thank you for verifying your email address. "'
    );
    await page.click('a:has-text("Back to Dashboard")');
    await page.locator("#username").waitFor();
  });
});
