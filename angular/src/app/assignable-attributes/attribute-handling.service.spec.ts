import { TestBed, inject } from '@angular/core/testing';

import { AttributeHandlingService } from './attribute-handling.service';

describe('AttributeHandlingService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AttributeHandlingService]
    });
  });

  it('should be created', inject([AttributeHandlingService], (service: AttributeHandlingService) => {
    expect(service).toBeTruthy();
  }));
});
