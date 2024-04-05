//editor.js
//Main editor code

//get all the elements
const dawnlineLogo = document.getElementById("dawnline-logo");
const button = {
    logo:document.getElementById("button-logo"),
    file:document.getElementById("button-file"),
    edit:document.getElementById("button-edit"),
    view:document.getElementById("button-view"),
    rename:document.getElementById("button-rename")
};
const fadeBackground = document.getElementById("fade-background");
const menu = document.getElementById("menu");
const channelDeck = document.getElementById("channel-deck");
const aboutWindow = document.getElementById("window-about");
const renameWindow = document.getElementById("window-rename");

//get Web Audio context
const AudioContext = window.AudioContext || window.webkitAudioContext;
const audioCtx = new AudioContext();
const analyser = audioCtx.createAnalyser();

//variables for project content
var projectInfo = {
    name: "New Project"
}
//list of channels
var channels = [];
//list of patches
var patches = [];
//file worker
var fileWriter;

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
        this.track=audioCtx.createBuffer(1,1,441000);
        this.panner=new StereoPannerNode(audioCtx,{pan:this.pan});
        //this.track.connect(this.panner).connect(audioCtx.destination);

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
    document.getElementsByTagName("title")[0].innerText=projectInfo.name+" - Dawnline";
    dlpFileOpts.suggestedName=projectInfo.name+".dlp";
    fadeBackground.click();
});

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
            alert("Creating new file")
        }
    },
    {
        label: "Open",
        image: "arrow-up",
        click: function(){
            window.showOpenFilePicker(dlpFileOpts).then(async function(res){
                res["0"].getFile().then(async function(file){
                    console.log(await parseDlp(file));
                });
                fileWriter = await res["0"].createWritable();
            })
        }
    },
    {
        label: "Save",
        image: "arrow-down",
        click: function(){
            if(fileWriter){
                fileWriter.write(createDlp({name:projectInfo.name,channels:channels}));
            }else{
                window.showSaveFilePicker(dlpFileOpts).then(async function(res){
                    fileWriter = await res.createWritable();
                    fileWriter.write(createDlp({name:projectInfo.name,channels:channels}));
                });
            }
        }
    },
    {
        label: "Rename",
        image: "pencil",
        click: function(){
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
            channels.push(new Channel(channels.length));
        }
    },
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

//close windows
fadeBackground.addEventListener("click",function(e){
    fadeBackground.style.display="none";
    aboutWindow.style.display="none";
    renameWindow.style.display="none";
})

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