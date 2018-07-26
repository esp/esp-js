/*global app*/
(function () {
	'use strict';

	var ModelBootstrapper = function (router, modelId) {
		this.router = router;
		this.modelId = modelId;
	};

	ModelBootstrapper.prototype.start = function () {
		var model = new app.model.TodoList('esp-todomvc-react');
		this.router.addModel(this.modelId, model, { postEventProcessor: app.model.TodoListPostEventProcessor });
		var todoListEventProcessor = new app.model.TodoListEventProcessor(this.router, this.modelId);
		todoListEventProcessor.start();
	};

	app.model.ModelBootstrapper = ModelBootstrapper;
}());
