import { Arguments, Argv } from "yargs";
import { addPaymentWithTx, addNewPayment } from "../task";

export const command = "addpayment";
export const desc = "Add payment either by creating an new transaction or using a exiting one";

export const builder = (yargs: Argv) => {
  return yargs
    .option("x", {
      alias: "priv",
      describe: "The private key of user address, required only when creating a new transaction",
      type: "string",
    })
    .option("p", {
      alias: "provider",
      describe:
        "The provider to connect to a network, required only when creating a new transaction",
      type: "string",
    })
    .option("a", {
      alias: "amount",
      describe: "The amount of payment, required only when creating a new transaction",
      type: "string",
    })
    .option("t", {
      alias: "tx",
      describe: "The transaction hash. If provided, will use existing transaction hash to add the payment, no other options are required",
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
      argv.x as string,
    );
  }
};
