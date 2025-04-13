import { forceUnproveableToReprocess } from "task";
import { Arguments, Argv } from "yargs";

export const command = "forceunproveabletoreprocess";
export const desc =
  "Force an `Unproveable` task into a `Fail` state to allow it's proof to be retried";

export const builder = (yargs: Argv) => {
  return yargs
    .option("x", {
      alias: "priv",
      describe: "The private key of user address.",
      demandOption: "The priv is required for signing message.",
      type: "string",
    })
    .option("task_id", {
      describe: "Id of the task to reprocess",
      type: "string",
    });
};

export const handler = async (argv: Arguments) => {
  console.log("Forcing an unproveable task to reprocess ...");
  await forceUnproveableToReprocess(
    argv.r as string,
    argv.x as string,
    argv.task_id as string,
  );
};
