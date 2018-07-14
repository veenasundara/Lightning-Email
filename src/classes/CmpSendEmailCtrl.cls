/* Class:       CmpSendEmailCtrl
** Created by:  OpFocus (Veena Sundara-Heragu) on 7/3/18
** Description: Controller for Lightning Component CmpSendEmail
*/
public with sharing class CmpSendEmailCtrl
{
    @AuraEnabled
    public static CmpSendEmailReturn ctrlGetLists(String deviceInfoStr)
    {
        CmpSendEmailReturn retVal = new CmpSendEmailReturn();
        try
        {
            retVal.lstContact = new List<ListOption>();
            retVal.mapEmailByContact = new Map<Id, String>();
            for(Contact c : [Select Id, Name, Email from Contact Order By Name])
            {
                retVal.lstContact.add(new ListOption(c.Name, c.Id));
                retVal.mapEmailByContact.put(c.Id, c.Email);
            }

            // Add current user's name and email address followed by all the organization wide email addresses as options for the
            // "From" selection
            retVal.lstFrom = new List<ListOption>();
            retVal.lstFrom.add(new ListOption('"' + UserInfo.getName() + '" (' + UserInfo.getUserEmail() + ')', UserInfo.getUserId()));
            for(OrgWideEmailAddress owe : [select DisplayName, Address from OrgWideEmailAddress Order By DisplayName])
            {
                retVal.lstFrom.add(new ListOption('"' + owe.DisplayName + '" (' + owe.Address + ')', owe.Id));
            }

            // Add all SObjects to the related to selection list
            retVal.lstRelatedTo = new List<ListOption>();
            Map<String, Schema.SObjectType> gd = Schema.getGlobalDescribe();
            List<String>lstObjectLabel = new List<String>();
            Map<String, List<ListOption>> mapListOptionByObjectLabel = new Map<String, List<ListOption>>();
            for(Schema.SObjectType objType: gd.values())
            {
                Schema.DescribeSObjectResult ds = objType.getDescribe();
                if(ds.fields.getMap().get('Name') != null)
                {
                    String label = ds.getLabel();
                    ListOption lo = new ListOption(ds.getLabel(), ds.getName());
                    if(mapListOptionByObjectLabel.containsKey(label))
                    {
                        mapListOptionByObjectLabel.get(label).add(lo);
                    }
                    else
                    {
                        mapListOptionByObjectLabel.put(ds.getLabel(), new List<ListOption>{lo});
                        lstObjectLabel.add(label);
                    }
                }
            }
            lstObjectLabel.sort();
            for(String label : lstObjectLabel)
            {
                for(ListOption lo : mapListOptionByObjectLabel.get(label))
                {
                    retVal.lstRelatedTo.add(lo);
                }
            }

            // get email templates by folder
            Set<String> setFolder = new Set<String>();
            retVal.mapTemplatesByFolder = new Map<String, List<EmailTemplate>>();
            for(EmailTemplate et : [Select
                                            Id, Name, Body, Subject, Description, Folder.Name
                                    FROM
                                            EmailTemplate
                                    WHERE
                                            IsActive = true
                                    ORDER BY Folder.Name, Name])
            {
                setFolder.add(et.Folder.Name);
                if(retVal.mapTemplatesByFolder.containsKey(et.Folder.Name))
                {
                    retVal.mapTemplatesByFolder.get(et.Folder.Name).add(et);
                }
                else
                {
                    retVal.mapTemplatesByFolder.put(et.Folder.Name, new List<EmailTemplate>{et});
                }
            }
            retVal.lstFolder = new List<String>();
            retVal.lstFolder.add('Unfiled Public Email Templates');
            retVal.lstFolder.add('My Personl Email Templates');
            retVal.lstFolder.addAll(setFolder);

            // get templates for unfiled public folder
            for(EmailTemplate et : [Select
                                            Id, Name, Body, Subject, Description
                                    FROM
                                            EmailTemplate
                                    WHERE
                                            IsActive = true AND
                                            FolderId = :UserInfo.getOrganizationId()
                                    ORDER BY Name])
            {
                if(retVal.mapTemplatesByFolder.containsKey('Unfiled Public Email Templates'))
                {
                    retVal.mapTemplatesByFolder.get('Unfiled Public Email Templates').add(et);
                }
                else
                {
                    retVal.mapTemplatesByFolder.put('Unfiled Public Email Templates', new List<EmailTemplate>{et});
                }
            }

            // get email templates for My Personal Email Templates folder
            for(EmailTemplate et : [Select
                                            Id, Name, Body, Subject, Description
                                    FROM
                                            EmailTemplate
                                    WHERE
                                            IsActive = true AND
                                            FolderId = :UserInfo.getUserId()
                                    ORDER BY Name])
            {
                if(retVal.mapTemplatesByFolder.containsKey('My Personl Email Templates'))
                {
                    retVal.mapTemplatesByFolder.get('My Personl Email Templates').add(et);
                }
                else
                {
                    retVal.mapTemplatesByFolder.put('My Personl Email Templates', new List<EmailTemplate>{et});
                }
            }

            return retVal;
        }
        catch (Exception e)
        {
            retVal.handleException(e);
            Log.notify(e, null, 'CmpSendEmailCtrl', DeviceInformation.deserialize(deviceInfoStr), Log.ErrorType.ERROR);
        }
        return retVal;
    }

    public class CmpSendEmailReturn extends AuraReturn
    {
        @AuraEnabled public List<ListOption> lstFrom;
        @AuraEnabled public List<ListOption> lstRelatedTo;
        @AuraEnabled public List<ListOption> lstContact;
        @AuraEnabled public Map<Id, String> mapEmailByContact;
        @AuraEnabled public List<String> lstFolder;
        @AuraEnabled public Map<String, List<EmailTemplate>> mapTemplatesByFolder;
    }

    public Class ListOption
    {
        @AuraEnabled public String label;
        @AuraEnabled public String value;

        public ListOption(String label, String value)
        {
            this.label = label;
            this.value = value;
        }
    }


    @AuraEnabled
    public static CmpTemplateReturn ctrlGetEmailTemplate(String deviceInfoStr, String templateId)
    {
        CmpTemplateReturn retVal = new CmpTemplateReturn();
        try
        {
            retVal.et = [Select Id, Name, FolderId, Folder.Name, Subject, Body, HtmlValue, Markup, RelatedEntityType, TemplateType
                            From EmailTemplate
                            Where Id = :templateId];

            Map<Id, String>mapFolderNameById = new Map<Id, String>{UserInfo.getOrganizationId() => 'Unfiled Public Email Templates',
                                                                    UserInfo.getUserId() => 'My Personl Email Templates'};

            if(mapFolderNameById.containsKey(retVal.et.FolderId))
            {
                retVal.folder = mapFolderNameById.get(retVal.et.FolderId);
            }
            else
            {
                retVal.folder = retVal.et.Folder.Name;
            }

            return retVal;
        }
        catch (Exception e)
        {
            retVal.handleException(e);
            Log.notify(e, null, 'CmpSendEmailCtrl', DeviceInformation.deserialize(deviceInfoStr), Log.ErrorType.ERROR);
        }
        return retVal;
    }

    public class CmpTemplateReturn extends AuraReturn
    {
        @AuraEnabled public EmailTemplate et;
        @AuraEnabled public String folder;
    }

    @AuraEnabled
    public static CmpDeleteReturn ctrlDeleteDocument(String deviceInfoStr, List<String> lstDocumentId)
    {
        CmpDeleteReturn retVal = new CmpDeleteReturn();
        try
        {
            List<ContentDocument>lstDoc = new List<ContentDocument>();
            for(String docId: lstDocumentId)
            {
                lstDoc.add(new ContentDocument(Id = docId));
            }
            delete lstDoc;
            return retVal;
        }
        catch (Exception e)
        {
            retVal.handleException(e);
            Log.notify(e, null, 'CmpSendEmailCtrl', DeviceInformation.deserialize(deviceInfoStr), Log.ErrorType.ERROR);
        }
        return retVal;
    }

    @AuraEnabled
    public static CmpDeleteReturn ctrlSendEmail(String deviceInfoStr, String templateId, String format,
                                                String fromId, String to, String relatedTo, String relatedToRecord,
                                                String additionalTo, String cc, String bcc, Boolean useSignature,
                                                String subject, String body, String lstUploadFileStr)
    {
        CmpDeleteReturn retVal = new CmpDeleteReturn();
        try
        {
            system.debug('=======> templateId = ' + templateId);
            system.debug('=======> format = ' + format);
            system.debug('=======> fromId = ' + fromId);
            system.debug('=======> to = ' + to);
            system.debug('=======> relatedTo = ' + relatedTo);
            system.debug('=======> relatedToRecord = ' + relatedToRecord);
            system.debug('=======> additionalTo = ' + additionalTo);
            system.debug('=======> cc = ' + cc);
            system.debug('=======> bcc = ' + bcc);
            system.debug('=======> useSignature = ' + useSignature);
            system.debug('=======> subject = ' + subject);
            system.debug('=======> body = ' + body);
            system.debug('=======> lstUploadFileStr = ' + JSON.serializePretty(lstUploadFileStr));

            List<EmailAttachment> lstUploadFile = (List<EmailAttachment>)JSON.deserializeStrict(lstUploadFileStr, List<EmailAttachment>.Class);

            Messaging.SingleEmailMessage mail = new Messaging.SingleEmailMessage();
            mail.setTargetObjectId(to);

            if(additionalTo != null)
            {
                List<String> lstTo = additionalTo.split(';');
                mail.setToAddresses(lstTo);
            }

            if(cc != null)
            {
                List<String> lstCC = cc.split(';');
                mail.setCcAddresses(lstCC);
            }

            if(bcc != null)
            {
                List<String> lstBCC = bcc.split(';');
                mail.setBCCAddresses(lstBCC);
            }

            mail.setUseSignature(useSignature);

            if(templateId != null)
            {
                mail.setTemplateId(templateId);
            }
            else
            {
                mail.setSubject(subject);
                if(format == 'Text')
                {
                    mail.setPlainTextBody(body);
                }
                else
                {
                    mail.setHtmlBody(body);
                }
            }

            if(lstUploadFile != null && !lstUploadFile.isEmpty())
            {
                List<Id> lstDocId = new List<Id>();
                for(EmailAttachment f: lstUploadFile)
                {
                    lstDocId.add(f.documentId);
                }
                // get the ContentVersion records for these ContentDocuments.  We need ContentVersion to attach to email
                List<Id>lstCV = new List<Id>();
                for(ContentVersion cv : [Select Id from ContentVersion Where ContentDocumentId in :lstDocId])
                {
                    lstCV.add(cv.Id);
                }
                mail.setEntityAttachments(lstCV);
            }

            if(fromId != UserInfo.getUserId())
            {
                mail.setOrgWideEmailAddressId(fromId);
            }

            if(relatedToRecord != null)
            {
                mail.setWhatId(relatedToRecord);
            }

            //system.debug('=======> mail = ' + JSON.serializePretty(mail));
            Messaging.sendEmail(new Messaging.Email[] { mail } , true);

            return retVal;
        }
        catch (Exception e)
        {
            retVal.handleException(e);
            Log.notify(e, null, 'CmpSendEmailCtrl', DeviceInformation.deserialize(deviceInfoStr), Log.ErrorType.ERROR);
        }
        return retVal;
    }

    public Class CmpDeleteReturn extends AuraReturn
    {

    }

}