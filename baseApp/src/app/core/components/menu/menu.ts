import { Component, OnInit } from '@angular/core';
import { AppUtility } from '../../utils/appUtility.service';
import { menuConfigration } from '../../config/menuConfigration';
import { trigger, state, style, animate, transition } from '@angular/animations';

@Component({
  selector: 'menu',
  templateUrl: './menu.html',
  animations: [
    trigger('slideInOut', [
      state('out', style({
        left: '-50vh' // Off-screen
      })),
      state('in', style({
        left: '0' // Fully visible
      })),
      transition('out => in', animate('0.3s ease-in-out')),
      transition('in => out', animate('0.3s ease-in-out'))
    ]),
    trigger('fadeInOut', [
      state('hidden', style({
        opacity: '0',
        pointerEvents: 'none' // Prevent interaction when hidden
      })),
      state('visible', style({
        opacity: '1',
        pointerEvents: 'auto' // Enable interaction when visible
      })),
      transition('hidden <=> visible', animate('0.3s ease-in-out'))
    ])
  ]
})
export class menu implements OnInit {

  constructor(public appUtils: AppUtility, public menuConfig: menuConfigration) { }

  menuConfigData:any[] = this.menuConfig.menuConfigration;

  ngOnInit(): void {
   this.initialMenus();
  }

  initialMenus() {
    this.menuConfigData.forEach(element => {
      let index = 0; 
      if(element?.menuItems?.length > 0){
        element.index = index
        element.expand = false;
        index++
        element.menuItems.forEach((childElement: any) => {
          childElement.index = index;
          childElement.expand = false;
          index++
        });
      } else {
        element.index = index;
        index++
      }
    })
  }

  sideNavState = 'out';
  backdropState = 'hidden'; 

  toggleSideNav() {
    this.sideNavState = this.sideNavState === 'out' ? 'in' : 'out';
    this.backdropState = this.backdropState === 'hidden' ? 'visible' : 'hidden';
  }

  toggleMenuGroup (menuDetail: any) {
    this.menuConfigData.forEach(element => {
      if (element.index === menuDetail?.index) {
        element['expand'] = !element['expand'];
        element?.menuItems.forEach((childElement: any) => {
          childElement['expand'] = !childElement['expand'];
        });
      }
    })
  }

  expandGroupMenu(menuDetail: any) {
    this.menuConfigData.forEach(element => {
      if (element.index === menuDetail?.index) {
        element['expand'] = true;
        element?.menuItems.forEach((childElement: any) => {
          childElement['expand'] = true;
        });
      }
    })
  }

  collapseGroupMenu(menuDetail: any) {
    this.menuConfigData.forEach(element => {
      if (element.index === menuDetail?.index) {
        element['expand'] = false;
        element?.menuItems.forEach((childElement: any) => {
          childElement['expand'] = false;
        });
      }
    })
  }

  onMenuSelected(menu: any | string) {
    this.initialMenus();
    this.toggleSideNav()
    this.appUtils.routerNavigation({}, typeof(menu) === 'string' ? menu : menu.menuUrl);
  }

}
