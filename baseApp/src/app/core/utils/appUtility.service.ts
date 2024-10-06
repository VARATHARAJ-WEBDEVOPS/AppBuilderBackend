import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AppUtility {
  currentPage: string = "home";
  isMainloading: boolean = false
  constructor(private router: Router) {}

  appConfig: any = {
    applicationName: "",
    userName: "",
    userMail: "",
    assignedMenugroups: []
  }

  routerNavigation( queryParams: object, navigationUrl: string) {
    console.log(queryParams,navigationUrl );
    
      this.router.navigate([`/${navigationUrl}`], {queryParams, skipLocationChange: true});
    }
}
