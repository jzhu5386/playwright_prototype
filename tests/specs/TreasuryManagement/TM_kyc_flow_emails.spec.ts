import {
  test,
  Page,
  APIRequestContext,
  BrowserContext,
} from '@playwright/test';
import { LoginPage } from '../../pages/LoginPage';
import { AccountsPage } from '../../pages/AccountsPage';
import { DashboardPage } from '../../pages/DashboardPage';
import { DocumentsPage } from '../../pages/DocumentsPage';
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
import { AlloyPage } from '../../pages/AlloyPage';
import { getHrefLinkValue } from '../../helpers/GmailActions';
import { transferFunds } from '../../helpers/ExternalAPIHelpers';
import { BrowserFactory } from '../../helpers/BrowserFactory';

test.describe.serial('Treasury Management Flow label:SMOKE', () => {
  let dashboardPage: DashboardPage;
  let opsPage: Page;
  let tmPage: TMPage;
  let newUser: User;
  let page: Page;
  let docPage: DocumentsPage;
  let context: BrowserContext;
  let opsCompanyPage: OpsCompanyPage;
  let companyInfo: CompanyTokenInfo;
  let alloyPage: AlloyPage;
  let alloyContext: BrowserContext;
  let alloyPageObject: Page;
  let promissoryAmount: number;
  let opsURL: string;
  let opsBrowser: BrowserFactory;
  let companyId: string;
  let tmCompanyInfo: TMCompanyInfo;

  let timestamp = getTimestamp();
  let apiContext: APIRequestContext;

  test.beforeAll(async ({ playwright, browser, baseURL, headless }) => {
    context = await browser.newContext();
    page = await context.newPage();
    let accountsPage = new AccountsPage(page);
    tmPage = new TMPage(context, page);
    let logIn = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
    docPage = new DocumentsPage(page);

    apiContext = await playwright.request.newContext({
      // All requests we send go to this API endpoint.
      baseURL: baseURL,
    });

    newUser = accountsPage.buildDefaultUserInfo({
      prefix: 'TMKYCEmails',
      timestamp: timestamp,
    });
    companyId = await createNewUserAPI(apiContext, newUser);

    console.log(newUser.firstName, newUser.lastName);
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
    promissoryAmount = await opsCompanyPage.setUserUpForTM(newUser, companyId);

    // make sure we are gettting the first email from client perspective
    const q: string = `subject: MainStreet High Yield: The wait is over - let’s get started!, to: ${newUser.email}`;
    const verifyLink: string = await getHrefLinkValue(
      'qamainstreet@gmail.com',
      q,
      'a[href*="treasury-management"]',
    );
    // make sure user can navigate to the form directly from link provided in email
    await page.goto(verifyLink);

    alloyContext = await browser.newContext();
    alloyPageObject = await alloyContext.newPage();
    alloyPage = new AlloyPage(alloyPageObject);
  });

  test.afterAll(async ({}) => {
    await apiContext.dispose();
    await opsBrowser.close();
    await alloyContext.close();
    await alloyPageObject.close();
    await page.close();
    await context.close();
  });

  test('Check all three client side emails and make sure we can navigate from email link, and expected signed doc appear in documents folder', async () => {
    await tmPage.kickOffKycFlow();
    tmCompanyInfo = await tmPage.completKYCCompanyInfoForm({
      timestamp: timestamp,
    });
    let upLoadedDocs = await tmPage.uploadAccreditationDocuments();
    await tmPage.submitCompanyForm();
    await tmPage.validateCompanyInfoSummary(tmCompanyInfo);
    await tmPage.proceedToContinue();
    await tmPage.completeBeneficialOnwerForm({ timestamp: timestamp });
    await tmPage.certifyAndSubmitBeneficialOnwerForm();
    await tmPage.returnToDashBoardAfterSubmission();

    await alloyPage.logInAlloy();
    await alloyPage.approveDocs({
      entityName: tmCompanyInfo.legalName,
    });

    // this is where we need to manually approve accreditation docs uploaded
    await opsCompanyPage.updateKYCStatusforCompany();
    await tmPage.reviewDocuments();
    await tmPage.completeDocSign(timestamp);
  });

  test("Once client completes the form, check that they do get You're approved email and get redirected to ", async () => {
    // this You're approved email appears to be only showing up after user had activated the account
    let q: string = `subject: You're Approved!, to: ${newUser.email}`;
    let verifyLink: string = await getHrefLinkValue(
      'qamainstreet@gmail.com',
      q,
      'a[href*="reasury-management"]',
    );

    await page.goto(verifyLink);
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
    await docPage.validateFilesInDocumentTab(expectedDocs, `DBA ${timestamp}`);
  });
  test('This only works with manual intervention currently. Wire an ammount to MT, then reconcile and confirm we get reci', async () => {
    // TODO: modern treasury is no longer auto-reconciling on sandbox, so need to
    // further investigate how to work this one out
    await transferFunds(promissoryAmount);
    // currently you'd have to manually reconcile for this section of test to complete successfully.
    let q = `subject: Hi, yields! to: ${newUser.email} "${newUser.firstName}"`;
    let verifyLink = await getHrefLinkValue(
      'qamainstreet@gmail.com',
      q,
      'a[href*="reasury-management"]',
    );
    await page.goto(verifyLink);
    await tmPage.validateHighYieldAccountView(promissoryAmount, 'Completed');
  });
});
