import { Arguments, Argv } from "yargs";
import { getTaskExternalHostTable } from "../query";

export const command = "gettaskexternalhosttable";
export const desc = "Get task's external host table file";

export const builder = (yargs: Argv) => {
  return yargs
    .option("task_id", {
      describe: "Id of the task to query",
      type: "string",
    });
};

export const handler = async (argv: Arguments) => {
  console.log("Getting task external host table file...");
  await getTaskExternalHostTable(
    argv.r as string,
    argv.task_id as string,
  );
};
