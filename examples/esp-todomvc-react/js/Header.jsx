/*global React, window,app*/
window.app = window.app || {};

(function () {
    "use strict";

    var ENTER_KEY = 13;

    app.Header = React.createClass({

        handleKeyDown: function (event) {
            if (event.keyCode !== ENTER_KEY) {
                return;
            }
            event.preventDefault();
            var inputField = React.findDOMNode(this.refs.newField);
            var val = inputField.value.trim();
            if (val) {
                this.props.router.publishEvent(this.props.modelId, "todoAdded", { title: val });
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