// Search form
var Search = React.createClass({
    // Set initial state to no search form and loading hidden
    getInitialState: function() {
        return {
            searchTerm: "",
            display: "none",
            results: []
        };
    },

    // submit a search using ajax
    submit: function(event) {
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
        })
        .done(function(data) {
            data = JSON.parse(data);
            var resultList = [];

            data.businesses.forEach(function(item) {
                resultList.push(
                    <Result rating={item.rating_img_url_large} name={item.name}
                            url={item.url} phone={item.display_phone}
                            snippet={item.snippet_text} image={item.image_url}
                            review_count={item.review_count} key={item.id}
                            closed={item.is_closed} />
                );
            });

            self.setState({
                display: "none",
                results: resultList
            });
        })
        .fail(function(jqXhr) {
            $("#search").append("<p>Error with request</p>");
        });
    },

    // Update the search term as the user inputs it
    searchChange: function(event) {
        this.setState({ searchTerm: event.target.value });
    },

    // Render the search form
    render: function() {
        return (
            <div id="search">
                <form onSubmit={this.submit}>
                    <input type="text" name="search" className="form-control" placeholder="Where are you located?" onChange={this.searchChange} />
                    <button className="search btn btn-primary btn-block btn-lg" type="submit">
                        Find Locations
                    </button>
                </form>
                <Loading visible={this.state.display} />
                <div className="resultList">
                    { this.state.results }
                </div>
            </div>
        );
    }
});

// Component to hold a result from the search
var Result = React.createClass({
    render: function() {
        return (
            <div className="result">
                <a href={this.props.url} target="_blank">
                    <img src={this.props.image} className="img-responsive biz-img" />
                    <h1>{this.props.name}</h1>
                    <p>{this.props.snippet}</p>
                    <h4>{this.props.phone}</h4>
                    <h4>{this.props.review_count} Reviews</h4>
                    <img src={this.props.rating} className="img-responsive rating" />
                </a>
            </div>
        );
    }
});

// Loading component after user has submitted search
var Loading = React.createClass({
    render: function() {
        return (
            <img src="/images/loading.gif" width="50" height="50" style={{display: this.props.visible}} />
        );
    }
});

ReactDOM.render(<Search />, document.getElementById('search'));
