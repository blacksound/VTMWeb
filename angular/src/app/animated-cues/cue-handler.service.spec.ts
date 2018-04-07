import { TestBed, inject } from '@angular/core/testing';

import { CueHandlerService } from './cue-handler.service';

describe('CueHandlerService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CueHandlerService]
    });
  });

  it('should be created', inject([CueHandlerService], (service: CueHandlerService) => {
    expect(service).toBeTruthy();
  }));
});
