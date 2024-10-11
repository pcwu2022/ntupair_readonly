'use strict';

const databasehandler = require('../database/databasehandler.js');
const fileupload = require('express-fileupload');
const sharp = require('sharp');
const fs = require('fs');
const image = require('../utilities/image.js');

// get profile
async function getProfile(req, res){
    let username = req.query.username;
    let sendObj = {};
    sendObj.profile = {};
    sendObj.success = true;
    if (username === undefined){
        sendObj.success = false;
    } else {
        try {
            //let userData = await databasehandler.readSingleUserdata(username);
            let userProfile = await databasehandler.readProfile(username);
            if (userProfile === undefined){
                sendObj.profile = {};
                let userData = await databasehandler.readSingleUserdata(username);
                sendObj.department = userData.department;
                sendObj.gender = userData.gender;
            } else {
                sendObj.profile = userProfile;
                sendObj.department = userProfile.department + ""; // copy
                sendObj.gender = userProfile.gender + ""; // copy
                delete sendObj.profile.department;
                delete sendObj.profile.gender;
                delete sendObj.profile.username;
            }
        } catch(err) {
            console.log(err);
            sendObj.success = false;
        }
    }
    res.send(sendObj);
};

// set profile
async function setProfile(req, res){
    let username = undefined;
    let sendObj = {};
    let profile = {};
    sendObj.success = true;
    for (let key in req.body){
        if (key === "username"){
            username = req.body[key];
        } else {
            profile[key] = req.body[key];
        }
    }
    if (username === undefined){
        sendObj.success = false;
    } else {
        try {
            await databasehandler.writeProfile(username, profile);
            sendObj.success = true;
        } catch (err){
            console.log(err);
            sendObj.error = err.toString();
            sendObj.success = false;
        }
    }
    res.send(sendObj);
};

async function uploadProfile(req, res){
    let sendObj = {
        success: false
    };
    let profileImage = req.files.profileImage;
    let username = req.query.username;
    let location = req.get("origin");
    if (username === undefined){
        res.send(sendObj);
        return;
    }
    let subName = profileImage.name.substring(profileImage.name.length-4);
    subName = subName.substring(subName.indexOf(".")+1);
    let path = "./files/profile/" + username + ".png";
    let bufferPath = "./files/buffer/" + username + "." + subName;
    profileImage.mv(bufferPath, (err) => {
        if (err){
            console.log(err);
            console.log("On line 84");
            res.send(sendObj);
        } else {
            sharp.cache(false);
            sharp(bufferPath).resize({
                width: 100,
                height: 100,
                fit: sharp.fit.cover
            }).toFormat("png").toFile(path, (err) => {
                if (err){
                    console.log(err);
                    console.log("On line 84");
                    res.send(sendObj);
                } else {
                    fs.unlink(bufferPath, (err) => {
                        if (err){
                            console.log(err);
                            console.log("On line 84");
                            res.send(sendObj);
                        } else {
                            sendObj.success = true;
                            sendObj.path = path;
                            try {
                                image.upload("/" + username + ".png", location + "/files/profile/" + username + ".png").then((url) => {
                                    databasehandler.writeUserdata({
                                        username: username,
                                        image: url
                                    });
                                }).catch((err) => {
                                    console.log(err);
                                });
                            } catch {
                                console.log("Cannot upload image " + username + ".png")
                            }
                            res.send(sendObj);
                        }
                    });
                }
            });
        }
    });
};

// export
module.exports.getProfile = getProfile;
module.exports.setProfile = setProfile;
module.exports.uploadProfile = uploadProfile;