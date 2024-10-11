'use strict';

const main = document.getElementById("main");

let query = location.search;
let qIndex = query.indexOf("?");

// error
if (qIndex === -1){
    alert("Corrupted Link");
    location.href = "./";
}
query = query.substring(qIndex+1);
let uIndex = query.indexOf("username=");
let aIndex = query.indexOf("&");
if (uIndex === -1 || aIndex === -1){
    alert("Corrupted Link");
    location.href = "./";
}
let username = query.substring(uIndex+9, aIndex);
query = query.substring(aIndex+1);
let kIndex = query.indexOf("key=");
let key = "";
aIndex = query.indexOf("&");
if (kIndex === -1){
    alert("Corrupted Link");
    location.href = "./";
}
if (aIndex === -1){
    key = query.substring(4);
} else {
    key = query.substring(4, aIndex);
}

ajax("GET", `./checkkey${location.search.substring(qIndex)}`).then((data) => {
    if (data.warning === ""){
        // verified
        main.innerHTML = "Your account is verified and activated. Next, please select your department title to display on your profile."
        main.innerHTML += "<h3>Select department</h3>";
        let selectButton = undefined;
        let customButton = document.createElement("button");
        customButton.classList.add("submit");
        customButton.id = "customButton";
        customButton.innerHTML = "Customize";
        let customLabel = document.createElement("label");
        customLabel.innerHTML = "Type in your customized department title: (ex: 'EE 1', 'Phys Grad 2', or 'MATH PhD 3')";
        customLabel.htmlFor = "customInput";
        let customInput = document.createElement("input");
        customInput.id = "customInput";
        customInput.classList.add("input");
        let customSubmit = document.createElement("button");
        customSubmit.innerHTML = "submit";
        customSubmit.id = "customSubmit";
        customSubmit.classList.add("submit");
        if (data.department !== false){
            main.innerHTML += "Default: " + data.department + "<br>";
            selectButton = document.createElement("button");
            selectButton.classList.add("submit");
            selectButton.id = "selectButton";
            selectButton.innerHTML = "Select";
            selectButton.addEventListener("click", function(){
                sendDepartment(data.department);
            });
            customButton.innerHTML += "(deprecated)";
            customButton.addEventListener("click", function(){
                displayConfirm("There would be a '(custom)' annotation added to your customized department. Are you sure to continue?").then((status) => {
                    if (status){
                        main.removeChild(customButton);
                        main.appendChild(customLabel);
                        main.appendChild(customInput);
                        main.appendChild(customSubmit);
                    }
                });
            });
            main.appendChild(selectButton);
        } else {
            customButton.addEventListener("click", function(){
                main.appendChild(customLabel);
                main.appendChild(customInput);
                // custom school
                let schoolLabel = document.createElement("label");
                schoolLabel.innerHTML = "<br>Type in your school: ";
                schoolLabel.htmlFor = "customSchool";
                let customSchool = document.createElement("input");
                customSchool.id = "customSchool";
                customSchool.classList.add("input");
                main.appendChild(schoolLabel);
                main.appendChild(customSchool);
                main.appendChild(customSubmit);
            });
        }
        main.appendChild(customButton);
        main.appendChild(document.createElement("br"));
        customSubmit.addEventListener("click", function(){
            let customInput = document.getElementById("customInput");
            if (customInput === null){
                return;
            }
            if (customInput.value === ""){
                return;
            }
            let customSchool = document.getElementById("customSchool");
            if (customSchool === null){
                sendDepartment(customInput.value + " (custom)");
            } else {
                if (customSchool.value === ""){
                    return;
                }
                sendDepartment(customInput.value + " (" + customSchool.value + ")");
            }
        });
    } else {
        displayAlert(data.warning).then(() => {
            location.href = "./";
        });
    }
}).catch((err) => {console.log(err)});

function sendDepartment(department){
    ajax("POST", `./senddepartment`, {username: username, department: department}).then((data) => {
        displayAlert("Successfully sent.").then(() => {
            location.href = "./profile.html";
        });
    }).catch((err) => {
        console.log(err);
    });
};