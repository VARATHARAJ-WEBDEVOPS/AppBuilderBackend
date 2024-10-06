import { Component, OnInit } from '@angular/core';
import { AppUtility } from './core/utils/appUtility.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit{

  constructor(public appUtils: AppUtility) {}

  appConfig: any = {
    
  }

  ngOnInit(): void {
    this.appUtils.appConfig = this.appConfig;
  }

}
