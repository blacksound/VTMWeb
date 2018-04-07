import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CueComponent } from './cue.component';

describe('CueComponent', () => {
  let component: CueComponent;
  let fixture: ComponentFixture<CueComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CueComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
