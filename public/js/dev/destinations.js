// User destinations
var Destinations = React.createClass({
    componentDidMount: function() {

    },

    render: function() {
        console.log(document.querySelector("#destinations").getAttribute("data-user"));
        // Render nothing if no user
        if (this.props.user === "") {
            return;
        }
        // Else, render the user"s destinations
        else {
            return (
                <div className="destinations">
                    <div className="header">
                        test
                    </div>
                    <div className="content">
                        <ul>
                            <li>test</li>
                        </ul>
                    </div>
                </div>
            );
        }
    }
});

ReactDOM.render(<Destinations />, document.getElementById("destinations"));
