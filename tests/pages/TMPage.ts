import {
  BrowserContext,
  expect,
  LaunchOptions,
  Locator,
  Page,
} from '@playwright/test';
import path from 'path';
import { CompanyOwner, TMCompanyInfo } from '../helpers/TestObjects';
import {
  convertCurrencyStringToNumber,
  generateRandomHumanNames,
  generateRandomNumber,
  getTimestamp,
} from '../helpers/Utils';
import { CommonOperations } from './CommonOperations';

export class TMPage extends CommonOperations {
  readonly page: Page;
  readonly context: BrowserContext;
  readonly tmHeader: Locator;
  readonly kycStartButton: Locator;
  readonly kycContinueButton: Locator;
  readonly legalNameInput: Locator;
  readonly companyPhoneInput: Locator;
  readonly EINInput: Locator;
  readonly streetInput: Locator;
  readonly cityInput: Locator;
  readonly zipInput: Locator;
  readonly aptsInput: Locator;
  readonly stateInput: Locator;
  readonly countryInput: Locator;
  readonly saveButton: Locator;
  readonly finishButton: Locator;
  readonly addMoreBeneficialOnwerButton: Locator;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly birthDayInput: Locator;
  readonly phoneNumberInput: Locator;
  readonly titleInput: Locator;
  readonly ownerPercentageInput: Locator;
  readonly ssnInput: Locator;
  readonly emailInput: Locator;
  readonly certify25Higher: Locator;
  readonly returnToDashBoardButton: Locator;
  readonly lessThan5MAlert: Locator;
  readonly swapPlaidConnectButton: Locator;
  readonly plaidConnectButton: Locator;
  readonly plaidQualifiedMsg: Locator;
  readonly exitLink: Locator;

  constructor(context: BrowserContext, page: Page) {
    super(page);
    this.page = page;
    this.context = context;
    this.tmHeader = this.page.locator(
      'h1:text("Welcome to MainStreet Treasury Management!")',
    );
    this.kycStartButton = this.page.locator(
      'button[aria-label="Start verification"]',
    );
    this.kycContinueButton = this.page.locator(
      'button[aria-label="Continue verification"]',
    );

    this.legalNameInput = this.page.locator(
      'input[aria-label="Legal company name"]',
    );
    this.companyPhoneInput = this.page.locator(
      'input[aria-label="Company phone"]',
    );
    this.EINInput = this.page.locator('input[aria-label="Tax ID/EIN"]');
    this.streetInput = this.page.locator('input[aria-label="Street"]');
    this.aptsInput = this.page.locator('input[aria-label="Apt/Unit/Suite #"]');
    this.cityInput = this.page.locator('input[aria-label="City"]');
    this.zipInput = this.page.locator('input[aria-label="Postal Code"]');
    this.stateInput = this.page.locator('input[aria-label="State"]');
    this.countryInput = this.page.locator('input[aria-label="Country"]');
    this.saveButton = this.page.locator('button[aria-label="Save"]');
    this.addMoreBeneficialOnwerButton = this.page.locator(
      'button>p:text-is("Add more company owners")',
    );
    this.firstNameInput = this.page
      .locator('input[aria-label="First name"]')
      .last();
    this.lastNameInput = this.page
      .locator('input[aria-label="Last name"]')
      .last();
    this.birthDayInput = this.page
      .locator('input[aria-label="Date of birth"]')
      .last();
    this.phoneNumberInput = this.page.locator(
      'input[aria-label="Phone number"]',
    );
    this.titleInput = this.page.locator('input[aria-label="Title"]');
    this.emailInput = this.page.locator('input[aria-label="Email"]');
    this.ssnInput = this.page.locator(
      'input[aria-label="Social Security Number"]',
    );
    this.ownerPercentageInput = this.page.locator(
      'input[aria-label="Ownership percentage"]',
    );
    this.certify25Higher = this.page.locator(
      'span:text-is("I certify that all individuals who own 25% or more of the company have been included in this application. If there are no such individuals, I certify that this application has been completed with information of a person who has financial control over the company.")',
    );
    this.finishButton = this.page.locator('button[aria-label="Finish"]');
    this.returnToDashBoardButton = this.page.locator(
      'button:text-is("Back to Dashboard")',
    );
    this.lessThan5MAlert = this.page.locator(
      'div[class^="Alert__message"] p:text-is("The connected account does not meet the requirements; please connect another account that has at least $5 million in assets.")',
    );
    this.swapPlaidConnectButton = this.page.locator(
      'button[aria-label="Swap connected account"]',
    );
    this.plaidConnectButton = this.page.locator('button[aria-label="Connect"]');
    this.plaidQualifiedMsg = this.page.locator(
      'p:text-is("Your connected bank account shows more than $5 million in assets.")',
    );
    this.exitLink = this.page.locator('a>p:text-is("Exit")');
  }

  async goto() {
    await this.page.goto('/treasury-management');
  }

  static buildDefaultTMCompanyInfo(
    timestamp?: number,
    phone?: boolean,
    review?: boolean,
  ): TMCompanyInfo {
    timestamp = timestamp === undefined ? getTimestamp() : timestamp;
    const tmCompanyInfo: TMCompanyInfo = {
      legalName: `Mainstreet QA Testing ${timestamp}`,
      companyPhone:
        phone === undefined || phone
          ? generateRandomNumber(1111111111, 9999999999).toString()
          : '',
      EIN:
        review === undefined || !review
          ? generateRandomNumber(111111111, 999999999).toString()
          : '123456789',
      street: `QA testing street ${timestamp}`,
      city: 'QA city',
      apt: '9',
      zip: generateRandomNumber(11111, 99999).toString(),
      state: 'Nevada',
      country: 'United States',
    };
    return tmCompanyInfo;
  }

  static buildDefaultTMBeneficialOwners(
    count: number = 1,
    timestamp?: number,
    denied?: boolean,
    phone?: boolean,
    review?: boolean,
  ): CompanyOwner[] {
    let beneficialOnwers: Array<CompanyOwner> = [];
    let lastName = generateRandomHumanNames();
    // count = denied || !phone ? 1 : count;
    if (denied !== undefined && denied) {
      lastName = 'DENY';
    } else if (review !== undefined && review) {
      lastName = 'REVIEW';
    }
    for (let i = 0; i < count; i++) {
      let _default: CompanyOwner = {
        firstName:
          denied === undefined || !denied ? generateRandomHumanNames() : 'Jane',
        lastName: lastName,
        ssn:
          denied === undefined || !denied
            ? generateRandomNumber(111111112, 999999999).toString()
            : '111111111',
        phone:
          phone === undefined || phone
            ? generateRandomNumber(1111111111, 9999999999).toString()
            : '',
        title: 'Dr',
        birthday: '12211971',
        ownership: generateRandomNumber(1, 100 / count).toString(),
        email: `qamainstreet+beneficiary${
          timestamp === undefined ? getTimestamp : timestamp
        }@gmail.com`,
        street: 'QA Testing Street',
        city: 'Wonder City',
        state: 'California',
        zip: generateRandomNumber(11111, 99999).toString(),
        country: 'United States',
      };
      beneficialOnwers.push(_default);
    }
    return beneficialOnwers;
  }

  async kickOffKycFlow() {
    await this.kycStartButton.click();
    await this.kycStartButton.click();
  }

  async continueKYCFlow() {
    await this.kycContinueButton.click();
  }

  async validateOnCompanyOwnerPage() {
    await this.page.waitForSelector('h1:text("Company owners")');
  }

  async completKYCCompanyInfoForm(options?: {
    timestamp?: number;
    tmCompanyInfo?: TMCompanyInfo;
    phone?: boolean;
    review?: boolean;
  }): Promise<TMCompanyInfo> {
    let tmCompanyInfo =
      options?.tmCompanyInfo === undefined
        ? TMPage.buildDefaultTMCompanyInfo(
            options?.timestamp,
            options?.phone,
            options?.review,
          )
        : options.tmCompanyInfo;

    await this.legalNameInput.fill(tmCompanyInfo.legalName);
    await this.companyPhoneInput.fill(tmCompanyInfo.companyPhone);
    await this.EINInput.fill(tmCompanyInfo.EIN);
    await this.streetInput.fill(tmCompanyInfo.street);
    await this.cityInput.fill(tmCompanyInfo.city);
    await this.zipInput.fill(tmCompanyInfo.zip);
    if (tmCompanyInfo.apt) {
      await this.aptsInput.fill(tmCompanyInfo.apt);
    }
    if (tmCompanyInfo.state === '') {
      await this.stateInput.fill('');
    } else {
      await this.stateInput.click();
      await this.page.locator(`span:text-is("${tmCompanyInfo.state}")`).click();
    }

    if (tmCompanyInfo.country === '') {
      await this.countryInput.fill('');
    } else {
      await this.countryInput.click();
      await this.page
        .locator(`span:text-is("${tmCompanyInfo.country}")`)
        .click();
    }
    return tmCompanyInfo;
  }

  async makePlaidConnection(
    accountName:
      | 'plaid_accredited'
      | 'plaid_unqualified'
      | 'plaid_nonDepository'
      | 'plaid_sandbox'
      | 'plaid_investmentdepository'
      | 'plaid_1_dollar_short',
  ) {
    // await this.plaidConnectButton.click();
    await this.page.waitForTimeout(2000);
    await this.plaidConnectButton.click();
    await this.page.waitForTimeout(3000);
    await this.completePlaidLogin(accountName);
    if (accountName === 'plaid_accredited') {
      await this.plaidQualifiedMsg.waitFor();
    } else {
      await this.lessThan5MAlert.waitFor();
    }
    await this.page.waitForTimeout(1000);
  }

  async swapPlaidConnection(
    accountName:
      | 'plaid_accredited'
      | 'plaid_unqualified'
      | 'plaid_nonDepository'
      | 'plaid_sandbox'
      | 'plaid_investmentdepository'
      | 'plaid_1_dollar_short',
  ) {
    // we must have this alert for the swap connection option to appear
    await this.lessThan5MAlert.waitFor();
    await this.swapPlaidConnectButton.waitFor();
    await this.page.waitForTimeout(1000);
    await this.swapPlaidConnectButton.click();
    await this.page.waitForTimeout(2000);
    await this.plaidConnectButton.click();
    await this.completePlaidLogin(accountName);
    if (accountName === 'plaid_accredited') {
      await this.plaidQualifiedMsg.waitFor();
    } else {
      await this.lessThan5MAlert.waitFor();
    }
    await this.page.waitForTimeout(1000);
  }

  async uploadAccreditationDocuments(uploads?: string[]): Promise<string[]> {
    uploads =
      uploads === undefined
        ? ['cloud_receipts.pdf', 'cloud_receipts.jpg']
        : uploads;
    for (let i = 0; i < uploads.length; i++) {
      let filePath = path.join(
        __dirname,
        `../resources/testFiles/${uploads[i]}`,
      );
      await this.page.setInputFiles('input[type="file"]', filePath);
    }
    return uploads;
  }

  async submitCompanyForm(errMsg?: string) {
    await this.saveButton.last().click();
    if (errMsg !== undefined) {
      await this.page
        .locator(`div[class*="Card__content"]>p:text-is("${errMsg}")`)
        .waitFor();
      console.log(`found error: ${errMsg}`);
    }
  }

  async certifyAndSubmitBeneficialOnwerForm(errMsg?: string) {
    await this.certify25Higher.click();
    await this.finishButton.click();
    if (errMsg !== undefined) {
      await this.page.waitForSelector(`div:text-is("${errMsg}")`);
    }
  }

  async validateCompanyInfoSummary(tmCompanyInfo: TMCompanyInfo) {
    const summary = await this.page
      .locator('[class^="Card__content"] p[class*="Text__regular"]')
      .allTextContents();
    console.log(summary);
    // TODO, text conversion between address is needed here for effective comparison
  }

  async loadingCompanyOwnerForm() {
    await this.page.waitForSelector('h1:text-is("Company owners")');
    // takes a bit for the company info to save on backend
    await this.page.waitForTimeout(2000);
  }

  /**
   * build out a set of inputs based on given flag if input is not provided, fill in
   * the values correspondingly. if errMsg is expected, check for errMsg and break out
   * of the loop
   * @param options
   * @returns
   */
  async completeBeneficialOnwerForm(options?: {
    companyOnwers?: CompanyOwner[];
    timestamp?: number;
    denied?: boolean;
    phone?: boolean;
    review?: boolean;
    errMsg?: string;
  }): Promise<CompanyOwner[]> {
    let beneficials =
      options?.companyOnwers === undefined
        ? TMPage.buildDefaultTMBeneficialOwners(
            !options?.denied && !options?.review && !options?.phone ? 2 : 1,
            options?.timestamp,
            options?.denied,
            options?.phone,
            options?.review,
          )
        : options.companyOnwers;
    for (let i = 0; i < beneficials.length; i++) {
      let beneficialOwner: CompanyOwner = beneficials[i];
      if (i > 0) {
        await this.addMoreBeneficialOnwerButton.click();
      }
      await this.firstNameInput.fill(beneficialOwner.firstName);
      await this.lastNameInput.fill(beneficialOwner.lastName);
      await this.birthDayInput.fill(beneficialOwner.birthday);
      await this.phoneNumberInput.fill(beneficialOwner.phone);
      await this.emailInput.fill(beneficialOwner.email);
      if (beneficialOwner?.title !== undefined) {
        await this.titleInput.fill(beneficialOwner.title);
      }
      await this.ssnInput.fill(beneficialOwner.ssn);
      await this.ownerPercentageInput.fill(beneficialOwner.ownership);
      await this.streetInput.fill(beneficialOwner.street);
      if (beneficialOwner.apt !== undefined) {
        await this.aptsInput.fill(beneficialOwner.apt);
      }
      await this.cityInput.fill(beneficialOwner.city);
      await this.zipInput.fill(beneficialOwner.zip);
      if (beneficialOwner.state === '') {
        await this.stateInput.fill('');
      } else {
        await this.stateInput.click();
        await this.page.click(`span:text-is("${beneficialOwner.state}")`);
      }

      if (beneficialOwner.country === '') {
        await this.countryInput.fill('');
      } else {
        await this.countryInput.click();
        await this.page.click(`span:text-is("${beneficialOwner.country}")`);
      }

      await this.saveButton.click();
      if (options?.errMsg !== undefined) {
        await this.page.waitForSelector(`p:text-is("${options.errMsg}")`);
        console.log(`found error: ${options.errMsg}`);
        break;
      }
    }
    return beneficials;
  }

  async validateCompanyOwnerSummary(companyOwners: CompanyOwner[]) {
    // TODO
    console.log('need to check for company ownser summary');
  }

  async returnToDashBoardAfterSubmission() {
    // TODO: need to capture the All Set text animation,
    // await this.returnToDashBoardButton.waitFor();
    await this.tmHeader.waitFor();
  }

  /**
   * When in wire transfer instruction view, make sure we correct text info in side drawer
   * also make account balance is zero given this is state right after doc sign
   */
  async validateWireTransferInstruction() {
    await this.page.locator('h1:text-is("High Yield Account")').waitFor();
    await this.page
      .locator(
        'div[class*="Tooltip__right"]:text-is("Applicable yield may vary over time.")',
      )
      .waitFor();

    await this.page.locator('button[aria-label="Transfer In"]').click();
    const text = await this.page
      .locator(
        'div[class*="SideDrawer__main-content"] p[class*="Text__regular"]',
      )
      .allTextContents();
    console.log(text);
    let finalText = text.slice(0, text.length - 2);
    expect(finalText).toEqual([
      'Bank Name:',
      'Blue Ridge Bank, N.A.',
      'Account Number:',
      '6777648148',
      'Routing Number:',
      '053112929',
      'Bank Address:',
      '1 East Market Street, Martinsville, VA 24112',
      'Credit To:',
      'MainStreet Yield LLC',
      'Beneficiary Address:',
      '320 N 3700 W, Unit 22690, Salt Lake City, UT 84122',
      'Reference:',
    ]);
    await this.sideDrawerCloseButton.click();
  }

  /**
   * if stepper is active, make sure it's in correct state
   * @param step
   * @returns
   */
  async validateCurrentActiveSteper(step?: string): Promise<string | null> {
    const stepper = this.page.locator(
      'div[class*="Stepper__active"] p[class*="Text__medium"]',
    );
    await stepper.waitFor();
    const activeStep = await stepper.textContent();
    if (step !== undefined) {
      expect(activeStep).toEqual(step);
    }
    return activeStep;
  }

  async validateStepIsComplete(
    step:
      | 'Verify your company information and owners'
      | 'Review documents'
      | 'Sign documents'
      | 'Account activation',
  ) {
    await this.page
      .locator(
        `div[class*="Stepper__past"] p[class*="Text__medium"]:has-text("${step}")`,
      )
      .waitFor();
  }

  /**
   * review document only happens if we have following approved: KYC, manual Review
   * that takes a bit for status to sync. So we needed to add a refresh until we see
   * continue button here
   */
  async reviewDocuments() {
    let newPage = await this.openTarget_blankLink(
      this.context,
      this.page.locator('a:text-is("Private Placement Memorandum")'),
    );
    await this.page.waitForTimeout(1000);
    await newPage.close();
    newPage = await this.openTarget_blankLink(
      this.context,
      this.page.locator('a:text-is("LLC agreement")'),
    );
    await this.page.waitForTimeout(1000);
    await newPage.close();
    newPage = await this.openTarget_blankLink(
      this.context,
      this.page.locator('a:text-is("Note purchasing agreement")'),
    );
    await this.page.waitForTimeout(1000);
    await newPage.close();
    newPage = await this.openTarget_blankLink(
      this.context,
      this.page.locator('a:text-is("Promissory note")'),
    );
    await this.page.waitForTimeout(1000);
    await newPage.close();

    let retry = 15;
    let found = false;
    while (!found && retry > 0) {
      await this.page.waitForTimeout(3000);
      this.page.reload();
      try {
        await this.continueButtonAria.waitFor({ timeout: 6000 });
        found = true;
      } catch {
        found = false;
      }
      retry--;
    }
    await this.continueButtonAria.click();
    await this.validateStepIsComplete('Review documents');
    await this.validateCurrentActiveSteper('Sign documents');
  }

  /**
   * when user is in KYC failed state, they should see following messages
   * and a email link
   */
  async validateKYCverificationFailed() {
    await this.waitForStepperState(
      'Company information or owner verification failed',
      'failed',
    );
    // we should be seeing a contact link in failure state
    await this.page
      .locator('a[href="mailto:yieldteam@mainstreet.com"]')
      .waitFor();
  }

  /**
   * given status update is not always immediate, we are retrying 15 times with
   * 5 second interval
   */
  async waitForStepperState(
    expectedStatement: string,
    status: 'failed' | 'review' | 'success' = 'success',
  ) {
    let retry = 10;
    let failedLabel = this.page.locator(`p:has-text("${expectedStatement}")`);
    let found = false;
    while (!found && retry > 0) {
      await this.page.reload();
      try {
        await failedLabel.waitFor({ timeout: 5000 });
        found = true;
      } catch {
        found = false;
      }
      retry--;
    }
    if (status === 'failed') {
      await this.page.waitForSelector('div[class^="Stepper__failed"]');
    }
  }

  /**
   * exit out of verification flow using the exit link at top right corner
   */
  async exitTMVerificationFlow() {
    await this.exitLink.click();
    await this.page.waitForTimeout(4000);
  }

  /**
   * when addreditation is in review state, we should see text message listed
   */
  async validateAccedReviewState() {
    await this.waitForStepperState(
      "We're reviewing your company details and owner information. Expect to hear from us in the next business day.",
      'review',
    );
  }

  /**
   * complete the docu sign flow
   * @param timestamp
   */
  async completeDocSign(timestamp: number) {
    await this.validateCurrentActiveSteper('Sign documents');
    await this.page.click('button[aria-label="Generate signing documents"]');
    await this.page.locator('p:text-is("Investment confirmation")').waitFor();
    const fullName = `${generateRandomHumanNames()} ${generateRandomHumanNames()}`;
    await this.page.fill('input[id="Signatory full legal name"]', fullName);
    await this.page.fill('input[id="Signatory title"]', 'QATitle');
    await this.page.click('button[aria-label="Confirm and continue"]');

    // complete Anvil Signature
    await this.page.waitForSelector('#anvil-signature-frame');
    const anvilFrame = this.page.frameLocator('#anvil-signature-frame');
    const docLinks = await anvilFrame.locator('#download-individual-file-btn');

    let newPage = await this.openTarget_blankLink(
      this.context,
      docLinks.first(),
    );
    await newPage.close();
    newPage = await this.openTarget_blankLink(this.context, docLinks.last());
    await newPage.close();

    await anvilFrame.locator(`span:text-is("${fullName}")`).waitFor();
    await anvilFrame.locator(`strong:text-is("(${fullName})")`).waitFor();
    await anvilFrame.locator('button[id="accept-signature-btn"]').click();

    await anvilFrame
      .locator(
        'span:text-is("I have reviewed the documents and I consent to using electronic signatures.")',
      )
      .click();
    await anvilFrame.locator('#sign-btn').click();
    await this.page.click('button[aria-label="View wire instructions"]');
    await this.validateCurrentActiveSteper('Account activation');
    await this.validateStepIsComplete('Account activation');
  }

  /**
   * validate promissory amount against principle amound from on UI TM view, makke sure it's
   * in either completed or pending state. if state is empty, validate 0 for principle and
   * transation table is empty
   * @param promissoryAmount
   * @param status
   */
  async validateHighYieldAccountView(
    promissoryAmount: number,
    status: 'Pending' | 'Completed' | 'empty',
  ) {
    await this.page.locator('h1:text-is("High Yield Account")').waitFor();
    let foundBalance = await this.page
      .locator('h2[class^="Dollar__number_"]')
      .textContent();
    promissoryAmount = status === 'empty' ? 0 : promissoryAmount;
    if (foundBalance) {
      let foundAmount = convertCurrencyStringToNumber(foundBalance);
      expect(foundAmount).toEqual(promissoryAmount);
    }

    if (status === 'empty') {
      console.log(await this.page.locator('table tfoot div').textContent());
    } else {
      const found_status = await this.page
        .locator('tbody>tr:nth-child(1)>td:nth-child(3)')
        .textContent();
      expect(found_status!).toEqual(status);
    }
  }

  /**
   * based on the priciples, dates, interest extracted from UI, calculate
   * expected interest. compare that with accude interest found on UI, make sure
   * the different is between 0 and 1 day worth of interest
   */
  async calculateInterest() {
    const calVals: { startDate: Date; principle: number; interest: number } =
      await this.extractInfoForInterestCalculation();

    const currentDate = new Date();
    const diff = Math.abs(currentDate.getTime() - calVals.startDate.getTime());
    const dayDiff = Math.ceil(diff / (1000 * 3600 * 24));
    const expectedInterest =
      dayDiff * (((calVals.principle / 365) * calVals.interest) / 100);
    const foundInterest = await this.page
      .locator('div[class*="Card__container___"] p[class*="Text__medium"]')
      .first()
      .textContent();

    // we are allowing for 1 day difference as we can't always be certain cron
    // job was kicked off properly
    console.log(foundInterest);
    console.log(expectedInterest);
    expect(
      Math.abs(
        expectedInterest - convertCurrencyStringToNumber(foundInterest!),
      ),
    ).toBeLessThanOrEqual(1 * (calVals.principle / 365));
    expect(
      expectedInterest - convertCurrencyStringToNumber(foundInterest!),
    ).toBeGreaterThanOrEqual(0);
  }

  /**
   * this assumes you are already on the interest view with principle, accrude interest and
   * start date populated. We will then extract that info and convert string to numbers and
   * dates respectively
   * @returns
   */
  async extractInfoForInterestCalculation(): Promise<{
    startDate: Date;
    principle: number;
    interest: number;
  }> {
    const initialDate = await this.page
      .locator('tbody>tr:nth-child(1)>td:nth-child(1)')
      .textContent();
    const principle = await this.page
      .locator('tbody>tr:nth-child(1)>td:nth-child(4)')
      .textContent();
    const interest = await this.page
      .locator('div[class*="Card__container___"] p[class*="Text__medium"]')
      .last()
      .textContent();
    expect(initialDate).not.toBeUndefined();
    expect(principle).not.toBeUndefined();
    expect(interest).not.toBeUndefined();
    return {
      startDate: new Date(initialDate!),
      principle: convertCurrencyStringToNumber(principle!),
      interest: Number(interest!.replace('%', '')),
    };
  }
}
