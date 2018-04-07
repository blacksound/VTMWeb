import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CueHandlerService } from './cue-handler.service';
import { CuesViewComponent } from './cues-view/cues-view.component';
import { CuesDirective } from './cues.directive';
import { CueComponent } from './cue/cue.component';
import { CounterComponent } from './counter/counter.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [CuesViewComponent, CuesDirective, CueComponent, CounterComponent],
  providers: [CueHandlerService],
  entryComponents: [
    CueComponent
  ],
  exports: [
    CuesViewComponent
  ]
})
export class AnimatedCuesModule { }
