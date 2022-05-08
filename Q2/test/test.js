const { expect } = require("chai");
const { ethers } = require("hardhat");
const fs = require("fs");
const { groth16, plonk } = require("snarkjs");

function unstringifyBigInts(o) {
    if ((typeof(o) == "string") && (/^[0-9]+$/.test(o) ))  {
        return BigInt(o);
    } else if ((typeof(o) == "string") && (/^0x[0-9a-fA-F]+$/.test(o) ))  {
        return BigInt(o);
    } else if (Array.isArray(o)) {
        return o.map(unstringifyBigInts);
    } else if (typeof o == "object") {
        if (o===null) return null;
        const res = {};
        const keys = Object.keys(o);
        keys.forEach( (k) => {
            res[k] = unstringifyBigInts(o[k]);
        });
        return res;
    } else {
        return o;
    }
}

describe("HelloWorld", function () {
    let Verifier;
    let verifier;

    beforeEach(async function () {
        Verifier = await ethers.getContractFactory("HelloWorldVerifier");
        verifier = await Verifier.deploy();
        await verifier.deployed();
    });

    it("Should return true for correct proof", async function () {
        //[assignment] Add comments to explain what each line is doing
        // For input a = 1 and b =2, the generated wasm and zkey is verified
        const { proof, publicSignals } = await groth16.fullProve({"a":"1","b":"2"}, "contracts/circuits/HelloWorld/HelloWorld_js/HelloWorld.wasm","contracts/circuits/HelloWorld/circuit_final.zkey");

        // Print the public signals. here only output is public, thus output is only printed
        console.log('1x2 =',publicSignals[0]);

        // Converting the string numbers into big integer to be supplied to contract parameters
        const editedPublicSignals = unstringifyBigInts(publicSignals);
        const editedProof = unstringifyBigInts(proof);
        // Get the call data from edited proof and edited public signal to supply as parameters to verify method in contract
        const calldata = await groth16.exportSolidityCallData(editedProof, editedPublicSignals);
    
        // Separating out the proof and input parameters from call data
        const argv = calldata.replace(/["[\]\s]/g, "").split(',').map(x => BigInt(x).toString());
    
        // Creating parameters to supply in the verifyProof method
        const a = [argv[0], argv[1]];
        const b = [[argv[2], argv[3]], [argv[4], argv[5]]];
        const c = [argv[6], argv[7]];
        const Input = argv.slice(8);

        // Call verify proof method using the above prepared parameters and assert it to be true
        expect(await verifier.verifyProof(a, b, c, Input)).to.be.true;
    });
    it("Should return false for invalid proof", async function () {
        let a = [0, 0];
        let b = [[0, 0], [0, 0]];
        let c = [0, 0];
        let d = [0]
        expect(await verifier.verifyProof(a, b, c, d)).to.be.false;
    });
});


describe("Multiplier3 with Groth16", function () {
    let Verifier;
    let verifier;

    beforeEach(async function () {
        //[assignment] insert your script here
        Verifier = await ethers.getContractFactory("Multiplier3Verifier");
        verifier = await Verifier.deploy();
        await verifier.deployed();
    });

    it("Should return true for correct proof", async function () {
        //[assignment] insert your script here
                // For input a = 3, b = 6 and c = 9, the generated wasm and zkey is verified
                const { proof, publicSignals } = await groth16.fullProve({"a":"3","b":"6","c":"9"}, "contracts/circuits/Multiplier3/Multiplier3_js/Multiplier3.wasm","contracts/circuits/Multiplier3/circuit_final.zkey");

                // Print the public signals. here only output is public, thus output is only printed
                console.log('3x6x9 =',publicSignals[0]);
        
                // Converting the string numbers into big integer to be supplied to contract parameters
                const editedPublicSignals = unstringifyBigInts(publicSignals);
                const editedProof = unstringifyBigInts(proof);

                // Get the call data from edited proof and edited public signal to supply as parameters to verify method in contract
                const calldata = await groth16.exportSolidityCallData(editedProof, editedPublicSignals);
            
                // Separating out the proof and input parameters from call data
                const argv = calldata.replace(/["[\]\s]/g, "").split(',').map(x => BigInt(x).toString());
            
                // Creating parameters to supply in the verifyProof method
                const a = [argv[0], argv[1]];
                const b = [[argv[2], argv[3]], [argv[4], argv[5]]];
                const c = [argv[6], argv[7]];
                const Input = argv.slice(8);
        
                // Call verify proof method using the above prepared parameters and assert it to be true
                expect(await verifier.verifyProof(a, b, c, Input)).to.be.true;
    });
    it("Should return false for invalid proof", async function () {
        //[assignment] insert your script here
        let a = [0, 0];
        let b = [[0, 0], [0, 0]];
        let c = [0, 0];
        let d = [0]
        expect(await verifier.verifyProof(a, b, c, d)).to.be.false;
    });
});


describe("Multiplier3 with PLONK", function () {
    let Verifier;
    let verifier;

    beforeEach(async function () {
        //[assignment] insert your script here
        Verifier = await ethers.getContractFactory("PlonkVerifier");
        verifier = await Verifier.deploy();
        await verifier.deployed();
    });

    it("Should return true for correct proof", async function () {
        //[assignment] insert your script here
                        // For input a = 3, b = 6 and c = 9, the generated wasm and zkey is verified
                        const { proof, publicSignals } = await plonk.fullProve({"a":"3","b":"6","c":"9"}, "contracts/circuits/Multiplier3_plonk/Multiplier3_js/Multiplier3.wasm","contracts/circuits/Multiplier3_plonk/circuit_final.zkey");

                        // Print the public signals. here only output is public, thus output is only printed
                        console.log('3x6x9 =',publicSignals[0]);
                
                        // Converting the string numbers into big integer to be supplied to contract parameters
                        const editedPublicSignals = unstringifyBigInts(publicSignals);
                        const editedProof = unstringifyBigInts(proof);
                        
                        // Get the call data from edited proof and edited public signal to supply as parameters to verify method in contract
                        const calldata = await plonk.exportSolidityCallData(editedProof, editedPublicSignals);
                    
                        // Separating out the proof and input parameters from call data
                        const argv = calldata.replace(/["[\]\s]/g, "").split(',');
                    
                        // Creating parameters to supply in the verifyProof method
                        const proofBytes = argv[0];
                        const Input = [argv[1].toString()];
                
                        // Call verify proof method using the above prepared parameters and assert it to be true
                        expect(await verifier.verifyProof(proofBytes, Input)).to.be.true;

    });
    it("Should return false for invalid proof", async function () {
        //[assignment] insert your script here
        let proof = 0x3a;
        let pubSignal = [0];

        expect(await verifier.verifyProof(proof, pubSignal)).to.be.false;
    });
});
