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
  Image,
  Task,
} from "zkwasm-service-helper";

import { queryTask, queryTasksWithMd5, getAllAvailableImages, queryImage, queryUser, queryConfig, queryTxHistory, queryStatistics, queryDispositHistory, queryUserSubscription, queryTaskByTypeAndStatus, queryTasksWithMd5AndTaskType, queryTasksWithUserAddress, queryTasksWithUserAddressAndMd5, queryTasksWithStatus, queryTasksWithStatusAndMd5 } from "./query";

import { MongoClient, Db, Collection, ExplainVerbosity, Document, UpdateResult, WithId } from "mongodb";

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
) {
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
    return;
  }
  let task: WithSignature<AddImageParams> = {
    ...info,
    signature,
  };

  let helper = new ZkWasmServiceHelper(resturl, "", "");
  await helper.addNewWasmImage(task).then((res) => {
    console.log("Add Image Response", res);
  }).catch((err) => {
    console.log("Add Image Error", err);
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
  enable_logs : boolean = true,
) : Promise<boolean> {
  let helper = new ZkWasmServiceHelper(resturl, "", "", enable_logs);
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
    if (enable_logs) {
      console.log("error signing message", e);
    }
    return false;
  }

  let task: WithSignature<ProvingParams> = {
    ...info,
    signature: signature,
  };

  return await helper.addProvingTask(task).then((res) => {
    if (enable_logs) {
      console.log("Add Proving task Response", res);
    }
    return true;
  }).catch((err) => {
    if (enable_logs) {
      console.log("Add Proving task Error", err);
    }
    return false;
  });
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}


async function sendIntervaledRequests(
  tot_ms: number,
  interval_ms: number,
  n_req: number,
  request_fn: (i : number) => Promise<void>,
  finish_fn : () => void,
) {
    const start_t = Date.now();
    let req_cnt = 0;

    for (let curr_t = Date.now(); curr_t - start_t < tot_ms && req_cnt < n_req; curr_t = Date.now()) {
        await request_fn(req_cnt);
        req_cnt++;
        await sleep(interval_ms);
    }

    finish_fn();
}

async function runProveTasks(
  resturl: string,
  user_addr: string,
  image_md5s: string[],
  priv: string,
  public_inputs: string,
  private_inputs: string,
  num_prove_tasks : number,
  interval_ms : number,
  total_time_ms : number,
  original_interval_ms : number,
  enable_logs : boolean,
) {
  let interval_succ_cnt = 0;
  let interval_fail_cnt = 0;
  let secs = 0;
  const interval_id = setInterval(() => {
    console.log("Prove: t =", secs, "\tsucc =", interval_succ_cnt, "\tfail = ", interval_fail_cnt);
    interval_succ_cnt = 0;
    interval_fail_cnt = 0;
    secs++;
  }, original_interval_ms);

  let n_success = 0;
  sendIntervaledRequests(total_time_ms, interval_ms, num_prove_tasks,
    async (i : number) => {
      const success = await addProvingTask(
        resturl,
        user_addr,
        image_md5s[i % image_md5s.length],
        public_inputs,
        private_inputs,
        priv,
        enable_logs,
      );
      if (success) {
        n_success++;
        interval_succ_cnt++;
      } else {
        interval_fail_cnt++;
      }
    },
    () => {
      console.log("\n");
      console.log("-".repeat(72));
      console.log("Finished sending prove requests, cumulative stats:");
      console.log("\tNumber of successful prove tasks sent", n_success, "out of", num_prove_tasks);
      console.log("\tProve task success rate", n_success/num_prove_tasks * 100, "%");

      clearInterval(interval_id);
    }
  );
}

async function runQueryTasks(
  resturl: string,
  user_address: string,
  image_md5s: string[],
  task_ids: string[],
  user_addresses: string[],
  num_query_tasks : number,
  interval_ms : number,
  total_time_ms : number,
  original_interval_ms : number,
  enable_logs : boolean,
  query_tasks_only : boolean,
) {
  let interval_succ_cnt = 0;
  let interval_fail_cnt = 0;
  let secs = 0;
  const interval_id = setInterval(() => {
    console.log("Query: t =", secs, "\tsucc =", interval_succ_cnt, "\tfail = ", interval_fail_cnt);
    interval_succ_cnt = 0;
    interval_fail_cnt = 0;
    secs++;
  }, original_interval_ms);

  let n_success = 0;
  sendIntervaledRequests(total_time_ms, interval_ms, num_query_tasks,
    async (_ : number) => {
      const query_fn = getRandomQuery(image_md5s, task_ids, user_addresses, resturl, user_address, enable_logs, query_tasks_only);
      const success = await query_fn();
      if (success) {
        n_success++;
        interval_succ_cnt++;
      } else {
        interval_fail_cnt++;
      }
    },
    () => {
      console.log("\n");
      console.log("-".repeat(72));
      console.log("Finished sending query requests, cumulative stats:");
      console.log("\tNumber of successful query tasks sent", n_success, "out of", num_query_tasks);
      console.log("\tQuery task success rate", n_success/num_query_tasks * 100, "%");

      clearInterval(interval_id);
    }
  );
}

async function getMd5sAndTaskIds(
  resturl: string,
  user_addr: string,
) : Promise<[string[], string[], string[]]> {
  const images_detail = await getAllAvailableImages(resturl, false);

  let image_md5s : string[] = [];
  let task_ids : string[] = [];
  let user_addresses : string[] = [];

  for (const d of images_detail) {
    if (!image_md5s.find((x) => x === d.md5)) {
      image_md5s.push(d.md5);
    }
    if (!user_addresses.find((x) => x === d.user_address)) {
      user_addresses.push(d.user_address);
    }
    if (!task_ids.find((x) => x === (d._id["$oid"] as string))) {
      task_ids.push(d._id["$oid"]);
    }
  }

  return [image_md5s, task_ids, user_addresses];
}

function getRandIdx(length: number): number {
    return Math.floor(Math.random() * length)
}

function getRandomQuery(
  image_md5s : string[],
  task_ids : string[],
  user_address : string[],
  resturl: string,
  user_addr: string,
  enable_logs : boolean,
  query_tasks_only : boolean,
) : () => Promise<boolean> {
  const task_types = ["Setup", "Prove", "Reset"];
  const task_statuses = ["Pending", "Processing", "DryRunFailed", "Done", "Fail", "Stale"];
  const fn_list = [
    () => queryTasksWithMd5(image_md5s[getRandIdx(image_md5s.length)], resturl, enable_logs),
    () => queryTasksWithMd5AndTaskType(image_md5s[getRandIdx(image_md5s.length)], task_types[getRandIdx(task_types.length)], resturl, enable_logs),
    () => queryTasksWithUserAddress(user_address[getRandIdx(user_address.length)], resturl, enable_logs),
    () => queryTasksWithUserAddressAndMd5(user_address[getRandIdx(user_address.length)], image_md5s[getRandIdx(image_md5s.length)], resturl, enable_logs),
    () => queryTasksWithStatus(task_statuses[getRandIdx(task_statuses.length)], resturl, enable_logs),
    () => queryTasksWithStatusAndMd5(task_statuses[getRandIdx(task_statuses.length)], image_md5s[getRandIdx(image_md5s.length)], resturl, enable_logs),
    () => queryTask(task_ids[getRandIdx(task_ids.length)], resturl, enable_logs),
    () => {
      const task_types = ["Setup", "Prove", "Reset"];
      const task_statuses = ["Pending", "Processing", "DryRunFailed", "Done", "Fail", "Stale"];
      return queryTaskByTypeAndStatus(
        task_types[getRandIdx(task_types.length)],
        task_statuses[getRandIdx(task_statuses.length)],
        resturl,
        enable_logs
      );
    },
  ];

  if (!query_tasks_only) {
    fn_list.push(...[
      () => queryImage(image_md5s[getRandIdx(image_md5s.length)], resturl, enable_logs),
      () => queryUser(user_addr, resturl, enable_logs),
      () => queryUserSubscription(user_addr, resturl, enable_logs),
      () => queryTxHistory(user_addr, resturl, enable_logs),
      () => queryDispositHistory(user_addr, resturl, enable_logs),
      () => queryConfig(resturl, enable_logs),
      () => queryStatistics(resturl, enable_logs),
    ]);
  }

  let idx = getRandIdx(fn_list.length);
  return fn_list[idx];
}

export async function pressureTest(
  resturl: string,
  user_addr: string,
  priv: string,
  public_inputs: string,
  private_inputs: string,
  num_prove_tasks : number,
  interval_prove_tasks_ms : number,
  num_query_tasks : number,
  interval_query_tasks_ms : number,
  total_time_sec : number,
  enable_logs : boolean,
  query_tasks_only : boolean,
  image_md5s_in : string[],
) {
  const total_time_ms = total_time_sec * 1000;
  const total_prove_tasks = num_prove_tasks * Math.floor(total_time_ms/interval_prove_tasks_ms);
  const total_query_tasks = num_query_tasks * Math.floor(total_time_ms/interval_query_tasks_ms);

  const prove_interval_ms = Math.ceil(interval_prove_tasks_ms/num_prove_tasks);
  const query_interval_ms = Math.ceil(interval_query_tasks_ms/num_query_tasks);

  console.log("Total_time_ms", total_time_ms);
  console.log("total_prove_tasks", total_prove_tasks);
  console.log("total_query_tasks", total_query_tasks);
  console.log("prove_interval_ms", prove_interval_ms);
  console.log("query_interval_ms", query_interval_ms);

  console.log("-".repeat(72));
  console.log("Prove target:\tsucc =", num_prove_tasks, "\tper", interval_prove_tasks_ms, "ms");
  console.log("Query target:\tsucc =", num_query_tasks, "\tper", interval_query_tasks_ms, "ms");
  console.log("-".repeat(72));
  console.log("Interval stats:");
  console.log("-".repeat(72));

  const [image_md5s_fetched, task_ids, user_addresses] = await getMd5sAndTaskIds(resturl, user_addr);
  const image_md5s = image_md5s_in.length === 0 ? image_md5s_fetched : image_md5s_in;

  const tasks = [
    runProveTasks(
      resturl,
      user_addr,
      image_md5s,
      priv,
      public_inputs,
      private_inputs,
      total_prove_tasks,
      prove_interval_ms,
      total_time_ms, 
      interval_prove_tasks_ms,
      enable_logs,
    ), 
    runQueryTasks(
      resturl,
      user_addr,
      image_md5s,
      task_ids,
      user_addresses,
      total_query_tasks,
      query_interval_ms,
      total_time_ms,
      interval_query_tasks_ms,
      enable_logs,
      query_tasks_only,
    ),
  ];

  await Promise.all(tasks);
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

async function getClient(port : number) {
  const url = "mongodb://localhost:" + port;
  const client = new MongoClient(url);
  return client;
}

async function getCollection(client : MongoClient, name : string) 
{
  const dbName = "zkwasmTaskDB";
  await client.connect();
  const db = client.db(dbName);
  const collection = db.collection(name);
  return collection;
}

async function getCollectionAsArray(dbPort : number, collectionName : string) 
{
  const client = await getClient(dbPort);
  const collection = await getCollection(client, collectionName);
  const its = await collection.find().toArray();
  client.close()
  return its;
}

type JsonLike = {[key : string] : any};

async function getCollectionFindExeStats(dbPort : number, collectionName : string, filter : JsonLike) : Promise<[Document, number]>
{
    const client = await getClient(dbPort);
    const collection = await getCollection(client, collectionName);
    const startTime = new Date().getTime();
    const stats = await collection.find(filter).explain(ExplainVerbosity.executionStats);
    const endTime = new Date().getTime();
    client.close()
    return [stats, endTime - startTime];
}

async function updateCollection(dbPort : number, collectionName : string, filter : JsonLike) : Promise<[UpdateResult<Document>, number]>
{
    const client = await getClient(dbPort);
    const collection = await getCollection(client, collectionName);
    const ts = new Date().getTime().toString();
    const update = { $set: { debug_logs: `Update from test at ${ts}` } }
    const startTime = new Date().getTime();
    const stats = await collection.updateMany(filter, update);
    const endTime = new Date().getTime();
    client.close()
    return [stats, endTime - startTime];
}

async function createIndexForCollection(dbPort : number, collectionName : string, indexes : JsonLike[]) : Promise<string[]>
{
    const client = await getClient(dbPort);
    const collection = await getCollection(client, collectionName);
    const res = [];
    for (const index of indexes) {
      res.push(await collection.createIndex(index));
    }
    client.close()
    return res;
}

async function dropIndexForCollection(dbPort : number, collectionName : string, indexes : string[]) : Promise<void>
{
    const client = await getClient(dbPort);
    const collection = await getCollection(client, collectionName);
    for (const index of indexes) {
      await collection.dropIndex(index);
    }
    client.close()
    return;
}


async function runDbFindAndUpdatePerformanceTest(
  dbPort: number,
  iterations : number,
  collectionName : string,
  generateFilter : () => JsonLike,
) : Promise<{[key:string] : any}>  {
  const stats : {[key:string] : any} = {};
  {
    let totalExeTimeMs : number = 0;
    let totalDocsExamined : number = 0;
    let totalRealExeTimeMs : number = 0;
    for (let i = 0; i < iterations; i++) {
      const filter = generateFilter();
      const [stats, timeSpent] = await getCollectionFindExeStats(dbPort, collectionName, filter);
      totalDocsExamined += stats.executionStats.totalDocsExamined as number;
      totalExeTimeMs += stats.executionStats.executionTimeMillis as number;
      totalRealExeTimeMs += timeSpent;

    }

    const avgExeTimeMs = totalExeTimeMs / iterations;
    const avgDocsExamined = totalDocsExamined / iterations;
    const avgRealExeTimeMs = totalRealExeTimeMs / iterations;
    stats["find"] = {
      avgExeTimeMs : avgExeTimeMs,
      avgDocsExamined : avgDocsExamined,
      avgRealExeTimeMs : avgRealExeTimeMs,
    }
  }

  {
    let totalDocsUpdated : number = 0;
    let totalRealExeTimeMs : number = 0;
    for (let i = 0; i < iterations; i++) {
      const filter = generateFilter();
      const [stats, timeSpent] = await updateCollection(dbPort, collectionName, filter);
      totalDocsUpdated += stats.modifiedCount;
      totalRealExeTimeMs += timeSpent;
    }

    const avgDocsUpdated = totalDocsUpdated / iterations;
    const avgRealExeTimeMs = totalRealExeTimeMs / iterations;
    stats["update"] = {
      avgDocsUpdated : avgDocsUpdated,
      avgRealExeTimeMs : avgRealExeTimeMs,
    }
  }
  return stats;
}

function getPercentageDifferences(lhs : {[key: string] : any}, rhs : {[key:string] : any}) {
  const result: { [key: string]: any } = {};

  const allKeys = new Set<string>([...Object.keys(lhs), ...Object.keys(rhs)]);
  allKeys.forEach((key) => {
    const lhsValue = lhs[key];
    const rhsValue = rhs[key];

    if (typeof lhsValue === "object" && typeof rhsValue === "object" && lhsValue !== null && rhsValue !== null) {
      result[key] = getPercentageDifferences(lhsValue, rhsValue);
    } else if (typeof lhsValue === "number" && typeof rhsValue === "number") {
      if (lhsValue !== 0) {
        const percentageDifference = ((rhsValue - lhsValue) / lhsValue) * 100;
        result[key] = percentageDifference;
      } else {
        result[key] = rhsValue === 0 ? 0 : 100;
      }
    } else {
      console.warn(`Skipping key "${key}" because one of the values is not a number.`);
    }
  });

  return result;
}

export async function dbPerformTestRunnner(
  dbPort: number,
  collectionName : string,
  fieldUnderTestData : JsonLike,
) : Promise<JsonLike> {
  const name = fieldUnderTestData.name;
  const iterations = fieldUnderTestData.iterations;
  const indexes = fieldUnderTestData.indexes;
  const generateFilter = fieldUnderTestData.generateFilter;

  const withoutIndexesStats = await runDbFindAndUpdatePerformanceTest(dbPort, iterations, collectionName, generateFilter);
  let indexNames = await createIndexForCollection(dbPort, collectionName, indexes);
  const withIndexesStats = await runDbFindAndUpdatePerformanceTest(dbPort, iterations, collectionName, generateFilter);
  await dropIndexForCollection(dbPort, collectionName, indexNames);

  const stats = {
    collectionName : collectionName,
    fieldUnderTest : name,
    withoutIndexes : withoutIndexesStats,
    withIndexes : withIndexesStats,
    percentageDiff : getPercentageDifferences(withoutIndexesStats, withIndexesStats),
  }
  console.log(stats);
  return stats
}

export async function dbPerformanceTestTasks(
  dbPort: number,
) {
  const collectionUnderTest = "tasks"
  const images = await getCollectionAsArray(dbPort, "images");
  const taskTypes = ["Setup", "Prove", "Verify", "Batch", "Deploy", "Reset",];
  const taskStatuses = ["Pending", "Processing", "DryRunFailed", "Done", "Fail", "Stale",]

  const dataUnderTest = [
    {
      name : "index = md5, filter = md5",
      iterations : 1000,
      indexes : [{md5 : 1}],
      generateFilter : () => {
        const image = (images[getRandIdx(images.length)] as any) as Image;
        const md5 = image.md5;
        return { md5 : md5 };
      },
    }, 
//    {
//      name : "index = md5 + task_type, filter = md5",
//      iterations : 1000,
//      indexes : [{md5 : 1, task_type : 1}],
//      generateFilter : () => {
//        const image = (images[getRandIdx(images.length)] as any) as Image;
//        const md5 = image.md5;
//        return { md5 : md5 };
//      },
//    }, 
//    {
//      name : "index = md5 + task_type, filter = md5 + task_type",
//      iterations : 1000,
//      indexes : [{md5 : 1, task_type : 1}],
//      generateFilter : () => {
//        const image = (images[getRandIdx(images.length)] as any) as Image;
//        const md5 = image.md5;
//        const taskType = taskTypes[getRandIdx(taskTypes.length)]; 
//        return { md5 : md5, task_type : taskType };
//      },
//    }, 
//    {
//      name : "index = [md5 + task_type, user_address + md5, status + md5], filter = md5",
//      iterations : 1000,
//      indexes : [{md5 : 1, task_type : 1}, {user_address: 1, md5 : 1 }, {status : 1, md5: 1}],
//      generateFilter : () => {
//        const image = (images[getRandIdx(images.length)] as any) as Image;
//        const md5 = image.md5;
//        return { md5 : md5 };
//      },
//    }, 
//    {
//      name : "index = [md5 + task_type, user_address + md5, status + md5], filter = md5 + task_type",
//      iterations : 1000,
//      indexes : [{md5 : 1, task_type : 1}, {user_address: 1, md5 : 1 }, {status : 1, md5: 1}],
//      generateFilter : () => {
//        const image = (images[getRandIdx(images.length)] as any) as Image;
//        const md5 = image.md5;
//        const taskType = taskTypes[getRandIdx(taskTypes.length)]; 
//        return { md5 : md5, task_type : taskType };
//      },
//    }, 
//    {
//      name : "index = [md5 + task_type, user_address + md5, status + md5], filter = status",
//      iterations : 1000,
//      indexes : [{md5 : 1, task_type : 1}, {user_address: 1, md5 : 1 }, {status : 1, md5: 1}],
//      generateFilter : () => {
//        const taskStatus = taskStatuses[getRandIdx(taskStatuses.length)]; 
//        return { status: taskStatus };
//      },
//    }, 
//    {
//      name : "index = [md5 + task_type, user_address + md5, status + md5], filter = status + md5 ",
//      iterations : 1000,
//      indexes : [{md5 : 1, task_type : 1}, {user_address: 1, md5 : 1 }, {status : 1, md5: 1}],
//      generateFilter : () => {
//        const image = (images[getRandIdx(images.length)] as any) as Image;
//        const md5 = image.md5;
//        const taskStatus = taskStatuses[getRandIdx(taskStatuses.length)]; 
//        return { status : taskStatus, md5 : md5  };
//      },
//    }, 
//    {
//      name : "index = [md5 + task_type, user_address + md5, status + md5], filter = user_address + md5 + status + task_type",
//      iterations : 1000,
//      indexes : [{md5 : 1, task_type : 1}, {user_address: 1, md5 : 1 }, {status : 1, md5: 1}],
//      generateFilter : () => {
//        const image = (images[getRandIdx(images.length)] as any) as Image;
//        const md5 = image.md5;
//        const user_address = image.user_address;
//        const taskType = taskTypes[getRandIdx(taskTypes.length)]; 
//        const taskStatus = taskStatuses[getRandIdx(taskStatuses.length)]; 
//        return { user_address: user_address, md5 : md5, status: taskStatus, task_type : taskType, };
//      },
//    }, 
  ];

  const results = [];
  for (const data of dataUnderTest) {
    results.push(await dbPerformTestRunnner(dbPort, collectionUnderTest, data));
  }

  console.log(JSON.stringify(results));
}

export async function dbPerformanceTestImages(
  dbPort: number,
) {
  const collectionUnderTest = "images"
  const images = await getCollectionAsArray(dbPort, collectionUnderTest);
  const dataUnderTest = [
    {
      name : "index = md5, filter = md5 ",
      iterations : 1000,
      indexes : [{md5 : 1}],
      generateFilter : () => {
        const image = (images[getRandIdx(images.length)] as any) as Image;
        const md5 = image.md5;
        return { md5 : md5 };
      },
    }, 
    {
      name : "index = md5(hashed), filter = md5 ",
      iterations : 1000,
      indexes : [{md5 : "hashed"}],
      generateFilter : () => {
        const image = (images[getRandIdx(images.length)] as any) as Image;
        const md5 = image.md5;
        return { md5 : md5 };
      },
    }, 
  ];

  const results = [];
  for (const data of dataUnderTest) {
    results.push(await dbPerformTestRunnner(dbPort, collectionUnderTest, data));
  }

  console.log(JSON.stringify(results));
}

export async function dbPerformanceTestBatchProofs(
  dbPort: number,
) {
  const collectionUnderTest = "Round1BatchProofQueue"
  const batchTasks = await getCollectionAsArray(dbPort, collectionUnderTest);
  const dataUnderTest = [
    {
      name : "index = task_id, filter = task_id ",
      iterations : 1000,
      indexes : [{task_id : 1}],
      generateFilter : () => {
        const batchTask = (batchTasks[getRandIdx(batchTasks.length)] as any);
        const taskId = batchTask.task_id;
        return { task_id : taskId };
      },
    }, 
    {
      name : "index = task_id(hashed), filter = task_id ",
      iterations : 1000,
      indexes : [{task_id : "hashed"}],
      generateFilter : () => {
        const batchTask = (batchTasks[getRandIdx(batchTasks.length)] as any);
        const taskId = batchTask.task_id;
        return { task_id : taskId };
      },
    }, 
    {
      name : "index = task_id, filter = task_id + auto_submit_network_chain_id ",
      iterations : 1000,
      indexes : [{task_id : 1}],
      generateFilter : () => {
        const batchTask = (batchTasks[getRandIdx(batchTasks.length)] as any);
        const taskId = batchTask.task_id;
        const auto_submit_network_chain_id = batchTask.auto_submit_network_chain_id;
        return { task_id : taskId , auto_submit_network_chain_id : auto_submit_network_chain_id };
      },
    }, 
    {
      name : "index = auto_submit_network_chain_id, filter = auto_submit_network_chain_id ",
      iterations : 1000,
      indexes : [{task_id : 1}],
      generateFilter : () => {
        const batchTask = (batchTasks[getRandIdx(batchTasks.length)] as any);
        const auto_submit_network_chain_id = batchTask.auto_submit_network_chain_id;
        return { auto_submit_network_chain_id : auto_submit_network_chain_id };
      },
    }, 
  ];

  const results = [];
  for (const data of dataUnderTest) {
    results.push(await dbPerformTestRunnner(dbPort, collectionUnderTest, data));
  }

  console.log(JSON.stringify(results));
}

export async function dbPerformanceTest(
  dbPort: number,
  collectionUnderTest : string
) {
  if (collectionUnderTest === "tasks") {
    dbPerformanceTestTasks(dbPort);
  } else if (collectionUnderTest === "batch") {
    dbPerformanceTestBatchProofs(dbPort);
  } else if (collectionUnderTest === "images") {
    dbPerformanceTestImages(dbPort);
  } else {
    console.log(`${collectionUnderTest} not recognised as a DB performance test`);
  }
}
