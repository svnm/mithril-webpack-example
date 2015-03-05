//controller

var pageList = require('pageList');

var pagesController = function() {
	var pages = pageList();
	return {
		pages: pages,
		rotate: function() {
			pages().push(pages().shift());
		}
	}
};


module.exports = pageController;