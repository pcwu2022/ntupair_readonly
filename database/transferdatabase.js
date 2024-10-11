// for json database

const fs = require('fs');
const mainPath = './database/transferredjson';

const tempDatabase = {};

// const clone = (items) => items.map(item => Array.isArray(item) ? clone(item) : item);
const clone = (items) => JSON.parse(JSON.stringify(items));

const getData = function(database){
    if (tempDatabase[database] === undefined){
        module.exports.load(database);
    }
    return clone(tempDatabase[database]); // an array
}

const saveData = function(database, dataArray){
    tempDatabase[database] = dataArray;
    const filePath = mainPath + `/${database}.json`;
    fs.writeFileSync(filePath, JSON.stringify({database: tempDatabase[database]}, null, 4));
}

// read temporary database
module.exports.load = function(database){
    const filePath = mainPath + `/${database}.json`;
    //console.log("loaded:" + filePath);
    tempDatabase[database] = JSON.parse(fs.readFileSync(filePath)).database;
}

// SQL Engine
module.exports.fetch = function(query){
    // console.log(query);
    let result = [];

    // query parser
    query = query.replaceAll("'", ""); // trim quotes
    query = query.replaceAll("  ", " ");
    let parsedArr = query.split(' ');
    // console.log(parsedArr);

    // return length
    if (query.indexOf("COUNT(id)") !== -1){
        result[0] = {};
        result[0]["COUNT(id)"] = getData('user_data').length;
        return result;
    }

    let database = "";
    // select clause
    if (parsedArr[0] === "SELECT"){
        database = parsedArr[parsedArr.indexOf("FROM") + 1];
        result = getData(database);

        // where but not join
        if (parsedArr.indexOf("WHERE") !== -1 && parsedArr.indexOf("JOIN") === -1){
            if (parsedArr.indexOf("BINARY") !== -1){
                let idx = parsedArr.indexOf("BINARY");
                let key = parsedArr[idx+1];
                let value = parsedArr[idx+3];
                let newResult = [];
                for (let el of result){
                    if (el[key] === value){
                        newResult.push(el);
                    }
                }
                result = newResult;
            } else if (parsedArr.indexOf("NULL") !== -1){
                let idx = parsedArr.indexOf("WHERE");
                let newResult = [];
                for (let el of result){
                    let isNull = false;
                    for (let i = idx + 1; i < parsedArr.length; i += 5){
                        if (el[parsedArr[i]] === null){
                           isNull = true;
                           break;
                        }
                    }
                    if (!isNull){
                        newResult.push(el);
                    }
                }
                result = newResult;
            } else if (parsedArr.indexOf("AND") !== -1){
                let idx = parsedArr.indexOf("WHERE");
                let key1 = parsedArr[idx+1];
                let value1 = parsedArr[idx+3];
                let key2 = parsedArr[idx+5];
                let value2 = parsedArr[idx+7];
                let key3 = parsedArr[idx+9];
                let value3 = parsedArr[idx+11];
                let key4 = parsedArr[idx+13];
                let value4 = parsedArr[idx+15];
                let newResult = [];
                for (let el of result){
                    if ((el[key1] === value1 && el[key2] === value2) || (el[key3] === value3 && el[key4] === value4)){
                        newResult.push(el);
                    }
                }
                result = newResult.reverse();
            } else if (parsedArr.indexOf("OR") !== -1){
                let idx = parsedArr.indexOf("WHERE");
                let key1 = parsedArr[idx+1];
                let value1 = parsedArr[idx+3];
                let key2 = parsedArr[idx+5];
                let value2 = parsedArr[idx+7];
                let newResult = [];
                for (let el of result){
                    if (el[key1] === value1 || el[key2] === value2){
                        newResult.push(el);
                    }
                }
                result = newResult;
            } else if (parsedArr.indexOf("IN") !== -1){
                let idx = parsedArr.indexOf("IN");
                let key = parsedArr[idx-1];
                let JSONList = parsedArr[idx+1].replaceAll("(", "['").replaceAll(")", "']").replaceAll(",", "','");
                let list = JSON.parse(JSONList.replaceAll("'", '"'));
                let newResult = [];
                for (let el of result){
                    if (list.indexOf(el[key]) !== -1){
                        newResult.push(el);
                    }
                }
                result = newResult;
            }
        }

        // join
        if (parsedArr.indexOf("JOIN") !== -1){
            let idx = parsedArr.indexOf("JOIN");
            let database2 = parsedArr[idx + 1];
            let result2 = getData(database2);
            let whereIdx = parsedArr.indexOf("WHERE");
            let username = parsedArr[whereIdx + 3];
            for (let el of result2){
                if (el.username === username){
                    result2 = el;
                    break;
                }
            }
            if (Array.isArray(result2)){
                result2 = {};
            }
            for (let el of result){
                if (el.username === username){
                    result = el;
                    break;
                }
            }
            if (Array.isArray(result)){
                result = {};
                //console.log(query, []);
                return [];
            }
            
            // merge two objects (join)
            for (let key in result2){
                result[key] = result2[key];
            }
            result = [result];
        }
        //console.log(query, result);
        return result;
    }

    if (parsedArr[0] === "INSERT"){
        let database = parsedArr[2];
        let leftColumnIndex = 3;
        let valueIndex = parsedArr.indexOf("VALUES");
        let rightColumnIndex = valueIndex-1;
        let leftValueIndex = valueIndex+1;
        let rightValueIndex = parsedArr.length-1;
        // for debug use
        if (rightColumnIndex - leftColumnIndex !== rightValueIndex - leftValueIndex){
            //console.log(query);
            //console.log(" Query Error");
            return [];
        }
        let insertData = getData(database);
        let prototypeColumns = Object.keys(insertData[0]);
        let newData = {};
        for (let i = 0; i < rightColumnIndex - leftColumnIndex; i+=2){
            let column = parsedArr[i + 1 + leftColumnIndex];
            let value = parsedArr[i + 1 + leftValueIndex];
            if (column === ')' || column === "," || column === ""){
                continue;
            }
            newData[column] = value;
        }
        for (let proCol of prototypeColumns){
            if (newData[proCol] === undefined){
                newData[proCol] = insertData[0][proCol];
                if (proCol === "id"){
                    newData[proCol] = insertData[insertData.length-1][proCol] + 1;
                }
            }
            if (typeof(insertData[0][proCol]) === "number"){
                newData[proCol] = parseFloat(newData[proCol]);
            }
        }
        insertData.push(newData);
        // //console.log(insertData[0]);
        //console.log(query, newData);
        saveData(database, insertData);
    }

    if (parsedArr[0] === "UPDATE"){
        let database = parsedArr[1];
        let updateDatabase = getData(database);
        let setIndex = parsedArr.indexOf("SET");
        let whereIndex = parsedArr.indexOf("WHERE");
        // //console.log(parsedArr);
        // //console.log(setIndex, whereIndex);

        let pointers = [];
        // where clause
        if (parsedArr.indexOf("NOT") !== -1){
            // where not ...
            let key1 = parsedArr[whereIndex + 3];
            let value1 = parsedArr[whereIndex + 5];
            let key2 = parsedArr[whereIndex + 9];
            let value2 = parsedArr[whereIndex + 11];
            let key3 = parsedArr[whereIndex + 13];
            let value3 = parsedArr[whereIndex + 15];
            for (let el of updateDatabase){
                if ((el[key1] !== value1) && (el[key2] === value2) && (el[key3] === value3)){
                    pointers.push(el);
                }
            }
        } else if (parsedArr.indexOf("BINARY") !== -1){
            // where binary ...
            let key = parsedArr[whereIndex + 2];
            let value = parsedArr[whereIndex + 4];
            for (let el of updateDatabase){
                if (el[key] === value){
                    pointers.push(el);
                }
            }
        } else if (parsedArr.indexOf("AND") !== -1){
            // where ... AND ...
            let key1 = parsedArr[whereIndex + 1];
            let value1 = parsedArr[whereIndex + 3];
            let key2 = parsedArr[whereIndex + 5];
            let value2 = parsedArr[whereIndex + 7];
            for (let el of updateDatabase){
                if ((el[key1] === value1) && (el[key2] === value2)){
                    pointers.push(el);
                }
            }
        } else {
            let key = parsedArr[whereIndex + 1];
            let value = parsedArr[whereIndex + 3];
            for (let el of updateDatabase){
                if (el[key] === value){
                    pointers.push(el);
                }
            }
        }

        // set clause
        let keys = [];
        let values = [];
        for (let i = setIndex + 1; i < whereIndex; i += 4){
            keys.push(parsedArr[i]);
            values.push(parsedArr[i+2]);
        }

        for (let el of pointers){
            for (let i = 0; i < keys.length; i++){
                if (typeof(el[keys[i]]) === 'number'){
                    el[keys[i]] = parseInt(values[i]);
                    continue;
                } 
                el[keys[i]] = values[i];
            }
        }
        
        //console.log(query, pointers);
        saveData(database, updateDatabase);
    }

    // end
    return [];
}