'use strict';

// html elements
const chatmenuDiv = document.getElementById("chatmenu");

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

// display chat menu
function displayChatmenu(chatArr){
    chatArr.sort((a, b) => b.lastSentTime - a.lastSentTime);
    chatmenuDiv.innerHTML = "<h3>Private Chats</h3>";
    for (let data of chatArr){
        let newDiv = document.createElement("div");
        newDiv.classList.add("chatOption");
        newDiv.id = data.target;
        let targetSticker = document.createElement("img");
        targetSticker.src = "./files/profile/" + data.target + ".png";
        targetSticker.alt = "sticker";
        targetSticker.classList.add("targetSticker");
        let targetName = document.createElement("span");
        targetName.innerHTML = data.target;
        targetName.classList.add("targetName");
        // preview
        let targetText = document.createElement("span");
        if ((data.unread < 0) === (data.status.indexOf("is") !== -1) && data.unread !== 0){
            targetText.innerHTML = Math.abs(data.unread) + " unread messages";
            targetText.classList.add("unreadMessage");
        } else {
            targetText.innerHTML = data.lastSentMessage;
        }
        targetText.classList.add("targetText");
        let targetStatus = document.createElement("span");
        let statusText = "";
        // set statusText
        if (data.status.indexOf("accepted") !== -1){
            //display active time
            if (data.onlineStatus === true){
                statusText = "online";
                targetStatus.classList.add("online");
                targetSticker.classList.add("onlineSticker");
            } else if (typeof(data.onlineStatus) === 'number'){
                let time = data.onlineStatus;
                if (time < 120){
                    statusText = "online";
                    targetStatus.classList.add("online");
                    targetSticker.classList.add("onlineSticker");
                } else {
                    targetStatus.classList.add("activeBefore");
                    time = Math.floor(time/60);
                    if (time < 60){
                        statusText = `active ${time} minutes ago`;
                    } else {
                        time = Math.floor(time/60);
                        if (time < 60){
                            statusText = `active ${time} hours ago`;
                        } else {
                            time = Math.floor(time/24);
                            if (time <= 7){
                                statusText = `active ${time} days ago`;
                            } else {
                                targetStatus.classList.remove("activeBefore");
                            }
                        }
                    }
                }
            }
        } else if (data.status === "isrequesting"){
            statusText = "requesting...";
            targetStatus.classList.add("requestingStatus");
        } else if (data.status === "requesting"){
            statusText = "new request";
            targetStatus.classList.add("newRequestStatus");
        } else if (data.status.indexOf("rejected") !== -1){
            continue;
        } 
        targetStatus.innerHTML = statusText;
        targetStatus.classList.add("targetStatus");
        newDiv.status = data.status;
        newDiv.target = data.target;
        newDiv.appendChild(targetSticker);
        newDiv.appendChild(targetName);
        newDiv.appendChild(targetText);
        newDiv.appendChild(targetStatus);
        newDiv.addEventListener("click", function(){
            location.href = "./chat.html?user=" + newDiv.target;
        });
        chatmenuDiv.appendChild(newDiv);
    }
};

// get chat menu
function getChatmenu(){
    ajax("GET", `./getchatmenu?username=${localStorage.getItem("username")}`).then((data) => {
        displayChatmenu(data.chatArr);
        sessionStorage.setItem("chatmenu", JSON.stringify(data.chatArr));
    }).catch((err) => {
        console.log(err);
    });
}

// delay get
let sessionChatmenu = sessionStorage.getItem("chatmenu");
if (sessionChatmenu === null){
    getChatmenu();
} else {
    displayChatmenu(JSON.parse(sessionChatmenu));
    setTimeout(() => {
        getChatmenu();
    }, 1000);
}