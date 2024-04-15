#! /usr/bin/env node
import fs from "fs";
import { resolve } from "path";
import {
  addNewWasmImage,
  addProvingTask,
  //addDeployTask,
  addNewPayment,
  addPaymentWithTx,
  pressureTest,
} from "./task";
import{
  queryTask,
} from "./query";
import {
  ZkWasmServiceHelper,
  WithSignature,
  ProvingParams,
  DeployParams,
  AddImageParams,
  ZkWasmUtil,
} from "zkwasm-service-helper";
import formdata from "form-data";
const yargs = require("yargs");

async function main() {
  yargs
    .scriptName("zkwasm-service-cli")
    .usage("Usage: npx $0 <command> <options>")
    .example(
      'node node dist/index.js addimage -r "http://127.0.0.1:8080" -p "/home/username/arith.wasm" -u "0x278847f04E166451182dd30E33e09667bA31e6a8" -x "xxxxxxx" -n "myfirstimage" -d "My First Image" -c 18',
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
      "addimage",
      'Add wasm image. Example: node dist/index.js addimage -r "http://127.0.0.1:8080" -p "/home/username/arith.wasm" -u "0x278847f04E166451182dd30E33e09667bA31e6a8" -x "xxxxxxx" -d "My First Image" -c 18 --creator_paid_proof false',
      // options for your command
      function (yargs: any) {
        return yargs
          .option("p", {
            alias: "path",
            describe: "Wasm image path",
            demandOption: "The wasm image path is required", // Required
            type: "string",
            nargs: 1,
          })
          .option("u", {
            alias: "address",
            describe: "User address which adding the image",
            demandOption: "User address is required",
            type: "string",
            nargs: 1,
          })
          .option("x", {
            alias: "priv",
            describe: "The priv of user address.",
            demandOption: "The priv is required for signing message.",
            type: "string",
            nargs: 1,
          })
          .option("c", {
            alias: "circuit_size",
            describe: "image's circuits size, if not specified, default is 18",
            type: "number",
            nargs: 1,
          })
          .option("d", {
            alias: "description",
            describe: "image's description, if not specifed, will use name",
            type: "string",
            nargs: 1,
          })
          .option("n", {
            alias: "name",
            describe: "image's name",
            type: "string",
            nargs: 1,
          })
          .option("creator_paid_proof", {
            alias: "creator_paid_proof",
            describe: "Specify if proofs for this image will be charged to the creator of the image",
            type: "boolean",
            nargs: 1,
            default: false,
          });
      },
      // Handler for your command
      async function (argv: any) {
        const absolutePath = resolve(argv.p);
        console.log("Begin adding image for ", absolutePath);
        let circuit_size: number = argv.c ? argv.c : 18;
        let desc = argv.d ? argv.d : argv.n;
        await addNewWasmImage(
          argv.r,
          absolutePath,
          argv.u,
          argv.n,
          desc,
          "",
          circuit_size,
          argv.priv,
          argv.creator_paid_proof,
        );
      }
    )
    .command(
      "addprovingtask",
      'Add proving task\n Example: node dist/index.js addprovingtask -r "http://127.0.0.1:8080" -i "4CB1FBCCEC0C107C41405FC1FB380799" -u "0x278847f04E166451182dd30E33e09667bA31e6a8" -x "xxxxxxx"  --public_input "44:i64 32:i64"',
      // options for your command
      function (yargs: any) {
        return yargs
          .option("i", {
            alias: "image",
            describe: "image md5",
            demandOption: "The image md5 is required", // Required
            type: "string",
            nargs: 1,
          })
          .option("u", {
            alias: "address",
            describe: "User address which adding the image",
            demandOption: "User address is required",
            type: "string",
            nargs: 1,
          })
          .option("x", {
            alias: "priv",
            describe: "The priv of user address.",
            demandOption: "The priv is required for signing message.",
            type: "string",
            nargs: 1,
          })
          .option("public_input", {
            alias: "public_input",
            describe:
              "public input of the proof, inputs must have format (0x)[0-f]*:(i64|bytes|bytes-packed) and been separated by spaces (eg: 0x12:i64 44:i64 32:i64).",
            type: "string",
            nargs: 1,
          })
          .option("private_input", {
            alias: "private_input",
            describe: "private currently not supported",
            type: "string",
            nargs: 1,
          });
      },
      // Handler for your command
      async function (argv: any) {
        console.log("Begin adding prove task for ", argv.i, argv.public_input);
        await addProvingTask(
          argv.r,
          argv.u,
          argv.i,
          argv.public_input ? argv.public_input : "",
          argv.priv_input ? argv.priv_input : "",
          argv.priv,
        );
      }
    )
    /*.command(
      "adddeploytask",
      'Add deploy task\n Example: node dist/index.js adddeploytask -r "http://127.0.0.1:8080" -i "4CB1FBCCEC0C107C41405FC1FB380799" -u "0x278847f04E166451182dd30E33e09667bA31e6a8" -x "xxxxxxx" -c 5',
      // options for your command
      function (yargs: any) {
        return yargs
          .option("i", {
            alias: "image",
            describe: "image md5",
            demandOption: "The image md5 is required", // Required
            type: "string",
            nargs: 1,
          })
          .option("u", {
            alias: "address",
            describe: "User address which adding the image",
            demandOption: "User address is required",
            type: "string",
            nargs: 1,
          })
          .option("x", {
            alias: "priv",
            describe: "The priv of user address.",
            demandOption: "The priv is required for signing message.",
            type: "string",
            nargs: 1,
          })
          .option("c", {
            alias: "chain_id",
            describe: "chain id of the network to deploy",
            demandOption: "Network id is required",
            type: "number",
            nargs: 1,
          });
      },
      // Handler for your command
      async function (argv: any) {
        console.log("Begin adding deploy task for ", argv.i, argv.c);
        await addDeployTask(argv.r, argv.u, argv.i, argv.c, argv.priv);
      }
    )*/
    .command(
      "addpayment",
      'Add payment\n Example: node dist/index.js addpayment -r "http://127.0.0.1:8080" -t "<transactionhash>" \n\n Example new payment: \n npx addpayment -r "http://127.0.0.1:8080" -p "https://goerli.infura.io/v3/xxxxxxx" -u "YOUR_ADDRESS" -x "YOUR_PRIVATE_KEY" -a "0.00001" ',
      // options for your command
      function (yargs: any) {
        return yargs
          .option("t", {
            alias: "tx",
            describe: "transaction hash",
            type: "string",
            nargs: 1,
          })
          .option("p", {
            alias: "provider",
            describe:
              "Provider to connect to a network. Required to send transaction.",
            type: "string",
            nargs: 1,
          })
          .option("x", {
            alias: "priv",
            describe: "The priv of user address. Required to send transaction",
            type: "string",
            nargs: 1,
          })
          .option("a", {
            alias: "amount",
            describe: "amount of payment. Required to send transaction",
            type: "string",
          });
      },
      async function (argv: any) {
        // Sign a new transaction or submitting a transaction that has already been submitted
        let useTx = argv.t ? true : false;
        console.log("Begin adding payment for user", argv.u);
        console.log(argv);
        if (useTx) {
          await addPaymentWithTx(argv.t, argv.r);
          return;
        }
        console.log("Creating new transaction...");
        await addNewPayment(argv.r, argv.p, argv.a, argv.x);
      }
    )
    .command(
      "querytask",
      'Query task\n Example: node dist/index.js querytask -r "http://127.0.0.1:8080" -t "<transactionid>" ',
      // options for your command
      function (yargs: any) {
        return yargs
          .option("t", {
            alias: "tx",
            describe: "transaction hash",
            type: "string",
            nargs: 1,
          });
      },
      async function (argv: any) {
        console.log("Creating new transaction...");
        await queryTask(argv.t, argv.r);
      }
    )
    .command(
      "pressuretest",
      'Pressure test. Example: node dist/index.js pressuretest -r "http://127.0.0.1:8080" -p "/home/username/arith.wasm" -u "0x278847f04E166451182dd30E33e09667bA31e6a8" -x "xxxxxxx" -d "My First Image" -c 18 --creator_paid_proof false --public_input "44:i64 32:i64" --num_prove_tasks 20 --num_query_tasks 100',
      // options for your command
      function (yargs: any) {
        return yargs
          .option("p", {
            alias: "path",
            describe: "Wasm image path",
            demandOption: "The wasm image path is required", // Required
            type: "string",
            nargs: 1,
          })
          .option("u", {
            alias: "address",
            describe: "User address which adding the image",
            demandOption: "User address is required",
            type: "string",
            nargs: 1,
          })
          .option("x", {
            alias: "priv",
            describe: "The priv of user address.",
            demandOption: "The priv is required for signing message.",
            type: "string",
            nargs: 1,
          })
          .option("c", {
            alias: "circuit_size",
            describe: "image's circuits size, if not specified, default is 18",
            type: "number",
            nargs: 1,
            default: 18,
          })
          .option("d", {
            alias: "description",
            describe: "image's description, if not specifed, will use name",
            type: "string",
            nargs: 1,
          })
          .option("n", {
            alias: "name",
            describe: "image's name",
            type: "string",
            nargs: 1,
          })
          .option("creator_paid_proof", {
            alias: "creator_paid_proof",
            describe: "Specify if proofs for this image will be charged to the creator of the image",
            type: "boolean",
            nargs: 1,
            default: false,
          })
          .option("public_input", {
            alias: "public_input",
            describe:
              "public input of the proof, inputs must have format (0x)[0-f]*:(i64|bytes|bytes-packed) and been separated by spaces (eg: 0x12:i64 44:i64 32:i64).",
            type: "string",
            nargs: 1,
            default: ""
          })
          .option("private_input", {
            alias: "private_input",
            describe: "private currently not supported",
            type: "string",
            nargs: 1,
            default: ""
          })
          .option("num_prove_tasks", {
            alias: "num_prove_tasks",
            describe: "Number of prove tasks to run in pressure test, default is 1",
            type: "number",
            nargs: 1,
            default: 1
          })
          .option("num_query_tasks", {
            alias: "num_query_tasks",
            describe: "Number of query tasks to run in pressure test, default is 1",
            type: "number",
            nargs: 1,
            default: 1
          })
          ;
      },
      // Handler for your command
      async function (argv: any) {
        const absolutePath = resolve(argv.p);
        console.log("Begin adding image for ", absolutePath);
        let desc = argv.d ? argv.d : argv.n;
        await pressureTest(
          argv.r,
          absolutePath,
          argv.u,
          argv.n,
          desc,
          "",
          argv.c,
          argv.priv,
          argv.creator_paid_proof,
          argv.public_input ? argv.public_input : "",
          argv.private_input ? argv.private_input : "",
          argv.num_prove_tasks,
          argv.num_query_tasks,
        );
      }
    )
    .help();

  yargs.parse();
}

main()
  .then((text) => {
    console.log("Run success.", text);
  })
  .catch((err) => {
    // Deal with the fact the chain failed
    console.log("Run failed! ", err);
  });
