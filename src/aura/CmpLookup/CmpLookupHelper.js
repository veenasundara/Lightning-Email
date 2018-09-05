/**
 Copyright 2017 OpFocus, Inc

 Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation
 files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy,
 modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the
 Software is furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR
 IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
({

    /**
     * server call to describe field and set sObject Name
     * chains hlpGetRecords and initField
     * @param  {[aura]} component [description]
     * @return {[type]}           [void]
     */
    hlpGetField : function(component){
        try{
            var action = component.get('c.getReference');
            var field = component.get('v.sObjectField');
            if(!field){
                this.hlpGetRecords(component,true);
                this.initField(component);
                return;
            }
            action.setParams({
                                 'field' : field
                             });

            action.setCallback(this, function(response){
                if(!this.handleResponse(component, response)){
                    return;
                }
                if($A.util.isEmpty(component.get('v.sObjectName'))){
                    component.set('v.sObjectName',response.getReturnValue());
                }
                this.hlpGetRecords(component,true);
                this.initField(component);
            })
            $A.enqueueAction(action);
        }
        catch(e){
            this.showError(component,'hlpGetFieldHelp - ' + e.message)
        }
    },
    /**
     * server call to describe field and set help text
     * [hlpGetFieldHelp description]
     * @param  {[type]} component [description]
     * @return {[type]}           [description]
     */
    hlpGetFieldHelp : function(component){
        try{
            var action = component.get('c.getHelpText');
            var field = component.get('v.sObjectField');
            if(!field){
                return;
            }
            action.setParams({
                                 'field' : field
                             });

            action.setCallback(this, function(response){
                if(!this.handleResponse(component, response)){
                    return;
                }
                if($A.util.isEmpty(component.get('v.helpText'))){
                    component.set('v.helpText',response.getReturnValue());
                }

            })
            $A.enqueueAction(action);
        }
        catch(e){
            this.showError(component,'hlpGetFieldHelp - ' + e.message)
        }
    },

    // Description		: fetched records to display in pick list
    // @param isInit	: Is this call from the init method ? (If so, the drop down will NOT be displayed)
    hlpGetRecords : function(component, isInit) {

        try{
            var action = component.get("c.getRecords");
            var sObjectName = component.get("v.sObjectName");
            var displayedFieldName = component.get("v.displayedFieldName");
            var valueFieldName = component.get("v.valueFieldName");
            var otherFields = component.get("v.otherFields");
            var whereClause = component.get("v.whereClause");
            var searchWhereClause = component.get("v.searchWhereClause");
            var selectedValue = component.get("v.selectedValue");
            var selectedName = component.get("v.selectedName");

            // console.log('whereClause = ' + whereClause);
            // console.log('searchWhereClause = ' + searchWhereClause);
            // console.log('selectedValue = ' + selectedValue);
            // console.log('selectedName = ' + selectedName);

            if($A.util.isEmpty(sObjectName) || $A.util.isEmpty(displayedFieldName) ||
                $A.util.isEmpty(valueFieldName))
            {
                return;
            }



            if($A.util.isEmpty(searchWhereClause))
            {

                if (!$A.util.isEmpty(selectedValue))
                {
                    searchWhereClause = valueFieldName + " = '" + selectedValue + "'";
                }
                else if (!$A.util.isEmpty(selectedName))
                {
                    searchWhereClause = displayedFieldName + " LIKE '%" + selectedName + "%'";
                }
            }

            if(searchWhereClause && searchWhereClause != '')
            {
                // whereClause = whereClause ? '(' + whereClause + ') AND (' + searchWhereClause + ')': searchWhereClause;
                whereClause = whereClause ?  whereClause + ' AND ' + searchWhereClause : searchWhereClause;
            }
            // console.log('whereClause = ' + whereClause);
            //
            // if(searchWhereClause && searchWhereClause != ''){
            //     whereClause = whereClause ? '(' + whereClause + ') AND (' + searchWhereClause + ')': searchWhereClause;
            // }
            action.setParams({ "sObjectName" : sObjectName ,
                                 "valueFieldName" : valueFieldName,
                                 "otherFields" : otherFields,
                                 "displayedFieldName" : displayedFieldName,
                                 "whereClause" : whereClause});

            action.setCallback(this, function(response){
                if(!this.handleResponse(component, response)){
                    return;
                }
                var resp = response.getReturnValue();
                component.set("v.matchedListDisplay", resp.lstDisplay);
                component.set("v.matchedListValue", resp.lstValue);
                component.set("v.matchedListRecords", resp.lstRecords);

                this.hlpValueChanged(component); // set the selected name and record if the selectedValue has a value in it

                var selectedValue = component.get('v.selectedValue');
                if(!resp.lstValue.includes(selectedValue))
                {
                    this.clearField(component, false);
                }
                if(resp.lstDisplay && resp.lstDisplay.length > 0 && !isInit){
                    this.showDropDown(component,false);
                }

            });
            $A.enqueueAction(action);
        }
        catch(e){
            this.showError(component, 'hlpGetRecords - ' + e.message);
        }

    },

    /**
     * value has been changed, set the name
     * @param component
     */
    hlpValueChanged : function(component) {
        try{
            var selectedValue = component.get("v.selectedValue");
            var matchedListValue = component.get("v.matchedListValue");

            if($A.util.isEmpty(selectedValue) || $A.util.isEmpty(matchedListValue))
            {
                component.set("v.selectedName", '');
                component.set("v.selectedRecord", null);
                return;
            }

            var matchedListDisplay = component.get("v.matchedListDisplay");
            var matchedListRecords = component.get("v.matchedListRecords");

            var matchedIndex = matchedListValue.indexOf(selectedValue);

            if($A.util.isEmpty(matchedIndex) || matchedIndex === -1)
            {
                component.set("v.selectedName", '');
                component.set("v.selectedRecord", null);
            }
            else
            {
                component.set("v.selectedName", matchedListDisplay[matchedIndex]);
                component.set("v.selectedRecord", matchedListRecords[matchedIndex]);
            }
        }
        catch(e){
            this.showError(component, 'hlpValueChanged - ' + e.message);
        }
    },

    /**
     * server call to query typeahead
     * @param  {[aura]} component []
     */
    hlpPerformLookup : function(component) {
        try{
            // we need to reset selected value and and name becaues user is typing again, but since
            // selectedName is tied ot the value of teh input, we should save what the user has typed and restore
            // it after we change selectedName
            var searchString = component.find("myinput").get("v.value");
            this.clearField(component,false);
            component.find("myinput").set("v.value", searchString);
            if(searchString.length < 2){
                component.set("v.searchWhereClause", '');
                component.set("v.selectedValue", '');
                var selectedId;
                component.set("v.selectedId", selectedId);
            }
            else{
                var searchWhereClause = component.get("v.displayedFieldName") + " LIKE '%" +
                    searchString + "%'";
                component.set("v.searchWhereClause", searchWhereClause);
            }

            this.hlpGetRecords(component, false);
        }
        catch(e){
            this.showError(component, 'hlpPerformLookup - ' + e.message);
        }
    },

    /**
     * handles suggestion selection
     * @param  {[aura]} component []
     * @param  {[Int]} index     [Index of the suggestion list that was clicked]
     */
    hlpSelectItem : function(component, index){
        try{
            var matchedListDisplay = component.get("v.matchedListDisplay");
            var matchedListValue = component.get("v.matchedListValue");
            var matchedListRecords = component.get("v.matchedListRecords");
            component.set("v.selectedRecord", matchedListRecords[index]);
            component.set("v.selectedValue", matchedListValue[index]);
            if(matchedListDisplay[index].toLowerCase() != 'no records found!'){
                component.set("v.selectedName", matchedListDisplay[index]);
                this.populateField(component,matchedListDisplay[index],matchedListValue[index]);
                this.fireUpdate(component, matchedListRecords[index],matchedListValue[index],matchedListDisplay[index]);
            }

            this.hideDropDown(component);
        }
        catch(e){
            this.showError(component, 'hlpSelectItem - ' + e.message);
        }
    },

    /**
     * fire EvtChangeLookup app event
     * @param  {[String]} name       [component id]
     * @param  {[Object]} record     [SObject record]
     * @param  {[String]} recordId   [Record Id]
     * @param  {[String]} recordName [Record Label]
     */
    fireUpdate : function(component, record, recordId, recordName){
        //console.log('EVENT: EvtChangeLookup');
        var ev = component.getEvent('EvtCmpLookupChanged');
        ev.setParams({
                         'name' : component.get('v.name'),
                         'record' : record,
                         'recordId' : recordId,
                         'recordName' : recordName
                     });
        ev.fire();
    },

    /**
     * fire EvtClearLookup app event
     * @param  {[String]} name  [component id]
     */
    fireClear : function(component){
        //console.log('EVENT: EvtClearLookup');
        var ev = component.getEvent('EvtCmpLookupCleared');
        ev.setParams({
                         'name' : component.get('v.name')
                     });
        ev.fire();
    },

    /**
     * fire EvtInitLookup app event
     * @param  {[String]} name  [component id]
     */
    fireInit : function(component){
        //console.log('EVENT: EvtInitLookup');
        var ev = component.getEvent('EvtCmpLookupInitDone');
        ev.setParams({
                         'name' : component.get('v.name')
                     });
        ev.fire();
    },

    /**
     * populates lookup field based on record id given at component init
     * @param  {[aura]} component   []
     * @param  {[String]} name      [Record label]
     * @param  {[String]} val       [Record Id]
     */
    populateField : function(component,name){
        try{
            var f = component.find('myInput')
            if(!component.get('v.pills')){
                component.find("myinput").set("v.value", name);
                $A.util.removeClass(component.find('removebtn'),'hide');
            }
            else{
                $A.util.addClass(f,'hide');
                this.toggleIcons(component,false);
                var l = name;
                var a = component.getReference('c.clearField');
                var i = component.get('v.svg')
                $A.createComponent('c:CmpPills',
                                   {
                                       'label' : l ,
                                       'onremove' : a,
                                       'iconName': i
                                   },
                                   function(nc){
                                       component.find('pillsdiv').set('v.body',nc);
                                   }
                );
            }
        }
        catch(e){
            this.showError(component, 'populateField - ' + e.message);
        }
    },

    /**
     * gets the data needed for lookup based on record id given at component init
     * @param  {[aura]} component []
     */
    initField: function(component){
        var action = component.get('c.getFieldValue');
        var label = component.get('v.selectedName');
        var val = component.get('v.selectedValue');
        var obj = component.get('v.sObjectName');
        if(label && val){
            this.populateField(component,label);
            this.fireInit(component);
        }
        else if (val && obj) {
            action.setParams({
                                 'obj' : obj,
                                 'objId' : val,
                                 'label' : component.get('v.displayedFieldName')
                             });
            action.setCallback(this,function(response){
                if(!this.handleResponse(component, response)){
                    return;
                }
                var res = response.getReturnValue();
                this.populateField(component,res.lstDisplay[0]);
                this.fireInit(component);
            })

            $A.enqueueAction(action);
        }
    },

    /**
     * toggle display of dropdown
     * @param  {[type]} component [description]
     * @return {[type]}           [description]
     */
    hlpToggleMenu : function(component){
        this.showDropDown(component,true);
    },

    /**
     * parses and handles server response
     * @param  {[aura]} component    []
     * @param  {[Object]} response   [server response]
     * @return {[Boolean]}           [Pass/Fail]
     */
    handleResponse : function(component, response) {
        try{
            var state = response.getState();
            if (state !== "SUCCESS") {
                var unknownError = true;
                if(state === 'ERROR'){
                    var errors = response.getError();
                    if (errors) {
                        if (errors[0] && errors[0].message) {
                            unknownError = false;
                            this.showError(component, errors[0].message);
                        }
                    }
                }
                if(unknownError){
                    this.showError(component, 'Unknown error from Apex class');
                }
                return false;
            }
            return true;
        }
        catch(e){
            this.showError(component, e.message);
            return false;
        }
    },

    /**
     * shows/toggles dropdown for suggestions
     * @param  {[aura]} component []
     * @param  {[Bool]} toggle    [is toggle or show]
     */
    showDropDown : function(component,toggle){
        try{
            var dropDown = component.find("dropDown");
            if(toggle){
                $A.util.toggleClass(dropDown, "slds-is-open");
            }
            else{
                $A.util.addClass(dropDown, "slds-is-open");
            }
            this.toggleIcons(component,true);
        }
        catch(e){
            this.showError(component, 'showDropDown - ' + e.message);
        }
    },

    /**
     * hides dropdown box
     * @param  {[aura]} component []
     */
    hideDropDown : function(component){
        try{
            var dropDown = component.find("dropDown");
            $A.util.removeClass(dropDown, "slds-is-open");
        }
        catch(e){
            this.showError(component, 'hideDropDown - ' + e.message);
        }
    },

    /**
     * shows toast error message
     * @param  {[aura]} component   []
     * @param  {[String]} message   [Error message]
     */
    showError : function(component, message){
        try{
            var toastEvent = $A.get("e.force:showToast");
            toastEvent.setParams({
                                     "type": "Error",
                                     "mode": "sticky",
                                     "message": message
                                 });
            toastEvent.fire();
        }
        catch(e){
            this.showError(component, e.message);
        }
    },

    /**
     * clears lookup field
     * @param  {[aura]} component []
     * @param  {[Bool]} fireEvent [Fire or not fire EvtClearLookup event]
     */
    clearField : function(component, fireEvent){
        try{
            component.set('v.selectedName',null);
            component.set('v.selectedValue',null);
            component.find('pillsdiv').set('v.body',null);
            $A.util.removeClass(component.find("myInput"),'hide');
            if(fireEvent)
                this.fireClear(component);
        }
        catch(e){
            this.showError(component, 'clearField - ' + e.message);
        }
    },

    /**
     * Show/Hide icons (Search, downarrow)
     * @param  {[aura]} component []
     * @param  {[Bool]} show      [Show or Hide]
     */
    toggleIcons : function(component,show){
        if(show){
            $A.util.removeClass(component.find('dropdownicon'),'hide');
            $A.util.removeClass(component.find('search_icon'),'hide');
        }
        else{
            $A.util.addClass(component.find('dropdownicon'),'hide');
            $A.util.addClass(component.find('search_icon'),'hide');
        }
    }
})