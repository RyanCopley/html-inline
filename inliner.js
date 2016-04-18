'use strict';

var request = require("request").defaults({ encoding: null });
var cheerio = require('cheerio');
var url = require("url");
var path = require("path");
var _ = require("lodash");
var async = require("async");
var mime = require('mime-types')
var minify = require('html-minifier').minify;
var minifyOpts = {
	removeComments : true,
	collapseWhitespace : true,
	minifyCSS : true,
	minifyJS : true,
	processScripts : [],
	removeOptionalTags : true
};

function inline(startAddress, cb) {
	var urlComponents = url.parse(startAddress);
	var context = {};
	context.url = urlComponents;

	download(startAddress, function (err, body){
		var $ = cheerio.load(body);
		var runlist = [
			removeIncompatibles,
			stripLinks,
			scanScripts,
			scanStyles,
			scanImages
		];

		async.each(runlist, function (fn, done){
			fn($, context, done);
		}, function (err){
			cb(null, minify($.html(), minifyOpts));
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
		var sourceLink = obj.attr("href");
		var sourceString = obj.text();

		obj.replaceWith($("<span>").text(sourceString).attr("originalUrl", sourceLink).addClass("inline-hidden-link"));
		return done();
	}, cb);
}

function scanScripts($, context, cb){
	async.each($("script"), function (tag, done){
		var obj = cheerio(tag);
		var sourceString = fullyQualifyUrl(obj.attr("src"), context);
		if (!sourceString){
			return done();
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
		var sourceString = fullyQualifyUrl(obj.attr("href"), context);
		if (!sourceString){
			return done();
		}
		
		download(sourceString, function (err, body){
			inlineCssRefs(body, sourceString, function (err, inlinedCss){
				obj.replaceWith($("<style>").html(inlinedCss));
				return done();
			});
		});
	}, cb);
}

function scanImages($, context, cb){
	async.each($("img"), function (tag, done){
		var obj = cheerio(tag);
		var sourceString = fullyQualifyUrl(obj.attr("src"), context);
		if (!sourceString){
			return done();
		}

		download(sourceString, function (err, body){
			var imageData = new Buffer(body, "binary");
			var base64 = imageData.toString("base64");
			obj.attr("src", "data:" + mime.lookup(sourceString) + ";charset=utf-8;base64," + base64);
			return done();
		});
	}, cb);
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
		var resourceString = fullyQualifyUrl(urlPath, context);

		download(resourceString, function (err, body){
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
