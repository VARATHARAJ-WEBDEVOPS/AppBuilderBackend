
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: "root"
})
export class menuConfigration {

  constructor() { }

  menuConfigration = [
  {
    "menuId": 10001,
    "menuDisplayName": "Employee Entry",
    "menuIcon": "bi bi-cart4",
    "menuUrl": "Employee_ENTRY",
  },
  {
    "menuId": 10004,
    "menuDisplayName": "Employee List",
    "menuIcon": "bi bi-list-columns-reverse",
    "menuUrl": "Employee_LIST"
  }
];

}
