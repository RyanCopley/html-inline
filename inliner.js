'use strict';

var request = require("request").defaults({ encoding: null });
var cheerio = require('cheerio');
var url = require("url");
var _ = require("lodash");
var async = require("async");
var uglify = require("uglify-js");
var base64 = require("base-64");

function inline(startAddress, cb) {
	var urlComponents = url.parse(startAddress);
	var context = {};
	context.url = urlComponents;

	download(startAddress, function (err, body){
		var $ = cheerio.load(body);
		removeIncompatibles($, context, function (err){
			stripLinks($, context, function (err){
				scanScripts($, context, function (err){
					scanStyles($, context, function (err){
						scanImages($, context, function (err){
							cb(null, $.html());
						});
					});
				});
			});
		});
	});
}

function removeIncompatibles($, context, cb){
	$(".inline-remove").remove();
	cb();
}

function stripLinks($, context, cb){
	async.each($("a"), function (tag, done){
		var obj = cheerio(tag);
		var sourceString = obj.text();

		obj.replaceWith($("<span>").text(sourceString));
		return done();
	}, cb);
}

function scanScripts($, context, cb){
	async.each($("script"), function (tag, done){
		var obj = cheerio(tag);
		var sourceString = obj.attr("src");
		if (!sourceString){
			return done();
		}

		var scriptSourceUrl = url.parse(sourceString);
		
		// Fully qualified URLs
		if (!scriptSourceUrl.host){
			sourceString = context.url.protocol + "//" + context.url.host + sourceString;
		}
		
		download(sourceString, function (err, body){
			obj.replaceWith($("<script>").html(body));
			return done();
		});
	}, cb);
}

function scanStyles($, context, cb){
	async.each($("link"), function (tag, done){
		var obj = cheerio(tag);
		var sourceString = obj.attr("href");
		if (!sourceString){
			return done();
		}

		var scriptSourceUrl = url.parse(sourceString);
		
		// Fully qualified URLs
		if (!scriptSourceUrl.host){
			sourceString = context.url.protocol + "//" + context.url.host + sourceString;
		}
		
		download(sourceString, function (err, body){
			obj.replaceWith($("<style>").html(body));
			return done();
		});
	}, cb);
}

function scanImages($, context, cb){
	async.each($("img"), function (tag, done){
		var obj = cheerio(tag);
		var sourceString = obj.attr("src");
		console.log(sourceString);
		if (!sourceString){
			return done();
		}

		var scriptSourceUrl = url.parse(sourceString);
		
		// Fully qualified URLs
		if (!scriptSourceUrl.host){
			sourceString = context.url.protocol + "//" + context.url.host + sourceString;
		}

		download(sourceString, function (err, body){
			var imageData = new Buffer(body, "binary");
			var base64 = imageData.toString("base64");
			obj.attr("src", "data:image/jpeg;charset=utf-8;base64," + base64);
			return done();
		});
	}, cb);
}

function download(url, cb){	
	request(url, function (error, response, body) {
	  if (!error && response.statusCode == 200) {
	  	return cb(null, body);
	  }
	  return cb(error);
	})
}

module.exports = {
	inline : inline
};
