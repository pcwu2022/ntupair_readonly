'use strict';

// get elements
const main = document.getElementById("main");
let submit = document.createElement("button");

// input storage
let inputNames = [];

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

// create question divs
function createQuestions(array){
    for (let i = 0; i < array.length; i++){
        let question = array[i];
        // extract data from js object
        let title = question.title;
        let choices = [];
        for (let weight in question){
            if (weight === "title"){
                continue;
            }
            choices.push([question[weight], parseFloat(weight)]);
        }
        // shuffle array
        for (let i = 0; i < choices.length; i++){
            let j = Math.floor(i/2);
            if (Math.random() > 0.5){
                let temp = choices[i];
                choices[i] = choices[j];
                choices[j] = temp;
            }
        }
        // create input elements
        let newDiv = document.createElement("div");
        let titleDiv = document.createElement("div");
        titleDiv.innerHTML = "<b>" + (i+1) + ". " + title + "</b>";
        newDiv.appendChild(titleDiv);
        for (let j = 0; j < choices.length; j++){
            let input = document.createElement("input");
            input.type = "radio";
            input.className = "mainInput";
            input.name = i + "";
            input.id = i + "" + j;
            input.value = choices[j][1];
            let label = document.createElement("label");
            label.className = "mainLabel";
            label.for = i + "" + j;
            label.innerHTML = choices[j][0];
            newDiv.appendChild(input);
            newDiv.appendChild(label);
            newDiv.innerHTML += "<br>";
        }
        inputNames.push(i + "");
        main.appendChild(newDiv);
    }
    submit.innerHTML = "Submit";
    submit.classList.add("submit");
    main.appendChild(submit);
};

// combine check results
function submitQuestions(){
    let checkArr = [];
    for (let i = 0; i < inputNames.length; i++){
        let inputs = document.getElementsByName(inputNames[i]);
        for (let input of inputs){
            if (input.checked){
                checkArr.push(input.value);
            }
        }
        if (checkArr.length == i){
            // not all boxes checked
            return false;
        }
    }
    return checkArr;
};

// get data
function getQuestions(title){
    let xhr = new XMLHttpRequest;
    xhr.open("GET", `/getquestions?title=${title}`);
    xhr.onload = function(){
        let questionArr = [];
        try {
            questionArr = JSON.parse(xhr.responseText).questionArr;
        } catch (err){
            console.log(err);
            questionArr = [];
        }
        if (questionArr.length === 0){
            console.log("Cannot Get");
        }
        createQuestions(questionArr);
    }
    xhr.send();
};
const urlSearchParams = new URLSearchParams(window.location.search);
const parameters = Object.fromEntries(urlSearchParams.entries());
if (parameters.title === undefined){
    location.href = "./home.html";
}
getQuestions(parameters.title);

// submit form
submit.addEventListener("click", function(){
    let checkArr = submitQuestions();
    if (checkArr === false){
        displayAlert("Please Answer All The Questions Before Submitting.");
        return;
    }
    ajax("POST", `/test`, {username: localStorage.getItem("username"), answer: JSON.stringify(checkArr), title: parameters.title}).then((data) => {
        displayAlert("Sent Successfully").then((status) => {
            location.href = "./home.html";
        });
    }).catch((err) => {
        console.log(err);
        displayAlert("Failed To Send");
    });
});