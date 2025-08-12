import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TraineeattendanceComponent } from './traineeattendance.component';

describe('TraineeattendanceComponent', () => {
  let component: TraineeattendanceComponent;
  let fixture: ComponentFixture<TraineeattendanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TraineeattendanceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TraineeattendanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
