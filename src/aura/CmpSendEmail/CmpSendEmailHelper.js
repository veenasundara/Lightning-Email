({
    hlpDoInit: function (component)
    {
        try
        {
            component.showSpinner();
            var action = component.get('c.ctrlGetLists');
            action.setParams({
                                 'deviceInfoStr': JSON.stringify(component.get('v.deviceinfo'))
                             });

            action.setCallback(this, function (result)
            {
                if (!component.successfulResponse(result))
                {
                    component.hideSpinner();
                    return;
                }

                var resp = result.getReturnValue();
                //console.log('resp = ' + JSON.stringify(resp));
                component.set("v.lstRelatedTo", resp.lstRelatedTo);
                component.set("v.lstFrom", resp.lstFrom);
                component.set("v.fromId", resp.lstFrom[0].value);
                component.set("v.lstContact", resp.lstContact);
                component.set("v.mapEmailByContact", resp.mapEmailByContact);
                component.set("v.lstFolder", resp.lstFolder);
                component.set("v.mapTemplatesByFolder", resp.mapTemplatesByFolder);
                this.hlpProcessParameters(component);

                component.hideSpinner();
            });

            $A.enqueueAction(action);
        }
        catch (e)
        {
            component.error('hlpMethod - ' + e.message);
        }
    },

    hlpProcessParameters: function (component)
    {
        try
        {
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
                        component.set("v.useSignature", pageReference.state[params[i]]);
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
        }
        catch (e)
        {
            component.error('hlpSelectAdditionalTo - ' + e.message);
        }
    },

    hlpSelectAdditionalTo: function (component)
    {
        try
        {
            var lstSelectedAdditionalTo = component.get("v.lstSelectedAdditionalTo");
            component.set("v.lstSelectedToShow", lstSelectedAdditionalTo);
            component.set("v.whichList", 'AdditionalTo');
            component.find("contactModal").openModal();
        }
        catch (e)
        {
            component.error('hlpSelectAdditionalTo - ' + e.message);
        }
    },

    hlpSelectCC: function (component)
    {
        try
        {
            var lstSelectedCC = component.get("v.lstSelectedCC");
            component.set("v.lstSelectedToShow", lstSelectedCC);
            component.set("v.whichList", 'CC');
            component.find("contactModal").openModal();
        }
        catch (e)
        {
            component.error('hlpSelectAdditionalTo - ' + e.message);
        }
    },

    hlpSelectBCC: function (component)
    {
        try
        {
            var lstSelectedBCC = component.get("v.lstSelectedBCC");
            component.set("v.lstSelectedToShow", lstSelectedBCC);
            component.set("v.whichList", 'BCC');
            component.find("contactModal").openModal();
        }
        catch (e)
        {
            component.error('hlpSelectAdditionalTo - ' + e.message);
        }
    },

    hlpSaveContact: function (component)
    {
        try
        {
            component.showSpinner();
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

            component.find("contactModal").closeModal();
            component.hideSpinner();
        }
        catch (e)
        {
            component.error('hlpSave - ' + e.message);
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
                console.log('splits = ' + JSON.stringify(splits));
                textValue = '';
                for(var i=0; i < splits.length; i++)
                {
                    if(lstOldSelect.indexOf(splits[i]) === -1)
                    {
                        textValue += textValue == '' ? splits[i] : ';' + splits[i];
                    }
                    console.log('textValue = ' + textValue);
                }
                console.log('textValue = ' + textValue);
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
            component.error('hlpUpdateSelection - ' + e.message);
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
            component.error('hlpFolderChanged - ' + e.message);
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
            component.error('hlpFolderChanged - ' + e.message);
        }
    },

    hlpGetTemplate: function (component, templateId)
    {
        try
        {
            component.showSpinner();

            // now, get the body and subject for the template
            var action = component.get('c.ctrlGetEmailTemplate');
            action.setParams({
                                 'deviceInfoStr': JSON.stringify(component.get('v.deviceinfo')),
                                 'templateId' : templateId
                             });

            action.setCallback(this, function (result)
            {
                if (!component.successfulResponse(result))
                {
                    component.hideSpinner();
                    return;
                }

                var resp = result.getReturnValue();
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
                component.hideSpinner();
            });

            $A.enqueueAction(action);
        }
        catch (e)
        {
            component.error('hlpGetTemplate - ' + e.message);
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
            component.error('hlpUploadFinished - ' + e.message);
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

            component.showSpinner();
            // now, delete the Document record
            var lstDocumentId = [];
            lstDocumentId.push(documentId);

            this.hlpDeleteFiles(component, lstDocumentId);
        }
        catch (e)
        {
            component.error('hlpDeleteFile - ' + e.message);
        }
    },

    hlpDeleteFiles: function (component, lstDocumentId)
    {
        try
        {
            var action = component.get('c.ctrlDeleteDocument');
            action.setParams({
                                 'deviceInfoStr': JSON.stringify(component.get('v.deviceinfo')),
                                 'lstDocumentId' : lstDocumentId
                             });

            action.setCallback(this, function (result)
            {
                if (!component.successfulResponse(result))
                {
                    component.hideSpinner();
                    return;
                }

                var resp = result.getReturnValue();
                component.hideSpinner();
            });

            $A.enqueueAction(action);
        }
        catch (e)
        {
            component.error('hlpDeleteFile - ' + e.message);
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
                component.showSpinner();
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
            component.error('hlpCancel - ' + e.message);
        }
    },

    hlpSend: function (component, documentId)
    {
        try
        {
            if(!this.validate(component))
            {
                component.error('Please correct errors');
                return;
            }
            component.showSpinner();

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
                                 'deviceInfoStr': JSON.stringify(component.get('v.deviceinfo')),
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

            action.setCallback(this, function (result)
            {
                if (!component.successfulResponse(result))
                {
                    component.hideSpinner();
                    return;
                }

                var resp = result.getReturnValue();
                component.hideSpinner();
                this.hlpCancel(component);
            });

            $A.enqueueAction(action);
        }
        catch (e)
        {
            component.error('hlpSend - ' + e.message);
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
    
})