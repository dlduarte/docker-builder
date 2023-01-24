const fs = require("fs");
const Path = require('path');

export function readJson(path) {
    return JSON.parse(readFile(path));
}

export function readFile(path) {
    return fs.readFileSync(path, 'utf8');
}

export function writeFile(path, data) {
    fs.writeFileSync(path, data);
}

export function readFolder(path) {
    return  fs.readdirSync(path)
        .filter(any => fs.lstatSync(Path.join(path, any)).isDirectory())
        .map(folderName => {
                const folder = Path.join(path, folderName);

                return fs.readdirSync(folder, 'utf8')
                    .filter(file => file === 'config.json')
                    .map(() => readJson(folder + '/config.json'))[0]
            }
        );
    //return fs.readdirSync(path, 'utf8').map(filename => readJson(path + filename));
}

export function createFolfer(path) {
    if (!fs.existsSync(path)) {
        return fs.mkdirSync(path);
    }

    return true;
}

export function deleteFolder(path) {
    if (fs.existsSync(path)) {
        fs.readdirSync(path).forEach(file => {
            const curPath = Path.join(path, file);

            if (fs.lstatSync(curPath).isDirectory()) {
                deleteFolder(path);
            } else {
                fs.unlinkSync(curPath);
            }
        });

        fs.rmdirSync(path);
    }
}