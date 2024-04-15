//editor.js
//Main editor code

//get all the elements
const dawnlineLogo = document.getElementById("dawnline-logo");
const button = {
    logo:document.getElementById("button-logo"),
    file:document.getElementById("button-file"),
    edit:document.getElementById("button-edit"),
    view:document.getElementById("button-view"),
    synth:document.getElementById("button-synth"),
    rename:document.getElementById("button-rename"),
    renameSynth:document.getElementById("button-renamesynth")
};
const fadeBackground = document.getElementById("fade-background");
const menu = document.getElementById("menu");
const channelDeck = document.getElementById("channel-deck");
const aboutWindow = document.getElementById("window-about");
const renameWindow = document.getElementById("window-rename");
const addModuleWindow = document.getElementById("window-addmodule");
const renameSynthWindow = document.getElementById("window-renamesynth");

//get Web Audio context
const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioContext({sampleRate:44100});
const analyser = audioCtx.createAnalyser();

addEventListener("click",button.rename.focus,{once:true});

//variables for project content
var projectInfo = {
    name: "New Project"
};
//variables for synth patch content
var patchInfo = {
    name: "New Synth Patch"
};
//list of channels
var channels = [];
//list of patches
var patches = [];
//wether there are any changes
var changed = false;
//for file handling
var fileHandler;

//channel class for above array
class Channel {
    constructor(index){
        //give channel a unique 5-digit id
        while(true){
            this.id=10000+Math.floor(Math.random()*90000);
            for(var i=0;i<channels.length;i++){
            }
            if(i===channels.length){
                break;
            }
        }

        //set default name
        this.name="channel-"+index;
        //set up audio output
        this.audio=new AudioBuffer({length:1,sampleRate:44100});
        this.track=new AudioBufferSourceNode(audioCtx,{buffer:this.audio});
        this.panner=new StereoPannerNode(audioCtx,{pan:this.pan});
        this.track.connect(this.panner).connect(audioCtx.destination);

        //add channel element
        this.el=document.createElement("div");
        this.el.className="channel";
        this.el.id="channel-"+this.id;

        //add box for channel controls
        let infoBox = document.createElement("div");
        infoBox.className="channel-infobox";
        infoBox.innerHTML="<h4>"+this.name+"</h4>";
        this.el.appendChild(infoBox);

        //add panning slider
        this.panInput = document.createElement("input");
        this.panInput.type="range";
        this.panInput.value=0;
        this.panInput.min=-1;
        this.panInput.max=1;
        this.panInput.step=0.01;
        this.panInput.addEventListener("mousemove",function(e){
            //set panner amount when changed
            channels.find(function(el){
                return el.id == e.target.parentElement.parentElement.id.split("-")[1];
            }).panner.pan.value=e.target.valueAsNumber;
            //snap to 0
            if(e.target.valueAsNumber<0.1 && e.target.valueAsNumber>-0.1){
                e.target.step=0.2;
            }else{
                e.target.step=0.01;
            }
        });
        infoBox.appendChild(this.panInput);

        //add remove button
        let removeButton = document.createElement("div");
        removeButton.innerHTML='<img src="/images/remove.svg" width=10>';
        removeButton.className="channel-remove";
        removeButton.addEventListener("click",function(e){
            
            let channel = channels.find(function(el){
                return el.id == e.target.parentElement.parentElement.parentElement.id.split("-")[1];
            });
            if(confirm("Do you really want to delete "+channel.name+"?")){
                channel.remove();
            }
        });
        infoBox.appendChild(removeButton);

        //add canvas for audio wave
        let waveCanvas = document.createElement("canvas");
        this.el.appendChild(waveCanvas);
        this.waveDisplay=waveCanvas.getContext("2d");

        //add channel to channel deck
        channelDeck.appendChild(this.el);
    }

    drawWave(){}

    remove(){
        this.el.remove();
        channels.splice(channels.indexOf(this),1);
    }
}

//patch class for above array
class Patch {
    constructor(){
        //give patch a unique 5-digit id
        while(true){
            this.id=10000+Math.floor(Math.random()*90000);
            for(var i=0;i<patches.length;i++){
            }
            if(i===patches.length){
                break;
            }
        }
    }

    drawWave(){}
}

//context menu
window.addEventListener("contextmenu",function(e){
    e.preventDefault();
});

//make rename button rename project
button.rename.addEventListener("click",function(){
    projectInfo.name=document.getElementById("input-rename").value;
    if(projectInfo.name.length<=0){
        projectInfo.name="New Project";
    }
    document.getElementsByTagName("title")[0].innerText=projectInfo.name+" - Dawnline";
    dlpFileOpts.suggestedName=projectInfo.name+".dlp";
    fadeBackground.click();
});

button.renameSynth.addEventListener("click",function(){
    patchInfo.name=document.getElementById("input-rename").value;
    if(patchInfo.name.length<=0){
        patchInfo.name="New Project";
    }
    document.getElementsByTagName("title")[0].innerText=patchInfo.name+" - Dawnline";
    dlpFileOpts.suggestedName=patchInfo.name+".dlp";
    fadeBackground.click();
});

synthName.addEventListener("click",function(){
    
})

//for file open/save
var dlpFileOpts = {types:[{accept:{"application/dlp":[".dlp"]}}],suggestedName:"New Project.dlp"}

//menu data for the logo menu
const logoMenu = [
    {
        label: "About Dawnline",
        image: "info",
        click: function(){
            fadeBackground.style.display="block";
            aboutWindow.style.display="block";
        }
    },
    {
        label: "Select Audio Output Device",
        image: "speaker",
        click: function(){
            navigator.mediaDevices.selectAudioOutput().then(function(d){
                console.log(`${device.kind}: ${device.label} id = ${device.deviceId}`);
            })
        },
        show: function(){
            return navigator.mediaDevices.selectAudioOutput!==undefined;
        }
    }
];

//menu data for the File menu
const fileMenu = [
    {
        label: "New",
        image: "plus",
        click: function(){
            //TODO: reset project info
        }
    },
    {
        label: "Open",
        image: "arrow-up",
        click: function(){
            //show file picker
            window.showOpenFilePicker(dlpFileOpts).then(async function(res){
                res["0"].getFile().then(async function(file){
                    changed=true;
                    //get info from DLP file
                    let projObj = await parseDlp(file);
                    projectInfo.name=projObj.name;

                    //set up channels
                    channels=[];
                    channelDeck.innerHTML="";
                    for(var i=0;i<projObj.channels.length;i++){
                        //TODO: add channels based on file data
                    }
                    document.getElementsByTagName("title")[0].innerText=projectInfo.name+" - Dawnline";
                });

                //create file writer
                fileHandler = await res["0"];
            })
        }
    },
    {
        label: "Save",
        image: "arrow-down",
        click: async function(){
            if(fileHandler){
                //save if we can
                let fileWriter = await fileHandler.createWritable();
                fileWriter.write(createDlp({name:projectInfo.name,channels:channels}));
                fileWriter.close();
            }else{
                //if we can't, we ask to save
                window.showSaveFilePicker(dlpFileOpts).then(async function(res){
                    fileHandler = res;
                    let fileWriter = await fileHandler.createWritable();
                    fileWriter.write(createDlp({name:projectInfo.name,channels:channels}));
                    fileWriter.close();
                });
            }
        }
    },
    {
        label: "Save As",
        image: "arrow-down",
        click: async function(){
            //ask where to save and reset file writer to there
            window.showSaveFilePicker(dlpFileOpts).then(async function(res){
                fileHandler = res;
                let fileWriter = await fileHandler.createWritable();
                //DEBUG
                console.log(createDlp({name:projectInfo.name,channels:channels}));
                fileWriter.write(createDlp({name:projectInfo.name,channels:channels}));
                fileWriter.close();
                fileWriter = await fileWriter.getWriter();
            });
        }
    },
    {
        label: "Rename",
        image: "pencil",
        click: function(){
            //show the rename window
            document.getElementById("input-rename").value=projectInfo.name;
            fadeBackground.style.display="block";
            renameWindow.style.display="block";
        }
    }
];

//menu data for the Edit menu
const editMenu = [
    {
        label: "Cut",
        image: "cut",
        click: function(){
            alert("Cut")
        }
    },
    {
        label: "Copy",
        image: "copy",
        click: function(){
            alert("Copy")
        }
    },
    {
        label: "Paste",
        image: "paste",
        click: function(){
            alert("Paste")
        }
    },
    {
        label: "New Channel",
        image: "plus",
        click: function(){
            changed=true;
            channels.push(new Channel(channels.length));
        }
    },
    {
        label: "New Synth Patch",
        image: "plus",
        click: function(){
            changed=true;
            synthDiv.style.display="block";
            button.synth.style.display="";
            synthCanvas.width = synthCanvas.clientWidth;
            synthCanvas.height = synthCanvas.clientHeight;
        }
    }
];

//menu data for the View menu
const viewMenu = [
    {
        label: "KEYboard",
        image: "midi",
        click: function(){
            alert("KEYboard")
        }
    }
];

//menu data for the Synth menu
const synthMenu = [
    {
        label: "Add Module",
        image: "plus",
        click: function(){
            //show the window for adding modules
            fadeBackground.style.display="block";
            addModuleWindow.style.display="block";
        }
    }
];

//register service worker
async function registerServiceWorker(){
    try {
        const registration = await navigator.serviceWorker.register("/js/sw.js", {
            scope:"/",
        });
        if(registration.installing){
            console.log("Service worker installing");
        }else if(registration.waiting){
            console.log("Service worker installed");
        }else if(registration.active){
            console.log("Service worker active");
        }
    }catch(err){
        console.error(err);
    }
};
registerServiceWorker();

//close windows
fadeBackground.addEventListener("click",function(e){
    fadeBackground.style.display="none";
    aboutWindow.style.display="none";
    renameWindow.style.display="none";
    addModuleWindow.style.display="none";
    renameSynthWindow.style.display="none";
});

//change menu element for menubar
{
        menu.addEventListener("focus",function(e){
        menu.style.display="flex";
    });
    menu.onblur =function(e){
        menu.style.display="none";
    }
    menu.addEventListener("click",function(e){
        menu.style.display="none";
    })

    //set menu with menubar buttons
    button.logo.addEventListener("mouseover",function(){
        setMenubarItemMenu(logoMenu,button.logo);
    });
    button.logo.addEventListener("click",function(e){
        menu.style.display="flex";
        menu.focus();
        e.preventDefault();
    });

    button.file.addEventListener("mouseover",function(){
        setMenubarItemMenu(fileMenu,button.file);
    });
    button.file.addEventListener("click",function(e){
        menu.style.display="flex";
        menu.focus();
        e.preventDefault();
    });

    button.edit.addEventListener("mouseover",function(){
        setMenubarItemMenu(editMenu,button.edit);
    });
    button.edit.addEventListener("click",function(e){
        menu.style.display="flex";
        menu.focus();
        e.preventDefault();
    });

    button.view.addEventListener("mouseover",function(){
        setMenubarItemMenu(viewMenu,button.view);
    });
    button.view.addEventListener("click",function(e){
        menu.style.display="flex";
        menu.focus();
        e.preventDefault();
    });

    button.synth.addEventListener("mouseover",function(){
        setMenubarItemMenu(synthMenu,button.synth);
    });
    button.synth.addEventListener("click",function(e){
        menu.style.display="flex";
        menu.focus();
        e.preventDefault();
    });
}

//loads menu element with dropdown menu
function setMenubarItemMenu(menuData,buttonData){
    menu.innerHTML="";
    for(var i=0;i<menuData.length;i++){
        //this lets items be not put on the menu
        if(menuData[i].show){
            if(!menuData[i].show()){
                continue;
            }
        }

        //create menu elements
        let itemMenuEl = document.createElement("div");
        itemMenuEl.className="menu-item";
        itemMenuEl.innerHTML="<img src='/images/"+menuData[i].image+".svg' height=50><p>"+menuData[i].label+"</p>";
        itemMenuEl.addEventListener("click",menuData[i].click);
        menu.appendChild(itemMenuEl);
    }
    menu.style.left=buttonData.getBoundingClientRect().x+"px";
    menu.style.top=buttonData.getBoundingClientRect().y+buttonData.getBoundingClientRect().height+"px";
}

//returns true if user is in dark mode
function isDark(){
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

//tell the user if they try to close with unsaved work
addEventListener("beforeunload",function(e){
    if(changed){e.preventDefault();}
});

//handle when opening files
if(window.launchQueue){
    window.launchQueue.setConsumer(function(data){
        console.dir(data);
    });
}