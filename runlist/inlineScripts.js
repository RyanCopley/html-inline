'use strict';
var async = require("async");
var utils = require("../utils.js");
var cheerio = require("cheerio");
var utils = require("../utils.js");

function run($, context, cb){
	async.each($("script"), function (tag, done){
		var obj = cheerio(tag);
		var sourceString = utils.fullyQualifyUrl(obj.attr("src"), context);
		if (!sourceString){
			return done();
		}
		
		utils.download(sourceString, function (err, body){
			obj.replaceWith($("<script>").text(body));
			return done();
		});
	}, cb);
}


module.exports = {
	run : run
};