import { promises as fs } from "fs";
import readline from "readline";
import { google, Auth, gmail_v1 } from "googleapis";
import path from "path";

const SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"];

const TOKEN_PATH = path.join(__dirname, "../resources/gmailTokens");
let NEW_TOKEN_PATH = "token.json";

/**
 * given authentication and email address, obtain oAuth2Client
 * @param {*} emailAddress
 */
export async function authorize(
  emailAddress: string
): Promise<Auth.OAuth2Client> {
  const credFile: Buffer = await fs.readFile(
    path.join(TOKEN_PATH, `${emailAddress}_credentials.json`)
  );
  const credentials = JSON.parse(credFile.toString());

  const { client_secret, client_id, redirect_uris } = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );

  // Check if we have previously stored a token.
  try {
    const token = await fs.readFile(
      path.join(TOKEN_PATH, `${emailAddress}_token.json`)
    );
    oAuth2Client.setCredentials(JSON.parse(token.toString()));
  } catch {
    NEW_TOKEN_PATH = path.join(TOKEN_PATH, `${emailAddress}_token.json`);
    return getNewToken(oAuth2Client);
  }
  return oAuth2Client;
}

/**
 * if token file was not defined or expired, this method is called that triggers UI
 * to allow authentication and token update
 * @param {} oAuth2Client
 */
async function getNewToken(
  oAuth2Client: Auth.OAuth2Client
): Promise<Auth.OAuth2Client> {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
  });
  console.log("Authorize this app by visiting this url:", authUrl);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const code: string = await new Promise((send) => {
    rl.question("Enter the code from that page here: ", send);
  });

  rl.close();
  const token: Auth.Credentials = await new Promise((success, fail) =>
    oAuth2Client.getToken(code, (err, token) => {
      if (err) {
        console.error("Error retrieving access token", err);
        fail(err);
        return;
      }
      success(token!);
    })
  );
  oAuth2Client.setCredentials(token);

  // Store the token to disk for later program executions
  await fs.writeFile(NEW_TOKEN_PATH, JSON.stringify(token));
  console.log("Token stored to", NEW_TOKEN_PATH);
  return oAuth2Client;
}

/**
 * given query and oAuth2Client, return list of messageId that matches search query
 * search query can be defined using reference https://support.google.com/mail/answer/7190
 * https://developers.google.com/gmail/api/reference/rest/v1/users.messages/list
 * This method attemtps to wait for message with 5s wait interval for 10 times.
 * @param {} auth
 * @param {*} q
 */
export async function listMessages(
  auth: Auth.OAuth2Client,
  q: gmail_v1.Params$Resource$Users$Messages$List
): Promise<string[]> {
  let messageId: string[] = [];
  let retry = 10;
  while (messageId.length === 0 && retry > 0) {
    const gmail = google.gmail({ version: "v1", auth });
    const res = await new Promise((resolve, reject) =>
      gmail.users.messages.list(q, (err, result) => {
        if (err) return reject(err);
        resolve(result!);
      })
    );
    const messages = res.data.messages;
    if (messages !== undefined && messages.length) {
      messages.forEach((message) => {
        messageId.push(message.id);
      });
    }
    if (messageId.length === 0) {
      console.log("attempting to wait for 10s");
      await new Promise((resolve, reject) => {
        setTimeout(function () {
          resolve("anything");
        }, 10000);
      });
      retry--;
    }
  }
  return messageId;
}

/**
 * given oAuth2Client and messageId, retrieve message content based on ID and
 * parse body content. Decode it into html body and return full content.
 * https://developers.google.com/gmail/api/reference/rest/v1/users.messages/get
 * @param {*} auth
 * @param {*} messageId
 */
export async function extractMessageContentAsHTML(
  auth: Auth.OAuth2Client,
  messageId: string
): Promise<string> {
  const gmail = google.gmail({ version: "v1", auth });
  const res = await new Promise((resolve, reject) =>
    gmail.users.messages.get({ userId: "me", id: messageId }, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    })
  );
  // 64decode body, it will decode to html format
  let html_body = "";
  const contents = res.data.payload.parts;
  contents.forEach((content) => {
    if (content.mimeType === "text/html") {
      html_body = Buffer.from(content.body.data, "base64").toString("utf-8");
    }
  });
  return html_body;
}

/**
 * given oAuth2Client and messageId, retrieve message content based on ID and
 * parse body content. Decode it into html body and return full content.
 * https://developers.google.com/gmail/api/reference/rest/v1/users.messages/get
 * @param {*} auth
 * @param {*} messageId
 */
export async function extractMessageContentAsPlainText(
  auth: Auth.OAuth2Client,
  messageId: string
): Promise<string> {
  const gmail = google.gmail({ version: "v1", auth });
  const res = await new Promise((resolve, reject) =>
    gmail.users.messages.get({ userId: "me", id: messageId }, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    })
  );
  // 64decode body, it will decode to text format
  let text_body = "";
  const contents = res.data.payload.parts;
  contents.forEach((content) => {
    if (content.mimeType === "text/plain") {
      text_body = Buffer.from(content.body.data, "base64").toString("utf-8");
    }
  });
  return text_body;
}
