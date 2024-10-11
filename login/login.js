'use strict';

// get elements
const username = document.getElementById("username");
const password = document.getElementById("password");
const submitButton = document.getElementById("submit");
const createAccount = document.getElementById("createAccount");
const loginErrorDiv = document.getElementById("loginError");

// guest account
username.value = "guest";
password.value = "12345678";

// check if user is logged in
ajax("POST", `./session`, {username: localStorage.getItem("username"), sessionCode: localStorage.getItem("sessionCode")})
    .then((data) => {
        //location.href = "home.html";
    }).catch((message) => {
        console.log(message);
    });


// submit login form
submitButton.addEventListener("click", function(){
    ajax("POST", `./login`, {username: username.value.replaceAll(" ", ""), password: password.value})
    .then((data) => {
        localStorage.setItem("username", username.value.replaceAll(" ", ""));
        localStorage.setItem("sessionCode", data.sessionCode);
        localStorage.setItem("userCount", data.userCount);
        location.href = "home.html";
    }).catch((message) => {
        loginErrorDiv.innerHTML = "Incorrect username or password";
        console.log(message);
    });
});

// create new account
createAccount.addEventListener("click", function(){
    displayAlert("NTUPair is now on read-only mode. New accounts cannot be created. Please use the 'guest' account to login.")
    // location.href = "account.html";
});