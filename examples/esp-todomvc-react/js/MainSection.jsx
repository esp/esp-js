/*global React, window,app*/
window.app = window.app || {};

(function () {
	'use strict';

	var TodoItem = app.TodoItem;

	app.MainSection = createReactClass({

		handleToggleAll: function (event) {
			this.props.router.publishEvent(this.props.modelId, 'toggleAll', { checked: event.target.checked });
		},

		render: function () {
			var mainSection = this.props.model;

			var todoItems = mainSection.filteredTodoItems.map(function (todoItem) {
				return (
					<TodoItem
						key={todoItem.id}
						router={this.props.router}
						modelId={this.props.modelId}
						id={todoItem.id}
						model={todoItem}
					/>
				);
			}, this);

			return (
				<section className='main'>
					<input
						className='toggle-all'
					   type='checkbox'
					   onChange={this.handleToggleAll}
					   checked={mainSection.toggleAll.checked}
					/>
					<ul id='todo-list' className='todo-list'>
						{todoItems}
					</ul>
				</section>
			);
		}
	});
})();