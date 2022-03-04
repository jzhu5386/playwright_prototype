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
  setupUserToDashboard,
} from "../../helpers/OnboardingAPIActions";
import {
  getTokenByGivenTestSession,
  getTokenViaServiceAccount,
  setupOpsLoginByPass,
} from "../../helpers/TokenHelpers";
import { generateRandomNumber, getTimestamp } from "../../helpers/Utils";
import { OpsCompanyPage } from "../../pages/OpsCompanyPage";
import { TMPage } from "../../pages/TMPage";
import { AlloyPage } from "../../pages/AlloyPage";
import { IntegrationsPage } from "../../pages/IntegrationsPage";
import { BrowserFactory } from "../../helpers/BrowserFactory";

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
    let opsURL: string;
    let opsBrowser: BrowserFactory;
    let promissoryAmount: number;

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
        prefix: "TMPLAIDSWAP",
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
          // "proxy-authorization": companyInfo.token,
        },
      });

      await setupUserToDashboard(apiContext, timestamp);
      await page.goto(baseURL!);

      // create a dedicated browser window just for ops tool
      opsURL = baseURL
        ? baseURL.replace("dashboard.", "ops.")
        : "https://ops.staging.mainstreet.com";
      opsBrowser = new BrowserFactory(opsURL, "webkit", headless!);
      await opsBrowser.setupBrowserForOps();
      opsPage = opsBrowser.page!;
      await opsPage.goto(opsURL);
      opsCompanyPage = new OpsCompanyPage(opsPage);
      promissoryAmount = await opsCompanyPage.setUserUpForTM(
        newUser,
        companyId
      );

      let alloyContext = await browser.newContext();
      let alloyPageObject = await alloyContext.newPage();
      alloyPage = new AlloyPage(alloyPageObject);
    });

    test.afterAll(async ({}) => {
      await apiContext.dispose();
      await opsBrowser.close();
    });

    test("With <5M exiting connection, swap out connection with >5M connection and complete flow", async () => {
      // await loginPage.logIn(newUser.email, newUser.password);
      await dashboardPage.goto();
      await dashboardPage.navigateToTab("Integrations");
      await integrationsPage.connectToPlaid("plaid_unqualified");

      await dashboardPage.navigateToTab("Treasury Management");
      await tmPage.kickOffKycFlow();
      let tmCompanyInfo: TMCompanyInfo = await tmPage.completKYCCompanyInfoForm(
        {
          timestamp: timestamp,
        }
      );
      await tmPage.swapPlaidConnection("plaid_accredited");
      await tmPage.uploadAccreditationDocuments();
      await tmPage.submitCompanyForm();
      await tmPage.validateCompanyInfoSummary(tmCompanyInfo);
      await tmPage.proceedToContinue();
      await tmPage.completeBeneficialOnwerForm({ timestamp: timestamp });
      await tmPage.certifyAndSubmitBeneficialOnwerForm();
      await tmPage.returnToDashBoardAfterSubmission();
      // await opsCompanyPage.createPromissoryNote();

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
