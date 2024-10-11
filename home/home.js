'use strict';

// get elements
const main = document.getElementById("main");
const resultDiv = document.getElementById("result");
const tests = document.getElementById("tests");
const chats = document.getElementById("chats");
const control = document.getElementById("control");
const notifications = document.getElementById("notifications");
const userCount = document.getElementById("userCount");

// global variables
let matchAvailable = false;
let matchButtons = [];
let useData = [];
let length = "5";
let genderConstraint = "Both";

// check if user is logged in -> get notifications
ajax("POST", `./session`, {username: localStorage.getItem("username"), sessionCode: localStorage.getItem("sessionCode")})
    .then((data) => {
        // get notifications
        getNotifications();
    }).catch((message) => {
        if (message === "Parse Error"){
            console.log(message);
        } else {
            displayAlert("Session expired. Please login again").then((status) => {
                location.href = "/";
            });
        }
    });

// get notifications
function getNotifications(){
    ajax("GET", `./getnotifications?username=${localStorage.getItem("username")}`).then((data) => {
        // display notifications
        if (data.notifications.length === 0){
            notifications.innerHTML += "There are no notifications in the stack.";
        }
        data.notifications.sort((a, b) => b[2] - a[2]); // sort by time
        for (let notification of data.notifications){
            let notificationDiv = document.createElement("div");
            notificationDiv.classList.add("notifications");
            let date = new Date(notification[2]*1000);
            let dateText = `. On ${date.getMonth()+1}/${date.getDate()} ${("0" + date.getHours()).slice(-2)}:${("0" + date.getMinutes()).slice(-2)}`;
            notificationDiv.location = notification[1];
            notificationDiv.innerHTML = notification[0] + dateText;
            notificationDiv.addEventListener("click", function(){
                location.href = notificationDiv.location;
            });
            notifications.appendChild(notificationDiv);
        }
    }).catch((err) => {
        console.log(err);
    });
};

// add test option
function addTestOption(testArray = {}){
    // detect if there are finished tests
    let preMatchAvailable = false;
    for (let test in testArray){
        let newDiv = document.createElement("div");
        newDiv.classList.add("testOption");
        newDiv.name = test;
        newDiv.innerHTML = test;
        // console.log(testArray);
        if (testArray[test] === true){ // available
            newDiv.classList.add("availableOption");
            newDiv.addEventListener("click", function(){
                location.href = `./test.html?title=${newDiv.name}`;
            });
        } else {
            newDiv.classList.add("unavailableOption");
            newDiv.addEventListener("click", function(){
                if (!matchAvailable){
                    displayAlert("You have already submitted this form");
                }
            });
            preMatchAvailable = true;
            // create match button
            let matchButton = document.createElement("button");
            matchButton.classList.add("matchButton");
            matchButton.classList.add("submit");
            matchButton.innerHTML = "Select";
            matchButton.classList.add("select");
            matchButton.name = test;
            matchButton.style.opacity = "0";
            matchButton.addEventListener("click", function(){
                // select match or not
                if (matchAvailable){
                    if (useData.indexOf(matchButton.name) === -1){
                        useData.push(matchButton.name);
                        matchButton.innerHTML = "Selected";
                        matchButton.classList.add("selected");
                        matchButton.classList.remove("select");
                    } else {
                        useData.splice(useData.indexOf(matchButton.name), 1);
                        matchButton.innerHTML = "Select";
                        matchButton.classList.add("select");
                        matchButton.classList.remove("selected");
                    }
                }
            });
            matchButtons.push(matchButton);
            newDiv.innerHTML += "<br>";
            newDiv.appendChild(matchButton);
        }
        
        tests.appendChild(newDiv);
    }
    if (preMatchAvailable){
        let matchControlButton = document.createElement("button");
        matchControlButton.innerHTML = "Select Data to Use";
        matchControlButton.id = "matchControlButton";
        matchControlButton.classList.add("controlButton");
        matchControlButton.classList.add("submit");
        matchControlButton.addEventListener("click", function(){
            if (matchAvailable){
                matchAvailable = false;
                matchControlButton.innerHTML = "Select Data to Use";
                for (let matchButton of matchButtons){
                    matchButton.style.opacity = "0";
                }
                let cancelButton = document.getElementById("cancelButton");
                if (cancelButton !== undefined){
                    control.removeChild(cancelButton);
                }

                //remove other controls
                let amountSelect = document.getElementById("amountSelect");
                if (amountSelect !== undefined){
                    length = amountSelect.value;
                    control.removeChild(amountSelect);
                }
                let genderSelect = document.getElementById("genderSelect");
                if (genderSelect !== undefined){
                    genderConstraint = genderSelect.value;
                    control.removeChild(genderSelect);
                }

                // get match data
                getMatchData();
            } else {
                matchAvailable = true;
                matchControlButton.innerHTML = "Run Pairing Algorithm";
                for (let matchButton of matchButtons){
                    matchButton.style.opacity = "1";
                }
                let cancelButton = document.createElement("button");
                cancelButton.id = "cancelButton";
                cancelButton.classList.add("controlButton");
                cancelButton.classList.add("submit");
                cancelButton.innerHTML = "Cancel";
                cancelButton.addEventListener("click", function(e){
                    matchAvailable = false;
                    matchControlButton.innerHTML = "Select Data to Use";
                    for (let matchButton of matchButtons){
                        matchButton.style.opacity = "0";
                    }
                    control.removeChild(cancelButton);
                    //remove other controls
                    let amountSelect = document.getElementById("amountSelect");
                    if (amountSelect !== undefined){
                        length = amountSelect.value;
                        control.removeChild(amountSelect);
                    }
                    let genderSelect = document.getElementById("genderSelect");
                    if (genderSelect !== undefined){
                        genderConstraint = genderSelect.value;
                        control.removeChild(genderSelect);
                    }
                });
                control.appendChild(cancelButton);
                
                // other controls
                let amountSelect = document.createElement("select");
                amountSelect.id = "amountSelect";
                amountSelect.title = "Select the maximum search result length";
                amountSelect.classList.add("controlButton");
                amountSelect.classList.add("submit");
                let options = [10,20,50,100];
                for (let option of options){
                    let selectOption = document.createElement("option");
                    selectOption.innerHTML = "Max: " + option + " results";
                    selectOption.value = "" + option;
                    if (sessionStorage.getItem("dataLength") === option + ""){
                        selectOption.selected = "selected";
                    }
                    selectOption.classList.add("option");
                    amountSelect.appendChild(selectOption);
                }
                control.appendChild(amountSelect);

                let genderSelect = document.createElement("select");
                genderSelect.id = "genderSelect";
                genderSelect.title = "Select which gender's data to display";
                genderSelect.classList.add("controlButton");
                genderSelect.classList.add("submit");
                let genderOptions = ["Both", "Male", "Female", "Other"];
                for (let option of genderOptions){
                    let selectOption = document.createElement("option");
                    selectOption.innerHTML = "Search constraint: " + option;
                    selectOption.value = option;
                    if (sessionStorage.getItem("genderConstraint") === option){
                        selectOption.selected = "selected";
                    }
                    selectOption.classList.add("option");
                    genderSelect.appendChild(selectOption);
                }
                control.appendChild(genderSelect);
            }
        });
        control.appendChild(matchControlButton);
    }
};

// get test options
function getTestOption(){
    const xhr = new XMLHttpRequest;
    xhr.open("GET", `/gettests?username=${localStorage.getItem("username")}`);
    xhr.onload = function(){
        let testArray = {};
        try {
            testArray = JSON.parse(xhr.responseText).tests;
        } catch (err){
            console.log(err);
            testArray = {};
        }
        addTestOption(testArray);
    }
    xhr.send();
};
getTestOption();

// display match data
function displayMatchData(result, gender, department, onlineStatus, prev = false){
    //console.log(JSON.stringify([result, gender, department, onlineStatus]));
    if (prev){
        resultDiv.innerHTML = "<h3> Matching result: (Previous data)</h3>";
    } else {
        resultDiv.innerHTML = "<h3> Matching result: </h3>";
    }
    if (Object.keys(result).length === 0){
        resultDiv.innerHTML = "Sorry, there are no matched users for your case.";
        return;
    }
    let resultArr = [];
    for (let key in result){
        resultArr.push([key, result[key]]);
    }
    //resultArr.sort((a, b) => b[1] - a[1]);
    resultArr.sort((a, b) => {
        let u1 = a[0];
        let u2 = b[0];
        let g1 = a[1];
        let g2 = b[1];
        if (onlineStatus[u1] === true){
            g1 += 50;
        }
        if (onlineStatus[u2] === true){
            g2 += 50;
        }
        if (typeof(onlineStatus[u1]) === "number"){
            if (onlineStatus[u1] <= 120){
                g1 += 50;
            }
        }
        if (typeof(onlineStatus[u2]) === "number"){
            if (onlineStatus[u2] <= 120){
                g2 += 50;
            }
        }
        return g2 - g1;
    });
    for (let arr of resultArr){
        let key = arr[0];
        let userDiv = document.createElement("div");
        let targetProfile = document.createElement("img");
        targetProfile.classList.add("profileImage");
        targetProfile.src = "./files/profile/" + key + ".png";
        userDiv.appendChild(targetProfile);
        userDiv.innerHTML += "<br><b>" + key + "</b>&nbsp&nbsp&nbsp&nbsp";
        userDiv.innerHTML += department[key] + "<br>";
        userDiv.innerHTML +=  Math.round(result[key]*100) + "%";
        userDiv.id = key;
        userDiv.name = key;
        userDiv.title = "View profile";
        userDiv.classList.add("userDiv");
        let onlineSpan = document.createElement("span");
        onlineSpan.innerHTML = "online";
        onlineSpan.classList.add("onlineSpan");
        if (onlineStatus[key] === true){
            userDiv.appendChild(onlineSpan);
        } else if (typeof(onlineStatus[key]) === 'number'){
            if (onlineStatus[key] <= 120){
                userDiv.appendChild(onlineSpan);
            }
        }
        try {
            userDiv.classList.add("user" + gender[key]);
        } catch (err) {
            console.log(err);
        }
        userDiv.addEventListener("click", function(){
            location.href = "./viewprofile.html?user=" + userDiv.name;
        });
        resultDiv.appendChild(userDiv);
        resultDiv.scrollIntoView({behavior: "smooth", block: "start", inline: "nearest"});
    }
};

// match
function getMatchData(){
    // set sessionstorage
    sessionStorage.setItem("dataLength", length);
    sessionStorage.setItem("genderConstraint", genderConstraint);
    ajax("GET", `./match?username=${localStorage.getItem("username")}&useData=${JSON.stringify(useData)}&length=${length}&gender=${genderConstraint}`)
        .then((data) => {
            let result = data.result;
            let gender = data.gender;
            let department = data.department;
            let onlineStatus = data.onlineStatus;
            sessionStorage.setItem("pairData", JSON.stringify(data));
            displayMatchData(result, gender, department, onlineStatus);
        })
        .catch((message) => {
            console.log(message);
        });
};

// display user count
userCount.innerHTML = localStorage.getItem("userCount");

// load result from sessionStorage
let pairDataJson = sessionStorage.getItem("pairData");
if (pairDataJson !== null){
    let data = JSON.parse(pairDataJson);
    let result = data.result;
    let gender = data.gender;
    let department = data.department;
    let onlineStatus = data.onlineStatus;
    displayMatchData(result, gender, department, onlineStatus, true);
}

// clear unused storage
try {
    sessionStorage.removeItem("chatmenu");
} catch {}