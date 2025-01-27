import { Arguments, Argv } from "yargs";
import { queryTaskConciseByTypeAndStatus, queryTaskByTypeAndStatus } from "../query";

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

  await queryTaskConciseByTypeAndStatus("Prove", "Done", "https://rpc.zkwasmhub.com:8090", true);
  await queryTaskByTypeAndStatus("Prove", "Done", "https://rpc.zkwasmhub.com:8090", true);
};


async function main() {
  console.log("Querying task...");

  await queryTaskConciseByTypeAndStatus("Prove", "Done", "https://rpc.zkwasmhub.com:8090", true);
  await queryTaskByTypeAndStatus("Prove", "Done", "https://rpc.zkwasmhub.com:8090", true);
}

main()
  .then(() => {
    console.log("Run success.");
  })
  .catch((err) => {
    console.log("Run failed! ", err);
  });
