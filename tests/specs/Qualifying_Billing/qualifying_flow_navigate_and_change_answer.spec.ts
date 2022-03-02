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
  QualifyingAnswers,
  RandDActivities,
  User,
} from "../../helpers/TestObjects";
import { BillingPage } from "../../pages/BillingPage";
import { getCurrentYear } from "../../helpers/Utils";

test.skip("Qualification Flow: NavigateBack and Edits label:SMOKE", () => {
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

  //Deferred Tax
  const fullexpansionDeferred: QualifyingAnswers = {
    generatedRevenue: "Yes",
    firstYearWithGrossReceipts: getCurrentYear() - 7,
    expectOweIncomeTax: "No",
    acquiredOtherBuz: "Yes - we acquired a full business",
    foundYearAquiredCompnay: getCurrentYear() - 7,
    moreThan50Ownership: "Yes",
    companyInControlRAndD: "Yes",
    companyInControlEarliestFounded: 2020,
    transitionEntityType: "Yes - we changed EIN",
    transitionYear: 2020,
    originalEntityFoundYear: 2019,
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
  });

  test("One can navigate back to R&D Credit form reenter to get a different credity type", async () => {
    newUser = await accountsPage.createDefaultNewAccount(
      "NavigateQualify",
      timestamp
    );
    console.log(
      `created new user: ${newUser.firstName} ${newUser.lastName}, ${newUser.email}`
    );
    // await loginPage.logIn(
    //   "qamainstreet+NavigateQualify1643652298@gmail.com",
    //   "Temp12345"
    // );
    // await loginPage.logIn('julie.zhu+1640882483@mainstreet.com', 'Temp12345')
    await connectPayRollPage.makePayRollSelection({
      payRollName: "ADP TotalSource",
    });
    await companyDetailPage.completeCompanyDetails({
      companyDetails: companyDetails,
    });
    await companyDetailPage.proceedToContinue();
    let employeeDetails = await employeePage.completeEmployeeDetailAfterFinch();
    await estimatePage.handleNoPayrollFoundQuestions(employeeDetails);
    await estimatePage.waitForEstimatePageLoadingComplete();
    await estimatePage.proceedToContinue();
    await dashboardPage.navigateToTab("Dashboard");

    await dashboardPage.navigateToQualifyViaStartSaving();
    await qualifyingPage.completeQualifyingProcess(fullexpansionDeferred);

    await randDActivities.handleRandDCreditType("deferred");
    await randDActivities.completeRandDActivitiesQuestions();

    //return back to begining of the form by navigating back and refreh
    await qualifyingPage.navigateBackToRAndDCreditForm();
    await page.reload();

    // once refreshed, start filling in different values such that resolve to a different classification
    await qualifyingPage.completeQualifyingProcess();
    await randDActivities.handleRandDCreditType("QSB");
    const randDActivitiesAnswer: RandDActivities = {
      claimedRDBefore: "Yes",
      buzDescription: "Business Description \n hope",
      randDActivityInhouse:
        "Some employees and some contractors or outside firms",
      inHouseEmployeeInUS: "Some work is done in the US, some abroad",
      contractorActivityInUS: "Some in the US, some not in the US",
      ownIntellectualPropery: "Yes, we own some of the intellectual property",
      grantsUsedForRDExpense: "Yes",
      grantOrigin: ["NIH", "DOE"],
      grantUsedForRandDSpending: "10000",
      consultingAgency:
        "Yes, but we also build our own products where we own the IP",
      buildOwnProductTimePercentage: "50",
      trackTime: "No",
    };
    await randDActivities.completeRandDActivitiesQuestions(
      randDActivitiesAnswer
    );
    await randDActivities.completeFinalizingQualifyingQuestions();
  });
});
