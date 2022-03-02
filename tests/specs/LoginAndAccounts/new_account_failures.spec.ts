import { test, expect, BrowserContext, Page } from "@playwright/test";
import { User } from "../../helpers/TestObjects";
import { getTimestamp } from "../../helpers/Utils";
import { AccountsPage } from "../../pages/AccountsPage";

test.describe.parallel("check account creation errors", () => {
  let accountPage: AccountsPage;

  test.beforeEach(async ({ page }, testInfo) => {
    // console.log(`Running: ${testInfo.title}`);
    accountPage = new AccountsPage(page);
  });

  test("create account with errors and make sure errors appear correctly label:SMOKE", async ({
    page,
  }) => {
    const expectedErrors = [
      "Please include your first name",
      "Please include your last name",
      "Please include your work email",
      "Please enter a password",
      "Please confirm your password",
    ];
    await accountPage.goto();
    await accountPage.proceedToCreateAccount();
    await accountPage.checkForErrors(expectedErrors);
  });

  test("create account with incorrect paassword and bad email address", async ({
    page,
  }) => {
    const expectedErrors = [
      "Please enter a valid email",
      "Passwords must match",
    ];
    const badUser: User = {
      firstName: "bad",
      lastName: "badLast",
      email: "badEmail",
      password: "notMaching",
      confirmPassword: "matching",
      timestamp: getTimestamp(),
    };
    await accountPage.goto();
    await accountPage.fillNewAccountForm(badUser);
    await accountPage.proceedToCreateAccount();
    await accountPage.checkForErrors(expectedErrors);
  });
});
