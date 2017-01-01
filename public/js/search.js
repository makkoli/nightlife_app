"use strict";

// Search form
var Search = React.createClass({
    displayName: "Search",

    // Set initial state to no search form and loading hidden
    getInitialState: function getInitialState() {
        return {
            searchTerm: "",
            display: "none",
            results: []
        };
    },

    // submit a search using ajax
    submit: function submit(event) {
        event.preventDefault();

        var self = this;

        this.setState({
            display: "inline-block"
        });

        var data = {
            searchTerm: this.state.searchTerm
        };

        $.ajax({
            type: 'POST',
            url: '/',
            data: data
        }).done(function (data) {
            data = JSON.parse(data);
            console.log(data);
            var resultList = [];

            data.forEach(function (item) {
                resultList.push(React.createElement(ResultHolder, { rating: item.rating_img_url_large,
                    url: item.url, phone: item.display_phone,
                    snippet: item.snippet_text, image: item.image_url,
                    key: item.id, id: item.id, name: item.name,
                    going: item.going }));
            });

            self.setState({
                display: "none",
                results: resultList
            });
        }).fail(function (jqXhr) {
            $("#search").append("<p>Error with request</p>");
        });
    },

    // Update the search term as the user inputs it
    searchChange: function searchChange(event) {
        this.setState({ searchTerm: event.target.value });
    },

    // Render the search form
    render: function render() {
        return React.createElement(
            "div",
            { id: "search" },
            React.createElement(
                "form",
                { onSubmit: this.submit },
                React.createElement("input", { type: "text", name: "search", className: "form-control", placeholder: "Where are you located?", onChange: this.searchChange }),
                React.createElement(
                    "button",
                    { className: "search btn btn-primary btn-block btn-lg", type: "submit" },
                    "Find Locations"
                )
            ),
            React.createElement(Loading, { visible: this.state.display }),
            React.createElement(
                "div",
                { className: "resultList" },
                this.state.results
            )
        );
    }
});

// Component that holds the people going and the results
var ResultHolder = React.createClass({
    displayName: "ResultHolder",

    render: function render() {
        return React.createElement(
            "div",
            null,
            React.createElement(Going, { going: this.props.going }),
            React.createElement(Result, { rating: this.props.rating,
                name: this.props.name,
                url: this.props.url, phone: this.props.phone,
                snippet: this.props.snippet,
                image: this.props.image, id: this.props.id })
        );
    }
});

// Component to hold a result from the search
var Result = React.createClass({
    displayName: "Result",

    render: function render() {
        return React.createElement(
            "div",
            { className: "result" },
            React.createElement(
                "a",
                { href: this.props.url, target: "_blank" },
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
                React.createElement("img", { src: this.props.rating, className: "img-responsive rating" })
            )
        );
    }
});

// Component that holds how many people are going to a location
var Going = React.createClass({
    displayName: "Going",

    render: function render() {
        return React.createElement(
            "div",
            { className: "going" },
            this.props.going,
            " Going"
        );
    }
});

// Loading component after user has submitted search
var Loading = React.createClass({
    displayName: "Loading",

    render: function render() {
        return React.createElement("img", { src: "/images/loading.gif", width: "50", height: "50", style: { display: this.props.visible } });
    }
});

ReactDOM.render(React.createElement(Search, null), document.getElementById('search'));