/*global React*/
var app = app || {};

(function () {
    "use strict";

    app.Footer = React.createClass({

        handleClear: function () {
            this.props.router.publishEvent("todoList", "clearCompleted", {});
        },

        render: function () {
            var footer = this.props.model;
            if (!footer.visible) {
                return null;
            }
            var incompleteCountLabel = app.Utils.pluralize(footer.incompleteCount, "item");
            var clearButton = null;
            if (footer.clearButtonVisible) {
                clearButton = (
                    <button
                        className="clear-completed"
                        onClick={this.handleClear}>
                        Clear completed
                    </button>
                );
            }
            return (
                <footer className="footer">
					<span className="todo-count">
						<strong>{footer.incompleteCount}</strong> {incompleteCountLabel} left
					</span>
                    <ul className="filters">
                        <li>
                            <a
                                href="#/"
                                className={React.addons.classSet({selected: footer.filter === app.model.Filter.all})}>
                                All
                            </a>
                        </li>
                        {" "}
                        <li>
                            <a
                                href="#/active"
                                className={React.addons.classSet({selected: footer.filter === app.model.Filter.active})}>
                                Active
                            </a>
                        </li>
                        {" "}
                        <li>
                            <a
                                href="#/completed"
                                className={React.addons.classSet({selected: footer.filter === app.model.Filter.complete})}>
                                Completed
                            </a>
                        </li>
                    </ul>
                    {clearButton}
                </footer>
            );
        }
    });
}());