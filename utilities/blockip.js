'use strict';

let requestObj = {};

function block(req, res){
    let ip = req.ip;
    let now = (new Date()).getTime();
    for (let ipKey in requestObj){
        if (now - requestObj[ipKey][0] > 1000 && requestObj[ipKey][1] < 50){
            delete requestObj[ipKey];
        } else if (now - requestObj[ipKey][0] > 5000 && requestObj[ipKey][1] < 100) {
            delete requestObj[ipKey];
        } else if (now - requestObj[ipKey][0] > 10000 && requestObj[ipKey][1] < 1000) {
            delete requestObj[ipKey];
        } else if (now - requestObj[ipKey][0] > 24*3600000) {
            delete requestObj[ipKey];
        }
    }
    if (requestObj[ip] === undefined || requestObj[ip][0] === undefined){
        requestObj[ip] = [now, 1];
    } else {
        if (now - requestObj[ip][0] < 50 && requestObj[ip][1] > 100){
            console.log("Attack at ", ip);
            res.send({success: false});
            return true;
        }
        if (now - requestObj[ip][0] < 100 && requestObj[ip][1] > 500){
            console.log("Attack at ", ip);
            res.send({success: false});
            return true;
        }
        requestObj[ip][0] = now;
        requestObj[ip][1] += 1;
    }
    return false;
};

module.exports.block = block;