// Search form container, handles state changes in the application
var Search = React.createClass({
    // Set initial state to no search form and loading hidden
    getInitialState: function() {
        return {
            searchTerm: "",
            display: "none",
            user: "",
            results: []
        };
    },

    // Once component mounts, get user info
    componentDidMount: function() {
        var self = this;

        Promise.resolve(axios.get('/get_user_info'))
            .then(function(response) {
                console.log(response.data);
                self.setState({
                    user: response.data.user,
                    userLocations: response.data.userLocations
                });
            })
            .catch(function(error) {
                console.log(error);
                self.setState({
                    user: ""
                });
            });
    },

    // submit a search using ajax
    submit: function(event) {
        event.preventDefault();

        var self = this;

        this.setState({
            display: "inline-block"
        });

        Promise.resolve(axios.post('/search/?term=' + this.state.searchTerm, { }))
            .then(function(response) {
                self.setState({
                    display: "none",
                    results: response.data
                });
            })
            .catch(function(error) {
                var errorNode = document.createElement('p');
                errorNode.appendChild(document.createTextNode('Error with request'));
                document.querySelector("#search").appendChild(errorNode);

                self.setState({
                    display: "none"
                });
            });
    },

    // Update the search term as the user inputs it
    searchChange: function(event) {
        this.setState({ searchTerm: event.target.value });
    },

    // Add a user going to a location
    addUserGoing: function(numGoing) {

    },

    // Render the search form
    render: function() {
        return (
            <div id="search">
                <SearchForm submit={this.submit}
                    searchChange={this.searchChange} />
                <Loading visible={this.state.display} />
                <ResultListContainer results={this.state.results}
                    user={this.state.user} />
            </div>
        );
    }
});

// Presentation component for search form
var SearchForm = React.createClass({
    render: function() {
        return (
            <form onSubmit={this.props.submit}>
                <input type="text" name="search" className="form-control"
                    placeholder="Where are you located?"
                    onChange={this.props.searchChange} />
                <button className="search btn btn-primary btn-block btn-lg"
                    type="submit">
                    Find Locations
                </button>
            </form>
        );
    }
});

// Presentation component that holds the list of all results
var ResultListContainer = React.createClass({
    render: function() {
        var resultList = [];
        var self = this;

        this.props.results.forEach(function(item) {
            resultList.push(
                <ResultContainer rating={item.rating_img_url_large}
                        url={item.url} phone={item.display_phone}
                        snippet={item.snippet_text} image={item.image_url}
                        key={item.id} id={item.id} name={item.name}
                        going={item.going} user={self.props.user} />
            );
        });

        return (
            <div className="resultList">
                { resultList }
            </div>
        );
    }
});

// Presentation component container that holds the people going and the info
// for a single result
var ResultContainer = React.createClass({
    render: function() {
        return (
            <div>
                <Going going={this.props.going} user={this.props.user} />
                <a href={this.props.url} target="_blank">
                    <Result rating={this.props.rating}
                            name={this.props.name}
                            phone={this.props.phone}
                            snippet={this.props.snippet}
                            image={this.props.image}
                            id={this.props.id} />
                </a>
            </div>
        );
    }
});

// Presentation component to hold info for a result from the search
var Result = React.createClass({
    render: function() {
        return (
            <div className="result">
                    <img src={this.props.image} className="biz-img" />
                    <h1>{this.props.name}</h1>
                    <p>{this.props.snippet}</p>
                    <h4>{this.props.phone}</h4>
                    <img src={this.props.rating}
                        className="img-responsive rating" />
            </div>
        );
    }
});

// Component that holds how many people are going to a location
var Going = React.createClass({
    getInitialState: function() {
        return { going: this.props.going + " Going" };
    },

    goingMouseOver: function(event) {
        this.setState({ going: "I'm Going" });
    },

    goingMouseOut: function(event) {
        this.setState({ going: this.props.going + " Going" });
    },

    render: function() {
        if (!!this.props.user) {
            return (
                <div className="going going-login"
                    onMouseOver={this.goingMouseOver}
                    onMouseOut={this.goingMouseOut}>
                    { this.state.going }
                </div>
            );
        }
        else {
            return (
                <div className="going">
                    {this.state.going}
                </div>
            );
        }
    }
});

// Loading presentation component after user has submitted search
var Loading = React.createClass({
    render: function() {
        return (
            <img src="/images/loading.gif" width="50" height="50"
                style={{display: this.props.visible}} />
        );
    }
});

ReactDOM.render(<Search />, document.getElementById('search'));
