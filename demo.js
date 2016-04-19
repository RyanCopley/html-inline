'use strict';
var fs = require("fs");
var path = require("path");
var inliner = require("./inliner.js");

inliner.inlineByUrl("http://wlna-webservice.gannettdigital.com/articleservice/azcentral-sports/iphone/view/83160700/", function (err, doc){
	fs.writeFile(path.join(__dirname, "output", Math.random()+".html"), doc, function (err){
		console.log(err ? err : "Successful");
	});
});
