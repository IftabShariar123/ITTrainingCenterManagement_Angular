import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ClassSchedule, Day, Slot, ClassScheduleDto } from '../Models/class-schedule';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ClassScheduleService {
  private apiUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) { }

  getSchedules(): Observable<ClassSchedule[]> {
    return this.http.get<ClassSchedule[]>(`${this.apiUrl}/ClassSchedule/GetSchedules`);
  }

  getSchedule(id: number): Observable<ClassSchedule> {
    return this.http.get<ClassSchedule>(`${this.apiUrl}/ClassSchedule/GetSchedule/${id}`);
  }

  createSchedule(schedule: ClassScheduleDto): Observable<ClassSchedule> {
    return this.http.post<ClassSchedule>(`${this.apiUrl}/ClassSchedule/InsertSchedule`, schedule);
  }

  updateSchedule(id: number, schedule: ClassScheduleDto): Observable<any> {
    return this.http.put(`${this.apiUrl}/ClassSchedule/UpdateSchedule/${id}`, schedule);
  }

  deleteSchedule(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/ClassSchedule/DeleteSchedule/${id}`);
  }

  getDays(): Observable<Day[]> {
    return this.http.get<Day[]>(`${this.apiUrl}/Day/GetDays`);
  }

  getSlots(): Observable<Slot[]> {
    return this.http.get<Slot[]>(`${this.apiUrl}/Slot/GetSlots`);
  }
}
