({
    hlpDoInit: function (component)
    {
        try
        {
            this.showSpinner(component);
            var action = component.get('c.ctrlGetLists');

            action.setCallback(this, function (response)
            {
                if (!this.handleResponse(component, response))
                {
                    this.hideSpinner(component);
                    return;
                }

                var resp = response.getReturnValue();
                //console.log('resp = ' + JSON.stringify(resp));
                component.set("v.lstRelatedTo", resp.lstRelatedTo);
                component.set("v.lstFrom", resp.lstFrom);
                component.set("v.fromId", resp.lstFrom[0].value);
                component.set("v.lstContact", resp.lstContact);
                component.set("v.mapEmailByContact", resp.mapEmailByContact);
                component.set("v.lstFolder", resp.lstFolder);
                component.set("v.mapTemplatesByFolder", resp.mapTemplatesByFolder);
                this.hlpProcessParameters(component);

            });

            $A.enqueueAction(action);
        }
        catch (e)
        {
            this.showError(component,'hlpDoInit - ' + e.message);
        }
    },

    hlpProcessParameters: function (component)
    {
        try
        {
            // first reset all fields
            component.set("v.subject", '');
            component.set("v.template", {});
            component.set("v.templateFolder", '');
            component.set("v.format", null);
            component.set("v.body", '');
            component.set("v.from", null);
            component.set("v.fromId", null);
            component.set("v.to", null);
            component.find("toLookup").clear();
            component.set("v.relatedTo", '--Select--');
            component.set("v.relatedToRecord", null);
            component.find("relatedToRecordLookup").clear();
            component.set("v.additionalTo", '');
            component.set("v.cc", '');
            component.set("v.bcc", '');
            component.find("useSignature").set("v.checked", false);
            component.set("v.lstAttachFiles", []);



            var pageReference = component.get("v.pageReference");
            //console.log('pageReference = ' + JSON.stringify(pageReference));
            var params = Object.keys(pageReference.state);
            //console.log('params = ' + JSON.stringify(params));
            for(var i = 0; i < params.length; i++)
            {
                switch (params[i])
                {
                    case 'templateId':
                        var templateId = pageReference.state[params[i]];
                        this.hlpGetTemplate(component, templateId);
                        break;
                    case 'format':
                        component.set("v.format", pageReference.state[params[i]]);
                        break;
                    case 'from':
                        component.set("v.from", pageReference.state[params[i]]);
                        break;
                    case 'to':
                        component.set("v.to", pageReference.state[params[i]]);
                        break;
                    case 'relatedTo':
                        component.set("v.relatedTo", pageReference.state[params[i]]);
                        break;
                    case 'relatedToRecord':
                        component.set("v.relatedToRecord", pageReference.state[params[i]]);
                        break;
                    case 'additionalTo':
                        component.set("v.additionalTo", pageReference.state[params[i]]);
                        break;
                    case 'cc':
                        component.set("v.cc", pageReference.state[params[i]]);
                        break;
                    case 'bcc':
                        component.set("v.bcc", pageReference.state[params[i]]);
                        break;
                    case 'useSignature':
                        component.find("useSignature").set("v.checked", pageReference.state[params[i]]);
                        break;
                    case 'subject':
                        component.set("v.subject", pageReference.state[params[i]]);
                        break;
                    case 'body':
                        component.set("v.body", pageReference.state[params[i]]);
                        break;
                    case 'lstFiles':
                        var lstFilesStr = pageReference.state[params[i]];
                        var lstFiles = JSON.parse(lstFilesStr);
                        component.set("v.lstAttachFiles", lstFiles);
                        break;
                }
            }
            component.find("toLookup").populate();

            this.hideSpinner(component);
        }
        catch (e)
        {
            this.showError(component,'hlpSelectAdditionalTo - ' + e.message);
        }
    },

    hlpRelatedToChanged: function (component)
    {
        try
        {
            component.find("relatedToRecordLookup").clear();
            var relatedTo = component.get("v.relatedTo");
            if(!$A.util.isEmpty(relatedTo) && relatedTo != '--Select--')
            {
                this.showSpinner(component);
                var action = component.get('c.ctrlGetNameField');
                action.setParams({"objName" : relatedTo});

                action.setCallback(this, function (response)
                {
                    if (!this.handleResponse(component, response))
                    {
                        this.hideSpinner(component);
                        return;
                    }

                    var resp = response.getReturnValue();
                    component.set("v.relatedToDisplayField", resp);
                    component.find("relatedToRecordLookup").populate();
                    this.hideSpinner(component);
                });

                $A.enqueueAction(action);
            }
        }
        catch (e)
        {
            this.showError(component,'hlpRelatedToChanged - ' + e.message);
        }
    },

    hlpSelectAdditionalTo: function (component)
    {
        try
        {
            var lstSelectedAdditionalTo = component.get("v.lstSelectedAdditionalTo");
            component.set("v.lstSelectedToShow", lstSelectedAdditionalTo);
            component.set("v.whichList", 'AdditionalTo');
            component.find("selectContactModal").open();
        }
        catch (e)
        {
            this.showError(component,'hlpSelectAdditionalTo - ' + e.message);
        }
    },

    hlpSelectCC: function (component)
    {
        try
        {
            var lstSelectedCC = component.get("v.lstSelectedCC");
            component.set("v.lstSelectedToShow", lstSelectedCC);
            component.set("v.whichList", 'CC');
            component.find("selectContactModal").open();
        }
        catch (e)
        {
            this.showError(component,'hlpSelectAdditionalTo - ' + e.message);
        }
    },

    hlpSelectBCC: function (component)
    {
        try
        {
            var lstSelectedBCC = component.get("v.lstSelectedBCC");
            component.set("v.lstSelectedToShow", lstSelectedBCC);
            component.set("v.whichList", 'BCC');
            component.find("selectContactModal").open();
        }
        catch (e)
        {
            this.showError(component,'hlpSelectAdditionalTo - ' + e.message);
        }
    },

    hlpSaveContact: function (component)
    {
        try
        {
            this.showSpinner(component);
            var whichList = component.get("v.whichList");
            switch(whichList)
            {
                case 'AdditionalTo':
                    // update the text field
                    var lstSelectedAdditionalTo = component.get("v.lstSelectedAdditionalTo");
                    var additionalTo = component.get("v.additionalTo");
                    additionalTo = this.hlpUpdateSelection(component, lstSelectedAdditionalTo, additionalTo);
                    component.set("v.additionalTo", additionalTo);

                    // now, update the selected list
                    var lstSelectedToShow = component.get("v.lstSelectedToShow");
                    component.set("v.lstSelectedAdditionalTo", lstSelectedToShow);
                    component.set("v.lstSelectedToShow", []);

                    break;

                case 'CC':
                    // update the text field
                    var lstSelectedCC = component.get("v.lstSelectedCC");
                    var cc = component.get("v.cc");
                    cc = this.hlpUpdateSelection(component, lstSelectedCC, cc);
                    component.set("v.cc", cc);

                    // now, update the selected list
                    var lstSelectedToShow = component.get("v.lstSelectedToShow");
                    component.set("v.lstSelectedCC", lstSelectedToShow);
                    component.set("v.lstSelectedToShow", []);
                    break;

                case 'BCC':
                    // update the text field
                    var lstSelectedBCC = component.get("v.lstSelectedBCC");
                    var bcc = component.get("v.bcc");
                    bcc = this.hlpUpdateSelection(component, lstSelectedBCC, bcc);
                    component.set("v.bcc", bcc);

                    // now, update the selected list
                    var lstSelectedToShow = component.get("v.lstSelectedToShow");
                    component.set("v.lstSelectedBCC", lstSelectedToShow);
                    component.set("v.lstSelectedToShow", []);
                    break;

            }

            //component.find("contactModal").closeModal();
            this.hideSpinner(component);
        }
        catch (e)
        {
            this.showError(component,'hlpSave - ' + e.message);
        }
    },

    hlpUpdateSelection: function (component, lstSelectedId, textValue)
    {
        try
        {
            var mapEmailByContact = component.get("v.mapEmailByContact");

            if($A.util.isEmpty(textValue))
            {
                textValue = '';
            }
            if(!$A.util.isEmpty(lstSelectedId))
            {
                var lstOldSelect = [];
                for(var i = 0; i < lstSelectedId.length; i++)
                {
                    if(!$A.util.isEmpty(mapEmailByContact[lstSelectedId[i]]))
                    {
                        lstOldSelect.push(mapEmailByContact[lstSelectedId[i]]);
                    }
                }

                var splits = textValue.split(';');
                textValue = '';
                for(var i=0; i < splits.length; i++)
                {
                    if(lstOldSelect.indexOf(splits[i]) === -1)
                    {
                        textValue += textValue == '' ? splits[i] : ';' + splits[i];
                    }
                }
            }

            // now, get the new selection
            var lstSelectedToShow = component.get("v.lstSelectedToShow");

            // add newly selected items to the text field
            if(!$A.util.isEmpty(lstSelectedToShow))
            {
                for (var i = 0; i < lstSelectedToShow.length; i++)
                {
                    var email = mapEmailByContact[lstSelectedToShow[i]];
                    if(!$A.util.isEmpty(email))
                    {
                        textValue += textValue == '' ? email : ';' + email;
                    }
                }
            }

            return textValue;
        }
        catch (e)
        {
            this.showError(component,'hlpUpdateSelection - ' + e.message);
        }
    },

    hlpFolderChanged: function (component)
    {
        try
        {
            var folder = component.find("folder").get("v.value");
            var mapTemplatesByFolder = component.get("v.mapTemplatesByFolder");
            var lstTemplate = mapTemplatesByFolder[folder];
            component.set("v.lstTemplate", lstTemplate);
        }
        catch (e)
        {
            this.showError(component,'hlpFolderChanged - ' + e.message);
        }
    },

    hlpSaveTemplate: function (component)
    {
        try
        {
            var folder = component.find("folder").get("v.value");
            if(folder == '--Select--')
            {
                component.set("v.templateFolder", null);
                component.set("v.template", null);
                component.set("v.body", null);
                component.set("v.subject", null);
                return;
            }
            component.set("v.templateFolder", folder);
            var templateId = component.find("template").get("v.value");
            if(templateId == '--Select--')
            {
                component.set("v.template", null);
                component.set("v.body", null);
                component.set("v.subject", null);
                return;
            }

            this.hlpGetTemplate(component, templateId);
        }
        catch (e)
        {
            this.showError(component,'hlpFolderChanged - ' + e.message);
        }
    },

    hlpGetTemplate: function (component, templateId)
    {
        try
        {
            this.showSpinner(component);

            // now, get the body and subject for the template
            var action = component.get('c.ctrlGetEmailTemplate');
            action.setParams({
                                 'templateId' : templateId
                             });

            action.setCallback(this, function (response)
            {
                if (!this.handleResponse(component, response))
                {
                    this.hideSpinner(component);
                    return;
                }

                var resp = response.getReturnValue();
                //console.log('resp = ' + JSON.stringify(resp));
                component.set("v.subject", resp.et.Subject);
                component.set("v.template", resp.et);
                component.set("v.templateFolder", resp.folder);
                component.set("v.format", null);
                if(resp.et.TemplateType == 'text')
                {
                    component.set("v.body", resp.et.Body);
                }
                else if(resp.et.TemplateType == 'visualforce')
                {
                    component.set("v.body", resp.et.Markup);
                }
                else
                {
                    component.set("v.body", resp.et.HtmlValue);
                }
                this.hideSpinner(component);
            });

            $A.enqueueAction(action);
        }
        catch (e)
        {
            this.showError(component,'hlpGetTemplate - ' + e.message);
        }
    },

    hlpUploadFinished: function (component, lstUploadFiles)
    {
        try
        {
            // add new uploaded files to list of all files (the ones uploaded and the ones passed in as url parameters)
            var currentAttachFiles = component.get("v.lstAttachFiles");
            if($A.util.isEmpty(currentAttachFiles))
            {
                currentAttachFiles = [];
            }
            for(var i = 0; i < lstUploadFiles.length; i++)
            {
                currentAttachFiles.push(lstUploadFiles[i]);
            }
            component.set("v.lstAttachFiles", currentAttachFiles);

            // add new uploaded files to list of files uploaded (these are attached to the Contact and need to be deleted at Save/Cancel)
            var currentContactTempFiles = component.get("v.lstContactTempFiles");
            if($A.util.isEmpty(currentContactTempFiles))
            {
                currentContactTempFiles = [];
            }
            for(var i = 0; i < lstUploadFiles.length; i++)
            {
                currentContactTempFiles.push(lstUploadFiles[i]);
            }
            component.set("v.lstContactTempFiles", currentContactTempFiles);

        }
        catch (e)
        {
            this.showError(component,'hlpUploadFinished - ' + e.message);
        }
    },

    hlpDeleteFile: function (component, documentId)
    {
        try
        {
            // remove from lists
            var currentAttachFiles = component.get("v.lstAttachFiles");
            var newAttachFiles = [];
            for(var i = 0; i < currentAttachFiles.length; i++)
            {
                if(currentAttachFiles[i].documentId != documentId)
                {
                    newAttachFiles.push(currentAttachFiles[i]);
                }
            }
            component.set("v.lstAttachFiles", newAttachFiles);

            var currentContactTempFiles = component.get("v.lstContactTempFiles");
            var newContactTempFiles = [];
            for(var i = 0; i < currentContactTempFiles.length; i++)
            {
                if(currentContactTempFiles[i].documentId != documentId)
                {
                    newContactTempFiles.push(currentContactTempFiles[i]);
                }
            }
            component.set("v.lstContactTempFiles", newContactTempFiles);

            this.showSpinner(component);
            // now, delete the Document record
            var lstDocumentId = [];
            lstDocumentId.push(documentId);

            this.hlpDeleteFiles(component, lstDocumentId);
        }
        catch (e)
        {
            this.showError(component,'hlpDeleteFile - ' + e.message);
        }
    },

    hlpDeleteFiles: function (component, lstDocumentId)
    {
        try
        {
            var action = component.get('c.ctrlDeleteDocument');
            action.setParams({
                                 'lstDocumentId' : lstDocumentId
                             });

            action.setCallback(this, function (response)
            {
                if (!this.handleResponse(component, response))
                {
                    this.hideSpinner(component);
                    return;
                }

                var resp = response.getReturnValue();
                this.hideSpinner(component);
            });

            $A.enqueueAction(action);
        }
        catch (e)
        {
            this.showError(component,'hlpDeleteFile - ' + e.message);
        }
    },


    hlpCancel: function (component, documentId)
    {
        try
        {

            var lstContactTempFiles = component.get("v.lstContactTempFiles");
            if($A.util.isEmpty(lstContactTempFiles))
            {
                window.history.back();
            }
            else // delete attachments if they exist
            {
                this.showSpinner(component);
                // now, delete the Document record
                var lstDocumentId = [];
                for(var i = 0; i < lstContactTempFiles.length; i++)
                {
                    lstDocumentId.push(lstContactTempFiles[i].documentId);
                }

                this.hlpDeleteFiles(component, lstDocumentId);
                window.history.back();
            }
        }
        catch (e)
        {
            this.showError(component,'hlpCancel - ' + e.message);
        }
    },

    hlpSend: function (component, documentId)
    {
        try
        {
            if(!this.validate(component))
            {
                this.showError(component,'Please correct errors');
                return;
            }
            this.showSpinner(component);

            var templateId;
            var template = component.get("v.template");
            if(!$A.util.isEmpty(template))
            {
                templateId = template.Id;
            }
            var format = component.find("format").get("v.value");
            var fromId = component.find("from").get("v.value");
            console.log('fromId = ' + fromId);
            console.log('fromId = ' + component.get("v.fromId"));
            var to = component.get("v.to");
            console.log('to = ' + to);
            var relatedTo = component.find("relatedTo").get("v.value");
            var relatedToRecord = component.get("v.relatedToRecord");
            console.log('relatedToRecord = ' + relatedToRecord);
            var additionalTo = component.get("v.additionalTo");
            var cc = component.get("v.cc");
            var bcc = component.get("v.bcc");
            var useSignature = component.find("useSignature").get("v.checked");
            var subject = component.get("v.subject");
            var body = component.get("v.body");
            var lstAttachFiles = component.get("v.lstAttachFiles");

            var action = component.get('c.ctrlSendEmail');
            action.setParams({
                                 'templateId' : templateId,
                                 'format' : format,
                                 'fromId' : fromId,
                                 'to' : to,
                                 'relatedTo' : relatedTo,
                                 'relatedToRecord' : relatedToRecord,
                                 'additionalTo' : additionalTo,
                                 'cc' : cc,
                                 'bcc' : bcc,
                                 'useSignature' : useSignature,
                                 'subject' : subject,
                                 'body' : body,
                                 'lstUploadFileStr' : JSON.stringify(lstAttachFiles),
                             });

            action.setCallback(this, function (response)
            {
                if (!this.handleResponse(component, response))
                {
                    this.hideSpinner(component);
                    return;
                }

                var resp = response.getReturnValue();
                this.showSuccess(component, 'Email Sent Successfully');
                this.hideSpinner(component);
                this.hlpCancel(component);
            });

            $A.enqueueAction(action);
        }
        catch (e)
        {
            this.showError(component,'hlpSend - ' + e.message);
        }
    },

    validate : function(component) {

        var valid = true;

        component.set("v.checkToValidity", false);
        var to = component.get("v.to");
        if($A.util.isEmpty(to))
        {
            component.set("v.checkToValidity", true);
            valid = false;
        }

        // if related To is selected, but record is not, display error
        var relatedTo = component.get("v.relatedTo");
        var relatedToRecord = component.get("v.relatedToRecord");
        component.set("v.relatedToRecordError", false);
        if(!$A.util.isEmpty(relatedTo) && relatedTo != '--Select--' && $A.util.isEmpty(relatedToRecord))
        {
            component.set("v.relatedToRecordError", true);
            valid = false;
        }

        return valid;
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