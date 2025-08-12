import { TestBed } from '@angular/core/testing';

import { TraineeattendanceService } from './traineeattendance.service';

describe('TraineeattendanceService', () => {
  let service: TraineeattendanceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TraineeattendanceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
