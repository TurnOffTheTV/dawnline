const synthCanvas = document.getElementById("synth-canvas");
const c = synthCanvas.getContext("2d");
var width;
var height;
var cx = 0;
var cy = 0;
var cs = 1;
var loaded = false;

function setSize(){
	synthCanvas.width=synthCanvas.getBoundingClientRect().width;
	synthCanvas.height=synthCanvas.getBoundingClientRect().height;
	width=synthCanvas.width;
	height=synthCanvas.height;
	draw();
}

window.addEventListener("resize",setSize);

synthCanvas.addEventListener("wheel",function(e){
	cx-=e.deltaX;
	cy-=e.deltaY;
	cs+=e.deltaZ;
	draw();
	e.preventDefault();
});

setSize();

export var currentPatch;

var modules = [];

class Module {
	constructor(type,id){
		this.type=type;
		this.id=id;
	}

	draw(){}
}

var debugMode = false;
export function setDebugMode(mode){
	debugMode=mode;
}

export function setCurrentPatch(patch){
	currentPatch=patch;
	modules=[];
	cx=0;
	cy=0;
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
	c.resetTransform();
	c.clearRect(0,0,width,height);
	c.fillStyle="rgb(50,50,50)";
	for(let i=0;i<width/50;i++){
		for(let j=0;j<height/50;j++){
			c.beginPath();
			c.ellipse(cx%50+i*50,cy%50+j*50,1,1,0,0,Math.PI*2);
			c.fill();
		}
	}
	c.translate(cx,cy);

	if(debugMode){
		c.resetTransform();
		c.font='15px "Fira Sans"';
		c.textAlign="left";
		c.textBaseline="top";
		c.fillStyle="white";
		c.beginPath();
		c.ellipse(cx,cy,10,10,0,0,Math.PI*2);
		c.fill();
		if(currentPatch){
			c.fillText(currentPatch.name,0,0);
		}else{
			c.fillText("No patch loaded",0,0);
		}

		c.fillText(modules.length+" modules",0,15);
		c.fillText(cx+", "+cy,0,30);
	}
}