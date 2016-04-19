'use strict';
var mime = require('mime-types');
var async = require("async");

function run(css, originatorUrl, done){
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


module.exports = {
	run : run
};