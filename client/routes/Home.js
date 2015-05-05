var React = require('react');

var WalmartComponents = require('./Home-Walmart-Components');
var WalmartRelatedResultsDisplay = WalmartComponents.WalmartRelatedResultsDisplay;

var ReviewComponents = require('./Home-Reviews-Components');
var ReviewsDisplay = ReviewComponents.ReviewsDisplay;
var WalmartIndividualReviewDisplay = ReviewComponents.WalmartIndividualReviewDisplay;
var BestbuyIndividualReviewDisplay = ReviewComponents.BestbuyIndividualReviewDisplay;

// var AmazonComponents = require('./Home-Amazon-Components');
// var AmazonRelatedResultsDisplay = AmazonComponents.AmazonRelatedResultsDisplay;
// var AmazonIndividualResultDisplay = AmazonComponents.AmazonIndividualResultDisplay;

var BestbuyComponents = require('./Home-Bestbuy-Components');
var BestbuyRelatedResultsDisplay = BestbuyComponents.BestbuyRelatedResultsDisplay;


var D3Components = require('./D3-Chart');
var D3Chart = D3Components.D3Chart;

var D3PriceChart = require('./D3-Price-Chart');

// Centralized display for all components on the Home page
var DisplayBox = React.createClass({
  // Sets initial state properties to empty arrays to avoid undefined errors
  getInitialState: function() {
    return {
      // We set the initial state to the format {'API name': [Array of results]}
      // to help organize the results we get back from the server, since the
      // general-query request returns results from three different APIs
      amazon: {results: []},
      walmart: {results: []},
      bestbuy: {results: []},
      allReviews: {reviewSets: []}
    };
  },

  // Called when user submits a query
  handleQuerySubmit: function(query) {
    $.ajax({
      url: 'general-query',
      dataType: 'json',
      type: 'POST',
      data: query,
      success: function(data) {
        // Show Related Results after user submits query
        $('.related-results-display-container').fadeIn();
        $('.logo-container').slideUp();
        $('.query-form').find('input').attr('placeholder', 'Search again');

        // Show D3 price chart
        $('.d3-price-container').show();

        // Set the state to contain data for each separate API
        // data[0] --> {walmart: [Array of Walmart results]}
        // data[1] --> {amazon: [Array of Amazon results]}
        // data[2] --> {bestbuy: [Array of Best Buy results]}
        var wmResults = {results: data[0].walmart};
        var bbResults = {results: data[1].bestbuy};
        this.setState({
          walmart: wmResults,
          bestbuy: bbResults,
          // We removed Amazon because they do not allow keys to be in our public repo
          // amazon: data[2],
          query: query.query
        });

        // initialize d3 price chart
        // params are (width, height)
        this.refs.d3PriceChart.startEngine(500, 275);

        // Hide the spinner after all API requests have been completed
        $('.query-form-container img').hide();

      }.bind(this),
      error: function(xhr, status, err) {
        console.error('general-query', status, err.toString());
      }.bind(this)
    });
  },

  // Final handler for reviews request
  // This call is the result of calls bubbling up from the individual review results
  // var "id" may be itemId or SKU
  handleReviewRequest: function(id, site, name, image) {

    // Sets the product name and image for the product clicked on (Revews Display)
    // These are passed up from WalmartIndividualResultDisplay
    this.setState({
      ReviewedItemName: name,
      ReviewedItemImage: image
    });

    var queryUrl;

    if (site === 'Walmart') {
      queryUrl = 'get-walmart-reviews';
    } else if (site === 'Best Buy') {
      queryUrl = 'get-bestbuy-reviews';
    }

    // Makes a specific API call to get reviews for the product clicked on
    $.ajax({
      url: queryUrl,
      dataType: 'json',
      type: 'POST',
      // "id" is itemId for Walmart
      // and it's SKU for Best Buy
      data: id,
      success: function(data) {

        // Remove the general results display to display reviews
        $('.related-results-display-container').fadeOut();
        $('.d3-price-container').fadeOut();

        // Display the reviews-display only after an item is clicked on
        $('.reviews-display-container').delay(500).fadeIn();
        $('.d3-container').delay(500).fadeIn();

        // Create array of review sets to show
        var reviewSetsArray = [];


        if (data[0].walmartReviews) {
        // Get the reviews array from the response data
          var ReviewsFromData = JSON.parse(data[0].walmartReviews).reviews;
          var AverageRating = JSON.parse(data[0].walmartReviews).reviewStatistics.averageOverallRating;
          var ReviewCount = JSON.parse(data[0].walmartReviews).reviewStatistics.totalReviewCount;
          reviewSetsArray.push({
            source: 'Walmart',
            name: name,
            image: image,
            Reviews: ReviewsFromData,
            AverageRating: AverageRating,
            ReviewCount: ReviewCount
            });
        }
        if (data[0].bestbuyReviews) {
        // Get the reviews array from the response data
          var ReviewsFromData = JSON.parse(data[0].bestbuyReviews).reviews;
          // Can't get average rating directly from review API call, strangely enough
          // Have to get it from a product API call.
          // Find a way to save this in the course of the query.
          var ReviewCount = JSON.parse(data[0].bestbuyReviews).total;
          reviewSetsArray.push({
            source: 'Best Buy',
            name: name,
            image: image,
            Reviews: ReviewsFromData,
            AverageRating: "?",
            ReviewCount: ReviewCount
            });
          }
        // Set the walmartReviews state in the same format as the 'general-query' states
        this.setState({
          allReviews: { reviewSets: reviewSetsArray }
        });
        
        // initialize d3 chart
        // params are (width, height)
        this.refs.d3chart.startEngine(500, 225, reviewSetsArray);

      }.bind(this),
      error: function(xhr, status, err) {
        console.error('get-walmart-reviews', status, err.toString());
      }.bind(this)
    });
  },

  showResultsHideReviews: function() {
    $('.reviews-display-container').fadeOut();
    $('.d3-container').fadeOut();
    this.refs.d3PriceChart.startEngine(500, 275);
    $('.d3-price-container').delay(500).fadeIn();
    $('.related-results-display-container').delay(500).fadeIn();
  },

  render: function() {
    // Attributes are "props" which can be accessed by the component
    // Many "props" are set as the "state", which is set based on data received from API calls
    return (
      <div className="displayBox">
        
        <SearchForm onQuerySubmit={this.handleQuerySubmit} />

        <D3Chart
          ref="d3chart" />

        <div className="reviews-display-container">

          <div><button className="btn btn-info" onClick={this.showResultsHideReviews}>Back to Results</button></div>

          <ReviewsDisplaySection
            allReviews={this.state.allReviews} />

            <ChooseAnotherProductSection
              walmartData={this.state.walmart}
              bestbuyData={this.state.bestbuy} />

        </div>

        <D3PriceChart
          query={this.state.query}
          walmartRelatedResults={this.state.walmart}
          bestbuyRelatedResults={this.state.bestbuy}
          ref="d3PriceChart" />

        <div className="related-results-display-container">

          <WalmartRelatedResultsDisplay 
            data={this.state.walmart}
            onReviewRequest={this.handleReviewRequest} />
          <BestbuyRelatedResultsDisplay 
            data={this.state.bestbuy}
            onReviewRequest={this.handleReviewRequest} />
          {/* Taken out because API key could not be in public repo 
          <AmazonRelatedResultsDisplay data={this.state.amazon} /> */}
        </div>

      </div>
    );
  }
});

// Component for the query-submit form (general, not reviews)
var SearchForm = React.createClass({
  handleSubmit: function(e) {
    // Prevent page from reloading on submit
    e.preventDefault();

    // Show the spinner when a query is submitted
    $('.query-form-container img').show();

    // Hide containers
    $('.d3-container').fadeOut();
    $('.related-results-display-container').fadeOut();
    $('.reviews-display-container').fadeOut();

    // Grab query content from "ref" in input box
    var query = React.findDOMNode(this.refs.query).value.trim();

    // Passes the query to the central DisplayBox component
    // DisplayBox will make AJAX call and display results
    this.props.onQuerySubmit({query: query});

    // Clear the input box after submit
    React.findDOMNode(this.refs.query).value = '';
  },
  render: function() {
    return (
      <div className="query-form-container">
        <h4 className="query-form-title">ShopChimp, at your service.</h4>

        <form className="query-form" onSubmit={this.handleSubmit}>
          <input type="text" placeholder="Enter a product" className="form-control" ref="query" />

          <center><button className="btn btn-primary">Submit</button></center>
        </form>
        <img src="images/spiffygif_46x46.gif" />
      </div>
    );
  }
});

var ReviewsDisplaySection = React.createClass({
  render: function() {
    var reviewColumns = this.props.allReviews.reviewSets.map(function (set, index) {
      return (
        <ReviewsDisplay 
          key={'ReviewColumn'+index}
          source={set.source}
          data={set.Reviews}
          name={set.name}
          image={set.image}
          AverageRating={set.AverageRating}
          ReviewCount={set.ReviewCount} />
        );
    });
    return (
      <div className="reviews-display-section">
        {reviewColumns}
      </div>
    );
  }
});

var ChooseAnotherProductSection = React.createClass({
  render: function() {
    return (
      <div className="choose-another-product-section">
        <h5>Choose another product to compare</h5>

        <ChooseAnotherProductSectionWalmart
          walmartData={this.props.walmartData} />
        <ChooseAnotherProductSectionBestbuy
          bestbuyData={this.props.bestbuyData} />
      </div>
    );
  }
});

var ChooseAnotherProductSectionWalmart = React.createClass({
  render: function() {
    var resultNodes = this.props.walmartData.results.map(function(result, index) {
      return (
        <div className="choose-another-product-individual-display" 
          key={'walmartOtherProduct' + index}
          onClick={this.handleWalmartReviewRequest}>
          <img src={result.thumbnailImage} />
          <strong>Product: </strong>{result.name}
        </div>
      );
    });
    return (
      <div>
        <h6>Walmart</h6>
        {resultNodes}
      </div>
    );
  }
});

var ChooseAnotherProductSectionBestbuy = React.createClass({
  render: function() {
    var resultNodes = this.props.bestbuyData.results.map(function(result, index) {
      return (
        <div className="choose-another-product-individual-display" 
          key={'bestbuyOtherProduct' + index}
          onClick={this.handleWalmartReviewRequest}>
          <img src={result.image} />
          <strong>Product: </strong>{result.name}
        </div>
      );
    });
    return (
      <div>
        <h6>Best Buy</h6>
        {resultNodes}
      </div>
    );
  }
});

// Home page container for the DisplayBox component
var Home = React.createClass({
	render: function() {
		return (
      <div className="home-page">
        <DisplayBox />
      </div>
		);
	}
});

module.exports = Home;