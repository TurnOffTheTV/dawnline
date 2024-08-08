const synthCanvas = document.getElementById("synth-canvas");
const c = synthCanvas.getContext("2d");
var width;
var height;
var cx = 0;
var cy = 0;
var mouseX = 0;
var mouseY = 0;
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
	mouseX=e.offsetX;
	mouseY=e.offsetY;
	for(let i=0;i<currentPatch.modules.length;i++){
		currentPatch.modules[i].hover();
		currentPatch.modules[i].updateCursor();
	}
});

synthCanvas.addEventListener("mousedown",function(e){
	this.style.cursor="";
	mouseX=e.offsetX;
	mouseY=e.offsetY;
	for(let i=0;i<currentPatch.modules.length;i++){
		currentPatch.modules[i].click();
		currentPatch.modules[i].updateCursor();
	}
});

synthCanvas.addEventListener("mouseup",function(e){
	this.style.cursor="";
	mouseX=e.offsetX;
	mouseY=e.offsetY;
	for(let i=0;i<currentPatch.modules.length;i++){
		currentPatch.modules[i].unclick();
		currentPatch.modules[i].updateCursor();
	}
	selectedModule=undefined;
	draw();
});

setSize();

export class Module {
	id;
	type;
	node;
	context;
	x=0;
	y=0;
	ins=[];
	outs=[];
	constructor(context,type){
		this.context=context;
		this.x=(-cx/50)*50;
		this.y=(-cy/50)*50;
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
				this.ins=[new ConnectionPoint(this,0,25,false,true)];
			break;
			case 1:
				//wave generator
				this.waveType=0;
				this.frequency=261.626;
				this.node=new OscillatorNode(this.context,{type:"sine",frequency:this.frequency});
				this.ins=[new ConnectionPoint(this,0,25)];
				this.outs=[new ConnectionPoint(this,100,25,true,true)];
			break;
			case 4:
				this.value=0;
				this.outs=[new ConnectionPoint(this,100,25,true)];
			break;
		}
	}

	hover(){
		if(selectedModule===this){
			this.x=Math.round((mouseX-cx+selectOffsetX)/50)*50;
			this.y=Math.round((mouseY-cy+selectOffsetY)/50)*50;
		}
		for(let i=0;i<this.ins.length;i++){
			this.ins[i].hover();
		}
		for(let i=0;i<this.outs.length;i++){
			this.outs[i].hover();
		}
		if(selectedModule===this){
			draw();
		}
	}

	click(){
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
		for(let i=0;i<this.ins.length;i++){
			this.ins[i].click();
		}
		for(let i=0;i<this.outs.length;i++){
			this.outs[i].click();
		}
	}

	unclick(){
		for(let i=0;i<this.ins.length;i++){
			this.ins[i].unclick();
		}
		for(let i=0;i<this.outs.length;i++){
			this.outs[i].unclick();
		}
		if(selectedModule===this){
			selectedModule=undefined;
		}
	}

	updateCursor(){
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
		for(let i=0;i<this.ins.length;i++){
			this.ins[i].updateCursor();
		}
		for(let i=0;i<this.outs.length;i++){
			this.outs[i].updateCursor();
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
			break;
			case 1:
				c.fillStyle="rgb(24,77,38)";
				c.beginPath();
				c.roundRect(this.x,this.y,100,100,10);
				c.fill();
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
		}
		for(let i=0;i<this.ins.length;i++){
			this.ins[i].draw();
		}
		for(let i=0;i<this.outs.length;i++){
			this.outs[i].draw();
		}
	}
}

class ConnectionPoint {
	parent;
	offsetX;
	offsetY;
	out;
	audio;
	connection;
	constructor(parent,x,y,out,audio){
		this.parent=parent;
		this.offsetX=x;
		this.offsetY=y;
		this.out=out;
		this.audio=audio;
		this.hover();
	}

	hover(){
		this.x=this.parent.x+this.offsetX;
		this.y=this.parent.y+this.offsetY;
		if(selectedModule===this){
			for(var i=0;i<currentPatch.modules.length;i++){
				for(var j=0;j<currentPatch.modules[i].ins.length;j++){
					if(this.audio===currentPatch.modules[i].ins[j].audio && mouseX>currentPatch.modules[i].ins[j].x+cx-10 && mouseY>currentPatch.modules[i].ins[j].y+cy-5 && mouseX<currentPatch.modules[i].ins[j].x+cx && mouseY<currentPatch.modules[i].ins[j].y+cy+5){
						mouseX=currentPatch.modules[i].ins[j].x+cx+-2.5;
						mouseY=currentPatch.modules[i].ins[j].y+cy;
					}
				}
			}
			draw();
		}
	}

	updateCursor(){
		if(this.out && mouseX>this.x+cx && mouseY>this.y+cy-5 && mouseX<this.x+cx+10 && mouseY<this.y+cy+5){
			synthCanvas.style.cursor="crosshair";
		}
		if(this.connection && !this.out && mouseX>this.x+cx-10 && mouseY>this.y+cy-5 && mouseX<this.x+cx && mouseY<this.y+cy+5){
			synthCanvas.style.cursor="crosshair";
		}
		if(selectedModule===this){
			synthCanvas.style.cursor="crosshair";
		}
	}

	click(){
		if(this.out && mouseX>this.x+cx && mouseY>this.y+cy-5 && mouseX<this.x+cx+10 && mouseY<this.y+cy+5){
			selectedModule=this;
		}
		if(this.connection && !this.out && mouseX>this.x+cx-10 && mouseY>this.y+cy-5 && mouseX<this.x+cx && mouseY<this.y+cy+5){
			selectedModule=this.connection;
			this.connection.connection=undefined;
			this.connection=undefined;
		}
	}

	unclick(){
		if(selectedModule===this){
			for(var i=0;i<currentPatch.modules.length;i++){
				for(var j=0;j<currentPatch.modules[i].ins.length;j++){
					if(this.audio===currentPatch.modules[i].ins[j].audio && mouseX>currentPatch.modules[i].ins[j].x+cx-10 && mouseY>currentPatch.modules[i].ins[j].y+cy-5 && mouseX<currentPatch.modules[i].ins[j].x+cx && mouseY<currentPatch.modules[i].ins[j].y+cy+5){
						currentPatch.modules[i].ins[j].connection=this;
						this.connection=currentPatch.modules[i].ins[j];
						break;
					}
				}
			}
		}
	}

	draw(){
		if(this.out){
			if(this.audio){
				c.fillStyle="rgb(0,0,255)";
			}else{
				c.fillStyle="rgb(255,0,0)";
			}
			c.fillRect(this.x,this.y-2.5,5,5);
		}else{
			if(this.audio){
				c.fillStyle="rgb(0,0,255)";
			}else{
				c.fillStyle="rgb(255,0,0)";
			}
			c.fillRect(this.x-5,this.y-2.5,5,5);
		}
		if(selectedModule===this){
			c.lineWidth=5;
			if(this.audio){
				c.strokeStyle="rgb(0,0,255)";
			}else{
				c.strokeStyle="rgb(255,0,0)";
			}
			c.beginPath();
			if(this.out){
				c.moveTo(this.x+2.5,this.y);
			}else{
				c.moveTo(this.x-2.5,this.y)
			}
			c.lineTo(mouseX-cx,mouseY-cy);
			c.stroke();
		}
		if(this.connection && this.out){
			c.lineWidth=5;
			if(this.audio){
				c.strokeStyle="rgb(0,0,255)";
			}else{
				c.strokeStyle="rgb(255,0,0)";
			}
			c.beginPath();
			c.moveTo(this.x+2.5,this.y);
			c.lineTo(this.connection.x-2.5,this.connection.y);
			c.stroke();
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
		if(currentPatch){
			c.fillText(currentPatch.name,0,0);
			c.fillText(currentPatch.modules.length+" modules",0,15);
		}else{
			c.fillText("No patch loaded",0,0);
			c.fillText("0 modules",0,15);
		}
		c.fillText(cx+", "+cy,0,30);

		c.fillText(selectedModule,0,45);
	}
}