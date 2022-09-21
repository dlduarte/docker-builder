import {deleteFile, readFile, readFolder, writeFile} from "@/utilities/file";
import {v4 as uuid} from "uuid";

const BASIC_PATH = require('@/utilities/configure-app').configPath() + '/builders/';

export function listBuilders() {
    return readFolder(BASIC_PATH);
}

export function findBuilder(event, id) {
    return readFile(`${BASIC_PATH}${id}.json`);
}

export function saveBuilder(event, builder) {
    if (!builder.id) builder.id = uuid();
    writeFile(`${BASIC_PATH}${builder.id}.json`, JSON.stringify(builder, null, 2))
}

export function removeBuilder(event, id) {
    if (id) {
        deleteFile(`${BASIC_PATH}${id}.json`)
    }
}