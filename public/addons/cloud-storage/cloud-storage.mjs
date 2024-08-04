export function init(editor){
    let hw = new editor.ContextMenuItem("Hello, world!","cs-hw",function(){alert("Hello, world!");});
    let menu = new editor.ContextMenu([hw]);
    editor.addItemToTopbar(new editor.BarItem("Cloud","cs-tb",menu))
}