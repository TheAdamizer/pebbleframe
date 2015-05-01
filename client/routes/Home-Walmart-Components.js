var React = require('react');

// Component that displays related results from Walmart API
var WalmartRelatedResultsDisplay = React.createClass({
  handleWalmartReviewRequest: function(itemId) {
    this.props.onWalmartReviewRequest(itemId);

    // $.ajax({
    //   url: 'get-walmart-reviews',
    //   dataType: 'json'
    //   type: 'POST',
    //   data: {itemId: this.props.itemId},
    //   success: function(data) {
    //     this.props.onWalmartReviewRequest({reviews: reviews});
    //   }.bind(this),
    //   error: function(xhr, status, err) {
    //     console.error('general-query', status, err.toString());
    //   }.bind(this)
    // });
  },
  render: function() {
    var resultNodes = this.props.data.walmart.map(function(result, index) {

      result.shortDescription = result.shortDescription || '';

      return (
        <WalmartIndividualResultDisplay 
          name={result.name} 
          salePrice={result.salePrice}
          upc={result.upc} 
          shortDescription={result.shortDescription}
          thumbnailImage={result.thumbnailImage}
          customerRating={result.customerRating}
          numReviews={result.numReviews}
          customerRatingImage={result.customerRatingImage}
          itemId={result.itemId} 
          onWalmartReviewRequest={this.handleWalmartReviewRequest} />
      );
    }.bind(this));
    return (
      <div className="related-results-display hidden">
        <h3>Walmart Related Results</h3>
        {resultNodes}
      </div>
    );
  }
});

// Component that displays individual results for Walmart
var WalmartIndividualResultDisplay = React.createClass({
  handleWalmartReviewRequest: function() {
    this.props.onWalmartReviewRequest({itemId: this.props.itemId});
  },  
  render: function() {
    return (
      <div className="individual-display" onClick={this.handleWalmartReviewRequest}>
        <h5 className="product-name">
          {this.props.name}
        </h5>
        <img src={this.props.thumbnailImage} />
        <div>
          ${this.props.salePrice}
        </div>
        <div>
          UPC: ${this.props.upc}
        </div>
        <div>
          Description: {this.props.description}
        </div>
        <div>
          Rating: {this.props.customerRating}
        </div>
        <div>
          {this.props.numReviews} reviews
        </div>
        <img src={this.props.customerRatingImage} />
      </div>
    );
  }
});

var WalmartReviewsDisplay = React.createClass ({
  render: function() {
    return (
      <div>

      </div>
    );
  }
});

module.exports.WalmartRelatedResultsDisplay = WalmartRelatedResultsDisplay;

module.exports.WalmartIndividualResultDisplay = WalmartIndividualResultDisplay;