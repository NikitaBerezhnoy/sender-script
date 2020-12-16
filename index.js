require('dotenv').config();
const Papa = require('papaparse');
const fs = require('fs');
const Web3 = require('web3');
const HDWalletProvider = require("@truffle/hdwallet-provider");
let abi = require('./abi.json');

let provider = new HDWalletProvider({
    privateKeys: [
        process.env.PRIVATE_KEY
    ],
    providerOrUrl: process.env.PROVIDER
});

const web3 = new Web3(provider);


let csv = fs.readFileSync('./distribution.csv', 'utf8');

let distribution = Papa.parse(csv).data
    .map(el => el[1])
    .map(el =>
        JSON.parse(`{${el}}`)
    );

let vaultInstance = new web3.eth.Contract(abi, process.env.VAULT_ADDRESS);

const BATCH_SIZE = Number(process.env.BATCH_SIZE);
let fromAddress = process.env.ACCOUNT_ADDRESS;
if (!fromAddress) throw new Error('fromAddress must be set');
let batchesNumber = Math.ceil(distribution.length / BATCH_SIZE);
console.log(`\nBatches - ${batchesNumber}\nBenefecaries - ${distribution.length}\nBatch size - ${BATCH_SIZE}\n`);
let distributionPointer = Number(process.env.START_AT);
const gasPrice = Number(process.env.GAS_PRICE);
(async () => {
    let left = distribution.length;
    for (let i = 0; i < batchesNumber; i++) {
        let arguments = getDistributionArguments(BATCH_SIZE, distributionPointer);
        console.log(`Pointer - ${distributionPointer}`);
        console.log(`Last address in this batch - ${arguments[0][arguments[0].length-1]}`)
        let gasEstimate = await vaultInstance.methods.addAllocations(arguments[0], arguments[1], arguments[2]).estimateGas({
            from: fromAddress,
            gas: 8000000
        });
        console.log(`Gas estimation for this batch - ${gasEstimate}`);
        console.log(`\nSending tx...`)
        let receipt = await vaultInstance.methods.addAllocations(arguments[0], arguments[1], arguments[2]).send({
            from: fromAddress,
            gas: 8000000
        });
        console.log(`Done. Tx hash - ${receipt.transactionHash}\n`);
        distributionPointer = distributionPointer + BATCH_SIZE;
    }
})().catch(err => {
    console.log(err);
    provider.engine.stop();
});
provider.engine.stop();

function getDistributionArguments(size, from) {
    let batch = distribution.slice(from, from + size);
    let addresses = batch.map(el => el.address);
    let amounts = batch.map(el => el.amount);
    let groups = batch.map(el => el.group);
    return [addresses, amounts, groups];
}