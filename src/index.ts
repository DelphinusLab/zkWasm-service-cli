import { createCLI } from "./cli";

async function main() {
  const cli = createCLI();
  cli.parse();
}

main()
  .then(() => {
    console.log("Run success.");
  })
  .catch((err) => {
    console.log("Run failed! ", err);
  });
