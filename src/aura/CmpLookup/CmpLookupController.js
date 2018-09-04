/*
Copyright 2017 OpFocus, Inc

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy,
modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR
IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
({
    doInit : function(component, event, helper) {
        helper.hlpGetFieldHelp(component);
        helper.hlpGetField(component);
    },
    performLookup : function(component, event, helper) {
        helper.hlpPerformLookup(component);
    },
    selectItem : function(component, event, helper) {
        var index = event.currentTarget.dataset.index;
        helper.hlpSelectItem(component, index);
    },
    toggleMenu : function(component, event, helper) {
        helper.hlpToggleMenu(component);
    },
    checkValidity : function(component, event, helper) {
        helper.hlpCheckValidity(component);
    },
    setHelpTextProperties : function(component, event, helper) {
        helper.hlpSetHelpTextProperties(component);
    },
    setInputValue : function(component, event, helper) {
        var selectedName = component.get("v.selectedName");
        helper.populateField(component, selectedName);
        //document.getElementById(component.getGlobalId() + "_myinput").value = selectedName;
    },
    valueChanged : function(component, event, helper) {
        helper.hlpValueChanged(component);
    },
    clearField : function(component, event, helper){
        helper.clearField(component,true);
        helper.toggleIcons(component,true);
    },
    scroll : function(component, event, helper){
        console.log('in scroll');
    },


})