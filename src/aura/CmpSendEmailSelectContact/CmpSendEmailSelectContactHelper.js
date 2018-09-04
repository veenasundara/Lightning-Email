({
    hlpGetContacts: function (component)
    {

        try
        {
            this.showSpinner(component);
            var action = component.get('c.ctrlGetContacts');
            action.setParams({  'searchString' : component.get("v.searchString"),
                                'pageStr' : JSON.stringify(component.get("v.page")),
                                'mapEmailByContact' : component.get("v.mapEmailByContact"),
                                'lstSelectedToShow' : component.get("v.lstSelectedToShow")});

            action.setCallback(this, function(response){
                if(!this.handleResponse(component, response))
                {
                    this.hideSpinner(component);
                    return;
                }
                var resp = response.getReturnValue();
                //console.log('resp = ' + JSON.stringify(resp));
                var lstContact = component.get("v.lstContact");
                if($A.util.isEmpty(lstContact))
                {
                    lstContact = [];
                }

                if($A.util.isEmpty(resp.lstContact) || resp.lstContact.length < 200)
                {
                    component.set("v.noMore", true);
                }
                if(!$A.util.isEmpty(resp.lstContact))
                {
                    for (var i = 0; i < resp.lstContact.length; i++)
                    {
                        lstContact.push(resp.lstContact[i]);
                    }
                    component.set("v.lstContact", lstContact);
                    component.set("v.mapEmailByContact", resp.mapEmailByContact);
                }

                this.hideSpinner(component);
            });
            $A.enqueueAction(action);
        }
        catch (e)
        {
            this.showError(component,'hlpGetContacts - ' + e.message, 'sticky');
        }
    },

    hlpGetMoreContacts : function(component) {
        try
        {
            var page = component.get("v.page");
            page++;
            component.set("v.page", page);

            this.hlpGetContacts(component);
        }
        catch (e)
        {
            this.showError(component,'hlpGetMoreContacts - ' + e.message, 'sticky');
        }
    },

    hlpSave: function(component) {
        try
        {
            component.getEvent('EvtCmpSendEmailContactsSelected').fire();
            this.hlpCloseModal(component);
        }
        catch (e)
        {
            this.showError(component,'hlpSave - ' + e.message, 'sticky');
        }
    },

    hlpCloseModal: function(component) {
        component.set("v.modalClassName", "slds-modal");
        component.set("v.backdropClassName", "slds-backdrop");
    },

    handleResponse : function(component, response) {
        try
        {
            var state = response.getState();
            if (state !== "SUCCESS")
            {
                this.hideSpinner(component);
                var unknownError = true;
                if(state === 'ERROR')
                {
                    var errors = response.getError();
                    if (errors)
                    {
                        if (errors[0] && errors[0].message)
                        {
                            unknownError = false;
                            this.showError(component, 'handleResponse - ' + errors[0].message);
                        }
                    }
                }
                if(unknownError)
                {
                    this.showError(component, 'Unknown error from Apex class');
                }
                return false;
            }
            return true;
        }
        catch(e)
        {
            this.showError(component, e.message);
            return false;
        }
    },

    showError : function(component, message)
    {
        var toastEvent = $A.get("e.force:showToast");
        toastEvent.setParams({
                                 "type": "Error",
                                 //"mode": "sticky",
                                 "message": message
                             });
        toastEvent.fire();
    },

    showSuccess : function(component, message)
    {
        var toastEvent = $A.get("e.force:showToast");
        toastEvent.setParams({
                                 "type": "success",
                                 //"mode": "sticky",
                                 "message": message
                             });
        toastEvent.fire();
    },

    showSpinner : function(component) {
        var spinner = component.find("mySpinner");
        $A.util.removeClass(spinner, "slds-hide");
    },

    hideSpinner : function(component) {
        var spinner = component.find("mySpinner");
        $A.util.addClass(spinner, "slds-hide");
    },
})