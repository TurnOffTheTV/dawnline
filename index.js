const http = require("node:http");
const express = require("express");
const dawnline = express();
const server = http.createServer(dawnline);
const fs = require("node:fs");
const path = require("node:path");

dawnline.use(express.static(path.join(__dirname,"public"),{setHeaders:function(res,path,stat){
    res.set('Service-Worker-Allowed',"/");
}}));

server.listen(8000,function(){
    console.log('server is running on port', server.address().port);
});