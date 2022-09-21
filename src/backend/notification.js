const {Notification} = require("electron");

export default function (_, title, body, urgency = 'normal') {
    new Notification({title, body, urgency}).show();
}