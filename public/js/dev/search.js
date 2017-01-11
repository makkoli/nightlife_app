// Search form container, handles state changes in the application
var Search = React.createClass({
    // Set initial state to no search form and loading hidden
    getInitialState: function() {
        return {
            searchTerm: "",
            display: "none",
            user: "",
            lastSearch: "",
            results: []
        };
    },

    // Initialize component once mounted
    componentDidMount: function() {
        var self = this;

        axios.get('/initSearch')
            .then(function(response) {
                self.setState({
                    user: response.data.user
                });

                if (!!response.data.lastSearch) {
                    self.getSearch(response.data.lastSearch);
                }
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
        this.getSearch(this.state.searchTerm);
    },

    // Sends a request to the server to get the locales
    getSearch: function(searchTerm) {
        var self = this;

        this.setState({
            display: "inline-block"
        });

        axios.post('/search/?term=' + searchTerm, { })
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
                        going={item.going} user={self.props.user}
                        userGoing={item.userGoing} />
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
                <Going going={this.props.going} user={this.props.user}
                    userGoing={this.props.userGoing} id={this.props.id}
                    name={this.props.name} url={this.props.url}
                    user={this.props.user} />
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
        return {
            going: this.props.going + " Going",
            numGoing: this.props.going,
            userGoing: this.props.userGoing
        };
    },

    // Change to indicate user can add or has been added to this locale
    goingMouseOver: function(goingStr, event) {
        this.setState({ going: goingStr });
    },

    // Revert back to normal once user mouses out
    goingMouseOut: function(event) {
        this.setState({ going: this.state.numGoing + " Going" });
    },

    // Add a user to a locale
    goingOnClick: function(event) {
        var self = this;

        axios.post('/add_user/?id=' + this.props.id + '&name=' +
                    this.props.name + '&url=' + this.props.url, { })
            .then(function(response) {
                self.setState({
                    going: Number(self.state.numGoing++) + " Going",
                    numGoing: self.state.numGoing++,
                    userGoing: true
                });
            })
            .catch(function(error) {
                console.log(error);
            });
    },

    render: function() {
        // If the user is logged in
        if (!!this.props.user) {
            // If the user is going to this location
            if (this.state.userGoing) {
                return (
                    <div className="going user-login"
                        onMouseOver={this.goingMouseOver.bind(null, "You\'re Added")}
                        onMouseOut={this.goingMouseOut}>
                        { this.state.going }
                    </div>
                );
            }
            // Else, the user is not going to this location
            else {
                return (
                    <div className="going user-login"
                        onMouseOver={this.goingMouseOver.bind(null, "Add Me")}
                        onMouseOut={this.goingMouseOut}
                        onClick={this.goingOnClick.bind(null, this.props.id)}>
                        { this.state.going }
                    </div>
                );
            }
        }
        // Else, the user is not logged in
        else {
            return (
                <div className="going">
                    { this.state.going }
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
