'use strict';

function run($, context, cb){
	$(".inline-remove").remove();
	cb();
}


module.exports = {
	run : run
};