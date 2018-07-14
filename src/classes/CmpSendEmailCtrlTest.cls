/*
** Class: CmpSendEmailCtrlTest
** Created by OpFocus (Veena Sundara-Heragu) on 7/12/18
** Description: Test class for CmpSendEmailCtrl
*/
@isTest
public class CmpSendEmailCtrlTest
{

    static testMethod void myTest1()
    {
        Account a = new Account(Name = 'Test Account');
        insert a;
        Contact c = new Contact(FirstName = 'Test', LastName='Contact', AccountId = a.Id);
        insert c;

        EmailTemplate temp = new EmailTemplate();
        temp.isActive = true;
        temp.Name = 'Test Template';
        temp.DeveloperName = 'Test_Template';
        temp.TemplateType = 'text';
        temp.FolderId = UserInfo.getUserId();
        system.runAs(new User(Id = UserInfo.getUserId()))
        {
            insert temp;
        }

        CmpSendEmailCtrl.CmpSendEmailReturn retVal = CmpSendEmailCtrl.ctrlGetLists('{}');
        system.assertEquals(1,retVal.lstContact.size());
        system.assertEquals(c.Id, retVal.lstContact[0].value);
        system.assert(retVal.lstRelatedTo.size() > 1);


        CmpSendEmailCtrl.CmpTemplateReturn ret = CmpSendEmailCtrl.ctrlGetEmailTemplate('{}', temp.Id);
        system.assertEquals('My Personl Email Templates', ret.folder);

        ContentVersion cv = new ContentVersion( Title = 'Test',
                                                PathOnClient = 'Test.jpg',
                                                VersionData = Blob.valueOf('Test Content Data'),
                                                IsMajorVersion = true);
        insert cv;
        cv = [Select Id, ContentDocumentId From ContentVersion Where Id = :cv.Id];
        CmpSendEmailCtrl.ctrlDeleteDocument('{}', new List<String>{cv.ContentDocumentId});
        List<ContentVersion> lstCV = [Select Id from ContentVersion where Id = :cv.Id];
        system.assertEquals(0, lstCV.size());

        CmpSendEmailCtrl.ctrlSendEmail('{}', temp.Id, 'text', UserInfo.getUserId(), c.Id, 'Account', a.Id,
                                        'test@yahoo.com', 'test@yahoo.com', 'test@yahoo.com', false,
                                        'subject', 'body',
                                        JSON.serialize(new List<EmailAttachment>{new EmailAttachment('testdoc', cv.ContentDocumentId)}));

        CmpSendEmailCtrl.ctrlSendEmail('{}', null, 'text', UserInfo.getUserId(), c.Id, 'Account', a.Id,
                                        'test@yahoo.com', 'test@yahoo.com', 'test@yahoo.com', false,
                                        'subject', 'body',
                                        JSON.serialize(new List<EmailAttachment>{new EmailAttachment('testdoc', cv.ContentDocumentId)}));
    }

}