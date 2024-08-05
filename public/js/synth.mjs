const synthCanvas = document.getElementById("synth-canvas");
const c = synthCanvas.getContext("2d");
var width;
var height;
var loaded = false;

function setSize(){
	synthCanvas.width=synthCanvas.getBoundingClientRect().width;
	synthCanvas.height=synthCanvas.getBoundingClientRect().height;
	width=synthCanvas.width;
	height=synthCanvas.height;
	draw();
}

window.addEventListener("resize",setSize);

setSize();

export var currentPatch;

export function setCurrentPatch(patch){
	currentPatch=patch;
	draw();
}

export function load(){
	loaded=true;
	setSize();
}

export function unload(){
	loaded=false;
}

let rot = 0;
function draw(){
	c.font='50px "Fira Sans"';
	c.textAlign="center";
	c.textBaseline="middle";
	c.fillStyle="black";
	c.fillRect(0,0,width,height);
	c.fillStyle="white";
	if(currentPatch){
		c.fillText(currentPatch.name,width/2,height/2);
	}else{
		c.fillText("MODULAR SYNTH",width/2,height/2);
	}
}