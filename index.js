"use strict";

/** NTU Pair Open Version **/

// import packages
const express = require('express');
const path = require('path');
const fileupload = require('express-fileupload');
const fs = require('fs');
const { xss } = require('express-xss-sanitizer');

// import modules
const loginhandler = require('./login/loginhandler.js');
const homehandler = require('./home/homehandler.js');
const testhandler = require('./test/testhandler.js');
const chathandler = require('./chat/chathandler.js');
const databasehandler = require('./database/databasehandler.js');
const accounthandler = require('./account/accounthandler.js');
const jsonconvert = require('./utilities/jsonconvert.js');
const profilehandler = require('./profile/profilehandler.js');
const viewprofilehandler = require('./viewprofile/viewprofilehandler.js');
const chatmenuhandler = require('./chatmenu/chatmenuhandler.js');
const verifyhandler = require('./verify/verifyhandler.js');
const blockip = require('./utilities/blockip');
const image = require('./utilities/image.js');

// constants
const options = {
    allowedKeys: [],
    allowedTags: ["br"]
};
const server = express();
const PORT = 80;
server.use(fileupload());
server.use(express.json());
server.use(xss(options));

// debug
function debug(request, ...args){
    console.log(`>> Got '${request}': ${JSON.stringify(...args)}`);
};

/* Socket io */
const http = require('http');
const socketServer = http.createServer(server);
const { Server } = require("socket.io");
const io = new Server(socketServer);

io.on("connection", (socket) => {
    chathandler.handleConnection(io, socket);
});
/* Socket io */


// get requests
server.get('/', xss(), (req, res) => {
    // debug('/', ...req.query);
    if (blockip.block(req, res)){
        return;
    }
    loginhandler.sendLoginFile(req, res);
});
server.get('/getquestions', xss(), (req, res) => {
    if (blockip.block(req, res)){
        return;
    }
    testhandler.getQuestions(req, res);
});
server.get('/gettests', xss(), (req, res) => {
    // debug('/getTests', req.query);
    if (blockip.block(req, res)){
        return;
    }
    homehandler.getTests(req, res);
});
server.get('/match', xss(), (req, res) => {
    // debug('/match', req.query);
    if (blockip.block(req, res)){
        return;
    }
    homehandler.match(req, res);
});
server.get('/getprofile', xss(), (req, res) => {
    if (blockip.block(req, res)){
        return;
    }
    profilehandler.getProfile(req, res);
});
server.get('/getchatmenu', xss(), (req, res) => {
    if (blockip.block(req, res)){
        return;
    }
    chatmenuhandler.getChatmenu(req, res);
});
server.get('/getchatstatus', xss(), (req, res) => {
    if (blockip.block(req, res)){
        return;
    }
    chatmenuhandler.getChatStatus(req, res);
});
server.get('/getnotifications', xss(), (req, res) => {
    if (blockip.block(req, res)){
        return;
    }
    homehandler.getNotifications(req, res);
});
server.get('/checkkey', xss(), (req, res) => {
    if (blockip.block(req, res)){
        return;
    }
    verifyhandler.checkVerification(req, res);
});

// post requests
server.post('/login', xss(), (req, res) => {
    if (blockip.block(req, res)){
        return;
    }
    loginhandler.handleLogin(req, res);
});
server.post('/test', xss(), (req, res) => {
    if (blockip.block(req, res)){
        return;
    }
    testhandler.handleTest(req, res);
});
server.post('/account', xss(), (req, res) => {
    if (blockip.block(req, res)){
        return;
    }
    accounthandler.handleAccount(req, res);
});
server.post('/setprofile', xss(), (req, res) => {
    if (blockip.block(req, res)){
        return;
    }
    profilehandler.setProfile(req, res);
});
server.post('/session', xss(), (req, res) => {
    if (blockip.block(req, res)){
        return;
    }
    loginhandler.checkSession(req, res);
});
server.post('/updatechatstatus', xss(), (req, res) => {
    if (blockip.block(req, res)){
        return;
    }
    chatmenuhandler.updateChatStatus(req, res);
});
server.post('/sendmail', xss(), (req, res) => {
    if (blockip.block(req, res)){
        return;
    }
    verifyhandler.sendVerification(req, res);
});
server.post('/senddepartment', xss(), (req, res) => {
    if (blockip.block(req, res)){
        return;
    }
    verifyhandler.setDepartment(req, res);
});

// post with fetch
server.post('/uploadprofile', xss(), (req, res) => {
    if (blockip.block(req, res)){
        return;
    }
    profilehandler.uploadProfile(req, res);
});

// get files
server.get('/ajax.js', xss(), (req, res) => {
    res.sendFile(path.join(__dirname, '/utilities', '/ajax.js'));
});
server.get('/checkpassword.js', xss(), (req, res) => {
    res.sendFile(path.join(__dirname, '/login', '/checkpassword.js'));
});
server.get('/login.js', xss(), (req, res) => {
    res.sendFile(path.join(__dirname, '/login', '/login.js'));
});
server.get('/login.css', xss(), (req, res) => {
    res.sendFile(path.join(__dirname, '/login', '/login.css'));
});
server.get('/home.html', xss(), (req, res) => {
    res.sendFile(path.join(__dirname, '/home', '/home.html'));
});
server.get('/home.css', xss(), (req, res) => {
    res.sendFile(path.join(__dirname, '/home', '/home.css'));
});
server.get('/home.js', xss(), (req, res) => {
    res.sendFile(path.join(__dirname, '/home', '/home.js'));
});
server.get('/test.html', xss(), (req, res) => {
    res.sendFile(path.join(__dirname, '/test', '/test.html'));
});
server.get('/test.css', xss(), (req, res) => {
    res.sendFile(path.join(__dirname, '/test', '/test.css'));
});
server.get('/test.js', xss(), (req, res) => {
    res.sendFile(path.join(__dirname, '/test', '/test.js'));
});
server.get('/account.html', xss(), (req, res) => {
    res.sendFile(path.join(__dirname, '/account', '/account.html'));
});
server.get('/account.css', xss(), (req, res) => {
    res.sendFile(path.join(__dirname, '/account', '/account.css'));
});
server.get('/account.js', xss(), (req, res) => {
    res.sendFile(path.join(__dirname, '/account', '/account.js'));
});
server.get('/profile.html', xss(), (req, res) => {
    res.sendFile(path.join(__dirname, '/profile', 'profile.html'));
});
server.get('/profile.css', xss(), (req, res) => {
    res.sendFile(path.join(__dirname, '/profile', 'profile.css'));
});
server.get('/profile.js', xss(), (req, res) => {
    res.sendFile(path.join(__dirname, '/profile', 'profile.js'));
});
server.get('/viewprofile.html', xss(), (req, res) => {
    res.sendFile(path.join(__dirname, '/viewprofile', 'viewprofile.html'));
});
server.get('/viewprofile.css', xss(), (req, res) => {
    res.sendFile(path.join(__dirname, '/viewprofile', 'viewprofile.css'));
});
server.get('/viewprofile.js', xss(), (req, res) => {
    res.sendFile(path.join(__dirname, '/viewprofile', 'viewprofile.js'));
});
server.get('/chat.html', xss(), (req, res) => {
    res.sendFile(path.join(__dirname, '/chat', '/chat.html'));
});
server.get('/chat.css', xss(), (req, res) => {
    res.sendFile(path.join(__dirname, '/chat', '/chat.css'));
});
server.get('/chat.js', xss(), (req, res) => {
    res.sendFile(path.join(__dirname, '/chat', '/chat.js'));
});
server.get('/chatmenu.html', xss(), (req, res) => {
    res.sendFile(path.join(__dirname, '/chatmenu', '/chatmenu.html'));
});
server.get('/chatmenu.css', xss(), (req, res) => {
    res.sendFile(path.join(__dirname, '/chatmenu', '/chatmenu.css'));
});
server.get('/chatmenu.js', xss(), (req, res) => {
    res.sendFile(path.join(__dirname, '/chatmenu', '/chatmenu.js'));
});
server.get('/verify.html', xss(), (req, res) => {
    res.sendFile(path.join(__dirname, '/verify', '/verify.html'));
});
server.get('/verify.css', xss(), (req, res) => {
    res.sendFile(path.join(__dirname, '/verify', '/verify.css'));
});
server.get('/verify.js', xss(), (req, res) => {
    res.sendFile(path.join(__dirname, '/verify', '/verify.js'));
});
server.get('/verified.html', xss(), (req, res) => {
    res.sendFile(path.join(__dirname, '/verified', '/verified.html'));
});
server.get('/verified.css', xss(), (req, res) => {
    res.sendFile(path.join(__dirname, '/verified', '/verified.css'));
});
server.get('/verified.js', xss(), (req, res) => {
    res.sendFile(path.join(__dirname, '/verified', '/verified.js'));
});
server.get('/display.js', xss(), (req, res) => {
    res.sendFile(path.join(__dirname, '/utilities', '/display.js'));
});
server.get('/department.js', xss(), (req, res) => {
    res.sendFile(path.join(__dirname, '/utilities', '/department.js'));
});
server.get('/stylesheet.css', xss(), (req, res) => {
    res.sendFile(path.join(__dirname, '/utilities', '/stylesheet.css'));
});

// image
server.get('/files/profile/*', xss(), (req, res) => {
    let url = req.url;
    fs.access(path.join(__dirname, url), fs.F_OK, (err) => {
        if (err){
            // try online base
            image.getImage(req.url).then(() => {
                res.sendFile(path.join(__dirname, url));
            }).catch((err) => {
                res.sendFile(path.join(__dirname, "/files/default/default.png"));
            });
        } else {
            res.sendFile(path.join(__dirname, url));
        }
    });
});

server.get('/files/default/*', xss(), (req, res) => {
    let url = req.url;
    fs.access(path.join(__dirname, url), fs.F_OK, (err) => {
        if (err){
            res.sendFile(path.join(__dirname, "/files/default/ntupair.png"));
        } else {
            res.sendFile(path.join(__dirname, url));
        }
    });
});

// cannot get
server.get('*', (req,res) => {
    loginhandler.sendLoginFile(req, res);
});


/*
// end application
server.get('*', (req,res) => {
    res.send(`<html>
    To all users on NTU Pair:<br>
    &nbsp&nbsp&nbsp&nbspOur system encountered several malicious attacks in the previous hours. To prevent your data from being stolen and disclosed, we have stopped our application in advance. Sorry for your inconvenience, and wish you a happy Valentine's day.
    <br>
    Sincerely, the NTU Pair team
    </html>
    `);
});
*/

// launch server
socketServer.listen(PORT, () => {
    console.log(`Server started on port ${PORT}.`);
});