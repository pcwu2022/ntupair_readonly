'use strict';

const { chat } = require("../database/databaseenv.js");
// import modules
const databasehandler = require("../database/databasehandler.js");
const systemnotifications = require("../database/systemnotifications.js");
const chathandler = require("../chat/chathandler.js");
const verifyHandler = require("../verify/verifyhandler.js");

// testdata.json: store keys in db
let testDataArray = [];

// get test keys from db
async function getTests(req, res){
    let username = req.query.username;
    let data = await databasehandler.readTestdata();
    let database = {};
    try {
        database = JSON.parse(data);
    } catch (err){
        console.log(err);
    }
    let keys = Object.keys(database);
    let sendObj = {
        success: false,
        tests: {}
    };

    try {
        let userAnswer = await databasehandler.readAnswer(username);
        if (userAnswer === undefined){
            userAnswer = {};
        }
        for (let key of keys){
            // splice out blanks
            let convertedKey = key.replace(/\s+/g, '');
            // null: from sql
            if (userAnswer[convertedKey] === undefined || userAnswer[convertedKey] === null){
                sendObj.tests[key] = true;
            } else {
                sendObj.tests[key] = false;
            }
        }
        sendObj.success = true;
    } catch (err){
        console.log(err);
    }
    
    res.send(sendObj);
};

async function match(req, res){
    let username = req.query.username;
    // selectors
    let useData = req.query.useData;
    let length = (req.query.length === undefined)?10:req.query.length;
    let gender = (req.query.gender === undefined)?"Both":req.query.gender;
    // length * 3 for constraints
    if (gender !== "Both"){
        length *= 3;
    }
    let sendObj = {};
    sendObj.success = true;

    // match algorithm
    if (useData === undefined){
        useData = [];
    } else {
        try {
            useData = JSON.parse(useData);
        } catch(err){
            useData = [];
            sendObj.success = false;
            res.send(sendObj);
            return;
        }
        for (let i = 0; i < useData.length; i++){
            // splice off spaces
            useData[i] = useData[i].replace(/\s+/g, '');
        }
    }

    let dataString = await databasehandler.readAnswerColumns(useData);
    // console.log(dataString);
    if (Object.keys(dataString).length === 0){
        // no data
        sendObj.result = {};
    } else {
        let resultObj = {};
        for (let test of useData){
            let userArr = [];
            // get current user data
            for (let user of dataString){
                if (user.username === username){
                    try{
                        userArr = JSON.parse(user[test]);
                    } catch(err){
                        console.log(err);
                    }
                    break;
                }
            }
            // find the square of the user vector
            let userSquare = 0;
            for (let i = 0; i < userArr.length; i++){
                userSquare += userArr[i]*userArr[i];
            }

            // match user by user
            for (let user of dataString){
                if (user.username === username){
                    continue;
                }
                try{
                    let targetArr = JSON.parse(user[test]);
                    // find the square of the target vector
                    let targetSquare = 0;
                    for (let i = 0; i < targetArr.length; i++){
                        targetSquare += targetArr[i]*targetArr[i];
                    }
                    let squareMax = Math.max(userSquare, targetSquare);
                    let arrLength = Math.min(userArr.length, targetArr.length);
                    let sum = 0;
                    for (let i = 0; i < arrLength; i++){
                        sum += userArr[i]*targetArr[i];
                    }
                    if (squareMax === 0){
                        sum = 1;
                    } else {
                        sum /= squareMax;
                    }

                    if (resultObj[user.username] === undefined){
                        resultObj[user.username] = sum;
                    } else {
                        resultObj[user.username] += sum;
                    }
                } catch(err){
                    console.log(err);
                } 
            }
        }
        sendObj.result = {};
        for (let key in resultObj){
            resultObj[key] = Math.round(resultObj[key]/useData.length*50+50)/100;
        }
        for (let i = 0; i < length; i++){
            let maxNum = 0;
            let maxKey = "";
            if (Object.keys(resultObj).length === 0){
                break;
            }
            for (let key in resultObj){
                if (resultObj[key] > maxNum){
                    maxNum = resultObj[key];
                    maxKey = key;
                }
            }
            sendObj.result[maxKey] = maxNum;
            delete resultObj[maxKey];
        }

        
    }

    // get gender of targets
    sendObj.gender = {};
    sendObj.department = {};
    sendObj.onlineStatus = {};
    if (Object.keys(sendObj.result).length > 0){
        let whereSql = "username IN (";
        for (let key in sendObj.result){
            whereSql += "'" + key + "',";
        }
        whereSql = whereSql.substring(0, whereSql.length-1);
        whereSql += ")";
        try {
            let userGender = await databasehandler.readUserdata("username, gender, department", whereSql);
            for (let key in userGender){
                if (userGender[key].gender === gender || gender === "Both"){
                    sendObj.gender[key] = userGender[key].gender;
                    sendObj.department[key] = userGender[key].department;
                    sendObj.onlineStatus[key] = chathandler.isOnline(key);
                } else {
                    delete sendObj.result[key];
                }
            }
        } catch (err) {
            console.log(err);
        }
    }

    res.send(sendObj);
};

// get notifications
async function getNotifications(req, res){
    let username = req.query.username;
    let sendObj = {};
    sendObj.success = false;
    if (username === undefined){
        res.send(sendObj);
        return;
    }

    let notifications = [];
    try {
        // get from chat_menu
        let userChatData = await databasehandler.readChatmenu(username);
        let unreadStack = [];
        let unreadCount = 0;
        let lastSentTime = 0;
        for (let chatObj of userChatData){
            // check active or passive
            let active = chatObj.status.indexOf("is") !== -1;
            // unread
            if ((chatObj.unread > 0) !== active && chatObj.unread !== 0){
                // has unread messages
                if (chatObj.status.indexOf("rejected") === -1){
                    unreadStack.push(chatObj.target);
                    unreadCount += (chatObj.unread*1 === NaN)?0:Math.abs(chatObj.unread);
                    lastSentTime = (lastSentTime > parseInt(chatObj.lastSentTime))?lastSentTime:parseInt(chatObj.lastSentTime);
                }
            }
            // requests
            if (chatObj.status === "requesting"){
                // has unaccepted requests
                let message = `You have a message request from ${chatObj.target}`;
                notifications.push([message, './chatmenu.html', chatObj.lastSentTime]);
            }
        }
        if (unreadCount !== 0){
            let message = `You have ${unreadCount} messages from `;
            if (unreadStack.length > 2){
                message += unreadStack[0] + ", " + unreadStack[1] + ", and " + (unreadStack.length-2) + " more";
            } else if (unreadStack.length === 2){
                message += unreadStack[0] + " and " + unreadStack[1];
            } else {
                message += unreadStack[0];
            }
            notifications.push([message, './chatmenu.html', lastSentTime]);
        }
    
        // get from systemnotifications
        let sysNo = systemnotifications.systemNotifications;
        for (let arr of sysNo){
            notifications.push(arr);
        }
    
        // get from user_data verification
        let currDate = Math.round((new Date).getTime()/1000);
        let userData = await databasehandler.readSingleUserdata(username);
        if (userData.department === "Unverified"){
            if (verifyHandler.getMailsSent() < 400){
                notifications.push(["Your account has not been verified. Click here to verify your account", './verify.html', currDate]);
            }
        }

        sendObj.success = true;
    } catch (err){
        console.log(err);
    }
    sendObj.notifications = notifications;
    res.send(sendObj);
};

module.exports.getTests = getTests;
module.exports.match = match;
module.exports.getNotifications = getNotifications;