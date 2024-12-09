const utils = require("ethereumjs-util");
const { ethers, recoverAddress, hashMessage } = require("ethers");

exports.verifyEthSign = (walletAddress, sign, result = {}) => {
  try {
    r = utils.toBuffer(sign.slice(0, 66));
    s = utils.toBuffer("0x" + sign.slice(66, 130));
    v = utils.toBuffer("0x" + sign.slice(130, 132));

    const m = Buffer.from(walletAddress);
    console.log("M:::", m);
    const prefix = Buffer.from("\x19Ethereum Signed Message:\n");
    console.log("prefix:::", prefix);
    const prefixedMsg = utils.keccak256(
      Buffer.concat([prefix, Buffer.from(String(m.length)), m])
    );
    console.log("prefixedMsg:::", prefixedMsg);
    pub = utils.ecrecover(prefixedMsg, v, r, s);
    // console.log("pub::::", pub);
    adr = "0x" + utils.pubToAddress(pub).toString("hex");
    console.log("adr:::", adr);
    result = adr.toLowerCase() == walletAddress.toLowerCase();
    console.log("RESUKLT", result);

    // const verifySigner = ethers.utils.recoverAddress(
    //   hashMessage(walletAddress),
    //   sign
    // );
    // console.log(verifySigner, "verifySigner");
    // return verifySigner;
  } catch (ex) {
    result = false;
  } finally {
    return result;
  }
};

// const utils = require("ethereumjs-util");
// const { ethers } = require("ethers");

// exports.verifyEthSign = (walletAddress, sign, result = {}) => {
//   try {
//     console.log(walletAddress, "WALLEtADDRES IN UTLxs");

//     // r = utils.toBuffer(sign.slice(0, 66));
//     // s = utils.toBuffer("0x" + sign.slice(66, 130));
//     // v = utils.toBuffer("0x" + sign.slice(130, 132));
//     // console.log("R::", r, "S::", s, "V:::", v);
//     // const m = Buffer.from(walletAddress);
//     // console.log("M:", m);
//     // const prefix = Buffer.from("\x19Ethereum Signed Message:\n");
//     // console.log("prefix::", prefix);
//     // const prefixedMsg = utils.keccak256(
//     //   Buffer.concat([prefix, Buffer.from(String(m.length)), m])
//     // );
//     // console.log("prefixedMsg==>", prefixedMsg);
//     // pub = utils.ecrecover(prefixedMsg, v, r, s);
//     // console.log("pub:::", pub);
//     // adr = "0x" + utils.pubToAddress(pub).toString("hex");
//     // console.log("adr:::", adr);
//     // result = adr.toLowerCase() == walletAddress.toLowerCase();

//     messageBytes = ethers.utils.solidityKeccak256(
//       "Sign this message to verify ownership of the wallet." + walletAddress
//     );

//     const result = ethers.utils.verifyMessage(messageBytes, sign);

//     console.log("RESULT", result);
//   } catch (ex) {
//     result = false;
//   } finally {
//     return result;
//   }
// };

// exports.verifyEthSign = (walletAddress, sign) => {
//   try {
//     // Parse the signature into r, s, v
//     const r = utils.toBuffer(sign.slice(0, 66));
//     const s = utils.toBuffer("0x" + sign.slice(66, 130));
//     const v = utils.toBuffer("0x" + sign.slice(130, 132));

//     // Create the message to verify based on the wallet address
//     const m = Buffer.from(walletAddress);
//     const prefix = Buffer.from("\x19Ethereum Signed Message:\n");
//     const prefixedMsg = utils.keccak256(
//       Buffer.concat([prefix, Buffer.from(String(m.length)), m])
//     );

//     // Recover the public key from the signature
//     const pub = utils.ecrecover(prefixedMsg, v, r, s);
//     const adr = "0x" + utils.pubToAddress(pub).toString("hex");

//     // Return true if the recovered address matches the wallet address
//     return adr.toLowerCase() === walletAddress.toLowerCase();
//   } catch (ex) {
//     console.error("Error during signature verification:", ex);
//     return false;
//   }
// };

// exports.verifyEthSign = (walletAddress, sign, result = {}) => {
//   try {
//     // const walletAddress = "0x13a73458afcffc8d1789e97fcbd86b9e0edba2fa";
//     // const sign =
//     //   "0xa7be43c4dc60967bb88fb171e22e5b1daa11e7fa8b0952df13878bae08284b483e6b29b660f22a7c4aa3d6d2a0e8758cd1b27e9db612dc3539aa811ba1f98bde1b"; // The signed message

//     const signatureDataTypes = ["address"];
//     const signatureData = [walletAddress];

//     const rr = ethers.solidityPackedKeccak256(
//       signatureDataTypes,
//       signatureData
//     );

//     const bytesMessage = ethers.getBytes(rr);
//     const recoveredAddress = ethers.utils.verifyMessage(bytesMessage, sign);

//     console.log("messageHash address:", message, messageHash);
//     // Use ethers.js to verify the signature
//     // const recoveredAddress = ethers.utils.verifyMessage(messageHash, sign);

//     console.log("recoveredAddress address:111", recoveredAddress);

//     // Compare the recovered address with the provided wallet address
//     if (recoveredAddress.toLowerCase() === walletAddress.toLowerCase()) {
//       console.log("Signature is valid.");
//       result = true;
//     } else {
//       console.log("Signature is invalid.");
//       result = false;
//     }
//   } catch (ex) {
//     console.error("Error verifying signature:", ex);
//     result = false;
//   } finally {
//     return result;
//   }
// };
