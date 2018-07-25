import React from 'react';

var ENTER_KEY = 13;

export default class MessageComposer extends React.Component {
    constructor() {
        super();
        this.state = {text: ''};
        this._onChange = this._onChange.bind(this)
        this._onKeyDown = this._onKeyDown.bind(this)
    }
    _onChange(event) {
        this.setState({text: event.target.value});
    }
    _onKeyDown(event) {
        if (event.keyCode === ENTER_KEY) {
            event.preventDefault();
            var text = this.state.text.trim();
            if (text) {
                this.props.router.publishEvent("MessageSent", { text: text });
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
                onChange={this._onChange}
                onKeyDown={this._onKeyDown}
            />
        );
    }
}
