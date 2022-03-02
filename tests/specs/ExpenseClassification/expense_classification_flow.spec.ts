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
  ConfirmCompanyDetails,
  EmployeeDetails,
  EmployeePersonalDetails,
  User,
} from "../../helpers/TestObjects";
import { BillingPage } from "../../pages/BillingPage";
import { ECOverviewAndIntegrationsPage } from "../../pages/ECOverviewAndIntegrationsPage";
import { ECCompanyDetailsPage } from "../../pages/ECCompanyDetailsPage";
import { ECSuppliesAndServicesPage } from "../../pages/ECSuppliesAndServicesPage";
import { ECEmployeesPage } from "../../pages/ECEmployeesPage";
import { ECExpertReviewPage } from "../../pages/ECExpertReviewPage";

test.skip("check account qualifying default flow label:SMOKE", () => {
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
  let ecOverviewAndIntegrationsPage: ECOverviewAndIntegrationsPage;
  let ecCompanyDetailsPage: ECCompanyDetailsPage;
  let ecSuppliesAndServicesPage: ECSuppliesAndServicesPage;
  let ecEmployeesPage: ECEmployeesPage;
  let ecExpertReviewPage: ECExpertReviewPage;
  let currentEmployeeDetails: EmployeeDetails;
  let newUser: User;
  let page: Page;

  const timestamp = Math.floor(Date.now() / 1000);

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
    ecOverviewAndIntegrationsPage = new ECOverviewAndIntegrationsPage(
      context,
      page
    );
    ecSuppliesAndServicesPage = new ECSuppliesAndServicesPage(page);
    ecCompanyDetailsPage = new ECCompanyDetailsPage(page);
    ecEmployeesPage = new ECEmployeesPage(context, page);
    ecExpertReviewPage = new ECExpertReviewPage(context, page);
  });

  test("Setup user with completed qualifying state accepted all ", async () => {
    newUser = await accountsPage.createDefaultNewAccount(
      "qualified",
      timestamp
    );
    console.log(
      `created new user: ${newUser.firstName} ${newUser.lastName}, ${newUser.email}`
    );

    // await loginPage.logIn('qamainstreet+qualified1643061955@gmail.com', 'Temp12345')
    await connectPayRollPage.makePayRollSelection();
    await companyDetailPage.completeCompanyDetails({ timestamp: timestamp });
    await companyDetailPage.proceedToContinue();
    currentEmployeeDetails =
      await employeePage.completeEmployeeDetailAfterFinch();
    await estimatePage.handleNoPayrollFoundQuestions(currentEmployeeDetails);
    await estimatePage.waitForEstimatePageLoadingComplete();
    await estimatePage.proceedToContinue();

    // await dashboardPage.navigateToTab('Dashboard')
    await dashboardPage.navigateToQualifyViaStartSaving();
    await qualifyingPage.completeQualifyingProcess();
    await randDActivities.handleRandDCreditType();
    await randDActivities.completeRandDActivitiesQuestions();
    await randDActivities.completeFinalizingQualifyingQuestions();
    await randDActivities.proceedToReview();

    //Review and accept order with credit card entry
    await billingPage.reviewAndAccept("Federal R&D Tax Credit");
    await billingPage.handleAllSetPrompt();
    await billingPage.reviewAndAccept("California Research Credit");
    await billingPage.handleAllSetPrompt();
    await billingPage.reviewAndAccept("Massachusetts Research Credit");
    await billingPage.handleAllSetPrompt(true);
  });

  test("complete Expense Classification flow via manual entries", async () => {
    let confirmCompanyDetail: ConfirmCompanyDetails =
      ECCompanyDetailsPage.buildDefaultConfirmCompanyDetailAnswers();

    // await loginPage.logIn('qamainstreet+qualified1642971597@gmail.com', 'Temp12345') // missing question answers
    await loginPage.logIn(
      "qamainstreet+qualified1642972030@gmail.com",
      "Temp12345"
    );
    await dashboardPage.proceedToCreditClassification();
    if (await ecOverviewAndIntegrationsPage.isCurrentlyActive()) {
      await ecOverviewAndIntegrationsPage.validateConnectedState(true);
      await ecOverviewAndIntegrationsPage.proceedToContinue();
    }

    if (await ecCompanyDetailsPage.isCurrentlyActive()) {
      const questionCount =
        await ecCompanyDetailsPage.confirmInfoIsStillAccurate(
          confirmCompanyDetail
        );
      await ecCompanyDetailsPage.continueToNextQuestion();
      await ecCompanyDetailsPage.confirmCompanyDetailAnswers(
        qualifyingPage.buildDefaultQualifyingAnswer(),
        confirmCompanyDetail,
        currentEmployeeDetails,
        questionCount
      );
    }

    if (await ecSuppliesAndServicesPage.isCurrentlyActive()) {
      await ecSuppliesAndServicesPage.completeSuppliesAndServicesForm();
    }

    if (await ecEmployeesPage.isCurrentlyActive()) {
      const employees: EmployeePersonalDetails =
        await ecEmployeesPage.addEmployees();
      const displayedEmployees =
        await ecEmployeesPage.extractEmployeeInfoFromTable();
      await ecEmployeesPage.confirmEmployees();

      await ecEmployeesPage.confirmContractors();
      // await ecEmployeesPage.confirmIndividualDetails(displayedEmployees, employees)
      await ecEmployeesPage.submitForExpertReview();
    }

    if (await ecExpertReviewPage.isCurrentlyActive()) {
      await ecExpertReviewPage.validateSubmittedText();
      await ecExpertReviewPage.returnToDashBoard();
    }
  });
});
