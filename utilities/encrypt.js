const crypto = require("crypto");
const algorithm = 'aes-256-cbc'; 
const hexKey = "2a1777160df62fc9ad01bf7ae6f68f2ba37175231d58b1ecd9e2e09096a226f4";
const key = Buffer.from(hexKey, "hex");
const hexIv = "2d14203636d298f6a831dd4c474fd44e";
const iv = Buffer.from(hexIv, "hex");

function encrypt(input){
    const hash = crypto.createHash("sha256");
    return hash.update(input, "utf-8").digest("hex");
};

//Encrypting text
function encryptText(text) {
   let cipher = crypto.createCipheriv(algorithm, key, iv);
   let encrypted = cipher.update(text);
   encrypted = Buffer.concat([encrypted, cipher.final()]);
   return encrypted.toString('hex');
}

// Decrypting text
function decryptText(text) {
   let encryptedText = Buffer.from(text, 'hex');
   let decipher = crypto.createDecipheriv(algorithm, key, iv);
   let decrypted = decipher.update(encryptedText);
   decrypted = Buffer.concat([decrypted, decipher.final()]);
   return decrypted.toString();
}

module.exports.encrypt = encrypt;
module.exports.encryptText = encryptText;
module.exports.decryptText = decryptText;