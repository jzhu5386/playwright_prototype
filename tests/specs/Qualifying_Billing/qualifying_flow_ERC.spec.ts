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
  EmployeeDetails,
  QualifyingAnswers,
  User,
} from "../../helpers/TestObjects";
import { BillingPage } from "../../pages/BillingPage";
import {
  generateRandomNames,
  generateRandomNumber,
  getCurrentYear,
} from "../../helpers/Utils";

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

  //ERC Tax
  const deferredIncomeTaxAnswers: QualifyingAnswers = {
    generatedRevenue: "Yes",
    firstYearWithGrossReceipts: getCurrentYear() - 1,
    expectOweIncomeTax: "No",
    acquiredOtherBuz: "No",
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
    companyDetails = CompanyDetailPage.buildDefaultCompanyDetail({
      timestamp: timestamp,
    });
    companyDetails.yearOfIncorporation = (getCurrentYear() - 1).toString();
    companyDetails.wasAverageMonthlyRevLess80k = "Yes";
    companyDetails.sellProductAfter2020 = "Yes";
    companyDetails.redeemList = [
      "Massachusetts life sciences credit", // by selecting this we would disqualify MA RD credit
      "Tax Credit for Qualified Sick Leave Wages",
      "Tax Credit for Qualified Family Leave Wages",
    ];
  });

  test("Complets Qualification for Deferred Income type and proceed to accept and qualify with State Taxes", async () => {
    newUser = await accountsPage.createDefaultNewAccount("ERC", timestamp);
    console.log(
      `created new user: ${newUser.firstName} ${newUser.lastName}, ${newUser.email}`
    );

    // await loginPage.logIn('julie.zhu+1640882483@mainstreet.com', 'Temp12345')
    await connectPayRollPage.makePayRollSelection({ payRollName: "Gusto" });
    await companyDetailPage.completeCompanyDetails({
      companyDetails: companyDetails,
    });
    await companyDetailPage.proceedToContinue();
    let employeeDetails = EmployeePage.buildDefaultEmployeeDetails();
    employeeDetails.contractorsNotInPayRoll = "No";

    await employeePage.completeEmployeeDetailAfterFinch(employeeDetails);
    // await estimatePage.handleNoPayrollFoundQuestions(employeeDetails);
    await estimatePage.waitForEstimatePageLoadingComplete();
    await estimatePage.proceedToContinue();

    // await dashboardPage.navigateToTab('Dashboard')
    await dashboardPage.navigateToQualifyViaStartSaving();
    await qualifyingPage.completeQualifyingProcess();
    await randDActivities.handleRandDCreditType("QSB");
    await randDActivities.completeRandDActivitiesQuestions();
    await randDActivities.completeFinalizingQualifyingQuestions();
    await randDActivities.proceedToReview();

    //Review and accept order with credit card entry
    await billingPage.reviewAndAccept("Federal R&D Tax Credit");
    await billingPage.handleAllSetPrompt();
    await billingPage.reviewAndAccept("California Research Credit");
    await billingPage.handleAllSetPrompt(true);
  });
});
