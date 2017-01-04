"use strict";

// Search form container, handles state changes in the application
var Search = React.createClass({
    displayName: "Search",

    // Set initial state to no search form and loading hidden
    getInitialState: function getInitialState() {
        return {
            searchTerm: "",
            display: "none",
            user: "",
            results: []
        };
    },

    // Once component mounts, get user info
    componentDidMount: function componentDidMount() {
        var self = this;

        Promise.resolve(axios.get('/get_user_info')).then(function (response) {
            console.log(response.data);
            self.setState({
                user: response.data.user,
                userLocations: response.data.userLocations
            });
        }).catch(function (error) {
            console.log(error);
            self.setState({
                user: ""
            });
        });
    },

    // submit a search using ajax
    submit: function submit(event) {
        event.preventDefault();

        var self = this;

        this.setState({
            display: "inline-block"
        });

        Promise.resolve(axios.post('/search/?term=' + this.state.searchTerm, {})).then(function (response) {
            self.setState({
                display: "none",
                results: response.data
            });
        }).catch(function (error) {
            var errorNode = document.createElement('p');
            errorNode.appendChild(document.createTextNode('Error with request'));
            document.querySelector("#search").appendChild(errorNode);

            self.setState({
                display: "none"
            });
        });
    },

    // Update the search term as the user inputs it
    searchChange: function searchChange(event) {
        this.setState({ searchTerm: event.target.value });
    },

    // Add a user going to a location
    addUserGoing: function addUserGoing(numGoing) {},

    // Render the search form
    render: function render() {
        return React.createElement(
            "div",
            { id: "search" },
            React.createElement(SearchForm, { submit: this.submit,
                searchChange: this.searchChange }),
            React.createElement(Loading, { visible: this.state.display }),
            React.createElement(ResultListContainer, { results: this.state.results,
                user: this.state.user })
        );
    }
});

// Presentation component for search form
var SearchForm = React.createClass({
    displayName: "SearchForm",

    render: function render() {
        return React.createElement(
            "form",
            { onSubmit: this.props.submit },
            React.createElement("input", { type: "text", name: "search", className: "form-control",
                placeholder: "Where are you located?",
                onChange: this.props.searchChange }),
            React.createElement(
                "button",
                { className: "search btn btn-primary btn-block btn-lg",
                    type: "submit" },
                "Find Locations"
            )
        );
    }
});

// Presentation component that holds the list of all results
var ResultListContainer = React.createClass({
    displayName: "ResultListContainer",

    render: function render() {
        var resultList = [];
        var self = this;

        this.props.results.forEach(function (item) {
            resultList.push(React.createElement(ResultContainer, { rating: item.rating_img_url_large,
                url: item.url, phone: item.display_phone,
                snippet: item.snippet_text, image: item.image_url,
                key: item.id, id: item.id, name: item.name,
                going: item.going, user: self.props.user }));
        });

        return React.createElement(
            "div",
            { className: "resultList" },
            resultList
        );
    }
});

// Presentation component container that holds the people going and the info
// for a single result
var ResultContainer = React.createClass({
    displayName: "ResultContainer",

    render: function render() {
        return React.createElement(
            "div",
            null,
            React.createElement(Going, { going: this.props.going, user: this.props.user }),
            React.createElement(
                "a",
                { href: this.props.url, target: "_blank" },
                React.createElement(Result, { rating: this.props.rating,
                    name: this.props.name,
                    phone: this.props.phone,
                    snippet: this.props.snippet,
                    image: this.props.image,
                    id: this.props.id })
            )
        );
    }
});

// Presentation component to hold info for a result from the search
var Result = React.createClass({
    displayName: "Result",

    render: function render() {
        return React.createElement(
            "div",
            { className: "result" },
            React.createElement("img", { src: this.props.image, className: "biz-img" }),
            React.createElement(
                "h1",
                null,
                this.props.name
            ),
            React.createElement(
                "p",
                null,
                this.props.snippet
            ),
            React.createElement(
                "h4",
                null,
                this.props.phone
            ),
            React.createElement("img", { src: this.props.rating,
                className: "img-responsive rating" })
        );
    }
});

// Component that holds how many people are going to a location
var Going = React.createClass({
    displayName: "Going",

    getInitialState: function getInitialState() {
        return { going: this.props.going + " Going" };
    },

    goingMouseOver: function goingMouseOver(event) {
        this.setState({ going: "I'm Going" });
    },

    goingMouseOut: function goingMouseOut(event) {
        this.setState({ going: this.props.going + " Going" });
    },

    render: function render() {
        if (!!this.props.user) {
            return React.createElement(
                "div",
                { className: "going going-login",
                    onMouseOver: this.goingMouseOver,
                    onMouseOut: this.goingMouseOut },
                this.state.going
            );
        } else {
            return React.createElement(
                "div",
                { className: "going" },
                this.state.going
            );
        }
    }
});

// Loading presentation component after user has submitted search
var Loading = React.createClass({
    displayName: "Loading",

    render: function render() {
        return React.createElement("img", { src: "/images/loading.gif", width: "50", height: "50",
            style: { display: this.props.visible } });
    }
});

ReactDOM.render(React.createElement(Search, null), document.getElementById('search'));