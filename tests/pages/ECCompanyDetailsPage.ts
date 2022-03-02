import { Locator, Page } from "@playwright/test";
import {
  ConfirmCompanyDetails,
  EmployeeDetails,
  QualifyingAnswers,
  questionMap,
} from "../helpers/TestObjects";
import { CommonOperations } from "./CommonOperations";
import { generateRandomNumber } from "../helpers/Utils";
import { CompanyDetailPage } from "./CompanyDetailPage";

export class ECCompanyDetailsPage extends CommonOperations {
  readonly page: Page;
  readonly pageTitle: string;
  readonly sideDrawer: Locator;
  readonly editOnboardingQuestionConfirmation: Locator;
  readonly sideDrawerSave: Locator;
  readonly addGrossReceiptsAndQREs: Locator;
  readonly grossReceiptsInputsSelector: string;
  readonly qreSelector: string;
  readonly taxFilingMonth: Locator;
  readonly sellTangiblePropertyQuestion: Locator;
  readonly currentYearTaxLiabilityQuestion: Locator;
  readonly currentYearTaxLiabilitySelector: string;
  readonly continueToSupplyServices: Locator;
  readonly confirmExtraDetailsHeader: Locator;
  readonly subQuestions: Locator;
  readonly georgiaGrossRecieptsSelector: string;

  constructor(page: Page) {
    super(page);
    this.page = page;
    this.pageTitle = "Company Details";
    this.sideDrawer = this.page.locator('div[class*="SideDrawer__container"]');
    this.sideDrawerSave = this.page.locator(
      'div[class*="SideDrawer__container"] button[aria-label="Save"]'
    );
    this.editOnboardingQuestionConfirmation = this.page.locator(
      'div[class*="Card__content"]:has-text("Please confirm that this information is still accurate") button[aria-label="Edit"]'
    );
    this.addGrossReceiptsAndQREs = this.page.locator(
      'a:text-is("Add gross receipts and QREs")'
    );
    this.grossReceiptsInputsSelector =
      '.green span[class*="TextField__currency-format"]>input:below(:has-text("gross receipts"))';
    this.georgiaGrossRecieptsSelector =
      '.green span[class*="TextField__currency-format"]>input:below(:has-text("GA portion of gross receipts for"))';
    this.qreSelector =
      '.green span[class*="TextField__currency-format"]>input:below(:has-text("Qualified Research Expenses (QREs)"))';
    this.taxFilingMonth = this.page.locator(
      'span[class*="Dropdown"]>input:below(:has-text("What month do you plan to file your federal income taxes for this tax year?"))'
    );
    this.sellTangiblePropertyQuestion = this.page.locator(
      `div[class*="SurveyQuestion__title"]>span:has-text("${questionMap.sellTangibleProperty}")`
    );
    this.currentYearTaxLiabilitySelector = `div[class*="SurveyQuestion__title"]>span:has-text("${questionMap.currentYearTaxLiability}")`;
    this.currentYearTaxLiabilityQuestion = this.page.locator(
      this.currentYearTaxLiabilitySelector
    );
    this.continueToSupplyServices = this.page.locator(
      "data-testid=continue-button"
    );
    this.confirmExtraDetailsHeader = this.page.locator(
      'p:text("Please confirm some extra details about your company.")'
    );
    this.subQuestions = this.page.locator('div[class*="SubQuestion"]');
  }

  async editOnboardingQuestion(question: string, response: string) {
    if (await this.editOnboardingQuestionConfirmation.isVisible()) {
      await this.editOnboardingQuestionConfirmation.click();
    }
    const questionSelector = this.page.locator(
      `div[class*="Card__content"]:has-text("${question}") button`
    );
    if (await questionSelector.isVisible()) {
      await questionSelector.click();
      await this.sideDrawer.isVisible();
      await this.page
        .locator(`div[class*="SideDrawer"] span:text("${response}")`)
        .click();
      await this.sideDrawerSave.click();
    }
  }

  async confirmInfoIsStillAccurate(
    confirmCompanyDetail: ConfirmCompanyDetails
  ): Promise<Number> {
    await this.subQuestions.last().waitFor();
    const questionCount = await this.subQuestions.count();
    if (questionCount > 3) {
      await this.validateSurveySubQuestions(
        questionMap.moreThan50Ownership,
        confirmCompanyDetail.moreThan50Ownership
      );
      await this.validateSurveySubQuestions(
        questionMap.acquiredOtherBuz,
        confirmCompanyDetail.acquiredOtherBuz
      );
      await this.validateSurveySubQuestions(
        questionMap.transitionEntityType,
        confirmCompanyDetail.transitionEntityType
      );
      await this.validateSurveySubQuestions(
        questionMap.trackTime,
        confirmCompanyDetail.trackTime
      );
      await this.validateSurveySubQuestions(
        questionMap.grantsUsedForRDExpense,
        confirmCompanyDetail.grantsUsedForRDExpense
      );
    } else {
      await this.validateSurveySubQuestions(
        questionMap.trackTime,
        confirmCompanyDetail.trackTime
      );
      await this.validateSurveySubQuestions(
        questionMap.grantsUsedForRDExpense,
        confirmCompanyDetail.grantsUsedForRDExpense
      );
    }
    return questionCount;
  }

  async confirmCompanyDetailAnswers(
    qualifyingAnswers: QualifyingAnswers,
    confirmCompanyDetail: ConfirmCompanyDetails,
    employeeDetails: EmployeeDetails,
    questionCount?: Number
  ) {
    if (confirmCompanyDetail === undefined) {
      confirmCompanyDetail =
        ECCompanyDetailsPage.buildDefaultConfirmCompanyDetailAnswers();
    }

    // if this is a rerun, some question should have been answered
    // so we are using the answer cards that has displayed at begining to identify the case
    const answeredQuestions = await this.page
      .locator('div[class^="Delay__container"]')
      .count();
    if (answeredQuestions > 2) {
      //we have gone though the answers no need to reanswer
      await this.continueToNextQuestion();
    } else {
      if (questionCount === undefined || questionCount < 4) {
        await this.handleButtonQuestions(
          questionMap.moreThan50Ownership,
          qualifyingAnswers.moreThan50Ownership
        );
        await this.validateSurveyQuestionSelectedAnswers(
          questionMap.moreThan50Ownership,
          qualifyingAnswers.moreThan50Ownership
        );

        await this.handleRadioButtonQuestions(
          questionMap.acquiredOtherBuz,
          qualifyingAnswers.acquiredOtherBuz
        );
        await this.validateSurveyQuestionSelectedAnswers(
          questionMap.acquiredOtherBuz,
          qualifyingAnswers.acquiredOtherBuz
        );

        await this.handleRadioButtonQuestions(
          questionMap.transitionEntityType,
          qualifyingAnswers.transitionEntityType
        );
        await this.validateSurveyQuestionSelectedAnswers(
          questionMap.transitionEntityType,
          qualifyingAnswers.transitionEntityType
        );

        await this.handleButtonQuestions(
          questionMap.moreThan5MthisYear,
          confirmCompanyDetail.moreThan50Ownership
        );
        await this.validateSurveyQuestionSelectedAnswers(
          questionMap.moreThan5MthisYear,
          confirmCompanyDetail.moreThan50Ownership
        );
      } else {
        await this.handleButtonQuestions(
          questionMap.moreThan5MthisYear,
          confirmCompanyDetail.moreThan5MthisYear!
        );
        await this.validateSurveyQuestionSelectedAnswers(
          questionMap.moreThan5MthisYear,
          confirmCompanyDetail.moreThan5MthisYear
        );
      }

      // TODO itemized credit when we enter selection for claimCreditOutsideMS other than Non of above

      await this.handleMultiSelectionQuestions(
        questionMap.claimCreditOutsideMS,
        confirmCompanyDetail.claimCreditOutsideMS
      );
      await this.continueToNextQuestion();
      await this.validateSurveyQuestionSelectedAnswers(
        questionMap.claimCreditOutsideMS,
        confirmCompanyDetail.claimCreditOutsideMS[0]
      );

      await this.handleInputQuestions(
        questionMap.taxPreparer,
        confirmCompanyDetail.taxPreparer
      );
      await this.continueToNextQuestion();
      await this.validateSurveyQuestionSelectedAnswers(
        questionMap.taxPreparer,
        confirmCompanyDetail.taxPreparer
      );

      await this.handleInputQuestions(
        questionMap.taxPreparerEmail,
        confirmCompanyDetail.taxPreparerEmail
      );
      await this.continueToNextQuestion();
      await this.validateSurveyQuestionSelectedAnswers(
        questionMap.taxPreparerEmail,
        confirmCompanyDetail.taxPreparerEmail
      );

      if (confirmCompanyDetail.taxFiles === undefined) {
        await this.addGrossReceipts_QREs();
        await this.addQREpast5years();
      } else {
        await this.upload_tax_forms(
          confirmCompanyDetail.taxFiles!,
          qualifyingAnswers.firstYearWithGrossReceipts
        );
      }

      await this.handleDropDownQuestions(
        questionMap.taxFilingMonth,
        confirmCompanyDetail.taxFilingMonth
      );
      await this.validateSurveyQuestionSelectedAnswers(
        questionMap.taxFilingMonth,
        confirmCompanyDetail.taxFilingMonth
      );

      await this.handleStateTaxSpecificQuestions(
        confirmCompanyDetail,
        employeeDetails.mostRAndDStates
      );
      await this.continueToSupplyServices.click();
    }
  }

  async handleStateTaxSpecificQuestions(
    confirmCompanyDetail: ConfirmCompanyDetails,
    rndStates: string[]
  ) {
    if (rndStates.includes("California")) {
      //specific california Research Credit Program
      await this.handleButtonQuestions(
        questionMap.sellTangibleProperty,
        confirmCompanyDetail.sellTangibleProperty!
      );
      await this.validateSurveyQuestionSelectedAnswers(
        questionMap.sellTangibleProperty,
        confirmCompanyDetail.sellTangibleProperty!
      );
    }

    if (rndStates.includes("Georgia")) {
      //specific to Georgia Research Credit Program
      await this.handleInputQuestions(
        questionMap.naicsCode,
        confirmCompanyDetail.naicsCode!
      );
      await this.continueToNextQuestion();
      await this.validateSurveyQuestionSelectedAnswers(
        questionMap.naicsCode,
        confirmCompanyDetail.naicsCode!
      );

      await this.page.waitForSelector(this.georgiaGrossRecieptsSelector);
      const inputs = await this.page.$$(this.georgiaGrossRecieptsSelector);
      for (let i = 0; i < inputs.length; i++) {
        await inputs[i].type(confirmCompanyDetail.grossReceiptsGeorgia![i]);
        await this.page.waitForTimeout(200);
      }
      await this.continueToNextQuestion();
    }

    if (rndStates.includes("Massachusetts")) {
      //specific to Massachusetts Research Credit Program
      await this.handleRadioButtonQuestions(
        questionMap.currentYearTaxLiability,
        confirmCompanyDetail.currentYearTaxLiability!
      );
      await this.validateSurveyQuestionSelectedAnswers(
        questionMap.currentYearTaxLiability,
        confirmCompanyDetail.currentYearTaxLiability!
      );
    }
  }

  async upload_tax_forms(taxFiles: string[], grossTaxYear: number) {
    await this.page
      .locator('div[class^="SurveyQuestion__file-upload-container"]')
      .first()
      .waitFor();
    const fileUploadContainer = await this.page.$$(
      'div[class^="SurveyQuestion__file-upload-container"]'
    );
    for (let i = 0; i < fileUploadContainer.length; i++) {
      await this.page.setInputFiles(
        `div:nth-child(${i + 1})>div>div>input`,
        taxFiles[i]
      );
    }
    const uploadedFiles = await this.page
      .locator('div[class^="SurveyQuestion__result"] p[class^="Text__text"]')
      .allTextContents();
    // console.log(uploadedFiles);
    await this.continueToNextQuestion();
  }

  async addGrossReceipts_QREs() {
    await this.addGrossReceiptsAndQREs.click();
    await this.page.waitForSelector(this.grossReceiptsInputsSelector);
    const inputs = await this.page.$$(this.grossReceiptsInputsSelector);
    for (let i = 0; i < inputs.length; i++) {
      await inputs[i].type(generateRandomNumber(100000, 199999).toString());
      await this.page.waitForTimeout(200);
    }
    await this.continueToNextQuestion();
  }

  async addQREpast5years() {
    await this.page.waitForSelector(this.qreSelector);
    const inputs = await this.page.$$(this.qreSelector);
    for (let i = 0; i < inputs.length / 2; i++) {
      await inputs[i].type(generateRandomNumber(100000, 299999).toString());
      await this.page.waitForTimeout(200);
    }
    await this.continueToNextQuestion();
  }

  static buildDefaultConfirmCompanyDetailAnswers(): ConfirmCompanyDetails {
    let confirmCompanyDetails: ConfirmCompanyDetails = {
      trackTime: "No",
      grantsUsedForRDExpense: "No",
      moreThan50Ownership: "No",
      acquiredOtherBuz: "No",
      transitionEntityType: "No",
      moreThan5MthisYear: "No",
      claimCreditOutsideMS: ["None of the above"],
      taxPreparer: "Adam Smith",
      taxPreparerEmail: "qamainstreet+taxPreparer@gmail.com",
      taxFilingMonth: "February",
      sellTangibleProperty: "No",
      currentYearTaxLiability: "25K or more",
      naicsCode: "123432443",
      grossReceiptsGeorgia: ["1000", "20000", "300000"],
    };
    return confirmCompanyDetails;
  }

  async isCurrentlyActive(): Promise<boolean> {
    const step = await this.activeStep();
    return step === this.pageTitle;
  }
}
