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
}

window.addEventListener("resize",setSize);

setSize();

export var currentPatch;

export function setCurrentPatch(patch){
	currentPatch=patch;
}

export function load(){
	loaded=true;
	setSize();
	draw();
}

export function unload(){
	loaded=false;
}

let rot = 0;
function draw(){
	rot+=0.03;
	c.resetTransform();
	c.font='50px "Fira Sans"';
	c.textAlign="center";
	c.textBaseline="middle";
	c.fillStyle="black";
	c.fillRect(0,0,width,height);
	c.translate(width/2,height/2);
	c.rotate(rot);
	c.fillStyle="white";
	c.fillText("MODULAR SYNTH",0,0);
	if(loaded){requestAnimationFrame(draw);}
}

draw();