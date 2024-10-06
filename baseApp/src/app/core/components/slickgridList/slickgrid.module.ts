// src/app/pages/testEntry/testEntry.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { slickgridList } from './slickgridList';
import { AngularFireModule } from '@angular/fire/compat';
import { firebaseConfig } from '../../config/firebaseConfig';
import { AngularSlickgridModule } from 'angular-slickgrid';
import { LoadingAnimationComponent } from './loading-animation.component';
import { ticSlickGridUtils } from '../../utils/ticSlickGridUtils';


@NgModule({
  declarations: [slickgridList,LoadingAnimationComponent],
  imports: [
    CommonModule,
    
    AngularFireModule.initializeApp(firebaseConfig),
    AngularSlickgridModule.forRoot(),
  ],
  exports: [slickgridList],
  providers:[ticSlickGridUtils]
})
export class slickgridListModule { }
