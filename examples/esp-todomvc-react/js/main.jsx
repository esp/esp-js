/*global React */
var app = app || {};

(function () {
    "use strict";

    var TodoItem = app.TodoItem;

    app.Main = React.createClass({

        handleToggleAll: function (event) {
            this.props.router.publishEvent("todoList", "toggleAll", { checked: event.target.checked });
        },

        render: function () {
            var main = this.props.model;
            if (main.filteredTodoItems.length === 0) {
                return null;
            }
            var todoItems = main.filteredTodoItems.map(function (todoItem) {
                return (
                    <TodoItem
                        key={todoItem.id}
                        id={todoItem.id}
                        router={this.props.router}
                        model={todoItem} />
                );
            }, this);
            return (
                <section className="main">
                    <input className="toggle-all"
                           type="checkbox"
                           onChange={this.handleToggleAll}
                           checked={main.toggleAll.checked} />
                    <ul id="todo-list" className="todo-list">
                        {todoItems}
                    </ul>
                </section>
            );
        }
    });
})();