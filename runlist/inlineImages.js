'use strict';
var mime = require('mime-types');
var async = require("async");
var utils = require("../utils.js");
var cheerio = require("cheerio");

function run($, context, cb){
	async.each($("img"), function (tag, done){
		var obj = cheerio(tag);
		var sourceString = utils.fullyQualifyUrl(obj.attr("src"), context);
		if (!sourceString){
			return done();
		}

		utils.download(sourceString, function (err, body){
			if (err || !body) {
				//Might be worth retrying or something here
				console.error(err);
				return done();
			}
			var imageData = new Buffer(body, "binary");
			var base64 = imageData.toString("base64");
			obj.attr("src", "data:" + mime.lookup(sourceString) + ";charset=utf-8;base64," + base64);
			return done();
		});
	}, cb);
}

module.exports = {
	run : run
};