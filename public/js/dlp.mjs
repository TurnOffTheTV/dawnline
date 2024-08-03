export function create(proj){
    //create buffer
    let bytes = new DataView(new ArrayBuffer(proj.name.length+10));
    let textEncoder = new TextEncoder();
    //add file identifier
    bytes.setUint8(0,68);//D
    bytes.setUint8(1,76);//L
    bytes.setUint8(2,80);//P
    //set project name
    bytes.setUint8(3,proj.name.length);
    for(var i=0;i<proj.name.length;i++){
        bytes.setUint8(i+4,textEncoder.encode(proj.name)[i]);
    }
    //set sample rate
    bytes.setUint32(proj.name.length+4,proj.sampleRate);
    //set channel count
    bytes.setUint16(proj.name.length+8,proj.channels.length);
    //TODO: insert channel and audio data
    return bytes;
}

export async function parse(blob){
    let proj = {
        name:"New Project",
        sampleRate:44100,
        channels:[],
        patches:[]
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
        proj.name=textDecoder.decode(bytes).slice(4,bytes.getUint8(3)+4);
        //read sample rate
        proj.sampleRate = bytes.getUint32(bytes.getUint8(3)+4);
        //get number of channels
        let numChannels = bytes.getUint16(bytes.getUint8(3)+8);
        //TODO: get channel and audio data
    } catch(err){
        throw Error("Given file is not a proper DLP file.",{cause:err});
    }
    return {channels:[],proj:proj};
}

export let fileOpts = {
    types:[
        {accept:{"application/dlp":[".dlp"]}}
    ],
    suggestedName:"New Project.dlp"
};