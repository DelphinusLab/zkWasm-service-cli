import {
    ZkWasmServiceHelper,
    WithSignature,
    ZkWasmUtil,
    QueryParams,
    LogQuery,
    UserQueryParams,
    TxHistoryQueryParams,
    PaginationResult,
    Task,
    NodeStatisticsQueryParams,
    NodeStatistics,
} from "zkwasm-service-helper";
import BN from "bn.js";
import { signMessage } from "./util";

export async function queryTask(taskid: string, resturl: string, enable_logs : boolean = true) : Promise<boolean> {
    let helper = new ZkWasmServiceHelper(resturl, "", "", enable_logs);
    let args: QueryParams = {
        id: taskid!,
        user_address: "",
        md5: "",
        tasktype: "",
        taskstatus: "",
    };
    return helper.loadTasks(args).then((res) => {
      const tasks = res as PaginationResult<Task[]>;
      const task: Task = tasks.data[0];
      let aggregate_proof = ZkWasmUtil.bytesToBN(task.proof);
      let instances = ZkWasmUtil.bytesToBN(task.instances);
      let batchInstances = ZkWasmUtil.bytesToBN(task.batch_instances);
      let aux = ZkWasmUtil.bytesToBN(task.aux);
      let fee = task.task_fee && ZkWasmUtil.convertAmount(task.task_fee); 

      if (enable_logs) {
        console.log("Task details: ");
        console.log("    ", task);
        console.log("    proof:");
        aggregate_proof.map((proof: BN, _) => {
            console.log("   0x", proof.toString("hex"));
        });
        console.log("    batch_instacne:");
        batchInstances.map((ins: BN, _) => {
            console.log("   0x", ins.toString("hex"));
        });
        console.log("    instacne:");
        instances.map((ins: BN, _) => {
            console.log("   0x", ins.toString("hex"));
        });
        console.log("    aux:");
        aux.map((aux: BN, _) => {
            console.log("   0x", aux.toString("hex"));
        });
        console.log("   fee:", fee);
      }
      return true;
    }).catch((err) => {
      if (enable_logs) {
        console.log("queryTask Error", err);
      }
      return false;
    });
}

export async function queryTaskByTypeAndStatus(tasktype: string, taskstatus: string, resturl: string, enable_logs : boolean = true) : Promise<boolean> {
    let helper = new ZkWasmServiceHelper(resturl, "", "", enable_logs);
    let args: QueryParams = {
        id: "",
        user_address: "",
        md5: "",
        tasktype: tasktype,
        taskstatus: taskstatus,
    };
    return helper.loadTasks(args).then((res) => {
      if (enable_logs) {
        console.log("queryImage Success", res);
      }
      return true;
    }).catch((err) => {
      if (enable_logs) {
        console.log("queryTask Error", err);
      }
      return false;
    });
}

export async function queryImage(md5: string, resturl: string, enable_logs : boolean = true) : Promise<boolean> {
    let helper = new ZkWasmServiceHelper(resturl, "", "", enable_logs);
    return helper.queryImage(md5).then((res) => {
      if (enable_logs) {
        console.log("queryImage Success", res);
      }
      return true;
    }).catch((err) => {
      if (enable_logs) {
        console.log("queryTask Error", err);
      }
      return false;
    });
}

export async function queryUser(user_address: string, resturl: string, enable_logs : boolean = true) : Promise<boolean> {
    let helper = new ZkWasmServiceHelper(resturl, "", "", enable_logs);
    let args: UserQueryParams = {
        user_address: user_address,
    };
    return helper.queryUser(args).then((res) => {
      if (enable_logs) {
        console.log("queryUser Success", res);
      }
      return true;
    }).catch((err) => {
      if (enable_logs) {
        console.log("queryUser Error", err);
      }
      return false;
    });
}

export async function queryUserSubscription(user_address: string, resturl: string, enable_logs : boolean = true) : Promise<boolean> {
    let helper = new ZkWasmServiceHelper(resturl, "", "", enable_logs);
    let args: UserQueryParams = {
        user_address: user_address,
    };
    return helper.queryUserSubscription(args).then((res) => {
      if (enable_logs) {
        console.log("queryUserSubscription Success", res);
      }
      return true;
    }).catch((err) => {
      if (enable_logs) {
        console.log("queryUserSubscription Error", err);
      }
      return false;
    });
}

export async function queryTxHistory(user_address: string, resturl: string, enable_logs : boolean = true) : Promise<boolean> {
    let helper = new ZkWasmServiceHelper(resturl, "", "", enable_logs);
    let args: TxHistoryQueryParams = {
        user_address: user_address,
    };
    return helper.queryTxHistory(args).then((res) => {
      if (enable_logs) {
        console.log("queryTxHistory Success", res);
      }
      return true;
    }).catch((err) => {
      if (enable_logs) {
        console.log("queryTxHistory Error", err);
      }
      return false;
    });
}

export async function queryDispositHistory(user_address: string, resturl: string, enable_logs : boolean = true) : Promise<boolean> {
    let helper = new ZkWasmServiceHelper(resturl, "", "", enable_logs);
    let args: TxHistoryQueryParams = {
        user_address: user_address,
    };
    return helper.queryDepositHistory(args).then((res) => {
      if (enable_logs) {
        console.log("queryDepositHistory Success", res);
      }
      return true;
    }).catch((err) => {
      if (enable_logs) {
        console.log("queryDepositHistory Error", err);
      }
      return false;
    });
}

export async function queryConfig(resturl: string, enable_logs : boolean = true) : Promise<boolean> {
    let helper = new ZkWasmServiceHelper(resturl, "", "", enable_logs);
    return helper.queryConfig().then((res) => {
      if (enable_logs) {
        console.log("queryConfig Success", res);
      }
      return true;
    }).catch((err) => {
      if (enable_logs) {
        console.log("queryConfig Error", err);
      }
      return false;
    });
}

export async function queryStatistics(resturl: string, enable_logs : boolean = true) : Promise<boolean> {
    let helper = new ZkWasmServiceHelper(resturl, "", "", enable_logs);
    return helper.loadStatistics().then((res) => {
      if (enable_logs) {
        console.log("loadStatistics Success", res);
      }
      return true;
    }).catch((err) => {
      if (enable_logs) {
        console.log("loadStatistics Error", err);
      }
      return false;
    });
}

export async function queryLogs(resturl: string, user_address : string, task_id : string, priv : string, enable_logs : boolean = true) : Promise<boolean> {
    let helper = new ZkWasmServiceHelper(resturl, "", "", enable_logs);
    let info : LogQuery = {
      id: task_id,
      user_address: user_address.toLowerCase(),
    };
    let msg = ZkWasmUtil.createLogsMesssage(info);
    let signature: string;
    try {
      signature = await signMessage(msg, priv);
    } catch (e: unknown) {
      if (enable_logs) {
        console.log("error signing message", e);
      }
      throw e;
    }

    let query: WithSignature<LogQuery> = {
      ...info,
      signature,
    };

    return helper.queryLogs(query).then((res) => {
      if (enable_logs) {
        console.log("loadStatistics Success", res);
      }
      return true;
    }).catch((err) => {
      if (enable_logs) {
        console.log("loadStatistics Error", err);
      }
      return false;
    });
}

export async function getAvailableImages(resturl: string, user_address : string, enable_logs : boolean = true) : Promise<Task[]> {
    let helper = new ZkWasmServiceHelper(resturl, "", "", enable_logs);
    let args: QueryParams = {
        id: "",
        user_address: user_address,
        md5: "",
        tasktype: "Setup",
        taskstatus: "Done",
    };
    return helper.loadTasks(args).then((res) => {
      const tasks = res as PaginationResult<Task[]>;
      return tasks.data;
    }).catch((err) => {
      throw err
    }).finally(() => {
      if (enable_logs) {
        console.log("Finish queryTask.")
      }
    });
}

export async function getProverNodeList(resturl: string, enable_logs : boolean = true) : Promise<NodeStatistics[]> {
    let helper = new ZkWasmServiceHelper(resturl, "", "", enable_logs);
    let args: NodeStatisticsQueryParams = {
      total: 500,
    }
    return helper.queryNodeStatistics(args).then((res) => {
      return res;
    }
    ).catch((err) => {
      throw err
    }).finally(() => {
      if (enable_logs) {
        console.log("Finish GetProverNodeList")
      }
    });
}
