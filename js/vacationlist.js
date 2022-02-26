"use strict";

/**
 * File Name: vacationlist.js
 * Description: Contains the functionality for page containing the list of planned vacations (vacationlist.html).
 *              Involves displaying the list of planned vacations and button associated functions.
 * ID: Team 001
 * Last Modified: 15/10/21
*/

// Retrieve index for vacation to be displayed
let vacationIndex = retrieveLSData(VACATION_INDEX);

/*-------------------------
* DISPLAY VACATION LISTINGS 
  -------------------------*/

/**
 * displayVacationList function
 * Runs when page loads.
 * Generates display of current list of planned vacations.
 * Each listing includes vacation name, starting date, starting point address, total distance, vehicle type and number of stops.
 * @param {object} listOfVacations list of vacations object 
 */
function displayVacationList(listOfVacations)
{
    // Get the vacation list values via its ID
    let vacationListRef = document.getElementById("vacationListContainer");
    let outputDisplay = "";
    
    // Make a card for each vacation in the list
    for (let i = 0; i < listOfVacations.plannedVacations.length; i++)
    {
        outputDisplay += `<div class="mdl-card mdl-cell mdl-cell--12-col mdl-grid mdl-card--border mdl-shadow--2dp">
        <div class="mdl-card__title" id="vacationName">
          <h4>${listOfVacations.plannedVacations[i].name}</h4>
        </div>
        <div class="mdl-card__supporting-text">
            <div>
                When: ${listOfVacations.plannedVacations[i].startingDate}
            </div>
            <div>
                Where: ${listOfVacations.plannedVacations[i].route.startingPoint.address}
            </div>
            <div>
                Total Distance: ${listOfVacations.plannedVacations[i].route.totalDistance} km
            </div>
            <div>
                Vehicle: ${listOfVacations.plannedVacations[i].route.vehicleName}
            </div>
            <div>
                Stops: ${listOfVacations.plannedVacations[i].route.numStops}
            </div>
        </div>
        <div class="card-buttons">
            <a href="#" class="mdl-button" onclick="viewDetailedVacation(${i})">More information</a>
            <a href="#" class="mdl-button" onclick="deleteVacation(${i})">Delete Vacation</a>
        </div>
      </div>`;
    }
    vacationListRef.innerHTML = outputDisplay;
}

/*----------------
* BUTTON FUNCTIONS 
  ----------------*/

 /**
 * viewDetailedVacation() function
 * Runs when "More Information" button is clicked.
 * Updates local storage data.
 * Directs user to vacationdetailed.html page.
 * @param {integer} index index of planned vacation to be viewed
 */
 function viewDetailedVacation(index)
 {
    updateLSData(VACATION_INDEX, index);
    window.location = "vacationdetailed.html";
 }


/**
 * deleteVacation function
 * Runs when delete option in menu is clicked.
 * Deletes vacation form planned vacation list.
 * Updates local storage data.
 * Directs user to vacationlist.html page.
 * @param {integer} index is the index of the planned vacation to be deleted
 */
 function deleteVacation(index)
 {
    if (confirm(`Confirm to delete this vacation?`))
    {
      // Remove the vacation from the list
      listOfVacations.plannedVacations.splice(index, 1);
      // Update LS
      updateLSData(VACATIONS_KEY, listOfVacations);
      // Reload the page
      window.location = "vacationlist.html";
     }
 }

 // Display all vacations on load
displayVacationList(listOfVacations);
