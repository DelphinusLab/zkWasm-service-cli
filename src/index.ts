#! /usr/bin/env node
import fs from "fs";
import {resolve} from "path";
import {ZkWasmServiceTaskHelper, ZkWasmServiceImageHelper, ProvingTask, DeployTask} from "zkwasmservicehelper";
import formdata from "form-data";
const yargs = require("yargs");


async function addNewWasmImage(resturl:string, path:string, user_addr:string) {
  let formData = new formdata();
  let fileSelected = fs.readFileSync(path);
  formData.append("image", fileSelected, "arith");
  formData.append("user_address", user_addr);
  let helper = new ZkWasmServiceTaskHelper(resturl, "", "");
  await helper.addNewWasmImage(formData);
  console.log("Do addNewWasmImage success!");
}
/*
async function addProvingTask(task) {

  let helper  = new zkWasmHelperFactory.ZkWasmServiceTaskHelper(resturl, "", "");
  await helper.addProvingTask(task);
  console.log("Do addProvingTask success!");
  
  const response = await this.invokeRequest(
      "POST",
      "/prove",
      JSON.parse(JSON.stringify(task))
  );
  console.log("get addProvingTask response:", response.toString());
  return response;
}
*/
async function main() {
  yargs.scriptName("zkwasm-service-helper")
    .usage("Usage: npx $0 <command> <options>")
    .example(
      "npx $0 addimage -r \"http://127.0.0.1:8080\" -p \"/home/username/arith.wasm\" -u \"0x278847f04E166451182dd30E33e09667bA31e6a8\"",
      "Add wasm image in the specified path to zkwams cloud service."
    )
    .option("r", {
      alias: "resturl",
      describe: "The rest url of zkwasm cloud serivce.",
      demandOption: "The rest url is required.",
      type: "string",
      nargs: 1,
    })
    .command(
      'addimage',
      'Add wasm image',
      // options for your command
      function (yargs:any) {
        return yargs.option('p', {
          alias: 'path',
          describe: 'Wasm image path',
          demandOption: "The wasm image path is required",  // Required
          type: 'string',
          nargs: 1
        }).option('u', {
          alias: 'address',
          describe: 'User address which adding the image',
          demandOption: "User address is required",
          type: 'string',
          nargs: 1

        })
      },
      // Handler for your command
      async function (argv:any) {
        const absolutePath = resolve(argv.p);
        console.log("Begin adding image for ", absolutePath, argv.u, argv.r);
        await addNewWasmImage(argv.r, absolutePath, argv.u);
      }
    )
    /*.command(
      'addimage',
      'Add wasm image',
      // options for your command
      function (yargs) {
        return yargs.option('p', {
          alias: 'path',
          describe: 'Wasm image path',
          demandOption: "The wasm image path is required",  // Required
          type: 'string',
          nargs: 1
        }).option('u', {
          alias: 'address',
          describe: 'User address which adding the image',
          demandOption: "User address is required",
          type: 'string',
          nargs: 1

        })
      },
      // Handler for your command
      async function (argv) {
        const absolutePath = resolve(argv.p);
        console.log("Begin adding image for ", absolutePath, argv.u, argv.r);
        await addNewWasmImage(argv.r, absolutePath, argv.u);
      }
    )*/
    .help();

  yargs.parse();
}

main()
  .then(text => {
    console.log("Run success.");
  })
  .catch(err => {
    // Deal with the fact the chain failed
    console.log("Run failed! ", err);
  });
