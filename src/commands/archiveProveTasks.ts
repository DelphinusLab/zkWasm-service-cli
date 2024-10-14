import { Arguments, Argv } from "yargs";
import { archiveProveTasks } from "../task";

export const command = "archiveprovetasks";
export const desc = "Move prove tasks from main tasks database to an archive database, only tasks older than the given timestamp are archived. User sending the request must be an administrator. Id is returned in response and it is required for `restoreprovetasks`.";

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
  await archiveProveTasks(
    argv.r as string,
    argv.x as string,
    argv.timestamp as string,
  );
};
