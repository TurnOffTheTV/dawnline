export function init(editor){
    editor.addItemToTopbar(new editor.BarItem("Debug","debug-topbar-menu",
        new editor.ContextMenu([
            new editor.ContextMenuItem("Change File","debug-change-file",function(){editor.changeFile()}),
            new editor.ContextMenuItem("Log Project Var to Console","debug-log-project",function(){console.log(editor.project)})
        ])
    ));
    editor.getTopbarItemById("debug-topbar-menu").disabled=true;
}