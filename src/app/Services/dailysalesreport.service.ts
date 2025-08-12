import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class DailySalesService {
  private baseUrl = 'http://localhost:5281/api/DailySalesRecord';

  constructor(private http: HttpClient) { }

  getByEmployeeAndDateRange(employeeId: number, startDate: string, endDate: string) {
    return this.http.get<any[]>(
      `${this.baseUrl}/byEmployeeAndDateRange?employeeId=${employeeId}&startDate=${startDate}&endDate=${endDate}`
    );
  }
}
