import { Arguments, Argv } from "yargs";
import { restoreProveTasks } from "../task";

export const command = "restoreprovetasks";
export const desc = "Undo archive operation. `archiveprovetasks` returns id which is used for restoring the archived tasks. User sending the request must be an administrator.";

export const builder = (yargs: Argv) => {
  return yargs
    .option("x", {
      alias: "priv",
      describe: "The priv of user address.",
      demandOption: "The priv is required for signing message.",
      type: "string",
    })
    .option("archive_id", {
      alias: "archive_id",
      describe: "Id returned from archiving request, used to undo archive operation.",
      demandOption: "Id is required for restore tasks.",
      type: "string",
    })
};

export const handler = async (argv: Arguments) => {
  await restoreProveTasks(
    argv.r as string,
    argv.x as string,
    argv.archive_id as string,
  );
};
