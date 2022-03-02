import { Locator, Page } from "@playwright/test";
import {
  FinalizeQualifyingAnswer,
  questionMap,
  RandDActivities,
} from "../helpers/TestObjects";
import { CommonOperations } from "./CommonOperations";

export class RandDActivitiesPage extends CommonOperations {
  readonly page: Page;
  readonly describeBusinessInput: Locator;
  readonly reviewDetailButton: Locator;
  readonly disqualifiedText: Locator;
  readonly generalBuzQualifiedText: Locator;
  readonly qbsQualifiedText: Locator;
  readonly commonOperations: CommonOperations;
  readonly differedText: Locator;

  constructor(page: Page) {
    super(page);
    this.page = page;
    this.commonOperations = new CommonOperations(page);
    this.describeBusinessInput = this.page.locator(
      "textarea.MuiInputBase-input"
    );
    this.differedText = this.page.locator(
      'div[class*="MuiTypography-subtitle1"]:has-text("It looks like you likely won’t get any immediate benefit from the R&D credit this tax year, as you’ll only be able to carry it forward as a tax credit that can affect future income taxes.")'
    );
    this.disqualifiedText = this.page.locator(
      'div[class*="MuiTypography-subtitle1"]:has-text("It looks like you likely won’t get any immediate benefit from the R&D credit this tax year,")'
    );
    this.generalBuzQualifiedText = this.page.locator(
      'div[class*="MuiTypography-subtitle1"]:has-text("It looks your company can benefit by using the R&D credit as a general business credit to offset your income taxes.")'
    );
    this.reviewDetailButton = this.page.locator('span:text("Review details")');
    this.qbsQualifiedText = this.page.locator(
      'div[class*="MuiTypography-subtitle1"]:has-text("It looks like your company can elect to take any R&D credits against payroll taxes for this tax year.")'
    );
  }

  buildDefaultRandDActivitiesAnswers(): RandDActivities {
    const randDActivities: RandDActivities = {
      claimedRDBefore: "Yes",
      buzDescription: "Business Description \n hope",
      randDActivityInhouse: "Entirely with own employees",
      inHouseEmployeeInUS: "Everybody works in the US",
      ownIntellectualPropery: "Yes, we own all of the intellectual property",
      grantsUsedForRDExpense: "No",
      consultingAgency:
        "No, we exclusively build our own products where we own the IP",
      trackTime: "No",
    };
    return randDActivities;
  }

  async completeRandDActivitiesQuestions(
    randDActivities?: RandDActivities
  ): Promise<RandDActivities> {
    if (randDActivities === undefined) {
      randDActivities = this.buildDefaultRandDActivitiesAnswers();
    }

    await this.handleRadioButtonQuestions(
      questionMap.claimedRDBefore,
      randDActivities.claimedRDBefore
    );
    await this.handleInputTextAreaQuestions(
      questionMap.buzDescription,
      randDActivities.buzDescription
    );
    await this.handleRadioButtonQuestions(
      questionMap.randDActivityInhouse,
      randDActivities.randDActivityInhouse
    );
    if (
      randDActivities.randDActivityInhouse ===
      "Some employees and some contractors or outside firms"
    ) {
      await this.handleRadioButtonQuestions(
        questionMap.inHouseEmployeeInUS,
        randDActivities.inHouseEmployeeInUS!
      );
      await this.handleRadioButtonQuestions(
        questionMap.contractorActivityInUS,
        randDActivities.contractorActivityInUS!
      );
      await this.handleRadioButtonQuestions(
        questionMap.ownIntellectualPropery,
        randDActivities.ownIntellectualPropery
      );
    } else if (
      randDActivities.randDActivityInhouse ===
      "Entirely contractors or outside firms"
    ) {
      await this.handleRadioButtonQuestions(
        questionMap.contractorActivityInUS,
        randDActivities.contractorActivityInUS!
      );
      await this.handleRadioButtonQuestions(
        questionMap.ownIntellectualPropery,
        randDActivities.ownIntellectualPropery
      );
    } else if (
      randDActivities.randDActivityInhouse === "Entirely with own employees"
    ) {
      await this.handleRadioButtonQuestions(
        questionMap.inHouseEmployeeInUS,
        randDActivities.inHouseEmployeeInUS!
      );
    }

    await this.handleRadioButtonQuestions(
      questionMap.grantsUsedForRDExpense,
      randDActivities.grantsUsedForRDExpense
    );
    if (randDActivities.grantsUsedForRDExpense === "Yes") {
      await this.handleMultiSelectionQuestions(
        questionMap.grantOrigin,
        randDActivities.grantOrigin!
      );
      await this.handleInputQuestions(
        questionMap.grantUsedForRandDSpending,
        randDActivities.grantUsedForRandDSpending!
      );
    }

    await this.handleRadioButtonQuestions(
      questionMap.consultingAgency,
      randDActivities.consultingAgency!
    );
    if (
      randDActivities.consultingAgency ===
      "Yes, but we also build our own products where we own the IP"
    ) {
      await this.handleInputQuestions(
        questionMap.buildOwnProductTimePercentage,
        randDActivities.buildOwnProductTimePercentage!.toString()
      );
    }

    await this.handleRadioButtonQuestions(
      questionMap.trackTime,
      randDActivities.trackTime!
    );
    await this.proceedToNext();
    return randDActivities;
  }

  async handleRandDCreditType(
    textType: "QSB" | "general" | "deferred" = "QSB"
  ) {
    if (textType === "QSB") {
      await this.qbsQualifiedText.waitFor();
    } else if (textType === "deferred") {
      await this.differedText.waitFor();
    } else if (textType === "general") {
      await this.generalBuzQualifiedText.waitFor();
    }
    await this.proceedToNext();
  }

  async completeFinalizingQualifyingQuestions(
    finalizingAnswer?: FinalizeQualifyingAnswer
  ) {
    if (finalizingAnswer === undefined) {
      finalizingAnswer = {
        howRandDImproveProduct: [
          "We do other things to improve the final customer experience",
        ],
        technicalUncertainties: [
          "We're using designs, or algorithms that are unclear at the start of the project",
          "We're using processes or methodologies that are unclear at the start of the project",
        ],
        processOfExperimentation: [
          "We test prototypes for durability, safety, functionality, or viability",
          "We run scientific experiments to test hypotheses",
        ],
        kindOfTechnicalProjects: [
          "We were coding a new software platform or app",
        ],
      };
    }

    await this.handleMultiSelectionQuestions(
      questionMap.howRandDImproveProduct,
      finalizingAnswer.howRandDImproveProduct!
    );
    await this.proceedToNext();

    await this.handleMultiSelectionQuestions(
      questionMap.technicalUncertainties,
      finalizingAnswer.technicalUncertainties
    );
    await this.proceedToNext();

    await this.handleMultiSelectionQuestions(
      questionMap.processOfExperimentation,
      finalizingAnswer.processOfExperimentation
    );
    await this.proceedToNext();

    await this.handleMultiSelectionQuestions(
      questionMap.kindOfTechnicalProjects,
      finalizingAnswer.kindOfTechnicalProjects
    );
    await this.proceedToNext();
    return finalizingAnswer;
  }

  async proceedToReview() {
    await this.reviewDetailButton.click();
  }
}
