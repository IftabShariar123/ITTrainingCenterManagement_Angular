import { TestBed } from '@angular/core/testing';

import { MoneyReceiptService } from './money-receipt.service';

describe('MoneyReceiptService', () => {
  let service: MoneyReceiptService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MoneyReceiptService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
