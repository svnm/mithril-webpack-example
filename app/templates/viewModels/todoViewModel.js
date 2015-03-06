// todo View Model

var Todo = require('../models/Todo');

// the view-model tracks a running list of todos, and allows for todos to be added to the list.

var todoViewModel = (function() {
    var vm = {}
    vm.init = function() {
        //a running list of todos
        vm.list = [];
        vm.description = m.prop("");

        //adds a todo to the list, and clears the description field for user convenience
        vm.add = function() {
            if (vm.description()) {
                vm.list.push(new Todo({description: vm.description()}));
                vm.description("");
            }
        };
    }
    return vm
}())

module.exports = todoViewModel;