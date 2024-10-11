'use strict';

const databasehandler = require("../database/databasehandler.js");
const chathandler = require("../chat/chathandler.js");

async function getChatmenu(req, res){
    let username = req.query.username;
    let sendObj = {};
    sendObj.success = false;
    if (username === undefined){
        res.send(sendObj);
        return;
    }
    //!! will include "lastupdatedtime" and "recenttext" in the future
    try {
        sendObj.chatArr = await databasehandler.readChatmenu(username);
        sendObj.success = true;
        // get online status
        for (let userObj of sendObj.chatArr){
            userObj.onlineStatus = chathandler.isOnline(userObj.target);
        }
        res.send(sendObj);
    } catch (err){
        console.log(err);
        res.send(sendObj);
        return;
    }
};

async function getChatStatus(req, res){
    let username = req.query.username;
    let target = req.query.target;
    let sendObj = {};
    sendObj.success = false;
    if (username === undefined || target === undefined){
        res.send(sendObj);
        return;
    }
    //!! will include "lastupdatedtime" and "recenttext" in the future
    try {
        let chatData = await databasehandler.readChatmenu(username, target);
        if (chatData.length === 0){
            sendObj.status = null
        } else {
            sendObj.status = chatData[0].status;
        }
        sendObj.success = true;
        res.send(sendObj);
    } catch (err){
        console.log(err);
        res.send(sendObj);
        return;
    }
};

function updateChatStatus(req, res){
    let username = req.body.username;
    let target = req.body.target;
    let status = req.body.status;
    let sendObj = {};
    sendObj.success = false;
    if (username === undefined || target === undefined){
        res.send(sendObj);
        return;
    }

    try {
        databasehandler.writeChatmenu(username, target, status);
        sendObj.success = true;
        res.send(sendObj);
    } catch (err){
        console.log(err);
        res.send(sendObj);
    }
};

module.exports.getChatmenu = getChatmenu;
module.exports.getChatStatus = getChatStatus;
module.exports.updateChatStatus = updateChatStatus;