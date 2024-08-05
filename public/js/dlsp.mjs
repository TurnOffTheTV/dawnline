export function create(patch){
	//create buffer
	let bytes = new DataView(new ArrayBuffer(patch.name.length+9));
	let textEncoder = new TextEncoder();
	//add file identifier
	bytes.setUint8(0,68);//D
	bytes.setUint8(1,76);//L
	bytes.setUint8(2,83);//S
	bytes.setUint8(3,80);//P
	//set project name
	bytes.setUint8(4,patch.name.length);
	for(var i=0;i<patch.name.length;i++){
		bytes.setUint8(i+5,textEncoder.encode(patch.name)[i]);
	}
	for(var i=0;i<patch.id.length;i++){
		bytes.setUint8(i+patch.name.length+6,textEncoder.encode(patch.id)[i]);
	}
	return bytes;
}

export async function parse(blob){
	let patch = {
		name:"New Synth Patch",
		id:"00000"
	};
	let textDecoder = new TextDecoder();
	//turn file into buffer
	let bytes = new DataView(await blob.arrayBuffer());
	console.log(bytes);
	//check if it's a DLSP file
	if(textDecoder.decode(bytes).slice(0,4)!=="DLSP"){
		throw Error("Given file is not a proper DLSP file.");
	}
	try {
		//read patch name
		patch.name=textDecoder.decode(bytes).slice(5,bytes.getUint8(4)+5);
		//read id
		patch.id = textDecoder.decode(bytes).slice(bytes.getUint8(4)+5,bytes.getUint8(4)+10);
	} catch(err){
		throw Error("Given file is not a proper DLSP file.",{cause:err});
	}
	return {modules:[],patch:patch};
}

export let fileOpts = {
	types:[
		{accept:{"application/dlsp":[".dlsp"]}}
	],
	suggestedName:"New Synth Patch.dlsp"
};