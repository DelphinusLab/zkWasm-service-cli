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
      .command(commands.addProvingTask)
      .command(commands.addPayment)
      .command(commands.queryTask)
      .command(commands.pressureTest)
      // Add other commands here as they are implemented
      .example(
        'node dist/index.js addimage -r "http://127.0.0.1:8080" -p "/home/username/arith.wasm" -u "0x278847f04E166451182dd30E33e09667bA31e6a8" -x "xxxxxxx" -n "myfirstimage" -d "My First Image" -c 18',
        "Add wasm image in the specified path to zkwams cloud service."
      )
      .help()
  );
}
