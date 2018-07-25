var app = app || {};

(function () {
	'use strict';

	app.model.TodoList = function (localStorageKey) {
		this.localStorageKey = localStorageKey;
		this.todoItemsById = {};
		this.mainSection = {
			visible: false,
			toggleAll: {
				visible: false,
				checked: false
			},
			filteredTodoItems: []
		};
		this.footer = {
			visible: false,
			incompleteCount: 0,
			filter: app.model.Filter.all,
			clearButton: {
				visible: false
			}
		};
	};
}());
