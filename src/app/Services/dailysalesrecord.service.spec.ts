import { TestBed } from '@angular/core/testing';

import { DailysalesrecordService } from './dailysalesrecord.service';

describe('DailysalesrecordService', () => {
  let service: DailysalesrecordService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DailysalesrecordService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
