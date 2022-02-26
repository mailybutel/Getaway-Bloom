"use strict";

/**
 * File Name: vacationdetailed.js
 * Description: Contains the functionality for page containing detailed information (vacationdetailed.html) for selected planned vacation in list.
 *              Involves displaying vacation information and vacation route, and functions for buttons
 * ID: Team 001
 * Last Modified: 15/10
*/

// Retrieve index for vacation to be displayed
let vacationIndex = retrieveLSData(VACATION_INDEX);

// Set vacation variable as planned vacation at vacationIndex
let vacation = listOfVacations.plannedVacations[vacationIndex];

/*---------------------
* DISPLAY MAP AND ROUTE 
  ---------------------*/

// Mapbox API Autocomplete
mapboxgl.accessToken = MAPBOX_KEY;

// Create map object and set initial coordinates
let map = new mapboxgl.Map({
    container: 'map', // Set container ID
    style: 'mapbox://styles/mapbox/streets-v9', // Set style URL
    center: [144.9648731,-37.86217],  // Set initial centered position
    zoom: 14, // Set initial zoom
});

// When the map loads, pan to Starting location, and display route and stopovers
map.on('load', function(){
    let firstLocation = [vacation.route.startingPoint.lng, vacation.route.startingPoint.lat];
    map.panTo(firstLocation);
    displayMarkersOnMap()
    getVacationRoute()
});

/**
 * displayMarkersOnMap function
 * Runs when map loads.
 * Generates markers and popups for stopovers on route.
 */
function displayMarkersOnMap(){

    // Create starting point marker
    let startingPointMarker = new mapboxgl.Marker({ 
        color: "#3FB1CE", 
        scale: 1
    });

    // Set starting point longitude 
    let startingPointLng = vacation.route.startingPoint.lng;
    // Set starting point latitude
    let startingPointLat = vacation.route.startingPoint.lat;
    // Set marker coordinates
    startingPointMarker.setLngLat([startingPointLng, startingPointLat]);

    // Create popup for starting point
    let startingPointPopup = new mapboxgl.Popup({ offset: 35});

    // Set starting point popup text
    startingPointPopup.setText(`STARTING LOCATION: ${vacation.route.startingPoint.address}`);

    // Display starting point marker
    startingPointMarker.addTo(map);

    // Assign starting point popup to starting point marker
    startingPointMarker.setPopup(startingPointPopup);

    // Display stopovers on map
    for (let i = 0; i < vacation.route.stopOvers.length; i++)
    {
        // Create marker for current stopover
        let marker = new mapboxgl.Marker({ 
            color: "blue", 
            scale: 0.8
        });
        // Set current stopover longitude 
        let stopOverLng = vacation.route.stopOvers[i].lng;
        // Set current stopover latitude
        let stopOverLat = vacation.route.stopOvers[i].lat;
        // Set marker coordinates
        marker.setLngLat([stopOverLng, stopOverLat]);
        
        // Create popup for current stopover
        let popup = new mapboxgl.Popup({ offset: 35});

        // Set popup text
        let popupText = `${vacation.route.stopOvers[i].address} - ${vacation.route.stopOvers[i].type.toUpperCase()}`;
        popup.setText(popupText);

        // Display marker
	    marker.addTo(map);

        // Assign popup to marker
        marker.setPopup(popup);
    }
}

 /**
 * getVacationRoute function
 * Called when route is to be displayed.
 * Creates route layer and requests route data.
 */
function getVacationRoute(){

    // Create object for map layer source
    let object = {
        type: "geojson",
        data: {
            type: "Feature",
            properties: {},
            geometry: {
                type: "LineString",
                coordinates: []
            }
        }
    };

    // Create layer for route
    map.addLayer({
        id: "routes",
        type: "line",
        source: object,
        layout: {
            "line-join": "round",
            "line-cap": "round"
        },
        paint: {
            "line-color": "#0099ff",
            "line-width": 4
        }
    });

    // Get data for route
    let routeCoords = vacation.route.stopOverCoords;
    // Find route from starting location to first POI
    sendXMLRequestForRoute(vacation.route.startingPoint.lat, vacation.route.startingPoint.lng, routeCoords[0][0], routeCoords[0][1], displayRouteOnMap);

    // Find route between each POI
    for(let i = 0; i < (vacation.route.numStops-1); i++){
        sendXMLRequestForRoute(routeCoords[i][0], routeCoords[i][1], routeCoords[i+1][0], routeCoords[i+1][1], displayRouteOnMap);
    }
}


 /**
 * displayRouteOnMap function
 * Callback function for sendXMLRequestForRoute.
 * Adds all coordinates of a route to the 'routes' map source data.
 * @param {Object} data contains the data of a route
 */
function displayRouteOnMap(data){

    // Get map source to save coordinates
    let routesSource = map.getSource("routes");

    // Create mapboxgl Bounds variable
    let startingCoor = vacation.route.startingPoint
    let sw = new mapboxgl.LngLat(startingCoor.lng, startingCoor.lat);
    let ne = new mapboxgl.LngLat(startingCoor.lng, startingCoor.lat);
    let mapBounds = new mapboxgl.LngLatBounds(sw, ne);

    // Add each route coordinate to the source data and extend the map bounds
    for(let i = 0; i < data.routes[0].geometry.coordinates.length; i++){
        routesSource._data.geometry.coordinates.push(data.routes[0].geometry.coordinates[i]);
        mapBounds.extend(data.routes[0].geometry.coordinates[i])
    }
    // Update 'routes' source
    map.getSource("routes").setData(routesSource._data);

    // Update map bounds
    map.fitBounds(mapBounds, {
        padding: 30
    });
}

/*------------------------
* DISPLAY VACATION DETAILS 
  ------------------------*/

 /**
 * displayVacationDetail function
 * Runs when page loads.
 * Generates display of planned vacation detail (vacation name, starting date, starting location, 
 * vehicle details, total distance, number of stops).
 */
function displayVacationDetail(){

    // Set value of vacation name 
    let vacationNameRef = document.getElementById("vacationName");
    vacationNameRef.innerText = vacation.name;

    // Set value of vacation starting date 
    let vacationDateRef = document.getElementById("vacationDate");
    vacationDateRef.innerText = vacation.startingDate;

    // Set value of vacation starting point 
    let vacationStartingPointRef = document.getElementById("vacationStartingPoint");
    vacationStartingPointRef.innerText = vacation.route.startingPoint._address;

    // Set value of vacation/route distance 
    let vacationDistanceRef = document.getElementById("vacationDistance");
    vacationDistanceRef.innerText = vacation.route.totalDistance.toFixed() + "km";

    // Set value of vacation/route number of stops
    let vacationNumStopsRef = document.getElementById("vacationNumStops");
    vacationNumStopsRef.innerText = vacation.route.numStops;

    // Set value of vehicle type
    let vacationVehicleRef = document.getElementById("vacationVehicle");
    vacationVehicleRef.innerText = vacation.route.vehicleName;

    // Set value of vehicle range
    let vacationVehicleRangeRef = document.getElementById("vacationVehicleRange");
    vacationVehicleRangeRef.innerText = vacation.route.vehicleRange + "km";
}

/*----------------
* BUTTON FUNCTIONS 
  ----------------*/

/**
 * backToList function
 * Runs when Back button is clicked.
 * Directs user to vacation.html page.
 */
function backToList()
{
    window.location = "vacationlist.html";
}

/**
 * deleteVacation function
 * Runs when Delete button is clicked.
 * Updates local storage.
 * Directs user to vacationlist.html page.
 */
function deleteVacation(){

    if (confirm(`Confirm to delete this vacation?`))
    {
        // Remove vacation from list
        listOfVacations.plannedVacations.splice(vacationIndex, 1);
        // Update LS
        updateLSData(VACATIONS_KEY, listOfVacations);
        // Go to vacation list page
        window.location = "vacationlist.html";
    }
 }

displayVacationDetail();
