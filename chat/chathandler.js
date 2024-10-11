'use strict';

// import
const encrypt = require('../utilities/encrypt.js');
const databasehandler = require('../database/databasehandler.js');
const { sanitize } = require('express-xss-sanitizer');
const loginhandler = require('../login/loginhandler.js');

// global variables
let rooms = {}; // adjacency dict
let online = {};
let lastActive = {};

function isOnline(username){
    if (username === undefined){
        return false;
    }
    let time = Math.round((new Date()).getTime()/1000);
    if (online[username] === undefined){
        if (lastActive[username] === undefined){
            return false;
        }
        return time - lastActive[username];
    }
    if (online[username] <= 0){
        delete online[username];
        if (lastActive[username] === undefined){
            return false;
        }
        return time - lastActive[username];
    }
    return true;
};

function handleConnection(io, socket){
    // join room
    socket.on('join', (msg) => {
        let username = sanitize(msg.username);
        let target = sanitize(msg.target);
        let sessionCode = sanitize(msg.sessionCode);
        if (!loginhandler.checkSessionInternal(username, sessionCode)){
            let errorMsg = {
                message: "Session Expired. Please Log In Again."
            }
            socket.emit('error', errorMsg);
            return;
        }
        if (username === undefined || target === undefined){
            let errorMsg = {
                message: "Undefined Username(s). Please try logging in again."
            }
            socket.emit('error', errorMsg);
            return;
        }
        socket.username = username;
        socket.target = target;

        if (rooms[username] === undefined){
            rooms[username] = {};
            socket.room = encrypt.encrypt((new Date).getTime() + "");
            rooms[username][target] = socket.room;
            if (rooms[target] === undefined){
                rooms[target] = {};
            } 
            rooms[target][username] = socket.room;
        } else {
            if (rooms[username][target] === undefined){
                socket.room = encrypt.encrypt((new Date).getTime() + "");
                rooms[username][target] = socket.room;
                if (rooms[target] === undefined){
                    rooms[target] = {};
                } 
                rooms[target][username] = socket.room;
            } else {
                socket.room = rooms[username][target];
            }
        }
        // set online status
        if (online[username] === undefined){
            online[username] = 1;
        } else {
            online[username] += 1;
        }
        lastActive[username] = 0;

        // ! get previous data
        databasehandler.readChat(username, target).then((data) => {
            socket.emit('prevMessage', {data: data});
        }).catch((err) => {
            socket.emit('error', {message: err.toString()});
        });

        // confirm if not accepted
        databasehandler.readChatmenu(username, target).then((data) => {
            if (data.length === 0){
                // ! no existing chatmenu data
                socket.emit('leave', {message: "No existing chatroom"});
            } else {
                socket.status = data[0].status;
                if (data[0].status === "requesting"){
                    socket.emit('requesting', {message: "Requesting"});
                }
            }
        }).catch((err) => {
            console.log(err);
        });
        socket.join(socket.room);
        socket.to(socket.room).emit('online', {username: socket.username});
        if (online[socket.target] !== undefined){
            socket.emit('online', {username: socket.target});
        }
    });

    // start messaging
    socket.on('message', (msg) => {
        let username = socket.username;
        let target = socket.target;
        let room = socket.room;
        msg.text = sanitize(msg.text);
        if (username === undefined || target === undefined || room === undefined){
            let errorMsg = {
                message: "Undefined Username(s). Please try logging in again."
            }
            socket.emit('error', errorMsg);
            return;
        }
        let time = Math.round((new Date).getTime()/1000);
        let read = "unread";
        databasehandler.writeChat(username, target, time, read, msg.text).then((data) => {
            msg.time = time;
            msg.target = username;
            socket.to(room).emit('receiveMessage', msg);
            if (isOnline(target) !== true){
                //! write to chatmenu db
                databasehandler.readChatmenu(username, target).then((data) => {
                    try {
                        data = data[0];
                        if (data === undefined){
                            return;
                        }
                        let unreadLength = parseInt(data.unread);
                        let active = socket.status.indexOf("is") !== -1;
                        if (active){
                            unreadLength += 1;
                        } else {
                            unreadLength -= 1;
                        }
                        databasehandler.writeChatmenu(username, target, data.status.replaceAll("is", ""), msg.text, time, unreadLength);
                    } catch (err) {
                        console.log(err);
                    }
                }).catch((err) => {
                    console.log(err);
                });
            }
        }).catch((err) => {
            console.log(err);
            socket.emit('error', {message: err.toString()});
        });
    });

    // read
    socket.on('readMessage', (msg) => {
        msg.read = sanitize(msg.read);
        if (msg.read){
            let username = socket.username;
            let target = socket.target;
            let room = socket.room;
            if (username === undefined || target === undefined || room === undefined){
                let errorMsg = {
                    message: "Undefined Username(s). Please try logging in again."
                }
                socket.emit('error', errorMsg);
                return;
            }
            databasehandler.updateChat(username, target, "read").then((data) => {
                io.emit('receiveRead', {target: username, read: true});
            }).catch((err) => {
                console.log(err);
                socket.emit('error', {message: err.toString()});
            });
        }
    });

    // accept
    socket.on('accept', (msg) => {
        let username = socket.username;
        let target = socket.target;
        let room = socket.room;
        if (username === undefined || target === undefined || room === undefined){
            let errorMsg = {
                message: "Undefined Username(s). Please try logging in again."
            }
            socket.emit('error', errorMsg);
            return;
        }
        if (msg.message !== "accept"){
            let errorMsg = {
                message: "Accept cannot be sent. Please refresh the page."
            }
            socket.emit('error', errorMsg);
            return;
        }
        try {
            socket.status = "accepted";
            databasehandler.writeChatmenu(target, username, "accepted", `${username} accepted to chat with ${target}`, Math.round((new Date()).getTime()/1000), 0);
        } catch (err){
            socket.emit('error', {message: err.toString()});
        }
    });

    // reject
    socket.on('reject', (msg) => {
        let username = socket.username;
        let target = socket.target;
        let room = socket.room;
        if (username === undefined || target === undefined || room === undefined){
            let errorMsg = {
                message: "Undefined Username(s). Please try logging in again."
            }
            socket.emit('error', errorMsg);
            return;
        }
        if (msg.message !== "reject"){
            let errorMsg = {
                message: "Reject cannot be sent. Please refresh the page."
            }
            socket.emit('error', errorMsg);
            return;
        }
        try {
            databasehandler.writeChatmenu(target, username, "rejected", `${username} rejected to chat with ${target}`, Math.round((new Date()).getTime()/1000), 0);
        } catch (err){
            socket.emit('error', {message: err.toString()});
        }
    });

    socket.on('disconnect', () => {
        // not online
        if (online[socket.username] !== undefined){
            online[socket.username] -= 1;
            if (online[socket.username] <= 0){
                io.emit('offline', {username: socket.username});
                delete online[socket.username];
                lastActive[socket.username] = Math.round((new Date()).getTime()/1000);
            }
        }
        
        let username = socket.username;
        let target = socket.target;
        let room = socket.room;
        if (username === undefined || target === undefined || room === undefined){
            return;
        }
        // retrieve data
        databasehandler.readChat(username, target, 1000).then((data) => {
            let active = socket.status.indexOf("is") !== -1;
            let unread = 0;
            for (let obj of data){
                if (obj.status === "unread"){
                    if ((obj.username1 === username) === active){
                        unread += 1;
                    } else {
                        unread -= 1;
                    }
                }
            }
            if (data.length === 0){
                databasehandler.writeChatmenu(username, target, socket.status.replace("is", ""), "", Math.round((new Date()).getTime()/1000), unread).then((data) => {}).catch((err) => {console.log(err)});
            } else {
                if (data[data.length-1].text.length > 20){
                    data[data.length-1].text = data[data.length-1].text.substring(0, 20) + "...";
                }
                data[data.length-1].text = data[data.length-1].text.replaceAll("<br>", " ");
                databasehandler.writeChatmenu(username, target, socket.status.replace("is", ""), data[data.length-1].text, data[data.length-1].time, unread).then((data) => {}).catch((err) => {console.log(err)});
            }
        }).catch((err) => {console.log(err)});
        // send data to db
    });
    
};


module.exports.handleConnection = handleConnection;
module.exports.isOnline = isOnline;