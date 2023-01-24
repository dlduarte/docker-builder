import sqlite3 from "sqlite3";

const {execSync} = require('child_process');

export function initialize() {
    const app_locale = require("electron").app.getPath('home') + '/.docker-builder';
    execSync(`sudo chmod -R 777 ${app_locale}`, (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`)
        }

        console.log(`stdout: ${stdout}`);
        console.log(`stderr: ${stderr}`);
    });

    const db_path = app_locale + '/dockerbuilder.db';

    const db = new sqlite3.Database(
        db_path,
        sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
        err => {
            if (err) console.error('Database opening error: ', err);
        }
    );

    db.serialize(() => {
        console.log('serialize!')
        db.run("CREATE TABLE settings (name, value)");
        db.run("INSERT INTO settings VALUES ('theme', 'ligth')")
        db.run("CREATE TABLE makers (name, image, version, profile)");
    });
    db.close();
}
