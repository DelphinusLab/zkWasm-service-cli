import { Arguments, Argv } from "yargs";
import { queryTask } from "../query";

export const command = "querytask";
export const desc = "Query task";

export const builder = (yargs: Argv) => {
  return yargs
    .option("task_id", {
      describe: "Id of the task to query",
      type: "string",
    })
    .option("user_address", {
      describe: "User address of the task to query",
      type: "string",
    })
    .option("md5", {
      describe: "Image MD5 of the task to query",
      type: "string",
    })
    .option("tasktype", {
      describe:
        "Type of the task to query, options: Setup|Prove|Verify|Batch|Deploy|Reset",
      type: "string",
    })
    .option("taskstatus", {
      describe:
        "Status of the task to query, options: Pending|DryRunSuccess|Processing|DryRunFailed|Done|Fail|Unprovable|Stale",
      type: "string",
    })
    .option("start", {
      describe:
        "Number of tasks to skip before counting total number of tasks to output, default is 0",
      type: "number",
      default: 0,
    })
    .option("total", {
      describe: "Total number of tasks to output, max is 100 and default is 1",
      type: "number",
      default: 1,
    })
    .option("concise", {
      describe: "Print concise output or regular, default is false",
      type: "boolean",
      default: false,
    })
    .option("verbose", {
      describe: "Enable task to be printed to stdout, default is true",
      type: "boolean",
      default: true,
    });
};

export const handler = async (argv: Arguments) => {
  console.log("Querying task...");
  await queryTask(
    argv.task_id as string,
    argv.user_address as string,
    argv.md5 as string,
    argv.tasktype as string,
    argv.taskstatus as string,
    argv.r as string,
    argv.verbose as boolean,
    argv.concise as boolean,
    argv.start as number,
    argv.total as number,
  );
};
