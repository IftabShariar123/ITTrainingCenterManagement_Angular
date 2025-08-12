import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BatchtransferComponent } from './batchtransfer.component';

describe('BatchtransferComponent', () => {
  let component: BatchtransferComponent;
  let fixture: ComponentFixture<BatchtransferComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BatchtransferComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BatchtransferComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
