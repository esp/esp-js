var app = app || {};

(function () {
	'use strict';

	app.model.TodoItem = function (id, title) {
		this.id = id;
		this.title = title;
		this.complete = false;
		this.editing = false;
	};
}());
