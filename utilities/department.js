'use strict';

const digit1 = {
    b: "",
    r: "Grad",
    d: "PhD",
    e: "",
    t: "",
    a: "Grad",
    c: "PhD",
    p: "Grad",
    j: "Grad",
    f: "PhD",
    q: "PhD",
    h: "",
    k: "",
    s: ""
};

const digit456 = {
    "101": "CHIN",
    "102": "FL",
    "103": "Hist",
    "104": "Phl",
    "105": "Anth",
    "106": "LIS",
    "107": "JpnL",
    "109": "Thea",
    "141": "ARHY",
    "142": "LING",
    "144": "Music",
    "145": "TwLit",
    "201": "MATH",
    "202": "Phys",
    "203": "Chem",
    "204": "Geo",
    "207": "Psy",
    "208": "Geog",
    "209": "AtmSci",
    "225": "ZOOl",
    "241": "Ocean",
    "244": "AsPhys",
    "245": "ApPhys",
    "302": "PS",
    "303": "ECON",
    "305": "Soc",
    "310": "SW",
    "341": "NtlDev",
    "342": "JOUR",
    "401": "Med",
    "402": "Dent",
    "403": "PHARM",
    "404": "CliLab",
    "406": "NURSE",
    "408": "PT",
    "409": "OT",
    "421": "ClinMD",
    "422": "CDent",
    "441": "Physio",
    "442": "BioMol",
    "443": "Phmco",
    "444": "Pathol",
    "445": "Microb",
    "446": "Anat",
    "447": "Tox",
    "448": "MolMed",
    "449": "Immuno",
    "450": "OraBio",
    "451": "CliPhm",
    "452": "ForMed",
    "453": "Onco",
    "456": "PTMP",
    "501": "CIE",
    "502": "ME",
    "504": "ChemE",
    "505": "ESOE",
    "507": "MSE",
    "528": "Biomed",
    "541": "EnvE",
    "543": "AM",
    "544": "BP",
    "546": "IE",
    "548": "Biomed",
    "549": "PSE",
    "601": "Agron",
    "602": "BSE",
    "603": "AC",
    "605": "Forest",
    "606": "AniSci",
    "607": "AGEC",
    "609": "VM",
    "610": "BICD",
    "612": "ENT",
    "613": "PPM",
    "641": "FOOD",
    "642": "Biot",
    "643": "VCS",
    "701": "BA",
    "702": "Acc",
    "703": "Fin",
    "704": "IB",
    "705": "IM",
    "740": "EMBA",
    "741": "MBA",
    "743": "EMBAE",
    "744": "EMBAA",
    "745": "EMBAF",
    "746": "EMBAG",
    "747": "EMBAI",
    "748": "EMBAB",
    "801": "PH",
    "841": "OMIH",
    "844": "EH",
    "847": "MPH",
    "848": "HPM",
    "849": "EPM",
    "901": "EE",
    "902": "CSIE",
    "941": "OE",
    "942": "CommE",
    "943": "EEE",
    "944": "NM",
    "945": "BEBI",
    "002": "PE",
    "004": "AdvEng",
    "A01": "LAW",
    "A41": "LawILS",
    "B01": "LS",
    "B02": "BST",
    "B42": "PlBio",
    "B43": "MCB",
    "B44": "EEB",
    "B45": "FishSc",
    "B46": "BChem",
    "B47": "MBC",
    "B48": "GenSys",
    "Q01": "Write",
    "108": "FL",
    "121": "CHIN",
    "122": "FL",
    "123": "Hist",
    "124": "Phl",
    "125": "Anth",
    "126": "LIS",
    "127": "JpnL",
    "129": "Thea",
    "221": "MATH",
    "222": "Phys",
    "223": "Chem",
    "224": "Geo",
    "227": "Psy",
    "228": "Geog",
    "229": "AtmSci",
    "246": "MATH",
    "250": "MATH",
    "322": "PS",
    "323": "ECON",
    "325": "Soc",
    "330": "SW",
    "343": "NtlDev",
    "412": "NURSE",
    "423": "PHARM",
    "424": "CliLab",
    "426": "NURSE",
    "428": "PT",
    "429": "OT",
    "454": "GiBMS",
    "455": "MedGenPro",
    "457": "MEBE",
    "458": "MDI",
    "508": "BME",
    "521": "CIE",
    "522": "ME",
    "524": "ChemE",
    "525": "ESOE",
    "527": "MSE",
    "604": "PPM",
    "608": "HORT",
    "611": "BIME",
    "621": "Agron",
    "622": "BSE",
    "623": "AC",
    "625": "Forest",
    "626": "AniSci",
    "627": "AGEC",
    "628": "HORT",
    "629": "VM",
    "630": "BICD",
    "631": "BIME",
    "632": "ENT",
    "633": "PPM",
    "644": "VM",
    "706": "BA",
    "722": "Acc",
    "723": "Fin",
    "724": "IB",
    "725": "IM",
    "742": "IM",
    "749": "GMBA",
    "750": "EMBA",
    "751": "EiMBA",
    "842": "EPM",
    "843": "CPH",
    "845": "HPM",
    "850": "HBCS",
    "851": "IFSH",
    "852": "EOHS",
    "921": "EE",
    "922": "CSIE",
    "A21": "LAW",
    "B21": "LS",
    "B22": "BST",
    "J10": "EE",
    "J11": "CSIE"
}

function getDepartment(id){
    let qualified = true;
    let department = "";

    if (id.length !== 9){
        qualified = false;
    }

    // digit 456
    let code = id.substring(3, 6).toUpperCase();
    if (digit456[code] === undefined){
        qualified = false;
    } else {
        department += digit456[code] + " ";
    }
    

    // digit 1
    if (digit1[id[0].toLowerCase()] === undefined){
        qualified = false;
    } else {
        department += digit1[id[0].toLowerCase()] + " ";
    }

    // digit 23
    let year = parseInt(id.substring(1, 3));
    if (year === NaN){
        qualified = false;
    } else {
        let date = new Date();
        let currYear = date.getFullYear();
        let currMonth = date.getMonth();
        if (currMonth >= 7){    // after August
            currYear += 1;
        }
        let grade = (currYear - 1911)%100 - year;
        department += grade;
    }
    department = department.replace("  ", " ");

    if (qualified){
        return department;
    } else {
        return false;
    }
};

module.exports.getDepartment = getDepartment;