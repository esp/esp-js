import React from 'react';

var ENTER_KEY = 13;

export default class MessageComposer extends React.Component {
    getInitialState() {
        return {text: ''};
    }

    onChange(event) {
        this.setState({text: event.target.value});
    }

    onKeyDown(event) {
        if (event.keyCode === ENTER_KEY) {
            event.preventDefault();
            var text = this.state.text.trim();
            if (text) {
                this.props.router.publishEvent("messageSent", { text: text });
            }
            this.setState({text: ''});
        }
    }

    render() {
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
}
