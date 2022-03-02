import { Locator, Page } from "@playwright/test";
import path from "path";
import {
  questionMap,
  SuppliesAndServices,
  VendorInfo,
} from "../helpers/TestObjects";
import { generateRandomNumber } from "../helpers/Utils";
import { CommonOperations } from "./CommonOperations";

export class ECSuppliesAndServicesPage extends CommonOperations {
  readonly page: Page;
  readonly pageTitle: string;
  readonly addVendorButton: Locator;
  readonly vendorNameInput: Locator;
  readonly vendorSpending: Locator;
  readonly saveVendorButton: Locator;
  readonly addMoreButton: Locator;
  readonly fileUploadInputSelector: string;

  constructor(page: Page) {
    super(page);
    this.page = page;
    this.pageTitle = "Supplies & Services";
    this.addVendorButton = this.page.locator(
      'button[aria-label="Add vendor and expenses"]'
    );
    this.addMoreButton = this.page.locator('button[aria-label="Add more"]');
    this.vendorNameInput = this.page.locator(
      'div[class^="SideDrawer"] input[aria-label="Vendor Name"]'
    );
    this.vendorSpending = this.page.locator(
      'div[class^="SideDrawer"] input[data-testid="rd-vendor-expense-side-drawer-amount-spend"]'
    );
    this.saveVendorButton = this.page.locator(
      'div[class^="SideDrawer"] button[aria-label="Save"]'
    );
    this.fileUploadInputSelector =
      'div[class^="SideDrawer"] input[type="file"]';
  }

  static buildDefaultSupplyAndServicesAnswers(
    timestamp?: number
  ): SuppliesAndServices {
    const _default: SuppliesAndServices = {
      spend10kMoreCloudComputing: "Yes",
      cloudComputingSpendingPercentage: "25%",
      serverUsagePurpose: "Running experiments",
      spend10kMoreRDSupplies: "Yes",
      RDsuppliesSpendingPercentage: "75%",
      suppliesUsageDescription: "Running experiments",
      moreThanOneRDProject: "No, we have multiple R&D projects",
      mainRDProjectDescription: "Manufacture physical products",
      mainProjectName: `Project x ${
        timestamp === undefined
          ? generateRandomNumber(2000, 2000000)
          : timestamp
      }`,
      cloudVendorInfo: [
        {
          vendorName: "AWS",
          vendorSpending: "1000",
          receipts: ["cloud_receipts.jpg"],
        },
      ],
      supplyVendorInfo: [
        {
          vendorName: "DELL",
          vendorSpending: "1000",
          receipts: ["vendor_receipts.pdf"],
        },
        {
          vendorName: "Medic",
          vendorSpending: "20000",
          receipts: ["invoice.csv", "vendor_receipts.pdf"],
        },
      ],
    };
    return _default;
  }

  /**
   * This is the main method to handle answering questions on supplies and Services page
   * depending on some answers, extra questions will appear. This method should capture
   * all combination of questions.
   * @param options
   * @returns
   */
  async completeSuppliesAndServicesForm(options?: {
    suppliesAndServicesAnswer: SuppliesAndServices;
    timestamp?: number;
  }): Promise<SuppliesAndServices> {
    let suppliesAndServicesAnswer: SuppliesAndServices;
    if (
      options === undefined ||
      options.suppliesAndServicesAnswer === undefined
    ) {
      suppliesAndServicesAnswer =
        ECSuppliesAndServicesPage.buildDefaultSupplyAndServicesAnswers(
          options?.timestamp
        );
    } else {
      suppliesAndServicesAnswer = options.suppliesAndServicesAnswer;
    }

    if (await this.isCurrentlyActive()) {
      await this.handleButtonQuestions(
        questionMap.spend10kMoreCloudComputing,
        suppliesAndServicesAnswer.spend10kMoreCloudComputing
      );
      await this.validateSurveyQuestionSelectedAnswers(
        questionMap.spend10kMoreCloudComputing,
        suppliesAndServicesAnswer.spend10kMoreCloudComputing
      );

      if (suppliesAndServicesAnswer.spend10kMoreCloudComputing === "Yes") {
        // await this.cloudComputingSpendingPercentageQuestion.waitFor()
        await this.page
          .locator(`p:text-is("${questionMap.cloudVendorPurchase}")`)
          .waitFor();
        await this.addVendorInfo(suppliesAndServicesAnswer.cloudVendorInfo!);
        this.continueToNextQuestion();

        await this.handleButtonQuestions(
          questionMap.cloudComputingSpendingPercentage,
          suppliesAndServicesAnswer.cloudComputingSpendingPercentage!
        );
        await this.validateSurveyQuestionSelectedAnswers(
          questionMap.cloudComputingSpendingPercentage,
          suppliesAndServicesAnswer.cloudComputingSpendingPercentage!
        );
        await this.handleRadioButtonQuestions(
          questionMap.serverUsagePurpose,
          suppliesAndServicesAnswer.serverUsagePurpose!
        );
        await this.validateSurveyQuestionSelectedAnswers(
          questionMap.serverUsagePurpose,
          suppliesAndServicesAnswer.serverUsagePurpose!
        );
      }

      // await this.spend10kMoreRDSuppliesQuestion.waitFor()
      await this.handleButtonQuestions(
        questionMap.spend10kMoreRDSupplies,
        suppliesAndServicesAnswer.spend10kMoreRDSupplies
      );
      await this.validateSurveyQuestionSelectedAnswers(
        questionMap.spend10kMoreRDSupplies,
        suppliesAndServicesAnswer.spend10kMoreRDSupplies
      );
      if (suppliesAndServicesAnswer.spend10kMoreRDSupplies === "Yes") {
        await this.page
          .locator(`p:text-is("${questionMap.supplyVendorPurchase}")`)
          .waitFor();
        await this.addVendorInfo(suppliesAndServicesAnswer.supplyVendorInfo!);
        this.continueToNextQuestion();
        await this.handleButtonQuestions(
          questionMap.RDsuppliesSpendingPercentage,
          suppliesAndServicesAnswer.RDsuppliesSpendingPercentage!
        );
        await this.validateSurveyQuestionSelectedAnswers(
          questionMap.RDsuppliesSpendingPercentage,
          suppliesAndServicesAnswer.RDsuppliesSpendingPercentage!
        );
        await this.handleRadioButtonQuestions(
          questionMap.suppliesUsageDescription,
          suppliesAndServicesAnswer.suppliesUsageDescription!
        );
        await this.validateSurveyQuestionSelectedAnswers(
          questionMap.suppliesUsageDescription,
          suppliesAndServicesAnswer.suppliesUsageDescription!
        );
      }

      await this.handleButtonQuestions(
        questionMap.moreThanOneRDProject,
        suppliesAndServicesAnswer.moreThanOneRDProject
      );
      await this.validateSurveyQuestionSelectedAnswers(
        questionMap.moreThanOneRDProject,
        suppliesAndServicesAnswer.moreThanOneRDProject
      );
      await this.handleRadioButtonQuestions(
        questionMap.mainRDProjectDescription,
        suppliesAndServicesAnswer.mainRDProjectDescription
      );
      await this.validateSurveyQuestionSelectedAnswers(
        questionMap.mainRDProjectDescription,
        suppliesAndServicesAnswer.mainRDProjectDescription
      );
      await this.handleInputQuestions(
        questionMap.mainProjectName,
        suppliesAndServicesAnswer.mainProjectName
      );
      await this.continueToNextQuestion();
      await this.validateSurveyQuestionSelectedAnswers(
        questionMap.mainProjectName,
        suppliesAndServicesAnswer.mainProjectName
      );
      await this.proceedToContinue();
    } else {
      console.log("Supplies & Services page is not currently active");
    }
    return suppliesAndServicesAnswer;
  }

  async isCurrentlyActive(): Promise<boolean> {
    const step = await this.activeStep();
    return step === this.pageTitle;
  }

  /**
   * For each vendor info given, trigger side drawer using add more option and
   * fill in vendor info and save
   * @param vendorInfoList
   */
  async addVendorInfo(vendorInfoList: Array<VendorInfo>) {
    for (let i = 0; i < vendorInfoList.length; i++) {
      if (await this.addVendorButton.isVisible()) {
        this.addVendorButton.click();
      } else {
        this.addMoreButton.last().click();
      }
      await this.completeVendorSideDrawerForm(vendorInfoList[i]);
      await this.page.waitForTimeout(200);
    }
  }

  /**
   * given a list of vendor info to edit, attempt to locate the vendor info with
   * gien vendor infor name, and make edits once side drawer is triggered. If we are
   * unable to find the
   * @param originalVendorList
   * @param vendorInfoList
   * @param type
   */
  async editVendorInfo(
    originalVendorList: VendorInfo[],
    vendorInfoList: VendorInfo[],
    type: "cloud" | "supplies"
  ) {
    if (type === "cloud") {
      await this.triggerEditorForQuestion(questionMap.cloudVendorPurchase);
    } else {
      await this.triggerEditorForQuestion(questionMap.supplyVendorPurchase);
    }
    for (let i = 0; i < vendorInfoList.length; i++) {
      let vendorEntrySelector = `tr p:has-text("${originalVendorList[i].vendorName}")`;
      if (!(await this.page.locator(vendorEntrySelector).isVisible())) {
        await this.addVendorInfo([vendorInfoList[i]]);
      } else {
        await this.page.click(
          `tr p:has-text("${originalVendorList[i].vendorName}")`
        );
      }
      await this.completeVendorSideDrawerForm(vendorInfoList[i]);
      await this.page.waitForTimeout(200);
      await this.continueToNextQuestion();
    }
  }

  /**
   * given open side draw, fill in all information based on vendor info given
   * @param vendorInfo
   */
  async completeVendorSideDrawerForm(vendorInfo: VendorInfo) {
    await this.vendorNameInput.waitFor();
    await this.page.waitForTimeout(400);
    await this.vendorNameInput.fill(vendorInfo.vendorName);
    await this.vendorSpending.fill(vendorInfo.vendorSpending);

    await this.page.waitForSelector(this.fileUploadInputSelector);
    for (let j = 0; j < vendorInfo.receipts!.length; j++) {
      await this.page.setInputFiles(
        this.fileUploadInputSelector,
        path.join(
          __dirname,
          `../resources/testFiles/${vendorInfo.receipts![j]}`
        )
      );
    }
    await this.saveVendorButton.click();
  }

  /**
   * this assumns vendor table is still open, and we are just comparing
   * info scrapped from open table to given vendor info, not including uploads
   * @param vendorInfo
   */
  async validateVendorTable(vendorInfo: VendorInfo) {
    // TODO
  }
}
