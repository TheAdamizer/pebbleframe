var Bookshelf = require('bookshelf'),
Q        = require('q'),
events = require('events'),
EventEmitter = require("events").EventEmitter,
util = require('util'),
bcrypt   = require('bcrypt-nodejs'),
SALT_WORK_FACTOR  = 10,
jwt  = require('jwt-simple');


//Create db wrapper for database to 
function DB(){
  EventEmitter.call(this);
}

util.inherits(DB, EventEmitter);

var db = new DB();

var knex = require('knex')({
  client: 'mysql',
  connection: {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'pebble',
    charset: 'utf8',
  }
});
db.orm = require('bookshelf')(knex);


//-------------TABLES VERIFICATION START-----------/
  db.orm.knex.schema.hasTable('users').then(function(exists) {
    if (!exists) 
        console.log('Table users does not exist');
  });

  db.orm.knex.schema.hasTable('reviews').then(function(exists) {
    if (!exists)
        console.log('Table reviews does not exist');
  });

  db.orm.knex.schema.hasTable('products').then(function(exists) {
    if (!exists) 
        console.log('Table products does not exist');
  });

  db.orm.knex.schema.hasTable('followers').then(function(exists) {
    if (!exists) 
        console.log('Table followers does not exist');
  });

  db.orm.knex.schema.hasTable('watchers').then(function(exists) {
    if (!exists) 
        console.log('Table watchers does not exist');
  });
//-------------TABLES VERIFICATION END-------------/

//-------------ORM FOR USERS START-----------------/
  //Create user Model
  db.User = db.orm.Model.extend({
     tableName:"users",
     comparePasswords : function (candidatePassword) {
      var defer = Q.defer();
      var savedPassword = this.password;
      bcrypt.compare(candidatePassword, savedPassword, function (err, isMatch) {
        if (err) {
          defer.reject(err);
        } else {
          defer.resolve(isMatch);
        }
      });
      return defer.promise;
      }
  });

  //Create user Collection
  db.Users = new db.orm.Collection();
  db.Users.model = db.User;

  //Create New Users --For Development Only
  var user = new db.User({
    username: "Gilgamesh",
    password: 1,
    email: "g@gmail.com"
  });

  //Save user to the database
  user.save().then(function(newUser) {
    db.Users.add(newUser);
    console.log("User Saved")
  });

  user = new db.User({
    username: "Enkidu",
    password: 1,
    email: "e@gmail.com"
  });

  user.save().then(function(newUser) {
    db.Users.add(newUser);
    console.log("User Saved")
  });
//-------------ORM FOR USERS END-------------------/

//-------------ORM FOR REVIEWS START---------------/
  //Create Review Model
  db.Review = db.orm.Model.extend({
     tableName:"reviews"
  });

  //Create Review Collection
  db.Reviews = new db.orm.Collection();
  db.Reviews.model = db.Review;

  //Create New Review (template) --For Development Only
  var review = new db.Review({
    user_id: 1,
    upc: 12345678910,
    rating: 2,
    review_text: 'AWESOME'
  });

  //Review Save (template) to the database --For Development Only
  review.save().then(function(newReview) {
    db.Reviews.add(newReview);
    console.log("Review Saved")
  });
//-------------ORM FOR REVIEWS END-----------------/

//-------------ORM FOR PRODUCTS START--------------/
  //Create Products Model
  db.Product = db.orm.Model.extend({
     tableName:"products"
  });

  //Create product Collection
  db.Products = new db.orm.Collection();
  db.Products.model = db.Product;

  //Create New Product--For Development Only
  var product = new db.Product({
    upc: 123456789101,
    price: 400,
    review_count: 0
  });

  //Save Product to the database--For Development Only
  product.save().then(function(newProduct) {
    db.Products.add(newProduct);
    console.log("Product Saved")
  });
//-------------ORM FOR PRODUCTS END----------------/

//-------------ORM FOR FOLLOWERS START-------------/
  //Create Follower Model
  db.Follower = db.orm.Model.extend({
     tableName:"followers"
  });

  //Create user Collection
  db.Followers = new db.orm.Collection();
  db.Followers.model = db.Follower;

  //Create New Follower--For Development Only
  var follower = new db.Follower({
    user_id: 1,
    follower_id: 2
  });

  //Save follower to the database--For Development Only
  follower.save().then(function(newFollower) {
    db.Followers.add(newFollower);
    console.log("Follower Saved")
  });
//-------------ORM FOR FOLLOWERS END---------------/

//-------------ORM FOR WATCHERS START--------------/
  //Create Watcher Model
  db.Watcher = db.orm.Model.extend({
     tableName:"watchers"
  });

  //Create user Collection
  db.Watchers = new db.orm.Collection();
  db.Watchers.model = db.Watcher;

  //Create New Watcher--For Development Only
  var watcher = new db.Watcher({
    user_id: 1,
    product_id: 1
  });

  //Save watcher to the database--For Development Only
  watcher.save().then(function(newWatcher) {
    db.Watchers.add(newWatcher);
    console.log("Watcher Saved")
  });
//-------------ORM FOR WATCHERS END----------------/

//-------------USER API CONFIGURATION START-------------/
  db.findUser = function(userName){
    db.User.where({username: userName}).fetch()
    .then(function (user) {
      if (!user) {
        console.log('User does not exist');
      }
      else{
        console.log(user + "Found");
        db.emit('userFound');
      } 
    });
  };

  db.addUser = function(user){

    db.on('foundUser',function(){
      bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
        if (err) {
          return console.log("Error with Salt");
        }
        bcrypt.hash(user.password, salt, null, function(err, hash) {
          if (err) {
            return console.log("Error with hash");
          }
          user.password = hash;
          user.salt = salt; 
          newUser.save().then(function(newUser) {
            db.Users.add(newUser);
            console.log("User Saved");
            db.emit('userSaved');
          });
        });
      });
    });
    db.findUser(user);
  };

//-------------API CONFIGURATION START-------------/

module.exports = db;







  // db.findUser = function(userName){
  //   db.User.where({username: userName}).fetch()
  //   .then(function (user) {
  //     if (!user) {
  //       console.log('User does not exist'));
  //     } else {
  //       return user.comparePasswords(password)
  //         .then(function(foundUser) {
  //           if (foundUser) {
  //             var token = jwt.encode(user, 'secret');
  //             res.json({token: token});
  //           } else {
  //             console.log('No user');
  //           }
  //         });
  //     }
  //   });
  // };
