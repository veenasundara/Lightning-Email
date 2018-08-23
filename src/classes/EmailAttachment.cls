/* Class:       EmailAttachment
** Created by:  OpFocus (Veena Sundara-Heragu) on 7/12/18
** Description: Class used by SendEmail Lightning Component to attach files to emails
*/
public with sharing class EmailAttachment
{
    @AuraEnabled public String name;
    @AuraEnabled public String documentId; // can be either Attachment or ContentDocument

    public EmailAttachment(String name, String documentId)
    {
        this.name = name;
        this.documentId = documentId;
    }

}