var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Album of the Day' });
});

/* GET Albumlist page */
router.get('/albumlist', function(req, res, next) {
  var db = req.db;
  var collection = db.get('AlbumsV2');
  collection.find({},{},function(e,docs) {
    res.render('albumlist', {"albumlist":docs});
  });
});

/* GET New Album page */
router.get('/newalbum', function(req, res, next) {
  res.render('newalbum', { title: 'Add New Album' });
});

/* GET New Album page */
router.get('/newalbumform', function(req, res, next) {
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
  
var api = new Gracenote(clientId,clientTag,userId);
var album_Artist          = req.body.Artist;
var album_Album           = req.body.Album;
api.searchAlbum(album_Artist, album_Album, function(err, result) {
    console.log( result[0] );
    res.send(result[0]);
});  
  
  
  
  
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
});

module.exports = router;
