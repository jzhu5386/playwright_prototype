import { test, Page } from "@playwright/test";
import { LoginPage } from "../../pages/LoginPage";
import { AccountsPage } from "../../pages/AccountsPage";
import { CompanyDetailPage } from "../../pages/CompanyDetailPage";
import { ConnectPayrollPage } from "../../pages/ConnectPayrollPage";
import { EstimatePage } from "../../pages/EstimatePage";
import { EmployeePage } from "../../pages/EmployeePage";
import { getCurrentYear } from "../../helpers/Utils";

test.describe("check account creation success", () => {
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
    loginPage = new LoginPage(page);
    accountsPage = new AccountsPage(page);
    connectPayRollPage = new ConnectPayrollPage(context, page);
    companyDetailPage = new CompanyDetailPage(page);
    employeePage = new EmployeePage(page);
    estimatePage = new EstimatePage(page);
  });

  const expectedItemizedEstimate = [
    "$45,000–$50,000",
    "Federal R&D Tax Credit",
    "$33,750–$37,500",
    "California Research Credit",
    "$4,500–$5,000",
    "Massachusetts Research Credit",
  ];

  const expectedTotal = ["$83,250–$92,500", "Across 3 credits and incentives."];

  test.skip(`completing Onboarding process with incorporatio year ${getCurrentYear()}`, async () => {
    const newUser = await accountsPage.createDefaultNewAccount(
      `currentYearonBoarding`
    );
    console.log(
      `created new user: ${newUser.firstName} ${newUser.lastName}, ${newUser.email}`
    );
    // await loginPage.logIn('qamainstreet+1642902014@gmail.com', 'Temp12345')
    const defaultCompanyDetails = CompanyDetailPage.buildDefaultCompanyDetail({
      yearofIncorporation: getCurrentYear(),
    });

    //await connectPayRollPage.skipPayRollConnection()
    await connectPayRollPage.makePayRollSelection();

    await companyDetailPage.completeCompanyDetails({
      companyDetails: defaultCompanyDetails,
    });
    await companyDetailPage.proceedToContinue();

    // let employeeDetail = EmployeePage.buildDefaultEmployeeDetails()
    let employeeDetail = await employeePage.completeEmployeeDetailAfterFinch();
    await estimatePage.handleNoPayrollFoundQuestions(employeeDetail);
    await estimatePage.validateCreditEstimateContent(
      defaultCompanyDetails.buzName,
      expectedTotal,
      expectedItemizedEstimate
    );
    await estimatePage.proceedToContinue();
  });
});
