import { test, expect, BrowserContext, Page } from "@playwright/test";
import { LoginPage } from "../../pages/LoginPage";
import { ConnectPayrollPage } from "../../pages/ConnectPayrollPage";

test.describe.serial(
  "check toc and privacy policy pages are accessible",
  () => {
    /**
     * using serial setting so all test can be executed with same page objects
     * ideally we want to use a static user what is in this connect payroll state
     */
    let page: Page;
    let context: BrowserContext;
    let connectPayRollPage: ConnectPayrollPage;
    let loginPage: LoginPage;
    const timestamp = Math.floor(Date.now() / 1000);

    test.beforeAll(async ({ browser }, testInfo) => {
      context = await browser.newContext();
      page = await context.newPage();
      loginPage = new LoginPage(page);
      connectPayRollPage = new ConnectPayrollPage(context, page);
      await loginPage.goto();
      await loginPage.logIn(
        "julie.zhu+auto1640192496@mainstreet.com",
        "Temp12345"
      );
    });

    test("validate terms and conditions link", async () => {
      await connectPayRollPage.checkTOC();
    });

    test("validate privacy link", async () => {
      await connectPayRollPage.checkPolicy(context);
    });
  }
);
