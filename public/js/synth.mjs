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

synthCanvas.addEventListener("mousemove",function(e){
	this.style.cursor="";
	for(let i=0;i<currentPatch.modules.length;i++){
		currentPatch.modules[i].hover(e.offsetX,e.offsetY);
		currentPatch.modules[i].updateCursor(e.offsetX,e.offsetY);
	}
});

synthCanvas.addEventListener("mousedown",function(e){
	this.style.cursor="";
	for(let i=0;i<currentPatch.modules.length;i++){
		currentPatch.modules[i].click(e.offsetX,e.offsetY);
		currentPatch.modules[i].updateCursor(e.offsetX,e.offsetY);
	}
});

synthCanvas.addEventListener("mouseup",function(e){
	this.style.cursor="";
	selectedModule=undefined;
	for(let i=0;i<currentPatch.modules.length;i++){
		currentPatch.modules[i].updateCursor(e.offsetX,e.offsetY);
	}
});

setSize();

export class Module {
	id;
	type;
	node;
	context;
	x=0;
	y=0;
	constructor(context,type){
		this.context=context;
		while(true){
			this.id=10000+Math.floor(Math.random()*90000);
			for(var i=0;i<currentPatch.modules.length;i++){
				if(currentPatch.modules[i].id===this.id){break;}
			}
			if(i===currentPatch.modules.length){
				break;
			}
		}
		this.type=type;
		switch(this.type){
			case 0:
				//mono output
				this.node=this.context.destination;
			break;
			case 1:
				//wave generator
				this.waveType=0;
				this.frequency=261.626;
				this.node=new OscillatorNode(this.context,{type:"sine",frequency:this.frequency});
			break;
			case 4:
				this.value=0;
			break;
		}
	}

	hover(mouseX,mouseY){
		if(selectedModule===this){
			this.x=Math.round((mouseX-cx+selectOffsetX)/50)*50;
			this.y=Math.round((mouseY-cy+selectOffsetY)/50)*50;
			draw();
		}
	}

	click(mouseX,mouseY){
		switch(this.type){
			case 0:
				if(mouseX>this.x+cx && mouseY>this.y+cy && mouseX<this.x+cx+50 && mouseY<this.y+cy+50){
					selectedModule=this;
					selectOffsetX=(this.x+cx)-mouseX;
					selectOffsetY=(this.y+cy)-mouseY;
				}
			break;
			case 1:
				if(mouseX>this.x+cx && mouseY>this.y+cy && mouseX<this.x+cx+100 && mouseY<this.y+cy+100){
					selectedModule=this;
					selectOffsetX=(this.x+cx)-mouseX;
					selectOffsetY=(this.y+cy)-mouseY;
				}
			break;
			case 4:
				if(mouseX>this.x+cx+5 && mouseY>this.y+cy+15 && mouseX<this.x+cx+95 && mouseY<this.y+cy+35){
					let newValue=prompt("What do you want the new value to be?");
					if(newValue!=null){this.value=newValue}
					draw();
				}else if(mouseX>this.x+cx && mouseY>this.y+cy && mouseX<this.x+cx+100 && mouseY<this.y+cy+50){
					selectedModule=this;
					selectOffsetX=(this.x+cx)-mouseX;
					selectOffsetY=(this.y+cy)-mouseY;
				}
			break;
		}
	}

	updateCursor(mouseX,mouseY){
		switch(this.type){
			case 0:
				if(mouseX>this.x+cx && mouseY>this.y+cy && mouseX<this.x+cx+50 && mouseY<this.y+cy+50){
					synthCanvas.style.cursor="grab";
				}
			break;
			case 1:
				if(mouseX>this.x+cx && mouseY>this.y+cy && mouseX<this.x+cx+100 && mouseY<this.y+cy+100){
					synthCanvas.style.cursor="grab";
				}
			break;
			case 4:
				if(mouseX>this.x+cx+5 && mouseY>this.y+cy+15 && mouseX<this.x+cx+95 && mouseY<this.y+cy+35){
					synthCanvas.style.cursor="text";
				}else if(mouseX>this.x+cx && mouseY>this.y+cy && mouseX<this.x+cx+100 && mouseY<this.y+cy+50){
					synthCanvas.style.cursor="grab";
				}
			break;
		}
		if(selectedModule===this){
			synthCanvas.style.cursor="grabbing";
		}
	}

	draw(index){
		switch(this.type){
			case 0:
				c.fillStyle="rgb(50,50,50)";
				c.beginPath();
				c.roundRect(this.x,this.y,50,50,10);
				c.fill();
				c.fillStyle="white";
				c.font='20px "Fira Sans"';
				c.textAlign="center";
				c.textBaseline="middle";
				c.fillText("Out",this.x+25,this.y+25);
				c.fillStyle="rgb(0,0,255)";
				c.fillRect(this.x-5,this.y+22.5,5,5);
			break;
			case 1:
				c.fillStyle="rgb(24,77,38)";
				c.beginPath();
				c.roundRect(this.x,this.y,100,100,10);
				c.fill();
				c.fillStyle="rgb(255,0,0)";
				c.fillRect(this.x-5,this.y+22.5,5,5);
				c.fillStyle="rgb(0,0,255)";
				c.fillRect(this.x+100,this.y+22.5,5,5);
			break;
			case 4:
				c.fillStyle="rgb(66,43,37)";
				c.beginPath();
				c.roundRect(this.x,this.y,100,50,10);
				c.fill();
				c.fillStyle="rgb(25,25,25)";
				c.fillRect(this.x+5,this.y+15,90,20);
				c.fillStyle="white";
				c.font='20px "Fira Sans"';
				c.textAlign="center";
				c.textBaseline="middle";
				c.fillText(this.value,this.x+50,this.y+25);
				c.fillStyle="rgb(255,0,0)";
				c.fillRect(this.x+100,this.y+22.5,5,5);
		}
	}
}

export var currentPatch;

var selectedModule;

var selectOffsetX = 0;
var selectOffsetY = 0;

var debugMode = false;
export function setDebugMode(mode){
	debugMode=mode;
}

export function setCurrentPatch(patch){
	currentPatch=patch;
	cx=0;
	cy=0;
	draw();
}

export function setSelectedModule(module){
	selectedModule=module;
}

export function load(){
	loaded=true;
	setSize();
}

export function unload(){
	loaded=false;
}

let rot = 0;
export function draw(){
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

	if(currentPatch){
		for(let i=0;i<currentPatch.modules.length;i++){
			currentPatch.modules[i].draw(i);
		}
	}

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
			c.fillText(currentPatch.modules.length+" modules",0,15);
		}else{
			c.fillText("No patch loaded",0,0);
			c.fillText("0 modules",0,15);
		}
		c.fillText(cx+", "+cy,0,30);
	}
}