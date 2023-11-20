import {
    ZkWasmServiceHelper,
    ZkWasmUtil,
    QueryParams,
    PaginationResult,
    Task,
} from "zkwasm-service-helper";
import BN from "bn.js";

export async function queryTask(taskid: string, resturl: string) {
    let helper = new ZkWasmServiceHelper(resturl, "", "");
    let args: QueryParams = {
        id: taskid!,
        user_address: "",
        md5: "",
        tasktype: "",
        taskstatus: "",
    };
    helper.loadTasks(args).then((res) => {
        const tasks = res as PaginationResult<Task[]>;
        const task: Task = tasks.data[0];
        let aggregate_proof = ZkWasmUtil.bytesToBN(task.proof);
        let instances = ZkWasmUtil.bytesToBN(task.instances);
        let batchInstances = ZkWasmUtil.bytesToBN(task.batch_instances);
        let aux = ZkWasmUtil.bytesToBN(task.aux);
        let fee = task.task_fee && ZkWasmUtil.convertAmount(task.task_fee); 

        console.log("Task details: ");
        console.log("    ", task);
        console.log("    proof:");
        aggregate_proof.map((proof: BN, index) => {
            console.log("   0x", proof.toString("hex"));
        });
        console.log("    batch_instacne:");
        batchInstances.map((ins: BN, index) => {
            console.log("   0x", ins.toString("hex"));
        });
        console.log("    instacne:");
        instances.map((ins: BN, index) => {
            console.log("   0x", ins.toString("hex"));
        });
        console.log("    aux:");
        aux.map((aux: BN, index) => {
            console.log("   0x", aux.toString("hex"));
        });
        console.log("   fee:", fee);
    }).catch((err) => {
        console.log("queryTask Error", err);
    }).finally(() =>
        console.log("Finish queryTask.")
    );
}