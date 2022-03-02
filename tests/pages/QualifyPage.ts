import { Page } from "@playwright/test";
import { QualifyingAnswers, questionMap } from "../helpers/TestObjects";
import { generateRandomNumber, getCurrentYear } from "../helpers/Utils";
import { CommonOperations } from "./CommonOperations";

export class QualifyPage extends CommonOperations {
  readonly page: Page;

  constructor(page: Page) {
    super(page);
    this.page = page;
  }

  /**
   * to qualify for QSB (Small Business), < 5M in gross recipts and < 5 years of gross Receipts (2017 for current year 2022)
   * to qualify for income credit, General Buz, opposite answer to above questions
   * @returns
   */
  buildDefaultQualifyingAnswer(grossReceiptYear?: number): QualifyingAnswers {
    const _default: QualifyingAnswers = {
      generatedRevenue: "Yes",
      firstYearWithGrossReceipts:
        grossReceiptYear === undefined
          ? generateRandomNumber(getCurrentYear() - 5, getCurrentYear())
          : grossReceiptYear,
      expectMoreThan5MthisYear: "No",
      expectMoreThan5MnextYear: "No",
      expectOweIncomeTax: "Yes",
      acquiredOtherBuz: "No",
      moreThan50Ownership: "No",
      transitionEntityType: "No",
      cpaFirmName: "MyCPA Firm",
      cpaFirmEmail: "mycpa@gmail.com",
      moreThan5MthisYear: "Yes",
    };
    return _default;
  }

  async navigateBackToRAndDCreditForm() {
    let activePage = await this.qualifyActiveStep();
    console.log(activePage);
    while (activePage !== "Form of R&D Credit") {
      await this.navigateBack();
      await this.page.waitForTimeout(1000);
      activePage = await this.qualifyActiveStep();
      console.log(activePage);
    }
  }

  async completeQualifyingProcess(qualifyingAnswers?: QualifyingAnswers) {
    if (qualifyingAnswers === undefined) {
      qualifyingAnswers = this.buildDefaultQualifyingAnswer();
    }

    await this.handleRadioButtonQuestions(
      questionMap.generatedRevenue,
      qualifyingAnswers.generatedRevenue
    );
    await this.handleInputQuestions(
      questionMap.firstYearWithGrossReceipts,
      qualifyingAnswers.firstYearWithGrossReceipts.toString()
    );
    if (
      qualifyingAnswers.generatedRevenue === "Yes" &&
      qualifyingAnswers.firstYearWithGrossReceipts >= getCurrentYear() - 6
    ) {
      await this.handleRadioButtonQuestions(
        questionMap.expectMoreThan5MthisYear,
        qualifyingAnswers.expectMoreThan5MthisYear!
      );
      await this.handleRadioButtonQuestions(
        questionMap.expectMoreThan5MnextYear,
        qualifyingAnswers.expectMoreThan5MnextYear!
      );
    }

    await this.handleRadioButtonQuestions(
      questionMap.expectOweIncomeTax,
      qualifyingAnswers.expectOweIncomeTax
    );
    await this.handleRadioButtonQuestions(
      questionMap.acquiredOtherBuz,
      qualifyingAnswers.acquiredOtherBuz
    );
    if (
      qualifyingAnswers.acquiredOtherBuz === "Yes - we acquired a full business"
    ) {
      await this.handleInputQuestions(
        questionMap.foundYearAquiredCompnay,
        qualifyingAnswers.foundYearAquiredCompnay!.toString()
      );
    }

    await this.handleRadioButtonQuestions(
      questionMap.moreThan50Ownership,
      qualifyingAnswers.moreThan50Ownership
    );
    if (qualifyingAnswers.moreThan50Ownership === "Yes") {
      await this.handleRadioButtonQuestions(
        questionMap.companyInControlRAndD,
        qualifyingAnswers.companyInControlRAndD!
      );
      if (qualifyingAnswers.companyInControlRAndD === "Yes") {
        await this.handleInputQuestions(
          questionMap.companyInControlEarliestFounded,
          qualifyingAnswers.companyInControlEarliestFounded!.toString()
        );
      }
    }

    await this.handleRadioButtonQuestions(
      questionMap.transitionEntityType,
      qualifyingAnswers.transitionEntityType
    );
    if (
      qualifyingAnswers.transitionEntityType ===
        "Yes- but we kept the same EIN" ||
      qualifyingAnswers.transitionEntityType === "Yes - we changed EIN"
    ) {
      await this.handleInputQuestions(
        questionMap.transitionYear,
        qualifyingAnswers.transitionYear!.toString()
      );
      await this.handleInputQuestions(
        questionMap.originalEntityFoundYear,
        qualifyingAnswers.originalEntityFoundYear!.toString()
      );
    }

    await this.handleInputQuestions(
      questionMap.cpaFirmName,
      qualifyingAnswers.cpaFirmName
    );
    await this.handleInputQuestions(
      questionMap.cpaFirmEmail,
      qualifyingAnswers.cpaFirmEmail
    );

    await this.proceedToNext();
    // await this.cpaFirmEmailInput.waitFor({state: 'hidden', 'timeout': 5000})
  }
}
