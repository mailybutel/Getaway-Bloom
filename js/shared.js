"use strict";

/**
 * File Name: shared.js
 * Description: Contains content (classes, global variables) used by other files.
 *              Classes: PlannedVacation, VacationList, PointOfInterest, Route
 *              Global variables: listOfVacations, listOfVehicles
 * ID: Team 001
 * Last Modified: 15/10/21
*/

/**
 * PlannedVacation class
 * Contains the name, starting date and route attributes, where route is an instance of class Route.
 */
class PlannedVacation
{
    // Constructor
    constructor(name, startingDate, route){
        this._name = name;
        this._startingDate = startingDate;
        this._route = route;
   }

    // Accessor/s
    get route(){ 
        return this._route; 
    }
    
    get name(){ 
        return this._name; 
    }

    get startingDate(){ 
        return this._startingDate; 
    }

    // Mutator/s
	set name(newName){ 
        this._name = newName; 
    }

	set startingDate(newStartingDate){ 
        this._startingDate = newStartingDate; 
    }
    
    set route(newRoute){
        if (newRoute instanceof Route)
        {
            this._route = newRoute;
        }
    }
    
    // Method/s
    fromData(data){
        this._name = data._name;
        this._startingDate = data._startingDate;
        let tempRoute = new Route();
        tempRoute.fromData(data._route);
        this._route = tempRoute;
    }

}

/**
 * VacationList class
 * Contains array consisting of planned vacations, which are an instance of class PlannedVacation.
 */
class VacationList
{
    // Constructor
    constructor(){
        this._plannedVacations = [];
    }

    // Accessor/s
    get plannedVacations(){ 
        return this._plannedVacations; 
    }

    // Mutator/s
    //set plannedVacations()

    // Method/s
    addToVacationList(newPlannedVacation){
        if (newPlannedVacation instanceof PlannedVacation )
        {
            this._plannedVacations.push(newPlannedVacation);
        }   
    }

    fromData(data){
        this._plannedVacations = [];
        for(let i = 0; i < data._plannedVacations.length; i++){
            let tempVacation = new PlannedVacation();
            tempVacation.fromData(data._plannedVacations[i]);
            this._plannedVacations.push(tempVacation);
        }
    }
}

/**
 * PointOfInterest class
 * Contains array consisting of the name, type, address, longitude and latitude.
 */
class PointOfInterest
{
    // Constructor
    constructor(lat, lng, address, name, type){
        this._lat = lat;
        this._lng = lng;
        this._address = address;
        this._name = name;
        this._type = type;
    }

    // Accessor/s
    get name(){ 
        return this._name; 
    }

    get type(){ 
        return this._type; 
    }

    get address(){ 
        return this._address; 
    }

    get lat(){ 
        return this._lat; 
    }

    get lng(){ 
        return this._lng; 
    }

    // Mutator/s
    set name(pointName){
        this._name = pointName;
    }

    set type(pointType){
        this._type = pointType;
    }

    set address(pointAddress){
        this._address = pointAddress;
    }

    set lat(pointLat){
        this._lat = pointLat;
    }

    set lng(pointLng){
        this._lng = pointLng;
    }

    // Method/s
    fromData(data){
        this._lat = data._lat;
        this._lng = data._lng;
        this._address = data._address;
        this._name = data._name;
        this._type = data._type;
    }
}

/**
 * Route class
 * Contains array consisting of the starting point, vehicle type, vehicle range, total distance and array of stop overs 
 * containing points that are instances of class PointOfInterest.
 */
class Route
{
    // Constructor
    constructor(startingPoint, vehicle, vehicleRange){
        this._startingPoint = startingPoint;
        this._vehicle = vehicle;
        this._vehicleRange = vehicleRange;
        this._totalDistance = 0;
        this._stopOvers = [];
    }
    // Accessor/s 
    get vehicleName(){ 
        return this._vehicle; 
    }

    get vehicleRange(){ 
        return this._vehicleRange; 
    }

    get startingPoint(){ 
        return this._startingPoint;
    }

    get totalDistance(){ 
        return this._totalDistance; 
    }

    get stopOvers(){ 
        return this._stopOvers; 
    }

    get numStops(){ 
        return this.stopOvers.length; 
    }

    get stopOverCoords(){
        let coordsArray = [];
        this._stopOvers.forEach(poi => coordsArray.push([poi.lat, poi.lng]));
        return coordsArray;
    }

    // Mutator/s
	set startingPoint(newStartingPoint){
		if (newStartingPoint instanceof PointOfInterest){
            this._startingPoint = newStartingPoint;
        }
	}

    set vehicle(newVehicle){ 
        this._vehicle = newVehicle; 
    }

    set vehicleRange(newVehicleRange){ 
        this._vehicleRange = newVehicleRange; 
    }

    set totalDistance(newDistance){ 
        this._totalDistance = newDistance; 
    }

    // Method/s
    addToRoute(newPointOfInterest){
        if (newPointOfInterest instanceof PointOfInterest)
        {
            this._stopOvers.push(newPointOfInterest);
        }
    }

    changeRoute(newArray){
        let validElements = true;
        let counter = 0;
        while((counter < newArray.length) && validElements){
            if(newArray[counter] instanceof PointOfInterest){
                validElements = true;
            } else {
                validElements = false;
            }
            counter++;
        }

        if(validElements){
            this._stopOvers = newArray;
        }
    }

    fromData(data){
        this._startingPoint = new PointOfInterest();
        this._startingPoint.fromData(data._startingPoint);
        this._vehicle = data._vehicle;
        this._vehicleRange = data._vehicleRange;
        this._totalDistance = data._totalDistance;
        this._stopOvers = [];

        for(let i = 0; i < data._stopOvers.length; i++){
            let tempPOI = new PointOfInterest();
            tempPOI.fromData(data._stopOvers[i]);
            this._stopOvers.push(tempPOI);
        }
    }
    
}

// Global list of vacations variable
let listOfVacations = new VacationList();

// Global array of vehicle objects
let listOfVehicles = [{
    name: "Sedan",
    distance: 1000
},{
    name: "SUV",
    distance: 850
},{
    name: "Van",
    distance: 600
},{
    name: "Minibus",
    distance: 450
}];

if (checkLSData(VACATIONS_KEY)){
    // If data exists, retrieve it
    let data = retrieveLSData(VACATIONS_KEY);
    // Restore data into inventory
    listOfVacations.fromData(data);
}


