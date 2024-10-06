import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutActionButtonsComponent } from './layoutActionButtons.component';
import { MatButtonModule } from '@angular/material/button'; // Using Angular Material for buttons
import { MatIconButton } from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@NgModule({
  declarations: [LayoutActionButtonsComponent],
  imports: [
    CommonModule,
    MatButtonModule ,
    MatIconModule,
    MatIconButton,
    MatTooltipModule
  ],
  exports: [LayoutActionButtonsComponent]
})
export class LayoutActionButtonsModule { }
