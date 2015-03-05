// page list model

var PageList = function() {
	// return m.request({method: "GET", url: "pages.json"});
	return [{title: 'link1', url: '/link1.html'},
					{title: 'link2', url: '/link2.html'},
					{title: 'link3', url: '/link3.html'}
				 ];
};


module.exports = PageList;