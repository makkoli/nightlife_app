// User destinations state component
var Destinations = React.createClass({
    getInitialState: function() {
        return {
            userDestinations: []
        };
    },

    componentDidMount: function() {
        var self = this;

        axios.get('/destinations')
            .then(function(response) {
                self.setState({
                    userDestinations: response.data
                });
            })
            .catch(function(error) {
                console.log(error);
                self.setState({
                    userDestinations: []
                });
            });
    },

    // Deletes a destination in the users list
    deleteDestination: function(destId) {
        var self = this;

        axios.post('/delete_destination?destId=' + destId, { })
            .then(function(response) {
                var destinations = self.state.userDestinations.filter(function(destination) {
                    return destination.id !== destId;
                });

                self.setState({
                    userDestinations: destinations
                });
            })
            .catch(function(error) {
                console.log(error);
                var errorNode = document.createElement('p');
                errorNode.appendChild(document.createTextNode('Error with request'));
                document.querySelector("#destinations").appendChild(errorNode);
            });
    },

    render: function() {
        return (
            <DestinationContainer destinations={this.state.userDestinations}
                deleteDestination={this.deleteDestination} />
        );
    }
});

// Presentation component for the list of destinations
var DestinationContainer = React.createClass({
    render: function() {
        var self = this;

        return (
            <table className="table destinations">
                <caption style={{"fontSize": "x-large"}}>
                    Destinations for Tonight
                </caption>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th style={{"textAlign": "right"}}>Going</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {this.props.destinations.map(function(destination) {
                        return <Destination name={destination.name}
                                going={destination.going}
                                url={destination.url}
                                id={destination.id}
                                deleteDestination={self.props.deleteDestination}
                                key={destination.name} />;
                    })}
                </tbody>
            </table>
        );
    }
});

// Presentation component for a single destination
var Destination = React.createClass({
    render: function() {
        return (
            <tr>
                <td>
                    <a href={this.props.url} target="_blank">
                        {this.props.name}
                    </a>
                </td>
                <td style={{"textAlign": "right"}}>
                    {this.props.going}
                </td>
                <td style={{"textAlign": "right"}}>
                    <u style={{"cursor": "pointer"}}
                        onClick={this.props.deleteDestination
                        .bind(null, this.props.id)}>
                        Delete
                    </u>
                </td>
            </tr>
        );
    }
});

ReactDOM.render(<Destinations />, document.getElementById("destinations"));
