import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["order", "orderId", "statusSection", "orderDrink", "setNew", "setReady", "setDone", "doDelete" ]
  
  connect() {
    //console.log("ready_controller connected", this.element);
    addEventListener("turbo:before-stream-render",
                     (event) => {this.beforeStreamRender(event) });
    this.onPageLoad();
  }


  beforeStreamRender(event){
    //console.log("beforeStreamTender");
    //console.log(event);
    // only execute if we are on the "stores/ready" page 
    if(!document.getElementById("ready")){
      //console.log("not ready page - exiting beforeStreamRender()");
      return;
    }
    const fallbackToDefaultActions = event.detail.render
    event.detail.render = (streamElement) => {
      //console.log("streamElement", streamElement);
      var turboElement = streamElement.templateContent.firstElementChild; 
      //console.log("turboElement:", turboElement);
      var formElement = turboElement.firstElementChild.firstElementChild; 
      //console.log("formElement: ", formElement);
      var formChildren = formElement.children;
      //console.log("formChildren: ", formChildren);
      var personElement = formChildren[1];
      //console.log("personElement: ", personElement);
      var personElementId = personElement.id;
      //console.log("personElementId: ", personElementId);
      var personChildren = formChildren[1].children;
      //console.log("personChildren: ", personChildren);
      //console.log(streamElement.target);
      //console.log("personChildren: ", personChildren);
      fallbackToDefaultActions(streamElement)
      this.displaySingle(personElementId);
    }
  }

  displaySingle(personElementId){
    //console.log("displaySingle Called - personElementId: ", personElementId);
    var personElement = document.getElementById(personElementId);
    var personStatus = personElement.getAttribute("data-status");
    var personId = personElementId.match(/(\d+$)/)[1];
    var turboElement = document.getElementById("turbo_request_order_" + personId); 
    var personChildren = personElement.children;
    personChildren[6].classList.remove("flex");
    personChildren[6].classList.add("hidden");
    personChildren[4].classList.add("hidden");
    personChildren[2].classList.remove("w-3/12");
    personChildren[2].classList.add("w-full");
    if(personStatus == "ready"){
        turboElement.classList.remove("hidden");
    }else{
        turboElement.classList.add("hidden");
    }
  }  

  onPageLoad(){
    //console.log("onPageLoad called");
    // format each line of the orders - hide stuff not wanted.
    var allOrderElements = this.orderTargets;
    //console.log("allOrderElements: ", allOrderElements); 
    [...allOrderElements].forEach(ele => {
      this.displaySingle(ele.id); 
    });
    // put in the background image
    var theBody = document.getElementsByTagName("body")[0];
    //console.log("theBody: ", theBody);
    theBody.classList.remove("bg-slate-100");
    var theURL = 'ready_background_autumn.jpg';
    theBody.classList.add("bg-[url(ready_background_autumn.jpg)]")
    //theBody.classList.add("bg-[url(#theURL)]")
    theBody.classList.add( "bg-no-repeat", "bg-center", "bg-fixed", "text-8xl");
  }

  // this invokes the getOrders() process when a new element 
  // of target = order is loaded. Thus works with status updates.
  // refer: https://labzero.com/blog/hotwire-decisions-when-to-use-turbo-frames-turbo-streams-and-stimulus
  orderTargetConnected(element) {
    //this.getOrders();
  }

  //--------------------------------------------------------------
  // Called when a drink button is clicked! 
  // i.e. buttons on the left margin!
  // a) sets or toggles the button
  // b) calls "hideSelectedDrink" to show and hide relevant orders.

  findSelectedDrink() {
    //console.log("=== findSelectedDrink called ===");     
  }

  //--------------------------------------------------------------
  // Called to show and hide orders  
  hideSelectedDrink() {
    //console.log("hideSelectedDrink called.")
  }

  //--------------------------------------------------------------
  // UPdate the status of an order 
  // - by pressing status button for that order
  // - this function needs to be called after the turboframe refresh
  getOrders() {
    //console.log("=== getOrders called ===")
  }

}
