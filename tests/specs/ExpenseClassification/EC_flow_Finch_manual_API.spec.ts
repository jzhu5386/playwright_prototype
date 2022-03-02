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
  setupUserInECState,
} from "../../helpers/OnboardingAPIActions";
import { getTokenByGivenTestSession } from "../../helpers/TokenHelpers";
import { EmployeePage } from "../../pages/EmployeePage";

test.describe.serial("EC flow basic label:SMOKE", () => {
  let dashboardPage: DashboardPage;
  let qualifyingPage: QualifyPage;
  let ecOverviewAndIntegrationsPage: ECOverviewAndIntegrationsPage;
  let ecCompanyDetailsPage: ECCompanyDetailsPage;
  let ecSuppliesAndServicesPage: ECSuppliesAndServicesPage;
  let ecEmployeesPage: ECEmployeesPage;
  let ecExpertReviewPage: ECExpertReviewPage;
  let newUser: User;
  let page: Page;
  let context: BrowserContext;

  const timestamp = Math.floor(Date.now() / 1000);
  let apiContext: APIRequestContext;

  test.beforeAll(async ({ playwright, browser, baseURL }) => {
    context = await browser.newContext();
    page = await context.newPage();
    let accountsPage = new AccountsPage(page);
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

    // this is the part where we setup inital apiContext to create a new user via api calls
    apiContext = await playwright.request.newContext({
      // All requests we send go to this API endpoint.
      baseURL: baseURL,
    });

    // build out a random user info and create new user using API call
    newUser = accountsPage.buildDefaultUserInfo({ prefix: "FinchManualEC" });
    let companyId = await createNewUserAPI(apiContext, newUser);

    // now login the user and monitor for company/current call so we can obtain information
    // about the compnay we just created: comppanyID, programID, session and url
    await logIn.logIn(newUser.email, newUser.password);
    const companyInfo: CompanyTokenInfo = await getTokenByGivenTestSession(
      page
    );

    // update apiContext so it also contains token so it's authenticated
    // as that company
    apiContext = await playwright.request.newContext({
      // All requests we send go to this API endpoint.
      baseURL: baseURL,
      extraHTTPHeaders: {
        baseURL: baseURL!,
        Authorization: companyInfo.token,
      },
    });

    // calling the wrapper method that would call a series of API calls to setup
    // user to qualified state with EC turned on
    await setupUserInECState(
      apiContext,
      EmployeePage.buildDefaultEmployeeDetails(),
      companyInfo,
      timestamp
    );
  });

  test.afterAll(async ({}) => {
    await context.close();
    await apiContext.dispose();
  });

  test("complete Expense Classification flow with finch connection step", async () => {
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

  test("complete supplies and services flow with Yes to trigger additional questions", async () => {
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

  test("Add 6 employees, 6 contractors to trigger paging and confirm details", async () => {
    // await dashboardPage.proceedToCreditClassification();
    // if (await ecEmployeesPage.isCurrentlyActive()) {
    const employees: EmployeePersonalDetails =
      await ecEmployeesPage.addEmployees(6);
    const displayedEmployees =
      await ecEmployeesPage.extractEmployeeInfoFromTable();
    await ecEmployeesPage.confirmEmployees();
    const validatedEmployees = await ecEmployeesPage.validateEmployeeList(
      employees,
      displayedEmployees
    );

    const contractors: ContractorPersonalDetails =
      await ecEmployeesPage.addContractors(6);
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
