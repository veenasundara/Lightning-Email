/* Class:       ListOption
** Created by:  OpFocus (Veena Sundara-Heragu) on 8/30/18
** Description: Used by CmpSendEmail's controllers to show items in lightning:dualList
*/
public with sharing class ListOption
{
    @AuraEnabled public String label;
    @AuraEnabled public String value;

    public ListOption(String label, String value)
    {
        this.label = label;
        this.value = value;
    }

}