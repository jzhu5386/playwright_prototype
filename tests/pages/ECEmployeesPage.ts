import { BrowserContext, expect, Locator, Page } from "@playwright/test";
import {
  ContractorPersonalDetail,
  ContractorPersonalDetails,
  EmployeeDetails,
  EmployeePersonalDetail,
  EmployeePersonalDetails,
  questionMap,
} from "../helpers/TestObjects";
import {
  convertState,
  generateRandomNumber,
  scrollElementIntoView,
  selectRandom,
} from "../helpers/Utils";
import { CommonOperations } from "./CommonOperations";

export class ECEmployeesPage extends CommonOperations {
  readonly page: Page;
  readonly pageTitle: string;
  readonly context: BrowserContext;
  readonly addEmployeeButton: Locator;
  readonly addEmployeeEmptyState: Locator;
  readonly confirmEmployeeButton: Locator;
  readonly addContractorButton: Locator;
  readonly confirmContractorButton: Locator;
  readonly sideDrawerContainer: Locator;
  readonly fullNameInput: Locator;
  readonly role: Locator;
  readonly jobGroup: Locator;
  readonly contractorJobGroup: Locator;
  readonly salary: Locator;
  readonly state: Locator;
  readonly employeeSaveButton: Locator;
  readonly contractorSaveButton: Locator;
  readonly allCompanyIncludedInTableQuestion: Locator;
  readonly allContractorsIncludedInTableQuestion: Locator;
  readonly confirmDetailsButton: Locator;
  readonly submitForExperReviewButton: Locator;
  readonly employeeTableRoot: Locator;
  readonly contractorTableRoot: Locator;
  readonly remainingEmployeeToConfirm: Locator;
  readonly activitySliderBar: Locator;
  readonly activitySliderThumb: Locator;
  readonly activityInput: Locator;
  readonly employeeIndividualInfo: Locator;
  readonly majorityOwner: Locator;
  readonly addNewActivities: Locator;

  constructor(context: BrowserContext, page: Page) {
    super(page);
    this.page = page;
    this.pageTitle = "Employees";
    this.context = context;
    this.addEmployeeButton = this.page.locator(
      "data-testid=employee-secondary-action"
    );
    this.addEmployeeEmptyState = this.page.locator(
      'button[aria-label="Add employee"]'
    );
    this.confirmEmployeeButton = this.page.locator(
      "data-testid=employee-primary-action"
    );
    this.addContractorButton = this.page.locator(
      'button[aria-label="Add contractor"]'
    );
    this.confirmContractorButton = this.page.locator(
      "data-testid=contractor-primary-action"
    );
    this.sideDrawerContainer = this.page.locator(
      'div[class*="SideDrawer__container"]'
    );
    this.fullNameInput = this.page.locator("#full-name");
    this.role = this.page.locator("#role");
    this.jobGroup = this.page.locator(
      "data-testid=jobGroup-employee-textfield"
    );
    this.contractorJobGroup = this.page.locator(
      "data-testid=jobGroup-contractor-textfield"
    );
    this.salary = this.page.locator("#amount-paid");
    this.state = this.page.locator("data-testid=state-w2employee");
    this.employeeSaveButton = this.page.locator(
      "data-testid=employee-side-drawer-save-button"
    );
    this.contractorSaveButton = this.page.locator(
      "data-testid=contractor-side-drawer-save-button"
    );
    this.allCompanyIncludedInTableQuestion = this.page.locator(
      `p:text("${questionMap.allEmployeeIncludedInTable}")`
    );
    this.allContractorsIncludedInTableQuestion = this.page.locator(
      `p:text("${questionMap.allContractorsIncludedInTable}")`
    );
    this.confirmDetailsButton = this.page.locator(
      'button[aria-label="Confirm details"]'
    );
    this.employeeTableRoot = this.page.locator(
      `div[class*="Card__container"]:has(:text("${questionMap.allEmployeeIncludedInTable}"))`
    );
    this.contractorTableRoot = this.page.locator(
      `div[class*="Card__container"]:has(:text("${questionMap.allContractorsIncludedInTable}"))`
    );
    this.submitForExperReviewButton = this.page.locator(
      "data-testid=continue-button"
    );
    this.remainingEmployeeToConfirm = this.page.locator(
      'p:has-text("MORE EMPLOYEES TO CONFIRM")'
    );
    this.activitySliderBar = this.page
      .locator('span[class^="MuiSlider-root"]')
      .last();
    this.activitySliderThumb = this.page
      .locator('span[class^="MuiSlider-thumb"]')
      .last();
    this.activityInput = this.page
      .locator('span[class*="TextField__input"] input:not([type="hidden"])')
      .last();
    this.employeeIndividualInfo = this.page
      .locator('div[class^="Card__container"] div.info')
      .last();
    this.majorityOwner = this.page
      .locator(
        'label[class*="Checkbox__container"]:has-text("This employee owns more than 50% of the company")'
      )
      .last();
    this.addNewActivities = this.page
      .locator('button:has-text("Add activity")')
      .last();
  }

  async isCurrentlyActive(): Promise<boolean> {
    const step = await this.activeStep();
    return step === this.pageTitle;
  }

  async addEmployees(
    count: number = 3,
    employeeList?: EmployeePersonalDetails
  ): Promise<EmployeePersonalDetails> {
    if (employeeList === undefined) {
      const existingEmployees = await this.extractEmployeeInfoFromTable();
      employeeList = await this.buildDefaultEmployeeList(count);
    }

    for (let i = 0; i < employeeList!.length; i++) {
      if (await this.addEmployeeButton.isVisible()) {
        this.addEmployeeButton.click();
      } else {
        this.addEmployeeEmptyState.click();
      }

      let employee: EmployeePersonalDetail = employeeList![i];
      await this.sideDrawerContainer.waitFor();
      await this.fullNameInput.type(employee.fullName);
      await this.role.type(employee.role);
      await this.jobGroup.click();
      await this.page.waitForSelector("#dropdown-list li>span");
      await this.page.waitForTimeout(1000);
      await this.page.click(
        `#dropdown-list li>span:text-is("${employee.jobGroup}")`
      );
      await this.salary.type(employee.salary);
      await this.state.click();
      await this.page.waitForSelector("#dropdown-list li>span");
      await this.page.click(
        `#dropdown-list li>span:text-is("${employee.state}")`
      );
      await this.employeeSaveButton.click();
      await this.sideDrawerContainer.waitFor({ state: "hidden" });
    }
    return employeeList;
  }

  async addContractors(
    count: number = 3,
    contractorList?: ContractorPersonalDetails
  ): Promise<ContractorPersonalDetails> {
    if (contractorList === undefined) {
      contractorList = await this.buildDefaultContractorList(count!);
    }
    for (let i = 0; i < contractorList!.length; i++) {
      this.addContractorButton.click();
      let employee: ContractorPersonalDetail = contractorList![i];
      await this.sideDrawerContainer.waitFor();
      await this.fullNameInput.type(employee.fullName);
      await this.role.type(employee.role);
      await this.contractorJobGroup.click();
      await this.page.waitForSelector("#dropdown-list li>span");
      await this.page.click(
        `#dropdown-list li>span:text-is("${employee.jobGroup}")`
      );
      await this.salary.type(employee.salary);
      await this.page.click(`span:text("${employee.payType}")`);
      await this.state.click();
      await this.page.waitForSelector("#dropdown-list li>span");
      await this.page.click(
        `#dropdown-list li>span:text-is("${employee.state}")`
      );
      await this.contractorSaveButton.click();
      await this.sideDrawerContainer.waitFor({ state: "hidden" });
    }
    return contractorList;
  }

  /**
   * this method does two things:
   * 1. validates info extracted from dislay table matches original input.
   * 2. transfers RDpercentage, newActivities and Majority owner flags onto displayed list
   * so that it can used in later steps
   * @param originalList
   * @param foundList
   * @returns
   */
  validateEmployeeList(
    originalList: EmployeePersonalDetails,
    foundList: EmployeePersonalDetails
  ): EmployeePersonalDetails {
    expect(originalList.length).toBeLessThanOrEqual(foundList.length);
    for (let i = 0; i < foundList.length; i++) {
      if (foundList[i].fullName === "Augusta Ada Lovelace") {
        foundList[i].RDPercentage = (
          Math.floor(generateRandomNumber(0, 101) / 5) * 5
        ).toString();
      } else {
        let found = false;
        let index = 0;
        while (index < originalList.length) {
          if (originalList[index].fullName === foundList[i].fullName) {
            // transfer rdpercentge, majority owner and additional activities onto the final list
            foundList[i].RDPercentage = originalList[index].RDPercentage;
            if (originalList[index].majorityOwner !== undefined) {
              foundList[i].majorityOwner = originalList[index].majorityOwner;
            }
            if (originalList[index].additionalActivies !== undefined) {
              foundList[i].additionalActivies =
                originalList[index].additionalActivies;
            }

            // validate roles/jobgroups are equal, validate info is saved properly
            expect(originalList[index].role).toEqual(foundList[i].role);
            if (originalList[index].jobGroup === "Engineer") {
              expect(foundList[i].jobGroup).toEqual("Engineer Non Software");
            } else {
              expect(originalList[index].jobGroup).toEqual(
                foundList[i].jobGroup
              );
            }
            found = true;
            break;
          }
          index++;
        }
        expect(found).toBeTruthy;
      }
    }
    return foundList;
  }

  /**
   * This method does two things:
   * 1. validates role/jobGroups are identical between info extracted from contractor
   * table vs original input
   * 2. merge additional info in origional list such as RDPercentage, majorityOwner and
   * Additional Activities for later use
   * @param originalList
   * @param foundList
   * @returns
   */
  validateContractorList(
    originalList: ContractorPersonalDetails,
    foundList: ContractorPersonalDetails
  ): ContractorPersonalDetails {
    expect(originalList.length).toEqual(foundList.length);
    for (let i = 0; i < foundList.length; i++) {
      if (originalList[i].fullName === foundList[i].fullName) {
        foundList[i].RDPercentage = originalList[i].RDPercentage;
        if (originalList[i].majorityOwner !== undefined) {
          foundList[i].majorityOwner = originalList[i].majorityOwner;
        }
        if (originalList[i].additionalActivies !== undefined) {
          foundList[i].additionalActivies = originalList[i].additionalActivies;
        }
        // validate roles/jobgroups are equal, validate info is saved properly
        expect(originalList[i].role).toEqual(foundList[i].role);
        if (originalList[i].jobGroup === "Engineer") {
          expect(foundList[i].jobGroup).toEqual("Engineer Non Software");
        } else {
          expect(originalList[i].jobGroup).toEqual(foundList[i].jobGroup);
        }
      } else {
        console.log(`${foundList[i].fullName} not found in original list!!!`);
      }
    }
    return foundList;
  }

  async extractEmployeeInfoFromTable(): Promise<EmployeePersonalDetails> {
    let employeeDetails: EmployeePersonalDetails = [];
    await this.employeeTableRoot.waitFor();
    if (await this.employeeTableRoot.locator("tbody").isVisible()) {
      await this.goToFirstPage(this.employeeTableRoot);
      let employeeList: string[][] = await this.extractInfoFromTable(
        this.employeeTableRoot
      );
      for (let i = 0; i < employeeList.length; i++) {
        let newEmployee: EmployeePersonalDetail = {
          fullName: employeeList[i][0],
          role: employeeList[i][1],
          jobGroup: employeeList[i][2],
          salary: employeeList[i][3].replace(/[^0-9]/g, ""),
          state: convertState(employeeList[i][4]),
          // RDPercentage: generateRandomNumber(10, 100).toString(),
        };
        employeeDetails.push(newEmployee);
      }
      // console.log(employeeList.length);
    }
    return employeeDetails;
  }

  async extractContractorInfoFromTable(): Promise<ContractorPersonalDetails> {
    let contractorPersonalDetails: ContractorPersonalDetails = [];
    if (await this.contractorTableRoot.locator("tbody").isVisible()) {
      let contractorList: string[][] = await this.extractInfoFromTable(
        this.contractorTableRoot
      );
      for (let i = 0; i < contractorList.length; i++) {
        let newContractor: ContractorPersonalDetail = {
          fullName: contractorList[i][0],
          role: contractorList[i][1],
          jobGroup: contractorList[i][2],
          salary: contractorList[i][3].replace(/[^0-9]/g, ""),
          payType: contractorList[i][4],
          state: convertState(contractorList[i][5]),
          // RDPercentage: generateRandomNumber(10, 100).toString(),
        };
        contractorPersonalDetails.push(newContractor);
      }
    }
    return contractorPersonalDetails;
  }

  async pageNext(tableRoot: Locator): Promise<boolean> {
    if (
      (await tableRoot.locator('button p:text-is("Next")').isVisible()) &&
      (await tableRoot.locator('button p:text-is("Next")').isEnabled())
    ) {
      await tableRoot.locator('button p:text-is("Next")').click();
      return true;
    }
    return false;
  }

  async goToFirstPage(tableRoot: Locator) {
    if (await tableRoot.locator('button:text-is("1")').isVisible()) {
      await tableRoot.locator('button:text-is("1")').click();
    }
  }

  async extractInfoFromTable(tableRoot: Locator): Promise<string[][]> {
    let employeeLists = [];
    let paging = true;
    while (paging) {
      const tableLocator = tableRoot.locator("table");
      const tableRowsCount = await tableLocator.locator("tbody tr").count();
      const tableRows = tableLocator.locator("tbody tr");
      for (let i = 0; i < tableRowsCount; i++) {
        let userRow = await tableRows.nth(i).locator("td").allTextContents();
        employeeLists.push(userRow);
      }
      paging = await this.pageNext(tableRoot);
    }
    return employeeLists;
  }

  async validateIndividualActivitiesCallouts() {
    await this.page
      .locator('p:text-is("Some things to have in mind")')
      .waitFor({ timeout: 2000 });
    await this.page
      .locator(
        'p:has-text(" We hid employees that, according to our analysis, do not qualify for R&D.")'
      )
      .waitFor({ timeout: 2000 });
    await this.page
      .locator('p:text-is("R&D eligibility of employees\' activities")')
      .waitFor({ timeout: 2000 });
    const newPage = await this.openTarget_blankLink(
      this.context,
      this.page.locator('a:has-text("More about eligible R&D activities")')
    );
    await newPage.locator("#hs_cos_wrapper_name").waitFor();
    await newPage.close();
  }

  /**
   * This method takes in both employee list and contractor list, then attempts to
   * locate user from both list, get rd percentage and set it correspondingly,
   * check Majority flag if give user is majority owner
   * adds more activities for that user if more was given in user info detail
   * @param employeeList
   * @param contractorList
   */
  async confirmIndividualDetails(
    employeeList: EmployeePersonalDetails,
    contractorList?: ContractorPersonalDetails
  ) {
    const totalCount =
      employeeList.length +
      (contractorList === undefined ? 0 : contractorList.length);
    const totalCountListed = await this.getRemainingEmployeesToConfirmCount();
    expect(totalCount).toEqual(totalCountListed + 1);

    for (let i = 0; i < totalCount; i++) {
      let foundEmployee: EmployeePersonalDetail | ContractorPersonalDetail;
      let employmentType = await this.employeeIndividualInfo
        .locator("p:nth-child(2)")
        .textContent();
      let employeeName = await this.page
        .locator("div.info>p:nth-child(1)")
        .last()
        .textContent();
      if (employmentType!.includes("Employee")) {
        for (let j = 0; j < employeeList.length; j++) {
          if (employeeName === employeeList[j].fullName) {
            foundEmployee = employeeList[j];
          }
        }
      } else if (
        contractorList !== undefined &&
        employmentType!.includes("Contractor")
      ) {
        for (let j = 0; j < contractorList.length; j++) {
          if (employeeName === contractorList[j].fullName) {
            foundEmployee = contractorList[j];
          }
        }
      }

      if (foundEmployee!.majorityOwner !== undefined) {
        console.log(
          `turn on majority owner for user: ${foundEmployee!.fullName} ${
            foundEmployee!.jobGroup
          }`
        );
        await this.setMajorityOwnerForCurrentEmployee(
          foundEmployee!.majorityOwner!
        );
      }

      if (foundEmployee!.additionalActivies !== undefined) {
        await this.setAdditonalActivitiesForCurrentEmployee(
          foundEmployee!.additionalActivies
        );
      }

      expect(foundEmployee!.RDPercentage!.length).toBeGreaterThan(0);
      await this.validateDetaultRDPercentage(foundEmployee!.jobGroup);
      await this.page.waitForSelector(`div.info p:has-text("${employeeName}")`);
      // console.log(
      //   `attempting to change R&D Percentage to: ${foundEmployee!.RDPercentage}`
      // );
      if (i % 2 == 0) {
        await this.handleSlidingBar(foundEmployee!.RDPercentage!);
      } else {
        await this.activityInput.fill(foundEmployee!.RDPercentage!);
      }
      await this.confirmDetailsButton.last().click();
      await this.page.waitForTimeout(1000);
    }
  }

  async setAdditonalActivitiesForCurrentEmployee(
    count: number
  ): Promise<string[]> {
    await this.addNewActivities.click();
    await this.page
      .locator('div[class^="Dropdown__dropdown-container"]')
      .click();
    const selectionList = await this.page
      .locator('ul[id="dropdown-list"] li')
      .allTextContents();
    const selected = selectRandom(selectionList, count);
    await this.deleteButton.click();
    for (let i = 0; i < selected.length; i++) {
      await this.addNewActivities.click();
      await this.page
        .locator('div[class^="Dropdown__dropdown-container"]')
        .click();
      await this.page.locator(`li:has-text("${selected[i]}")`).click();
      await this.page.click('button[aria-label="Save"]');
      await this.page.waitForTimeout(500);
      await this.page.locator(`span:text-is("${selected[i]}")`);
      console.log(selected[i]);
    }
    return selected;
  }

  async setMajorityOwnerForCurrentEmployee(flag: boolean = true) {
    await this.majorityOwner.click();
  }

  /**
   * extract n from N EMPLOYEES REMAINING text at the bottom of page during
   * individual confirm state.
   * @returns
   */
  async getRemainingEmployeesToConfirmCount(): Promise<number> {
    await this.remainingEmployeeToConfirm.waitFor();
    await this.page.waitForTimeout(2000);
    console.log(await this.remainingEmployeeToConfirm.textContent());
    return Number(
      (await this.remainingEmployeeToConfirm.textContent())!.replace(
        /[^0-9]/g,
        ""
      )
    );
  }

  /**
   * based on percentage given, interact with sliding bar, use move over down up
   * actions to move slider thumb to desired location and validate input box value
   * also changed correspondingly.
   * @param percentage
   */
  async handleSlidingBar(percentage: string) {
    await this.activitySliderBar.click();
    await this.page.waitForTimeout(200);
    const boundBox = await this.activitySliderBar.boundingBox();
    const sliderThumbPos = await this.activitySliderThumb.boundingBox();
    const target_x = boundBox!.x + boundBox!.width * (Number(percentage) / 100);
    await this.page.mouse.move(
      target_x + sliderThumbPos!.width / 2,
      sliderThumbPos!.y + sliderThumbPos!.height / 2
    );
    await this.page.waitForTimeout(200);
    await this.page.mouse.down();
    await this.page.waitForTimeout(200);
    await this.page.mouse.up();
    await this.page.waitForTimeout(1000);
    const numVal = await this.activityInput.getAttribute("value");
    expect(numVal).toEqual(percentage);
  }

  /**
   * for engineers job group, activity automatically sets to 80%, we need
   * to double check that. For other non-engineer job group, their R&D level
   * should be set to 0
   * @param jobGroup: string
   */
  async validateDetaultRDPercentage(jobGroup: string) {
    const numVal = await this.activityInput.getAttribute("value");
    if (
      jobGroup.toLowerCase().includes("engineer") ||
      jobGroup.toLowerCase().includes("scientist")
    ) {
      expect(numVal).toEqual("80");
    } else if (
      jobGroup.toLowerCase().includes("qa testing") ||
      jobGroup.toLowerCase().includes("designer")
    ) {
      expect(numVal).toEqual("50");
    } else if (jobGroup.toLowerCase().includes("marketing")) {
      expect(numVal).toEqual("10");
    } else {
      expect(numVal).toEqual("0");
    }
  }

  async confirmEmployees() {
    await this.confirmEmployeeButton.click();
    await this.allContractorsIncludedInTableQuestion.waitFor();
  }

  async confirmContractors() {
    await this.confirmContractorButton.click();
  }

  async submitForExpertReview() {
    await this.submitForExperReviewButton.click();
  }

  /**
   * builds out default employee info based on the count given. It also checks
   * how many employees already available so new employee name will have add on
   * counter values
   * @param count
   * @returns
   */
  async buildDefaultEmployeeList(
    count: number = 3
  ): Promise<EmployeePersonalDetails> {
    const existingCount = (await this.extractEmployeeInfoFromTable()).length;
    let employeeList: EmployeePersonalDetails = [];
    for (let i = existingCount; i < existingCount + count; i++) {
      let newEmployee: EmployeePersonalDetail = {
        fullName: `Manual Employee${i}`,
        salary: generateRandomNumber(100000, 400000).toString(),
        role: selectRandom(
          [
            "employee role1",
            "Employee role2",
            "Manager",
            "Dancer",
            "employee role3",
          ],
          1
        )[0],
        jobGroup: selectRandom(
          ["Engineer", "Qa Testing", "Communications", "Scientist"],
          1
        )[0],
        state: selectRandom(
          ["California", "Georgia", "Hawaii", "Oklahoma", "Arizona"],
          1
        )[0],
        RDPercentage: (
          Math.floor(generateRandomNumber(0, 100) / 5) * 5
        ).toString(),
      };
      employeeList.push(newEmployee);
    }
    return employeeList;
  }

  /**
   * builds out default contractor info based on the count given. It also checks
   * how many contractors already available so new employee name will have add on
   * counter values
   * @param count
   * @returns
   */
  async buildDefaultContractorList(
    count: number
  ): Promise<ContractorPersonalDetails> {
    const existingCount = (await this.extractContractorInfoFromTable()).length;
    let contractorList: ContractorPersonalDetails = [];
    for (let i = existingCount; i < existingCount + count; i++) {
      let newContractor: ContractorPersonalDetail = {
        fullName: `Manual Contractor${i}`,
        salary: generateRandomNumber(50000, 200000).toString(),
        role: selectRandom(
          [
            "contractor role1",
            "contractor role2",
            "contractor role3",
            "contractor role4",
            "contractor role6",
          ],
          1
        )[0],
        jobGroup: selectRandom(
          ["Engineer", "Software Engineer", "Marketing", "Designer"],
          1
        )[0],
        state: selectRandom(
          ["California", "Georgia", "Hawaii", "Oklahoma", "Arizona"],
          1
        )[0],
        RDPercentage: (
          Math.floor(generateRandomNumber(0, 101) / 5) * 5
        ).toString(),
        payType: selectRandom(
          ["Variable (hourly, monthly, etc)", "Fixed (fix scope and cost)"],
          1
        )[0],
      };
      contractorList.push(newContractor);
    }
    return contractorList;
  }

  /**
   * Given a employeeList, randomly select a user and make it majority owner
   * and add addtional acivities
   * @param employeeList
   * @returns
   */
  addAdditionalPersonalInfo(
    employeeList: EmployeePersonalDetails | ContractorPersonalDetails
  ): EmployeePersonalDetails | ContractorPersonalDetails {
    const index = generateRandomNumber(0, employeeList.length);
    employeeList[index].majorityOwner = true;
    employeeList[index].additionalActivies = generateRandomNumber(1, 3);
    return employeeList;
  }
}
