import { Arguments, Argv } from "yargs";
import { pressureTest } from "../task";
import { parseProofSubmitMode } from "../util";

export const command = "pressuretest";
export const desc = "Run pressure test of zkwasm playground: send prove request and query requests in parallel over their respective intervals.";

export const builder = (yargs: Argv) => {
  return yargs
    .option("u", {
      alias: "address",
      describe: "The user address which adds the proving task",
      demandOption: "User address is required",
      type: "string",
    })
    .option("x", {
      alias: "priv",
      describe: "The private key of user address",
      demandOption: "The priv is required for signing message.",
      type: "string",
    })
    .option("public_input", {
      describe:
        "The public input of the proof, inputs must have format (0x)[0-f]*:(i64|bytes|bytes-packed) and been separated by spaces (eg: 0x12:i64 44:i64 32:i64).",
      type: "string",
      default: "",
    })
    .option("private_input", {
      describe: "The private input of the proof. Currently not supported",
      type: "string",
      default: "",
    })
    .option("submit_mode", {
      describe:
        "The submit mode of the proving task. Specify 'Auto' or 'Manual'. If not specified, the default is 'Manual'",
      type: "string",
      default: "Manual",
    })
    .option("num_prove_tasks", {
      describe:
        "Number of prove tasks to run during a single interval in the pressure test, default is 1",
      type: "number",
      default: 1,
    })
    .option("interval_prove_tasks_ms", {
      describe:
        "Interval (msec) in which to run prove tasks during pressure test, default is 5000",
      type: "number",
      default: 5000,
    })
    .option("num_query_tasks", {
      describe:
        "Number of query tasks to run during a single interval in the pressure test, default is 1",
      type: "number",
      default: 1,
    })
    .option("interval_query_tasks_ms", {
      describe:
        "Interval (msec) in which to run query tasks during pressure test, default is 100",
      type: "number",
      default: 100,
    })
    .option("total_time_sec", {
      describe: "Total time of pressure test (sec), default is 10",
      type: "number",
      default: 10,
    })
    .option("verbose", {
      describe: "Enable verbose logging, default is false.",
      type: "boolean",
      default: false,
    })
    .option("image_md5s", {
      describe:
        "List of image md5s (one or more, comma seperated) to use for prove tasks. Overrides original behaviour of randomly selectly available images.",
      type: "string",
    })
    .option("query_tasks_only", {
      describe:
        "When generating random queries for pressure test, only generate ones that query 'task' collection.",
      type: "boolean",
      default: false,
    });
};

export const handler = async (argv: Arguments) => {
  console.log("Begin pressure test with args", argv);

  const image_mds_in = argv.image_md5s
    ? (argv.image_md5s as string).split(",")
    : [];
  if (image_mds_in.length !== 0) {
    console.log("Using input image md5s", image_mds_in);
  }

  await pressureTest(
    argv.r as string,
    argv.u as string,
    argv.x as string,
    argv.public_input as string,
    argv.private_input as string,
    parseProofSubmitMode(argv.submit_mode),
    argv.num_prove_tasks as number,
    argv.interval_prove_tasks_ms as number,
    argv.num_query_tasks as number,
    argv.interval_query_tasks_ms as number,
    argv.total_time_sec as number,
    argv.verbose as boolean,
    argv.query_tasks_only as boolean,
    image_mds_in,
  );
};
