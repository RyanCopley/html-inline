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
	var urlRegex = /url\s?\([\S^\)]+\)/g
	var matches = css.match(urlRegex);

	async.each(matches, function (original, done){
		//todo: make this better
		var urlPath = original.replace("url", "").replace("(","").replace("'", "").replace("'", "").replace(")","");

		var urlComponents = url.parse(originatorUrl);
		var context = {};
		context.url = urlComponents;
		var resourceString = utils.fullyQualifyUrl(urlPath, context);

		utils.download(resourceString, function (err, body){
			var imageData = new Buffer(body, "binary");
			var base64 = imageData.toString("base64");
			var inlined = "url('data:" + mime.lookup(urlPath) + ";charset=utf-8;base64,"+base64+"')";
			css = css.replace(original, inlined);
			done();
		});
	}, function (err){
		done(null, css);

	});
}


module.exports = {
	run : run
};