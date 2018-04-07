import { Component, Input, AfterViewInit, ViewChild, ComponentFactoryResolver, OnDestroy, OnInit } from '@angular/core';

import { CuesDirective } from '../cues.directive';
import { CueHandlerService }         from '../cue-handler.service';
import { Cue }         from '../cue';
import { CueComponent } from '../cue/cue.component';


@Component({
  selector: 'app-cues-view',
  templateUrl: './cues-view.component.html',
  styleUrls: ['./cues-view.component.css']
})
export class CuesViewComponent implements OnInit {
  
  @ViewChild(CuesDirective) cueHost: CuesDirective;
  private viewContainerRef;
  private cueSubscriber;

  constructor(private cueHandlerService: CueHandlerService, private componentFactoryResolver: ComponentFactoryResolver) { }

  ngOnInit() {
    this.viewContainerRef = this.cueHost.viewContainerRef;
    this.viewContainerRef.clear(); //is this necessary on init?
    this.getCues();
    this.updateTrigger();
  }

  loadComponent(cue: Cue) {
    let componentFactory = this.componentFactoryResolver.resolveComponentFactory(CueComponent);
    let componentRef = this.viewContainerRef.createComponent(componentFactory);
    (<CueComponent>componentRef.instance).update(cue);
  }

  updateTrigger(): void {
    this.cueHandlerService.getUpdateTrigger().subscribe(() => {
      this.cueSubscriber.unsubscribe;
      this.viewContainerRef.clear();
      this.getCues();
    });
  }

  getCues(): void {
    this.cueSubscriber = this.cueHandlerService.getCues().subscribe(cue => {
      this.loadComponent(cue);
      setTimeout(() => {
        this.viewContainerRef.remove(0);
      }, 8000);
    });
  }
}
