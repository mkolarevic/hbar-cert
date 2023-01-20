import { Client, TransferTransaction } from '@hashgraph/sdk'
import { readFromFile } from "./utils.js";
import dotenv from 'dotenv'
dotenv.config()

async function fundAccounts(from, to, amount, client) {
  const trx = await new TransferTransaction()
    .addHbarTransfer(from.id, -amount)
    .addHbarTransfer(to.id, amount)
    .execute(client)

  const receipt = await trx.getReceipt(client)

  console.log(`Receipt: ${receipt.status}`);
}

async function main() {
  const accountList = await readFromFile('accounts.json', 'accounts');
  const accountId = process.env.MY_ACCOUNT_ID;
  const privateKey = process.env.MY_PRIVATE_KEY;

  const client = Client.forName('testnet');
  client.setOperator(accountId, privateKey);

  for await (const acc of accountList) {
    await fundAccounts({ id: accountId }, acc, 500, client)
  }
}

dotenv.config()

await main()

process.exit(0)