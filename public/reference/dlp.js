//dlp.js
//create and parse Dawnline project files and Dawnline synth patch files

function createDlp(projObj){
    //DEBUG
    console.dir(projObj);
    //create buffer
    let bytes = new DataView(new ArrayBuffer(projObj.name.length+6));
    let textEncoder = new TextEncoder();
    //add file identifier
    bytes.setUint8(0,68);//D
    bytes.setUint8(1,76);//L
    bytes.setUint8(2,80);//P
    //set project name
    bytes.setUint8(3,projObj.name.length);
    for(var i=0;i<projObj.name.length;i++){
        bytes.setUint8(i+4,textEncoder.encode(projObj.name)[i]);
    }
    //set channel count
    bytes.setUint16(projObj.name.length+4,projObj.channels.length);
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
    //check if it's a DLP file
    if(textDecoder.decode(bytes).slice(0,3)!=="DLP"){
        throw Error("Given file is not a proper DLP file.");
    }
    try {
        //read project name
        projObj.name=textDecoder.decode(bytes).slice(4,bytes.getUint8(3)+4);
        //get number of channels
        let numChannels = bytes.getUint16(bytes.getUint8(0)+4);
    } catch(err){
        throw Error("Given file is not a proper DLP file.",{cause:err});
    }
    //TODO: get channel and audio data
    return projObj;
}

function createDlsp(synthObj){
    //DEBUG
    console.dir(synthObj);
    //create buffer
    let bytes = new DataView(new ArrayBuffer(synthObj.name.length+7));
    let textEncoder = new TextEncoder();
    //add file identifier
    bytes.setUint8(0,68);//D
    bytes.setUint8(1,76);//L
    bytes.setUint8(1,53);//S
    bytes.setUint8(2,80);//P
    //set patch name
    bytes.setUint8(4,synthObj.name.length);
    for(var i=0;i<synthObj.name.length;i++){
        bytes.setUint8(i+5,textEncoder.encode(projObj.name)[i]);
    }
    //set module count
    bytes.setUint16(synthObj.name.length+5,synthObj.modules.length);
    //TODO: insert module data
    return bytes;
}

async function parseDlsp(blob){
    let synthObj = {
        name:"New Project",
        modules:[]
    };
    let textDecoder = new TextDecoder();
    //turn file into buffer
    let bytes = new DataView(await blob.arrayBuffer());
    console.log(bytes);
    //check if it's a DLSP file
    if(textDecoder.decode(bytes).slice(0,4)!=="DLSP"){
        throw Error("Given file is not a proper DLSP file.");
    }
}