'use strict';
var async = require("async");
var mime = require('mime-types');
var async = require("async");
var utils = require("../utils.js");
var cheerio = require("cheerio");
var url = require("url");

function run($, context, cb){
	async.each($("link"), function (tag, done){
		var obj = cheerio(tag);
		var sourceString = utils.fullyQualifyUrl(obj.attr("href"), context);
		if (!sourceString){
			return done();
		}
		
		utils.download(sourceString, function (err, body){
			inlineCssRefs(body, sourceString, function (err, inlinedCss){
				obj.replaceWith($("<style>").html(inlinedCss));
				return done();
			});
		});
	}, cb);
}

function inlineCssRefs(css, originatorUrl, done){
	css = css.toString();
	var urlRegex = /url\s?\((?!\'data)(?:\'|\"|\s)?([^\)]+)(?:\'|\"|\s)?\)/
	var match;

	var ctx = {};
	ctx.url = url.parse(originatorUrl);

	async.whilst(function(){
		match = css.match(urlRegex);
		return !!match;
	}, function (cb){
		var urlPath = match[1];
		if (["'", '"'].indexOf(urlPath.substr(-1, 1)) != -1){ // The regex above isn't exceptionally intelligent...
			urlPath = urlPath.substr(0, urlPath.length-1).trim();
		} 

		var resourceString = utils.fullyQualifyUrl(urlPath, ctx);
		utils.download(resourceString, function (err, body){
			var imageData = new Buffer(body, "binary");
			var base64 = imageData.toString("base64");
			var inlined = "url('data:" + mime.lookup(urlPath) + ";charset=utf-8;base64,"+base64+"')";
			css = css.replace(match[0], inlined);
			return cb();
		});

	}, function (err){
		done(err, css);
	});
}


module.exports = {
	run : run
};