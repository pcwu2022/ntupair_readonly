'use strict';

const path = require('path');
const fs = require('fs');
const env = require('./databaseenv.js');
const encrypt = require('../utilities/encrypt.js');
const transferdatabase = require('./transferdatabase.js');

/* main code */

function connectionExecute(query, callback){
    let result = transferdatabase.fetch(query);
    callback(false, result, {});
}

function readUserLength(){
    return new Promise((resolve, reject) => {
        let query = `SELECT COUNT(id) FROM ${env.userdata}`;
        connectionExecute(query, function(err, result, fields){
            if (err){
                console.log(err);
                reject(err);
            } else {
                resolve(result[0]["COUNT(id)"]);
            }
        });
    });
};

function readSingleUserdata(username){
    return new Promise((resolve, reject) => {
        let query = `SELECT * FROM ${env.userdata} WHERE BINARY username = '${username}'`;
        connectionExecute(query, function(err, result, fields){
            if (err){
                console.log(err);
                reject(err);
            } else {
                resolve(result[0]);
            }
        });
    });
};

// read from profile database
function readProfile(username){
    return new Promise((resolve, reject) => {
        let query = `SELECT * FROM ${env.profile} JOIN ${env.userdata} ON ${env.profile}.username = ${env.userdata}.username WHERE ${env.userdata}.username = '${username}'`;
        connectionExecute(query, function(err, result, fields){
            if (err){
                console.log(err);
                reject(err);
            } else {
                try {
                    delete result[0].id;
                    delete result[0].password;
                    delete result[0].class;
                } catch (err){
                }
                for (let key in result[0]){
                    if (result[0][key] !== ""){
                        try {
                            result[0][key] = encrypt.decryptText(result[0][key]);
                        } catch {

                        }
                    }
                }
                resolve(result[0]);
            }
        });
    });
};

// write profile database
function writeProfile(username, profile){
    return new Promise((resolve, reject) => {
        readProfile(username).then((userJson) => {
            let query = "";
            if (userJson === undefined){
                // no profile in existance
                let columns = "username , ";
                let values = "'" + username + "' , ";
                for (let key of env.profileColumns){
                    if (key === "id" || key === "username"){
                        continue;
                    }
                    columns += key + " , ";
                    if (profile[key] === undefined){
                        values += "'' , ";
                    } else {
                        values += "'" + encrypt.encryptText(profile[key]) + "' , ";
                    }
                }
                columns = columns.substring(0, columns.length-2);
                values = values.substring(0, values.length-2);
                query = `INSERT INTO ${env.profile} ( ${columns} ) VALUES ( ${values} )`;
            } else {
                // modify profile
                let setString = "";
                for (let key in userJson){
                    if (env.profileColumns.indexOf(key) === -1){
                        continue;
                    }
                    if (key === "id" || key === "username"){
                        continue;
                    }
                    if (userJson[key] !== profile[key]){
                        // update
                        setString += key + " = '" + encrypt.encryptText(profile[key]) + "' , ";
                    }
                }
                if (setString !== ""){
                    setString = setString.substring(0, setString.length-2);
                } else {
                    setString = `username = '${username}'`;
                }
                query = `UPDATE ${env.profile} SET ${setString} WHERE username = '${username}'`;
            }
            connectionExecute(query, (err, result, fields) => {
                if (err){
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        }).catch((err) => {
            console.log(err);
            reject(err);
        });
    });
};

function readUserdata(columnsSql = "*", whereSql = ""){
    return new Promise((resolve, reject) => {
        let whereClause = "";
        if (whereSql !== ""){
            whereClause = "WHERE " + whereSql;
        }
        let query = `SELECT ${columnsSql} FROM ${env.userdata} ${whereClause}`;
        connectionExecute(query, function(err, result, fields){
            if (err){
                console.log(err);
                reject(err);
            } else {
                let resultObj = {};
                for (let i = 0; i < result.length; i++){
                    let key = result[i].username;
                    resultObj[key] = result[i];
                    delete resultObj[key].username;
                }
                resolve(resultObj);
            }
        });
    });
};

function writeUserdata(changeObj){
    return new Promise((resolve, reject) => {
        if (changeObj.username === undefined){
            reject("No username present");
            return;
        }
        let username = changeObj.username;
        readSingleUserdata(username).then((userObj) => {
            let query = ``;
            if (userObj === undefined){
                // insert new user
                changeObj.class = 0;
                let columns = "";
                let values = "";
                for (let key of env.columns){
                    if (key === "id"){
                        continue;
                    }
                    columns += key + " , ";
                    if (changeObj[key] === undefined){
                        values += "'' , ";
                    } else {
                        values += "'" + changeObj[key] + "' , ";
                    }
                }
                // cut the ',' at the end
                columns = columns.substring(0, columns.length-2);
                values = values.substring(0, values.length-2);
                query = `INSERT INTO ${env.userdata} ( ${columns} ) VALUES ( ${values} )`;
            } else {
                // change data
                let setString = "";
                for (let key in changeObj){
                    if (key === "username"){
                        continue;
                    }
                    if (env.columns.indexOf(key) === -1){
                        console.log("Error (databasehandler.js): key doesn't exist");
                        continue;
                    }
                    setString += key + " = '" + changeObj[key] + "' , ";
                }
                if (setString !== ""){
                    setString = setString.substring(0, setString.length-2);
                } else {
                    setString = `username = '${username}'`;
                }
                query = `UPDATE ${env.userdata} SET ${setString} WHERE BINARY username = '${changeObj.username}'`;
            }
            connectionExecute(query, function(err, result, fields){
                if (err){
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        }).catch((err) => {
            console.log(err);
            reject(err);
        });
    });
};

// read testdata.json
function readTestdata(){
    return new Promise((resolve, reject) => {
        fs.readFile(path.join(__dirname, 'testdata.json'), 'utf-8', (err, data) => {
            if (err){
                console.log(err);
                reject(err);
            } else {
                resolve(data); // asynchronously return data
            }
        });
    });
};

// read answer from sql
function readAnswer(username){
    return new Promise((resolve, reject) => {
        username = username.replaceAll(" ", "");
        let query = `SELECT * FROM ${env.answer} WHERE BINARY username = '${username}'`;
        connectionExecute(query, function(err, result, fields){
            if (err){
                console.log(err);
                reject(err);
            } else {
                try {
                    delete result[0].id;
                    delete result[0].username;
                } catch(err){

                }
                resolve(result[0]);
            }
        });
    });
};

// read specific answer columns from sql
function readAnswerColumns(columns){
    return new Promise((resolve, reject) => {
        let selectClause = "username,";
        let whereClause = "";
        for (let i = 0; i < columns.length; i++){
            selectClause += columns[i] + ",";
            whereClause += columns[i] + " IS NOT NULL AND ";
        }
        selectClause = selectClause.substring(0, selectClause.length-1);
        if (whereClause === ""){
            whereClause = "username IS NOT NULL";
        } else {
            whereClause = whereClause.substring(0, whereClause.length-4);
        }

        let query = `SELECT ${selectClause} FROM ${env.answer} WHERE ${whereClause}`;
        connectionExecute(query, function(err, result, fields){
            if (err){
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
};

// write answer to sql
function writeAnswer(username, title, answer){
    return new Promise((resolve, reject) => {
        username = username.replaceAll(" ", "");
        readAnswer(username).then((userJson) => {
            let query = "";
            if (userJson === undefined){
                let columns = ` username , ${title} `;
                let values = ` '${username}' , '${JSON.stringify(answer)}' `;
                query = `INSERT INTO ${env.answer} ( ${columns} ) VALUES ( ${values} )`;
            } else {
                let setString = title + " = '" + JSON.stringify(answer) + "'";
                let whereClause = `username = '${username}'`;
                query = `UPDATE ${env.answer} SET ${setString} WHERE ${whereClause}`;
            }
            connectionExecute(query, function(err, result, fields){
                if (err){
                    console.log(err);
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        }).catch((err) => {
            console.log(err);
        });
    });
};

function checkPassword(username, password){
    return new Promise((resolve, reject) => {
        let query = `SELECT password FROM ${env.userdata} WHERE BINARY username = '${username}'`;
        connectionExecute(query, function(err, result, fields){
            if (err){
                console.log(err);
                reject(err);
                return false;
            }
            try {
                if (result[0].password === password){
                    resolve(true);
                } else {
                    resolve(false);
                }
            } catch {
                resolve(false);
            }
        });
    });
};

// read from chat_menu db
function readChatmenu(username, otherUsername = undefined){
    return new Promise((resolve, reject) => {
        let query = "";
        if (otherUsername === undefined){
            query = `SELECT * FROM ${env.chatmenu} WHERE username1 = '${username}' OR username2 = '${username}'`;
        } else {
            query = `SELECT * FROM ${env.chatmenu} WHERE username1 = '${username}' AND username2 = '${otherUsername}' OR username2 = '${username}' AND username1 = '${otherUsername}'`;
        }
        connectionExecute(query, function(err, result, fields){
            if (err){
                reject(err);
            } else {
                if (result.length === 0){
                    resolve([]);
                } else {
                    let resolveData = [];
                    for (let data of result){
                        // remove white spaces
                        data.username1 = data.username1.replaceAll(" ", "");
                        data.username2 = data.username2.replaceAll(" ", "");
                        try {
                            data.last_sent_message = encrypt.decryptText(data.last_sent_message);
                        } catch {

                        }
                        if (data.username1 === username){
                            resolveData.push({
                                target: data.username2,
                                status: "is" + data.status,
                                unread: data.unread,
                                lastSentMessage: data.last_sent_message,
                                lastSentTime: data.last_sent_time
                            });
                        } else {
                            resolveData.push({
                                target: data.username1,
                                status: data.status,
                                unread: data.unread,
                                lastSentMessage: data.last_sent_message,
                                lastSentTime: data.last_sent_time
                            });
                        }
                    }
                    resolve(resolveData);
                }
            }
        });
    });
};

// write to chat_menu db
function writeChatmenu(username, otherUsername, status, lastSentMessage=null, lastSentTime=0, unread=0){
    return new Promise((resolve, reject) => {
        // replace white spaces
        username = username.replaceAll(" ", "");
        otherUsername = otherUsername.replaceAll(" ", "");
        if (lastSentMessage !== null){
            lastSentMessage = encrypt.encryptText(lastSentMessage);
        }
        readChatmenu(username, otherUsername).then((data) => {
            let insert = true;
            let prefix = false;
            for (let element of data){
                if (element.target === otherUsername){
                    insert = false;
                    if (element.status.indexOf("is") !== -1){
                        prefix = true; // username is username1
                    }
                }
            }
            let query = "";
            // set lastSentTime
            if (lastSentTime === 0){
                lastSentTime = Math.round((new Date()).getTime()/1000);
            }
            if (insert){
                query = `INSERT INTO ${env.chatmenu} ( username1 , username2 , status , last_sent_message , last_sent_time , unread ) VALUES ( '${username}' , '${otherUsername}' , '${status}' , '${lastSentMessage}' , '${lastSentTime}' , '${unread}' )`;
            } else {
                if (prefix){
                    query = `UPDATE ${env.chatmenu} SET status = '${status}' , last_sent_message = '${lastSentMessage}' , last_sent_time = '${lastSentTime}' , unread = '${unread}' WHERE username1 = '${username}' AND username2 = '${otherUsername}'`;
                } else {
                    query = `UPDATE ${env.chatmenu} SET status = '${status}' , last_sent_message = '${lastSentMessage}' , last_sent_time = '${lastSentTime}' , unread = '${unread}' WHERE username1 = '${otherUsername}' AND username2 = '${username}'`;
                }
            }
            connectionExecute(query, function(err, result, fields){
                if (err){
                    console.log(err);
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        }).catch((err) => {
            console.log(err);
            reject(err);
        });
    });
};

// get chat data with limit 50
function readChat(username, otherUsername, limit=1000){
    return new Promise((resolve, reject) => {
        let query = `SELECT * FROM ${env.chat} WHERE username1 = '${username}' AND username2 = '${otherUsername}' OR username2 = '${username}' AND username1 = '${otherUsername}' ORDER BY time DESC LIMIT ${limit}`;
        connectionExecute(query, function(err, result, fields){
            if (err){
                console.log(err);
                reject(err);
            } else {
                let resultArr = result.reverse();
                for (let obj of resultArr){
                    if (obj.text !== null){
                        try {
                            obj.text = encrypt.decryptText(obj.text);
                        } catch {

                        }
                    }
                }
                resolve(resultArr); 
            }
        });
    });
};

// insert new chat data
function writeChat(username, otherUsername, time, status="unread", text=null, file=null){
    return new Promise((resolve, reject) => {
        username = username.replaceAll(" ", "");
        otherUsername = otherUsername.replaceAll(" ", "");
        if (text !== null){
            text = encrypt.encryptText(text);
        }
        let query = `INSERT INTO ${env.chat} ( username1 , username2 , time , status , text , file ) VALUES ( '${username}' , '${otherUsername}' , '${time}' , '${status}' , '${text}' , '${file}' )`;
        connectionExecute(query, function(err, result, fields){
            if (err){
                console.log(err);
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
};

// update read or unread
function updateChat(username, otherUsername, status="read"){
    return new Promise((resolve, reject) => {
        username = username.replaceAll(" ", "");
        otherUsername = otherUsername.replaceAll(" ", "");
        let query = `UPDATE ${env.chat} SET status = '${status}' WHERE ( NOT status = '${status}' ) AND ( username2 = '${username}' AND username1 = '${otherUsername}' )`;
        connectionExecute(query, function(err, result, fields){
            if (err) {
                console.log(err);
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
};

// export functions
module.exports.readUserLength = readUserLength;
module.exports.readUserdata = readUserdata;
module.exports.readSingleUserdata = readSingleUserdata;
module.exports.writeUserdata = writeUserdata;
module.exports.checkPassword = checkPassword;
module.exports.readTestdata = readTestdata;
module.exports.readProfile = readProfile;
module.exports.writeProfile = writeProfile;
module.exports.readAnswer = readAnswer;
module.exports.readAnswerColumns = readAnswerColumns;
module.exports.writeAnswer = writeAnswer;
module.exports.readChatmenu = readChatmenu;
module.exports.writeChatmenu = writeChatmenu;
module.exports.readChat = readChat;
module.exports.writeChat = writeChat;
module.exports.updateChat = updateChat;

//test
// readSingleUserdata("ddm4538").then((result) => {
//     console.log(result);
//     writeUserdata({
//         username: "ddm4538",
//         password: "hihi",
//         department: "EE4",
//         class: 0.2
//     }).then((result) => {
//         readSingleUserdata("ddm4538").then((result) => {
//             console.log(result);
//         });
//     });
// });
// readChatmenu("ddm10000");
// writeChatmenu("ddm4535", "ddm10000", "rejected");
// writeChat("ddm4534", "ddm4535", 0, "read", "yaa", "/data/pictures/image.jpg");