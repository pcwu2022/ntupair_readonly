'use strict';

const ajax = function(method = "GET", url = "", postBody = {}){
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest;
        xhr.open(method, url);
        xhr.onload = function(){
            let data = {};
            try {
                data = JSON.parse(xhr.responseText);
            } catch (err) {
                console.log("Parse Error", err);
                //!
                reject(`Error: '${xhr.responseText}' Please Contact Developer`);
                return;
            }
            if (data.success){
                resolve(data);
            } else {
                if (data.error !== undefined){
                    reject(data.error);
                } else {
                    reject("Unsuccessfully sent, please refresh the page and try again");
                }
            }
        }
        // destruct postBody
        let postStr = "";
        for (let key in postBody){
            postStr += key + "=" + postBody[key] + "&";
        }
        postStr = postStr.substring(0, postStr.length-1);
        xhr.setRequestHeader("Content-Type", "application/json");
        xhr.send(JSON.stringify(postBody));
    });
};