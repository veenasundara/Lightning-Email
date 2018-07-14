({
    doInit: function (component, event, helper)
    {
        helper.hlpDoInit(component);
    },

    selectAdditonalTo: function (component, event, helper)
    {
        helper.hlpSelectAdditionalTo(component);
        component.find('contactModal').openModal();
    },

    selectCC: function (component, event, helper)
    {
        helper.hlpSelectCC(component);
        component.find('contactModal').openModal();
    },

    selectBCC: function (component, event, helper)
    {
        helper.hlpSelectBCC(component);
        component.find('contactModal').openModal();
    },

    cancelContact: function (component, event, helper)
    {
        component.find('contactModal').closeModal();
    },

    saveContact: function (component, event, helper)
    {
        helper.hlpSaveContact(component);
    },

    selectTemplate: function (component, event, helper)
    {
        component.find('templateModal').openModal();
    },

    cancelTemplate: function (component, event, helper)
    {
        component.find('templateModal').closeModal();
    },

    saveTemplate: function (component, event, helper)
    {
        helper.hlpSaveTemplate(component);
        component.find('templateModal').closeModal();
    },

    folderChanged: function (component, event, helper)
    {
        helper.hlpFolderChanged(component);
    },

    handleUploadFinished: function (component, event, helper) {
        // Get the list of uploaded files
        var lstUploadFiles = event.getParam("files");
        helper.hlpUploadFinished(component, lstUploadFiles);
    },

    deleteFile: function (component, event, helper)
    {
        var documentId = event.getSource().get("v.name");
        helper.hlpDeleteFile(component, documentId);
    },

    cancel: function (component, event, helper)
    {
        helper.hlpCancel(component);
    },

    send: function (component, event, helper)
    {
        helper.hlpSend(component);
    },

})