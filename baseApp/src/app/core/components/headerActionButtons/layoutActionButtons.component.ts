import { Component, Input, input } from '@angular/core';
import { AppUtility } from '../../utils/appUtility.service';

@Component({
    selector: 'app-layout-action-buttons',
    templateUrl: './layoutActionButtons.component.html',
    styleUrl: './headerActionButtons.css'
})
export class LayoutActionButtonsComponent {

    constructor(private appUtils: AppUtility) { }

    @Input() buttonData: any;
    @Input() parentContext: any;
    @Input() dataContext: any
    onButtonClick(action: any) {
        if (action.buttonAction === "SAVE") {
          this.parentContext.save()
          // this.parentContext.save().then((response: any) => {
          //   if (response && action.redirectNeeded && this.parentContext.recordId) {
          //     console.log(response.id);
              
          //    if (action.redirectNeeded) {
          //     this.appUtils.routerNavigation({
          //       data: JSON.stringify({ id: response.id, redirectFrom: action.redirectFrom })
          //     }, action.redirectTo);
          //    }
          //   }
          // }).catch(error => {
          //   console.error('Error saving record:', error);
          // });
        } else if (action.buttonAction === "ADD" || action.buttonAction === "LIST") {
          this.appUtils.routerNavigation({}, action.redirectTo);
        } else if (action.buttonAction === "VIEW" || action.buttonAction === "EDIT" && this.dataContext ) {
          this.appUtils.routerNavigation({
            data: JSON.stringify({ id: this.dataContext.id, redirectFrom: action.redirectFrom })
          }, action.redirectTo);
        } else if (action.buttonAction === "EDIT" && this.dataContext === undefined && this.parentContext && this.parentContext['recordId'] ) {
          this.appUtils.routerNavigation({
            data: JSON.stringify({ id: this.parentContext['recordId'], redirectFrom: action.redirectFrom })
          }, action.redirectTo);
        }
      }
      
}      