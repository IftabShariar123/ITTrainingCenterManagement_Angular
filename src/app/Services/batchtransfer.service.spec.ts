import { TestBed } from '@angular/core/testing';

import { BatchtransferService } from './batchtransfer.service';

describe('BatchtransferService', () => {
  let service: BatchtransferService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BatchtransferService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
