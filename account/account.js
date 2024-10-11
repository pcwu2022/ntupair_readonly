'use strict';

//!!!variable length -> sql restriction!!!

// get elements
const username = document.getElementById("username");
const password = document.getElementById("password");
const submitButton = document.getElementById("submit");
const gender = document.getElementById("gender");

const usernameErrorDiv = document.getElementById("usernameError");
const passwordErrorDiv = document.getElementById("passwordError");
const genderErrorDiv = document.getElementById("genderError");

submitButton.addEventListener("click", function(){
    if (!/^[A-Za-z0-9_.]*$/.test(username.value)){
        usernameErrorDiv.innerHTML = "Username Restriction: numbers, alphabeticals and '_', '.' only.";
        return;
    }
    if (username.value.length > 40){
        usernameErrorDiv.innerHTML = "Username Length Restriction: 40 characters.";
        return;
    }
    if (username.value.length === 0){
        usernameErrorDiv.innerHTML = "Please set an username";
        return;
    }
    usernameErrorDiv.innerHTML = "";
    if (password.value.length === 0){
        passwordErrorDiv.innerHTML = "Please set a password";
        return;
    }
    passwordErrorDiv.innerHTML = "";
    if (gender.value === "--Gender--"){
        genderErrorDiv.innerHTML = "Please select a gender";
        return;
    }
    genderErrorDiv.innerHTML = "";
    ajax("POST", `./account`, {username: username.value, password: password.value, gender: gender.value})
        .then((data) => {
            if (data.valid){
                localStorage.setItem("username", username.value);
                localStorage.setItem("sessionCode", data.sessionCode);
                localStorage.setItem("userCount", data.userCount);
                // go to home page
                displayAlert("Account created as " + username.value + ". Welcome to our community!").then(() => {
                    location.href = "./home.html";
                });
            } else {
                usernameErrorDiv.innerHTML = "Username Taken.";
            }
        })
        .catch((message) => {
            console.log(message);
            displayAlert(message);
        });
});