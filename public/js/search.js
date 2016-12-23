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
            var resultList = [];

            data.businesses.forEach(function (item) {
                resultList.push(React.createElement(Result, { rating: item.rating_img_url_large, name: item.name,
                    url: item.url, phone: item.display_phone,
                    snippet: item.snippet_text, image: item.image_url,
                    review_count: item.review_count, key: item.id,
                    closed: item.is_closed }));
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
                React.createElement("img", { src: this.props.image, className: "img-responsive biz-img" }),
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
                    { className: "phone" },
                    this.props.phone
                ),
                React.createElement(
                    "h4",
                    null,
                    this.props.review_count,
                    " Reviews"
                ),
                React.createElement("img", { src: this.props.rating, className: "img-responsive rating" })
            )
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