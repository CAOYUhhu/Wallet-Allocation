//通过主钱包往其他的钱包打ETH
import { BigNumber, providers, Wallet, Contract, utils, getDefaultProvider} from "ethers";
import { checkSimulation, gasPriceToGwei, printTransactions } from "./utils";
import * as dotenv from 'dotenv'  //用来从.env中加载配置文件
import { TransactionRequest } from "@ethersproject/abstract-provider";
import { isAddress, parseUnits } from "ethers/lib/utils";


dotenv.config();
require('log-timestamp');
//——————————————————先从.env读取基本参数————————————————————————
let Number_wallet = Number(process.env.Number_wallet);

const PRICE = process.env.PRICE;

const GWEI = BigNumber.from(10).pow(9);//大数字
const PRIORITY_GAS_PRICE = GWEI.mul(Number(process.env.PRIORITY_GAS_FEE));
const MAX_FEE_PER_GAS = GWEI.mul(Number(process.env.MAX_FEE_PER_GAS));

const addressFrom=process.env.RECIPIENT0||""

const PRIVATE_KEY_SPONSOR_ALL=[
process.env.PRIVATE_KEY_SPONSOR0,
process.env.PRIVATE_KEY_SPONSOR1,
process.env.PRIVATE_KEY_SPONSOR2,
process.env.PRIVATE_KEY_SPONSOR3,
process.env.PRIVATE_KEY_SPONSOR4,
process.env.PRIVATE_KEY_SPONSOR5,
process.env.PRIVATE_KEY_SPONSOR6,
process.env.PRIVATE_KEY_SPONSOR7,
process.env.PRIVATE_KEY_SPONSOR8,
process.env.PRIVATE_KEY_SPONSOR9
];
const RECIPIENT_ALL=[
process.env.RECIPIENT0,
process.env.RECIPIENT1,
process.env.RECIPIENT2,
process.env.RECIPIENT3,
process.env.RECIPIENT4,
process.env.RECIPIENT5,
process.env.RECIPIENT6,
process.env.RECIPIENT7,
process.env.RECIPIENT8,
process.env.RECIPIENT9
];

let walletIndex = 1;
let PRIVATE_KEY_SPONSOR=process.env.PRIVATE_KEY_SPONSOR0|| "";
let RECIPIENT=RECIPIENT_ALL[walletIndex]|| "";

//——————————————————先从.env读取基本参数————————————————————————








async function run() {
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
  let ii=0;
  while (ii<Number_wallet) {
    try {
      RECIPIENT=RECIPIENT_ALL[ii+1]|| "";
      await main(PRIVATE_KEY_SPONSOR, RECIPIENT).then(() => ii++).catch(async (e) => {
        console.warn(e);
        await delay(5000)
      });
    } catch (e) {
      console.log('failed:', e)
    }
  }
}


run()

async function main(PRIVATE_KEY_SPONSOR : string, RECIPIENT : string) {

    // ======= UNCOMMENT FOR MAINNET ==========
    //let provider = getDefaultProvider('homestead'); //链接到主网默认节点
    const provider = new providers.InfuraProvider('rinkeby', process.env.INFURA_API_KEY) //只需要最后一段API，不需要http什么的
    // ======= UNCOMMENT FOR MAINNET ==========





        // ======= 创建钱包==========\
        const walletSponsor = new Wallet(PRIVATE_KEY_SPONSOR)
        // ======= 创建钱包==========
        const nonce = await provider.getTransactionCount(addressFrom, "latest");


        const gasPrice = await provider.getGasPrice();// Get gas price
        console.log('gasPrice', gasPriceToGwei(gasPrice), 'Gwei')
        const network = await provider.getNetwork();// Get network
        const { chainId } = network;//Transaction object

        //这个地方要填对数据，包括价格，不然估算不了gas
        const transaction = {
        from: addressFrom,
        to: RECIPIENT,
        value: parseUnits(String(PRICE)),
        data: ''
        };
        const estimatedGas = await provider.estimateGas(transaction);
        console.log('estimatedGas', estimatedGas.toString())
        const estimatedGasInput=estimatedGas;
        console.log('estimatedGasInput', estimatedGasInput.toString())
        const transactionInput = {
           from: addressFrom,
           to: RECIPIENT,
           nonce: nonce,
           value: parseUnits(String(PRICE)),
           chainId: chainId,
           gasPrice,
           gasLimit: estimatedGasInput,
           data: ''
        };

        const signedTx = await walletSponsor.signTransaction(transactionInput);//Sign & Send transaction
        //console.log('signedTx', signedTx)
        const transactionReceipt = await provider.sendTransaction(signedTx);
        //console.log('transactionReceipt', transactionReceipt)
        await transactionReceipt.wait();
        const hash = transactionReceipt.hash;
        console.log("Your Transaction Hash is:", hash);
        const receipt = await provider.getTransactionReceipt(hash);// Get transaction receipt
        console.log("Transferred:", String(PRICE), 'ETH  TO ', RECIPIENT);
    }

