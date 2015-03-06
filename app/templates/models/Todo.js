// Todo model

var Todo = function(data) {
    this.description = m.prop(data.description);
    this.done = m.prop(false);
};

module.exports = Todo;