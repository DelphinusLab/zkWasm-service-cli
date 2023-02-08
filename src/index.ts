#! /usr/bin/env node
import fs from "fs";
import { resolve } from "path";
import { ZkWasmServiceTaskHelper, ZkWasmServiceImageHelper, ProvingTask, DeployTask, AddWasmImageTask } from "zkwasm-service-helper";
import formdata from "form-data";
const yargs = require("yargs");


async function addNewWasmImage(resturl: string, absPath: string,
  user_addr: string, imageName: string,
  descripton_url: string, avator_url: string,
  circuit_size: number) {
  let fileSelected: Buffer = fs.readFileSync(absPath);

  let task: AddWasmImageTask = {
    name: imageName,
    image: fileSelected,
    user_address: user_addr,
    description_url: descripton_url,
    avator_url: avator_url,
    circuit_size: 18
  }
  let helper = new ZkWasmServiceTaskHelper(resturl, "", "");
  await helper.addNewWasmImage(task);
  console.log("Do addNewWasmImage success!");
}

async function addProvingTask(
  resturl: string,
  user_addr: string,
  image_md5: string,
  public_inputs: string,
  private_inputs: string) {
  let helper = new ZkWasmServiceTaskHelper(resturl, "", "");
  let pb_inputs: Array<string> = helper.parseProvingTaskInput(public_inputs);
  let priv_inputs: Array<string> = helper.parseProvingTaskInput(private_inputs);

  let task: ProvingTask = {
    user_address: user_addr,
    md5: image_md5,
    public_inputs: pb_inputs,
    private_inputs: priv_inputs
  };

  await helper.addProvingTask(task);
  console.log("Do addProvingTask success!");
}

async function addDeployTask(
  resturl: string,
  user_addr: string,
  image_md5: string,
  chain_id: number) {
  let helper = new ZkWasmServiceTaskHelper(resturl, "", "");

  let task: DeployTask = {
    user_address: user_addr,
    md5: image_md5,
    chain_id: chain_id,
  };

  await helper.addDeployTask(task);
  console.log("Do addDeployTask success!");
}

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
      'Add wasm image. Example: npx addimage -r "http://127.0.0.1:8080" -p "/home/username/arith.wasm" -u "0x278847f04E166451182dd30E33e09667bA31e6a8" -n "myfirstimage" -d "My First Image" -c 18',
      // options for your command
      function (yargs: any) {
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

        }).option('c', {
          alias: 'circuit_size',
          describe: "image's circuits size, if not specified, default is 18",
          type: "number",
          nargs: 1
        })
        .option('d', {
          alias: "description",
          describe: "image's description, if not specifed, will use name",
          type: "string",
          nargs: 1
        })
        .option('n', {
          alias: "name",
          describe: "image's name",
          demandOption: "Image name is required",
          type: "string",
          nargs: 1
        })
      },
      // Handler for your command
      async function (argv: any) {
        const absolutePath = resolve(argv.p);
        console.log("Begin adding image for ", absolutePath);
        let circuit_size:number = argv.c? argv.c : 18;
        let desc = argv.d ? argv.d : argv.n;
        await addNewWasmImage(argv.r, absolutePath, argv.u, argv.n, desc, "", circuit_size);
      }
    )
    .command(
      'addprovingtask',
      'Add proving task\n Example: npx addprovingtask -r \"http://127.0.0.1:8080\" -i \"4CB1FBCCEC0C107C41405FC1FB380799\" -u \"0x278847f04E166451182dd30E33e09667bA31e6a8\"  --public_input "44:i64 32:i64"',
      // options for your command
      function (yargs: any) {
        return yargs.option('i', {
          alias: 'image',
          describe: 'image md5',
          demandOption: "The image md5 is required",  // Required
          type: 'string',
          nargs: 1
        }).option('u', {
          alias: 'address',
          describe: 'User address which adding the image',
          demandOption: "User address is required",
          type: 'string',
          nargs: 1
        }).option('public_input', {
          alias: 'public_input',
          describe: 'public input of the proof, inputs must have format (0x)[0-f]*:(i64|bytes|bytes-packed) and been separated by spaces (eg: 0x12:i64 44:i64 32:i64).',
          type: 'string',
          nargs: 1
        }).option('private_input', {
          alias: 'private_input',
          describe: 'private currently not supported',
          type: 'string',
          nargs: 1
        })
      },
      // Handler for your command
      async function (argv: any) {
        console.log("Begin adding prove task for ", argv.i, argv.public_input);
        await addProvingTask(argv.r, argv.u, argv.i,
          argv.public_input ? argv.public_input : "",
          argv.priv_input ? argv.priv_input : "");
      }
    ).command(
      'adddeploytask',
      'Add deploy task\n Example: npx adddeploytask -r \"http://127.0.0.1:8080\" -i \"4CB1FBCCEC0C107C41405FC1FB380799\" -u \"0x278847f04E166451182dd30E33e09667bA31e6a8\" -c 5',
      // options for your command
      function (yargs: any) {
        return yargs.option('i', {
          alias: 'image',
          describe: 'image md5',
          demandOption: "The image md5 is required",  // Required
          type: 'string',
          nargs: 1
        }).option('u', {
          alias: 'address',
          describe: 'User address which adding the image',
          demandOption: "User address is required",
          type: 'string',
          nargs: 1
        }).option('c', {
          alias: 'chain_id',
          describe: 'chain id of the network to deploy',
          demandOption: "Network id is required",
          type: 'number',
          nargs: 1
        })
      },
      // Handler for your command
      async function (argv: any) {
        console.log("Begin adding deploy task for ", argv.i, argv.c);
        await addDeployTask(argv.r, argv.u, argv.i, argv.c);
      }
    )
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
