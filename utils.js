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
		urlString = context.url.resolve(urlString);
	}
	return urlString;
}

module.exports = {
	download : download,
	fullyQualifyUrl : fullyQualifyUrl
};