"use strict";

// User destinations state component
var Destinations = React.createClass({
    displayName: "Destinations",

    getInitialState: function getInitialState() {
        return {
            user: "",
            userLocations: []
        };
    },

    componentDidMount: function componentDidMount() {
        var self = this;

        axios.get('/get_user_info').then(function (response) {
            console.log(response);
            self.setState({
                user: response.data.user,
                userLocations: response.data.userLocations
            });
        }).catch(function (error) {
            console.log(error);
            self.setState({
                user: "",
                userLocations: []
            });
        });
    },

    render: function render() {
        return React.createElement(DestinationContainer, { locations: this.state.userLocations });
    }
});

var DestinationContainer = React.createClass({
    displayName: "DestinationContainer",

    render: function render() {
        return React.createElement(
            "div",
            { className: "destinations" },
            React.createElement(
                "div",
                { className: "header" },
                "Destinations For Tonight"
            ),
            React.createElement(
                "div",
                { className: "content" },
                React.createElement(
                    "ul",
                    null,
                    this.props.locations.forEach(function (location) {
                        console.log(location);
                        return React.createElement(
                            "li",
                            null,
                            React.createElement(Destination, { location: location })
                        );
                    })
                )
            )
        );
    }
});

var Destination = React.createClass({
    displayName: "Destination",

    render: function render() {
        console.log(this.props.location);
        return React.createElement(
            "div",
            null,
            this.props.location
        );
    }
});

ReactDOM.render(React.createElement(Destinations, null), document.getElementById("destinations"));