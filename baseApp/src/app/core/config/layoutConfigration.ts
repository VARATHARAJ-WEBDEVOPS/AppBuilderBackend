import { Injectable } from '@angular/core';

@Injectable({
    providedIn: "root"
})
export class LayoutConfiguration {

    constructor() {}

    public layoutConfiguration = {
        "Employee_ENTRY": {
            "layoutDisplayName": "Employee Entry",
            "headerActionInfo": [
                {
                    buttonAction: "LIST",
                    buttonType: "TEXT-ONLY",
                    redirectTo: "Employee_LIST",
                    redirectFrom: "Employee_ENTRY",
                    buttonText: "Employee List",
                    buttonIcon: "",
                    buttonBackgroundColor: "#3fb5b5",
                    buttonTextColor: "#fff"
                },
                {
                    buttonAction: "SAVE",
                    buttonType: "TEXT+ICON",
                    buttonText: "Save Employee",
                    buttonBackgroundColor: "#ff4081",
                    buttonTextColor: "#fff",
                    buttonIcon: "save",
                    redirectNeeded: true,
                    redirectTo: "Employee_VIEW",
                    redirectFrom: "Employee_ENTRY"
                },
            ],
            "mappingDetails": {
                "employee_DUMMY$$employeeAddInfo.gender":[
                    {
                        "displayName": "Male",
                        "value": "male"
                    },{
                        "displayName": "Female",
                        "value": "female"
                    }
                ],
                "employee_DUMMY.qualification":[
                    {
                        "displayName": "Graduate",
                        "value": "graduate"
                    },
                    {
                        "displayName": "Post Graduate",
                        "value": "postgraduate"
                    },
                    {
                        "displayName": "PhD",
                        "value": "phn",
                    },
                    {
                        "displayName": "Other",
                        "value": "others"
                    }
                ]
            }
        },
        "Employee_VIEW": {
            "layoutDisplayName": "Employee View",
            "headerActionInfo": [
                {
                    buttonAction: "ADD",
                    buttonType: "TEXT-ONLY",
                    redirectTo: "Employee_ENTRY",
                    redirectFrom: "Employee_VIEW",
                    buttonText: "Add Employee",
                    buttonBackgroundColor: "#3fb5b5",
                    buttonTextColor: "#fff"
                },
                {
                    buttonAction: "LIST",
                    buttonType: "ICON-ONLY",
                    buttonIcon: "lists",
                    redirectTo: "Employee_LIST",
                    redirectFrom: "Employee_VIEW",
                    buttonText: "Employee List",
                    buttonBackgroundColor: "#ff4081",
                    buttonIconColor: "#fff"
                },
                {
                    buttonAction: "EDIT",
                    buttonType: "ICON-ONLY",
                    buttonIcon: "edit",
                    redirectTo: "Employee_ENTRY",
                    redirectFrom: "Employee_VIEW",
                    buttonText: "Edit Employee",
                    buttonBackgroundColor: "#1e8347",
                    buttonIconColor: "#fff"
                }
            ]
        },
        "Employee_LIST": {
            "layoutDisplayName": "Employee List",
            "headerActionInfo": [
                {
                    buttonAction: "ADD",
                    buttonType: "TEXT-ONLY",
                    redirectTo: "Employee_ENTRY",
                    redirectFrom: "Employee_LIST",
                    buttonText: "Add Employee",
                    buttonBackgroundColor: "#3fb5b5",
                    buttonTextColor: "#fff"
                },
            ],
            "columnFieldInfo": [
                {
                    fieldName: "employee.employeeid",
                    fieldDisplayName: "Employee Name",
                    sortable: true,
                    editable: true,
                    fieldType: "string",
                    editor: { type: 'text' } 
                }, {
                    fieldName: "employee.employeename",
                    fieldDisplayName: "Employee Name",
                    sortable: true,
                    editable: true,
                    fieldType: "string",
                    editor: { type: 'text' } 
                },
                {
                    fieldName: "employee.qualification",
                    fieldDisplayName: "Qualification",
                    sortable: true,
                    editable: true,
                    fieldType: "string",
                    editor: { type: 'text' } // Text input for single line
                },
                {
                    fieldName: "employee.dateofbirth",
                    fieldDisplayName: "Date of Birth",
                    sortable: true,
                    editable: true,
                    fieldType: "string",
                    editor: { type: 'text' } // Text input for single line
                },
                {      
                    fieldName: "employee.view",
                    fieldDisplayName: "View",
                    fieldType: "action",
                    buttonInfoSet:[{
                        buttonAction: "VIEW",
                        buttonType: "ICON-ONLY",
                        buttonText: "Employee View",
                        buttonIcon: "visibility",
                        redirectTo: "Employee_VIEW",
                        redirectFrom: "Employee_LIST",
                        buttonBackgroundColor: "#ff4081",
                        buttonIconColor: "#fff"
                    }],
                }, {      
                    fieldName: "employee.addemployee",
                    fieldDisplayName: "Add Employee",
                    fieldType: "action",
                    buttonInfoSet:[ {
                        buttonAction: "ADD",
                        buttonType: "TEXT-ONLY",
                        redirectTo: "Employee_ENTRY",
                        redirectFrom: "Employee_LIST",
                        buttonText: "Add Employee",
                        buttonBackgroundColor: "#3fb5b5",
                        buttonTextColor: "#fff"
                    }],
                },{
                    fieldName: "employee.phonenumber",
                    fieldDisplayName: "Phone Number",
                    sortable: true,
                    editable: true,
                    fieldType: "number",
                    editor: { type: 'number' } // Text input for single line
                },{      
                    fieldName: "employee.editemployee",
                    fieldDisplayName: "Edit Employee",
                    fieldType: "action",
                    buttonInfoSet:[ {
                        buttonAction: "EDIT",
                        buttonType: "TEXT+ICON",
                        redirectTo: "Employee_ENTRY",
                        redirectFrom: "Employee_LIST",
                        buttonText: "Edit Employee",
                        buttonIcon: "edit",
                        buttonBackgroundColor: "#ffce33",
                        buttonTextColor: "#fff"
                    }],
                },
                {
                    fieldName: "employee.age",
                    fieldDisplayName: "Age",
                    sortable: true,
                    editable: true,
                    fieldType: "number",
                    editor: { type: 'number' } // Text input for single line
                },{
                    fieldName: "employeeAddInfo.employeeaddinfoid",
                    fieldDisplayName: "Employee Add Info",
                    fieldType: "string",
                    sortable: true,
                    editable: true,
                    editor: { type: 'text' },
                },{
                    fieldName: "employeeAddInfo.aadharnumber",
                    fieldDisplayName: "Aadhar Number",
                    fieldType: "number",
                    sortable: true,
                    editable: true,
                    editor: { type: 'number' },
                },{
                    fieldName: "employeeAddInfo.gender",
                    fieldDisplayName: "Gender",
                    fieldType: "string",
                    sortable: true,
                    editable: true,
                    editor: { type: 'select', options: ["Male", "Female"] },
                },
                {
                    fieldName:"employeeMainRecord.employeeMainRecordId",
                    fieldDisplayName: "Employee Main Record Id",
                    fieldType: "string",
                    sortable: true,
                    editable: true,
                    editor: { type: 'text' },
                },{
                    fieldName:"employeeMainRecord.familyMembers",
                    fieldDisplayName: "Family Members",
                    fieldType: "number",
                    sortable: true,
                    editable: true,
                    editor: { type: 'number' },
                },{
                    fieldName:"employeeMainRecord.address",
                    fieldDisplayName: "Address",
                    fieldType: "string",
                    sortable: true,
                    editable: true,
                    editor: { type: 'textarea' },
                },{
                    fieldName:"employeeStatusInfo.employeeStatusInfoId",
                    fieldDisplayName: "Employee Status Info Id",
                    fieldType: "string",
                    sortable: true,
                    editable: true,
                    editor: { type: 'text' },
                },{
                    fieldName:"employeeStatusInfo.status",
                    fieldDisplayName: "Status",
                    fieldType: "boolean",
                    sortable: true,
                    editable: true,
                    editor: { type: 'boolean', options: ["Active", "Inactive"] },
                }
            ]
        },
    };
}
