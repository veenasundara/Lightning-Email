({
    doInit: function (component, event, helper)
    {
        component.set("v.page", 1);
        component.set("v.searchString", '');
        component.set("v.lstContact", []);
        component.set("v.mapEmailByContact", null);
        component.set("v.noMore", false);
        component.set("v.modalClassName", "slds-modal slds-fade-in-open");
        component.set("v.backdropClassName", "slds-backdrop slds-backdrop--open");
        helper.hlpGetContacts(component);
    },
    more: function (component, event, helper)
    {
        helper.hlpGetMoreContacts(component);
    },
    search: function (component, event, helper)
    {
        component.set("v.page", 1);
        component.set("v.lstContact", []);
        component.set("v.mapEmailByContact", null);
        component.set("v.noMore", false);
        helper.hlpGetContacts(component);
    },
    closeModal : function(component, event, helper) {
        helper.hlpCloseModal(component);
    },
    save: function (component, event, helper)
    {
        helper.hlpSave(component);
    },
})