'use strict';
var fs = require("fs");
var path = require("path");
var inliner = require("./inliner.js");
var open = require("open");
inliner.inlineByUrl("http://wlna-webservice.gannettdigital.com/articleservice/azcentral-sports/iphone/view/83160700/", function (err, doc){
	var path = path.join(__dirname, "output", Math.random()+".html");
	fs.writeFile(path, doc, function (err){
		open(path);
		setTimeout(function(){
			fs.unlink(path);
		}, 100);
	});
});
