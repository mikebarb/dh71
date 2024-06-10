import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["requestNotice", "requestNoticePerson", "filterText", "person", "requestPersonId", "requestName",
                    "requestDrink", "addPersonName", "requestPersonId1", "addPersonButton",
                    "button", "submitOrder", "submitCancel", "people", "people1", "requestSection",
                    "buttonSection", "filterSection", "addPerson", "addPersonPanelButton",
                    "personExistsMessage", "selectDrinksTitle"];
  
  connect() {
    console.log("filter_controller connected", this.element);
    this.person_bg = 'bg-white';
    this.person_bg_selected = 'bg-zinc-200';
    this.button_selected   = ["text-white", "bg-primary", "border-primary", "selected"];
    this.button_deselected = ["text-primary", "bg-white", "border-secondary"];

    addEventListener("turbo:before-stream-render",
                     (event) => {this.beforeStreamRender(event) })
  }

  beforeStreamRender(event){
    console.log("beforeStreamRender");
    console.log(event);
    // only execute if we are on the "stores/front" page 
    if(!document.getElementById("front")){
      console.log("not front page - exiting beforeStreamRender()");
      return;
    }
    const fallbackToDefaultActions = event.detail.render
    event.detail.render = (streamElement) => {
      console.log("streamElement", streamElement);
      //console.log(streamElement.target);
      fallbackToDefaultActions(streamElement)
      if (streamElement.action == "append") {
        const personElement = streamElement.templateContent.firstElementChild.firstElementChild;
        //console.log("personElement: ", personElement)
        this.onUpdate(personElement);
        this.doSort();    // of people
      }else if (["update", "replace"].includes(streamElement.action)) {
        const personElement = streamElement.templateContent.firstElementChild.firstElementChild;
        //console.log("personElement: ", personElement)
        this.onUpdate(personElement);
      }
    }
  }

  //personTargetConnected(element) {
  //  console.log("personTargetConnected invoked.");
  //  console.log(element);
  //  this.onUpdate(element);
  //}

  //--------------------------------------------------------------
  // invoked when the content of the filter Text field changes.
  // it then invokes doFilter() and unselects selected people
  changeFilterText() {
    const textElement = this.filterTextTarget
    //console.log("text changed in filterTextField", textElement.value)
    // deselect the currently selected person if typing into filter text field.
    this.deSelectPerson();
    this.doFilter();
  }

  // deSelect the currently selected person.
  deSelectPerson(){
    const thisSelectedPersonId = this.peopleTarget.getAttribute("data_person_selected");
    if(thisSelectedPersonId){
      const personNode = document.getElementById("person_" + thisSelectedPersonId).firstChild;
      this.selectPersonWithNode(personNode)
    }
  }

  backToPeople(){
    this.deSelectPerson();
    // hide: filter text area, people area
    const eleFilter = this.filterSectionTarget;
    const elePeople = this.peopleTarget;
    const eleAddPerson = this.addPersonTarget;
    const eleAddPersonButton = this.addPersonButtonTarget;
    const elePersonExistsMessage = this.personExistsMessageTarget;
    eleFilter.classList.remove("hidden");
    elePeople.classList.remove("hidden");
    eleAddPerson.classList.add("hidden");
    elePersonExistsMessage.classList.add("hidden");
  }
     
 // called when there is a turboframe update on this page.
  // input: element = the one with a data-filter-target = "person"
  //                  and also id="person_99"
  //        Note: this is the parent element of the one clicked on.
  //              also is not the turbo-frame element.
  onUpdate(element){
    console.log("onUpdate called");
    //console.log("element: ", element);
    // key decision making info about this element
    const elementPersonId    = element.getAttribute("data_person_id");                 // record id of person
    const elementStatus      = element.getAttribute("data_order_status");              // status of last order
    // key decision making info about currently selected person
    const personSelected     = this.peopleTarget.getAttribute("data_person_selected");  // record id of selected person
    //const lastListedPerson   = this.peopleTarget.lastElementChild.lastElementChild;    
    var   noticePerson       = this.requestNoticePersonTarget.textContent;      // response to add person form submit
    var   noticeOrder        = this.requestNoticeTarget.textContent;            // response to submit/cancel order form submit
    //console.log("noticePerson: ", noticePerson);         
    //console.log("noticeOrder: ", noticeOrder);
    
    //console.log("lastListedPerson: ", lastListedPerson);
    //console.log("elementPersonId: ", elementPersonId);
    //console.log("personSelected : ", personSelected);
    //console.log("elementStatus : ", elementStatus);
    if(noticePerson != ""){
      //console.log("noticeText has something ", noticePerson);
      var localAddedPersonId = noticePerson.match(/(\d+)/)[1]; 
      //console.log("localAddedPersonId: ", localAddedPersonId);
      // see if this screen added this person
      if(elementPersonId == localAddedPersonId){
        // then select this person as if someone click to select person
        this.selectPersonWithNode(element.firstElementChild);
      }
    }
    //}
    // If the person element being updated is the
    // currently selected (highlighted) person. 
    // Update generally trigered by status change for a person.
    if (elementPersonId == personSelected){
      // need to highlight this entry again indicating it is selected
      //console.log("redo the format")
      //This looks VERY CONVOLUTED - but is a workaround to
      // an append problem.
      // In append, updating classes on the attached dom element
      // didn't work.
      // The workaround is to get the dom again directly from the 
      // document, and update the classes in that.
      var parentNodeId = element.id;
      var parentNode = document.getElementById(parentNodeId);
      parentNode.classList.remove(this.person_bg);
      parentNode.classList.add(this.person_bg_selected);
      element.classList.remove(this.person_bg);
      element.classList.add(this.person_bg_selected);
      // if status is new, and this is from the server, then need to
      // update the description to match the last drink.
      if(elementStatus == "new" || elementStatus == "cancelled" ){
        this.populateRequestForm(element.firstElementChild);
        this.initialiseButtons();
      }
      // now show and hide buttons and sections
      this.showHideStuff(element.firstElementChild);
    }
  }

  showAddPerson(){
    console.log("showAddPerson called.")
    const eleAddPerson = this.addPersonTarget;
    const eleFilterSection = this.filterSectionTarget;
    const elePeople = this.peopleTarget;
    eleAddPerson.classList.remove("hidden");
    eleFilterSection.classList.add("hidden");
    elePeople.classList.add("hidden");
    // act as if a key was pressed in the text field
    // This shows/hides all the fileds and buttons correctly.
    this.checkExistingNames();
  }

  selectPerson(){
    console.log("selectPerson called");
    // make sure there are people to process
    // get the element that made this call
    const personNode = event.currentTarget;
    //console.log("personNode: ", personNode);
    this.selectPersonWithNode(personNode);
  }
  //--------------------------------------------------------------
  // select person and put details in ordering section
  // or deSelect the person if already selected.
  selectPersonWithNode(personNode){
    console.log("selectPersonWithNode called");
    //clear the flash notice html div field
    this.clearFlash();
    //console.log("personNode: ", personNode);
    //const thisPersonId = personNode.parentNode.getAttribute("data-person-selected");
    const thisPersonId = personNode.parentNode.getAttribute("data_person_id");
    //console.log("thisPersonId: ", thisPersonId);
    //check if this person is already selected.
    //<div id="people" data-filter-target="people" data-person-selected="">
    const peopleInfo = this.peopleTarget;
    //console.log("peopleInfo: ", peopleInfo);
    const thisSelectedPersonId = peopleInfo.getAttribute("data_person_selected");
    //console.log("thisSelectedPersonId: ", thisSelectedPersonId);
    // get an array of all the nodes containing each person
    const allPeople  =  this.personTargets;
    if(thisSelectedPersonId){             // something selected
      if(thisSelectedPersonId == thisPersonId){      // deselection an already selected person
        //console.log("this person already selected", thisSelectedPersonId);
        // simply deselect this person.
        this.deSelectOnePerson(personNode, peopleInfo);
        this.dePopulateRequestForm(personNode);
      }else{                                         // selecting a different person
        //console.log("selected", thisSelectedPersonId);
        //need to deselect everything!!!
        // and select this person
        this.deselectAllPeople();
        this.selectOnePerson(personNode, peopleInfo);
        this.populateRequestForm(personNode);
      }   
    }else{                                 // no current person selected
      //console.log("nothing selected");
      // use all the existing processing.
      this.deselectAllPeople();
      // show what is selected by changing text colour
      this.selectOnePerson(personNode, peopleInfo);
      // copy attributes, held in target's parent,
      // for this person into the request order fields. 
      this.populateRequestForm(personNode);
    }
    // now need to hide or show the order and remove submit buttons
    // based on drink status
    this.showHideStuff(personNode);  
    // reset drink buttons
    this.initialiseButtons()
    // hide: filter text area, people area
    const eleFilter = this.filterSectionTarget;
    const elePeople = this.peopleTarget;
    const eleAddPerson = this.addPersonTarget;
    eleFilter.classList.add("hidden");
    elePeople.classList.add("hidden");
    eleAddPerson.classList.add("hidden");
  }

  //-----------------------------------
  // selectPerson() helper functions
  //-----------------------------------
  // pass in the People = list of all people nodes
  // simply deselect each one.
  deselectAllPeople(){
    const allPeople  =  this.personTargets;
    // step through each person, resetting previous selection
    [...allPeople].forEach(node=>{
      node.classList.remove(this.person_bg_selected);
      node.classList.add(this.person_bg);
      node.classList.remove("hidden");
    });
  }

  hidePeopleButSelected(){
    console.log("hidePeopleButSelected called");
    //<div id="people" data-filter-target="people" data-person-selected="">
    const peopleInfo = this.peopleTarget;
    const thisSelectedPersonId = peopleInfo.getAttribute("data_person_selected");
    // get an array of all the nodes containing each person
    const allPeople = this.personTargets;
    if(thisSelectedPersonId != ""){
      // hide everyone except selected person
      [...allPeople].forEach(node=>{
        if(thisSelectedPersonId != node.getAttribute("data_person_id")){  // selected person
          node.classList.add("hidden");
          window.scrollTo(0, 0);
        }
      });
    }else{
      this.doFilter();
    }
  }
 
  // Select one person in the list
  // - set colours showing selection
  // - place selection id into people data 
  selectOnePerson(personNode, peopleInfo){
    // show what is selected by changing text colour
    //This looks VERY CONVOLUTED - but is a workaround to
    // an append problem.
    // In append, updating classes on the attached dom element
    // didn't work.
    // The workaround is to get the dom again directly from the 
    // document, and update the classes in that.
    var parentNode = personNode.parentNode;
    var parentNodeId = parentNode.id;
    var parentNode = document.getElementById(parentNodeId);
    parentNode.classList.remove(this.person_bg);
    parentNode.classList.add(this.person_bg_selected);
    // and record what person is selected - put data into people header
    const thisPersonId = personNode.parentNode.getAttribute("data_person_id");
    peopleInfo.setAttribute("data_person_selected", thisPersonId);
    // scroll this person into view
    //personNode.scrollIntoView();
  }

  deSelectOnePerson(personNode, peopleInfo){
    // show what is selected by changing text colour
    
    //This looks VERY CONVOLUTED - but is a workaround to
    // an append problem.
    // In append, updating classes on the attached dom element
    // didn't work.
    // The workaround is to get the dom again directly from the 
    // document, and update the classes in that.
    var parentNode = personNode.parentNode;
    var parentNodeId = parentNode.id;
    var parentNode = document.getElementById(parentNodeId);
    parentNode.classList.remove(this.person_bg_selected);
    parentNode.classList.add(this.person_bg);
    // remove code to support check boxes or radio buttons! 
    // Requested change to remove this feature 
    //parentNode.getElementsByTagName("div")[this.checkIndex].classList.add("hidden");
    //parentNode.getElementsByTagName("div")[this.boxIndex].classList.remove("hidden");

    //personNode.parentNode.classList.remove(this.person_bg_selected);
    //personNode.parentNode.classList.add(this.person_bg);
    // and record what person is selected - put data into people header
    peopleInfo.setAttribute("data_person_selected", "");
  }

  // copy attributes, held in target's parent,
  // for this person into the request order fields. 
  populateRequestForm(personNode){
    const personParentNode = personNode.parentNode;
    this.requestPersonIdTarget.value = personParentNode.getAttribute("data_person_id");
    this.requestNameTarget.value = personParentNode.getAttribute("data_name");
    this.requestDrinkTarget.value = personParentNode.getAttribute("data_order_drink");  
  }

  dePopulateRequestForm(personNode){
    const personParentNode = personNode.parentNode;
    this.requestPersonIdTarget.value = "";
    this.requestNameTarget.value = "";
    this.requestDrinkTarget.value = "";  
  }

 
  showHideStuff(personNode){
    console.log("showHideStuff called");
    const personParentNode   = personNode.parentNode
    const personSelected     = this.peopleTarget.getAttribute("data_person_selected");
    const peopleSection      = this.peopleTarget.parentNode;
    const requestSection     = this.requestSectionTarget;
    const buttonSection      = this.buttonSectionTarget;
    const filterSection      = this.filterSectionTarget;
    const newPersonButton    = this.addPersonButtonTarget;
    const buttonSubmitOrder  = this.submitOrderTarget;
    const buttonSubmitCancel = this.submitCancelTarget; 
    if(personSelected){
      requestSection.classList.remove("hidden");
      buttonSection.classList.remove("hidden");
      //filterSection.classList.add("hidden");
      //peopleSection.classList.add("max-h-40");
      peopleSection.classList.add("overflow-y-auto");
      if(personParentNode.getAttribute("data_order_status") == "new"){
        buttonSubmitOrder.classList.add("hidden");
        buttonSubmitOrder.disabled = true;
        buttonSubmitCancel.classList.remove("hidden");
        // hide the drink buttons so that they cannot change a drink
        // and then accidently think they can delete it.
        buttonSection.classList.add("hidden");
      }else{             //this drink has status other than new
        // buttonSubmitOrder.classList.remove("hidden");
        buttonSubmitOrder.disabled = false;

        buttonSubmitCancel.classList.add("hidden");
        buttonSection.classList.remove("hidden");
      }
      // if description is empty, then hide the "submit" button.
      if(this.requestDrinkTarget.value == ""){
        // buttonSubmitOrder.classList.add("hidden");
        buttonSubmitOrder.disabled = true;
      }
      //personNode.scrollIntoView();
      // Need to  hide the newPerson button when a person is selected.
      newPersonButton.classList.add("hidden");

    }else{    // noone is selected
      requestSection.classList.add("hidden");      // hide the request form  
      buttonSection.classList.add("hidden");       // hide the drink selection buttons
      //filterSection.classList.remove("hidden");    // show the filter selection or add name section
      //peopleSection.classList.remove("max-h-40");
      peopleSection.classList.remove("overflow-y-auto");
      // Need to  show the newPerson button when noone is selected.
      newPersonButton.classList.remove("hidden");
    }
    this.hidePeopleButSelected();
  }
  //-----------------------------------
  // END OF selectPerson() helper functions
  //-----------------------------------


  //---------------------------------------------------------------
  // When keying in a name to be added, we must check that that name
  // is not already in the system.
  // Note: this is based on the doFilter function.
  // input: the text field
  // operation:    Can only add a person if a person's name does 
  //               not already exist.
  //               Sets canAddName = FALSE if anyone has a name 
  //               exactly matches the search script. 
  //               Otherwise, set to TRUE.
  //                 
  checkExistingNames(){
    console.log("checkExistingNames function requested");
    
    // initialise canAddName - default to prevent adding a person
    let canAddName = true;
    // get the text to use as the filter
    const nameText = this.addPersonNameTarget.value.trim().toLowerCase()
    // get the button that need to be displayed or hidden - addPersonName
    //const addPersonButton = this.addPersonButtonTarget
    const addPersonButton = this.addPersonButtonTarget;
    const personExistsMessage = this.personExistsMessageTarget;    
    // ensure there are people on the page
    if(this.hasPersonTarget) {
      // As there are people, set canAddName to allow adding another
      // person unless we find an exact match.
      canAddName = true

      // get an array of all the person nodes containing each person
      const allPeople  =  this.personTargets;
      //console.log(allPeople);  
      // step through each person, hiding or showing person node based on a filter match
      [...allPeople].forEach(node=>{
        // Check if this person is an exact match
         if(canAddName){
          if(node.getAttribute('data_name').toLowerCase().trim().normalize() === nameText.normalize()){
            canAddName = false
          }
        }
      });
      if(canAddName){
        //this.addPersonNameTarget.value = this.filterTextTarget.value.trim();
        // addPersonButton.classList.remove("hidden");
        personExistsMessage.classList.add("hidden");
        addPersonButton.disabled = false;
      }else{
        //this.addPersonNameTarget.value = "";
        // addPersonButton.classList.add("hidden");
        personExistsMessage.classList.remove("hidden");
        addPersonButton.disabled = true;
      }
      if(nameText.trim().length == 0){
        // addPersonButton.classList.add("hidden");
        personExistsMessage.classList.add("hidden");
        addPersonButton.disabled = true;
      }
    
    }else{     // no names on the page - only happens on app/db initialisation
      // As there are no people, can always add the name.
      //this.addPersonNameTarget.value = this.filterTextTarget.value.trim();
      if(nameText.trim().length != 0){
        // addPersonButton.classList.remove("hidden");
        addPersonButton.disabled = false;
      }
    }
    console.log("addPersonButton", addPersonButton);
  };

  //---------------------------------------------------------------
  // Filters all the people by name 
  // EXCEPT will not hide a selected person!
  // input: the text field
  // operation: 1. shows or hides the table row dependant on
  //               if the text field text can be found in the name.
  //            2. Can only add a person if a person's name does 
  //               not already exist.
  //               Sets canAddName = FALSE if anyone has a name 
  //               exactly matches the search script. 
  //               Otherwise, set to TRUE.
  //                 
  doFilter(){
    console.log("filter function requested", this.element)
    
    // who is the current selected person (id)
    var selectedPersonId = this.peopleTarget.getAttribute("data_person_selected");
    if(selectedPersonId == ""){
      selectedPersonId = 0;   // a value never exists in reality - activeRecord id value
    }
    // initialise canAddName - default to prevent adding a person
    let canAddName = true;
    // get the text to use as the filter
    const filterText = this.filterTextTarget.value.trim().toLowerCase()
    // get the button that need to be displayed or hidden - addPersonName
    //const addPersonButton = this.addPersonButtonTarget
    const addPersonButton = this.addPersonPanelButtonTarget;
    // ensure there are people on the page
    if(this.hasPersonTarget) {
      // As there are people, set canAddName to allow adding another
      // person unless we find an exact match.
      canAddName = true
      // get an array of all the person nodes containing each person
      const allPeople  =  this.personTargets;  
      // step through each person, hiding or showing person node based on a filter match
      [...allPeople].forEach(node=>{
        if (node.getAttribute('data_name').toLowerCase().includes(filterText)) {
          node.classList.remove("hidden");
        } else {
          // don't hide a selected person
          if(node.getAttribute('data_person_id') != selectedPersonId){
            node.classList.add("hidden");
          }
        }
        // Check if this person is an exact match
         if(canAddName){
          if(node.getAttribute('data_name').toLowerCase().trim().normalize() === filterText.normalize()){
            canAddName = false
          }
        }
      });
      // Claire's comment - allow this button to always show.
      canAddName = true;
      if(canAddName){
        this.addPersonNameTarget.value = this.filterTextTarget.value.trim();
        //addPersonButton.hidden = false;
        addPersonButton.classList.remove("hidden");

      }else{
        this.addPersonNameTarget.value = "";
        //addPersonButton.hidden = true;
        addPersonButton.classList.add("hidden");
      }
      if(selectedPersonId != 0){
        var selectedPersonElement = document.getElementById("person_" + selectedPersonId);
        selectedPersonElement.scrollIntoView();
      }

    }else{     // no names on the page - only happens on app/db initialisation
      // As there are no people, can always add the name.
      this.addPersonNameTarget.value = this.filterTextTarget.value.trim();
      if(this.filterTextTarget.value.trim().length != 0){
        addPersonButton.classList.remove("hidden");
      }
    }
    console.log("addPersonButton", addPersonButton);
  };

  //-------------------------------------------------------------------------------------------------------------------------------
  // This sorting code is taken from
  //   https://stackoverflow.com/questions/69809178/what-is-the-most-efficient-way-to-sort-dom-elements-based-on-values-in-an-array
  //-------------------------------------------------------------------------------------------------------------------------------
  // Sorts the people (table rows) by name order
  doSort(){
    console.log("sort function called", this.element)
    if(this.hasPersonTarget) {
      const allPeople  =  this.personTargets;
      const peopleContainer = this.peopleTarget;
      // create hash: node id => node (person element)
      const peopleElements = {};
      [...allPeople].forEach(node=>{
        peopleElements[node.id] = node;
      });      
      // get all the hash keys, then sort them by person
      // name which is held in the tr data attribute
      const ids = Object.keys(peopleElements)
      ids.sort((a,b) => {
        return peopleElements[a].getAttribute('data_name').localeCompare(peopleElements[b].getAttribute('data_name'))
      })
      // repopulate the people container with everyone in correct order
      // nb when appending, the original is removed from the people container.
      ids.forEach(id=>{
        const node = peopleElements[id];
        peopleContainer.append(node.parentNode);
      });
    };
  }

  //***************************************************************************************************************************** */
  //-------------------------------------------------------------------------------------------------------------------------------
  // Managing the drink selection buttons
  // Copied from old version
  //-------------------------------------------------------------------------------------------------------------------------------

  // For drink buttons, deselect all drink buttons.
  // and hide the options
  initialiseButtons(){
    console.log("initialiseButtons called.");
    // build an array of all buttons
    const allButtons  =  this.buttonTargets;
    // initialise the display of the buttons.
    [...allButtons].forEach(node=>{
      [...this.button_selected].forEach(myClass=>{
        node.classList.remove(myClass);
      });
      [...this.button_deselected].forEach(myClass=>{
        node.classList.add(myClass);
      });
      // hide the options buttons.  
      if(node.getAttribute("data-category") != "Drink"){
        node.parentNode.classList.add("hidden");
        node.classList.add("hidden");
      }
    });
  }

  // clear flash notice
  clearFlash(){
    //clear the flash notice html div field
    var requestNoticeFields = this.requestNoticeTargets; 
    [...requestNoticeFields].forEach(rf=>{
      rf.innerText = "";
    });
    requestNoticeFields = this.requestNoticePersonTargets; 
    [...requestNoticeFields].forEach(rf=>{
      rf.innerText = "";
    });
  }

  // Called when a "drink" button is selected.
  selectDrinkButton(){
    console.log("selectDrinkButton called.");
    //clear the flash notice html div field
    this.clearFlash();
    // Now determine what button was pressed.
    const buttonNode = event.currentTarget;
    // is it selected?
    var drinkCurrent  = buttonNode.classList.contains("selected");
    var drinkCategory = ("Drink" == buttonNode.getAttribute("data-category")); 
    // reset all drink buttons to not show
    this.initialiseButtons();

    if(drinkCurrent && drinkCategory){
      this.makeDrinkDescription();
      return;
    }

    // show that this drink button is selected
    [...this.button_deselected].forEach(myClass=>{
      buttonNode.classList.remove(myClass);
    });
    [...this.button_selected].forEach(myClass=>{
      buttonNode.classList.add(myClass);
    });
    // what else should be displayed.
    // - just let it go back to default font colour
    // Check if this is the special button - "other"
    // It just lets the user type in their own text for the order.
    // data-enable="otherInput"
    if(buttonNode.getAttribute("data-enable") == "otherInput"){
      // simply show the text input field  in the options - when time.
      //place into the field ready for ordering drinks - nothing yet.
      this.requestDrinkTarget.value = "";     //description.trim()
      var otherOption = document.getElementById("otherInput"); 
      otherOption.classList.remove("hidden");
      otherOption.parentNode.classList.remove("hidden");
      otherOption.classList.add("selected");
      this.makeDrinkDescription();
      // scroll back to the top of the buttons so that the options are visible.
      //const box = this.selectDrinksTitleTarget;
      const eleOtherButton = document.getElementById("otherInput");
      eleOtherButton.scrollIntoView({block:"start"});
    }else{
      // If any other drink button is displayed, then determine what
      // options need to be displayed with it.
      if(buttonNode.getAttribute("data-category") == "Drink"){
        // now determine what option buttons need to be enabled
        const enableButtons = buttonNode.getAttribute("data-enable").split(", ");
        [...enableButtons].forEach(button=>{
          document.getElementById(button).parentNode.classList.remove("hidden");
          document.getElementById(button).classList.remove("hidden");
        });
      }  
      this.makeDrinkDescription();
      // scroll back to the top of the buttons so that the options are visible.
      //const box = this.selectDrinksTitleTarget;
      this.selectDrinksTitleTarget.scrollIntoView({block:"end"});
    }
  }  

  // Called when a "drink option" button is selected.
  selectOptionButton(){
    console.log("selectOptionButton called.");
    // Now determine what button was pressed.
    const buttonNode = event.currentTarget;
    // check if this button is already selected?
    // if so, remember so you can deselect it later.
    var buttonSelected = false;
    if(buttonNode.classList.contains("selected")){
      buttonSelected = true;
    }
    // what actions should be taken.
    // start by getting the option group this button belongs to
    const optionGroup = buttonNode.parentNode;
    const buttonGroup = optionGroup.getElementsByTagName("button");
    // start by deselecting all button in this group
    [...buttonGroup].forEach(button=>{
      // show each as deselected
      [...this.button_deselected].forEach(myClass=>{
        button.classList.add(myClass);
      });
      [...this.button_selected].forEach(myClass=>{
        button.classList.remove(myClass);
      });
    })   
    // select this button unless it was already selected,
    // then deselect it; else select it.
    // if previously selected, then just toggling, so leave as 
    // deselected - already deselected above
    if(buttonSelected != true){
      // Need to select this button (freshly selected
      // or different selection in this group)
      [...this.button_deselected].forEach(myClass=>{
        buttonNode.classList.remove(myClass);
      });
      [...this.button_selected].forEach(myClass=>{
        buttonNode.classList.add(myClass);
      });
    }
    this.makeDrinkDescription();
  }

  // make the full drink description to be placed
  // in the drink ordering field.
  makeDrinkDescription(){
    console.log("makeDrinkDescription called");
    var description = "";
    // build an array of all buttons
    const allButtons  =  this.buttonTargets;
    // If other drink is selected, then just pick up that description.
    const iEle = document.getElementById("other");
    if(iEle.classList.contains("selected")){
      description = document.getElementById("otherInput").value;
      this.setRequestDrink(description.trim());
      return;
    }
    // concatenate selected button names
    [...allButtons].forEach(node=>{
      if(node.classList.contains("selected")){
        description = description + node.innerText + " ";
      }
    });
    //place into the field ready for ordering drinks
    this.setRequestDrink(description.trim());
  }

  setRequestDrink(desc){
    this.requestDrinkTarget.value = desc;
    if(desc.length == 0){
      // this.submitOrderTarget.classList.add("hidden");
      this.submitOrderTarget.disabled = true;
    }else{
      // this.submitOrderTarget.classList.remove("hidden");
      this.submitOrderTarget.disabled = false;
    } 
  }  

  addTextOther(){
    console.log("actionInput called");
    this.makeDrinkDescription();
  }
}
