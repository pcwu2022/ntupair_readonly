'use strict';

// get elements
const mainData = document.getElementById("mainData");
const usernameDiv = document.getElementById("usernameDiv");
const departmentDiv = document.getElementById("department");
const subData = document.getElementById("subData");
const formTitles = ["Description", "Hobbies", "Favorite Color", "Favorite Sport", "Favorite Artist", "Special Experience", "Is Single"];
const profileImage = document.getElementById("profileImage");

// global variables
let formElements = [];

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

function getProfile(){
    let url = `getprofile?username=${localStorage.getItem("username")}`;
    ajax("GET", url).then((data) => {
        let profile = data.profile;
        if (profile !== undefined){
            for (let key in profile){
                // add spaces
                let convertedKey = key[0];
                for (let i = 1; i < key.length; i++){
                    if (key[i].toUpperCase() === key[i]){
                        convertedKey += " ";
                    }
                    convertedKey += key[i];
                }
                formElements[formTitles.indexOf(convertedKey)].value = profile[key];
            }
        }
        if (data.department !== undefined){
            departmentDiv.innerHTML = data.department + " ";
            if (data.department === "Unverified"){
                let verifyButton = document.createElement("button");
                verifyButton.innerHTML = "Verify now";
                verifyButton.classList.add("submit");
                verifyButton.id = "verifyButton";
                verifyButton.addEventListener("click", function(){
                    location.href = "./verify.html";
                });
                departmentDiv.appendChild(verifyButton);
            }
        }
        usernameDiv.innerHTML = localStorage.getItem("username");
    }).catch((err) => {
        console.log(err);
    });
};

// upload image
profileImage.addEventListener("click", function(){
    if (document.getElementById("uploadInput") !== null){
        return;
    };
    let uploadInput = document.createElement("input");
    uploadInput.type = "file";
    uploadInput.accept = "image/*";
    uploadInput.id = "uploadInput";
    uploadInput.classList.add("submit");
    uploadInput.addEventListener("change", function(){
        let formData = new FormData();
        formData.append('profileImage', uploadInput.files[0]);
        fetch('./uploadprofile?username=' + localStorage.getItem("username"), {
            method: "POST",
            body: formData
        }).then((data) => {
            data.json().then((data) => {
                location.href = location.href;
            });
        }).catch((err) => {
            console.log(err);
        });
        mainData.removeChild(uploadInput);
    });
    mainData.insertBefore(uploadInput, document.getElementById("usernameDiv"));
});



// send form
function sendProfile(){
    let url = "./setprofile";
    let postBody = {username: localStorage.getItem("username")};
    for (let i = 0; i < formTitles.length; i++){
        let value = formElements[i].value; // for further modification
        postBody[formTitles[i].replace(/\s+/g, '')] = value;
    }
    ajax("POST", "./setprofile", postBody).then((data) => {
        displayAlert("Sent successfully").then((status) => {
            location.href = "./home.html";
        });
    }).catch((message)=>{
        console.log(message);
        displayAlert(message);
    });
}

// create form
function createForm(){
    for (let i = 0; i < formTitles.length; i++){
        let name = formTitles[i].replace(/\s+/g, '');
        let newDiv = document.createElement("div");
        let input = document.createElement("input");
        let label = document.createElement("label");
        newDiv.id = name + "Div";
        input.id = name;
        input.type = "text";
        input.name = name;
        input.classList.add("profileInput");
        label.htmlFor = name;
        label.innerHTML = formTitles[i] + ": ";
        newDiv.appendChild(label);
        newDiv.appendChild(input);
        formElements.push(input);
        subData.appendChild(newDiv);
    }
    getProfile();
    let submitButton = document.createElement("button");
    submitButton.classList.add("submit");
    submitButton.innerHTML = "Finished";
    submitButton.addEventListener("click", sendProfile);
    subData.appendChild(submitButton);
};
createForm();

profileImage.src = "./files/profile/" + localStorage.getItem("username") + ".png";

// clear unused storage
try {
    sessionStorage.removeItem("chatmenu");
} catch {}