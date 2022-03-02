import {
  test,
  Page,
  APIRequestContext,
  BrowserContext,
  webkit,
} from "@playwright/test";
import { LoginPage } from "../../pages/LoginPage";
import { AccountsPage } from "../../pages/AccountsPage";
import { DashboardPage } from "../../pages/DashboardPage";
import {
  CompanyTokenInfo,
  TMCompanyInfo,
  User,
} from "../../helpers/TestObjects";
import {
  createNewUserAPI,
  handleQualificationQuestionSets,
  irsTestPartFourAPI,
  setCompanyDetailAPI,
  setEmployeeDetailsAPI,
  setPayrollConnectionAPI,
  setupUserToDashboard,
} from "../../helpers/OnboardingAPIActions";
import {
  getTokenByGivenTestSession,
  setupOpsLoginByPass,
} from "../../helpers/TokenHelpers";
import { CompanyDetailPage } from "../../pages/CompanyDetailPage";
import {
  generateRandomNumber,
  getCurrentYear,
  getTimestamp,
} from "../../helpers/Utils";
import { EmployeePage } from "../../pages/EmployeePage";
import { OpsCompanyPage } from "../../pages/OpsCompanyPage";
import { TMPage } from "../../pages/TMPage";
import { AlloyPage } from "../../pages/AlloyPage";
import { IntegrationsPage } from "../../pages/IntegrationsPage";

test.describe.serial(
  "Treasury Management With Existing Plaid Connection:SMOKE",
  () => {
    let dashboardPage: DashboardPage;
    let opsContext: BrowserContext;
    let opsPage: Page;
    let tmPage: TMPage;
    let newUser: User;
    let page: Page;
    let context: BrowserContext;
    let opsCompanyPage: OpsCompanyPage;
    let companyInfo: CompanyTokenInfo;
    let alloyPage: AlloyPage;
    let integrationsPage: IntegrationsPage;

    const timestamp = getTimestamp();
    let apiContext: APIRequestContext;

    test.beforeAll(async ({ playwright, browser, baseURL, headless }) => {
      context = await browser.newContext();
      page = await context.newPage();
      let accountsPage = new AccountsPage(page);
      tmPage = new TMPage(context, page);
      let logIn = new LoginPage(page);
      dashboardPage = new DashboardPage(page);
      integrationsPage = new IntegrationsPage(page);

      apiContext = await playwright.request.newContext({
        // All requests we send go to this API endpoint.
        baseURL: baseURL,
      });

      newUser = accountsPage.buildDefaultUserInfo({
        prefix: "TMPLAID",
        timestamp: timestamp,
      });
      let companyId = await createNewUserAPI(apiContext, newUser);

      await logIn.logIn(newUser.email, newUser.password);
      companyInfo = await getTokenByGivenTestSession(page);
      // const jwtToken = await getTokenViaServiceAccount();
      apiContext = await playwright.request.newContext({
        // All requests we send go to this API endpoint.
        baseURL: baseURL,
        extraHTTPHeaders: {
          baseURL: baseURL!,
          Authorization: companyInfo.token,
        },
      });

      await setupUserToDashboard(apiContext, timestamp);

      let opsBrowser = await webkit.launch({
        headless: headless,
        slowMo: 120,
      });
      opsContext = await opsBrowser.newContext({
        viewport: { width: 1460, height: 800 },
      });
      opsPage = await opsContext.newPage();
      let url = "https://ops.staging.mainstreet.com";
      opsPage = await setupOpsLoginByPass(opsPage, url);
      await opsPage.goto(url);
      opsCompanyPage = new OpsCompanyPage(opsPage);
      await opsCompanyPage.navigateToCompanyDetailPage(newUser.email);
      await opsCompanyPage.createPromissoryNote({
        amount: generateRandomNumber(1, 25) * 1000000 + Number(companyId),
      });
      await opsCompanyPage.enableTreasuryManagment(newUser.email);
      await page.goto(baseURL!);

      let alloyContext = await browser.newContext();
      let alloyPageObject = await alloyContext.newPage();
      alloyPage = new AlloyPage(alloyPageObject);
    });

    test.afterAll(async ({}) => {
      await apiContext.dispose();
    });

    test("Given user is connected with a 5M account, check we see proper connected message and complete flow", async () => {
      // await loginPage.logIn(newUser.email, newUser.password);
      await dashboardPage.goto();
      await dashboardPage.navigateToTab("Integrations");
      await integrationsPage.connectToPlaid("plaid_accredited");

      await dashboardPage.navigateToTab("Treasury Management");
      await tmPage.kickOffKycFlow();
      let tmCompanyInfo: TMCompanyInfo = await tmPage.completKYCCompanyInfoForm(
        {
          timestamp: timestamp,
        }
      );
      // await tmPage.uploadAccreditationDocuments();
      await tmPage.submitCompanyForm();
      await tmPage.validateCompanyInfoSummary(tmCompanyInfo);
      await tmPage.proceedToContinue();
      await tmPage.completeBeneficialOnwerForm({ timestamp: timestamp });
      await tmPage.certifyAndSubmitBeneficialOnwerForm();
      await tmPage.returnToDashBoardAfterSubmission();

      await alloyPage.logInAlloy();
      await alloyPage.approveDocs(tmCompanyInfo.legalName);
      // await tmPage.approveCreditForUser();
      // this is where we need to manually approve all docs uploaded
      await opsCompanyPage.updateKYCStatusforCompany();
      await tmPage.reviewDocuments();
      await tmPage.completeDocSign(timestamp);
      await tmPage.validateWireTransferInstruction();
      // await docPage.validateDownlodFiles();
    });
  }
);
