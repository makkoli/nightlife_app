'use strict';

var React = require('react');

var Search = React.createClass({
    displayName: 'Search',

    getInitialState: function getInitialState() {
        return {
            message: ''
        };
    },

    render: function render() {
        return React.createElement(
            'form',
            null,
            React.createElement('input', { type: 'text', name: 'search', className: 'form-control', placeholder: 'Where are you located?' }),
            React.createElement(
                'button',
                { className: 'search btn btn-primary btn-block btn-lg', type: 'button' },
                'Find Locations'
            )
        );
    }
});