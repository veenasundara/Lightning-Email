({
    doInit: function (component, event, helper)
    {
        helper.hlpDoInit(component);
    },
    pageReferenceChanged: function (component, event, helper)
    {
        helper.hlpProcessParameters(component);
    },

    selectAdditonalTo: function (component, event, helper)
    {
        helper.hlpSelectAdditionalTo(component);
    },

    selectCC: function (component, event, helper)
    {
        helper.hlpSelectCC(component);
    },

    selectBCC: function (component, event, helper)
    {
        helper.hlpSelectBCC(component);
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