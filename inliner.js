'use strict';

var cheerio = require('cheerio');
var async = require("async");
var minify = require('html-minifier').minify;
var url = require("url");
var utils = require("./utils.js");

var minifyOpts = {
	removeComments : true,
	collapseWhitespace : true,
	minifyCSS : true,
	minifyJS : true,
	processScripts : [],
	removeOptionalTags : true
};

function inlineByUrl(startAddress, headers, cb) {
	var context = {};
	context.url = url.parse(startAddress);

	utils.downloadWithHeaders(startAddress, headers, function (err, body){
		if (err || !body) {
			return cb(err);
		}
		var $ = cheerio.load(body);
		var runlist = [
			require("./runlist/removeIncompatibles.js"),
			require("./runlist/stripLinks.js"),
			require("./runlist/inlineScripts.js"),
			require("./runlist/inlineStyles.js"),
			require("./runlist/inlineImages.js")
		];

		async.each(runlist, function (runner, done){
			runner.run($, context, done);
		}, function (err){
			cb(null, minify($.html(), minifyOpts));
		});
	});
}

module.exports = {
	inlineByUrl : inlineByUrl
};