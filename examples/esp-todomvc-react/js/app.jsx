/*global React,window,esp,app*/
(function () {
    "use strict";

    var TodoApp = app.TodoApp;
    var router = new esp.Router();
    var modelId = "todoList";

    React.render(
        <TodoApp
            router={router}
            modelId={modelId}
        />,
        document.getElementById("todoapp")
    );

    var modelBootstrapper = new app.model.ModelBootstrapper(router, modelId);
    modelBootstrapper.start();

    Router({
        "/": function() { router.publishEvent(modelId, "filterChanged", { filter: app.model.Filter.all }); },
        "/active": function() { router.publishEvent(modelId, "filterChanged", { filter: app.model.Filter.active }); },
        "/completed": function() { router.publishEvent(modelId, "filterChanged", { filter: app.model.Filter.complete }); }
    }).init("/");

    router.publishEvent(modelId, "initEvent", {});
}());