import {
  runSetupImage,
  runProveImage,
  runResetImage,
  waitForDoneTask,
} from "./util";

describe("zkWasm service CLI task tests", () => {
  test("Test equality.wasm image tasks sequentially", async () => {
    const path = "tests/data/equality.wasm";

    console.log(`Running setup for ${path}`);
    const setup_id = await runSetupImage(path);
    await waitForDoneTask(setup_id);

    console.log(`Running manual proof for ${path}`);
    const prove_id = await runProveImage(path, "Manual", "", "0:i64 0:i64");
    await waitForDoneTask(prove_id);

    console.log(`Running auto proof with input files for ${path}`);
    const auto_prove_id = await runProveImage(
      path,
      "Auto",
      "",
      undefined,
      "tests/data/equality.inputs",
    );
    await waitForDoneTask(auto_prove_id);

    console.log(`Running reset for ${path}`);
    const reset_id = await runResetImage(path);
    await waitForDoneTask(reset_id);
  }, 300_000);

  test("Test context.wasm image tasks sequentially", async () => {
    const wasm = "tests/data/context.wasm";
    const ctx = "tests/data/context.bin";

    console.log(`Running setup for ${wasm}`);
    const setup_id = await runSetupImage(wasm);
    await waitForDoneTask(setup_id);

    console.log(`Running manual proof with context for ${wasm}`);
    const manual_prove_id = await runProveImage(
      wasm,
      "Manual",
      "",
      "",
      undefined,
      ctx,
    );
    await waitForDoneTask(manual_prove_id);

    console.log(`Running auto proof with context for ${wasm}`);
    const auto_prove_id = await runProveImage(
      wasm,
      "Auto",
      "",
      "",
      undefined,
      ctx,
    );
    await waitForDoneTask(auto_prove_id);
  }, 300_000);
});
