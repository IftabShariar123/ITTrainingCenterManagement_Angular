import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DailysalesreportComponent } from './dailysalesreport.component';

describe('DailysalesreportComponent', () => {
  let component: DailysalesreportComponent;
  let fixture: ComponentFixture<DailysalesreportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DailysalesreportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DailysalesreportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
