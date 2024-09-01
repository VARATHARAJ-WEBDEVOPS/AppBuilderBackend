import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AppUtility } from './core/utils/appUtility.service';
import { MenuModule } from './core/components/menu/menu.module';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MenuModule
  ],
  providers: [AppUtility, provideAnimationsAsync()],
  bootstrap: [AppComponent]
})
export class AppModule { }
