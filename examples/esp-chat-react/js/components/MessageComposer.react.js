"use strict";

var React = require('react');

var ENTER_KEY = 13;

var MessageComposer = React.createClass({
    getInitialState: function () {
        return {text: ''};
    },

    onChange: function (event) {
        this.setState({text: event.target.value});
    },

    onKeyDown: function (event) {
        if (event.keyCode === ENTER_KEY) {
            event.preventDefault();
            var text = this.state.text.trim();
            if (text) {
                this.props.router.publishEvent(this.props.modelId, "messageSent", { text: text });
            }
            this.setState({text: ''});
        }
    },

    render: function () {
        return (
            <textarea
                className="message-composer"
                name="message"
                value={this.state.text}
                onChange={this.onChange}
                onKeyDown={this.onKeyDown}
            />
        );
    }
});

module.exports = MessageComposer;
