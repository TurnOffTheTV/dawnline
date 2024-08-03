//editor.js
//script for editor

//import modules
import * as DLP from "./dlp.mjs"

//get settings
let settings = JSON.parse(localStorage.getItem("settings"));

if(!settings){
    settings={
        sampleRate:44100,
        debugMenu:false
    }
    localStorage.setItem("settings",JSON.stringify(settings));
}

//get elements
const button = {
    renameProject:document.getElementById("button-rename-project")
};
const input = {
    renameProject:document.getElementById("input-rename-project"),
    sampleRate:document.getElementById("input-sample-rate"),
    debugMenu:document.getElementById("input-debug-menu")
};
const windows = {
    renameProject:document.getElementById("window-rename-project"),
    unavailable:document.getElementById("window-unavailable"),
    about:document.getElementById("window-about"),
    programSettings:document.getElementById("window-program-settings")
};

const topbar = {
    el: document.getElementById("topbar"),
    logo: document.getElementById("topbar-logo"),
    file: document.getElementById("topbar-file"),
    edit: document.getElementById("topbar-edit"),
    view: document.getElementById("topbar-view"),
    debug: document.getElementById("topbar-debug")
};

const controlbar = {
    el: document.getElementById("controlbar"),
    play: document.getElementById("controlbar-play"),
    pause: document.getElementById("controlbar-pause")
};

const modulebar = {
    el: document.getElementById("modulebar"),
    generator: document.getElementById("modulebar-generator"),
    basics: document.getElementById("modulebar-basics")
};

const channelView = document.getElementById("channel-view");
const synthView = document.getElementById("synth-view");

const panMarker = document.getElementById("pan-marker");

const channelDeck = document.getElementById("channel-deck");

const windowBackground = document.getElementById("window-background");

const contextMenu = document.getElementById("context-menu");

//Web Audio context
const AudioContext = window.AudioContext || window.webkitAudioContext;
//const AudioContext = undefined;
if(!AudioContext){
    windowBackground.style.display="block";
    windows.unavailable.style.display="block";
}
var a = new AudioContext({sampleRate:settings.sampleRate});

//file management
var fileHandler;

//project
var project = {
    name: "New Project",
    sampleRate: a.sampleRate,
    channels: [],
    patches: []
};
var changed = false;

class Channel {
    pan=0;
    gain=0;
    buffers=[];
    constructor(){
        while(true){
            this.id=10000+Math.floor(Math.random()*90000);
            for(var i=0;i<project.channels.length;i++){
                if(project.channels[i].id===this.id){break;}
            }
            if(i===project.channels.length){
                break;
            }
        }

        this.name="channel-"+project.channels.length;

        this.element = document.createElement("div");
        this.element.className="channel";
        let channelInfoEl = document.createElement("div");
        channelInfoEl.className="channel-info-panel";
        channelInfoEl.innerHTML="<h4>"+this.name+"</h4>";
        this.panSlider = document.createElement("input");
        this.panSlider.className="pan-slider";
        this.panSlider.type="range";
        this.panSlider.value=0;
        this.panSlider.min=-1;
        this.panSlider.max=1;
        this.panSlider.step=0.01;
        this.panSlider.setAttribute("list",panMarker.id);
        this.panSlider.addEventListener("mousemove",function(e){
            this.pan=e.target.valueAsNumber;
            if(e.target.valueAsNumber<0.1 && e.target.valueAsNumber>-0.1){
                e.target.step=0.2;
            }else{
                e.target.step=0.01;
            }
        });
        channelInfoEl.appendChild(this.panSlider);
        let removeButton = document.createElement("div");
        removeButton.className="channel-delete";
        removeButton.onclick =function(){
            if(confirm("Do you really want to delete "+this.name)){
                for(let i=0;i<project.channels.length;i++){
                    if(project.channels[i].id===this.id){
                        this.element.remove();
                        project.channels.splice(i,1);
                        break;
                    }
                }
            }
        };
        channelInfoEl.appendChild(removeButton);
        this.element.appendChild(channelInfoEl);
        this.element.innerHTML+='<div style="color:var(--color-background-secondary);font-size:50px;text-align:center;line-height:150px;width:100%;height:150px">This channel is empty</div>'
        channelDeck.appendChild(this.element);
    }

    play(time){}
}

class SynthPatch {
    modules=[];
    constructor(){
        this.name="patch-"+project.patches.length;
    }
}

async function openFile(file){
    changed=true;
    //get info from DLP file
    let proj = await DLP.parse(file);
    project = proj.proj;
    document.title=project.name+" - Dawnline";

    if(project.sampleRate!==a.sampleRate){
        a = new AudioContext({sampleRate:project.sampleRate});
    }

    //set up channels
    channelDeck.innerHTML="";
    for(var i=0;i<proj.channels.length;i++){
        //TODO: add channels based on file data
    }
}

if(settings.debugMenu){
    input.debugMenu.checked=true;
    topbar.debug.style.display="block";
}

input.sampleRate.value=settings.sampleRate;

channelView.style.display="block";

//event listeners
window.addEventListener("click",function(e){
    if(!topbar.el.contains(e.target)){
        contextMenu.style.display="none";
    }
});
window.addEventListener("contextmenu",function(e){
    e.preventDefault();
});
window.addEventListener("beforeunload",function(e){
    if(changed){
        e.preventDefault();
    }
});
window.addEventListener("copy",function(e){
    console.log(e);
});

//clear windows when background pressed
windowBackground.addEventListener("click",function(e){
    if(windows.unavailable.style.display!=="block"){windowBackground.style.display="none";}
    windows.renameProject.style.display="none";
    windows.about.style.display="none";
    windows.programSettings.style.display="none";
})

//top bar buttons
topbar.el.addEventListener("mouseover",function(e){
    if(e.target===topbar.el){
        contextMenu.innerHTML="";
    }
});

topbar.logo.addEventListener("mouseover",function(){
    contextMenu.innerHTML="";
    let aboutItem = document.createElement("div");
    aboutItem.innerText="About";
    aboutItem.className="context-item";
    aboutItem.addEventListener("click",function(){
        windowBackground.style.display="block";
        windows.about.style.display="block";
    });
    contextMenu.appendChild(aboutItem);
    let manualItem = document.createElement("div");
    manualItem.innerText="Manual";
    manualItem.className="context-item";
    manualItem.addEventListener("click",function(){
        window.open("/manual","_blank");
    });
    contextMenu.appendChild(manualItem);
    contextMenu.style.left=topbar.logo.getBoundingClientRect().x;
    contextMenu.style.top=topbar.logo.getBoundingClientRect().bottom;
});
topbar.file.addEventListener("mouseover",function(){
    contextMenu.innerHTML="";
    let newItem = document.createElement("div");
    newItem.innerText="New";
    newItem.className="context-item";
    newItem.addEventListener("click",function(){
        fileHandler=undefined;
        changed=false;
        project={
            name: "New Project",
            sampleRate: settings.sampleRate,
            channels: [],
            patches: []
        };
        if(project.sampleRate!==a.sampleRate){
            a = new AudioContext({sampleRate:project.sampleRate});
        }
    });
    contextMenu.appendChild(newItem);
    
    let openItem = document.createElement("div");
    openItem.innerText="Open";
    openItem.className="context-item";
    openItem.addEventListener("click",function(){
        window.showOpenFilePicker(DLP.fileOpts).then(async function(res){
            res["0"].getFile().then(openFile);

            fileHandler = res["0"];
        });
    });
    contextMenu.appendChild(openItem);

    let saveItem = document.createElement("div");
    saveItem.innerText="Save";
    saveItem.className="context-item";
    saveItem.addEventListener("click",async function(){
        if(fileHandler){
            let fileWriter = await fileHandler.createWritable();
            fileWriter.write(DLP.create(project));
            fileWriter.close();
        }else{
            window.showSaveFilePicker(DLP.fileOpts).then(async function(res){
                fileHandler = res;
                let fileWriter = await fileHandler.createWritable();
                fileWriter.write(DLP.create(project));
                fileWriter.close();
            });
        }
    });
    contextMenu.appendChild(saveItem);

    let saveAsItem = document.createElement("div");
    saveAsItem.innerText="Save As";
    saveAsItem.className="context-item";
    saveAsItem.addEventListener("click",async function(){
        //ask where to save and reset file writer to there
        window.showSaveFilePicker(DLP.fileOpts).then(async function(res){
            fileHandler = res;
            let fileWriter = await fileHandler.createWritable();
            //DEBUG
            console.log(DLP.create(project));
            fileWriter.write(DLP.create(project));
            fileWriter.close();
            fileWriter = await fileWriter.getWriter();
        });
    });
    contextMenu.appendChild(saveAsItem);

    let renameItem = document.createElement("div");
    renameItem.innerText="Rename";
    renameItem.className="context-item";
    renameItem.addEventListener("click",function(){
        windowBackground.style.display="block";
        windows.renameProject.style.display="block";
        input.renameProject.value=project.name;
        input.renameProject.placeholder=project.name;
        input.renameProject.focus();
    });
    contextMenu.appendChild(renameItem);
    contextMenu.style.left=topbar.file.getBoundingClientRect().x;
    contextMenu.style.top=topbar.file.getBoundingClientRect().bottom;
});
topbar.edit.addEventListener("mouseover",function(){
    contextMenu.innerHTML="";
    let cutItem = document.createElement("div");
    cutItem.innerText="Cut";
    cutItem.className="context-item";
    cutItem.addEventListener("click",function(){});
    contextMenu.appendChild(cutItem);

    let copyItem = document.createElement("div");
    copyItem.innerText="Copy";
    copyItem.className="context-item";
    copyItem.addEventListener("click",function(){});
    contextMenu.appendChild(copyItem);

    let pasteItem = document.createElement("div");
    pasteItem.innerText="Paste";
    pasteItem.className="context-item";
    pasteItem.addEventListener("click",function(){});
    contextMenu.appendChild(pasteItem);

    if(channelView.style.display==="block"){
        let newChannelItem = document.createElement("div");
        newChannelItem.innerText="New Channel";
        newChannelItem.className="context-item";
        newChannelItem.addEventListener("click",function(){
            project.channels.push(new Channel());
        });
        contextMenu.appendChild(newChannelItem);
    }

    if(synthView.style.display==="block"){
        let newSynthItem = document.createElement("div");
        newSynthItem.innerText="New Synth Patch";
        newSynthItem.className="context-item";
        newSynthItem.addEventListener("click",function(){
            project.patches.push(new SynthPatch());
        });
        contextMenu.appendChild(newSynthItem);
    }

    contextMenu.style.left=topbar.edit.getBoundingClientRect().x;
    contextMenu.style.top=topbar.edit.getBoundingClientRect().bottom;
});
topbar.view.addEventListener("mouseover",function(){
    contextMenu.innerHTML="";
    let settingsItem = document.createElement("div");
    settingsItem.innerText="Settings";
    settingsItem.className="context-item";
    settingsItem.addEventListener("click",function(){
        windowBackground.style.display="block";
        windows.programSettings.style.display="block";
    });
    contextMenu.appendChild(settingsItem);

    if(channelView.style.display!=="block"){
        let channelItem = document.createElement("div");
        channelItem.innerText="Channel View";
        channelItem.className="context-item";
        channelItem.addEventListener("click",function(){
            channelView.style.display="block";
            synthView.style.display="none";
        });
        contextMenu.appendChild(channelItem);
    }
    if(synthView.style.display!=="block"){
        let synthItem = document.createElement("div");
        synthItem.innerText="Synth View";
        synthItem.className="context-item";
        synthItem.addEventListener("click",function(){
            synthView.style.display="block";
            channelView.style.display="none";
        });
        contextMenu.appendChild(synthItem);
    }

    contextMenu.style.left=topbar.view.getBoundingClientRect().x;
    contextMenu.style.top=topbar.view.getBoundingClientRect().bottom;
});
topbar.debug.addEventListener("mouseover",function(){
    contextMenu.innerHTML="";
    let changeItem = document.createElement("div");
    changeItem.innerText="Change File";
    changeItem.className="context-item";
    changeItem.addEventListener("click",function(){
        changed=true;
    });
    contextMenu.appendChild(changeItem);

    let logProjItem = document.createElement("div");
    logProjItem.innerText="Log Project Var to Console";
    logProjItem.className="context-item";
    logProjItem.addEventListener("click",function(){
        console.log(project);
    });
    contextMenu.appendChild(logProjItem);
    contextMenu.style.left=topbar.debug.getBoundingClientRect().x;
    contextMenu.style.top=topbar.debug.getBoundingClientRect().bottom;
});

topbar.logo.addEventListener("click",function(){
    if(contextMenu.style.display==="none"){
        contextMenu.style.display="block";
    }else{
        contextMenu.style.display="none";
    }
});
topbar.file.addEventListener("click",function(){
    if(contextMenu.style.display==="none"){
        contextMenu.style.display="block";
    }else{
        contextMenu.style.display="none";
    }
});
topbar.edit.addEventListener("click",function(){
    if(contextMenu.style.display==="none"){
        contextMenu.style.display="block";
    }else{
        contextMenu.style.display="none";
    }
});
topbar.view.addEventListener("click",function(){
    if(contextMenu.style.display==="none"){
        contextMenu.style.display="block";
    }else{
        contextMenu.style.display="none";
    }
});
topbar.debug.addEventListener("click",function(){
    if(contextMenu.style.display==="none"){
        contextMenu.style.display="block";
    }else{
        contextMenu.style.display="none";
    }
});

//control bar buttons
controlbar.play.addEventListener("click",function(){
    controlbar.play.style.display="none";
    controlbar.pause.style.display="block";
});
controlbar.pause.addEventListener("click",function(){
    controlbar.pause.style.display="none";
    controlbar.play.style.display="block";
});

input.sampleRate.addEventListener("change",function(e){
    settings.sampleRate=e.target.value;
    localStorage.setItem("settings",JSON.stringify(settings));
});

input.debugMenu.addEventListener("change",function(e){
    settings.debugMenu=e.target.checked;
    localStorage.setItem("settings",JSON.stringify(settings));
    if(settings.debugMenu){
        topbar.debug.style.display="block";
    }else{
        topbar.debug.style.display="none";
    }
});

button.renameProject.addEventListener("click",function(){
    if(input.renameProject.value!==""){
        project.name=input.renameProject.value;
        document.title=input.renameProject.value+" - Dawnline";
    }
    windowBackground.style.display="none";
    windows.renameProject.style.display="none";
})

if(window.launchQueue){
    window.launchQueue.setConsumer(function(data){
        fileHandler=data.files[0];
        data.files[0].getFile().then(openFile);
    });
}