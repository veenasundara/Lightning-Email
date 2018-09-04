/*
** Class: CmpSendEmailSelectContactCtrlTest
** Created by OpFocus (Veena Sundara-Heragu) on 8/30/18
** Description: Test class for CmpSendEmailSelectContactCtrl
*/
@isTest
public class CmpSendEmailSelectContactCtrlTest
{

    static testMethod void myTest1()
    {
        Account a = new Account(Name = 'Test Account');
        insert a;
        Contact c = new Contact(FirstName = 'Test', LastName='Contact', AccountId = a.Id);
        insert c;

        Map<Id, String> mapEmailByContact = new Map<Id, String>();
        CmpSendEmailSelectContactCtrl.ContactList retVal =CmpSendEmailSelectContactCtrl.ctrlGetContacts('te', '1', mapEmailByContact, new List<Id>{c.Id});
        system.assertEquals(1, retVal.lstContact.size());
        retVal =CmpSendEmailSelectContactCtrl.ctrlGetContacts('zz', '1', mapEmailByContact, new List<Id>{c.Id});
        system.assertEquals(1, retVal.lstContact.size());
    }

}