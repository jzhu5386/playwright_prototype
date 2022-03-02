import {
  Locator,
  Page,
  FrameLocator,
  BrowserContext,
  expect,
} from "@playwright/test";
import path from "path";
import { scrollElementIntoView } from "../helpers/Utils";
import credentials from "../resources/testAccounts/qa_external_credentials.json";

export class CommonOperations {
  readonly page: Page;
  readonly muiCircularProgress: Locator;
  readonly continueButton: Locator;
  readonly continueButtonAria: Locator;
  readonly continueButtonInContainer: Locator;
  readonly nextButton: Locator;
  readonly backButton: Locator;
  readonly deleteButton: Locator;
  readonly yesButton: Locator;
  readonly saveButton: Locator;
  readonly noButton: Locator;
  readonly connectButton: Locator;
  readonly continueButtonTestID: Locator;
  readonly payRollPageTitle: Locator;
  readonly finchFrame: FrameLocator;
  readonly finchContinue: Locator;
  readonly finchProviderOption: Locator;
  readonly finchLogin: Locator;
  readonly finchPassword: Locator;
  readonly finchSignIn: Locator;
  readonly payRollBox: Locator;
  readonly payRollOptions: Locator;
  readonly backButtonEC: Locator;
  readonly activeSteps: Locator;
  readonly qualifyActiveSteps: Locator;
  readonly exitECFlowButton: Locator;
  readonly proceedToRipplingLink: Locator;
  readonly ripplingEmailInput: Locator;
  readonly ripplingPasswordInput: Locator;
  readonly ripplingLoginButton: Locator;
  readonly ripplingTakeMeWhereILeftOff: Locator;
  readonly submitButton: Locator;
  readonly confirmExitButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.muiCircularProgress = this.page.locator(
      "div.MuiCircularProgress-root"
    );
    this.continueButton = this.page.locator('button:text("Continue")');
    this.continueButtonAria = this.page.locator(
      'button[aria-label="Continue"]'
    );
    this.continueButtonTestID = this.page.locator(
      "data-testid=continue-button"
    );
    this.continueButtonInContainer = this.page.locator(
      'div[class*="Expandable__container"][style*="opacity: 1"] button[aria-label="Continue"]'
    );
    this.nextButton = this.page.locator('span:text("Next")');
    this.backButton = this.page.locator('span:text("Back")');
    this.deleteButton = this.page.locator('button[aria-label="Delete"]');
    this.backButtonEC = this.page.locator("data-testid=back-button");
    this.yesButton = this.page.locator('button[aria-label="Yes"]');
    this.noButton = this.page.locator('button[aria-label="No"]');
    this.saveButton = this.page.locator('button[aria-label="Save"]');
    this.connectButton = this.page.locator(
      'div[style*="height: auto"] button[aria-label="Connect"]'
    );
    this.exitECFlowButton = this.page.locator('button[aria-label="Exit"]');
    this.payRollPageTitle = this.page.locator(
      'text="Connect payroll software"'
    );
    this.finchFrame = this.page.frameLocator('iframe[src*="finch"]');
    this.finchContinue = this.finchFrame.locator('button[type="submit"]');
    this.finchProviderOption = this.finchFrame.locator("data-testid=provider");
    this.finchLogin = this.finchFrame.locator("#username");
    this.finchPassword = this.finchFrame.locator("#password");
    this.finchSignIn = this.finchFrame.locator('button[type="submit"]');
    this.payRollBox = this.page.locator(
      'div[data-testid="autocomplete"] input'
    );
    this.payRollOptions = this.page.locator(
      'ul[class="MuiAutocomplete-listbox"] li'
    );
    this.activeSteps = this.page.locator('div[class*="Stepper__active"] p');
    this.qualifyActiveSteps = this.page.locator(
      'span[class*="MuiStepLabel-active"]'
    );
    this.proceedToRipplingLink = this.page.locator(
      'a:text-is("Finish process on Rippling\'s platform")'
    );
    this.ripplingEmailInput = this.page.locator("data-testid=input-email");
    this.ripplingPasswordInput = this.page.locator(
      "data-testid=input-password"
    );
    this.ripplingLoginButton = this.page.locator(
      'button[data-testid="Log in"]'
    );
    this.ripplingTakeMeWhereILeftOff = this.page.locator(
      'button[data-testid="Take me to where I left off"]'
    );
    this.submitButton = this.page.locator('button[aria-label="Submit"]');
    this.confirmExitButton = this.page.locator(
      'div[class^="Modal__animated-container"] button[aria-label="Exit"]'
    );
  }

  async waitForLoadingMaskToDisappear() {
    let maxWait = 10000;
    try {
      await this.muiCircularProgress.waitFor({
        state: "visible",
        timeout: 2000,
      });
    } catch (TimeoutError) {
      // did not detect loading mask
    }
    while ((await this.muiCircularProgress.isVisible()) && maxWait > 0) {
      this.page.waitForTimeout(2000);
      maxWait = maxWait - 2000;
    }
  }

  async reload() {
    await this.page.reload();
    await this.page.waitForTimeout(2000);
  }

  async proceedToContinue() {
    await this.continueButton.first().waitFor();
    if (await this.page.locator("data-testid=continue-button").isVisible()) {
      await this.continueButtonTestID.click();
    } else {
      await this.continueButton.click();
    }
  }

  async continueToNextQuestion() {
    await this.continueButtonInContainer.waitFor();
    await this.continueButtonInContainer.click();
  }

  async proceedToNext() {
    await this.page.waitForTimeout(1000);
    await this.nextButton.waitFor({ state: "visible", timeout: 5000 });
    await this.nextButton.click({ delay: 1000 });
  }

  async navigateBack() {
    await this.backButton.waitFor({ state: "visible", timeout: 5000 });
    await this.backButton.click({ delay: 1000 });
  }

  async navigateBackInEC() {
    await this.backButtonEC.click();
  }

  async exitECFlow() {
    await this.exitECFlowButton.click();
    if (await this.confirmExitButton.isVisible()) {
      await this.confirmExitButton.click();
    }
  }

  /**
   * This method takes the question title of a drop down question and attempts to select the
   * answer given from specified anwer param. This mthod should apply to all drop
   * down selections within mainstreet UI.
   * @param question
   * @param answer
   */
  async handleDropDownQuestions(question: string, answer: string) {
    const questionSelector = `div[class*="Card__content"]:has-text("${question}")`;
    await this.page.waitForSelector(questionSelector);
    let dropDownSelector = `.green div[class*="Card__content"]:has-text("${question}") input`;
    if (!(await this.page.locator(dropDownSelector).isVisible())) {
      dropDownSelector = `div[class*="Card__content"]:has-text("${question}") input`;
    }
    await this.page.click(dropDownSelector);
    await this.page.click(`li>span:has-text("${answer}")`);
    await this.page.waitForTimeout(200);
  }

  /**
   * This method takes the question title of multiple selection question and attempts
   * to make multi selections based on given selection input. This method should apply to
   * all multi-selection questions on Mainstreet UI.
   * @param question
   * @param selection
   */
  async handleMultiSelectionQuestions(question: string, selection: string[]) {
    const questionSelector = `div[class*="Card__content"]:has-text("${question}")`;
    await this.page.waitForSelector(questionSelector);
    for (let i = 0; i < selection.length; i++) {
      if (
        await this.page.locator(`span:has-text("${selection[i]}")`).isVisible()
      ) {
        await this.page.locator(`span:has-text("${selection[i]}")`).click();
      }
    }
    await this.page.waitForTimeout(200);
  }

  /**
   * This method takes the question title of a radio button question and attempts
   * to make selections based on given selection input. This method should apply to all Radio
   * button questions on mainstreet UI.
   * @param question
   * @param selection
   */
  async handleRadioButtonQuestions(question: string, selection: string) {
    const questionSelector = `div[class*="Card__content"]:has-text("${question}")`;
    await this.page.waitForSelector(questionSelector);
    if (
      await this.page
        .locator(`div[class*="SurveyQuestion__title"]:has-text("${question}")`)
        .isVisible()
    ) {
      await this.page
        .locator(
          `div[class*="Radio__radio-button"] span:text-is("${selection}")`
        )
        .last()
        .click();
    } else {
      await scrollElementIntoView(this.page, questionSelector, 500);
      await this.page.click(
        `span:text-is("${selection}"):below(:text("${question}"))`
      );
    }
    await this.page.waitForTimeout(200);
  }

  /**
   * This method takes the question title of a button question and attempts to select the
   * right button based on given answer param. This method should apply to all Button qestions
   * on mainstreet UI
   * @param question
   * @param answer
   */
  async handleButtonQuestions(question: string, answer: string) {
    const questionSelector = `div[class*="Card__content"]:has-text("${question}")`;
    await this.page.waitForSelector(questionSelector);
    await scrollElementIntoView(this.page, questionSelector, 200);
    const questionLocactor = this.page.locator(questionSelector);
    if (
      await questionLocactor
        .locator(`button span:text-is("${answer}")`)
        .isVisible()
    ) {
      await questionLocactor
        .locator(`button span:text-is("${answer}")`)
        .click();
      await questionLocactor
        .locator(`button[aria-pressed="true"] span:text-is("${answer}")`)
        .waitFor();
    } else {
      await this.page.click(
        `button:text-is("${answer}"):below(:has-text("${question}"))`
      );
      await this.page.waitForSelector(
        `button[class*="selected"]:text-is("${answer}"):below(:has-text("${question}"))`
      );
    }
    await this.page.waitForTimeout(200);
  }

  async handleInputQuestions(question: string, inputVal: string) {
    const questionSelector = `div[class*="Card__content"]:has-text("${question}")`;
    await this.page.waitForSelector(questionSelector);
    let inputSelector = `div[class*="TextField__text"]:has-text("${question}") input[type="text"]`;

    if (!(await this.page.locator(inputSelector).isVisible())) {
      inputSelector = `.green div[class*="Card__content"]:has-text("${question}") input[type="text"]`;
    }
    if (!(await this.page.locator(inputSelector).isVisible())) {
      inputSelector = `input:below(:text-is("${question}"))`;
    }
    await this.page.locator(inputSelector).fill(inputVal);
    await this.page.waitForTimeout(200);
  }

  async handleInputTextAreaQuestions(question: string, inputVal: string) {
    const questionSelector = `div[class*="Card__content"]:has-text("${question}")`;
    await this.page.waitForSelector(questionSelector);
    let inputSelector = `div[class*="Card__content"]:has-text("${question}") textarea.MuiInputBase-input`;
    if (!(await this.page.locator(inputSelector).isVisible())) {
      inputSelector = `textarea.MuiInputBase-input:below(:text("${question}"))`;
    }
    await this.page.locator(inputSelector).first().fill(inputVal);
    await this.page.waitForTimeout(200);
  }

  async triggerEditorForQuestion(question: string) {
    const questionEditor = `div[class^="Card__container"]:has-text("${question}") button[aria-label="Edit"]`;
    await this.page.click(questionEditor);
  }
  async validateSurveyQuestionSelectedAnswers(
    question: string,
    answer: string
  ) {
    if (
      await this.page
        .locator('div[class*="Delay__container"] div.info')
        .first()
        .isVisible()
    ) {
      const answerCard = this.page.locator(
        `div[class*="Delay__container"] p:has-text("${question}")`
      );
      await answerCard.waitFor();
      await this.page
        .locator(
          `p[class*="Text__regular"]:text-is("${answer}"):below(:text-is("${question}"), 3)`
        )
        .waitFor();
    }
  }

  async validateSurveySubQuestions(question: string, answer: string) {
    let foundAnswer = await this.page
      .locator(`p:below(span:text("${question}"), 20)`)
      .textContent();
    expect(foundAnswer).toEqual(answer);
  }

  async makePayRollSelection(options?: {
    payRollName?: string;
    skipConnection?: boolean;
    fileToUpload?: string[];
  }) {
    let payRollName: string;
    await this.payRollPageTitle.waitFor({ state: "visible" });
    await this.payRollBox.click();

    if (options === undefined || options!.payRollName === undefined) {
      let payrollOptions = await this.payRollOptions.allTextContents();
      payrollOptions = payrollOptions.slice(0, 48);
      payRollName =
        payrollOptions[Math.floor(Math.random() * payrollOptions.length)];
      console.log(`randomly selected payroll option: ${payRollName}`);
    } else {
      payRollName = options!.payRollName;
    }
    await this.page.click(`text="${payRollName}"`);
    if (payRollName === "Add manually") {
      await this.payrollFileUplaod(options!.fileToUpload!);
    } else if (payRollName === "Rippling") {
      await this.complete_rippling_connection();
    } else if (
      options === undefined ||
      options!.skipConnection === undefined ||
      !options!.skipConnection
    ) {
      await this.complete_finch_connection();
    }
  }

  /**
   * triggers finch login prompt and completes login form. This has been
   * very flacky during implementation, there for you see the try catch statement
   * we've also had times where login values were being entered twice. So No
   * gurrantee it's going to work 100% :()
   */
  async complete_finch_connection() {
    await this.connectButton.click();
    await this.page.waitForTimeout(3000);
    try {
      await this.finchContinue.waitFor({ timeout: 3000 });
      await this.finchContinue.click();
    } catch {
      console.log("We probably went straight to provider option");
    }
    try {
      await this.finchContinue.waitFor({ timeout: 3000 });
      await this.finchContinue.click();
    } catch {
      console.log("We probably went straight to provider option");
    }

    await this.finchProviderOption.click({ delay: 1000 });
    await this.finchLogin.waitFor();
    await this.finchLogin.fill("smallco");
    await this.finchPassword.fill("letmein");
    await this.finchSignIn.click();
  }

  async complete_rippling_connection() {
    await this.connectButton.click();
    await this.proceedToRipplingLink.click();
    await this.ripplingEmailInput.fill(credentials.rippling_sandbox.username);
    await this.ripplingPasswordInput.fill(
      credentials.rippling_sandbox.password
    );
    await this.ripplingLoginButton.click();
    await this.ripplingTakeMeWhereILeftOff.click();
    await this.page.locator("data-testid=Continue").click();
  }

  async payrollFileUplaod(fileToUpload: string[]) {
    for (let i = 0; i < fileToUpload.length; i++) {
      await this.page.setInputFiles(
        'input[id="file-input-"]',
        path.join(__dirname, `../resources/testFiles/${fileToUpload[i]}`)
      );
    }
    await this.submitButton.click();
  }

  /**
   * methods to connect to Plaid. this assumes plaid prompt is already
   * triggered. We have how to trigger that in Page Objects that's making
   * this call. accountName needs to exist in external_credential.json
   */
  async completePlaidLogin(
    accountName:
      | "plaid_accredited"
      | "plaid_unqualified"
      | "plaid_nonDepository"
      | "plaid_sandbox"
      | "plaid_investmentdepository"
  ) {
    const plaidFrame = this.page.frameLocator(
      'iframe[id^="plaid-link-iframe-"]'
    );
    await plaidFrame.locator("#aut-continue-button").waitFor();
    await plaidFrame.locator("#aut-continue-button").click();
    await plaidFrame
      .locator('button[class*="InstitutionSearchResult__button"]')
      .first()
      .click();
    let username: string;
    let password: string;
    if (accountName === "plaid_accredited") {
      username = credentials.plaid_accredited.username;
      password = credentials.plaid_accredited.password;
    } else if (accountName === "plaid_unqualified") {
      username = credentials.plaid_unqualified.username;
      password = credentials.plaid_unqualified.password;
    } else if (accountName === "plaid_nonDepository") {
      username = credentials.plaid_nonDepository.username;
      password = credentials.plaid_nonDepository.password;
    } else if (accountName === "plaid_investmentdepository") {
      username = credentials.plaid_investmentdepository.useranme;
      password = credentials.plaid_investmentdepository.password;
    } else {
      username = credentials.plaid_sandbox.username;
      password = credentials.plaid_sandbox.password;
    }
    await plaidFrame.locator("#username").fill(username);
    await plaidFrame.locator("#password").fill(password);
    await plaidFrame.locator("#aut-submit-button").click();
  }

  async activeStep(): Promise<string> {
    // await this.waitForLoadingMaskToDisappear();
    await this.activeSteps.waitFor();
    let step = await this.activeSteps.textContent();
    step = step === null ? "" : step;
    return step;
  }

  async waitForPageToBeActive(pageName: string) {
    let retry = 3;
    while ((await this.activeStep()) !== pageName) {
      await this.page.waitForTimeout(2000);
      retry--;
    }
  }

  async qualifyActiveStep(): Promise<string> {
    await this.qualifyActiveSteps.waitFor();
    let step = await this.qualifyActiveSteps.textContent();
    step = step === null ? "" : step;
    return step;
  }

  async waitForQualifyPageToBeActive(pageName: string) {
    let retry = 3;
    while (!((await this.qualifyActiveStep()) !== pageName)) {
      await this.page.waitForTimeout(2000);
      retry--;
    }
  }

  async openTarget_blankLink(
    context: BrowserContext,
    locator: Locator
  ): Promise<Page> {
    // Get page after a specific action (e.g. clicking a link)
    const [newPage] = await Promise.all([
      context.waitForEvent("page"),
      locator.click(), // Opens a new tab
    ]);
    await newPage.waitForLoadState();
    // console.log(await newPage.title());
    return newPage;
  }
}
