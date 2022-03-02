import { test, Page } from "@playwright/test";
import { LoginPage } from "../../pages/LoginPage";
import { AccountsPage } from "../../pages/AccountsPage";
import { CompanyDetailPage } from "../../pages/CompanyDetailPage";
import { ConnectPayrollPage } from "../../pages/ConnectPayrollPage";
import { EstimatePage } from "../../pages/EstimatePage";
import { EmployeePage } from "../../pages/EmployeePage";
import { getCurrentYear } from "../../helpers/Utils";

test.describe(
  "validate onboarding process with 2021 as incorporation year",
  () => {
    let connectPayRollPage: ConnectPayrollPage;
    let loginPage: LoginPage;
    let accountsPage: AccountsPage;
    let companyDetailPage: CompanyDetailPage;
    let employeePage: EmployeePage;
    let estimatePage: EstimatePage;
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
    });

    const expectedItemizedEstimate = [
      "$4,500–$5,000",
      "Federal R&D Tax Credit",
      "$900–$1,000",
      "Georgia R&D Tax Credit",
      "$810–$900",
      "Arizona R&D Tax Credit",
    ];

    const expectedTotal = ["$6,210–$6,900", "Across 3 credits and incentives."];

    test(`completing Onboarding process with incorporation year ${
      getCurrentYear() - 1
    }`, async () => {
      const newUser = await accountsPage.createDefaultNewAccount(
        `${getCurrentYear() - 1}GAAZ`
      );
      console.log(
        `created new user: ${newUser.firstName} ${newUser.lastName}, ${newUser.email}`
      );
      // await loginPage.logIn('qamainstreet+1642902014@gmail.com', 'Temp12345')
      const defaultCompanyDetails = CompanyDetailPage.buildDefaultCompanyDetail(
        { yearofIncorporation: getCurrentYear() - 1 }
      );

      //await connectPayRollPage.skipPayRollConnection()
      await connectPayRollPage.makePayRollSelection();

      await companyDetailPage.completeCompanyDetails({
        companyDetails: defaultCompanyDetails,
      });
      await companyDetailPage.proceedToContinue();

      let employeeDetail = EmployeePage.buildDefaultEmployeeDetails();
      employeeDetail.mostRAndDStates = ["Georgia", "Arizona"];
      await employeePage.completeEmployeeDetailAfterFinch(employeeDetail);

      // await estimatePage.handleNoPayrollFoundQuestions(employeeDetail);
      await estimatePage.validateCreditEstimateContent(
        defaultCompanyDetails.buzName,
        expectedTotal,
        expectedItemizedEstimate
      );
      await estimatePage.proceedToContinue();
    });
  }
);
