"use strict";

// User destinations
var Destinations = React.createClass({
    displayName: "Destinations",

    getInitialProps: function getInitialProps() {
        return {
            user: $("#destinations").attr("data-user")
        };
    },

    render: function render() {
        console.log($("#destinations").attr("data-user"));
        // Render nothing if no user
        if (this.props.user === "") {
            return;
        }
        // Else, render the user"s destinations
        else {
                return React.createElement(
                    "div",
                    { className: "destinations" },
                    React.createElement(
                        "div",
                        { className: "header" },
                        "test"
                    ),
                    React.createElement(
                        "div",
                        { className: "content" },
                        React.createElement(
                            "ul",
                            null,
                            React.createElement(
                                "li",
                                null,
                                "test"
                            )
                        )
                    )
                );
            }
    }
});

ReactDOM.render(React.createElement(Destinations, null), document.getElementById("destinations"));