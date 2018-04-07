import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CuesViewComponent } from './cues-view.component';

describe('CuesViewComponent', () => {
  let component: CuesViewComponent;
  let fixture: ComponentFixture<CuesViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CuesViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CuesViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
