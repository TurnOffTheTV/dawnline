//dlp.js
//create and parse Dawnline project files (dlp for DawnLine Project)

onmessage =function(e){
    console.log(e);
    if(e.data.command==="openFile"){
        window.showOpenFilePicker(dlpFileOpts).then(function(res){
            console.log(res["0"]);
        })
    }
    if(e.data.command==="saveFile"){
        window.showSaveFilePicker(dlpFileOpts).then(function(res){
            console.log(res.createSyncAccessHandle());
        })
    }
}

function createDlp(projObj){
    console.log(projObj.name.length)
}

function parseDlp(bytes){

}