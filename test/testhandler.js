'use strict';

const databasehandler = require("../database/databasehandler.js");

async function getQuestions(req, res){
    let title = req.query.title;
    // get from database
    let testdata = await databasehandler.readTestdata();
    let jsondata = {};
    let sendObj = {};
    sendObj.success = true;
    try {
        jsondata = JSON.parse(testdata);
    } catch (err){
        console.log(err);
    }
    if (jsondata[title] === undefined){
        sendObj.questionArr = [];
        sendObj.success = false;
        res.send(sendObj);
    } else {
        sendObj.questionArr = jsondata[title];
        res.send(sendObj);
    }
};

async function handleTest(req, res){
    let username = req.body.username;
    let title = req.body.title;
    let answerString = req.body.answer;
    let answer = [];
    let sendObj = {};
    try {
        answer = JSON.parse(answerString);
        for (let i = 0; i < answer.length; i++){
            // string to int
            try {
                answer[i] = parseFloat(answer[i]);
            } catch(err){
                answer[i] = 0;
            }
        }
        title = title.replace(/\s+/g, '');
    } catch (err) {
        console.log(err, answerString);
        sendObj.success = false;
        res.send(sendObj);
        return false;
    }

    try {
        await databasehandler.writeAnswer(username, title, answer);
        sendObj.success = true;
    } catch(err){
        console.log(err);
        sendObj.success = false;
    }
    res.send(sendObj);
};

module.exports.getQuestions = getQuestions;
module.exports.handleTest = handleTest;