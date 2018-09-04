/* Class:       CmpSendEmailSelectContactCtrl
** Created by:  OpFocus (Veena Sundara-Heragu) on 8/30/18
** Description: controller for lightning component CmpSendEmailSelectContact
*/
public with sharing class CmpSendEmailSelectContactCtrl
{
    @AuraEnabled
    public static ContactList ctrlGetContacts(String searchString, String pageStr, Map<Id, String> mapEmailByContact, List<Id>lstSelectedToShow)
    {
        ContactList retVal = new ContactList();
        try
        {
            Integer page = Integer.valueOf(pageStr);
            retVal.lstContact = new List<ListOption>();
            retVal.mapEmailByContact = mapEmailByContact == null ? new Map<Id, String>() : new Map<Id, String>(mapEmailByContact);

            String soql = 'Select Id, Name, Email from Contact';

            if(searchString != null && searchString != '')
            {
                soql += ' Where Name Like \'%' + searchString + '%\'';
            }
            Integer offset = 200 * (page - 1);
            soql += ' ORDER BY Name';
            soql += ' LIMIT 200 OFFSET ' + offset;

            List<Contact>lstFirst = Database.query(soql);
            for(Contact c : lstFirst)
            {
                retVal.lstContact.add(new ListOption(c.Name, c.Id));
                retVal.mapEmailByContact.put(c.Id, c.Email);
            }

            // now added the previously selected contacts
            if(lstSelectedToShow != null && !lstSelectedToShow.isEmpty())
            {
                for (Contact c : [Select Id, Name, Email from Contact Where Id in :lstSelectedToShow
                                    And Id not in :lstFirst])
                {
                    retVal.lstContact.add(new ListOption(c.Name, c.Id));
                    retVal.mapEmailByContact.put(c.Id, c.Email);
                }
            }

            return retVal;
        }
        catch (Exception ex)
        {
            throw new AuraHandledException('Exception occured:\r\n' + ex.getMessage() + '\r\n' + ex.getStackTraceString() + '\r\n');
        }
        return retVal;
    }

    public class ContactList
    {
        @AuraEnabled public List<ListOption> lstContact;
        @AuraEnabled public Map<Id, String> mapEmailByContact;
    }

}