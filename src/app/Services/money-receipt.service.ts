import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { MoneyReceipt } from '../Models/moneyreceipt';
import { Invoice } from '../Models/invoice';


@Injectable({
  providedIn: 'root'
})
export class MoneyReceiptService {
  private apiUrl = 'http://localhost:5281/api/MoneyReceipt';

  constructor(private http: HttpClient) { }

  //createMoneyReceipt(receipt: MoneyReceipt): Observable<MoneyReceipt> {
  //  return this.http.post<MoneyReceipt>(`${this.apiUrl}/InsertMoneyReceipt`, receipt);
  //}

  // In your service
  createMoneyReceipt(receipt: MoneyReceipt): Observable<MoneyReceipt> {
    const payload = {
      ...receipt,
      payableAmount: +receipt.payableAmount,
      paidAmount: +receipt.paidAmount,
      dueAmount: +receipt.dueAmount,
      // Keep the original isFullPayment value from the form
      isFullPayment: receipt.isFullPayment,
      receiptDate: new Date(receipt.receiptDate).toISOString()
    };

    console.log('Final API Payload:', payload);
    return this.http.post<MoneyReceipt>(`${this.apiUrl}/InsertMoneyReceipt`, payload);
  }

  getMoneyReceipts(): Observable<MoneyReceipt[]> {
    return this.http.get<MoneyReceipt[]>(`${this.apiUrl}/GetMoneyReceipts`);
  }

  getMoneyReceipt(id: number): Observable<MoneyReceipt> {
    return this.http.get<MoneyReceipt>(`${this.apiUrl}/GetMoneyReceipt/${id}`);
  }

  getInvoices(): Observable<Invoice[]> {
    return this.http.get<Invoice[]>(`${this.apiUrl}/invoices`);
  }

  getInvoiceNosByAdmission(admissionNo: string): Observable<string[]> {
    return this.http.get<string[]>(`http://localhost:5281/api/MoneyReceipt/invoices-by-admission/${admissionNo}`);
  }

  getTotalCourseFeeByAdmission(admissionNo: string): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/total-course-fee-by-admission/${admissionNo}`);
  }

  getAdmissionPaymentInfo(admissionNo: string) {
    return this.http.get<any>(`${this.apiUrl}/admission-payment-info/${admissionNo}`);
  }

  //updateMoneyReceipt(id: number, receipt: MoneyReceipt): Observable<void> {
  //  return this.http.put<void>(`${this.apiUrl}/UpdateMoneyReceipt/${id}`, receipt, {
  //    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  //  });
  //}

  updateMoneyReceipt(id: number, receipt: MoneyReceipt): Observable<MoneyReceipt> {
    return this.http.put<MoneyReceipt>(`${this.apiUrl}/UpdateMoneyReceipt/${id}`, receipt, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    });
  }


  // Delete a money receipt
  deleteMoneyReceipt(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/DeleteMoneyReceipt/${id}`);
  }

  // In money-receipt.service.ts
  getVisitorPaymentSummary(visitorId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/visitor-payment-summary/${visitorId}`);
  }

}
