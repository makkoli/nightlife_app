// User destinations state component
var Destinations = React.createClass({
    getInitialState: function() {
        return {
            user: "",
            userLocations: []
        };
    },

    componentDidMount: function() {
        var self = this;

        axios.get('/get_user_info')
            .then(function(response) {
                console.log(response);
                self.setState({
                    user: response.data.user,
                    userLocations: response.data.userLocations
                });
            })
            .catch(function(error) {
                console.log(error);
                self.setState({
                    user: "",
                    userLocations: []
                });
            });
    },

    render: function() {
        return (
            <DestinationContainer locations={this.state.userLocations} />
        );
    }
});

var DestinationContainer = React.createClass({
    render: function() {
        return (
            <div className="destinations">
                <div className="header">
                    Destinations For Tonight
                </div>
                <div className="content">
                    <ul>
                        {this.props.locations.forEach(function(location) {
                            console.log(location);
                            return <li><Destination location={location} /></li>;
                        })}
                    </ul>
                </div>
            </div>
        );
    }
});

var Destination = React.createClass({
    render: function() {
        console.log(this.props.location);
        return (
            <div>
                {this.props.location}
            </div>
        );
    }
});

ReactDOM.render(<Destinations />, document.getElementById("destinations"));
