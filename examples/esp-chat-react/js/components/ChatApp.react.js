"use strict";

var MessageSection = require('./MessageSection.react');
var React = require('react');
var ThreadSection = require('./ThreadSection.react');
var modelRouter = require('../model/modelRouter');

var ChatApp = React.createClass({
    render: function () {
        return (
            <div className="chatapp">
                <ThreadSection />
                <MessageSection />
            </div>
        );
    }
});

module.exports = ChatApp;
