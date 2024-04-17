import {
    ZkWasmServiceHelper,
    ZkWasmUtil,
    QueryParams,
    PaginationResult,
    Task,
} from "zkwasm-service-helper";
import BN from "bn.js";

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
