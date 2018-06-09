/*global React, window,app*/
window.app = window.app || {};

(function () {
	'use strict';

	var ESCAPE_KEY = 27,
		ENTER_KEY = 13;

	app.TodoItem = createReactClass({

		getInitialState: function () {
			return {editText: ''};
		},

		handleDestroy: function () {
			this.props.router.publishEvent(this.props.modelId, 'todoDestroyed', { id: this.props.id });
		},

		handleSubmit: function () {
			var val = this.state.editText.trim();
			if (val) {
				this.props.router.publishEvent(this.props.modelId, 'editCompleted', { id: this.props.id, title: val });
				this.setState({editText: val});
			} else {
				this.props.router.publishEvent(this.props.modelId, 'todoDestroyed', { id: this.props.id });
			}
		},

		handleEdit: function () {
			this.setState({editText: this.props.model.title});
			this.props.router.publishEvent(this.props.modelId, 'editStarted', { id: this.props.id });
		},

		handleKeyDown: function (event) {
			if (event.which === ESCAPE_KEY) {
				this.setState({editText: this.props.model.title});
				this.props.router.publishEvent(this.props.modelId, 'editCancelled', { id: this.props.id });
			} else if (event.which === ENTER_KEY) {
				this.handleSubmit(event);
			}
		},

		handleChange: function (event) {
			this.setState({editText: event.target.value});
		},

		handleToggle: function () {
			this.props.router.publishEvent(this.props.modelId, 'todoToggled', { id: this.props.id });
		},

		/**
		 * This is a completely optional performance enhancement that you can
		 * implement on any React component. If you were to delete this method
		 * the app would still work correctly (and still be very performant!), we
		 * just use it as an example of how little code it takes to get an order
		 * of magnitude performance improvement.
		 */
		shouldComponentUpdate: function (nextProps, nextState) {
			return (
				nextProps.model !== this.props.model ||
				nextState.editText !== this.state.editText
			);
		},

		/**
		 * Safely manipulate the DOM after updating the state when invoking
		 * `this.props.onEdit()` in the `handleEdit` method above.
		 * For more info refer to notes at https://facebook.github.io/react/docs/component-api.html#setstate
		 * and https://facebook.github.io/react/docs/component-specs.html#updating-componentdidupdate
		 */
		componentDidUpdate: function (prevProps) {
			var node;
			if (!prevProps.model.editing && this.props.model.editing) {
				node = React.findDOMNode(this.refs.editField);
				node.focus();
				node.setSelectionRange(node.value.length, node.value.length);
			}
		},

		render: function () {
			var todoItem = this.props.model;

			return (
				<li className={classNames({
					completed: todoItem.complete,
					editing: todoItem.editing
				})}>
					<div className='view'>
						<input
							className='toggle'
							type='checkbox'
							checked={todoItem.complete}
							onChange={this.handleToggle}
						/>
						<label onDoubleClick={this.handleEdit}>
							{todoItem.title}
						</label>
						<button className='destroy' onClick={this.handleDestroy} />
					</div>
					<input
						ref='editField'
						className='edit'
						value={this.state.editText}
						onBlur={this.handleSubmit}
						onChange={this.handleChange}
						onKeyDown={this.handleKeyDown}
					/>
				</li>
			);
		}
	});
}());