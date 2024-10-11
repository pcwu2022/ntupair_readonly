'use strict';

const databasehandler = require('../database/databasehandler.js');
const loginhandler = require('../login/loginhandler.js');
const encrypt = require('../utilities/encrypt.js');

async function handleAccount(req,res){
    let username = req.body.username;
    let password = req.body.password;
    let gender = req.body.gender;
    let userdata = await databasehandler.readUserdata("username");
    let userKeys = [];
    let sendObj = {};
    sendObj.success = false;
    sendObj.valid = false;
    // check username validation
    if (!/^[A-Za-z0-9_.]*$/.test(username)){
        res.send(sendObj);
        return;
    } 
    if (username.length > 40 || username.length === 0){
        res.send(sendObj);
        return;
    }
    try {
        password = encrypt.encrypt(password);
        userKeys = Object.keys(userdata);
        sendObj.success = true;
        for (let i = 0; i < userKeys.length; i++){
            userKeys[i] = userKeys[i].toLowerCase();
        }
        if (userKeys.indexOf(username.toLowerCase()) === -1){
            sendObj.valid = true;
            // database user setup
            let changeObj = {
                username: username,
                password: password,
                gender: gender,
                department: "Unverified"
            };
            await databasehandler.writeUserdata(changeObj);
        }
    } catch (err){
        console.log(err);
        sendObj.success = false;
    }
    if (sendObj.success){
        sendObj.sessionCode = loginhandler.createSession(username);
        sendObj.userCount = loginhandler.addUser();
    }
    res.send(sendObj);
}

module.exports.handleAccount = handleAccount;