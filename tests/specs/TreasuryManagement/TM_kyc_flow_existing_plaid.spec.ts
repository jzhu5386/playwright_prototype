import {
  test,
  Page,
  APIRequestContext,
  BrowserContext,
} from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { AccountsPage } from '../../pages/AccountsPage';
import { DashboardPage } from '../../pages/DashboardPage';
import {
  CompanyTokenInfo,
  TMCompanyInfo,
  User,
} from '../../helpers/TestObjects';
import {
  createNewUserAPI,
  setupUserToDashboard,
} from '../../helpers/OnboardingAPIActions';
import { getTokenByGivenTestSession } from '../../helpers/TokenHelpers';
import { getTimestamp } from '../../helpers/Utils';
import { OpsCompanyPage } from '../../pages/OpsCompanyPage';
import { TMPage } from '../../pages/TMPage';
import { IntegrationsPage } from '../../pages/IntegrationsPage';
import { BrowserFactory } from '../../helpers/BrowserFactory';
import { DocumentsPage } from '../../pages/DocumentsPage';

test.describe.serial(
  'Treasury Management With Existing Plaid Connection label:SMOKE',
  () => {
    let dashboardPage: DashboardPage;
    let opsPage: Page;
    let tmPage: TMPage;
    let newUser: User;
    let page: Page;
    let context: BrowserContext;
    let opsCompanyPage: OpsCompanyPage;
    let companyInfo: CompanyTokenInfo;
    let integrationsPage: IntegrationsPage;
    let opsURL: string;
    let opsBrowser: BrowserFactory;
    let promissoryAmount: number;
    let docPage: DocumentsPage;

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
      docPage = new DocumentsPage(page);

      apiContext = await playwright.request.newContext({
        // All requests we send go to this API endpoint.
        baseURL: baseURL,
      });

      newUser = accountsPage.buildDefaultUserInfo({
        prefix: 'TMPLAID',
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
      await page.goto(baseURL!);

      // create a dedicated browser window just for ops tool
      opsURL = baseURL
        ? baseURL.replace('dashboard.', 'ops.')
        : 'https://ops.staging.mainstreet.com';
      opsBrowser = new BrowserFactory(opsURL, 'webkit', headless!);
      await opsBrowser.setupBrowserForOps();
      opsPage = opsBrowser.page!;
      await opsPage.goto(opsURL);
      opsCompanyPage = new OpsCompanyPage(opsPage);
      promissoryAmount = await opsCompanyPage.setUserUpForTM(
        newUser,
        companyId,
      );
    });

    test.afterAll(async ({}) => {
      await apiContext.dispose();
      await opsBrowser.close();
      await page.close();
      await context.close();
      await page.close();
      await context.close();
    });

    test('Given user is connected with a 5M account, check we see proper connected message and complete flow', async () => {
      // await loginPage.logIn(newUser.email, newUser.password);
      await dashboardPage.goto();
      await dashboardPage.navigateToTab('Integrations');
      await integrationsPage.connectToPlaid('plaid_accredited');

      await dashboardPage.navigateToTab('Treasury Management');
      await tmPage.kickOffKycFlow();
      let tmCompanyInfo: TMCompanyInfo = await tmPage.completKYCCompanyInfoForm(
        {
          timestamp: timestamp,
        },
      );
      // await tmPage.uploadAccreditationDocuments();
      console.log('submit company form');
      await tmPage.submitCompanyForm();
      await tmPage.validateCompanyInfoSummary(tmCompanyInfo);
      await tmPage.proceedToContinue();
      await tmPage.completeBeneficialOnwerForm({ timestamp: timestamp });
      await tmPage.certifyAndSubmitBeneficialOnwerForm();
      await tmPage.returnToDashBoardAfterSubmission();
      console.log('returned to dashboard');

      // alloy now auto approves accounts with 5M PLAID connections
      await opsCompanyPage.updateKYCStatusforCompany();
      await tmPage.reviewDocuments();
      console.log('sign docs');
      await tmPage.completeDocSign(timestamp);
      await tmPage.validateWireTransferInstruction();
      await tmPage.validateHighYieldAccountView(promissoryAmount, 'empty');

      await dashboardPage.navigateToTab('Documents');
      let expectedDocs = [
        'MainStreet Yield LLC - Note Investment.pdf',
        'Treasury Management Document',
        'MainStreet Yield LLC - Purchase Agreement.pdf',
        'Treasury Management Document',
        'IRS Form W-9.pdf',
        'Treasury Management Document',
      ];
      await docPage.validateFilesInDocumentTab(
        expectedDocs,
        `DBA ${timestamp}`,
      );
    });
  },
);
