import { Arguments, Argv } from "yargs";
import { queryTask } from "../query";

export const command = "querytask";
export const desc = "Query task";

export const builder = (yargs: Argv) => {
  return yargs.option("t", {
    alias: "tx",
    describe: "transaction hash",
    type: "string",
    demandOption: "The transaction hash is required",
  });
};

export const handler = async (argv: Arguments) => {
  console.log("Querying task...");
  await queryTask(argv.t as string, argv.r as string);
};
