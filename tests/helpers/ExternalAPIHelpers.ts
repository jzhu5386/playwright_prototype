import axios from "axios";
import external_api_keys from "../resources/testAccounts/qa_external_api_keys.json";

/**
 * amound in dollars
 * @param acount : in form of dollars
 * @returns
 */
export const transferFunds = async (amount: number) => {
  console.log(`transfering: ${amount} to MT`);
  let keys = `${external_api_keys.modernTreasury.org_id}:${external_api_keys.modernTreasury.sandbox_api_key}`;
  let buff = Buffer.from(keys);
  let base64data = buff.toString("base64");
  const res = await axios.post(
    "https://app.moderntreasury.com/api/simulations/incoming_payment_details/create_async",
    {
      type: "wire",
      direction: "credit",
      amount: amount * 100, //convert dolar to cents
      internal_account_id: external_api_keys.modernTreasury.internal_account_id,
    },
    {
      headers: {
        Accept: "*/*",
        "Accept-Language": "en-US,en;q=0.5",
        Authorization: `Basic ${base64data}`,
        "Content-Type": "application/json",
      },
    }
  );
  console.log(await res.data);
};
