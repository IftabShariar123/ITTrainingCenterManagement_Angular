import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MoneyReceiptComponent } from './money-receipt.component';

describe('MoneyReceiptComponent', () => {
  let component: MoneyReceiptComponent;
  let fixture: ComponentFixture<MoneyReceiptComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MoneyReceiptComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MoneyReceiptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
