'use strict';

function displayText(text, color="red", className="displayText", type="div", parent = document.body){
    let newEl = document.createElement(type);
    newEl.innerHTML = text;
    newEl.style.color = color;
    newEl.classList.add(className);
    parent.appendChild(newEl);
    return newEl;
};

function displayPopup(text, buttons = [], tag="h3"){
    let shieldEl = document.createElement("div");
    shieldEl.classList.add("popupShield");
    let popupEl = document.createElement("div");
    popupEl.classList.add("popup");
    popupEl.innerHTML = `<${tag}>${text}</${tag}>`;
    let buttonsArr = [];
    for (let button of buttons){
        let newButton = document.createElement("button");
        newButton.id = "popup" + button;
        newButton.innerHTML = button;
        newButton.classList.add("submit");
        newButton.classList.add("popupButton");
        popupEl.appendChild(newButton);
        buttonsArr.push(newButton);
    }
    shieldEl.appendChild(popupEl);
    document.body.appendChild(shieldEl);
    return buttonsArr;
};

function removePopup(){
    let popupShield = document.getElementsByClassName("popupShield")[0];
    if (popupShield !== undefined){
        popupShield.parentElement.removeChild(popupShield);
    }
};

async function displayAlert(text, tag="h3"){
    return new Promise((resolve, reject) => {
        let button = displayPopup(text, ["Okay"], tag)[0];
        button.addEventListener("click", function(){
            removePopup();
            resolve(true);
        });
    });
};

async function displayConfirm(text){
    return new Promise((resolve, reject) => {
        let buttons = displayPopup(text, ["Okay", "Cancel"]);
        buttons[0].addEventListener("click", function(){
            removePopup();
            resolve(true);
        });
        buttons[1].addEventListener("click", function(){
            removePopup();
            resolve(false);
        });
    });
};

// titleH1
const titleH1 = document.getElementById("title");
try {
    titleH1.addEventListener("click", function(){
        location.href = "./home.html";
    });
} catch {

}

// functions div
const functionsDiv = document.getElementById("functions");
const stickerDiv = document.getElementById("sticker");
const profileDiv = document.getElementById("profile");
const profilePhoto = document.getElementById("profilePhoto");
const chatboxDiv = document.getElementById("chatbox");
const logoutDiv = document.getElementById("logout");
const buttonList = document.getElementById("buttonList");
const usernameFunctionDiv = document.getElementById("username");

let mouseOver = false;
function actMouseOver(){
    try {
        if (mouseOver){
            profileDiv.isActive = true;
            chatboxDiv.isActive = true;
            logoutDiv.isActive = true;
            buttonList.style.opacity = "0.9";
        } else {
            profileDiv.isActive = false;
            chatboxDiv.isActive = false;
            logoutDiv.isActive = false;
            buttonList.style.opacity = "0";
        }
    } catch {
    
    }
};

try {
    usernameFunctionDiv.innerHTML = "<b>" + localStorage.getItem("username") + "</b>";
    functionsDiv.addEventListener("mouseover", function(){
        mouseOver = true;
        actMouseOver();
    });
    stickerDiv.addEventListener("mouseover", function(){
        mouseOver = true;
        actMouseOver();
    });
    profileDiv.addEventListener("mouseover", function(){
        mouseOver = true;
        actMouseOver();
    });
    chatboxDiv.addEventListener("mouseover", function(){
        mouseOver = true;
        actMouseOver();
    });
    logoutDiv.addEventListener("mouseover", function(){
        mouseOver = true;
        actMouseOver();
    });
    functionsDiv.addEventListener("mouseout", function(){
        mouseOver = false;
        actMouseOver();
    });
    stickerDiv.addEventListener("mouseout", function(){
        mouseOver = false;
        actMouseOver();
    });
    profileDiv.addEventListener("mouseout", function(){
        mouseOver = false;
        actMouseOver();
    });
    chatboxDiv.addEventListener("mouseout", function(){
        mouseOver = false;
        actMouseOver();
    });
    logoutDiv.addEventListener("mouseout", function(){
        mouseOver = false;
        actMouseOver();
    });
    actMouseOver();

    profileDiv.addEventListener("click", function(){
        if (profileDiv.isActive){
            location.href = "./profile.html";
        }
    });
    chatboxDiv.addEventListener("click", function(){
        if (chatboxDiv.isActive){
            location.href = "./chatmenu.html";
        }
    });
    logoutDiv.addEventListener("click", function(){
        if (logoutDiv.isActive){
            localStorage.removeItem("username");
            localStorage.removeItem("sessionCode");
            try {
                sessionStorage.removeItem("dataLength");
                sessionStorage.removeItem("genderConstraint");
                sessionStorage.removeItem("pairData");
            } catch {}
            try {
                sessionStorage.removeItem("chatmenu");
            } catch {}
            displayAlert("Successfully logged out").then((status) => {
                location.href = "./";
            });
        }
    });

    // image
    profilePhoto.src = "./files/profile/" + localStorage.getItem("username") + ".png";
} catch {

}

// sanitaion
const sanitationArr = [
    ["<", "&lt"],
    [">", "&gt"],
    ["\"", "&quot"],
    ["'", "&#x27"]
];
function sanitaion(text){
    for (let i = 0; i < sanitationArr.length; i++){
        tests.replaceAll(sanitationArr[i][0], sanitationArr[i][1]);
    }
    return text;
}