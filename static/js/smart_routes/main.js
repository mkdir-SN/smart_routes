apikey = "";

function initMap() {
  var map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: -34.397, lng: 150.644},
    zoom: 8
  });

  // Init directionsService and directionsDisplay 
  var directionsService = new google.maps.DirectionsService;
  var directionsDisplay = new google.maps.DirectionsRenderer;
  directionsDisplay.setMap(map);

  var autocompletes = [];
  var markers = [];

  function activateFormAutocomplete(input) {
    // Init autocomplete for form with id
    var autocomplete =  new google.maps.places.Autocomplete(input);
    autocompletes.push(autocomplete);
    autocomplete.setFields(['formatted_address', 'geometry', 'icon', 'name', 'place_id']);

    // Init info window for autocomplete
    var infowindowContent = $('<div id="infowindow-content"><img src="" width="16" height="16" id="place-icon"><span id="place-name" class="card-title"></span><br><span id="place-address" class="card-subtitle"></span></div>');
    infowindowContent = infowindowContent.get(0);
    var infowindow = new google.maps.InfoWindow();
    infowindow.setContent(infowindowContent);

    // Create dynamic input warning 
    var inputWarning = $('<div class="text-danger form-complete-warning"> No details available for input: <span></span></div>');
    inputWarning.insertAfter($("#" + input.id));
    inputWarning = inputWarning.get(0);
    inputWarning.style.display = "none";

    // Init marker (red pin) for autocomplete
    var marker = new google.maps.Marker({
      map: map
    });
    markers.push(marker);

    // Listener for input in autocomplete form (pressing ENTER or selecting an address)
    autocomplete.addListener('place_changed', function (){
      infowindow.close();
      marker.setVisible(false);
      var place = autocomplete.getPlace();       
            
      if (!place.geometry) {
        inputWarning.children[0].textContent = '"' + place.name + '"';
        inputWarning.style.display = "block";
        }
      else {
        $("#" + input.id).val(place.formatted_address);
        inputWarning.style.display = "none";
        map.setCenter(place.geometry.location);
        map.setZoom(17);
        marker.setPosition(place.geometry.location);
        marker.setVisible(true);
        infowindowContent.children['place-icon'].src = place.icon;
        infowindowContent.children['place-name'].textContent = place.name;
        infowindowContent.children['place-address'].textContent = place.formatted_address;

        // Listeners to show info window
        marker.addListener('mouseover', function(){
          infowindow.open(map, this);
          });
        marker.addListener('mouseout', function(){
          infowindow.close();
          });
        }
    });
  }

  // Activate the first two autocomplete forms 
  activateFormAutocomplete(document.getElementById("form-autocomplete0"));
  activateFormAutocomplete(document.getElementById("form-autocomplete1"));

  // Listener to add additional autocomplete forms
  document.getElementById("btn-add-location").addEventListener("click", addFormAutocomplete);
     
  var formContainer = document.getElementById("form-container");

  function addFormAutocomplete() {
    // Creating forms with dynamic id for search autocomplete
    if (autocompletes.length > 10){
      var overflowWarning = document.getElementById("form-overflow-warning");
      overflowWarning.style.display = "block";
    }
    else{
      var input = document.createElement("input");
      input.type = "text";
      input.className = "form-control form-custom form-complete";
      var autocompleteForms = document.getElementsByClassName('form-complete');
      input.id = "form-autocomplete" + autocompleteForms.length.toString();
      formContainer.appendChild(input);
      activateFormAutocomplete(input);
    }
  }

  function calculateAndDisplayRoute(directionsService, directionsDisplay){
    // Closing all the markers previously to prevent overlap of directions marker
    for (var i = 0; i < markers.length; i++){
      var marker = markers[i];
      marker.setVisible(false);
      }
      
    var waypoints = [];
    for (var i = 0; i < autocompletes.length; i++){
      var autocomplete = autocompletes[i];
      var place = autocomplete.getPlace();
      waypoints.push({
        location: {'placeId': place.place_id},
        stopover: true
        });
    }

    var start = waypoints.shift();
    var end = waypoints.pop();

    directionsService.route({
      origin: start.location,
      destination: end.location,
      waypoints: waypoints,
      optimizeWaypoints: false, // to ensure ordering of labels (A, B, etc.) match the autocomplete locations order
      travelMode: 'DRIVING'
      }, function(response, status) {
          if (status === 'OK') {
            directionsDisplay.setDirections(response);
          } else {
            window.alert('Directions request failed due to ' + status);
          }
        });
  }

  function generateDirectionsURL(){
    // Generate directions URL based on current autocomplete fields
    var directionsURL = "https://www.google.com/maps/dir/?api=1";
    var formattedAddresses = [];
    var placeIDs = [];

    for (var i = 0; i < autocompletes.length; i++){
      var autocomplete = autocompletes[i];
      var place = autocomplete.getPlace();
      formattedAddresses.push(place.formatted_address);
      placeIDs.push(place.place_id.toString());
    }

    var origin = encodeURIComponent(formattedAddresses.shift());
    var origin_place_id = placeIDs.shift();
    var destination = encodeURIComponent(formattedAddresses.pop());
    var destination_place_id = placeIDs.shift();

    if (autocompletes.length == 2){
      directionsURL = directionsURL + "&origin=" + origin + "&origin_place_id=" + origin_place_id + "&destination=" + destination + "&destination_place_id" + destination_place_id;
    }
    else {
      var waypoints = formattedAddresses.shift();
      var waypoints_place_ids = placeIDs.shift();

      for (var i = 0; i < formattedAddresses.length; i++){
        var formattedAddress = formattedAddresses[i];
        var placeID = placeIDs[i];
        waypoints += "|" + formattedAddress;
        waypoints_place_ids += "|" + placeID;
      }

      waypoints = encodeURIComponent(waypoints);
      waypoints_place_ids = encodeURIComponent(waypoints_place_ids);

      directionsURL = directionsURL + "&origin=" + origin + "&origin_place_id=" + origin_place_id + "&destination=" + destination + "&destination_place_id" + destination_place_id + "&waypoints=" + waypoints + "&waypoints_place_ids=" + waypoints_place_ids;
    }
    return directionsURL;
  }

  document.getElementById("url-generator").addEventListener("click", function(){
    // Generate directions URL
    var directionsURLContainer = document.getElementById("directions-url");
    var directionsURL = generateDirectionsURL();
    directionsURLContainer.href = directionsURL;
    directionsURLContainer.innerHTML = directionsURL;
    });

  document.getElementById("userReminderForm").addEventListener("click", function(){
    // Pre-fill form with directions URL (user can't see this)
    $("#reminderURL").val(generateDirectionsURL());
    });

  document.getElementById("user-reminder-form-btn").addEventListener("click", function(){
    // Send form data as GET data via AJAX to backend (Django)
    var reminderName = $("#reminderName").val(); 
    var reminderPhoneNumber = $("#reminderPhoneNumber").val(); 
    var reminderDate = $("#reminderDate").val(); 
    var reminderTime = $("#reminderTime").val(); 
    var reminderURL = $("#reminderURL").val(); 
    $.ajax({
      url: 'save-reminder/',
      data: {
        'reminder_name': reminderName,
        'reminder_phone_number': reminderPhoneNumber,
        'reminder_date': reminderDate,
        'reminder_time': reminderTime,
        'reminder_url': reminderURL
      },
      success: function(){
        document.getElementById("form-not-scheduled-alert").style.display = "none"
        document.getElementById("form-scheduled-alert").style.display = "block"
        },
      error: function(){
        document.getElementById("form-scheduled-alert").style.display = "none"
        document.getElementById("form-not-scheduled-alert").style.display = "block"
        }
      });
    });

    document.getElementById("btn-optimize-routes").addEventListener("click", optimizeRoutes);

    function optimizeRoutes() {
      // Function associated with btn-optimize-routes

      class Location {
        constructor(parent, place){
          // g = distance between current node and start node
          // h = heuristic = exact distance between current node to end node
          // f = total cost of current node
          this.parent = parent;
          this.place = place;
          this.level = 1;
          this.f = 0;
          this.g = 0;
          this.h = 0;
          }
          distanceBetween(location){
            var pt1 = this.place.geometry.location;
            var pt2 = location.place.geometry.location;
            var pt1Location = new google.maps.LatLng(pt1.lat(), pt1.lng());
            var pt2Location = new google.maps.LatLng(pt2.lat(), pt2.lng());
            var distance = google.maps.geometry.spherical.computeDistanceBetween(pt1Location, pt2Location);
            return distance;
          }
          incrementLevel(parentLocation){
            this.level += parentLocation.level;
          }
        } 

        locations = [];

        // Instantiate Location objects for each item in autocompletes (from line 88)
        for (var i = 0; i < autocompletes.length; i++){
          var place = autocompletes[i].getPlace();
          var location = new Location(null, place);
          locations.push(location);
        }

        function AstarSearch(){
          var originalLocationsLength = locations.length;
          var startLocation = locations.shift();
          var endLocation = locations[locations.length - 1];
          var visited = [];
          var startNeighbors = popNeighbor(startLocation, locations);
          var optimizedEndLocations = search(startLocation, startNeighbors);
          var bestPath = getBestPath(optimizedEndLocations);

          // Programmatically re-order the autocomplete fields based on optimized route
          for (var i = 0; i < autocompletes.length; i++){
            var autocomplete = autocompletes[i];
            var location = bestPath[i];
            autocomplete.set("place", location.place);
          }

          calculateAndDisplayRoute(directionsService, directionsDisplay);
          
          function search(currentLocation, neighbors){
            // Returns list of endLocations(s)
            if (betterPath(currentLocation)){
              return [];
            }
            else if (currentLocation.place.place_id == endLocation.place.place_id){
              if (validPath(currentLocation)){
                return [currentLocation];
              }
              else{ return []; }
            }
            else{
              var endLocations = [];
              visited.push(currentLocation);

              for (var i = 0; i < neighbors.length; i++){
                var neighbor = neighbors[i];
                var child = new Location(currentLocation, neighbor.place);
                child.incrementLevel(currentLocation);
                child.g = currentLocation.g + child.distanceBetween(currentLocation);
                child.h = child.distanceBetween(endLocation);
                child.f = child.g + child.h;
                var newNeighbors = popNeighbor(child, neighbors);
                var childEndLocations = search(child, newNeighbors);
                if (childEndLocations){
                  endLocations = endLocations.concat(childEndLocations);
                }
              }
                return endLocations;
            }
          }

          function validPath(currentLocation){
            // Returns whether or not path is valid
            if (currentLocation.level == originalLocationsLength){
              return true;
            }
              return false;
            }

          function betterPath(currentLocation){
            // Returns whether or not there exists a Location with the same place_id as currentLocation, less f value than currentLocation, and same level as currentLocation in the visited list.
            for (var i = 0; i < visited.length; i++){
              var visitedLocation = visited[i];
              if (visitedLocation.place.place_id == currentLocation.place.place_id){
                if (visitedLocation.level == currentLocation.level){
                  if (visitedLocation.f <= currentLocation.f){
                    return true;
                  }
                }
              }
            }
            return false;
          }

          function popNeighbor(location, neighbors){
            // Returns new list of neighbors without altering original neighbors
            var poppedNeighbors = neighbors.slice(0);
            for (var i = 0; i < neighbors.length; i++){
              var neighbor = neighbors[i];
              if (location.place.place_id == neighbor.place.place_id){
                poppedNeighbors.splice(i, 1);
              }
            }
            return poppedNeighbors;
          }

          function getPath(location){
            // Returns path (list) by recursively going up parent levels
            var path = [];
            var current = location;
            while (current != null){
              path.push(current);
              current = current.parent;
            }
            path.reverse();
            return path;
          }

          function getBestPath(optimizedEndLocations){
            // Return path of optimized end node with the lowest f value
            var lowest = optimizedEndLocations[0];
            for (var i = 0; i < optimizedEndLocations.length; i++){
              var optimizedEndLocation = optimizedEndLocations[i];
              if (lowest.f > optimizedEndLocation.f){
                lowest = optimizedEndLocation;
              }
            }
            var bestPath = getPath(lowest);
            return bestPath;
          }
        } // End of AstarSearch
          AstarSearch();
    } // End of optimizeRoutes
} // End of initMap