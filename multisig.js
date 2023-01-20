import { TransferTransaction, Hbar, HbarUnit, Client, AccountAllowanceApproveTransaction, PrivateKey, AccountId, TransactionId, AccountBalanceQuery } from "@hashgraph/sdk"
import { readFromFile, writeToFile } from "./utils.js";
import dotenv from 'dotenv'
dotenv.config()

async function createAllowance(account1, account2, amount) {
  const client = Client.forTestnet();
  client.setOperator(account1.id, account1.privateKey);
  client.setDefaultMaxTransactionFee(new Hbar(10));

  const tx = await new AccountAllowanceApproveTransaction()
    .approveHbarAllowance(account1.id, account2.id, new Hbar(amount))
    .freezeWith(client)
    .sign(PrivateKey.fromString(account1.privateKey));

  const allowanceSubmit = await tx.execute(client);
  return await allowanceSubmit.getReceipt(client);
}

async function spendAllowance(account1, account2, account3) {
  const client = Client.forTestnet();
  client.setOperator(account1.id, account1.privateKey);
  client.setDefaultMaxTransactionFee(new Hbar(10));

  const approvedSendTx = await new TransferTransaction()
    .addApprovedHbarTransfer(account1.id, new Hbar(-20))
    .addHbarTransfer(account3.id, new Hbar(20))
    .setTransactionId(TransactionId.generate(account2.id))
    .freezeWith(client)
    .sign(PrivateKey.fromString(account2.privateKey));

  const approvedSendSubmit = await approvedSendTx.execute(client);
  return await approvedSendSubmit.getReceipt(client);
}

async function printBalance(account) {
  const client = Client.forTestnet();
  client.setOperator(account.id, account.privateKey);
  let balanceCheckTx = await new AccountBalanceQuery().setAccountId(account.id).execute(client);
  console.log(`- Account ${account.id}: ${balanceCheckTx.hbars.toString()}`);
}

async function main() {
  const accountList = readFromFile('accounts.json', 'accounts');

  const account1 = accountList[0]
  const account2 = accountList[1]
  const account3 = accountList[2]

  const create = await createAllowance(account1, account2, 20);
  await new Promise((resolve) => setTimeout(resolve, 5000));
  await printBalance(account1);
  await printBalance(account2);
  await printBalance(account3);

  const spend = await spendAllowance(account1, account2, account3);
  await new Promise((resolve) => setTimeout(resolve, 5000));
  await printBalance(account1);
  await printBalance(account2);
  await printBalance(account3);

  writeToFile('multisig.json', { create, spend })

  process.exit()
}

main().catch((error) => console.log(`Error: ${error}`))