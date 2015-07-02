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
            var val = React.findDOMNode(this.refs.newField).value.trim();
            if (val) {
                this.props.router.publishEvent("todoList", "todoAdded", { title: val });
                React.findDOMNode(this.refs.newField).value = "";
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