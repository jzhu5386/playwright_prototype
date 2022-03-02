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
  ContractorPersonalDetails,
  EmployeeDetails,
  EmployeePersonalDetails,
  QualifyingAnswers,
  User,
} from "../../helpers/TestObjects";
import { BillingPage } from "../../pages/BillingPage";
import { ECOverviewAndIntegrationsPage } from "../../pages/ECOverviewAndIntegrationsPage";
import { ECCompanyDetailsPage } from "../../pages/ECCompanyDetailsPage";
import { ECSuppliesAndServicesPage } from "../../pages/ECSuppliesAndServicesPage";
import { ECEmployeesPage } from "../../pages/ECEmployeesPage";
import { ECExpertReviewPage } from "../../pages/ECExpertReviewPage";
import { getCurrentYear } from "../../helpers/Utils";
import { OpsCompanyPage } from "../../pages/OpsCompanyPage";
import { getTokenByGivenTestSession } from "../../helpers/TokenHelpers";
import {
  updateProgramStage,
  updateProgramSubstage,
} from "../../helpers/OpsHelpers";

test.describe.serial("EC flow basic label:SMOKE", () => {
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
  let opsPage: OpsCompanyPage;
  let newUser: User;
  let employeeDetails: EmployeeDetails;
  let page: Page;

  const timestamp = Math.floor(Date.now() / 1000);

  // Deferred Tax
  const deferredIncomeTaxAnswers: QualifyingAnswers = {
    generatedRevenue: "Yes",
    firstYearWithGrossReceipts: getCurrentYear() - 8,
    expectOweIncomeTax: "No",
    acquiredOtherBuz: "No",
    moreThan50Ownership: "No",
    transitionEntityType: "No",
    cpaFirmName: "MyCPA Firm",
    cpaFirmEmail: "mycpa@gmail.com",
    moreThan5MthisYear: "Yes",
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
    ecOverviewAndIntegrationsPage = new ECOverviewAndIntegrationsPage(
      context,
      page
    );
    ecSuppliesAndServicesPage = new ECSuppliesAndServicesPage(page);
    ecCompanyDetailsPage = new ECCompanyDetailsPage(page);
    ecEmployeesPage = new ECEmployeesPage(context, page);
    ecExpertReviewPage = new ECExpertReviewPage(context, page);
    opsPage = new OpsCompanyPage(page);
    if (newUser === undefined) {
      newUser = await accountsPage.createDefaultNewAccount(
        "SkipActiviesEC",
        timestamp
      );
      console.log(
        `created new user: ${newUser.firstName} ${newUser.lastName}, ${newUser.email}`
      );
    } else {
      loginPage.logIn(newUser.email, newUser.password);
    }
    // await loginPage.logIn(
    //   "qamainstreet+SkipActiviesEC1644440289@gmail.com",
    //   "Temp12345"
    // );
  });

  test("Setup user with no finch connection, deferred ", async () => {
    await connectPayRollPage.skipPayRollConnection();
    let currentCompanyDetails = CompanyDetailPage.buildDefaultCompanyDetail({
      timestamp: timestamp,
      yearofIncorporation: getCurrentYear() - 9,
    });
    await companyDetailPage.completeCompanyDetails({
      companyDetails: currentCompanyDetails,
    });
    await companyDetailPage.proceedToContinue();
    employeeDetails =
      await employeePage.completeEmployeeDetailSkippedConnection();
    await estimatePage.waitForEstimatePageLoadingComplete();
    await estimatePage.proceedToContinue();

    const companyTokenInfo = await getTokenByGivenTestSession(page);
    // await dashboardPage.navigateToTab('Dashboard')
    await dashboardPage.navigateToQualifyViaStartSaving();
    await qualifyingPage.completeQualifyingProcess(deferredIncomeTaxAnswers);
    await randDActivities.handleRandDCreditType("deferred");
    await randDActivities.completeRandDActivitiesQuestions();
    await randDActivities.completeFinalizingQualifyingQuestions();
    await randDActivities.proceedToReview();

    //Review and accept order with credit card entry
    await billingPage.reviewAndAccept("Federal R&D Tax Credit");
    await billingPage.handleAllSetPrompt();

    let url = page.url();
    await updateProgramStage(
      companyTokenInfo.programId!,
      companyTokenInfo.token,
      url
    );
    await updateProgramSubstage(
      companyTokenInfo.programId!,
      companyTokenInfo.token,
      url
    );
  });

  test("complete Expense Classification flow with finch connection step", async () => {
    // await loginPage.logIn(newUser.email, newUser.password);
    await dashboardPage.proceedToCreditClassification();
    if (await ecOverviewAndIntegrationsPage.isCurrentlyActive()) {
      await ecOverviewAndIntegrationsPage.validateConnectedState(false);
      await ecOverviewAndIntegrationsPage.selectPayRollNotListedOption();
      await ecOverviewAndIntegrationsPage.proceedToContinue();
      await ecCompanyDetailsPage.waitForPageToBeActive(
        ecCompanyDetailsPage.pageTitle
      );
    }
  });

  test("make sure user can complete overview & integratios flow", async () => {
    let confirmCompanyDetail: ConfirmCompanyDetails =
      ECCompanyDetailsPage.buildDefaultConfirmCompanyDetailAnswers();
    await dashboardPage.proceedToCreditClassification();
    if (await ecCompanyDetailsPage.isCurrentlyActive()) {
      const questionCount =
        await ecCompanyDetailsPage.confirmInfoIsStillAccurate(
          confirmCompanyDetail
        );
      await ecCompanyDetailsPage.continueToNextQuestion();
      await ecCompanyDetailsPage.confirmCompanyDetailAnswers(
        qualifyingPage.buildDefaultQualifyingAnswer(),
        confirmCompanyDetail,
        employeeDetails,
        questionCount
      );
      await ecSuppliesAndServicesPage.waitForPageToBeActive(
        ecSuppliesAndServicesPage.pageTitle
      );
    }
  });

  test("make sure user can complete supplies and services flow", async () => {
    await dashboardPage.proceedToCreditClassification();
    if (await ecSuppliesAndServicesPage.isCurrentlyActive()) {
      await ecSuppliesAndServicesPage.completeSuppliesAndServicesForm();
      await ecEmployeesPage.waitForPageToBeActive(ecEmployeesPage.pageTitle);
    }
  });

  test("make sure user can complete employee flow", async () => {
    await dashboardPage.proceedToCreditClassification();
    // if (await ecEmployeesPage.isCurrentlyActive()) {
    const employees: EmployeePersonalDetails =
      await ecEmployeesPage.addEmployees();
    const displayedEmployees =
      await ecEmployeesPage.extractEmployeeInfoFromTable();
    await ecEmployeesPage.confirmEmployees();
    let validatedEmployees = ecEmployeesPage.validateEmployeeList(
      employees,
      displayedEmployees
    );
    validatedEmployees =
      ecEmployeesPage.addAdditionalPersonalInfo(validatedEmployees);

    const contractors: ContractorPersonalDetails =
      await ecEmployeesPage.addContractors();
    const displayContractors =
      await ecEmployeesPage.extractContractorInfoFromTable();
    await ecEmployeesPage.confirmContractors();
    const validatedContractors = ecEmployeesPage.validateContractorList(
      contractors,
      displayContractors
    );
    // await ecEmployeesPage.validateIndividualActivitiesCallouts();
    await ecEmployeesPage.confirmIndividualDetails(
      validatedEmployees,
      validatedContractors
    );
    await ecEmployeesPage.submitForExpertReview();
    await ecExpertReviewPage.waitForPageToBeActive(
      ecExpertReviewPage.pageTitle
    );

    await ecExpertReviewPage.validateSubmittedText();
    await ecExpertReviewPage.claimUmbrella();
    await ecExpertReviewPage.returnToDashBoard();
  });
});
