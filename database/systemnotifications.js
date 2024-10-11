'use strict';

const broadcast = true;
const time = Math.round((new Date()).getTime()/1000);

const systemNotifications = [
    ["[System Notification] NTU Pair is now on read-only mode. Editing is not supported after 2023/08/05. For more information, please contact ntupair@gmail.com.", "./home.html", time]
];

if (broadcast){
    module.exports.systemNotifications = systemNotifications;
} else {
    module.exports.systemNotifications = [];
}