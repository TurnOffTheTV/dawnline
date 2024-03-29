//editor.js
//Main editor code

//get all the elements
const dawnlineLogo = document.getElementById("dawnline-logo");
const button = {
    file:document.getElementById("button-file"),
    edit:document.getElementById("button-edit"),
    view:document.getElementById("button-view")
};
const menu = document.getElementById("menu");

//menu data for the File menu
const fileMenu = [
    {
        label: "New",
        click: function(){
            alert("Creating new file")
        }
    }
];

//menu data for the File menu
const editMenu = [
    {
        label: "Cut",
        click: function(){
            alert("Cut")
        }
    }
];

//menu data for the File menu
const viewMenu = [
    {
        label: "KEYboard",
        click: function(){
            alert("KEYboard")
        }
    }
];

//show/hide menu element
menu.addEventListener("focus",function(e){
    alert("")
    menu.style.display="flex";
});
menu.addEventListener("blur",function(e){
    menu.style.display="none";
})

//menubar buttons
button.file.addEventListener("click",function(){
    //setMenubarItemMenu(fileMenu);
});
button.edit.addEventListener("click",function(){
    //setMenubarItemMenu(editMenu);
});
button.view.addEventListener("click",function(){
    //setMenubarItemMenu(viewMenu);
});

//loads menu element with dropdown menu
function setMenubarItemMenu(menuData){
    menu.innerHTML="";
    for(var i=0;i<menuData.length;i++){
        let itemMenuEl = document.createElement("div");
        itemMenuEl.className="menu-item";
        itemMenuEl.innerHTML="<p>"+menuData[i].label+"</p>";
        itemMenuEl.addEventListener("click",menuData[i].click);
        menu.appendChild(itemMenuEl);
    }
    menu.focus();
}