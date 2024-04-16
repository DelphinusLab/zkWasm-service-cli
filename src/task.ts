import fs from "fs";
import { ethers } from "ethers";
import { parse } from "path";
import { signMessage, askQuestion } from "./util";
import {
  ZkWasmServiceHelper,
  WithSignature,
  ProvingParams,
  AddImageParams,
  ZkWasmUtil,
  AppConfig,
  ImageMetadataKeys,
  ImageMetadataValsProvePaymentSrc,
} from "zkwasm-service-helper";

import { queryTask, getAvailableImages } from "./query";

interface AddNewWasmImageRes {
  md5 : string,
  id : string,
}

export async function addNewWasmImage(
  resturl: string,
  absPath: string,
  user_addr: string,
  imageName: string,
  description_url: string,
  avator_url: string,
  circuit_size: number,
  priv: string,
  creator_paid_proof: boolean,
) : Promise<AddNewWasmImageRes> {
  const filename = parse(absPath).base;
  let fileSelected: Buffer = fs.readFileSync(absPath);

  const metadata_keys = [ ImageMetadataKeys.ProvePaymentSrc ];
  const metadata_vals = [ creator_paid_proof ? ImageMetadataValsProvePaymentSrc.CreatorPay : ImageMetadataValsProvePaymentSrc.Default]; 

  let md5 = ZkWasmUtil.convertToMd5(new Uint8Array(fileSelected));
  let info: AddImageParams = {
    name: filename,
    image_md5: md5,
    image: fileSelected,
    user_address: user_addr.toLowerCase(),
    description_url: description_url,
    avator_url: avator_url,
    circuit_size: circuit_size,
    metadata_keys: metadata_keys,
    metadata_vals: metadata_vals,
  };
  let msg = ZkWasmUtil.createAddImageSignMessage(info);
  let signature: string;
  try {
    console.log("msg is:", msg);
    signature = await signMessage(msg, priv);
    console.log("signature is:", signature);
  } catch (e: unknown) {
    console.log("sign error: ", e);
    throw e
  }
  let task: WithSignature<AddImageParams> = {
    ...info,
    signature,
  };

  let helper = new ZkWasmServiceHelper(resturl, "", "");
  return helper.addNewWasmImage(task).then((res) => {
    console.log("Add Image Response", res);
    return res as AddNewWasmImageRes
  }).catch((err) => {
    console.log("Add Image Error", err);
    throw err
  }).finally(()=>
    console.log("Finish addNewWasmImage!")
  )
}

export async function addProvingTask(
  resturl: string,
  user_addr: string,
  image_md5: string,
  public_inputs: string,
  private_inputs: string,
  priv: string,
) {
  let helper = new ZkWasmServiceHelper(resturl, "", "");
  let pb_inputs: Array<string> = ZkWasmUtil.validateInputs(public_inputs);
  let priv_inputs: Array<string> = ZkWasmUtil.validateInputs(private_inputs);

  let info: ProvingParams = {
    user_address: user_addr.toLowerCase(),
    md5: image_md5,
    public_inputs: pb_inputs,
    private_inputs: priv_inputs,
  };
  let msgString = ZkWasmUtil.createProvingSignMessage(info);

  let signature: string;
  try {
    signature = await signMessage(msgString, priv);
  } catch (e: unknown) {
    console.log("error signing message", e);
    return;
  }

  let task: WithSignature<ProvingParams> = {
    ...info,
    signature: signature,
  };

  await helper.addProvingTask(task);
  console.log("Finish addProvingTask!");
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runProveTasks(
  resturl: string,
  user_addr: string,
  image_md5s: string[],
  priv: string,
  public_inputs: string,
  private_inputs: string,
  num_prove_tasks : number,
  send_rate : number,
  in_parallel : boolean
) {

  if (!in_parallel) {

    for (let i = 0; i < num_prove_tasks; i++) {
      await addProvingTask(
        resturl,
        user_addr,
        image_md5s[i % image_md5s.length],
        public_inputs,
        private_inputs,
        priv
      );

      await sleep(send_rate);
    }
  } else {

    // execute all unique images in parrallel

    let i = 0;
    while (i < num_prove_tasks) {
    
      let tasks = []
      for (const md5 of image_md5s) {
        tasks.push(addProvingTask(
          resturl,
          user_addr,
          md5,
          public_inputs,
          private_inputs,
          priv
        ));

        i++;
      }

      await Promise.all(tasks);
      await sleep(send_rate);
    }
  }
}

async function runQueryTasks(
  resturl: string,
  task_ids: string[],
  num_query_tasks : number,
  send_rate : number,
  in_parallel : boolean,
) {

  if (!in_parallel) {

    for (let i = 0; i < num_query_tasks; i++) {
      await queryTask(
        task_ids[i % task_ids.length],
        resturl,
        false,
      );

      await sleep(send_rate);
    }

  } else {

    // execute all unique images in parrallel

    let i = 0;
    while (i < num_query_tasks) {
    
      let tasks = []
      for (const task_id of task_ids) {
        tasks.push(queryTask(
          task_id,
          resturl,
          false,
        ));

        i++;
      }

      await Promise.all(tasks);
      await sleep(send_rate);
    }


  }
}

export async function pressureTest(
  resturl: string,
  user_addr: string,
  priv: string,
  public_inputs: string,
  private_inputs: string,
  num_prove_tasks : number,
  num_query_tasks : number,
) {

  const images_detail = await getAvailableImages(resturl, user_addr);

  let image_md5s : string[] = [];
  let task_ids : string[] = [];

  for (const d of images_detail) {
    if (!image_md5s.find((x) => x == d.md5)) {
      image_md5s.push(d.md5);
    }
    if (!task_ids.find((x) => x == d._id["$oid"])) {
      task_ids.push(d._id["$oid"]);
    }
  }

  const tasks = [
    runProveTasks(
      resturl,
      user_addr,
      image_md5s,
      priv,
      public_inputs,
      private_inputs,
      num_prove_tasks,
      1,
      false,
    ), 
    runQueryTasks(
      resturl,
      task_ids,
      num_query_tasks,
      1,
      false,
    ),
  ];

  await Promise.all(tasks);

  console.log("Finished pressure test");
}

/*
export async function addDeployTask(
  resturl: string,
  user_addr: string,
  image_md5: string,
  chain_id: number,
  priv: string
) {
  let helper = new ZkWasmServiceHelper(resturl, "", "");

  let info: DeployParams = {
    user_address: user_addr.toLowerCase(),
    md5: image_md5,
    chain_id: chain_id,
  };
  let msgString = ZkWasmUtil.createDeploySignMessage(info);
  let signature: string;
  try {
    signature = await signMessage(msgString, priv);
  } catch (e: unknown) {
    console.log("error signing message", e);
    return;
  }
  let task: WithSignature<DeployParams> = {
    ...info,
    signature: signature,
  };

  await helper.addDeployTask(task);
  console.log("Finish addDeployTask!");
}*/

export async function addNewPayment(
  resturl: string,
  providerUrl: string,
  amount: string,
  priv: string
) {
  //Sign a transaction with the users private key, submit it on chain and wait for it to be mined.
  const provider = new ethers.JsonRpcProvider(providerUrl);
  const wallet = new ethers.Wallet(priv, provider);
  const parsedAmount = ethers.parseEther(amount);
  console.log("Depositing " + parsedAmount + " ETH for user " + wallet.address);
  //create the transaction and sign it
  //Get the receiver address from the zkWasm service.
  let helper = new ZkWasmServiceHelper(resturl, "", "");
  let config = (await helper.queryConfig()) as AppConfig;
  let receiverAddress = config.receiver_address;
  console.log("receiverAddress is:", receiverAddress);
  let ans = await askQuestion(
    "Are you sure you want to send " +
      amount +
      " ETH to " +
      receiverAddress +
      "? (y/n)"
  );
  if (ans === "n" || ans === "N") {
    console.log("User cancelled the transaction.");
    return;
  }
  if (ans !== "y" && ans !== "Y") {
    console.log("Invalid input, please input y or n.");
    return;
  }
  console.log("Waiting for transaction to be mined...");
  const tx = await wallet.sendTransaction({
    to: receiverAddress,
    value: parsedAmount,
  });
  // wait for the transaction to be mined
  await tx.wait();
  console.log("Sending transaction hash to zkWasm service...");
  //Then submit the confirmed transaction hash to the zkWasm service.
  await helper.addPayment({ txhash: tx.hash });

  console.log("Finish addPayment!");
}

export async function addPaymentWithTx(txhash: string, resturl: string) {
  let helper = new ZkWasmServiceHelper(resturl, "", "");
  console.log("Sending transaction hash " + txhash + " to zkWasm service...");
  await helper.addPayment({ txhash: txhash });
}
