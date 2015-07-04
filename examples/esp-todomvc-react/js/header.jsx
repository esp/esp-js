/*global React*/
var app = app || {};

(function () {
    "use strict";

    app.Header = React.createClass({

        handleKeyDown: function (event) {
            if (event.keyCode !== 13) { // enter key
                return;
            }
            event.preventDefault();
            var inputField = React.findDOMNode(this.refs.newField);
            var val = inputField.value.trim();
            if (val) {
                this.props.router.publishEvent("todoList", "todoAdded", { title: val });
                inputField.value = "";
            }
        },

        render: function () {
            return (
                <header id="header">
                    <h1>todos</h1>
                    <input
                        ref="newField"
                        id="new-todo"
                        className="new-todo"
                        placeholder="What needs to be done?"
                        onKeyDown={this.handleKeyDown}
                        autoFocus={true}
                        />
                </header>
            );
        }
    });
}());