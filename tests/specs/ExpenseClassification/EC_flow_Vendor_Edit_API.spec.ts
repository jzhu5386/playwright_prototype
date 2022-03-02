import {
  test,
  Page,
  APIRequestContext,
  BrowserContext,
} from "@playwright/test";
import { LoginPage } from "../../pages/LoginPage";
import { AccountsPage } from "../../pages/AccountsPage";
import { QualifyPage } from "../../pages/QualifyPage";
import { DashboardPage } from "../../pages/DashboardPage";
import {
  CompanyTokenInfo,
  ConfirmCompanyDetails,
  ContractorPersonalDetails,
  EmployeeDetails,
  EmployeePersonalDetails,
  User,
  VendorInfo,
} from "../../helpers/TestObjects";
import { ECOverviewAndIntegrationsPage } from "../../pages/ECOverviewAndIntegrationsPage";
import { ECCompanyDetailsPage } from "../../pages/ECCompanyDetailsPage";
import { ECSuppliesAndServicesPage } from "../../pages/ECSuppliesAndServicesPage";
import { ECEmployeesPage } from "../../pages/ECEmployeesPage";
import { ECExpertReviewPage } from "../../pages/ECExpertReviewPage";
import {
  createNewUserAPI,
  extractProgramIDAPI,
  handleQualificationQuestionSets,
  irsTestPartFourAPI,
  setCompanyDetailAPI,
  setEmployeeDetailsAPI,
  setPayrollConnectionAPI,
  setProgramStageAPI,
  setProgramSubStageAPI,
} from "../../helpers/OnboardingAPIActions";
import {
  getTokenByGivenTestSession,
  getTokenViaServiceAccount,
} from "../../helpers/TokenHelpers";
import { CompanyDetailPage } from "../../pages/CompanyDetailPage";
import { getCurrentYear } from "../../helpers/Utils";
import { EmployeePage } from "../../pages/EmployeePage";

test.describe.serial("EC flow VendorInfo label:SMOKE", () => {
  let loginPage: LoginPage;
  let dashboardPage: DashboardPage;
  let qualifyingPage: QualifyPage;
  let ecOverviewAndIntegrationsPage: ECOverviewAndIntegrationsPage;
  let ecCompanyDetailsPage: ECCompanyDetailsPage;
  let ecSuppliesAndServicesPage: ECSuppliesAndServicesPage;
  let ecEmployeesPage: ECEmployeesPage;
  let employeeDetails: EmployeeDetails;
  let ecExpertReviewPage: ECExpertReviewPage;
  let newUser: User;
  let page: Page;
  let context: BrowserContext;

  const timestamp = Math.floor(Date.now() / 1000);
  let apiContext: APIRequestContext;

  test.beforeAll(async ({ playwright, browser }) => {
    context = await browser.newContext();
    page = await context.newPage();
    let accountsPage = new AccountsPage(page);
    let companyDetailsPage = new CompanyDetailPage(page);
    let employeeDetailsPage = new EmployeePage(page);
    let logIn = new LoginPage(page);
    ecOverviewAndIntegrationsPage = new ECOverviewAndIntegrationsPage(
      context,
      page
    );
    ecSuppliesAndServicesPage = new ECSuppliesAndServicesPage(page);
    ecCompanyDetailsPage = new ECCompanyDetailsPage(page);
    ecEmployeesPage = new ECEmployeesPage(context, page);
    ecExpertReviewPage = new ECExpertReviewPage(context, page);
    dashboardPage = new DashboardPage(page);
    qualifyingPage = new QualifyPage(page);

    apiContext = await playwright.request.newContext({
      // All requests we send go to this API endpoint.
      baseURL: "https://dashboard.staging.mainstreet.com",
    });

    newUser = accountsPage.buildDefaultUserInfo({ prefix: "FinchManualEC" });
    let companyId = await createNewUserAPI(apiContext, newUser);

    await logIn.logIn(newUser.email, newUser.password);
    const companyInfo: CompanyTokenInfo = await getTokenByGivenTestSession(
      page
    );
    // const jwtToken = await getTokenViaServiceAccount();
    apiContext = await playwright.request.newContext({
      // All requests we send go to this API endpoint.
      baseURL: "https://dashboard.staging.mainstreet.com",
      extraHTTPHeaders: {
        baseURL: "https://dashboard.staging.mainstreet.com",
        Authorization: companyInfo.token,
      },
    });

    await setPayrollConnectionAPI(apiContext, "Gusto");
    await setCompanyDetailAPI(
      apiContext,
      CompanyDetailPage.buildDefaultCompanyDetail({
        timestamp: timestamp,
        yearofIncorporation: getCurrentYear() - 3,
      })
    );
    await setEmployeeDetailsAPI(
      apiContext,
      EmployeePage.buildDefaultEmployeeDetails()
    );
    await handleQualificationQuestionSets(apiContext, companyInfo.companyId);
    await irsTestPartFourAPI(apiContext);
    const programId = await extractProgramIDAPI(apiContext);
    await setProgramStageAPI(apiContext, programId, "expense_classification");
    await setProgramSubStageAPI(
      apiContext,
      programId,
      "expense_classification_overview"
    );
  });

  test.afterAll(async ({}) => {
    await apiContext.dispose();
  });

  test("complete Expense Classification flow skip connection step", async () => {
    // await loginPage.logIn(newUser.email, newUser.password);
    await dashboardPage.goto();
    await dashboardPage.proceedToCreditClassification();
    if (await ecOverviewAndIntegrationsPage.isCurrentlyActive()) {
      // await ecOverviewAndIntegrationsPage.validateConnectedState(false);
      // // await ecOverviewAndIntegrationsPage.addNewPayRollConnection("Gusto");
      // await ecOverviewAndIntegrationsPage.makePayRollSelection({
      //   payRollName: "Gusto",
      // });
      // // await ecOverviewAndIntegrationsPage.complete_finch_connection();
      // await ecOverviewAndIntegrationsPage.validateConnectedState(true, "Gusto");
      await ecOverviewAndIntegrationsPage.validateConnectedState(false);
      await ecOverviewAndIntegrationsPage.selectPayRollNotListedOption();
      await ecOverviewAndIntegrationsPage.proceedToContinue();
      await ecCompanyDetailsPage.waitForPageToBeActive(
        ecCompanyDetailsPage.pageTitle
      );
    }
  });

  test("Complete confirm qualifying questions with manual gross reciepts upload", async () => {
    let confirmCompanyDetail: ConfirmCompanyDetails =
      ECCompanyDetailsPage.buildDefaultConfirmCompanyDetailAnswers();
    // await dashboardPage.proceedToCreditClassification();
    if (await ecCompanyDetailsPage.isCurrentlyActive()) {
      const questionCount =
        await ecCompanyDetailsPage.confirmInfoIsStillAccurate(
          confirmCompanyDetail
        );
      await ecCompanyDetailsPage.continueToNextQuestion();
      await ecCompanyDetailsPage.confirmCompanyDetailAnswers(
        qualifyingPage.buildDefaultQualifyingAnswer(),
        confirmCompanyDetail,
        EmployeePage.buildDefaultEmployeeDetails(),
        questionCount
      );
      await ecSuppliesAndServicesPage.waitForPageToBeActive(
        ecSuppliesAndServicesPage.pageTitle
      );
    }
  });

  test("complete supplies and services with additiona venndor info and then return to edit vendor info", async () => {
    // await dashboardPage.proceedToCreditClassification();
    if (await ecSuppliesAndServicesPage.isCurrentlyActive()) {
      const supplyServiceAnswer =
        await ecSuppliesAndServicesPage.completeSuppliesAndServicesForm();
      await ecEmployeesPage.waitForPageToBeActive(ecEmployeesPage.pageTitle);

      await ecEmployeesPage.navigateBackInEC();
      const cloudVendor: VendorInfo[] = [
        {
          vendorName: "AWSEdited",
          vendorSpending: "9000",
          receipts: ["cloud_receipts.jpg"],
        },
      ];

      await ecSuppliesAndServicesPage.editVendorInfo(
        supplyServiceAnswer.cloudVendorInfo!,
        cloudVendor,
        "cloud"
      );
      await ecSuppliesAndServicesPage.proceedToContinue();
    }
  });

  test("Add 2 employees, 2 contractors to trigger paging and confirm details", async () => {
    // await dashboardPage.proceedToCreditClassification();
    // if (await ecEmployeesPage.isCurrentlyActive()) {
    const employees: EmployeePersonalDetails =
      await ecEmployeesPage.addEmployees(2);
    const displayedEmployees =
      await ecEmployeesPage.extractEmployeeInfoFromTable();
    await ecEmployeesPage.confirmEmployees();
    const validatedEmployees = await ecEmployeesPage.validateEmployeeList(
      employees,
      displayedEmployees
    );

    const contractors: ContractorPersonalDetails =
      await ecEmployeesPage.addContractors(2);
    const displayContractors =
      await ecEmployeesPage.extractContractorInfoFromTable();
    await ecEmployeesPage.confirmContractors();
    const validatedContractors = ecEmployeesPage.validateContractorList(
      contractors,
      displayContractors
    );
    await ecEmployeesPage.validateIndividualActivitiesCallouts();
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
