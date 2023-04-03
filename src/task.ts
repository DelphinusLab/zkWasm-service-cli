import fs from "fs";
import { parse } from "path";
import { signMessage } from "./util";
import { ZkWasmServiceHelper, WithSignature, ProvingParams, DeployParams, AddImageParams, ZkWasmUtil } from "zkwasm-service-helper";

export async function addNewWasmImage(resturl: string, absPath: string,
    user_addr: string, imageName: string,
    description_url: string, avator_url: string,
    circuit_size: number) {
    const filename = parse(absPath).base;
    let fileSelected: Buffer = fs.readFileSync(absPath);

    let md5 = ZkWasmUtil.convertToMd5(
        new Uint8Array(fileSelected)
    );
    let info: AddImageParams = {
        name: filename,
        image_md5: md5,
        image: fileSelected,
        user_address: user_addr.toLowerCase(),
        description_url: description_url,
        avator_url: avator_url,
        circuit_size: circuit_size,
    };
    let msg = ZkWasmUtil.createAddImageSignMessage(info);
    let signature: string;
    try {
        signature = signMessage(msg);
        console.log("signature is:", signature);
    } catch (e: unknown) {
        console.log("sign error: ", e);
        return;
    }
    let task: WithSignature<AddImageParams> = {
        ...info,
        signature,
    };

    let helper = new ZkWasmServiceHelper(resturl, "", "");
    await helper.addNewWasmImage(task);
    console.log("Finish addNewWasmImage!");
}


export async function addProvingTask(
    resturl: string,
    user_addr: string,
    image_md5: string,
    public_inputs: string,
    private_inputs: string) {
    let helper = new ZkWasmServiceHelper(resturl, "", "");
    let pb_inputs: Array<string> = helper.parseProvingTaskInput(public_inputs);
    let priv_inputs: Array<string> = helper.parseProvingTaskInput(private_inputs);

    let info: ProvingParams = {
        user_address: user_addr.toLowerCase(),
        md5: image_md5,
        public_inputs: pb_inputs,
        private_inputs: priv_inputs,
    };
    let msgString = ZkWasmUtil.createProvingSignMessage(info);

    let signature: string;
    try {
        signature = await signMessage(msgString);
    } catch (e: unknown) {
        console.log("error signing message", e);
        return;
    }

    let task: WithSignature<ProvingParams> = {
        ...info,
        signature: signature,
    };

    await helper.addProvingTask(task);
    console.log("Finish addProvingTask!");
}

async function addDeployTask(
    resturl: string,
    user_addr: string,
    image_md5: string,
    chain_id: number) {
    let helper = new ZkWasmServiceHelper(resturl, "", "");

    let info: DeployParams = {
        user_address: user_addr.toLowerCase(),
        md5: image_md5,
        chain_id: chain_id,
    };
    let msgString = ZkWasmUtil.createDeploySignMessage(info);
    let signature: string;
    try {
        signature = await signMessage(msgString);
    } catch (e: unknown) {
        console.log("error signing message", e);
        return;
    }
    let task: WithSignature<DeployParams> = {
        ...info,
        signature: signature,
    };

    await helper.addDeployTask(task);
    console.log("Finish addDeployTask!");
}