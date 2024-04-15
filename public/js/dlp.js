//dlp.js
//create and parse Dawnline project files (dlp for DawnLine Project)

function createDlp(projObj){
    //DEBUG
    console.dir(projObj);
    //create buffer
    let bytes = new DataView(new ArrayBuffer(projObj.name.length+3));
    let textEncoder = new TextEncoder();
    //set project name
    bytes.setUint8(0,projObj.name.length);
    for(var i=0;i<projObj.name.length;i++){
        bytes.setUint8(i+1,textEncoder.encode(projObj.name)[i]);
    }
    //set channel count
    bytes.setUint16(projObj.name.length+1,projObj.channels.length);
    //TODO: insert channel and audio data
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
    console.log(bytes);
    //read project name
    projObj.name=textDecoder.decode(bytes).slice(1,bytes.getUint8(0)+1);
    //get number of channels
    let numChannels = bytes.getUint16(bytes.getUint8(0)+1);
    //TODO: get channel and audio data
    return projObj;
}