// Displays and locates the user's location
var geocoder;
var map;
var createMarker;


// Defaults to San Francisco
var lat = 37.783;
var lng = -122.409;
var markerArray = [];

function initialize(gameData) {
  var mapOptions = {
    zoom: 12,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  map = new google.maps.Map(document.getElementById('map-canvas'),
    mapOptions);

  // Locates the user on the map
  if(navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      var pos = new google.maps.LatLng(position.coords.latitude,
                                       position.coords.longitude);
      //marker pop-ups
      // var infowindow = new google.maps.InfoWindow({
      //   map: map,
      //   position: pos,
      //   content: 'Lat: ' + position.coords.latitude + '\n\nLong: ' + position.coords.longitude
      // });
      map.setCenter(pos);
    }, function() {
      handleNoGeolocation(true);
    });
  } else {
  // If GeoLocation is not supported, calls the handleNoGeoLocation function
    handleNoGeolocation(false);
  }

  // Creates a marker for games in database
  var infowindow = new google.maps.InfoWindow({map: map});
  var gameList = document.getElementById('places');
  gameData.on('sync', function() {

    if (!gameList) {
      // Adds marker on click only on Create Game
      google.maps.event.addListener(map, 'click', function(event) {
        placeMarker(event.latLng);
      });

      // add Search Box in Create Game section
      var input = (document.getElementById('target'));
      var searchBox = new google.maps.places.SearchBox(input);
      var markers = [];
      google.maps.event.addListener(searchBox, 'places_changed', function() {
        var places = searchBox.getPlaces();
        for (var i = 0, marker; marker = markers[i]; i++) {
          marker.setMap(null);
        }

        markers = [];
        var bounds = new google.maps.LatLngBounds();
        for (var i = 0, place; place = places[i]; i++) {
          var image = {
            url: place.icon,
            size: new google.maps.Size(71, 71),
            origin: new google.maps.Point(0, 0),
            anchor: new google.maps.Point(17, 34),
            scaledSize: new google.maps.Size(25, 25)
          };

          var marker = new google.maps.Marker({
            map: map,
            icon: image,
            title: place.name,
            position: place.geometry.location
          });
          markers.push(marker);
          bounds.extend(place.geometry.location);
        }
        map.fitBounds(bounds);
      });

      google.maps.event.addListener(map, 'bounds_changed', function() {
        var bounds = map.getBounds();
        searchBox.setBounds(bounds);
      });
    }
    // markerArray = [];
    for (var i = 0; i < gameData.length; i++) {
      var createMarker = new google.maps.Marker({
        position: new google.maps.LatLng(gameData.at(i).get('coord').lat, gameData.at(i).get('coord').lon),
        map: map,
        title: gameData.at(i).get('gameName'),
        time: gameData.at(i).get('gameTime'),
        date: gameData.at(i).get('gameDate'),
        min: gameData.at(i).get('minimumPlayers'),
        code: gameData.at(i).get('gameCode'),
        animation: google.maps.Animation.DROP
      });
      var content = createMarker.title;
      makeInfoWindowEvent(map, infowindow, content, createMarker);
      markerArray.push(createMarker);
      gameList.innerHTML += '<li data-id=' + createMarker.__gm_id + '>' +
        '<span class="gamelist-title todo-name">' + createMarker.title + '</span>' +
        '<button class="btn-mini btn btn-danger" data-code=' + createMarker.code +'>Join Game</button></li>';
    }
  });
  // Connect side-panel with events on the map
  var holder;
  $('#results').on('click', 'li', function(){
    var getId = $(this).data("id");
    for (var i = 0; i < markerArray.length; i++) {
      if (getId === markerArray[i].__gm_id) {
        holder = markerArray[i];
        console.log(markerArray[0].title);
      }
    }
    infowindow.setContent(holder.title);
    infowindow.open(map, holder);
  });

  $('#places').on('click', '.btn-mini', function () {
    var code = $(this).data().code;
    if (App.currentUser.attributes.phone) {
      $.ajax({
        url: '/game',
        contentType: 'application/json',
        type: 'PUT',
        data: JSON.stringify({
          code: code,
          phone: App.currentUser.attributes.phone
        }),
        dataType: 'json',
        error: function(error) { alert(error); },
        success: function() { console.log("So it is written!"); }
      });
    //   User.find({ phone : phone }, function (err, results) {
    //     if (err) throw err;
    //     console.log(results);
    //   });
    } else {
      console.log('User issue');
    }

  });

  // Search Box in List Games
  // TODO: use regex to search for games.  Convert markerArray to lowercase
  $('.todo-search-field').keypress(function (e) {
    if (e.which == 13) {
      var search = $('.todo-search-field').val();
      for (var i = 0; i < markerArray.length; i++) {
        if (search === markerArray[i].title) {
          holder = markerArray[i];
        }
      }
      infowindow.setContent(holder.title);
      infowindow.open(map, holder);
      $('.todo-search-field').val("");
      return false;
    }
  });

  // Displays pop-up when marker is clicked
  var makeInfoWindowEvent = function(map, infowindow, contentString, marker) {
    google.maps.event.addListener(marker, 'click', function() {
      var html = '<div class="infobox">' + contentString + '</div>';
      infowindow.setContent(html);
      infowindow.open(map, this);
    });
  };

  // Search Box
  // var input = (document.getElementById('target'));
  // var searchBox = new google.maps.places.SearchBox(input);
  // var markers = [];
  // google.maps.event.addListener(searchBox, 'places_changed', function() {
  //   var places = searchBox.getPlaces();
  //   for (var i = 0, marker; marker = markers[i]; i++) {
  //     marker.setMap(null);
  //   }

  //   markers = [];
  //   var bounds = new google.maps.LatLngBounds();
  //   for (var i = 0, place; place = places[i]; i++) {
  //     var image = {
  //       url: place.icon,
  //       size: new google.maps.Size(71, 71),
  //       origin: new google.maps.Point(0, 0),
  //       anchor: new google.maps.Point(17, 34),
  //       scaledSize: new google.maps.Size(25, 25)
  //     };

  //     var marker = new google.maps.Marker({
  //       map: map,
  //       icon: image,
  //       title: place.name,
  //       position: place.geometry.location
  //     });
  //     markers.push(marker);
  //     bounds.extend(place.geometry.location);
  //   }
  //   map.fitBounds(bounds);
  // });

  // google.maps.event.addListener(map, 'bounds_changed', function() {
  //   var bounds = map.getBounds();
  //   searchBox.setBounds(bounds);
  // });
};

var handleNoGeolocation = function(errorFlag) {
  if (errorFlag) {
    var content = 'Error: The Geolocation service failed.';
  } else {
    var content = 'Error: Your browser doesn\'t support geolocation.';
  }

  // If GeoLocation is not possible, defaults to San Francisco area.
  var options = {
    map: map,
    position: new google.maps.LatLng(lat, lng)
  };

  var infowindow = new google.maps.InfoWindow(options);
  map.setCenter(options.position);
};

// If clicked, draws marker
// Should be used for Create Game

// Clear markers
var clearMarker = function() {
  if (markerArray) {
    for (var i = 0; i < markerArray.length; i++) {
      markerArray[i].setMap(null);
    }
  markerArray = [];
  }
};

var placeMarker = function(location) {
  // Clears the marker (does not delete) from the map before placing the new marker
  clearMarker();
  var marker = new google.maps.Marker({
    position: location,
    map: map
  });
  markerArray.push(marker);
  console.log('marker location: ' + marker.getPosition());
  var loc = marker.getPosition();
  $('.lon').val(loc.lb);
  $('.lat').val(loc.kb);
};



// Helper function to translate address to LatLng
// Need to input #address
var codeAddress = function() {
  // var address = '944 market st., san francisco, ca'
  var address = document.getElementById("address").value;
  geocoder.geocode( { 'address': address}, function(results, status) {
    if (status == google.maps.GeocoderStatus.OK) {
      map.setCenter(results[0].geometry.location);
      var marker = new google.maps.Marker({
          map: map,
          position: results[0].geometry.location
      });
    } else {
      alert("Geocode was not successful for the following reason: " + status);
    }
  });
};
