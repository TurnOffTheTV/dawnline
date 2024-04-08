//dlp.js
//create and parse Dawnline project files (dlp for DawnLine Project)

function createDlp(projObj){
    //create buffer
    let bytes = new DataView(new ArrayBuffer(projObj.name.length+3));
    //set project name
    bytes.setUint8(0,projObj.name);
    bytes.setUint16(projObj.name.length,projObj.channels);
    return bytes;
}

async function parseDlp(blob){
    let projObj = {
        name:"New Project",
        channels:[]
    };
    let textDecoder = new TextDecoder();
    //turn file into buffer
    let bytes = new DataView(await blob.arrayBuffer());
    //read project name
    projObj.name=textDecoder.decode(bytes).slice(1,bytes.getUint8(0)+1);
    //get number of channels
    let numChannels = bytes.getUint16(bytes.getUint8(0)+1);
    return projObj;
}