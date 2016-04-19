'use strict';
var fs = require("fs");
var path = require("path");
var inliner = require("./inliner.js");
var open = require("open");

inliner.inlineByUrl("http://wlna-webservice.gannettdigital.com/articleservice/azcentral-sports/iphone/view/83160700/", function (err, doc){
	var localStorage = path.join(__dirname, "output", Math.random()+".html");
	fs.writeFile(localStorage, doc, function (err){
		open(localStorage);
		setTimeout(function(){
			fs.unlink(localStorage);
		}, 1000);
	});
});
