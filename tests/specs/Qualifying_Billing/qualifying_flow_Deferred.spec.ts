import { test, Page } from "@playwright/test";
import { LoginPage } from "../../pages/LoginPage";
import { AccountsPage } from "../../pages/AccountsPage";
import { CompanyDetailPage } from "../../pages/CompanyDetailPage";
import { ConnectPayrollPage } from "../../pages/ConnectPayrollPage";
import { EstimatePage } from "../../pages/EstimatePage";
import { QualifyPage } from "../../pages/QualifyPage";
import { EmployeePage } from "../../pages/EmployeePage";
import { DashboardPage } from "../../pages/DashboardPage";
import { RandDActivitiesPage } from "../../pages/RandDActivitiesPage";
import {
  CompanyDetails,
  CompanyTokenInfo,
  QualifyingAnswers,
  User,
} from "../../helpers/TestObjects";
import { BillingPage } from "../../pages/BillingPage";
import { getCurrentYear } from "../../helpers/Utils";
import { OpsCompanyPage } from "../../pages/OpsCompanyPage";
import { getHrefLinkValue } from "../../helpers/GmailActions";
import { getTokenByGivenTestSession } from "../../helpers/TokenHelpers";
import { updateProgramStage } from "../../helpers/OpsHelpers";

test.skip("Qualification Flow: Deferred Income Tax label:SMOKE", () => {
  let connectPayRollPage: ConnectPayrollPage;
  let loginPage: LoginPage;
  let accountsPage: AccountsPage;
  let companyDetailPage: CompanyDetailPage;
  let employeePage: EmployeePage;
  let estimatePage: EstimatePage;
  let dashboardPage: DashboardPage;
  let qualifyingPage: QualifyPage;
  let randDActivities: RandDActivitiesPage;
  let billingPage: BillingPage;
  let newUser: User;
  let page: Page;
  let opsPage: OpsCompanyPage;

  const timestamp = Math.floor(Date.now() / 1000);
  let companyDetails: CompanyDetails;

  // Deferred Tax
  // const deferredIncomeTaxAnswers: QualifyingAnswers = {
  //     generatedRevenue: 'No',
  //     firstYearWithGrossReceipts: getCurrentYear()-7,
  //     expectOweIncomeTax: 'No',
  //     acquiredOtherBuz: 'No',
  //     moreThan50Ownership: 'No',
  //     transitionEntityType: 'No',
  //     cpaFirmName: 'MyCPA Firm',
  //     cpaFirmEmail: 'mycpa@gmail.com',
  //     moreThan5MthisYear: 'No'
  // }

  //Deferred Tax
  const deferredIncomeTaxAnswers: QualifyingAnswers = {
    generatedRevenue: "Yes",
    firstYearWithGrossReceipts: getCurrentYear() - 7,
    expectOweIncomeTax: "No",
    acquiredOtherBuz: "Yes - we acquired a full business",
    foundYearAquiredCompnay: getCurrentYear() - 7,
    moreThan50Ownership: "No",
    transitionEntityType: "No",
    cpaFirmName: "MyCPA Firm",
    cpaFirmEmail: "mycpa@gmail.com",
    moreThan5MthisYear: "Yes",
    expectMoreThan5MthisYear: "No",
    expectMoreThan5MnextYear: "No",
  };

  test.beforeEach(async ({ context }, testInfo) => {
    // console.log(`Running: ${testInfo.title}`);
    page = await context.newPage();
    loginPage = new LoginPage(page);
    accountsPage = new AccountsPage(page);
    connectPayRollPage = new ConnectPayrollPage(context, page);
    companyDetailPage = new CompanyDetailPage(page);
    employeePage = new EmployeePage(page);
    estimatePage = new EstimatePage(page);
    dashboardPage = new DashboardPage(page);
    qualifyingPage = new QualifyPage(page);
    billingPage = new BillingPage(page);
    randDActivities = new RandDActivitiesPage(page);
    opsPage = new OpsCompanyPage(page);
    companyDetails = CompanyDetailPage.buildDefaultCompanyDetail({
      timestamp: timestamp,
    });
  });

  test("Complets Qualification for Deferred Income type and proceed to accept and qualify with State Taxes", async () => {
    newUser = await accountsPage.createDefaultNewAccount("deferred", timestamp);
    console.log(
      `created new user: ${newUser.firstName} ${newUser.lastName}, ${newUser.email}`
    );

    // await loginPage.logIn('julie.zhu+1640882483@mainstreet.com', 'Temp12345')
    await connectPayRollPage.makePayRollSelection({
      skipConnection: true,
    });
    await connectPayRollPage.skipPayRollConnection();
    await companyDetailPage.completeCompanyDetails({
      companyDetails: companyDetails,
    });
    await companyDetailPage.proceedToContinue();
    let employeeDetails =
      await employeePage.completeEmployeeDetailsBasedOnPayrollConnection(
        "skipped"
      );
    // await estimatePage.handleNoPayrollFoundQuestions(employeeDetails);
    await estimatePage.waitForEstimatePageLoadingComplete();
    await estimatePage.proceedToContinue();

    // await dashboardPage.navigateToTab('Dashboard')
    await dashboardPage.navigateToQualifyViaStartSaving();
    await qualifyingPage.completeQualifyingProcess(deferredIncomeTaxAnswers);
    await randDActivities.handleRandDCreditType("deferred");
    await randDActivities.completeRandDActivitiesQuestions();
    await randDActivities.completeFinalizingQualifyingQuestions();
    await randDActivities.proceedToReview();
  });

  test("Complete review and billing 2021 Federal R&D Tax Credit order via email", async () => {
    const q: string = `subject: ${companyDetails.dba}'s 2021 Federal R&D Tax Credit order details are ready, to: ${newUser.email}`;
    const billingLink: string = await getHrefLinkValue(
      "qamainstreet@gmail.com",
      q,
      'a[href*="billing"]'
    );

    await loginPage.logIn(newUser.email, newUser.password, billingLink);
    await billingPage.accecptOrder();
    await billingPage.handleAllSetPrompt();

    await billingPage.reviewAndAccept("California Research Credit");
    await billingPage.handleAllSetPrompt();
    await billingPage.reviewAndAccept("Massachusetts Research Credit");
    await billingPage.handleAllSetPrompt(true);
  });

  test("set company program stage to Expense Classification and make sure user sees that link in dashboard", async () => {
    await loginPage.logIn(newUser.email, newUser.password);
    const companyTokenInfo: CompanyTokenInfo = await getTokenByGivenTestSession(
      page
    );
    await updateProgramStage(
      companyTokenInfo.programId!,
      companyTokenInfo.token,
      page.url()
    );
    await page.reload();
    await dashboardPage.validateECLink();
  });
});
