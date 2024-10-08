//editor.js
//script for editor

//import modules
export const dlp = await import("./dlp.mjs");
export const dlsp = await import("./dlsp.mjs");
export const synth = await import("./synth.mjs");

console.log(dlp);

//for add-ons

export class BarItem {
	label;
	id;
	menu;
	#disabled=false;
	element = document.createElement("div");
	constructor(id,label,menu){
		this.label=label;
		this.id=id;
		if(!menu instanceof ContextMenu){
			throw new Error("menu is not of type ContextMenu")
		}else{
			this.menu=menu;
		}
	}

	get disabled(){
		return this.#disabled;
	}

	set disabled(value){
		this.#disabled=value;
		this.element.toggleAttribute("disabled",value);
		return this.#disabled;
	}
}

export class ContextMenu {
	items;
	#disabled=false;
	constructor(items){
		if(!Array.isArray(items)){
			throw new Error("items is not of type Array");
		}
		for(let i=0;i<items.length;i++){
			if(!items[i] instanceof ContextMenuItem){
				console.log(typeof items[i]);
				throw new Error("item "+i+" is not of type ContextMenuItem");
			}
		}
		this.items=items;
	}

	getItemById(id){
		let item = this.items.find(function(e){
			return e.id===id;
		});
		return item;
	}
}

export class ContextMenuItem {
	label;
	id;
	#disabled=false;
	#visible=true;
	element = document.createElement("div");
	constructor(id,label,onclick){
		this.label=label;
		this.id=id;
		if(typeof onclick!=="function"){
			throw new Error("onclick is not a function");
		}
		this.onclick=onclick;
	}

	get disabled(){
		return this.#disabled;
	}

	get visible(){
		return this.#visible;
	}

	set disabled(value){
		this.#disabled=value;
		this.element.toggleAttribute("disabled",value);
		return this.#disabled;
	}

	set visible(value){
		this.#visible=value;
		this.element.style.display= value?"block":"none";
		return this.#visible;
	}

	onclick(){}
}

export function addItemToTopbar(item){
	if(!item instanceof BarItem){
		throw new Error("item is not of type BarItem");
	}
	topbar.items.push(item);
	item.element.className="topbar-item";
	item.element.innerText=item.label;
	item.element.dataset.id=item.id;
	item.element.addEventListener("mouseover",setAddonMenu);
	item.element.addEventListener("click",showHideCtxMenu);
	topbar.el.appendChild(item.element);
}

export function getTopbarItemById(id){
	let item = topbar.items.find(function(e){
		return e.id===id;
	});
	return item;
}

export function addItemToControlbar(item){
	if(!item instanceof BarItem){
		throw new Error("item is not of type ControlbarItem");
	}
	controlbar.items.push(item);
}

export function addItemToPatchbar(item){
	if(!item instanceof BarItem){
		throw new Error("item is not of type BarItem");
	}
	patchbar.items.push(item);
	item.element.className="topbar-item";
	item.element.innerText=item.label;
	item.element.dataset.id=item.id;
	item.element.addEventListener("mouseover",setAddonMenu);
	item.element.addEventListener("click",showHideCtxMenu);
	patchbar.el.appendChild(item.element);
}

export function getPatchbarItemById(id){
	let item = patchbar.items.find(function(e){
		return e.id===id;
	});
	return item;
}

export function changeFile(){
	changed=true;
}

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
	renameProject:document.getElementById("button-rename-project"),
	sendCode:document.getElementById("button-send-code"),
	addonWindow:document.getElementById("button-addon-window"),
	installAddon:document.getElementById("button-install-addon")
};
const input = {
	renameProject:document.getElementById("input-rename-project"),
	sampleRate:document.getElementById("input-sample-rate"),
	secretCode:document.getElementById("input-secret-code"),
	addonUrl:document.getElementById("input-addon-url")
};
const windows = {
	renameProject:document.getElementById("window-rename-project"),
	unavailable:document.getElementById("window-unavailable"),
	about:document.getElementById("window-about"),
	programSettings:document.getElementById("window-program-settings"),
	addon:document.getElementById("window-addons")
};

const topbar = {
	items:[],
	el: document.getElementById("topbar"),
	logo: document.getElementById("topbar-logo")
};

const controlbar = {
	items:[],
	el: document.getElementById("controlbar"),
	play: document.getElementById("controlbar-play"),
	pause: document.getElementById("controlbar-pause")
};

const patchbar = {
	items:[],
	el: document.getElementById("patchbar"),
	patches: document.getElementById("patchbar-patches"),
	file: document.getElementById("patchbar-file"),
	generators: document.getElementById("patchbar-generators"),
	basics: document.getElementById("patchbar-basics")
};

const channelView = document.getElementById("channel-view");
const synthView = document.getElementById("synth-view");

const panMarker = document.getElementById("pan-marker");

const channelDeck = document.getElementById("channel-deck");

const addonList = document.getElementById("addon-list");

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
var dlpFileHandler;

//project
export var project = {
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
	name;
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
		this.element.dataset.id=this.id;

		let channelInfoEl = document.createElement("div");
		channelInfoEl.className="channel-info-panel";

		let channelName = document.createElement("h4");
		channelName.innerText=this.name;
		channelName.contentEditable
		channelName.addEventListener("dblclick",function(){
			this.contentEditable=true;
			this.focus();
			this.addEventListener("blur",function(){
				this.contentEditable=false;
				for(let i=0;i<project.channels.length;i++){
					if(project.channels[i].id==this.parentElement.parentElement.dataset.id){
						project.channels[i].name=this.innerText;
						break;
					}
				}
			},{once:true});
		});
		channelInfoEl.appendChild(channelName);

		let panSliderContainer = document.createElement("div");
		panSliderContainer.className="pan-slider-container";
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
		panSliderContainer.appendChild(this.panSlider);
		channelInfoEl.appendChild(panSliderContainer);

		let removeButton = document.createElement("div");
		removeButton.className="channel-delete";
		removeButton.addEventListener("click",function(){
			for(let i=0;i<project.channels.length;i++){
				if(project.channels[i].id==this.parentElement.parentElement.dataset.id){
					if(confirm("Do you really want to delete "+project.channels[i].name+"?")){
						project.channels[i].element.remove();
						project.channels.splice(i,1);
					}
					break;
				}
			}
		});
		channelInfoEl.appendChild(removeButton);

		this.element.appendChild(channelInfoEl);

		this.waveArea = document.createElement("div");
		this.waveArea.className="wave-area";
		this.waveArea.innerText="This channel is empty";
		this.element.appendChild(this.waveArea);
		channelDeck.appendChild(this.element);
	}

	play(time){}
}

class SynthPatch {
	modules=[];
	id;
	name;
	fileHandler;
	constructor(patch){
		if(patch){
			this.id=patch.patch.id;
			this.name=patch.patch.name;
		}else{
			while(true){
				this.id=10000+Math.floor(Math.random()*90000);
				for(var i=0;i<project.patches.length;i++){
					if(project.patches[i].id===this.id){break;}
				}
				if(i===project.patches.length){
					break;
				}
			}
			this.name="patch-"+project.patches.length;
		}
	}
}

async function openFile(file){
	//get info from DLP file
	let proj = await dlp.parse(file);
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

function showHideCtxMenu(){
	if(contextMenu.style.display==="none"){
		contextMenu.style.display="block";
	}else{
		contextMenu.style.display="none";
	}
}

function setAddonMenu(e){
	contextMenu.innerHTML="";
	let item;
	if(topbar.el.contains(e.target)){
		item = getTopbarItemById(e.target.dataset.id);
	}
	if(patchbar.el.contains(e.target)){
		item = getPatchbarItemById(e.target.dataset.id);
	}
	for(let i=0;i<item.menu.items.length;i++){
		let newItem = document.createElement("div");
		newItem.innerText=item.menu.items[i].label;
		newItem.className="context-item";
		if(item.menu.items[i].disabled){
			newItem.toggleAttribute("disabled",true);
		}
		newItem.style.display=item.menu.items[i].visible?"block":"none";
		newItem.addEventListener("click",item.menu.items[i].onclick);
		newItem.dataset.id=item.menu.items[i].id;
		contextMenu.appendChild(newItem);
	}
	contextMenu.style.left=e.target.getBoundingClientRect().x;
	contextMenu.style.top=e.target.getBoundingClientRect().bottom;
}

function enableSynthMenus(){
	patchbar.generators.removeAttribute("disabled");
	patchbar.basics.removeAttribute("disabled");
}

input.sampleRate.value=settings.sampleRate;

channelView.style.display="block";

//event listeners
window.addEventListener("click",function(e){
	if(!topbar.el.contains(e.target) && !patchbar.el.contains(e.target)){
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

window.addEventListener("keydown",async function(e){
	if(e.code==="KeyO" && (e.ctrlKey || e.metaKey)){
		e.preventDefault();
		window.showOpenFilePicker(dlp.fileOpts).then(async function(res){
			res["0"].getFile().then(openFile);

			dlpFileHandler = res["0"];
		});
	}
	if(e.code==="KeyS" && e.ctrlKey){
		e.preventDefault();
		if(dlpFileHandler){
			let fileWriter = await dlpFileHandler.createWritable();
			fileWriter.write(dlp.create(project));
			fileWriter.close();
		}else{
			let fileOpts = dlp.fileOpts;
			fileOpts.suggestedName=project.name+".dlp";
			window.showSaveFilePicker(fileOpts).then(async function(res){
				dlpFileHandler = res;
				let fileWriter = await dlpFileHandler.createWritable();
				fileWriter.write(dlp.create(project));
				fileWriter.close();
			});
		}
	}
	if(e.code==="KeyS" && e.shiftKey && (e.ctrlKey || e.metaKey)){
		e.preventDefault();
		let fileOpts = dlp.fileOpts;
		fileOpts.suggestedName=project.name+".dlp";
		//ask where to save and reset file writer to there
		window.showSaveFilePicker(fileOpts).then(async function(res){
			dlpFileHandler = res;
			let fileWriter = await dlpFileHandler.createWritable();
			//DEBUG
			console.log(dlp.create(project));
			fileWriter.write(dlp.create(project));
			fileWriter.close();
			fileWriter = await fileWriter.getWriter();
		});
	}
});

//clear windows when background pressed
windowBackground.addEventListener("click",function(e){
	if(windows.unavailable.style.display!=="block" && !windows.addon.hasAttribute("changed")){windowBackground.style.display="none";}
	windows.renameProject.style.display="none";
	windows.about.style.display="none";
	windows.programSettings.style.display="none";
	if(!windows.addon.hasAttribute("changed")){windows.addon.style.display="none";}
});

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

const tbFile = new BarItem("d-file","File",new ContextMenu([
	new ContextMenuItem("d-file-new","New",function(){
		let confirmed = false;

		if(changed){
			confirmed=confirm("There are unsaved changes, do you really want to create a new file?");
		}else{
			confirmed=true;
		}
		if(confirmed){
			dlpFileHandler=undefined;
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
			channelDeck.innerHTML="";
			document.title=project.name;
		}
	}),
	new ContextMenuItem("d-file-open","Open",function(){
		window.showOpenFilePicker(dlp.fileOpts).then(async function(res){
			res["0"].getFile().then(openFile);

			dlpFileHandler = res["0"];
		});
	}),
	new ContextMenuItem("d-file-save","Save",async function(){
		if(dlpFileHandler){
			let fileWriter = await dlpFileHandler.createWritable();
			fileWriter.write(dlp.create(project));
			fileWriter.close();
		}else{
			let fileOpts = dlp.fileOpts;
			fileOpts.suggestedName=project.name+".dlp";
			window.showSaveFilePicker(fileOpts).then(async function(res){
				dlpFileHandler = res;
				let fileWriter = await dlpFileHandler.createWritable();
				fileWriter.write(dlp.create(project));
				fileWriter.close();
			});
		}
	}),
	new ContextMenuItem("d-file-saveas","Save As",async function(){
		let fileOpts = dlp.fileOpts;
		fileOpts.suggestedName=project.name+".dlp";
		//ask where to save and reset file writer to there
		window.showSaveFilePicker(fileOpts).then(async function(res){
			dlpFileHandler = res;
			let fileWriter = await dlpFileHandler.createWritable();
			//DEBUG
			console.log(dlp.create(project));
			fileWriter.write(dlp.create(project));
			fileWriter.close();
			fileWriter = await fileWriter.getWriter();
		});
	}),
	new ContextMenuItem("d-file-rename","Rename",function(){
		windowBackground.style.display="block";
		windows.renameProject.style.display="block";
		input.renameProject.value=project.name;
		input.renameProject.placeholder=project.name;
		input.renameProject.focus();
	})
]));
addItemToTopbar(tbFile);

const tbEdit = new BarItem("d-edit","Edit",new ContextMenu([
	new ContextMenuItem("d-edit-cut","Cut",function(){}),
	new ContextMenuItem("d-edit-copy","Copy",function(){}),
	new ContextMenuItem("d-edit-paste","Paste",function(){}),
	new ContextMenuItem("d-edit-newchannel","New Channel",function(){
		project.channels.push(new Channel());
		changed=true;
	}),
	new ContextMenuItem("d-edit-newpatch","New Synth Patch",function(){
		project.patches.push(new SynthPatch());
		synth.setCurrentPatch(project.patches[project.patches.length-1]);
		enableSynthMenus();
		synth.currentPatch.modules.push(new synth.Module(a,0));
		changed=true;
		synth.draw();
	})
]));

tbEdit.menu.getItemById("d-edit-newpatch").visible=false;

addItemToTopbar(tbEdit);

const tbView = new BarItem("d-view","View",new ContextMenu([
	new ContextMenuItem("d-view-settings","Settings",function(){
		windowBackground.style.display="block";
		windows.programSettings.style.display="block";
	}),
	new ContextMenuItem("d-view-channelview","Channel View",function(){
		channelView.style.display="block";
		synthView.style.display="none";
		tbView.menu.getItemById("d-view-channelview").visible=false;
		tbView.menu.getItemById("d-view-synthview").visible=true;
		tbEdit.menu.getItemById("d-edit-newpatch").visible=false;
		tbEdit.menu.getItemById("d-edit-newchannel").visible=true;
		synth.unload();
	}),
	new ContextMenuItem("d-view-synthview","Synth View",function(){
		synthView.style.display="block";
		channelView.style.display="none";
		tbView.menu.getItemById("d-view-channelview").visible=true;
		tbView.menu.getItemById("d-view-synthview").visible=false;
		tbEdit.menu.getItemById("d-edit-newpatch").visible=true;
		tbEdit.menu.getItemById("d-edit-newchannel").visible=false;
		synth.load();
	})
]));
tbView.menu.getItemById("d-view-channelview").visible=false;
console.log(tbView.menu.getItemById("d-view-channelview").element);
addItemToTopbar(tbView);

topbar.logo.addEventListener("click",showHideCtxMenu);

//control bar buttons
controlbar.play.addEventListener("click",function(){
	controlbar.play.style.display="none";
	controlbar.pause.style.display="block";
});
controlbar.pause.addEventListener("click",function(){
	controlbar.pause.style.display="none";
	controlbar.play.style.display="block";
});

//patch bar buttons

patchbar.el.addEventListener("mouseover",function(e){
	if(e.target===patchbar.el){
		contextMenu.innerHTML="";
	}
});

patchbar.patches.addEventListener("mouseover",function(){
	contextMenu.innerHTML="";
	
	for(let i=0;i<project.patches.length;i++){
		let patchItem = document.createElement("div");
		patchItem.innerText=project.patches[i].name;
		patchItem.className="context-item";
		patchItem.dataset.index=i;
		if(synth.currentPatch.name===project.patches[i].name){
			patchItem.toggleAttribute("highlighted",true);
		}
		patchItem.addEventListener("click",function(e){
			synth.setCurrentPatch(project.patches[this.dataset.index]);
			enableSynthMenus();
		});
		contextMenu.appendChild(patchItem);
	}

	if(project.patches.length===0){
		let patchItem = document.createElement("div");
		patchItem.innerText="There are no synth patches";
		patchItem.className="context-item";
		patchItem.toggleAttribute("disabled",true);
		contextMenu.appendChild(patchItem);
	}

	contextMenu.style.left=patchbar.patches.getBoundingClientRect().x;
	contextMenu.style.top=patchbar.patches.getBoundingClientRect().bottom;
});
patchbar.file.addEventListener("mouseover",function(){
	contextMenu.innerHTML="";

	let openItem = document.createElement("div");
	openItem.innerText="Open";
	openItem.className="context-item";
	openItem.addEventListener("click",function(){
		window.showOpenFilePicker(dlsp.fileOpts).then(async function(res){
			let patch = await dlsp.parse(await res["0"].getFile());
			project.patches.push(new SynthPatch(patch));
			synth.setCurrentPatch(project.patches[project.patches.length-1]);
			synth.currentPatch.fileHandler=res["0"];
		});
	});
	contextMenu.appendChild(openItem);
	
	if(synth.currentPatch){
		let saveItem = document.createElement("div");
		saveItem.innerText="Save";
		saveItem.className="context-item";
		saveItem.addEventListener("click",async function(){
			if(synth.currentPatch.fileHandler){
				let fileWriter = await synth.currentPatch.fileHandler.createWritable();
				fileWriter.write(dlsp.create(synth.currentPatch));
				fileWriter.close();
			}else{
				let fileOpts = dlsp.fileOpts;
				fileOpts.suggestedName=synth.currentPatch.name+".dlsp";
				window.showSaveFilePicker(fileOpts).then(async function(res){
					synth.currentPatch.fileHandler = res;
					let fileWriter = await synth.currentPatch.fileHandler.createWritable();
					fileWriter.write(dlsp.create(synth.currentPatch));
					fileWriter.close();
				});
			}
		});
		contextMenu.appendChild(saveItem);

		let saveAsItem = document.createElement("div");
		saveAsItem.innerText="Save As";
		saveAsItem.className="context-item";
		saveAsItem.addEventListener("click",function(){
			let fileOpts = dlsp.fileOpts;
			fileOpts.suggestedName=synth.currentPatch.name+".dlsp";
			window.showSaveFilePicker(fileOpts).then(async function(res){
				synth.currentPatch.fileHandler = res;
				let fileWriter = await synth.currentPatch.fileHandler.createWritable();
				fileWriter.write(dlsp.create(synth.currentPatch));
				fileWriter.close();
			});
		});
		contextMenu.appendChild(saveAsItem);

		let renameItem = document.createElement("div");
		renameItem.innerText="Rename";
		renameItem.className="context-item";
		renameItem.addEventListener("click",function(){
			let potRename = prompt("Rename synth patch");
			if(potRename && potRename!==""){
				synth.currentPatch.name=potRename;
			}
		});
		contextMenu.appendChild(renameItem);
	}

	contextMenu.style.left=patchbar.file.getBoundingClientRect().x;
	contextMenu.style.top=patchbar.file.getBoundingClientRect().bottom;
});
patchbar.generators.addEventListener("mouseover",function(){
	contextMenu.innerHTML="";
	if(!patchbar.generators.hasAttribute("disabled")){
		let waveItem = document.createElement("div");
		waveItem.innerText="Wave";
		waveItem.className="context-item";
		waveItem.addEventListener("click",function(){
			synth.currentPatch.modules.push(new synth.Module(a,1));
			synth.draw();
		});
		contextMenu.appendChild(waveItem);

		let customItem = document.createElement("div");
		customItem.innerText="Custom Wave";
		customItem.className="context-item";
		customItem.addEventListener("click",function(){
			synth.currentPatch.modules.push(new synth.Module(a,2));
			synth.draw();
		});
		contextMenu.appendChild(customItem);

		let sampleItem = document.createElement("div");
		sampleItem.innerText="Sample";
		sampleItem.className="context-item";
		sampleItem.addEventListener("click",function(){
			synth.currentPatch.modules.push(new synth.Module(a,3));
			synth.draw();
		});
		contextMenu.appendChild(sampleItem);
	}
	contextMenu.style.left=patchbar.generators.getBoundingClientRect().x;
	contextMenu.style.top=patchbar.generators.getBoundingClientRect().bottom;
});
patchbar.basics.addEventListener("mouseover",function(){
	contextMenu.innerHTML="";
	if(!patchbar.basics.hasAttribute("disabled")){
		let constItem = document.createElement("div");
		constItem.innerText="Constant";
		constItem.className="context-item";
		constItem.addEventListener("click",function(){
			synth.currentPatch.modules.push(new synth.Module(a,4));
			synth.draw();
		});
		contextMenu.appendChild(constItem);
	}

	contextMenu.style.left=patchbar.basics.getBoundingClientRect().x;
	contextMenu.style.top=patchbar.basics.getBoundingClientRect().bottom;
});

patchbar.patches.addEventListener("click",showHideCtxMenu);
patchbar.file.addEventListener("click",showHideCtxMenu);
patchbar.generators.addEventListener("click",showHideCtxMenu);
patchbar.basics.addEventListener("click",showHideCtxMenu);

//settings
input.sampleRate.addEventListener("change",function(e){
	settings.sampleRate=e.target.value;
	localStorage.setItem("settings",JSON.stringify(settings));
});

button.sendCode.addEventListener("click",async function(){
	let req = new Request("https://turnoffthetv.xyz/secret-code",{
		method:"POST",
		body:input.secretCode.value
	});
	let res = await fetch(req);
	let func = new Function(await res.text());
	func();
	input.secretCode.value="";
});

button.addonWindow.addEventListener("click",async function(){
	windows.programSettings.style.display="none";
	addonList.innerHTML="";
	input.addonUrl.value="";
	let addons = JSON.parse(localStorage.getItem("addons"));
	for(let i=0;i<addons.length;i++){
		let req = new Request(addons[i]);
		let res = await fetch(req);
		let json = await res.json();
		let addonDiv = document.createElement("div");
		addonDiv.className="addon-item";
		addonDiv.innerHTML="<span>"+json.name+"</span>";
		if(json.version){addonDiv.innerHTML+="<span>|</span><span>"+json.version+"</span>";}
		if(json.desc){addonDiv.innerHTML+="<span>|</span><span>"+json.desc+"</span>";}
		if(json.author){addonDiv.innerHTML+="<span>|</span><span>"+json.author+"</span>";}
		addonDiv.innerHTML+="<span>|</span>";
		let removeButton = document.createElement("input");
		removeButton.type="button";
		removeButton.value="Remove";
		removeButton.dataset.index=i;
		removeButton.addEventListener("click",function(e){
			addons.splice(this.dataset.index,1);
			this.parentElement.remove();
			localStorage.setItem("addons",JSON.stringify(addons));
			windows.addon.toggleAttribute("changed",true);
			windows.addon.children[windows.addon.childElementCount-1].style.display="block";
			if(addons.length===0){
				addonList.innerHTML='<div class="addon-item"><span>You have no add-ons installed</span></div>';
			}
		});
		addonDiv.appendChild(removeButton);
		addonList.appendChild(addonDiv);
	}
	if(addons.length===0){
		addonList.innerHTML='<div class="addon-item"><span>You have no add-ons installed</span></div>';
	}
	windows.addon.style.display="block";
});

button.installAddon.addEventListener("click",function(){
	if(!input.addonUrl.value){
		return;
	}
	let addons = JSON.parse(localStorage.getItem("addons"));
	addons.push(input.addonUrl.value);
	localStorage.setItem("addons",JSON.stringify(addons));
	input.addonUrl.value="";
	button.addonWindow.click();
	windows.addon.toggleAttribute("changed",true);
	windows.addon.children[windows.addon.childElementCount-1].style.display="block";
});

//rename project window
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
		dlpFileHandler=data.files[0];
		data.files[0].getFile().then(openFile);
	});
}
