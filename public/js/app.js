/* CLIENT-SIDE JS
 *
 * You may edit this file as you see fit.  Try to separate different components
 * into functions and objects as needed.
 *
 */


var express        = require('express');
var path           = require('path');
var logger         = require('morgan');
var bodyParser     = require('body-parser');
var app            = express();
var mongoose       = require('mongoose');
var passport       = require('passport');
var expressSession = require('express-session');
var cookieParser   = require("cookie-parser");


// Middleware
app.use( cookieParser() );
app.use(expressSession({secret: 'mySecretKey'}));
app.use(passport.initialize());
app.use(passport.session());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.use(express.static(__dirname + '/public'));

// Setting up the Passport Strategies
require("./config/passport")(passport);



$(document).ready(function() {
  console.log('app.js loaded!');
  $.get('/api/albums').success(function (albums) {
    albums.forEach(function(album) {
      renderAlbum(album);
    });
  });


  $('#album-form form').on('submit', function(e) {
    e.preventDefault();
    var formData = $(this).serialize();
    console.log('formData', formData);
    $.post('/api/albums', formData, function(album) {
      console.log('album after POST', album);
      renderAlbum(album);  //render the server's response
    });
    $(this).trigger("reset");
  });


  $('#albums').on('click', '.add-song', function(e) {
    var id= $(this).parents('.album').data('album-id');
    console.log('id',id);
    $('#songModal').data('album-id', id);
    $('#songModal').modal();
  });

  $('#saveSong').on('click', handleNewSongSubmit);

  $('#albums').on('click', '.edit-album', handleEditAlbumClick);

  $('#albums').on('click', '.put-album', handleSaveChangesClick);

  $('#albums').on('click', '.delete-album', handleDeleteAlbumClick);

// <<<<<<< HEAD
// $('#editSongsModal').on('click', '.delete-song', handleDeleteSongClick);
//
// $('#editSongsModal').on('submit', 'form', handleUpdateSong);
// =======
// >>>>>>> 1287528d43824fb0cda1d0b15744dda51d011712
// >>>>>>> ed0a45aabe0373849ea687056192b549d25e8cfd
});


function handleDeleteAlbumClick(e) {
  var albumId = $(this).parents('.album').data('album-id');
  console.log('someone wants to delete album id=' + albumId );
  $.ajax({
    method: 'DELETE',
    url: ('/api/albums/' + albumId),
    success: function() {
      console.log("He's dead Jim");
      $('[data-album-id='+ albumId + ']').remove();
    }
  });
}

// handles the modal fields and POSTing the form to the server
function handleNewSongSubmit(e) {
  var albumId = $('#songModal').data('album-id');
  var songName = $('#songName').val();
  var trackNumber = $('#trackNumber').val();

  var formData = {
    name: songName,
    trackNumber: trackNumber
  };

  var postUrl = '/api/albums/' + albumId + '/songs';
  console.log('posting to ', postUrl, ' with data ', formData);

  $.post(postUrl, formData)
    .success(function(song) {
      console.log('song', song);

      // re-get full album and render on page
      $.get('/api/albums/' + albumId).success(function(album) {
        //remove old entry
        $('[data-album-id='+ albumId + ']').remove();
        // render a replacement
        renderAlbum(album);
      });

      //clear form
      $('#songName').val('');
      $('#trackNumber').val('');
      $('#songModal').modal('hide');

    });
}



function buildSongsHtml(songs) {
  var songText = "    &ndash; ";
  songs.forEach(function(song) {
    songText = songText + "(" + song.trackNumber + ") " + song.name + " &ndash; ";
  });
  var songsHtml  =
   "                      <li class='list-group-item'>" +
   "                        <h4 class='inline-header'>Songs:</h4>" +
   "                         <span>" + songText + "</span>" +
   "                      </li>";
  return songsHtml;
}

function generateEditSongsModalHtml(songs, albumId) {
  var html = '';
  songs.forEach(function(song) {
    html += '<form class="form-inline" id="' + albumId  + '"' +
            '  <div class="form-group">' +
            '    <input type="text" class="form-control song-trackNumber" value="' + song.trackNumber + '">' +
            '  </div>'+
            '  <div class="form-group">' +
            '    <input type="text" class="form-control song-name" value="' + song.name + '">' +
            '  </div>'+
            '  <div class="form-group">' +
            '    <button class="btn btn-danger delete-song" data-song-id="' + song._id + '">x</button>' +
            '  </div>'+
            '  <div class="form-group">' +
            '    <button type="submit" class="btn btn-success save-song" data-song-id="' + song._id + '">save</span></button>' +
            '  </div>'+
            '</form>';
  });

  return html;
}


// this function takes a single album and renders it to the page
function renderAlbum(album) {
  console.log('rendering album:', album);

  var albumHtml =
  "        <!-- one album -->" +
  "        <div class='row album' data-album-id='" + album._id + "'>" +
  "          <div class='col-md-10 col-md-offset-1'>" +
  "            <div class='panel panel-default'>" +
  "              <div class='panel-body'>" +
  "              <!-- begin album internal row -->" +
  "                <div class='row'>" +
  "                  <div class='col-md-3 col-xs-12 thumbnail album-art'>" +
  "                     <img src='" + "http://placehold.it/400x400'" +  " alt='album image'>" +
  "                  </div>" +
  "                  <div class='col-md-9 col-xs-12'>" +
  "                    <ul class='list-group'>" +
  "                      <li class='list-group-item'>" +
  "                        <h4 class='inline-header'>Album Name:</h4>" +
  "                        <span class='album-name'>" + album.name + "</span>" +
  "                      </li>" +
  "                      <li class='list-group-item'>" +
  "                        <h4 class='inline-header'>Artist Name:</h4>" +
  "                        <span class='artist-name'>" + album.artistName + "</span>" +
  "                      </li>" +
  "                      <li class='list-group-item'>" +
  "                        <h4 class='inline-header'>Released date:</h4>" +
  "                        <span class='album-name'>" + album.releaseDate + "</span>" +
  "                      </li>" +

  buildSongsHtml(album.songs) +


  "                    </ul>" +
  "                  </div>" +
  "                </div>" +
  "                <!-- end of album internal row -->" +

  "              </div>" + // end of panel-body

  "              <div class='panel-footer'>" +
  "                <button class='btn btn-primary add-song'>Add Song</button>" +
  "                <button class='btn btn-danger delete-album'>Delete Album</button>" +
  "              </div>" +

  "            </div>" +
  "          </div>" +
  "          <!-- end one album -->";

  $('#albums').prepend(albumHtml);
 }
