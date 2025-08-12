import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DailysalesrecordComponent } from './dailysalesrecord.component';

describe('DailysalesrecordComponent', () => {
  let component: DailysalesrecordComponent;
  let fixture: ComponentFixture<DailysalesrecordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DailysalesrecordComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DailysalesrecordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
