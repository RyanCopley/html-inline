'use strict';

var request = require("request").defaults({ encoding: null });
var url = require("url");

function download(url, cb){	
	request(url, function (error, response, body) {
	  if (!error && response.statusCode == 200) {
	  	return cb(null, body);
	  }
	  return cb(error);
	})
}


function fullyQualifyUrl(urlString, context){
	if (!urlString){
		return "";
	}

	var scriptSourceUrl = url.parse(urlString);
	// Fully qualified URLs
	if (!scriptSourceUrl.host){
		console.log(scriptSourceUrl.path);
		if (scriptSourceUrl.path.substring(0,1) === "/"){
			urlString = context.url.protocol + "//" + context.url.host + scriptSourceUrl.href;
		}else if (scriptSourceUrl.path.substring(0,1) === "."){
			urlString = url.resolve(context.url.href, urlString);
		}else{
			urlString = context.url.protocol + "//" + context.url.host + "/" + scriptSourceUrl.href;
		}
	}
	return urlString;
}

module.exports = {
	download : download,
	fullyQualifyUrl : fullyQualifyUrl
};