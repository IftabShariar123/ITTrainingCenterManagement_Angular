import { TestBed } from '@angular/core/testing';

import { DailysalesreportService } from './dailysalesreport.service';

describe('DailysalesreportService', () => {
  let service: DailysalesreportService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DailysalesreportService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
