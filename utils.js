'use strict';

var request = require("request").defaults({encoding: null});
var url = require("url");

function download(url, cb) {
    return downloadWithHeaders(url, {}, cb);
}

function downloadWithHeaders(url, headers, cb) {
    var options = {
        url: url,
        headers: headers
    };
    request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            return cb(null, body);
        }
        return cb(error);
    })
}

function fullyQualifyUrl(urlString, context) {
    if (!urlString) {
        return "";
    }

    var scriptSourceUrl = url.parse(urlString);
    // Fully qualified URLs
    if (!scriptSourceUrl.host) {
        if (scriptSourceUrl.path.substring(0, 1) === "/") {
            urlString = context.url.protocol + "//" + context.url.host + scriptSourceUrl.href;
        } else if (scriptSourceUrl.path.substring(0, 1) === ".") {
            urlString = url.resolve(context.url.href, urlString);
        } else {
            urlString = context.url.protocol + "//" + context.url.host + "/" + scriptSourceUrl.href;
        }
    }
    return urlString;
}

module.exports = {
    download: download,
    downloadWithHeaders: downloadWithHeaders,
    fullyQualifyUrl: fullyQualifyUrl
};