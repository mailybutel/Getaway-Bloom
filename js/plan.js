"use strict";

/**
 * File Name: plan.js
 * Description: Contains the functionality for the plan page.
 *      Involves setting, updating, displaying and saving a vacation
 * ID: Team 001
 * Last Modified: 15/10/21
*/

// Global variable to keep track of route
let route = new Route();

 // Using Mapbox API
mapboxgl.accessToken = MAPBOX_KEY;


/* ---------------
*  MAPBOX FEATURES
*  --------------- */
// Create a map object and set a initial coordinates
let map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v9',
    center: [144.9648731,-37.86217],
    zoom: 14,
});
let startingMarker = new mapboxgl.Marker({
    color: "#3FB1CE",
});
let startingPopup = new mapboxgl.Popup({offset:40});
startingMarker.setPopup(startingPopup);

// Create an object to contain user address input that has autocomplete
window.planStartingLocation = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    mapboxgl: mapboxgl,
    placeholder:'Start Typing...',
});

// Add the autocomplete input box into html section with div id 'planStartingLocation'
document.getElementById('planStartingLocation').appendChild(planStartingLocation.onAdd(map));

window.POI = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    mapboxgl: mapboxgl,
    placeholder:'Start Typing...',
});


/* ---------------
*  EVENT LISTENERS
*  --------------- */
// When the map loads, pan to Monash Clayton
map.on('load', function(){
    let monashClayton = [145.1343136, -37.908];
    map.panTo(monashClayton);
});

// Event listener for when an adress is selected from the autocomplete list
planStartingLocation.on("result", function(e){
    // Clear all markers
    while(map._markers.length > 0){
        map._markers[map._markers.length - 1].remove()
    }

    // Get coordinates
    let lng = e.result.center[0];
    let lat = e.result.center[1];

    // Set starting location marker
    startingMarker.setLngLat([lng, lat]);
    startingMarker.addTo(map);

    // Set popup
    let startingLocationString = e.result["place_name"];
    startingPopup.setHTML(`${startingLocationString}`);
    startingPopup.setLngLat([lng, lat]);
    startingPopup.addTo(map);

    // Set route starting location
    route.startingPoint = new PointOfInterest(lat, lng, startingLocationString);
})

// When the starting location input is clicked, enable suggestions
planStartingLocation.on("click", function(){
    document.querySelector(".suggestions").hidden = false;
})

// When the starting location input is cleared, clear the marker and popup
planStartingLocation.on("clear", function(){
    startingMarker.remove();
    startingPopup.remove();
    startingMarker._lngLat = undefined;
    route.startingPoint = undefined;
    document.querySelector('.mdl-js-checkbox').MaterialCheckbox.uncheck();
})

// When text is typed into the input, clear the marker and popup
planStartingLocation._inputEl.addEventListener('keydown', function(){
    startingMarker.remove();
    startingPopup.remove();
    document.querySelector('.mdl-js-checkbox').MaterialCheckbox.uncheck();
    startingMarker._lngLat = undefined;
    route.startingPoint = undefined;
    document.querySelector(".suggestions").hidden = false;
});

// When user clicks on the map, get the address and display it
map.on("click", function(e){
    let lng = e.lngLat.lng;
    let lat = e.lngLat.lat;
    let startingRef = document.querySelector('#startingSection');
    if(!startingRef.getAttributeNames().includes('disabled')){
        sendWebServiceRequestForReverseGeocoding(lat, lng, "displayMapClickLocation");
    }
    if(startingPopup.isOpen() == false){startingPopup.addTo(map)}
})


// Load vehicles into dropdown box
let vehicleListRef = document.getElementById("planVehicle");
let output = `<option value=""></option>`;
for(let i = 0; i < listOfVehicles.length; i++){
    output += `<option value="${i}">${listOfVehicles[i].name}: ${listOfVehicles[i].distance}km</option>`;
}
vehicleListRef.innerHTML = output;

/*------------------------------
* FUNCTIONS FOR STARTING DETAILS
  ------------------------------*/
/**
  * getCoordinatesForReverseGeocoding function
  * Callback function for getUserCurrentLocationUsingGeolocation
  * Uses reverse geocoding to get the user's current address
  */
function getCoordinatesForReverseGeocoding(lat, lng){
    sendWebServiceRequestForReverseGeocoding(lat, lng, "displayCurrentLocation");
}

/**
  * displayCurrentLocation function
  * Callback function for sendWebServiceForReverseGeocoding
  * Updates the vacation starting location
  * @param {object} data contains data of starting location
  */
function displayCurrentLocation(data){
    // Get the details of the starting location
    let currentLocationString = data.results[0].formatted;
    let lat = data.results[0].geometry.lat;
    let lng = data.results[0].geometry.lng;
    planStartingLocation.setInput(currentLocationString);
    route.startingPoint = new PointOfInterest(lat, lng, currentLocationString);

    // Show starting location and hide suggestions
    map.panTo([lng, lat]);
    document.querySelector(".suggestions").hidden = true;

    // Set marker and popup
    startingMarker.setLngLat([lng, lat]);
    startingMarker.addTo(map);
    startingPopup.setHTML(`${currentLocationString}`);
    startingPopup.setLngLat([lng, lat]);
    startingPopup.addTo(map);
    // Check the checkbox
    document.querySelector('.mdl-js-checkbox').MaterialCheckbox.check();
}


/**
  * useCurrentLocation function
  * Runs when the 'Use current location' checkbox is ticked on the plan page.
  * Gets the user's current coordinates
  */
function useCurrentLocation(){
    let checkbox = document.getElementById("checkbox-currentLocation");
    // If checkbox is being checked, get users location
    if(checkbox.checked){
        getUserCurrentLocationUsingGeolocation(getCoordinatesForReverseGeocoding);
        
    // If being unchecked, enable functionality
    } else {
        document.querySelector(".suggestions").hidden = false;
        planStartingLocation.clear();
    }
    
    // Uncheck the checkbox so that it is only checked if the user accepts geolocation
    document.querySelector('.mdl-js-checkbox').MaterialCheckbox.uncheck();

    
}

/**
  * displayMapClickLocation function
  * Callback function for sendWebServiceRequestForReverseGeocoding
  * Gets and displays the selected location
  * @param {object} data contains the data of the clicked location on the map
  */
function displayMapClickLocation(data){
    let startingRef = document.querySelector('#startingSection');

    // Check if starting details can still be altered
    if(!startingRef.getAttributeNames().includes('disabled')){
        // Get the latitude, longitude and location string
        let startingLocationString = data.results[0].formatted;
        let lat = data.results[0].geometry.lat;
        let lng = data.results[0].geometry.lng;
        planStartingLocation.setInput(startingLocationString);
        route.startingPoint = new PointOfInterest(lat, lng, startingLocationString);

        // Hide suggestions
        document.querySelector(".suggestions").hidden = true;
        // Pan to the location
        map.panTo([lng, lat]);

        // Remove current marker
        map._markers.forEach(marker => marker.remove())
        
        // Set markers and popup
        startingMarker.setLngLat([lng, lat]);
        startingMarker.addTo(map);

        startingPopup.setHTML(`${startingLocationString}`);
        startingPopup.setLngLat([lng, lat]);
        startingPopup.addTo(map);

        // Uncheck the checkbox 
        document.querySelector('.mdl-js-checkbox').MaterialCheckbox.uncheck();
    }
    
}


/**
  * saveStartingDetails function
  * Called when user clicks 'save starting details' button
  * Checks the vehicle and starting location inputs
  */
function saveStartingDetails(){
    // Boolean values for vehicle and starting location inputs
    let selectedVehicleIndex = document.getElementById("planVehicle").selectedIndex;
    let validVehicle = selectedVehicleIndex>0 && selectedVehicleIndex<=listOfVehicles.length;
    let validStartingLocation = typeof(startingMarker.getLngLat())!= "undefined";

    // If both are valid, enable POI inputs
    if(validVehicle && validStartingLocation){

        // Save vehicle to route object
        route.vehicle = listOfVehicles[selectedVehicleIndex-1].name;
        route.vehicleRange = listOfVehicles[selectedVehicleIndex-1].distance;

        // enable POI section
        document.getElementById("POISection").removeAttribute('disabled');
        // Add html to the planSectionCondensed div
        let output = `<p class="mdl-typography--body-1"> ${route.startingPoint.address}</p>
        <br><p class="mdl-typography--body-1"> ${route.vehicleName},  ${route.vehicleRange}km</p>`;
        let condensedStartingRef = document.getElementById("startingSectionCondensed");
        condensedStartingRef.classList.add("planSection")
        condensedStartingRef.innerHTML = output;
        // Hide and disable plan section inputs
        document.getElementById("startingSection").setAttribute('disabled', '');
        document.querySelector('.mapboxgl-ctrl-geocoder--input').disabled = true;
        document.querySelector('.mapboxgl-ctrl-geocoder--button').disabled = true;
        document.getElementById("startingSection").hidden = true;

        // Enable POI section
        let FabButtonDisabled = document.querySelector("#addPOI");
        FabButtonDisabled.disabled = false;
        let FabButtonRef = document.getElementById("addPOI");
        FabButtonRef.classList.remove("mdl-button--disabled");

        // Update distances
        distLeft = route.vehicleRange;
        let distRef = document.getElementById("distanceLabel");
        distRef.innerHTML = `<p class="mdl-typography--body-1">Total Distance: 0km<br>Vehicle Range Left: ${distLeft.toFixed()}km</p>`;

        // Autofill search input
        window.POISearch = new MapboxGeocoder({
            accessToken: mapboxgl.accessToken,
            mapboxgl: mapboxgl,
            placeholder:'Start Typing...',
        });
        
        // Add the autocomplete input box into html section with div id 'planStartingLocation'
        document.getElementById('POISearch').appendChild(POISearch.onAdd(map));

        // Add an on result event listener to remove it's marker
        POISearch.on('result', ()=>{
            map._markers[map._markers.length -1].remove();
        })

        // If only vehicle is invalid, show error message for vehicle dropdown
    } else if(!validVehicle && validStartingLocation) {
        document.getElementById("vehicleDropdown").classList.add("is-invalid");
        document.getElementById("vehicleDropdown").classList.add("is-dirty");

        // If only starting location is invalid, show error message for starting location section
    } else if(validVehicle && !validStartingLocation){
        //console.log("enter valid starting location")

        // If both are invalid, show errors for both inputs
    } else{
        //console.log("enter valid starting location");
        document.getElementById("vehicleDropdown").classList.add("is-invalid");
        document.getElementById("vehicleDropdown").classList.add("is-dirty");
    }
}

/*--------------------------------------
* FUNCTIONS FOR GETTING AND SHOWING POIS
  --------------------------------------*/

/**
  * processPOI function
  * Callback function for sendXMLRequestForPlaces function
  * Creates a marker, popup, event listener and PointOfInterest instance variable for each POI
  * @param {object} data contains the data of the surrounding POIs
  */
function processPOI(data){
    // Declare variable to hold each POI marker
    let markerArray = [];

    data.features.forEach(POI => {
        // Create an instance of the PointOfInterest Class for each POI
        let name = POI.text;
        let type = document.querySelector("#POIType").value;
        let coor = POI.center;
        let address = POI["place_name"];
        let POIobj = new PointOfInterest(coor[1], coor[0], address, name, type);

        // Create a marker for each POI
        let POImarker = new mapboxgl.Marker({
            color: 'blue',
            scale: 0.8
        });
        POImarker.setLngLat([coor[0], coor[1]]);
        POImarker.addTo(map);
        markerArray.push(POImarker);

        // Create a 'click' event listener for each POI marker
        POImarker.getElement().addEventListener('click', () => {
            // When marker is clicked, add the POI object to the route list
            route.addToRoute(POIobj);
            // Remove all POI markers in the array
            markerArray.forEach(marker => marker.remove())
            // Add the selected marker back to the map
            POImarker.addTo(map);
            // Add POI to the draggable list
            addPOIToList(POIobj);

            // Fit the map to the currunt POIs
            let startingCoor = startingMarker.getLngLat();
            let sw = new mapboxgl.LngLat(startingCoor.lng, startingCoor.lat);
            let ne = new mapboxgl.LngLat(startingCoor.lng, startingCoor.lat);
            let bounds = new mapboxgl.LngLatBounds(sw, ne);
            
            for(const POI of route.stopOverCoords){
                bounds.extend([POI[1], POI[0]]);
            }
            bounds.extend(startingCoor[0], startingCoor[1]);
            map.fitBounds(bounds, {
                padding: 30
            });
            
            getRoute();
        });

        // Create a popup for each POI
        let POIpopup = new mapboxgl.Popup({offset: 35});
        POIpopup.setLngLat([coor[0], coor[1]]);
        POIpopup.setHTML(`${name}`);
        POImarker.setPopup(POIpopup);

        // Add event listener to show popups on hover
        POImarker.getElement().addEventListener('mouseenter', () => POIpopup.addTo(map));

    })

    let bounds = new mapboxgl.LngLatBounds();

    for(const marker of markerArray){
        bounds.extend(marker.getLngLat());
    }
    map.fitBounds(bounds, {
        padding: 30
    });
    
}

/**
  * showPOIs function
  * Called when the add POIs plus button is pressed
  * Checks that input POI information is valid and requests surrounding POIs
  */
function showPOIs(){
    // Get reference 
    let selectedPOIType = document.getElementById("POIType");

    // Check if 
    if(selectedPOIType.selectedIndex>0){
        if(map._markers.length > (route.numStops+1)){
            while(map._markers.length > 0){
                map._markers[map._markers.length - 1].remove()
            }
            // Add the required markers back to the map
            startingMarker.addTo(map);
            route.stopOvers.forEach(POI => {
                let POImarker = new mapboxgl.Marker({
                    color: 'blue',
                    scale: 0.8
                });
                POImarker.setLngLat([POI.lng, POI.lat]);
                POImarker.addTo(map);
        
                // Create a popup for each POI
                let POIpopup = new mapboxgl.Popup({offset: 35});
                POIpopup.setLngLat([POI.lng, POI.lat]);
                POIpopup.setHTML(`${POI.name}`);
                POImarker.setPopup(POIpopup);
                // Add event listener to show popups on hover
                POImarker.getElement().addEventListener('mouseenter', () => POIpopup.addTo(map));
            })
        }
        let center = map.getCenter();
        sendXMLRequestForPlaces(selectedPOIType.value, center.lng, center.lat, processPOI);
    } else{
        document.getElementById("POITypeDropdown").classList.add("is-invalid");
        document.getElementById("POITypeDropdown").classList.add("is-dirty");
    }
}

/**
  * addPOIToList function
  * Called when POI is selected
  * Adds POI to the draggable list and collapses POI selection inout area
  * @param {object} POI contains the data of the POI
  */
function addPOIToList(POI){
    // Get the icon for the POI's query type
    let icon = "";
    let POIType = POI.type;
    if(POIType == "tourism"){
        icon = "attractions";
    } else if(POIType == "hotel"){
        icon = "bed";
    } else if(POIType == "gas station"){
        icon = "local_gas_station";
    } else if(POIType == "food"){
        icon = "restaurant";
    }

    // Make a new div at the end of the listOfPOIs div
    let listContRef = document.getElementById("listOfPOIs");
    let output = 
    `<li class="item" draggable="true">
        <span class = "material-icons">${icon}</span>
        <span class="text">${POI.name}</span>
        <i class="material-icons delete" onclick="deletePOI(this)">close</i>
        <i class="material-icons drag">menu</i>
    </li>`;
    listContRef.innerHTML += output;

    // Reset dropdown boxes
    let POITypeListRef = document.querySelector("#POIType")
    POITypeListRef.selectedIndex = 0;
}

/*-----------------------
* FUNCTIONS FOR THE ROUTE
  -----------------------*/

// Global variable to keep track of when vehicle needs to fuel up
let distLeft;

/**
  * getRoute function
  * Called when the route needs to be updated
  * Creates a new route layer and requests the route data
  */
function getRoute(){
    // Check if there is an existing layer for routes
    if(map.getLayer('routes') != undefined){
        map.removeLayer('routes');
        map.removeSource('routes');
    }

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

    // Create layer for routes
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

    // Restart distance and fuel range
    route.totalDistance = 0;
    distLeft = route.vehicleRange;
    // getDataForRoute(route.stopOverCoords);
    let coords = route.stopOverCoords;
    // Find route from starting location to first POI
    sendXMLRequestForRoute(route.startingPoint.lat, route.startingPoint.lng, coords[0][0], coords[0][1], displayRoute);

    // Find route between each POI
    for(let i = 0; i < (route.numStops-1); i++){
        sendXMLRequestForRoute(coords[i][0], coords[i][1], coords[i+1][0], coords[i+1][1], displayRoute);
    }
}

/**
  * displayRoute function
  * Callback function for sendXMLRequestForRoute
  * Adds all coordinates of a route to the 'routes' map source data
  * @param {Object} data contains the data of a route
  */
function displayRoute(data){

    let legDist = data.routes[0].distance/1000;
    // Check if the POI is in distance
    if(legDist < distLeft){
        // Subtract the distance required from the distance remaining
        route.totalDistance += legDist;
        distLeft -= legDist;
        if(route.stopOvers[route.numStops-1].type == "gas station"){
            distLeft = route.vehicleRange;
        }
        // Get map source to save coordinates in
        let routesSource = map.getSource("routes");

        // Add each route coordinate to the source data and extend the map bounds
        for(let i = 0; i < data.routes[0].geometry.coordinates.length; i++){
            routesSource._data.geometry.coordinates.push(data.routes[0].geometry.coordinates[i]);
        }
        // Update 'routes' source
        map.getSource("routes").setData(routesSource._data);

        // Update distance and remaining distance
        let distRef = document.getElementById("distanceLabel");
        distRef.innerHTML = `<p class="mdl-typography--body-1">Total Distance: ${route.totalDistance.toFixed()}km<br>Vehicle Range Left: ${distLeft.toFixed()}km</p>`;

    // If not in distance, remove it from the list
    } else {
        window.alert(`${route.stopOvers[route.numStops-1].name} is out of your vehicle's current range. Try refueling first.`)
        route.stopOvers.pop();
        map._markers[map._markers.length -1].remove();
        let outOfRangePOIListRef = document.getElementById("listOfPOIs").getElementsByTagName("li");
        outOfRangePOIListRef[outOfRangePOIListRef.length-1].remove()

        // Set bounds back to how it was
        // Fit the map to the currunt POIs
        let startingCoor = startingMarker.getLngLat();
        let sw = new mapboxgl.LngLat(startingCoor.lng, startingCoor.lat);
        let ne = new mapboxgl.LngLat(startingCoor.lng, startingCoor.lat);
        let bounds = new mapboxgl.LngLatBounds(sw, ne);
        
        for(const POI of route.stopOverCoords){
            bounds.extend([POI[1], POI[0]]);
        }
        bounds.extend(startingCoor[0], startingCoor[1]);
        map.fitBounds(bounds, {
            padding: 30
        });
    }
    
}

 /**
  * updatePOIOrder function
  * Runs when the POI list is edited
  * Updates the stopOver array in the route object to match the list 
  */
 function updatePOIOrder(){
    // Create a temporsry array to store the order of POIs in
    let tempPOIArray = [];
    // Get the reference for the list of POIs
    let draggableListRef = document.getElementById("listOfPOIs").getElementsByTagName("span");

    // Check through each item in the POIs list and each stopOver in the route.
    // if they are equal, add it to the temporary array
    for(let i = 0; i < draggableListRef.length; i++){
        for(let j = 0; j < route.numStops; j++){
            if(draggableListRef[i].innerText == route.stopOvers[j].name){
                tempPOIArray.push(route.stopOvers[j]);
            }
        }
    }
    // Update the route with the new order
    route.changeRoute(tempPOIArray);
    // Display the new route to the map
    getRoute();
}

 /**
  * deletePOI function
  * Runs when the 'X' icon is clicked on a POI in the list
  * Deletes the POI and updates the route
  * @param {element} el the cross icon of the HTML element being deleted
  */
function deletePOI(el){
    // Get the element's parent node
    let listItem = el.parentNode;
    // Check which stopOver element corresponds to the element being deleted
    for(let i = 0; i < route.numStops; i++){
        if(listItem.getElementsByClassName("text")[0].innerText == route.stopOvers[i].name){
            // Delete the corresponding POI from the stopOvers array
            route.stopOvers.splice(i, 1);
        }
    }
    // Remove the element from the POI list
    listItem.remove();
    // Remove all markers from the map
    while(map._markers.length > 0){
        map._markers[map._markers.length - 1].remove()
    }
    // Add the required markers back to the map
    startingMarker.addTo(map);
    route.stopOvers.forEach(POI => {
        let POImarker = new mapboxgl.Marker({
            color: 'blue',
            scale: 0.8
        });
        POImarker.setLngLat([POI.lng, POI.lat]);
        POImarker.addTo(map);

        // Create a popup for each POI
        let POIpopup = new mapboxgl.Popup({offset: 35});
        POIpopup.setLngLat([POI.lng, POI.lat]);
        POIpopup.setHTML(`${POI.name}`);
        POImarker.setPopup(POIpopup);
        // Add event listener to show popups on hover
        POImarker.getElement().addEventListener('mouseenter', () => POIpopup.addTo(map));

    })
    // Redraw the route
    getRoute();
}

/* --------------
*  DRAGGABLE LIST
*  -------------- */

let currentlyDragging = null;

// Event listener for starting the drag
// Assigns the list item being draaged to currentlyDragging variable
document.addEventListener('dragstart', (e) => {
    currentlyDragging = getDraggingListItem(e.target);
});

// Event listener for when a list item is being dragged over another list item
// Sets the top and bottom border of the item being dragged over
document.addEventListener('dragover', (e) => {
    // Prevent list from going back to its initial position
    e.preventDefault();
    // Get the item being dragged over's HTML
    let POIItem = getDraggingListItem(e.target);

    try{
        // Get the rectangle bounding the list item
        let bounding = POIItem.getBoundingClientRect(); //getBoundingClientRect() returns an object
        // Get the vertical halfway point of the list item
        let middle = bounding.y + (bounding.height/2);
        // If the mouse is lower than the middle line, highlight the bottom border
        if (e.clientY - middle > 0) {
            POIItem.style['border-bottom'] = 'solid 4px blue';
            POIItem.style['border-top'] = '';
            // If the mouse is above the middle line, highlight the top border
        } else {
            POIItem.style['border-top'] = 'solid 4px blue';
            POIItem.style['border-bottom'] = '';
        }
    } catch{}
});

// Event listener for when the POI list item is dragged away from a list item
// Clears the border of the item that was being dragged over
document.addEventListener('dragleave', (e) => {
    let POIItem = getDraggingListItem(e.target);
    try{
        POIItem.style['border-bottom'] = '';
        POIItem.style['border-top'] = '';
    }catch{}
});

// Event listener for when the POI list item is dropped
document.addEventListener('drop', (e) => {
    // Prevent it from going back to its initial position
    e.preventDefault();
    // Get the item being dropped on
    let POIItem = getDraggingListItem(e.target);
    try{
        // If the item being dropped on has its bottom border highlighted, insert it before the next item
        if (POIItem.style['border-bottom'] != '') {
            POIItem.style['border-bottom'] = '';
            POIItem.parentNode.insertBefore(currentlyDragging, e.target.nextSibling);
            updatePOIOrder();
            // If the item being dropped on has its top border highlighted, insert the item being dragged
        } else {
            POIItem.style['border-top'] = '';
            POIItem.parentNode.insertBefore(currentlyDragging, e.target);
            updatePOIOrder();
        }
    } catch{}
});

 /**
  * getDraggingListItem function
  * Called when POI list items are being dragged/dropped
  * Returns the parent node of the HTML element being dragged or dragged over
  * @param {HTML} listItem the HTML element being dragged or dragged over
  */
function getDraggingListItem(listItem) {
    // While the list item being dragged/dragged over is not 'li' or 'body', make it equal to its parent node
    // This ensures that the list cannot be entered inbetween elements within a list item (E.g. spans)
    while (listItem.nodeName.toLowerCase() != 'li' && listItem.nodeName.toLowerCase() != 'body') {
        listItem = listItem.parentNode;
    }
    // If the list item is not body, return it
    if (listItem.nodeName.toLowerCase() != 'body') {
        return listItem;
    }
}

/*---------------
* SAVING VACATION 
  ---------------*/

let dialog = document.querySelector('dialog');
dialogPolyfill.registerDialog(dialog);

/**
 * saveTrip function
 * Runs when the 'SAVE TRIP' button is clicked on the plan page.
 * Prompts user to complete name and date of vacation
 */
function saveTrip(){
    // Check if user has input starting details and at least 2 POIs
    if((route.numStops>1) && (route.startingPoint != undefined) && (route.vehicleName != undefined)){
        dialog.showModal();
    }
}

/**
 * cancelTrip function
 * Runs when the 'CANCEL' button is clicked on the plan page.
 * Returns user to the home page
 */
function cancelTrip(){
    window.location = "index.html";
}

/**
 * clearAll function
 * Runs when the 'CLEAR ALL' button is clicked on the plan page.
 * Reloads the page
 */
function clearAll(){
    location.reload();
}

/**
 * closeDialog function
 * Runs when the 'CLOSE' button is clicked on the dialog
 * Closes the dialog
 */
function closeDialog(){
    dialog.close();
}

/**
 * saveToLS function
 * Runs when the 'SAVE' button is clicked in the dialog
 * Saves the vacation to LS
 */
function saveToLS(){
    let name = document.getElementById("vacationName");
    let date = document.getElementById("vacationDate");
    if((name.value != "") && (date.value != "")){
        // Save the vacation to listOfVacations
        let vacation = new PlannedVacation(name.value, date.value, route);
        listOfVacations.addToVacationList(vacation);
        // Sort the list of vacations before saving to LS
        sortVacationList(listOfVacations);
        let index;
        for(let i = 0; i < listOfVacations.plannedVacations.length; i++){
            if(listOfVacations.plannedVacations[i] == vacation){
                index = i;
            }
        }
        // Update LS
        updateLSData(VACATIONS_KEY, listOfVacations);
        updateLSData(VACATION_INDEX, index)
        // Go to vacation list page
        window.location = "vacationdetailed.html";
    }
}

/**
 * sortVacationList function
 * Runs when page called.
 * Sorts the list of vacations by its starting date using the selection sort algorithm.
 * @param {object} listOfVacations list of vacations object 
 */
function sortVacationList(listOfVacations)
{
    for (let i = 0; i < listOfVacations.plannedVacations.length - 1; i++)
    {
        // minIndex is the index of the vacation with a starting date closest to current date (smallest difference between starting and current date)
        let minIndex = i;
        // For each remaining vacation beyond i
        for (let j = i + 1; j < listOfVacations.plannedVacations.length; j++)
        {
            // Check if the starting date of the vacation at j is earlier than the starting date of the vacation at minIndex
            if (new Date(listOfVacations.plannedVacations[j].startingDate) < new Date(listOfVacations.plannedVacations[minIndex].startingDate))
            {
                // If it is, make this the new minIndex
                minIndex = j;
            }
        }

        // If the nearest vacation is not already at index i
        if (minIndex !== i)
        {
            // Swap vacations to put the nearest vacation at index i
            let temp = listOfVacations.plannedVacations[i];
            listOfVacations.plannedVacations[i] = listOfVacations.plannedVacations[minIndex];
            listOfVacations.plannedVacations[minIndex] = temp;
        }
    }
}