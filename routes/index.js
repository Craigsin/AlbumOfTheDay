var express = require('express');
var router = express.Router();
var request = require('request'); // "Request" library
var querystring = require('querystring');
var cookieParser = require('cookie-parser');

var SpotifyWebApi = require('spotify-web-api-node');

// credentials are optional
/*
var spotifyApi = new SpotifyWebApi({
  clientId : '9d278bfaff2f4444af5b9ab67d5a0fd2',
  clientSecret : '5de0bf8d71344d468c0d9f0432ad0478',
  redirectUri : 'http://localhost/callback'
});
*/


var scopes = ['user-read-private', 'user-read-email'],
    redirectUri = 'http://localhost:3000/callback',
    clientId = '9d278bfaff2f4444af5b9ab67d5a0fd2',
    state = 'staTe of onion';

// Setting credentials can be done in the wrapper's constructor, or using the API object's setters.
var spotifyApi = new SpotifyWebApi({
  redirectUri : redirectUri,
  clientId : clientId
});

// Create the authorization URL
var authorizeURL = spotifyApi.createAuthorizeURL(scopes, state);

console.log(authorizeURL);

var g_code = ""
/* Handle authorization callback from Spotify */
router.get('/callback', function(req, res) {
  console.log(" Arrived in callback ")
  /* Read query parameters */
  var code  = req.query.code; // Read the authorization code from the query parameters
  var state = req.query.state; // (Optional) Read the state from the query parameter
  
  g_code = code;
  /* Get the access token! */
  console.log( req.query )
  /*
  spotifyApi.authorizationCodeGrant(code)
    .then(function(data) {
      console.log('The token expires in ' + data['expires_in']);
      console.log('The access token is ' + data['access_token']);
      console.log('The refresh token is ' + data['refresh_token']);

      /* Ok. We've got the access token!
         Save the access token for this user somewhere so that you can use it again.
         Cookie? Local storage?
      *  /

      /* Redirecting back to the main page! :-) *  /
      res.redirect('/');

    })  
    */
    // spotifyApi.setAccessToken( code );
    
    // need to convert code to a token here.


    res.redirect('/');
})


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Album of the Day', spotify: authorizeURL });
});

/* GET Albumlist page */
router.get('/albumlist', function(req, res, next) {
  var db = req.db;
  
  spotifyApi.searchArtists('Love')
  .then(function(data) {
    console.log('Search artists by "Love"', data.body);
  }, function(err) {
    console.error(err);
  });

  
  
  
  var collection = db.get('AlbumsV4Plus');
  collection.find({},{},function(e,docs) {
    res.render('albumlist', {"albumlist":docs});
  });
});

/* GET New Album page */
router.get('/newalbum', function(req, res, next) {
  res.render('newalbum', { title: 'Add New Album' });
});


var stateKey = 'spotify_auth_state';
router.get('/login', function(req, res) {

  var state = "state is here" // generateRandomString(16);
  res.cookie(stateKey, state);

  // your application requests authorization
  var scope = 'user-read-private user-read-email';
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: "9d278bfaff2f4444af5b9ab67d5a0fd2",
      scope: scope,
      redirect_uri: "http://localhost:3000/callback",
      state: state
    }));
});





/* GET New Album page */
router.get('/newalbumform', function(req, res, next) {
  
  spotifyApi.getMe()
  .then(function(data) {
    console.log('Some information about the authenticated user', data.body);
  }, function(err) {
    console.log('Something went wrong!', err);
  });  
  
  res.render('newalbumform', { title: 'Add New Album' });
  
});

var Gracenote = require("node-gracenote");
var clientId = "347978252-3D569FC495267E0B0972359FD44CBFAA";

var Gracenote = require("node-gracenote");
var clientTag = "GreatListens";
var userId = null;
var api = new Gracenote(clientId,clientTag,userId);
api.register(function(err, uid) {
    userId = uid;
    console.log("UID " + uid );
});





router.get('/searching', function(req, res){
  console.log("searching res");
console.log( req.query )  
var api = new Gracenote(clientId,clientTag,userId);
var album_Artist          = req.query.artist;
var album_Title           = req.query.title;
console.log("Album   : " +album_Title)
console.log("Artist  : " +album_Artist)
api.searchAlbum(album_Artist, album_Title, function(err, result) {
    console.log( result[0] );
    res.send(result[0]);
});  
  
  
  
  
});

var Twitter = require('twitter');
 
var client = new Twitter({
  consumer_key: 'oQ7M776dqtPRo8xiuyvPTvyO2',
  consumer_secret: '3fG3AaNcmlzR4fbzHj6D7LMGJKs8lgzZUEEVA4aWOx60i877e7',
  access_token_key: '728843104883748864-rnuwnd6p5omd31xcwfHoPS3CIyop07k',
  access_token_secret: 'uWUBu6M5hdyNcqpvwexeBzkYig04hrrQEcJzpTxOPFvzx'
});

// see the following for details on tweeting the new album.
// https://www.npmjs.com/package/twitter
/* POST to Add Album Service */
router.post('/addalbum', function(req, res)
{
    var db = req.db;

    // Get our form values. These rely on the "name" attributes  
    var album_DateRecommended = req.body.DateRecommended;
    var album_RecommendedBy   = req.body.RecommendedBy;
    var album_Artist          = req.body.Artist;
    var album_Album           = req.body.Album;

    var collection = db.get('AlbumsV2');

    // Submit to the DB
    collection.insert(
      { "DateRecommended" : album_DateRecommended,
        "RecommendedBy"   : album_RecommendedBy,
        "Artist"          : album_Artist,
        "Album"           : album_Album },
      function(err, doc)
      {
          if (err)
          {
              // If it failed, return error
              res.send("There was a problem adding the information to the database.");
          }
          else
          {
              // And forward to success page
              res.redirect("albumlist");
          }
      });
      
      msg = "Album : " + album_Album + "\n" + "Artist : " + album_Artist
      client.post('statuses/update', {status: msg},  function(error, tweet, response){
        if(error) throw error;
        console.log(tweet);  // Tweet body. 
        console.log(response);  // Raw response object. 
      });
});

module.exports = router;
