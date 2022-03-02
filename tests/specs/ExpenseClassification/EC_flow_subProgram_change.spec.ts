import { test, Page, expect } from "@playwright/test";
import { LoginPage } from "../../pages/LoginPage";
import { DashboardPage } from "../../pages/DashboardPage";
import { CompanyTokenInfo } from "../../helpers/TestObjects";
import { ECOverviewAndIntegrationsPage } from "../../pages/ECOverviewAndIntegrationsPage";
import { ECSuppliesAndServicesPage } from "../../pages/ECSuppliesAndServicesPage";
import { getTokenByGivenTestSession } from "../../helpers/TokenHelpers";
import { OpsCompanyPage } from "../../pages/OpsCompanyPage";
import { updateProgramSubstage } from "../../helpers/OpsHelpers";

test.describe("check subprogram navigation label:REGRESSION", () => {
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
    ecSuppliesAndServicesPage = new ECSuppliesAndServicesPage(page);
    ecOverviewAndIntegrationsPage = new ECOverviewAndIntegrationsPage(
      context,
      page
    );
  });

  test("For company completed EC flow, we can still change subStage settings and allow them to access the stages ", async () => {
    // this users has moved to R&D Expenses | Employee page
    // const subStages = [
    //   "expense_classification_rd_expenses",
    //   "expense_classification_rd_employees",
    //   "expense_classification_company_details",
    // ];
    await loginPage.logIn("qamainstreet+ERC1643742324@gmail.com", "Temp12345");
    const tokenInfo: CompanyTokenInfo = await getTokenByGivenTestSession(page);
    await updateProgramSubstage(
      tokenInfo.programId!,
      tokenInfo.token,
      page.url(),
      "expense_classification_rd_employees"
    );
    await dashboardPage.proceedToCreditClassification();
    let currentActive = await ecSuppliesAndServicesPage.activeStep();
    expect(currentActive).toEqual("Employees");

    await ecOverviewAndIntegrationsPage.exitECFlow();
    await updateProgramSubstage(
      tokenInfo.programId!,
      tokenInfo.token,
      page.url(),
      "expense_classification_company_details"
    );
    // await opsPage.updateProgramSubstage(
    //   "expense_classification_company_details",
    //   tokenInfo
    // );
    await dashboardPage.proceedToCreditClassification();
    currentActive = await ecSuppliesAndServicesPage.activeStep();
    expect(currentActive).toEqual("Company Details");
    await updateProgramSubstage(
      tokenInfo.programId!,
      tokenInfo.token,
      page.url()
      // "expense_classification_company_details"
    );
    // await opsPage.updateProgramSubstage();
  });
});
