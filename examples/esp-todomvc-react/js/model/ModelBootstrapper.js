/*global app*/
(function () {
    "use strict";

    var ModelBootstrapper = function (router) {
        this.router = router;
    };

    ModelBootstrapper.prototype.start = function () {
        var model = new app.model.TodoList("esp-todomvc-react");
        this.router.registerModel("todoList", model, { postEventProcessor: app.model.TodoListPostEventProcessor });
        var todoListEventProcessor = new app.model.TodoListEventProcessor(this.router);
        todoListEventProcessor.start();
    };

    app.model.ModelBootstrapper = ModelBootstrapper;
}());