import notification from "@/backend/notification";

const sudo = require('sudo-prompt')

const BASIC_PATH = require('@/utilities/configure-app').configPath() + '/cmd/';

const options = {
    name: 'Electron',
    icns: '/Applications/Electron.app/Contents/Resources/Electron.icns'
}

export function publishImage(event, name, version, path) {
    const cmd = `${BASIC_PATH}push-docker-image.sh ${name} ${version} ${path}`;

    sudo.exec(cmd, options, (error) => {
        if (error) {
            notification(null, 'Erro ao realizar build', error.message, 'critical');
            event.reply('publish-docker-image', false);
        } else {
            event.reply('publish-docker-image', true);
        }
    })
}