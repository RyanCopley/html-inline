'use strict';
var cheerio = require("cheerio");
var async = require("async");

function run($, context, cb){
	async.each($("a"), function (tag, done){
		var obj = cheerio(tag);
		var sourceLink = obj.attr("href");
		var sourceString = obj.text();

		obj.replaceWith($("<span>").text(sourceString).attr("originalUrl", sourceLink).addClass("inline-hidden-link"));
		return done();
	}, cb);
}

module.exports = {
	run : run
};