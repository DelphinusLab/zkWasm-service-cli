import { Arguments, Argv } from "yargs";
import { queryImage } from "../query";

export const command = "queryimage";
export const desc = "Query image";

export const builder = (yargs: Argv) => {
  return yargs.option("md5", {
    describe: "MD5 of the image to query",
    type: "string",
    demandOption: "MD5 is required to run query",
  });
};

export const handler = async (argv: Arguments) => {
  console.log("Querying image...");
  await queryImage(argv.md5 as string, argv.r as string);
};
