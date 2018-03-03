import { Component, Input, AfterViewInit, ViewChild, ComponentFactoryResolver, OnDestroy, OnInit } from '@angular/core';

import { ControllerDirective } from '../controller.directive';
import { Controller }      from '../controller-classes/controller';
import { ControllerService }         from '../controller.service';
import { ControllerComponent } from '../controller-classes/controller.component';

@Component({
  selector: 'app-controllers',
  templateUrl: './controllers.component.html',
  styleUrls: ['./controllers.component.css']
})
export class ControllersComponent implements OnInit {
  
  @ViewChild(ControllerDirective) controllerHost: ControllerDirective;
  subscription: any;
  interval: any;

  constructor(private controllerService: ControllerService, private componentFactoryResolver: ComponentFactoryResolver) { }

  ngOnInit() {
    let viewContainerRef = this.controllerHost.viewContainerRef;
    viewContainerRef.clear();
    this.getControllers();
  }

  loadComponent(controller: Controller) {
    let viewContainerRef = this.controllerHost.viewContainerRef;
    //viewContainerRef.clear();

    let componentFactory = this.componentFactoryResolver.resolveComponentFactory(controller.component);
    let componentRef = viewContainerRef.createComponent(componentFactory);
    //(<ControllerComponent>componentRef.instance).controller = controller;
    (<ControllerComponent>componentRef.instance).update(controller);
  }

  getControllers(): void {
    this.controllerService.getControllers().subscribe(controllers => {
      controllers.forEach(controller => {
        this.loadComponent(controller);
      });
    });
    this.controllerService.updateControllers().subscribe(controller => {
      this.loadComponent(controller);
    });
  }

}
