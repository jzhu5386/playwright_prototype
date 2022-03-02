import { test, Page } from "@playwright/test";
import path from "path";
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
  SuppliesAndServices,
  User,
} from "../../helpers/TestObjects";
import { BillingPage } from "../../pages/BillingPage";
import { ECOverviewAndIntegrationsPage } from "../../pages/ECOverviewAndIntegrationsPage";
import { ECCompanyDetailsPage } from "../../pages/ECCompanyDetailsPage";
import { ECSuppliesAndServicesPage } from "../../pages/ECSuppliesAndServicesPage";
import { ECEmployeesPage } from "../../pages/ECEmployeesPage";
import { ECExpertReviewPage } from "../../pages/ECExpertReviewPage";
import { generateRandomNumber, getCurrentYear } from "../../helpers/Utils";
import { OpsCompanyPage } from "../../pages/OpsCompanyPage";

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
        "RipplingUploadEC",
        timestamp
      );
      console.log(
        `created new user: ${newUser.firstName} ${newUser.lastName}, ${newUser.email}`
      );
    } else {
      loginPage.logIn(newUser.email, newUser.password);
    }
    // await loginPage.logIn(
    //   "qamainstreet+FinchEC1644178206@gmail.com",
    //   "Temp12345"
    // );
  });

  test("Setup user with no finch connection, qualified for QSB with Gusto Connection ", async () => {
    await connectPayRollPage.makePayRollSelection({ payRollName: "Gusto" });
    let currentCompanyDetails = CompanyDetailPage.buildDefaultCompanyDetail({
      timestamp: timestamp,
      yearofIncorporation: getCurrentYear() - 5,
    });
    await companyDetailPage.completeCompanyDetails({
      companyDetails: currentCompanyDetails,
    });
    await companyDetailPage.proceedToContinue();
    employeeDetails =
      await employeePage.completeEmployeeDetailsBasedOnPayrollConnection(
        "Gusto"
      );
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

    await opsPage.updateProgramStage();
    await opsPage.updateProgramSubstage();
  });

  test("adding additional Rippling connection", async () => {
    // await loginPage.logIn(newUser.email, newUser.password);
    await dashboardPage.proceedToCreditClassification();
    if (await ecOverviewAndIntegrationsPage.isCurrentlyActive()) {
      await ecOverviewAndIntegrationsPage.validateConnectedState(true);
      await ecOverviewAndIntegrationsPage.addNewPayRollConnection("Rippling");
      await ecOverviewAndIntegrationsPage.validateConnectedState(
        true,
        "Rippling"
      );
      await ecOverviewAndIntegrationsPage.proceedToContinue();
      await ecCompanyDetailsPage.waitForPageToBeActive(
        ecCompanyDetailsPage.pageTitle
      );
    }
  });

  test("company detail confirmation upload tax form", async () => {
    let confirmCompanyDetail: ConfirmCompanyDetails =
      ECCompanyDetailsPage.buildDefaultConfirmCompanyDetailAnswers();
    confirmCompanyDetail.taxFiles = [
      path.join(__dirname, "../../resources/testFiles/2019_taxform.pdf"),
      path.join(__dirname, "../../resources/testFiles/2020_taxform.pdf"),
    ];

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

  test("supplies and services flow, no to first two answers", async () => {
    await dashboardPage.proceedToCreditClassification();
    const supplyServiceAnswers: SuppliesAndServices = {
      spend10kMoreCloudComputing: "No",
      spend10kMoreRDSupplies: "No",
      moreThanOneRDProject: "Yes, we have one R&D project",
      mainRDProjectDescription: "Manufacture physical products",
      mainProjectName: `Project x ${
        timestamp === undefined
          ? generateRandomNumber(2000, 2000000)
          : timestamp
      }`,
    };
    if (await ecSuppliesAndServicesPage.isCurrentlyActive()) {
      await ecSuppliesAndServicesPage.completeSuppliesAndServicesForm({
        suppliesAndServicesAnswer: supplyServiceAnswers,
      });
      await ecEmployeesPage.waitForPageToBeActive(ecEmployeesPage.pageTitle);
    }
  });

  test("Employees only, majority owner", async () => {
    await dashboardPage.proceedToCreditClassification();
    // if (await ecEmployeesPage.isCurrentlyActive()) {
    const employees: EmployeePersonalDetails =
      await ecEmployeesPage.addEmployees(3);
    const displayedEmployees =
      await ecEmployeesPage.extractEmployeeInfoFromTable();
    const validateEmployeeList = ecEmployeesPage.validateEmployeeList(
      employees,
      displayedEmployees
    );
    await ecEmployeesPage.confirmEmployees();

    await ecEmployeesPage.confirmContractors();
    await ecEmployeesPage.validateIndividualActivitiesCallouts();
    await ecEmployeesPage.confirmIndividualDetails(
      validateEmployeeList
      // displayContractors
    );
    await ecEmployeesPage.submitForExpertReview();
    await ecExpertReviewPage.waitForPageToBeActive(
      ecExpertReviewPage.pageTitle
    );

    //check claim embrella page and expert review text
    await ecExpertReviewPage.validateSubmittedText();
    await ecExpertReviewPage.claimUmbrella();
    await ecExpertReviewPage.returnToDashBoard();
    // }
  });
});
