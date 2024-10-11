'use strict';

const fs = require('fs');

function jsonConvert(){
    let file = fs.readFileSync("utilities/rawtest.txt", 'utf-8');
    let json = {};
    let currType = "";
    let currData = "";
    let currTitle = "";
    let currIndex = -1;
    let currQuestion = "";
    let currWeight = "";
    file += "\n";
    for (let i = 0; i < file.length; i++){
        switch (file[i]){
            case "<":
                currData = "";
                currType = "Title";
                break;
            case ">":
                currTitle = currData;
                json[currTitle] = [];
                currData = "";
                currIndex = -1;
                break;
            case "#":
                currData = "";
                currIndex++;
                json[currTitle].push({});
                currType = "Question";
                break;
            case "*":
                currData = "";
                currType = "Weight";
                break;
            case "\\":
                if (currType === "Weight"){
                    currWeight = currData;
                }
                currData = "";
                currType = "Choice";
                break;
            case "\n":
                if (currType === "Question"){
                    currQuestion = currData;
                    json[currTitle][currIndex].title = currQuestion;
                } else if (currType === "Choice"){
                    json[currTitle][currIndex][currWeight] = currData;
                } else {

                }
                currData = "";
                break;
            case "\t":
                break;
            case "\r":
                break;
            default:
                currData += file[i];
                break;
        }
    }
    fs.writeFileSync("utilities/convertedtest.json", JSON.stringify(json, null, 4));
};

if (__filename.indexOf("jsonconvert.js") !== -1){
    jsonConvert();
}
 
module.exports.jsonConvert = jsonConvert;