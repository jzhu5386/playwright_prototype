import { APIRequestContext, Page, expect } from "@playwright/test";
import { CompanyDetails, EmployeeDetails, User } from "./TestObjects";
import { getCurrentYear } from "./Utils";

export async function createNewUserAPI(
  apiContext: APIRequestContext,
  newUser: User
): Promise<string> {
  const response = await apiContext.post("/api/v1/auth/signup", {
    data: {
      primaryUserEmail: newUser.email,
      primaryUserFirstName: newUser.firstName,
      primaryUserLastName: newUser.lastName,
      adminPassword: newUser.password,
      adminPasswordConfirmation: newUser.confirmPassword,
      referrer: "",
      creditCategories: [],
      procurement: false,
    },
  });
  expect(response.ok()).toBeTruthy();
  const userInfo = await response.json();
  console.log(
    `created new user: ${userInfo.data.company.adminEmail} companyId: ${userInfo.data.company.id}`
  );
  return userInfo.data.company.id;
}
