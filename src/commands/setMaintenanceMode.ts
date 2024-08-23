import { Arguments, Argv } from "yargs";

import { setMaintenanceMode } from "../task";

export const command = "setmaintenancemode";
export const desc = "Set maintenance mode for server.";

export const builder = (yargs: Argv) => {
  return (
    yargs
      .option("r", {
        alias: "rest-url",
        describe: "REST API URL",
        type: "string",
        demandOption: "The REST server url",
      })
      // private key
      .option("x", {
        alias: "private-key",
        describe: "Private key",
        type: "string",
        demandOption: "The private key is required",
      })
      // maintenance mode
      .option("active", {
        alias: "active",
        describe: "Maintenance mode",
        type: "boolean",
        demandOption: "The maintenance mode is required",
      })
  );
};

export const handler = async (argv: Arguments) => {
  console.log("Setting maintenance mode...");
  await setMaintenanceMode(
    argv.r as string,
    argv.x as string,
    argv.active as boolean
  );
};
