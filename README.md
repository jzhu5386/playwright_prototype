# playwright_prototype
This project is a prototype to investigate the feasibility of using playwright for testing needs with MS app.
There are several criteria deem important when evaluating this test runner:
1. ability to handle multiple tab testing target=_blank is frequently used in MS app
2. ability to handle multi browser testing. Treasury managment requires interaction with mulitple internal/external application at same time, having isolated context for each of them is important.
3. ease of use. provides easy selector definitions, video/screenshot capture on failures and commandline CI for CI integration
4. ability to group and slice testsuites for targeted runs
5. ability to provide API testing (mostly used for faster test account setup)

reference:
https://playwright.dev/docs/intro

## Installation:
```sh
yarn
```

## Each time playwright is updated, you'd also need to install corresponding browsers:
```sh 
npx playwright install 
```

## Test credential:
In order to run the test, you will need to download a set of credential files found in QA Automation Credentials Folder in LastPass and placed them under following structure:
```sh
yunzhun@MainStreet-Zhun playwright_prototype % cd tests/resources
yunzhun@MainStreet-Zhun resources % ll
total 24
drwxr-xr-x   6 yunzhun  staff   192B Mar  1 21:51 ./
drwxr-xr-x   7 yunzhun  staff   224B Feb  2 21:14 ../
-rw-r--r--@  1 yunzhun  staff   8.0K Mar  2 10:24 .DS_Store
drwxr-xr-x   4 yunzhun  staff   128B Jan  6 10:28 gmailTokens/
drwxr-xr-x   7 yunzhun  staff   224B Mar  2 10:25 testAccounts/
drwxr-xr-x  18 yunzhun  staff   576B Feb 20 09:22 testFiles/
yunzhun@MainStreet-Zhun resources % ll gmailTokens
total 16
drwxr-xr-x  4 yunzhun  staff   128B Jan  6 10:28 ./
drwxr-xr-x  6 yunzhun  staff   192B Mar  1 21:51 ../
-rw-r--r--  1 yunzhun  staff   431B Jan  6 10:28 qamainstreet@gmail.com_credentials.json
-rw-r--r--  1 yunzhun  staff   411B Jan  6 10:28 qamainstreet@gmail.com_token.json
yunzhun@MainStreet-Zhun resources % ll testAccounts
total 40
drwxr-xr-x  7 yunzhun  staff   224B Mar  2 10:25 ./
drwxr-xr-x  6 yunzhun  staff   192B Mar  1 21:51 ../
-rw-r--r--  1 yunzhun  staff   693B Mar  2 10:25 qa_external_credentials.json
-rw-r--r--  1 yunzhun  staff   392B Feb 16 20:02 qa_ops_auth0_account.json
-rw-r--r--  1 yunzhun  staff   2.3K Jan 13 13:49 qa_sa_staging_service_account.json
-rw-r--r--  1 yunzhun  staff   206B Feb 19 11:06 qa_target_audience.json
```

## Sample commandlines:
### To run all tests with in Treasury management folder:
```sh
yarn test_treasury_management
```

### To run a single test:
```sh
npx playwright test tests/specs/TreasuryManagement/TM_kyc_flow_KYCreview.spec.ts
```

### To run test in debug mode:
```sh
npx playwright test tests/specs/TreasuryManagement/TM_kyc_flow_KYCreview.spec.ts --debug
```

## Here's a basic run down of how file are organized:
```sh
tests/
  - helpers/ # collections of helper functions for gmail parsing, proxy-authorization/token bypass, random-generators
        - ExternalAPIHelpers.ts
        - GmailHelper.ts
        - TestObjects.ts
        - OnboardingAPIActions.ts
        - TMAPIActions.ts
        - TokenHelpers.ts
        - Untils.ts
  - pages/ # collection of page objects, each object corresponds to a page on MS app.
        - AccountsPage.ts
        ...
        - TMPage.ts
  - resources/ # collection of test files and credentials used for upload testing
        - gmailTokens/
        - testAccounts/
        - testFiles
  - specs/ # collection of testsuites organized in targed associated folders
        - ExpenseClassification/
        - LoginAndAccounts/
        - Onboarding/
        - Procurement/
        - Qualifying_Billing/
        - TreasuryManagement/
```
