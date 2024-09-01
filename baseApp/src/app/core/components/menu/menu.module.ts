import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { menu } from './menu';  // Adjust the path as needed
import { BgColorPipe } from '../../pipes/profileBGPipe';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {MatTooltipModule} from '@angular/material/tooltip';

@NgModule({
  declarations: [
    menu,      // Declare here
    BgColorPipe
  ],
  imports: [
    CommonModule,
    BrowserAnimationsModule,
    MatTooltipModule
  ],
  exports: [
    menu,      // Export if needed elsewhere
    BgColorPipe
  ]
})
export class MenuModule { }
