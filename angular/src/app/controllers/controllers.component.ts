import { Component, Input, AfterViewInit, ViewChild, ComponentFactoryResolver, OnDestroy, OnInit } from '@angular/core';

import { ControllerDirective } from '../controller.directive';
import { AttributeHandlingService }         from '../assignable-attributes/attribute-handling.service';
import { Attribute }         from '../assignable-attributes/attribute-classes/attribute';
import { Range }         from '../assignable-attributes/attribute-classes/range';
import { Bool }         from '../assignable-attributes/attribute-classes/bool';
import { ControllerComponent } from '../controller.component';
import { SliderComponent } from '../slider/slider.component'

@Component({
  selector: 'app-controllers',
  templateUrl: './controllers.component.html',
  styleUrls: ['./controllers.component.css']
})
export class ControllersComponent implements OnInit {
  
  @ViewChild(ControllerDirective) controllerHost: ControllerDirective;
  private viewContainerRef;
  private attributeSubscriber;

  constructor(private attributeHandlingService: AttributeHandlingService, private componentFactoryResolver: ComponentFactoryResolver) { }

  ngOnInit() {
    this.viewContainerRef = this.controllerHost.viewContainerRef;
    this.viewContainerRef.clear(); //is this necessary on init?
    this.getAttributes();
    this.updateTrigger();
  }

  loadComponent(attribute: Attribute) {
    let component;
    switch (attribute.constructor.name) {
      case Range.name: {
        component = SliderComponent;
        break;
      }
      case Bool.name: {
        component = SliderComponent;
        break;
      }
    }

    if (component) {
      let componentFactory = this.componentFactoryResolver.resolveComponentFactory(component);
      let componentRef = this.viewContainerRef.createComponent(componentFactory);
      (<ControllerComponent>componentRef.instance).update(attribute);
    }
  }

  updateTrigger(): void {
    this.attributeHandlingService.getUpdateTrigger().subscribe(() => {
      this.attributeSubscriber.unsubscribe;
      this.viewContainerRef.clear();
      this.getAttributes();
    });
  }

  getAttributes(): void {
    this.attributeSubscriber = this.attributeHandlingService.getAttributes('').subscribe(attribute => {
      this.loadComponent(attribute);
    });
  }
}
