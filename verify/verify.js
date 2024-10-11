'use strict';

const webmailButton = document.getElementById("webmail");
const gsuiteButton = document.getElementById("gsuite");
const customEmailButton = document.getElementById("customEmail");

const verifyForm = document.getElementById("verifyForm");
const verifyDiscription = document.getElementById("verifyDiscription");

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

function createForm(button){
    verifyForm.innerHTML = ""; // clear all
    let mailLabel = document.createElement("label");
    mailLabel.htmlFor = "mailInput";
    mailLabel.innerHTML = "Email for verification: ";
    let mailInput = document.createElement("input");
    mailInput.name = "mailInput";
    mailInput.id = "mailInput";
    let suffixSpan = document.createElement("span");
    suffixSpan.id = "suffixSpan";
    if (button.id === "webmail"){
        suffixSpan.innerHTML = "@ntu.edu.tw";
    } else if (button.id === "gsuite"){
        suffixSpan.innerHTML = "@g.ntu.edu.tw";
    } else {
        suffixSpan.innerHTML = "";
    }
    let submitMail = document.createElement("button");
    submitMail.classList.add("submit");
    submitMail.id = "submitMail";
    submitMail.name = button.id;
    submitMail.innerHTML = "Send Verification Message";
    submitMail.addEventListener("click", function(){
        let address = document.getElementById("mailInput").value;
        address += document.getElementById("suffixSpan").innerHTML;
        address = address.replaceAll(" ", ""); // remove white spaces
        sendMail(address);
        verifyForm.innerHTML += "<br>Verification email sent to " + address + ". The link holds valid for 24 hours.";
    });
    verifyForm.appendChild(mailLabel);
    verifyForm.appendChild(mailInput);
    verifyForm.appendChild(suffixSpan);
    verifyForm.innerHTML += "<br>";
    verifyForm.appendChild(submitMail);
};


webmailButton.addEventListener("click", function(){
    createForm(webmailButton);
});
gsuiteButton.addEventListener("click", function(){
    createForm(gsuiteButton);
});
customEmailButton.addEventListener("click", function(){
    createForm(customEmailButton);
});


// ajax
function sendMail(address){
    // slice blank spaces
    ajax("POST", `./sendmail`, {username: localStorage.getItem("username"), address: address}).then((data) => {
        if (data.warning === ""){
            displayAlert("Verification email sent successfully").then(() => {
                location.href = "./";
            });
        } else {
            displayAlert(data.warning).then(() => {
                location.href = location.href;
            });
        }
    }).catch((err) => {
        console.log(err);
    });
}