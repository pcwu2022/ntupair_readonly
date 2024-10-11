'use strict';

// get elements
const mainData = document.getElementById("mainData");
const usernameDiv = document.getElementById("usernameDiv");
const departmentDiv = document.getElementById("department");
const subData = document.getElementById("subData");
const chatButton = document.getElementById("chat");
const profileImage = document.getElementById("profileImage");
const genderDiv = document.getElementById("gender");

// global variables
let targetName = "";

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
if (targetName === localStorage.getItem("username")){
    location.href = "./profile.html";
}

function getProfile(){
    let url = `getprofile?username=${targetName}`;
    ajax("GET", url).then((data) => {
        let profile = data.profile;
        if (profile !== undefined){
            for (let key in profile){
                displayInfo(key, profile[key]);
            }
        }
        if (data.department != undefined){
            departmentDiv.innerHTML = data.department;
        }
        genderDiv.innerHTML = data.gender;
        usernameDiv.innerHTML = targetName;
    }).catch((err) => {
        console.log(err);
    });
};
getProfile();

// display info
function displayInfo(key, value){
    if (key === "image"){
        return;
    }
    let newDiv = document.createElement("div");
    newDiv.innerHTML = "<b>" + key + ":</b> ";
    newDiv.innerHTML += value;
    subData.appendChild(newDiv);
};

// chat
chatButton.addEventListener("click", function(){
    getChatStatus(targetName);
    // location.href = "chat.html?user=" + targetName;
});


// display chat status
function displayChatStatus(data){
    if (data.status === null){
        displayConfirm(`User ${targetName} is not on your contact list yet. Do you want to send a chat request?`).then((status) => {
            if (status){
                //! send chat request
                updateChatStatus(targetName, "requesting", (data) => {
                    displayAlert("Chat request sent successfully.").then(() => {
                        location.href = "../chat.html?user=" + targetName;
                    });
                });
            } else {

            }
        });
    } else {
        location.href = "../chat.html?user=" + targetName;
    }
};

// get chat status
function getChatStatus(target){
    ajax("GET", `./getchatstatus?username=${localStorage.getItem("username")}&target=${target}`).then((data) => {
        displayChatStatus(data);
    }).catch((err) => {
        console.log(err);
    });
};

function updateChatStatus(target, status, then = (data) => {}){
    ajax("POST", `./updatechatstatus`, {username: localStorage.getItem("username"), target: target, status: status}).then((data) => {
        then(data);
    }).catch((err) => {
        displayAlert("Cannot send request, please refresh the page and try again");
    });
};

profileImage.src = "./files/profile/" + targetName + ".png";