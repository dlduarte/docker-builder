import {createFolfer, readJson, readFolder, writeFile, readFile, deleteFolder} from "@/utilities/file";

const BASIC_PATH = require('@/utilities/configure-app').configPath() + '/builders/';

export function listBuilders() {
    return readFolder(BASIC_PATH);
}

export function findBuilder(event, image) {
    return readJson(`${BASIC_PATH}${image}/config.json`);
}

export function saveBuilder(event, builder) {
    const path = `${BASIC_PATH}${builder.image}`;
    const dockerfile = readFile(builder.path);

    delete builder.path;

    createFolfer(path);
    writeFile(path + '/Dockerfile', dockerfile);
    writeFile(path + '/config.json', JSON.stringify(builder, null, 2))
}

export function removeBuilder(event, image) {
    deleteFolder(`${BASIC_PATH}${image}`)
}