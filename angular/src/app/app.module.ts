import { BrowserModule } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { SocketService } from './socket.service';
import { ControllerDirective } from './controller.directive';
import { ControllersComponent } from './controllers/controllers.component';
import { SliderComponent } from './slider/slider.component';
import { MatSliderModule } from '@angular/material';
import { AssignableAttributesModule } from './assignable-attributes/assignable-attributes.module'

@NgModule({
  declarations: [
    AppComponent,
    ControllerDirective,
    ControllersComponent,
    SliderComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    MatSliderModule,
    NoopAnimationsModule,
    AssignableAttributesModule
  ],
  providers: [
    SocketService
  ],
  bootstrap: [AppComponent],
  entryComponents: [
    SliderComponent
  ]
})
export class AppModule { }
