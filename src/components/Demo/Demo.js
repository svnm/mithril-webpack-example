var Demo = {
    controller: function() {
        return {
            onunload: function() {
                console.log("unloading my component");
            }
        }
    },
    view: function() {
        return m("div", "test")
    }
};

export default Demo