'use strict';

const nodemailer = require('nodemailer');
const fs = require('fs');
const departmentjs = require('../utilities/department.js');
const databasehandler = require('../database/databasehandler.js');

const env = {
    email: 'ntupair@gmail.com',
    emailSender: 'NTU Pair Service',
    emailPassword: '12345678'
};

let html = "";
fs.readFile('./verify/verifyemail.html', 'utf-8', (err, data) => {
    if (err){
        console.log(err);
    } else {
        html = data;
    }
});

let verifyKeys = {};
let lastUpdatedTime = (new Date()).getDate();
let mailsSent = 0;

function getMailsSent(){
    return mailsSent;
};
function setMailsSent(value){
    mailsSent = value;
};

async function send(receivers = env.email, subject = "Message from NTU Pair", text = "", html = "") {
    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true, // use SSL
        auth: {
            user: env.email,
            pass: env.emailPassword
        }
    });

    // send mail with defined transport object
    mailsSent += 1;
    let info = await transporter.sendMail({
        from: `"${env.emailSender}" <${env.email}>`, // sender address
        to: receivers, // list of receivers
        subject: subject, // Subject line
        text: text, // plain text body
        html: html // html body
    });
};

async function sendVerification(req, res){
    let username = req.body.username;
    let address = req.body.address;
    let location = req.get("origin");
    let sendObj = {
        success: false
    };
    if (username === undefined || address === undefined){
        res.send(sendObj);
        return;
    }
    // setup verify keys
    let key = Math.random().toString(36).substring(2);
    key += Math.random().toString(36).substring(2);
    key += Math.random().toString(36).substring(2);
    
    // check if same key exists
    while (verifyKeys[key] !== undefined){
        key = Math.random().toString(36).substring(2);
        console.log("Key crash");
    }

    // !clear on day start
    let currDate = (new Date()).getDate;
    if (currDate !== lastUpdatedTime){
        lastUpdatedTime = currDate;
        mailsSent = 0;
        let currTime = Math.round((new Date()).getTime()/1000);
        for (let key in verifyKeys){
            if (verifyKeys[key] === undefined){
                delete verifyKeys[key];
            } else {
                if (currTime - verifyKeys[key][2] > 24*60*60){
                    // expired
                    delete verifyKeys[key];
                }
            }
        }
    }

    // check if max 450
    if (mailsSent >= 450){
        sendObj.success = true;
        sendObj.warning = "The system has reached the maximum number of mails sent today. Please try tomorrow.";
        res.send(sendObj);
        return;
    }
    let time = Math.round((new Date()).getTime()/1000);
    verifyKeys[key] = [username, address, time];

    let href = location + "/verified.html?username=" + username + "&key=" + key;
    let sendHtml = html.replaceAll("--username--", username);
    sendHtml = sendHtml.replaceAll("--href--", href);
    
    send(address, "NTU Pair Account Verification", href, sendHtml).then(() => {
        sendObj.success = true;
        sendObj.warning = "";
        res.send(sendObj);
    }).catch((err) => {
        if (err){
            sendObj.success = true;
            sendObj.warning = "Cannot send to address " + address;
            res.send(sendObj);
            console.log(err);
        }
    });
};

async function checkVerification(req, res){
    let username = req.query.username;
    let key = req.query.key;
    let sendObj = {
        success: false
    }
    if (username === undefined || key === undefined){
        res.send(sendObj);
        return;
    }
    if (verifyKeys[key] === undefined){
        sendObj.success = true;
        sendObj.warning = "Wrong key or key expired";
        res.send(sendObj);
        return;
    }
    if (verifyKeys[key][0] !== username){
        sendObj.success = true;
        sendObj.warning = "Wrong key or key expired";
        res.send(sendObj);
        return;
    }
    sendObj.success = true;
    sendObj.warning = "";
    let atIndex = verifyKeys[key][1].indexOf("@");
    sendObj.department = departmentjs.getDepartment(verifyKeys[key][1].substring(0, atIndex));
    res.send(sendObj);
    delete verifyKeys[key];
};

async function setDepartment(req, res){
    let username = req.body.username;
    let department = req.body.department;
    let sendObj = {
        success: false
    };
    if (username === undefined || department == undefined){
        res.send(sendObj);
        return;
    }

    try {
        let changeObj = {
            username: username,
            department: department
        };
        await databasehandler.writeUserdata(changeObj);
        sendObj.success = true;
        res.send(sendObj);
    } catch (err) {
        sendObj.error = err.toString();
        res.send(sendObj);
    }
};

module.exports.sendVerification = sendVerification;
module.exports.checkVerification = checkVerification;
module.exports.setDepartment = setDepartment;
module.exports.getMailsSent = getMailsSent;
module.exports.setMailsSent = setMailsSent;