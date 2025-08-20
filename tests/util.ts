import { execFileSync } from "child_process";
import path from "path";
import { Wallet } from "ethers";
import * as fs from "fs";
import { Md5 } from "ts-md5";

export interface TestConfig {
  details: {
    server_url: string;
    private_key: string;
    chain_ids: string;
  };
  query: {
    task_id: string;
    md5: string;
  };
}

const raw = fs.readFileSync("tests/config.json", "utf-8");

export const CONFIG = JSON.parse(raw) as TestConfig;

export const USER_ADDRESS = new Wallet(
  CONFIG.details.private_key,
).address.toLowerCase();

const CLI_PATH = path.resolve(__dirname, "../dist/index.js");

export function runCLI(inputs: string[]): { stdout: string; stderr: string } {
  try {
    const args = [CLI_PATH, ...inputs];
    console.log("node", args.join(" "));
    const output = execFileSync("node", args, {
      encoding: "utf8",
      stdio: ["pipe", "pipe", "pipe"],
    });
    return { stdout: output.trim(), stderr: "" };
  } catch (err: any) {
    return {
      stdout: (err.stdout || "").toString().trim(),
      stderr: (err.stderr || "").toString().trim(),
    };
  }
}



function convertToMd5(val: Uint8Array): string {
  let md5 = new Md5();
  md5.appendByteArray(val);
  let hash = md5.end();
  if (!hash) return "";
  return hash.toString();
}

function parseResp(resp: string): [string, string] {
  const id_match = resp.match(/\bid\s*:\s*([^\s,]+)/);
  const id = id_match ? id_match[1] : null;
  const md5_match = resp.match(/\bmd5\s*:\s*([^\s,]+)/);
  const md5 = md5_match ? md5_match[1] : null;
  return [id!.replace(/'/g, ""), md5!.replace(/'/g, "")];
}

export function readFileMd5(path: string): string {
  const buffer: Buffer = fs.readFileSync(path);
  const md5 = convertToMd5(buffer as Uint8Array);
  return md5.toUpperCase();
}

export async function waitForDoneTask(id: string): Promise<void> {
  while (true) {
    const res = runCLI([
      "querytask",
      "-r",
      CONFIG.details.server_url,
      "--concise",
      "true",
      ...["--task_id", id],
    ]);
    if (res.stdout.includes(`status: 'Done'`)) {
      break;
    }
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }
}

const CMD_USER_ARGS = [
  "-r",
  CONFIG.details.server_url,
  "-u",
  USER_ADDRESS,
  "-x",
  CONFIG.details.private_key,
  "--versbose",
  "true",
];

const CMD_IMAGE_ARGS = [
  "-c",
  "22",
  "--creator_paid_proof",
  "false",
  "--creator_only_add_prove_task",
  "false",
  "--auto_submit_network_ids",
  CONFIG.details.chain_ids,
];

export async function runSetupImage(path: string): Promise<string> {
  const file_md5 = readFileMd5(path);
  let output = runCLI([
    "addimage",
    ...CMD_USER_ARGS,
    ...CMD_IMAGE_ARGS,
    "-d",
    `Test CLI ${file_md5} Image description`,
    "--path",
    path,
  ]);

  if (
    new RegExp(`Image with md5 .*${file_md5}.* already exists`).test(
      output.stdout,
    )
  ) {
    console.log(`Reset required for image ${file_md5}"`);
    const id = await runResetImage(path);
    return id;
  }
  const [id, md5] = parseResp(output.stdout);
  expect(md5).toEqual(file_md5);
  return id;
}

export async function runProveImage(
  path: string,
  submit_mode: string,
  pub_inp: string,
  pri_inp: string | undefined = undefined,
  pri_inp_file: string | undefined = undefined,
  ctx_inp_file: string | undefined = undefined,
): Promise<string> {
  const md5 = readFileMd5(path);
  const pub = pub_inp === "" ? [] : ["--public_input", pub_inp];
  const pri = pri_inp
    ? pri_inp === ""
      ? []
      : ["--private_input", pri_inp]
    : pri_inp_file
      ? ["--private_input_file", pri_inp_file]
      : [];
  const ctx = !ctx_inp_file
    ? []
    : ["--context_file", ctx_inp_file, "--input_context_type", "Custom"];

  const output = runCLI([
    ...[
      "addprovingtask",
      ...CMD_USER_ARGS,
      "--image",
      md5,
      "--submit_mode",
      submit_mode,
    ],
    ...pub,
    ...pri,
    ...ctx,
  ]);

  console.log(output);
  expect(output.stdout).toContain("Add Proving task Response");
  const [id, resp_md5] = parseResp(output.stdout);
  expect(resp_md5).toEqual(md5);
  return id;
}

export async function runResetImage(path: string): Promise<string> {
  const md5 = readFileMd5(path);
  const output = runCLI([
    "resetimage",
    ...CMD_USER_ARGS,
    ...CMD_IMAGE_ARGS,
    "--image",
    md5,
  ]);

  expect(output.stdout).toContain("Add Reset Image Response");
  console.log(output);
  const [id, resp_md5] = parseResp(output.stdout);
  expect(resp_md5).toEqual(md5);
  return id!;
}
