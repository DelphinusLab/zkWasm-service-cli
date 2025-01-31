import { Arguments, Argv } from "yargs";
import { queryUser } from "../query";

export const command = "queryuser";
export const desc = "Query user";

export const builder = (yargs: Argv) => {
  return yargs.option("user_address", {
    describe: "Address of the user to query",
    demandOption: "Address is required to run query",
    type: "string",
  });
};

export const handler = async (argv: Arguments) => {
  console.log("Querying user...");
  await queryUser(argv.user_address as string, argv.r as string);
};
