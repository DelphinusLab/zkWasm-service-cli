import yargs from "yargs";
import * as commands from "./commands";

export function createCLI() {
  return (
    yargs
      .scriptName("zkwasm-service-cli")
      .usage("Usage: npx $0 <command> <options>")
      .option("r", {
        alias: "resturl",
        describe: "The rest url of zkwasm cloud serivce.",
        demandOption: "The rest url is required.",
        type: "string",
      })
      .command(commands.addImage)
      .command(commands.addResetImageTask)
      .command(commands.addProvingTask)
      .command(commands.addPayment)
      .command(commands.queryTask)
      .command(commands.pressureTest)
      .command(commands.proverProfile)
      // Add other commands here as they are implemented
      .example('-r "http://127.0.0.1:8108" -u "0x000000..." -x "00000000..." --path "/home/username/arith.wasm" -d "My First Image" -c 22 ', "Add wasm image in the specified path to zkwams cloud service.",)
      .help()
  );
}
