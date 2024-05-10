import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["order", "drink", "drinkTemplate", "drinkSection", "showStatus", "statusSection"]
  
  connect() {
    console.log("brewster_controller connected", this.element)
  
    addEventListener("turbo:before-stream-render",
                     (event) => {this.beforeStreamRenderBrewster(event) })
  
    // effectively on page load
    this.getOrders();
  
  }

  beforeStreamRenderBrewster(event){
    console.log("beforeStreamRenderBrewster - brewster");
    console.log(event);
    // only execute if we are on the "stores/brewster" page 
    if(!document.getElementById("brewster")){
      console.log("not brewster page - exiting beforeStreamRenderBrewster()");
      return;
    }
    const fallbackToDefaultActions = event.detail.render
    event.detail.render = (streamElement) => {
      console.log("streamElement", streamElement);
      fallbackToDefaultActions(streamElement);
      this.getOrders();
    }
  }

  // this invokes the getOrders() process when a new element 
  // of target = order is loaded. Thus works with status updates.
  // refer: https://labzero.com/blog/hotwire-decisions-when-to-use-turbo-frames-turbo-streams-and-stimulus
  orderTargetConnected(element) {
    //this.getOrders();
  }

  // Want to invoke this function when the page is loaded.
  //document.addEventListener('DOMContentLoaded', getOrders());

  //--------------------------------------------------------------
  // Called when a status button at top of orders is clicked! 
  // a) sets the status to be shown as data in the header div
  // b) turn the highlighting on or off for this button.
  showStatus(){
    console.log("showStatus called");
    const statusColour = {"new":"blue", "ready":"green", "done":"slate"};
    const statusValues = ["new", "ready", "done"]; 
    const selectedStatusButton = event.currentTarget; 
    var selectedStatus = selectedStatusButton.getAttribute("data-status");
    const parentButtons = selectedStatusButton.parentNode;
    var currentShowStatus = parentButtons.getAttribute("data-showStatus"); 
    // check if selectedStatus contained in currentShowStatus    
    if(currentShowStatus.includes(selectedStatus) ){                           // already selected
      var currentShowStatus = currentShowStatus.replace(selectedStatus,'');    // update show string - remove this status
      [...statusValues].forEach(thisStatus=>{
        if(selectedStatus == thisStatus){
          selectedStatusButton.classList.remove("bg-" + statusColour[thisStatus] +"-500");                    // then deselect - remove highlight
          selectedStatusButton.classList.add("bg-" + statusColour[thisStatus] +"-200");
        }
      });
    }else{
      var currentShowStatus = currentShowStatus + " " + selectedStatus;        // update show string - add this status
      [...statusValues].forEach(thisStatus=>{
        if(selectedStatus == thisStatus){
          selectedStatusButton.classList.remove("bg-" + statusColour[thisStatus] +"-200");   // then deselect - remove highlight
          selectedStatusButton.classList.add("bg-" + statusColour[thisStatus] +"-500");
        }
      });
    }
    currentShowStatus = currentShowStatus.replace(/\s+/g, ' ');                // minimise white spaces
    currentShowStatus = currentShowStatus.trim();                              // and drop leading and trailing white spaces
    parentButtons.setAttribute("data-showStatus", currentShowStatus);          // Now, put this back into the buttons parent 
    // Now update the list of orders
    this.hideSelectedDrink()  
  }

  //--------------------------------------------------------------
  // Called when a drink button is clicked! 
  // i.e. buttons on the left margin!
  // a) sets or toggles the button
  // b) calls "hideSelectedDrink" to show and hide relevant orders.

  findSelectedDrink() {
    console.log("=== findSelectedDrink called ===");
    // Now determine what button was pressed.
    const selectedEle = event.currentTarget;
    var selectedDrink = selectedEle.getAttribute("data-drink");
    // get what drink is already selected, if any
    const parentEle = selectedEle.parentNode;
    var currentSelectedDrink = parentEle.getAttribute("data-show");
    if(currentSelectedDrink === ""){                           // when nothing set
      parentEle.setAttribute("data-show", selectedDrink);      //simply set to this drink
      //selectedEle.classList.add("bg-blue-800");                // and show selected in caller button.
      selectedEle.classList.remove("bg-white", "text-blue-800");
      selectedEle.classList.add("bg-blue-800", "text-white");
    }else{
      if(selectedDrink === currentSelectedDrink){              // already selected
        parentEle.setAttribute("data-show", "");               //   then toggle off
        //selectedEle.classList.remove("bg-blue-800");           //   and so show selected in caller button.
        selectedEle.classList.add("bg-white", "text-blue-800");
        selectedEle.classList.remove("bg-blue-800", "text-white");
        }else{                                                    // selecting a different drink
        parentEle.setAttribute("data-show", selectedDrink);     //   set to new changed value
        const allDrinks = this.drinkTargets;
        [...allDrinks].forEach(node=>{                          // remove prevous settings
          //node.classList.remove("bg-blue-800");
          node.classList.add("bg-white", "text-blue-800");
          node.classList.remove("bg-blue-800", "text-white");
        });
        //selectedEle.classList.add("bg-blue-800");               // so show selected in caller button.
        selectedEle.classList.remove("bg-white", "text-blue-800");
        selectedEle.classList.add("bg-blue-800", "text-white");  
      }
    }    
    //var hideDrink = parentEle.getAttribute("data-show");
    // Now hide or show the orders
    this.hideSelectedDrink();
    //this.hideSelectedDrink(hideDrink);
      
  }

  //--------------------------------------------------------------
  // Called to show and hide orders  
  hideSelectedDrink() {
    console.log("hideSelectedDrink called.")
    const showStatus = this.statusSectionTarget.getAttribute("data-showStatus"); 
    const showDrink = this.drinkSectionTarget.getAttribute("data-show");
    const allOrders  =  this.orderTargets;
    [...allOrders].forEach(node=>{
      // show order if showDrink present (or blank) and showStatus are both present in the order
      // else hide    
      var eleShowHide = node.parentNode.parentNode.parentNode;
      if( ((node.getAttribute("data-drink") == showDrink ) || ("" == showDrink)) &&
          showStatus.includes(node.getAttribute("data-status")) || (node.getAttribute("data-status") == "cancelled")){
        eleShowHide.classList.remove("hidden");      // display this order
      }else{
        eleShowHide.classList.add("hidden");         //hide this order
      }
    });
  }

  //--------------------------------------------------------------
  // UPdate the status of an order 
  // - by pressing status button for that order
  // - this function needs to be called after the turboframe refresh
  getOrders() {
    console.log("=== getOrders called ===")

    var countNew   = 0;
    var countReady = 0;
    var countDone  = 0;
    const newDrinks = {};
    const madeDrinks = {};
    const allOrders  =  this.orderTargets;
    [...allOrders].forEach(node=>{
      var thisDrink = node.getAttribute("data-drink");
      if(node.getAttribute("data-status") == "new"){
        countNew = countNew + 1;
        if(thisDrink in newDrinks){
          newDrinks[thisDrink] = newDrinks[thisDrink] + 1;
        }else{
          newDrinks[thisDrink] = 1;
        }
      }
      if(node.getAttribute("data-status") == "done"){
        countDone = countDone + 1;
      }
    });
    // need to process done drinks after all the new drinks are done
    // Issue here is that a made drink may be encountered in the orders list
    // before we see it in the donwDrinks hash! 
    [...allOrders].forEach(node=>{
      var thisDrink = node.getAttribute("data-drink");
      if(node.getAttribute("data-status") == "ready"){
        countReady = countReady + 1;
        if(!(thisDrink in newDrinks)){
          madeDrinks[thisDrink] = 1;
        }
      }
    });
    // this section is console logging for troubleshooting.
    // ** set to true to show in console, false otherwise **
    if(false){
      console.log("drinks done :", "\t", countDone);
      console.log("drinks ready:", "\t", countReady);
      console.log("drinks new  :", "\t", countNew);
      console.log("Now list of new drinks by type.");

      [...Object.keys(newDrinks).sort()].forEach(itemkey=>{
        console.log(itemkey, "\t", newDrinks[itemkey]);
      });
      console.log("Now list of made drinks that are not in new drinks.");
      [...Object.keys(madeDrinks).sort()].forEach(itemkey=>{
        console.log(itemkey);
      });
    }
    // make the dom for drinks
    this.makeDrinkEnteries(newDrinks, madeDrinks);
    this.hideSelectedDrink();
  }

  //--------------------------------------------------------------
  // Create the Drinks to be made list  
  // a) called with parameters
  // 1. hideDrink   = the drink to be hidden, shows everything else
  // 2. flagAlready = this drink is currently set, simple need to reset!
  makeDrinkEnteries(newDrinks, readyDrinks) {
    console.log("makeDrinkEnteries called");
    //console.log("Now list of made drinks that are not in new drinks.");
    //[...Object.keys(madeDrinks).sort()].forEach(itemkey=>{
    //  console.log(itemkey);
    //});
    // Need to check if the currently selected drink is still
    // present in the new and ready lists.
    // If NOT, then reset the selected drink.
    var flagDrinkSelectedPresent = false;
    const parentEle = this.drinkSectionTarget;
    const drinkDisplay = parentEle.getAttribute("data-show");
    //console.log("drinkDisplay: ", drinkDisplay); 
    var headerEle = parentEle.children[0].cloneNode(true);
    const templateEle = this.drinkTemplateTarget;
    parentEle.replaceChildren();
    parentEle.appendChild(headerEle);    
    //console.log("------------------------------");

    [...Object.keys(newDrinks).sort()].forEach(myDrink=>{
      //console.log(myDrink, "\t", newDrinks[myDrink]);
      var drinkEle = templateEle.cloneNode(true); 
      drinkEle.classList.remove("hidden");
      drinkEle.setAttribute("data-brewster-target", "drink");  
      drinkEle.setAttribute("data-drink", myDrink);
      drinkEle.classList.add("border", "rounded-full", "border-white", "m-2");
      if(myDrink == drinkDisplay){
        flagDrinkSelectedPresent = true;
        //drinkEle.classList.add("bg-blue-800");
        drinkEle.classList.remove("bg-white", "text-blue-800");
        drinkEle.classList.add("bg-blue-800", "text-white");
      }else{
        drinkEle.classList.remove("bg-blue-800", "text-white");
        drinkEle.classList.add("bg-white", "text-blue-800");
      }
      //console.log(drinkEle);
      var drinkEleChildren = drinkEle.children;
      //console.log(drinkEleChildren);
      drinkEleChildren[0].innerText = myDrink;
      drinkEleChildren[1].innerText = newDrinks[myDrink];
      //console.log(drinkEle);
      parentEle.appendChild(drinkEle);
    });
    
    [...Object.keys(readyDrinks).sort()].forEach(myDrink=>{
      //console.log(myDrink, "\t", readyDrinks[myDrink]);
      var drinkEle = templateEle.cloneNode(true); 
      drinkEle.classList.remove("hidden");
      drinkEle.setAttribute("data-brewster-target", "drink")  
      drinkEle.setAttribute("data-drink", myDrink)
      drinkEle.classList.add("border", "rounded-full", "border-white", "m-2");
      if(myDrink == drinkDisplay){
        flagDrinkSelectedPresent = true;
        //drinkEle.classList.add("bg-blue-800");
        drinkEle.classList.remove("bg-white", "text-blue-800");
        drinkEle.classList.add("bg-blue-800", "text-white");
      }else{
        drinkEle.classList.add("bg-white", "text-blue-800");
        drinkEle.classList.remove("bg-blue-800", "text-white");
      }
      //console.log(drinkEle);
      var drinkEleChildren = drinkEle.children;
      //console.log(drinkEleChildren);
      drinkEleChildren[0].innerText = myDrink;
      //drinkEleChildren[1].innerText = manyDrinks[myDrink];
      //console.log(drinkEle);
      parentEle.appendChild(drinkEle);
    });
    if(flagDrinkSelectedPresent == false){   // selected drink no longer present
      parentEle.setAttribute("data-show", "");
    }
  }
}
