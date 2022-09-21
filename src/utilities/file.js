const fs = require("fs");

export function readFile(path) {
    return JSON.parse(fs.readFileSync(path, 'utf8'));
}

export function readFolder(path) {
    return fs.readdirSync(path, 'utf8').map(filename => readFile(path + filename));
}

export function writeFile(path, data) {
    fs.writeFileSync(path, data);
}

export function deleteFile(path) {
    fs.unlinkSync(path);
}