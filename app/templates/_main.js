// main.js

'use strict';

var _ = require('underscore');
var names = ['blue t-shirt', 'yellow t-shirt', 'green t-shirt'];
 
_.each(names, function(n) {
	console.log(n);
});

//initialize the application

var todo = {};
todo.model = require('./models/Todo');
todo.view = require('./views/todoView');

m.module(document.getElementById("page-app"), {controller: todo.controller, view: todo.view});