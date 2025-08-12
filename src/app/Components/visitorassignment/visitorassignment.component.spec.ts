import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisitorassignmentComponent } from './visitorassignment.component';

describe('VisitorassignmentComponent', () => {
  let component: VisitorassignmentComponent;
  let fixture: ComponentFixture<VisitorassignmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VisitorassignmentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VisitorassignmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
