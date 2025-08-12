import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoursecomboComponent } from './coursecombo.component';

describe('CoursecomboComponent', () => {
  let component: CoursecomboComponent;
  let fixture: ComponentFixture<CoursecomboComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CoursecomboComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CoursecomboComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
