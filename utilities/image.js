'use strict';

const ImageKit = require('imagekit');
const databasehandler = require('../database/databasehandler.js');
const fs = require('fs');

const http = require('http');
const https = require('https');
  
const Stream = require('stream').Transform;
  
let downloadImageFromURL = (url, filename, callback = () => {}) => {
  
    let client = http;
    if (url.toString().indexOf("https") === 0){
        client = https;
    }
  
    client.request(url, function(response) {                                        
        let data = new Stream();                                                    
  
        response.on('data', function(chunk) {                                       
            data.push(chunk);                                                         
        });                                                                         
  
        response.on('end', function() {                                             
            fs.writeFile(filename, data.read(), callback);                               
        });                                                                         
   }).end();
};
  
downloadImageFromURL('https://www.itsolutionstuff.com/assets/images/logo-it.png', 'it.png');

// SDK initialization

let imagekit = new ImageKit({
    publicKey: "public_fmrk7ckjsOFyBEFpBP5MUcgLrWU=",
    urlEndpoint: "https://ik.imagekit.io/pcwu2022",
    privateKey: "private_f5HsOC0FJQnaJ/KBigNrXTK/sE8="
});
// URL generation

let imageURL = imagekit.url({
    path: "/default-image.jpg"
});
// Upload function internally uses the ImageKit.io javascript SDK

function upload(fileName, fullPath) {
    return new Promise((resolve, reject) => {
        try {
            fullPath = fullPath.replace("localhost", "www.ntupair.com");
            imagekit.upload(
                {
                    file: fullPath,
                    fileName: fileName
                },
                function (err, result) {
                    if (err){
                        console.log(err);
                        reject(err);
                    } else {
                        resolve(result.url);
                    }
                }
            );
        } catch (err) {
            reject(err);
        }
    });
}

function getImage(localPath){
    return new Promise((resolve, reject) => {
        let username = localPath.substring(15, localPath.length - 4);
        databasehandler.readSingleUserdata(username).then((data) => {
            if (data.image === undefined){
                reject(false);
                return;
            }
            let url = data.image;
            downloadImageFromURL(url, "." + localPath, () => {
                resolve(true);
            });
        }).catch((err) => {reject(err)});
    });
};

module.exports.upload = upload;
module.exports.getImage = getImage;