"use strict";

var MessageSection = require('./MessageSection.react');
var React = require('react');
var ThreadSection = require('./ThreadSection.react');

var ChatApp = React.createClass({

    componentWillMount: function () {
        this.props.router
            .getModelObservable(this.props.modelId)
            .observe(function (model) {
                this.setState({ model: model });
            }.bind(this));
    },

    render: function () {
        if (this.state === null) {
            return null;
        }
        var chatAppModel = this.state.model;
        return (
            <div className="chatapp">
                <ThreadSection
                    router={this.props.router}
                    modelId={this.props.modelId}
                    model={chatAppModel.threadSection}
                />
                <MessageSection
                    router={this.props.router}
                    modelId={this.props.modelId}
                    model={chatAppModel.messageSection}
                />
            </div>
        );
    }
});

module.exports = ChatApp;
