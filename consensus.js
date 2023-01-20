import {
  Client,
  PrivateKey,
  TopicCreateTransaction,
  TopicMessageSubmitTransaction,
  TopicMessageQuery
} from "@hashgraph/sdk";
import { readFromFile, writeToFile } from "./utils.js";
import dotenv from "dotenv";

dotenv.config('.env');

const accountList = readFromFile('accounts.json', 'accounts');

const accountId1 = accountList[0].id;
const privateKey1 = PrivateKey.fromString(accountList[0].privateKey);

async function main() {
  const client = Client.forTestnet();
  client.setOperator(accountId1, privateKey1);

  // CREATE TOPIC
  let txResponse = await new TopicCreateTransaction().execute(client);
  let receipt = await txResponse.getReceipt(client);

  let topicId = receipt.topicId;

  console.log(`The newly created topic ID is: ${topicId}`);

  // Timeout to get the network time to process this request before continuing with another action
  await new Promise((resolve) => setTimeout(resolve, 5000));

  // SEND MESSAGE
  const sendResponse = await new TopicMessageSubmitTransaction({
    topicId,
    message: new Date().toTimeString()
  })
    .execute(client);

  const getReceipt = await sendResponse.getReceipt(client);

  console.log('Message receipt:');
  console.log(JSON.stringify(getReceipt));

  writeToFile('consensus.json', { topicId, getReceipt });

  console.log(`The message transaction status is: ${getReceipt.status}`);

  console.log(`Link to topic: https://hashscan.io/testnet/topic/${topicId}`);

  // SUBSCRIBE/READ TOPIC
  new TopicMessageQuery()
    .setTopicId(topicId)
    .setStartTime(0)
    .subscribe(
      client,
      (message) => console.log(Buffer.from(message.contents, "utf8").toString())
    );

}

main();