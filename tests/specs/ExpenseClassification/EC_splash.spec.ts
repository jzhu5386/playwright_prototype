import { test, Page } from "@playwright/test";
import { LoginPage } from "../../pages/LoginPage";
import { AccountsPage } from "../../pages/AccountsPage";
import { DashboardPage } from "../../pages/DashboardPage";
import { ECOverviewAndIntegrationsPage } from "../../pages/ECOverviewAndIntegrationsPage";
import { ECCompanyDetailsPage } from "../../pages/ECCompanyDetailsPage";

test.describe(
  "Validate all links in Expense Clasification Flow splash page is working",
  () => {
    let loginPage: LoginPage;
    let accountsPage: AccountsPage;
    let dashboardPage: DashboardPage;
    let ecOverviewAndIntegrationsPage: ECOverviewAndIntegrationsPage;
    let page: Page;

    const timestamp = Math.floor(Date.now() / 1000);

    test.beforeEach(async ({ context }, testInfo) => {
      // console.log(`Running: ${testInfo.title}`);
      page = await context.newPage();
      loginPage = new LoginPage(page);
      accountsPage = new AccountsPage(page);
      dashboardPage = new DashboardPage(page);
      ecOverviewAndIntegrationsPage = new ECOverviewAndIntegrationsPage(
        context,
        page
      );
    });

    test("make sure callout text and side drawer step in process is displaying correctly", async () => {
      await loginPage.logIn(
        "qamainstreet+FinchEC1643087237@gmail.com",
        "Temp12345"
      );
      await dashboardPage.proceedToCreditClassification();
      if (!(await ecOverviewAndIntegrationsPage.isCurrentlyActive())) {
        await ecOverviewAndIntegrationsPage.navigateBackInEC();
      }
      await ecOverviewAndIntegrationsPage.validateCallOutsOnPage();
      await ecOverviewAndIntegrationsPage.validateStepInTaxProcessing();
      await ecOverviewAndIntegrationsPage.validateInvitationLinks();
      await ecOverviewAndIntegrationsPage.exitECFlow();
    });
  }
);
