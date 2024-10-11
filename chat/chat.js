'use strict';

// html elements
const inputTa = document.getElementById("inputTa");
const inputButton = document.getElementById("inputButton");
const messagesDiv = document.getElementById("messages");
const main = document.getElementById("main");
const usernameDiv = document.getElementById("usernameDiv");

// socket io
const socket = io();

// global variables
let targetName = "";
let messageArray = [];
let lastReadIndex = 0;
let shiftDown = false;
let scrollToBottom = true;
let inFocus = true;

// class message
function Message(sender, time, read, text = ""){
    this.text = text;
    this.sender = sender;
    this.time = time;
    this.read = read; // read or not
    this.displayRead = false; // static display
    this.hoverRead = false; // hover animation
    this.index = messageArray.length;

    // methods
    this.setRead = (readBool) => {
        if (readBool && this.readEl === undefined){
            this.readEl = document.createElement("div");
            this.readEl.classList.add("readEl");
            this.readEl.innerHTML = "read";
            this.floatWrap.appendChild(this.readEl);
        } else {
            if (this.readEl !== undefined){
                this.floatWrap.removeChild(this.readEl);
                this.readEl = undefined;
            }
        }
    }

    this.displayTime = (timeBool) => {
        if (timeBool && this.timeEl === undefined){
            this.timeEl = document.createElement("div");
            this.timeEl.classList.add("timeEl");
            let date = new Date(this.time*1000);
            this.timeEl.innerHTML = `Sent ${date.getMonth()+1}/${date.getDate()} ${("0" + date.getHours()).slice(-2)}:${("0" + date.getMinutes()).slice(-2)}`;
            this.floatWrap.appendChild(this.timeEl);
        } else {
            if (this.timeEl !== undefined){
                this.floatWrap.removeChild(this.timeEl);
                this.timeEl = undefined;
            }
        }
    };

    // create element
    //! image
    this.wrap = document.createElement("div");
    this.wrap.classList.add("messageWrap");

    this.floatWrap = document.createElement("div");
    this.floatWrap.classList.add("floatWrap");
    if (this.sender === null){
        this.floatWrap.classList.add("rightFloat");
    } else {
        this.floatWrap.classList.add("leftFloat");
    }

    if (this.sender !== null && this.sender !== undefined){
        this.senderEl = document.createElement("div");
        this.senderEl.classList.add("senderEl");
        this.senderEl.innerHTML = this.sender;
        this.floatWrap.appendChild(this.senderEl);
    } else {
        this.senderEl = undefined;
    }

    this.textEl = document.createElement("div");
    this.textEl.classList.add("textEl");
    this.textEl.innerHTML = this.text;
    this.floatWrap.appendChild(this.textEl);


    // event listeners
    this.floatWrap.addEventListener("mouseover", () => {
        if (this.read === "read" && !this.hoverRead && this.sender === null && !this.displayRead){
            this.hoverRead = true;
            this.setRead(true);
        }
    });
    this.floatWrap.addEventListener("click", () => {
        this.displayTime(true);
    });
    this.floatWrap.addEventListener("mouseleave", () => {
        if (this.hoverRead && !this.displayRead){
            this.hoverRead = false;
            this.setRead(false);
        }
        this.displayTime(false);
    });
    // finish up
    this.wrap.appendChild(this.floatWrap);
    messagesDiv.appendChild(this.wrap);
    messageArray.push(this);
    return this;
};

// check if user is logged in: post body
ajax("POST", `./session`, {username: localStorage.getItem("username"), sessionCode: localStorage.getItem("sessionCode")})
    .then((data) => {}).catch((message) => {
        if (message === "Parse Error"){
            console.log(message);
        } else {
            displayAlert("Session expired. Please login again").then((status) => {
                location.href = "/";
            });
        }
    });

// get target username
function getTargetName(){
    let query = location.search;
    let index = query.indexOf("user");
    if (index === -1){
        displayAlert("User doesn't exist").then((status) => {
            location.href = "./home.html";
        });
    }
    query = query.substring(index+5);
    if (query.indexOf("&") !== -1){
        query = query.substring(0, query.indexOf("&"));
    }
    targetName = query;
};
getTargetName();

usernameDiv.innerHTML = targetName;
usernameDiv.addEventListener("click", function(){
    location.href = "./viewprofile.html?user=" + targetName;
});

// join room
function joinRoom(){
    let msg = {};
    msg.username = localStorage.getItem("username");
    msg.target = targetName;
    msg.sessionCode = localStorage.getItem("sessionCode");
    socket.emit('join', msg);
    socket.emit('readMessage', {read: true});
};
joinRoom();

// shift key
// enter key
window.addEventListener("keydown", function(e){
    if (e.key === "Shift"){
        shiftDown = true;
    }
});
window.addEventListener("keyup", function(e){
    if (e.key === "Shift"){
        shiftDown = false;
    } else if (e.key === "Enter"){
        if (window.orientation !== undefined){
            return;
        }
        if (!shiftDown){
            if (inputTa.value === ""){
                inputTa.value = "";
                return;
            }
            if (inputTa.value === "\n"){
                inputTa.value = "";
                return;
            }
            inputTa.value = inputTa.value.replaceAll("\n", "<br>");
            sendMessage(inputTa.value);
            displayMessage(inputTa.value, null, Math.floor((new Date).getTime()/1000), "unread");
            inputTa.value = "";
        }
    }
});

// click
inputButton.addEventListener("click", function(){
    if (inputTa.value === ""){
        inputTa.value = "";
        return;
    }
    if (inputTa.value === "\n"){
        inputTa.value = "";
        return;
    }
    inputTa.value = inputTa.value.replaceAll("\n", "<br>");
    sendMessage(inputTa.value);
    displayMessage(inputTa.value, null, Math.floor((new Date).getTime()/1000), "unread");
    inputTa.value = "";
});

// display message
function displayMessage(text, sender, time, read){
    if (main.scrollHeight - window.scrollY < 420){
        scrollToBottom = true;
    }
    new Message(sender, time, read, text);
    if (scrollToBottom){
        window.scrollTo(0, main.scrollHeight);
        scrollToBottom = false;
    }
};

// display read
function displayRead(){
    let lastSentIndex = lastReadIndex;
    //! fix
    if (messageArray.length === 0){
        return;
    }
    for (let i = lastReadIndex; i < messageArray.length; i++){
        messageArray[i].displayRead = false;
        messageArray[i].read = true;
        messageArray[i].setRead(false);
        if (messageArray[i].sender === null){
            lastSentIndex = i;
        }
    }
    lastReadIndex = lastSentIndex;
    messageArray[lastSentIndex].displayRead = true;
    messageArray[lastSentIndex].setRead(true);
};

// display prev messages
function displayPrev(data){
    let read = 0;
    for (let i = 0; i < data.length; i++){
        if (data[i].status === "read"){
            if (data[i].username1 === localStorage.getItem("username")){
                read = i;
            }
        }
    }
    lastReadIndex = read;
    let prevSender = null;
    for (let i = 0; i < data.length; i++){
        let sender = (data[i].username1 === localStorage.getItem("username"))?null:data[i].username1;
        if (prevSender !== null && sender !== null){
            sender = undefined;
        }
        prevSender = sender;
        displayMessage(data[i].text, sender, data[i].time, data[i].status === "read");
        if (i === read && i !== 0){
            messageArray[messageArray.length-1].displayRead = true;
            messageArray[messageArray.length-1].setRead(true);
        }
    }
    window.scrollTo(0, main.scrollHeight);
};

// send message
function sendMessage(text){
    let msg = {};
    msg.text = text;
    socket.emit('message', msg);
};


// receive text message
socket.on('receiveMessage', (msg) => {
    displayMessage(msg.text, (msg.target === targetName)?targetName:null, msg.time, "read");
    //! read
    if (inFocus){
        socket.emit('readMessage', {read: true});
    }
});

// detect focus
window.addEventListener("blur", function(e){
    inFocus = false;
});
window.addEventListener("focus", function(e){
    inFocus = true;
    socket.emit('readMessage', {read: true});
});

// error
socket.on('error', (msg) => {
    displayAlert(msg.message);
    if (msg.message.indexOf("Undefined Username") !== -1){
        location.href = location.href;
    } else if (msg.message.indexOf("Session Expired") !== -1) {
        location.href = "./chatmenu.html";
    } else if (msg.message.indexOf("Data too long") !== -1){
        displayAlert("Message too long. Cannot be sent.");
    }
});

// read
socket.on('receiveRead', (msg) => {
    if (msg.read && msg.target === targetName){
        displayRead();
    }
});

// prevMessage
socket.on('prevMessage', (msg) => {
    if (msg.data === undefined){
        console.log("No Previous data");
        return;
    }
    displayPrev(msg.data);
});

// leave
socket.on('leave', (msg) => {
    displayAlert(msg.message).then(() => {
        location.href = "./chatmenu.html";
    });
});

// requesting
socket.on('requesting', (msg) => {
    let buttons = displayPopup(`${targetName} requests to chat with you.`, ["Accept", "View Profile", "Reject"]);
    buttons[0].addEventListener("click", function(){
        removePopup();
        // accept
        socket.emit('accept', {
            message: "accept"
        });
    });
    buttons[1].addEventListener("click", function(){
        removePopup();
        location.href = `./viewprofile.html?user=${targetName}`;
    });
    buttons[2].addEventListener("click", function(){
        removePopup();
        displayConfirm(`Are you sure to reject ${targetName} forever? This action cannot be reversed.`).then((status) => {
            if (status){
                // reject
                socket.emit('reject', {
                   message: "reject" 
                });
                //! loading
                setTimeout(() => {
                    location.href = "./chatmenu.html";
                }, 100);
            } else {
                location.href = "";
            }
        });
    });
});

// online, offline
socket.on('online', (msg) => {
    if (msg.username === targetName){
        usernameDiv.innerHTML = targetName + " " + "<b> [Online] </b>";
        usernameDiv.classList.add("online");
    }
});
socket.on('offline', (msg) => {
    if (msg.username === targetName){
        usernameDiv.innerHTML = targetName;
        usernameDiv.classList.remove("online");
    }
});