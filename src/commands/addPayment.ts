import { Arguments, Argv } from "yargs";
import { addPaymentWithTx, addNewPayment } from "../task";

export const command = "addpayment";
export const desc = "Add payment";

export const builder = (yargs: Argv) => {
  return yargs
    .option("t", {
      alias: "tx",
      describe: "transaction hash",
      type: "string",
    })
    .option("p", {
      alias: "provider",
      describe:
        "Provider to connect to a network. Required to send transaction.",
      type: "string",
    })
    .option("x", {
      alias: "priv",
      describe: "The priv of user address. Required to send transaction",
      type: "string",
    })
    .option("a", {
      alias: "amount",
      describe: "amount of payment. Required to send transaction",
      type: "string",
    });
};

export const handler = async (argv: Arguments) => {
  let useTx = argv.t ? true : false;
  console.log("Begin adding payment for user", argv.u);

  if (useTx) {
    await addPaymentWithTx(argv.t as string, argv.r as string);
  } else {
    console.log("Creating new transaction...");
    await addNewPayment(
      argv.r as string,
      argv.p as string,
      argv.a as string,
      argv.x as string
    );
  }
};
