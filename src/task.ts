import fs from "fs";
import { ethers, Wallet } from "ethers";
import { parse } from "path";
import { signMessage, askQuestion } from "./util";
import {
  ZkWasmServiceHelper,
  WithSignature,
  ProvingParams,
  AddImageParams,
  ZkWasmUtil,
  AppConfig,
  ProofSubmitMode,
  ProvePaymentSrc,
  MaintenanceModeType,
  SetMaintenanceModeParams,
  AdminRequestType,
  ArchiveTasksParams,
  RestoreTasksParams,
} from "zkwasm-service-helper";

import {
  queryTask,
  getAvailableImages,
  queryImage,
  queryUser,
  queryConfig,
  queryTxHistory,
  queryStatistics,
  queryDispositHistory,
  queryUserSubscription,
  queryTaskByTypeAndStatus,
} from "./query";

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
  auto_submit_networks: number[]
) {
  const filename = parse(absPath).base;
  let fileSelected: Buffer = fs.readFileSync(absPath);

  let md5 = ZkWasmUtil.convertToMd5(new Uint8Array(fileSelected));

  let prove_payment_src = creator_paid_proof
    ? ProvePaymentSrc.CreatorPay
    : ProvePaymentSrc.Default;

  let info: AddImageParams = {
    name: filename,
    image_md5: md5,
    image: fileSelected,
    user_address: user_addr.toLowerCase(),
    description_url: description_url,
    avator_url: avator_url,
    circuit_size: circuit_size,
    prove_payment_src: prove_payment_src,
    auto_submit_network_ids: auto_submit_networks,
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
  await helper
    .addNewWasmImage(task)
    .then((res) => {
      console.log("Add Image Response", res);
    })
    .catch((err) => {
      console.log("Add Image Error", err);
    })
    .finally(() => console.log("Finish addNewWasmImage!"));
}

export interface ProveTaskResponse {
  id: string;
}

export async function addProvingTask(
  resturl: string,
  user_addr: string,
  image_md5: string,
  public_inputs: string,
  private_inputs: string,
  proof_submit_mode: ProofSubmitMode,
  priv: string,
  enable_logs: boolean = true,
  num: number = 0
): Promise<ProveTaskResponse> {
  let helper = new ZkWasmServiceHelper(resturl, "", "", enable_logs);
  let pb_inputs: Array<string> = ZkWasmUtil.validateInputs(public_inputs);
  let priv_inputs: Array<string> = ZkWasmUtil.validateInputs(private_inputs);

  let info: ProvingParams = {
    user_address: user_addr.toLowerCase(),
    md5: image_md5,
    public_inputs: pb_inputs,
    private_inputs: priv_inputs,
    proof_submit_mode: proof_submit_mode,
  };
  let msgString = ZkWasmUtil.createProvingSignMessage(info);

  let signature: string;
  try {
    signature = await signMessage(msgString, priv);
  } catch (e: unknown) {
    if (enable_logs) {
      console.log("error signing message", e);
    }
    throw e;
  }

  let task: WithSignature<ProvingParams> = {
    ...info,
    signature: signature,
  };

  return await helper
    .addProvingTask(task)
    .then((res) => {
      if (enable_logs) {
        console.log(`#${num} Add Proving task Response`, res);
      }
      return res;
    })
    .catch((err) => {
      if (enable_logs) {
        console.log(`#${num} Add Proving task Error`, err);
      }
      throw err;
    });
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runFuncAndGetExecTime(
  i: number,
  func: (i: number) => Promise<void>
): Promise<number> {
  const start = new Date().getTime();
  await func(i);
  const end = new Date().getTime();
  return end - start;
}

async function sendIntervaledRequests(
  tot_ms: number,
  interval_ms: number,
  n_req: number,
  secs: { value: number },
  request_fn: (i: number) => Promise<void>,
  finish_fn: () => void
) {
  const start_t = Date.now();
  let req_cnt = 0;

  for (
    let curr_t = Date.now();
    curr_t - start_t < tot_ms && req_cnt < n_req;
    curr_t = Date.now()
  ) {
    // Break if reached total runtime limit because requests ran overtime.
    if (secs.value >= tot_ms / 1000) {
      break;
    }

    let time_taken = await runFuncAndGetExecTime(req_cnt, request_fn);
    req_cnt++;
    await sleep(Math.max(interval_ms - time_taken, 0));
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
  num_prove_tasks: number,
  submit_mode: ProofSubmitMode,
  interval_ms: number,
  total_time_ms: number,
  original_interval_ms: number,
  enable_logs: boolean
) {
  let interval_succ_cnt = 0;
  let interval_fail_cnt = 0;
  let secs = { value: 0 };
  const interval_id = setInterval(() => {
    const msg =
      interval_succ_cnt == 0 && interval_fail_cnt == 0
        ? "\tNo tasks finished within interval ..."
        : `\tsucc = ${interval_succ_cnt}\tfail = ${interval_fail_cnt}`;
    console.log(`Prove: t = ${secs.value}${msg}`);

    interval_succ_cnt = 0;
    interval_fail_cnt = 0;
    secs.value++;
  }, original_interval_ms);

  let n_success = 0;
  sendIntervaledRequests(
    total_time_ms,
    interval_ms,
    num_prove_tasks,
    secs,
    async (i: number) => {
      // TODO: try catch instead of return boolean
      try {
        await addProvingTask(
          resturl,
          user_addr,
          image_md5s[i % image_md5s.length],
          public_inputs,
          private_inputs,
          submit_mode,
          priv,
          enable_logs,
          i
        );
        n_success++;
        interval_succ_cnt++;
      } catch (e) {
        interval_fail_cnt++;
        console.log("Error in runProveTasks", e);
      }
    },
    () => {
      console.log("\n");
      console.log("-".repeat(72));
      console.log("Finished sending prove requests, cumulative stats:");
      console.log(
        "\tNumber of successful prove tasks sent",
        n_success,
        "out of",
        num_prove_tasks
      );
      console.log(
        "\tProve task success rate",
        (n_success / num_prove_tasks) * 100,
        "%"
      );

      clearInterval(interval_id);
    }
  );
}

async function runQueryTasks(
  resturl: string,
  user_address: string,
  image_md5s: string[],
  task_ids: string[],
  num_query_tasks: number,
  interval_ms: number,
  total_time_ms: number,
  original_interval_ms: number,
  enable_logs: boolean,
  query_tasks_only: boolean
) {
  let interval_succ_cnt = 0;
  let interval_fail_cnt = 0;
  let secs = { value: 0 };
  const interval_id = setInterval(() => {
    const msg =
      interval_succ_cnt == 0 && interval_fail_cnt == 0
        ? "\tNo tasks finished within interval ..."
        : `\tsucc = ${interval_succ_cnt}\tfail = ${interval_fail_cnt}`;
    console.log(`Query: t = ${secs.value}${msg}`);

    interval_succ_cnt = 0;
    interval_fail_cnt = 0;
    secs.value++;
  }, original_interval_ms);

  let n_success = 0;
  sendIntervaledRequests(
    total_time_ms,
    interval_ms,
    num_query_tasks,
    secs,
    async (_: number) => {
      const query_fn = getRandomQuery(
        image_md5s,
        task_ids,
        resturl,
        user_address,
        enable_logs,
        query_tasks_only
      );
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
      console.log(
        "\tNumber of successful query tasks sent",
        n_success,
        "out of",
        num_query_tasks
      );
      console.log(
        "\tQuery task success rate",
        (n_success / num_query_tasks) * 100,
        "%"
      );

      clearInterval(interval_id);
    }
  );
}

async function getMd5sAndTaskIds(
  resturl: string,
  user_addr: string
): Promise<[string[], string[]]> {
  const images_detail = await getAvailableImages(resturl, user_addr, false);

  let image_md5s: string[] = [];
  let task_ids: string[] = [];

  for (const d of images_detail) {
    if (!image_md5s.find((x) => x === d.md5)) {
      image_md5s.push(d.md5);
    }
    if (!task_ids.find((x) => x === (d._id["$oid"] as string))) {
      task_ids.push(d._id["$oid"]);
    }
  }

  return [image_md5s, task_ids];
}

function getRandIdx(length: number): number {
  return Math.floor(Math.random() * length);
}

function getRandomQuery(
  image_md5s: string[],
  task_ids: string[],
  resturl: string,
  user_addr: string,
  enable_logs: boolean,
  query_tasks_only: boolean
): () => Promise<boolean> {
  const fn_list = [
    () =>
      queryTask(task_ids[getRandIdx(task_ids.length)], resturl, enable_logs),
    () => {
      const task_types = ["Setup", "Prove", "Reset"];
      const task_statuses = [
        "Pending",
        "Processing",
        "DryRunFailed",
        "Done",
        "Fail",
        "Stale",
      ];
      return queryTaskByTypeAndStatus(
        task_types[getRandIdx(task_types.length)],
        task_statuses[getRandIdx(task_statuses.length)],
        resturl,
        enable_logs
      );
    },
  ];

  if (!query_tasks_only) {
    fn_list.push(
      ...[
        () =>
          queryImage(
            image_md5s[getRandIdx(image_md5s.length)],
            resturl,
            enable_logs
          ),
        () => queryUser(user_addr, resturl, enable_logs),
        () => queryUserSubscription(user_addr, resturl, enable_logs),
        () => queryTxHistory(user_addr, resturl, enable_logs),
        () => queryDispositHistory(user_addr, resturl, enable_logs),
        () => queryConfig(resturl, enable_logs),
        () => queryStatistics(resturl, enable_logs),
      ]
    );
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
  proof_submit_mode: ProofSubmitMode,
  num_prove_tasks: number,
  interval_prove_tasks_ms: number,
  num_query_tasks: number,
  interval_query_tasks_ms: number,
  total_time_sec: number,
  enable_logs: boolean,
  query_tasks_only: boolean,
  image_md5s_in: string[]
) {
  const total_time_ms = total_time_sec * 1000;
  const total_prove_tasks =
    num_prove_tasks * Math.floor(total_time_ms / interval_prove_tasks_ms);
  const total_query_tasks =
    num_query_tasks * Math.floor(total_time_ms / interval_query_tasks_ms);

  const prove_interval_ms = Math.ceil(
    interval_prove_tasks_ms / num_prove_tasks
  );
  const query_interval_ms = Math.ceil(
    interval_query_tasks_ms / num_query_tasks
  );

  console.log("Total_time_ms", total_time_ms);
  console.log("total_prove_tasks", total_prove_tasks);
  console.log("total_query_tasks", total_query_tasks);
  console.log("prove_interval_ms", prove_interval_ms);
  console.log("query_interval_ms", query_interval_ms);

  console.log("-".repeat(72));
  console.log(
    "Prove target:\tsucc =",
    num_prove_tasks,
    "\tper",
    interval_prove_tasks_ms,
    "ms"
  );
  console.log(
    "Query target:\tsucc =",
    num_query_tasks,
    "\tper",
    interval_query_tasks_ms,
    "ms"
  );
  console.log("-".repeat(72));
  console.log("Interval stats:");
  console.log("-".repeat(72));

  const [image_md5s_fetched, task_ids] = await getMd5sAndTaskIds(
    resturl,
    user_addr
  );
  const image_md5s =
    image_md5s_in.length === 0 ? image_md5s_fetched : image_md5s_in;

  const tasks = [
    runProveTasks(
      resturl,
      user_addr,
      image_md5s,
      priv,
      public_inputs,
      private_inputs,
      total_prove_tasks,
      proof_submit_mode,
      prove_interval_ms,
      total_time_ms,
      interval_prove_tasks_ms,
      enable_logs
    ),
    runQueryTasks(
      resturl,
      user_addr,
      image_md5s,
      task_ids,
      total_query_tasks,
      query_interval_ms,
      total_time_ms,
      interval_query_tasks_ms,
      enable_logs,
      query_tasks_only
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

export async function setMaintenanceMode(
  resturl: string,
  priv: string,
  active: boolean
) {
  let params: SetMaintenanceModeParams = {
    mode: active ? MaintenanceModeType.Enabled : MaintenanceModeType.Disabled,
    // TODO: update with real values once nonce verification is implemented
    nonce: 1,
    request_type: AdminRequestType.MaintenanceMode,
    user_address: await new Wallet(priv, null).getAddress(),
  };

  let msg = ZkWasmUtil.createSetMaintenanceModeSignMessage(params);
  let signature: string;

  try {
    console.log("msg is:", msg);
    signature = await signMessage(msg, priv);
    console.log("signature is:", signature);
  } catch (e: unknown) {
    console.log("sign error: ", e);
    return;
  }
  let task: WithSignature<SetMaintenanceModeParams> = {
    ...params,
    signature,
  };

  console.log("Setting maintenance mode to", params.mode, "...");
  let helper = new ZkWasmServiceHelper(resturl, "", "");
  await helper
    .setMaintenanceMode(task)
    .then((res) => {
      console.log("Set maintenance mode Success", res);
    })
    .catch((err) => {
      console.log("Set maintenance mode Error", err);
    })
    .finally(() => console.log("Finish setMaintenanceMode!"));
}

export async function archiveTasks(
  resturl: string,
  priv: string,
  timestamp: string
) {
  let params: ArchiveTasksParams = {
    timestamp: (new Date(timestamp)).toString(),
    // TODO: update with real values once nonce verification is implemented
    nonce: 1,
    request_type: AdminRequestType.ArchiveOperation,
    user_address: await new Wallet(priv, null).getAddress(),
  };

  let msg = ZkWasmUtil.createArchiveTasksSignMessage(params);
  let signature: string;

  try {
    console.log("msg is:", msg);
    signature = await signMessage(msg, priv);
    console.log("signature is:", signature);
  } catch (e: unknown) {
    console.log("sign error: ", e);
    return;
  }
  let task: WithSignature<ArchiveTasksParams> = {
    ...params,
    signature,
  };

  console.log("Archive tasks after ", params.timestamp, "...");
  let helper = new ZkWasmServiceHelper(resturl, "", "");
  await helper
    .archiveTasks(task)
    .then((res) => {
      console.log("Archive tasks success", res);
    })
    .catch((err) => {
      console.log("Archive tasks error", err);
    })
    .finally(() => console.log("Finish archiveTasks!"));
}

export async function restoreTasks(
  resturl: string,
  priv: string,
  archive_id: string
) {
  let params: RestoreTasksParams = {
    archive_id: archive_id,
    // TODO: update with real values once nonce verification is implemented
    nonce: 1,
    request_type: AdminRequestType.ArchiveOperation,
    user_address: await new Wallet(priv, null).getAddress(),
  };

  let msg = ZkWasmUtil.createRestoreTasksSignMessage(params);
  let signature: string;

  try {
    console.log("msg is:", msg);
    signature = await signMessage(msg, priv);
    console.log("signature is:", signature);
  } catch (e: unknown) {
    console.log("sign error: ", e);
    return;
  }
  let task: WithSignature<RestoreTasksParams> = {
    ...params,
    signature,
  };

  console.log("Restored tasks associated with archive id ", params.archive_id, "...");
  let helper = new ZkWasmServiceHelper(resturl, "", "");
  await helper
    .restoreTasks(task)
    .then((res) => {
      console.log("Restore tasks success", res);
    })
    .catch((err) => {
      console.log("Restore tasks error", err);
    })
    .finally(() => console.log("Finish restoreTasks!"));
}
