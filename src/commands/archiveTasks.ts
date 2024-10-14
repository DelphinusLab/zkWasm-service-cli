import { Arguments, Argv } from "yargs";
import { archiveTasks } from "../task";

export const command = "archivetasks";
export const desc = "Move tasks (excluding setup tasks) older than timestamp to archive collection";

export const builder = (yargs: Argv) => {
  return yargs
    .option("x", {
      alias: "priv",
      describe: "The priv of user address.",
      demandOption: "The priv is required for signing message.",
      type: "string",
    })
    .option("timestamp", {
      alias: "timestamp",
      describe: "Timestamp for archiving tasks, all tasks after this date will be archived (format YYYY-MM-DD).",
      demandOption: "Timestamp is required for archive tasks.",
      type: "string",
    })
};

export const handler = async (argv: Arguments) => {
  await archiveTasks(
    argv.r as string,
    argv.x as string,
    argv.timestamp as string,
  );
};
