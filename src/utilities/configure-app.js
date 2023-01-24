import notification from "@/backend/notification";
import * as db from "@/backend/database";

const fs = require("fs");
const BASIC_PATH = require("electron").app.getPath('home');
const sudo = require('sudo-prompt');

const options = {
    name: 'Electron',
    icns: '/Applications/Electron.app/Contents/Resources/Electron.icns'
}

export function configPath() {
    return BASIC_PATH + '/.docker-builder';
}

export async function configure(event, config) {
    fs.mkdirSync(configPath() + '/builders', {recursive: true});
    fs.mkdirSync(configPath() + '/cmd');

    const pushDockerImageFile = configPath() + '/cmd/push-docker-image.sh';
    fs.writeFileSync(
        pushDockerImageFile,
        `
            #!/bin/sh
            echo "image name: $1"
            echo "tag name: $2"
            echo "dockerfile path $3"
            
            docker build -t $1:$2 $3
            
            UUID=\`docker images -q $1:$2\`
            
            docker tag $UUID 192.168.15.34:5000/$1:$2
            docker push 192.168.15.34:5000/$1:$2
        `
    );


    const configDockerFile = configPath() + '/cmd/configure-docker.sh';
    fs.writeFileSync(
        configDockerFile,
        `
            #!/bin/sh
            echo '{ "insecure-registries": ["${config.host}"] }' > /etc/docker/daemon.json
            service docker restart
            docker login ${config.host} -u ${config.user} -p ${config.password}
        `
    );

    const cmdFolderPermissions = 'chmod -R 777 ' + configPath();
    const cmdPermitDockerPushFile = 'chmod +x ' + pushDockerImageFile;
    const cmdPermitConfigFile = 'chmod +x ' + configDockerFile;
    const finalCmd = `${cmdFolderPermissions} && ${cmdPermitDockerPushFile} && ${cmdPermitConfigFile} && ${configDockerFile}`;

    sudo.exec(
        finalCmd,
        options,
        (error) => {
            if (error) {
                notification(null, 'Erro ao configurar o app', error.message, 'critical');
                event.reply('configure', false);
            } else {
                event.reply('configure', true);
            }
        }
    )

    db.initialize();
}

export async function isConfigured() {
    return fs.existsSync(configPath());
}