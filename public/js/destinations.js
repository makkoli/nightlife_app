'use strict';

// User destinations state component
var Destinations = React.createClass({
    displayName: 'Destinations',

    getInitialState: function getInitialState() {
        return {
            userDestinations: []
        };
    },

    componentDidMount: function componentDidMount() {
        var self = this;

        axios.get('/destinations').then(function (response) {
            self.setState({
                userDestinations: response.data
            });
        }).catch(function (error) {
            console.log(error);
            self.setState({
                userDestinations: []
            });
        });
    },

    // Deletes a destination in the users list
    deleteDestination: function deleteDestination(destId) {
        var self = this;

        axios.post('/delete_destination?destId=' + destId, {}).then(function (response) {
            var destinations = self.state.userDestinations.filter(function (destination) {
                return destination.id !== destId;
            });

            self.setState({
                userDestinations: destinations
            });
        }).catch(function (error) {
            console.log(error);
            var errorNode = document.createElement('p');
            errorNode.appendChild(document.createTextNode('Error with request'));
            document.querySelector("#destinations").appendChild(errorNode);
        });
    },

    render: function render() {
        return React.createElement(DestinationContainer, { destinations: this.state.userDestinations,
            deleteDestination: this.deleteDestination });
    }
});

// Presentation component for the list of destinations
var DestinationContainer = React.createClass({
    displayName: 'DestinationContainer',

    render: function render() {
        var self = this;

        return React.createElement(
            'table',
            { className: 'table destinations' },
            React.createElement(
                'caption',
                { style: { "fontSize": "x-large" } },
                'Destinations for Tonight'
            ),
            React.createElement(
                'thead',
                null,
                React.createElement(
                    'tr',
                    null,
                    React.createElement(
                        'th',
                        null,
                        'Name'
                    ),
                    React.createElement(
                        'th',
                        { style: { "textAlign": "right" } },
                        'Going'
                    ),
                    React.createElement('th', null)
                )
            ),
            React.createElement(
                'tbody',
                null,
                this.props.destinations.map(function (destination) {
                    return React.createElement(Destination, { name: destination.name,
                        going: destination.going,
                        url: destination.url,
                        id: destination.id,
                        deleteDestination: self.props.deleteDestination,
                        key: destination.name });
                })
            )
        );
    }
});

// Presentation component for a single destination
var Destination = React.createClass({
    displayName: 'Destination',

    render: function render() {
        return React.createElement(
            'tr',
            null,
            React.createElement(
                'td',
                null,
                React.createElement(
                    'a',
                    { href: this.props.url, target: '_blank' },
                    this.props.name
                )
            ),
            React.createElement(
                'td',
                { style: { "textAlign": "right" } },
                this.props.going
            ),
            React.createElement(
                'td',
                { style: { "textAlign": "right" } },
                React.createElement(
                    'u',
                    { style: { "cursor": "pointer" },
                        onClick: this.props.deleteDestination.bind(null, this.props.id) },
                    'Delete'
                )
            )
        );
    }
});

ReactDOM.render(React.createElement(Destinations, null), document.getElementById("destinations"));