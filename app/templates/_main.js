// main.js

'use strict';

console.log('\'Allo \'Allo!');

var pageList = require('pageList');
var pageController = require('pageController');
var home = require('home');
var _ = require('underscore');
var names = ['blue t-shirt', 'yellow t-shirt', 'green t-shirt'];
 
_.each(names, function(n) {
	console.log(n);
});

//initialize
m.module(document.getElementById("page-app"), app);