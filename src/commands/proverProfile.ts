import { Arguments, Argv } from "yargs";
import {
  NodeStatistics,
  NodeStatisticsQueryParams,
  ProofSubmitMode,
  TaskStatus,
  ZkWasmServiceHelper,
} from "zkwasm-service-helper";
import fs from "fs/promises";
import path from "path";
import { addProvingTask } from "../task";

export const command = "prover-profile";
export const desc = "Profile Prover nodes and generate report";

export const builder = (yargs: Argv) => {
  return yargs
    .option("u", {
      alias: "address",
      describe: "User address which adding the image",
      demandOption: "User address is required",
      type: "string",
    })
    .option("x", {
      alias: "priv",
      describe: "The priv of user address.",
      demandOption: "The priv is required for signing message.",
      type: "string",
    })
    .option("public_input", {
      describe:
        "public input of the proof, inputs must have format (0x)[0-f]*:(i64|bytes|bytes-packed) and been separated by spaces (eg: 0x12:i64 44:i64 32:i64).",
      type: "string",
      default: "",
    })
    .option("private_input", {
      describe: "private currently not supported",
      type: "string",
      default: "",
    })
    .option("submit_mode", {
      describe: "Submit mode for the proof, default is manual",
      type: "string",
      default: "manual",
    })
    .option("num_prove_tasks", {
      describe: "Number of prove tasks to do during profiling. Default is 100",
      type: "number",
      default: 10,
    })
    .option("md5", {
      describe: "Md5 of the image to be profiled. ",
      type: "string",
    })
    .option("out", {
      describe:
        "Output file path for the report. Default is ./prover_profile_report.json",
      type: "string",
    });
};

export const handler = async (argv: Arguments) => {
  console.log("Begin prover profiling with args", argv);

  const proofSubmitMode =
    argv.submit_mode === "auto" || argv.submit_mode === "Auto"
      ? ProofSubmitMode.Auto
      : ProofSubmitMode.Manual;

  const totalTasks = argv.num_prove_tasks as number;

  const restURL = argv.r as string;

  // Placeholder for initial node statistics query
  const getNodeStatistics = async () => {
    // TODO: Implement the actual query to get node statistics
    let helper = new ZkWasmServiceHelper(restURL, "", "");
    let args: NodeStatisticsQueryParams = {
      total: 500,
    };
    let stats = helper
      .queryNodeStatistics(args)
      .then((res) => {
        return res;
      })
      .catch((err) => {
        console.log("Error fetching initial node statistics", err);
        throw err;
      });

    return stats;
  };

  const submitProvingTask = async () => {
    console.log("Submitting proving task");
    // Log args
    console.log(
      `User Address: ${argv.u}, MD5: ${argv.md5}, Public Input: ${argv.public_input}, Private Input: ${argv.private_input}, Proof Submit Mode: ${proofSubmitMode}, X: ${argv.x}`
    );
    let res = await addProvingTask(
      restURL,
      argv.u as string,
      argv.md5 as string,
      argv.public_input as string,
      argv.private_input as string,
      proofSubmitMode,
      argv.x as string
    );
    return res.id;
  };

  // Placeholder for querying task status
  const getTaskStatus = async (taskId: string): Promise<TaskStatus> => {
    const helper = new ZkWasmServiceHelper(restURL, "", "");
    const tasks = await helper.loadTasks({
      id: taskId,
      user_address: "",
      md5: "",
      tasktype: "",
      taskstatus: "",
    });
    let taskList = tasks.data;
    if (taskList.length === 0) {
      return "Pending";
    }
    return taskList[0].status;
  };

  // Get initial node statistics
  let initialStats: NodeStatistics[] = [];

  try {
    initialStats = await getNodeStatistics();
  } catch (err) {
    console.log("Error fetching initial node statistics", err);
    return;
  }
  console.log("Initial node statistics fetched");

  // Submit proving tasks
  const taskIds = [];
  for (let i = 0; i < totalTasks; i++) {
    // Every 2 submits, add a 1second delay to avoid rate limiting
    if (i % 2 === 0) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    const taskId = await submitProvingTask();
    taskIds.push(taskId);
    console.log(
      `Submitted task ${i + 1}/${argv.num_prove_tasks}, Task ID: ${taskId}`
    );
  }

  // Poll for task completion
  const pollInterval = 5000; // 5 seconds

  // Only need to poll last task as we are waiting for all tasks to complete
  const lastTaskId = taskIds[taskIds.length - 1];

  while (true) {
    console.log("Waiting for final task to complete...");
    const taskStatus = await getTaskStatus(lastTaskId);
    if (taskStatus === "Done") {
      break;
    }
    await new Promise((resolve) => setTimeout(resolve, pollInterval));
  }

  // wait 1 second incase rate limited
  await new Promise((resolve) => setTimeout(resolve, 1000));
  // Get final node statistics
  const finalStats = await getNodeStatistics();

  // Compare statistics and generate report
  const report = finalStats
    .map((finalNode) => {
      const initialNode = initialStats.find(
        (node) => node.address === finalNode.address
      );
      // we can remove some new nodes that are not in the initial stats
      if (!initialNode) return null;

      const diff: any = {
        address: finalNode.address,
        successful_tasks:
          finalNode.statistics.successful_tasks -
          initialNode.statistics.successful_tasks,
        failed_tasks:
          finalNode.statistics.failed_tasks -
          initialNode.statistics.failed_tasks,
        total_tasks:
          finalNode.statistics.total_tasks - initialNode.statistics.total_tasks,
        timed_out_count:
          finalNode.statistics.timed_out_count -
          initialNode.statistics.timed_out_count,
      };

      if (
        finalNode.statistics.setup_timing_stats &&
        initialNode.statistics.setup_timing_stats
      ) {
        diff.setup_time_diff =
          finalNode.statistics.setup_timing_stats.latest_time_taken_secs -
          initialNode.statistics.setup_timing_stats.latest_time_taken_secs;
      }

      if (
        finalNode.statistics.proof_timing_stats &&
        initialNode.statistics.proof_timing_stats
      ) {
        diff.proof_time_diff =
          finalNode.statistics.proof_timing_stats.latest_time_taken_secs -
          initialNode.statistics.proof_timing_stats.latest_time_taken_secs;
      }

      return diff;
    })
    .filter(Boolean)
    .sort((a, b) => b.total_tasks - a.total_tasks);

  // Write report to file

  const outputPath = path.resolve(argv.out as string);
  const fileExtension = path.extname(outputPath).toLowerCase();

  if (fileExtension === ".json") {
    await fs.writeFile(outputPath, JSON.stringify(report, null, 2));
  } else if (fileExtension === ".csv") {
    const headers = Object.keys(report[0]).join(",");
    const rows = report.map((row) => Object.values(row).join(","));
    await fs.writeFile(outputPath, [headers, ...rows].join("\n"));
  } else {
    console.error(
      "Unsupported file format. Please use .json or .csv extension."
    );
    return;
  }

  console.log(`Prover profile report has been saved to ${outputPath}`);
};
