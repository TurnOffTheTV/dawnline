const synthDiv = document.getElementById("synth-overlay");
//set up canvas element and context
const synthCanvas = document.createElement("canvas");
synthCanvas.style="width:100%;height:100%;margin:0px;border:0px;outline:0px;";
synthDiv.appendChild(synthCanvas);
const sc = synthCanvas.getContext("2d");

//input/output types:
//0 - single audio channel
//1 - multichannel audio mix
//2 - analog control
//3 - digital control

var modules = [];

//possible connection
class Port {
    constructor(type,name){
        this.type=type;
        this.name=name;
        this.connection=false;
    }
}

//established connection
class Connection {
    constructor(inputModule,inputIndex,outputModule,outputIndex){
        this.inputModule=inputModule;
        this.inputIndex=inputIndex;
        this.outputModule=outputModule;
        this.outputIndex=outputIndex;
    }
}

//basic synth module
class SynthModule {
    constructor(x,y,type,node){
        this.x=x;
        this.y=y;
        this.type=type;
        this.node=node;
    }
}

//audio output module
class Output extends SynthModule {
    constructor(x,y){
        super(x,y,0,undefined);
        this.inputs=[new Port(1,"Audio Out")];
        this.outputs=[];
    }
}

//oscillator module
class Oscillator extends SynthModule {
    constructor(x,y){
        super(x,y,1,new OscillatorNode(audioCtx));
        this.inputs=[new Port(1,"Frequency Change")];
        this.outputs=[new Port(0,"Tone")];
    }
}

//callback for returnAnimationFrame
function draw(){
    //background
    if(isDark()){sc.fillStyle="rgb(50,50,50)";}else{sc.fillStyle="white";}
    sc.fillRect(0,0,synthCanvas.width,synthCanvas.height);

    //animate next frame
    requestAnimationFrame(draw);
}

//animate the canvas
requestAnimationFrame(draw);