$(function(){

    $('#inputTracks').on('keyup', function(e){
      if(e.keyCode === 9) {
        var parameters = { search: $(this).val() };
          $.get( '/searching',parameters, function(data) {
          //console.log(data)
          //console.log( data.tracks )
          var output = '';
          for (var track in data.tracks) {
            //console.log( data.tracks[track])
            //console.log( data.tracks[track]["track_title"])
            //console.log( data.tracks[track].track_title )
            output += data.tracks[track].track_title + ',';
          }
          $('#inputTracks').val( output ) ;
        });
        };
    });
    });