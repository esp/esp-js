/*global esp, app*/

(function () {
    "use strict";

    var extend = app.Utils.extend;

    var TodoListEventProcessor = function (router) {
        esp.model.DisposableBase.call(this);
        this.router = router;
    };

    TodoListEventProcessor.prototype = Object.create(esp.model.DisposableBase.prototype);

    TodoListEventProcessor.prototype.start = function () {
        this.observeInitEvent();
        this.observeToggleEvent();
        this.observeToggleAllEvent();
        this.observeTodoDestroyedEvent();
        this.observeTodoAddedEvent();
        this.observeFilterChangedEvent();
        this.observeClearCompletedEvent();
        this.observeEditStartedEvent();
        this.observeEditCancelledEvent();
        this.observeEditCompletedEvent();
    };

    TodoListEventProcessor.prototype.observeInitEvent = function () {
        this.addDisposable(this.router
            .getEventObservable("todoList", "initEvent")
            .observe(function (model) {
                var todoItems = app.Utils.store(model.localStorageKey);
                var todoItemsById = {};
                if (todoItems) {
                    todoItems.forEach(function (todoItem) {
                        todoItemsById[todoItem.id] = todoItem;
                    });
                    model.todoItemsById = todoItemsById;
                }
            })
            );
    };

    TodoListEventProcessor.prototype.observeToggleEvent = function () {
        this.addDisposable(this.router
            .getEventObservable("todoList", "todoToggled")
            .observe(function (model, event) {
                var todoItem = model.todoItemsById[event.id];
                todoItem = extend({}, todoItem, { complete: !todoItem.complete });
                model.todoItemsById[todoItem.id] = todoItem;
                this.save(model);
            }.bind(this))
            );
    };

    TodoListEventProcessor.prototype.observeToggleAllEvent = function () {
        this.addDisposable(this.router
            .getEventObservable("todoList", "toggleAll")
            .observe(function (model, event) {
                model.main.filteredTodoItems.forEach(function (todoItem) {
                    todoItem = extend({}, todoItem, { complete: event.checked });
                    model.todoItemsById[todoItem.id] = todoItem;
                });
                this.save(model);
            }.bind(this))
            );
    };

    TodoListEventProcessor.prototype.observeTodoAddedEvent = function () {
        this.addDisposable(this.router
            .getEventObservable("todoList", "todoAdded")
            .observe(function (model, event) {
                var id = app.Utils.uuid();
                var todoItem = new app.model.TodoItem(id, event.title);
                model.todoItemsById[id] = todoItem;
                this.save(model);
            }.bind(this))
            );
    };

    TodoListEventProcessor.prototype.observeTodoDestroyedEvent = function () {
        this.addDisposable(this.router
            .getEventObservable("todoList", "todoDestroyed")
            .observe(function (model, event) {
                delete model.todoItemsById[event.id];
                this.save(model);
            }.bind(this))
            );
    };

    TodoListEventProcessor.prototype.observeFilterChangedEvent = function () {
        this.addDisposable(this.router
            .getEventObservable("todoList", "filterChanged")
            .observe(function (model, event) {
                model.footer.filter = event.filter;
            })
            );
    };

    TodoListEventProcessor.prototype.observeClearCompletedEvent = function () {
        this.addDisposable(this.router
            .getEventObservable("todoList", "clearCompleted")
            .observe(function (model) {
                for (var id in model.todoItemsById) {
                    if (model.todoItemsById.hasOwnProperty(id)) {
                        if (model.todoItemsById[id].complete) {
                            delete model.todoItemsById[id];
                        }
                    }
                }
                this.save(model);
            }.bind(this))
            );
    };

    TodoListEventProcessor.prototype.observeEditStartedEvent = function () {
        this.addDisposable(this.router
            .getEventObservable("todoList", "editStarted")
            .observe(function (model, event) {
                var todoItem = model.todoItemsById[event.id];
                model.todoItemsById[todoItem.id] = extend({}, todoItem, { editing: true });
            })
            );
    };

    TodoListEventProcessor.prototype.observeEditCancelledEvent = function () {
        this.addDisposable(this.router
            .getEventObservable("todoList", "editCancelled")
            .observe(function (model, event) {
                var todoItem = model.todoItemsById[event.id];
                model.todoItemsById[todoItem.id] = extend({}, todoItem, { editing: false });
            })
            );
    };

    TodoListEventProcessor.prototype.observeEditCompletedEvent = function () {
        this.addDisposable(this.router
            .getEventObservable("todoList", "editCompleted")
            .observe(function (model, event) {
                var todoItem = model.todoItemsById[event.id];
                model.todoItemsById[todoItem.id] = extend({}, todoItem, { title: event.title, editing: false });
                this.save(model);
            }.bind(this))
            );
    };

    TodoListEventProcessor.prototype.save = function (model) {
        var todoItems = [];
        for (var id in model.todoItemsById) {
            if (model.todoItemsById.hasOwnProperty(id)) {
                todoItems.push(model.todoItemsById[id]);
            }
        }
        app.Utils.store(model.localStorageKey, todoItems);
    };

    app.model.TodoListEventProcessor = TodoListEventProcessor;
}());