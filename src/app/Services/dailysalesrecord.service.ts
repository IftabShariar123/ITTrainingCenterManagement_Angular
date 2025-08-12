import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { DailySalesRecord, MonthlySummary } from '../Models/dailysalesrecord';
import { environment } from '../../environments/environment.development';
import { Employee } from '../Models/employee';

@Injectable({
  providedIn: 'root'
})
export class DailySalesRecordService {
  private apiUrl = environment.apiBaseUrl;
  http = inject(HttpClient);

  getAllRecords() {
    return this.http.get<DailySalesRecord[]>(this.apiUrl + "/DailySalesRecord/DailySalesRecords");
  }

  getRecordById(id: number) {
    return this.http.get<DailySalesRecord>(this.apiUrl + "/DailySalesRecord/DailySalesRecords/" + id);
  }

  addRecord(record: DailySalesRecord) {
    return this.http.post(this.apiUrl + "/DailySalesRecord/InsertDailySalesRecords", record);
  }

  updateRecord(id: number, record: DailySalesRecord) {
    return this.http.put(this.apiUrl + "/DailySalesRecord/UpdateDailySalesRecords/" + id, record);
  }

  deleteRecord(id: number) {
    return this.http.delete(this.apiUrl + "/DailySalesRecord/DeleteDailySalesRecords/" + id);
  }

  getRecordsByDate(date: Date) {
    const dateStr = date.toISOString().split('T')[0];
    return this.http.get<DailySalesRecord[]>(this.apiUrl + "/DailySalesRecord/date?date=" + dateStr);
  }

  getMonthlySummary(year: number, month: number) {
    return this.http.get<MonthlySummary>(this.apiUrl + "/DailySalesRecord/summary/" + year + "/" + month);
  }
  getAllEmployees() {
    return this.http.get<Employee[]>(this.apiUrl + "/Employee/GetEmployees");
  }

  getEmployeeTotalCollection(employeeId: number, year: number, month: number) {
    return this.http.get<number>(`${this.apiUrl}/DailySalesRecord/totalCollection?employeeId=${employeeId}&year=${year}&month=${month}`);
  }

}
