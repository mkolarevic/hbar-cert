import { Hbar, TransferTransaction, Client, ScheduleCreateTransaction, PrivateKey, Transaction } from '@hashgraph/sdk'
import { readFromFile, writeToFile } from "./utils.js";
import dotenv from 'dotenv'
dotenv.config()

async function createScheduledTransaction() {
  const accountList = readFromFile('accounts.json', 'accounts');
  const account1 = accountList[0]
  const account2 = accountList[1]

  const client = Client.forName('testnet')
  client.setOperator(account1.id, account1.privateKey)

  const trx = await new TransferTransaction()
    .addHbarTransfer(account1.id, new Hbar(-10))
    .addHbarTransfer(account2.id, new Hbar(10))

  const scheduleTransaction = new ScheduleCreateTransaction()
    .setScheduledTransaction(trx)
    .setScheduleMemo('Scheduled tx')
    .setAdminKey(PrivateKey.fromString(account1.privateKey))
    .freezeWith(client)

  const serialized = Buffer.from(scheduleTransaction.toBytes()).toString('hex')

  console.log('Serialized transaction:', serialized)

  return serialized
}

async function processScheduled(serializedTx) {
  const accountList = readFromFile('accounts.json', 'accounts');
  const account1 = accountList[0]
  const client = Client.forName('testnet')
  client.setOperator(account1.id, account1.privateKey)

  const txn = Transaction.fromBytes(Buffer.from(serializedTx, 'hex'))

  await txn.sign(PrivateKey.fromString(account1.privateKey))

  const executed = await txn.execute(client)

  return executed.getReceipt(client)
}

async function main() {
  const serializedTx = await createScheduledTransaction()
  const receipt = await processScheduled(serializedTx)
  console.log('Successfully created and executed scheduled transaction with status', receipt.status)


  writeToFile('scheduledTx.json', { serializedTx, receipt })
}

await main()