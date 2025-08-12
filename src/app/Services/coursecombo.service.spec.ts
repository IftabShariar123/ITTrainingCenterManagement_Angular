import { TestBed } from '@angular/core/testing';

import { CourseComboService } from './coursecombo.service';

describe('CoursecomboService', () => {
  let service: CourseComboService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CourseComboService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
