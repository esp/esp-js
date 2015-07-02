/*global app*/

(function () {
    "use strict";

    app.model.TodoListPostEventProcessor = {
        process: function (model) {
            var filter,
                id,
                filteredTodoItems = [],
                incompleteCount = 0,
                completeCount = 0,
                count = 0,
                allChecked = true,
                todoItem;
            if (model.footer.filter === app.model.Filter.complete) {
                filter = function (todoItem) { return todoItem.complete; };
            }
            else if (model.footer.filter === app.model.Filter.active) {
                filter = function (todoItem) { return !todoItem.complete; };
            } else {
                filter = function () { return true; };
            }
            for (id in model.todoItemsById) {
                if (model.todoItemsById.hasOwnProperty(id)) {
                    todoItem = model.todoItemsById[id];
                    if (filter(todoItem)) {
                        filteredTodoItems.push(todoItem);
                        allChecked = todoItem.complete && allChecked;
                    }

                    if (!todoItem.complete) {
                        incompleteCount++;
                    } else {
                        completeCount++;
                    }

                    count++;
                }
            }
            model.main.filteredTodoItems = filteredTodoItems;
            model.main.toggleAll.visible = filteredTodoItems.length > 0;
            model.main.toggleAll.checked = filteredTodoItems.length > 0 && allChecked;
            model.footer.incompleteCount = incompleteCount;
            model.footer.visible = count > 0;
            model.footer.clearButtonVisible = completeCount > 0;
        }
    };
}());