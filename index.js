const http = require("node:http");
const express = require("express");
const dawnline = express();
const server = http.createServer(dawnline);
const fs = require("node:fs");
const path = require("node:path");

//serve webpage
dawnline.use(express.static(path.join(__dirname,"public"),{setHeaders:function(res,path,stat){
    res.set('Service-Worker-Allowed',"/");
}}));

//404 handling
dawnline.get("*",function(req,res){
	res.status(404).send(fs.readFileSync(__dirname+"/public/404.html").toString());
});

//start server
server.listen(8000,function(){
    console.log('server is running on port', server.address().port);
});