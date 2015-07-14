/*global app*/

(function () {
	'use strict';

	app.model.TodoListPostEventProcessor = {
		process: function (model) {
			var filteredTodoItems = [];
			var incompleteCount = 0;
			var completeCount = 0;
			var count = 0;
			var allChecked = true;
			var filter;
			var id;
			var todoItem;

			if (model.footer.filter === app.model.Filter.complete) {
				filter = function (todoItem) { return todoItem.complete; };
			} else if (model.footer.filter === app.model.Filter.active) {
				filter = function (todoItem) { return !todoItem.complete; };
			} else {
				filter = function () { return true; };
			}

			var ids = Object.keys(model.todoItemsById);
			for (var i = 0; i < ids.length; i++) {
				id = ids[i];
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

			model.mainSection.visible = filteredTodoItems.length > 0;
			model.mainSection.filteredTodoItems = filteredTodoItems;
			model.mainSection.toggleAll.visible = filteredTodoItems.length > 0;
			model.mainSection.toggleAll.checked = filteredTodoItems.length > 0 && allChecked;
			model.footer.incompleteCount = incompleteCount;
			model.footer.visible = count > 0;
			model.footer.clearButtonVisible = completeCount > 0;
		}
	};
}());
