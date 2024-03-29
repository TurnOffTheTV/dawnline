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
const audioContext = new AudioContext();
const analyser = audioContext.createAnalyser();

//variables for project content
var projectInfo = {
    name: "New Project"
}
//list of channels
var channels = [];
//list of patches
var patches = [];

//channel class for above array
class Channel {
    constructor(){
        this.audio=audioContext.createBuffer(1,0,441000);
        this.el=document.createElement("div");
        this.el.class="channel";
        let waveCanvas = document.createElement("canvas");
        this.waveDisplay=waveCanvas.getContext("2d");
        channelDeck.appendChild(this.el);
    }

    drawWave(){}
}

//patch class for above array
class Patch {
    constructor(){
        
    }

    drawWave(){}
}

//make rename button rename project
button.rename.addEventListener("click",function(){
    projectInfo.name=document.getElementById("input-rename").value;
    document.getElementsByTagName("title")[0].innerText=projectInfo.name+" - Dawnline";
    fadeBackground.click();
});

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
            alert("Opening old file")
        }
    },
    {
        label: "Save",
        image: "arrow-down",
        click: function(){
            alert("Saving file")
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
        click: function(){
            alert("Cut")
        }
    },
    {
        label: "Copy",
        click: function(){
            alert("Copy")
        }
    },
    {
        label: "Paste",
        click: function(){
            alert("Paste")
        }
    },
    {
        label: "New Channel",
        image: "plus",
        click: function(){
            channels.push(new Channel());
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
        console.log("menu visible")
        menu.style.display="flex";
    });
    menu.onblur =function(e){
        menu.style.display="none";
        console.log("menu blurred")
    }
    menu.addEventListener("click",function(e){
        menu.style.display="none";
        console.log("menu clicked")
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
    console.log("set menu")
}

//returns true if user is in dark mode
function isDark(){
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
}