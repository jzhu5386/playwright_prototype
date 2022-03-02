import { test, Page } from "@playwright/test";
import { LoginPage } from "../../pages/LoginPage";
import { DashboardPage } from "../../pages/DashboardPage";
import { ECOverviewAndIntegrationsPage } from "../../pages/ECOverviewAndIntegrationsPage";
import { ECSuppliesAndServicesPage } from "../../pages/ECSuppliesAndServicesPage";
import { OpsCompanyPage } from "../../pages/OpsCompanyPage";

test.describe("check account qualifying default flow label:SMOKE", () => {
  let loginPage: LoginPage;
  let dashboardPage: DashboardPage;
  let ecOverviewAndIntegrationsPage: ECOverviewAndIntegrationsPage;
  let ecSuppliesAndServicesPage: ECSuppliesAndServicesPage;
  let opsPage: OpsCompanyPage;
  let page: Page;

  test.beforeEach(async ({ context }, testInfo) => {
    // console.log(`Running: ${testInfo.title}`);
    page = await context.newPage();
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
    opsPage = new OpsCompanyPage(page);
    ecOverviewAndIntegrationsPage = new ECOverviewAndIntegrationsPage(
      context,
      page
    );
    ecSuppliesAndServicesPage = new ECSuppliesAndServicesPage(page);
  });

  test("For company completed EC flow, we can still change subStage settings and allow them to access the stages ", async () => {
    // this users has moved to R&D Expenses | Employee page
    await loginPage.logIn("qamainstreet+ERC1643742324@gmail.com", "Temp12345");
    await dashboardPage.proceedToCreditClassification();
    if (!(await ecOverviewAndIntegrationsPage.isCurrentlyActive())) {
      await ecOverviewAndIntegrationsPage.navigateBackInEC();
    }
    await ecOverviewAndIntegrationsPage.validateConnectedState(true);
    await ecOverviewAndIntegrationsPage.addNewPayRollConnection("Rippling");
  });

  test("For company that have skipped payroll connection make sure they can continue to skip", async () => {
    await loginPage.logIn(
      "qamainstreet+deferred1643948132@gmail.com",
      "Temp12345"
    );
    await dashboardPage.proceedToCreditClassification();
    if (!(await ecOverviewAndIntegrationsPage.isCurrentlyActive())) {
      await ecOverviewAndIntegrationsPage.navigateBackInEC();
    }
    await ecOverviewAndIntegrationsPage.validateConnectedState(false);
    await ecOverviewAndIntegrationsPage.selectPayRollNotListedOption();
    await ecOverviewAndIntegrationsPage.proceedToContinue();
  });
});
