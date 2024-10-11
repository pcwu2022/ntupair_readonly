'use strict';

// import packages
const path = require('path');
const databasehandler = require('../database/databasehandler.js');
const encrypt = require('../utilities/encrypt.js');

// session code
let sessionObj = {};
let userCount = 0;

// count users
function countUsers(){
    databasehandler.readUserLength().then((number) => {
        userCount = number;
    }).catch((err) => {console.log(err)});
};
countUsers();

function addUser(){
    userCount += 1;
    return userCount;
}

function sendLoginFile(req, res){
    res.sendFile(path.join(__dirname, 'login.html'));
};

function createSession(username){
    let millis = new Date().getTime();
    let sessionCode = Math.round(millis+Math.random()*100000000).toString(16);
    sessionObj[username] = sessionCode;
    return sessionCode;
};

async function handleLogin(req, res){
    let username = req.body.username;
    let password = req.body.password;
    let sendObj = {};

    // asynchronously call check encrypted password
    password = encrypt.encrypt(password);
    sendObj.success = await databasehandler.checkPassword(username, password);
    if (sendObj.success){
        sendObj.sessionCode = createSession(username);
        sendObj.userCount = userCount;
    }
    res.send(sendObj);
};

function checkSession(req, res){
    let username = req.body.username;
    let sessionCode = req.body.sessionCode;
    let sendObj = {};
    if (sessionObj[username] === sessionCode){
        sendObj.success = true;
    } else {
        sendObj.success = false;
        if (sessionObj[username] !== undefined){
            delete sessionObj[username];
        }
    }
    res.send(sendObj);
}

function checkSessionInternal(username, sessionCode){
    if (sessionObj[username] === sessionCode){
        return true;
    } else {
        return false;
    }
}

// export functions
module.exports.sendLoginFile = sendLoginFile;
module.exports.handleLogin = handleLogin;
module.exports.checkSession = checkSession;
module.exports.createSession = createSession;
module.exports.addUser = addUser;
module.exports.checkSessionInternal = checkSessionInternal;