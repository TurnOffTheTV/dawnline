const http = require("node:http");
const express = require("express");
const dawnline = express();
const server = http.createServer(dawnline);
const fs = require("node:fs");
const path = require("node:path");

dawnline.use(express.static(path.join(__dirname,"public")));

server.listen(8080,function(){
    console.log('server is running on port', server.address().port);
});