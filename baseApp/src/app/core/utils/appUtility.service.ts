import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AppUtility {
  currentPage: string = "home";
  constructor(private router: Router) {}

  appConfig: any = {
    applicationName: "",
    userName: "",
    assignedMenugroups: []
  }

  routerNavigation( queryParams: object, navigationUrl: string) {
    console.log(queryParams,navigationUrl );
    
      this.router.navigate([`/${navigationUrl}`], {queryParams, queryParamsHandling: 'preserve',skipLocationChange: true});
    }
}
