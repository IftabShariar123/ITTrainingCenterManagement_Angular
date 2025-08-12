import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Day } from '../Models/day';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class DayService {

  private apiUrl = environment.apiBaseUrl

  constructor() { }

  http = inject(HttpClient)

  getAllDays() {
    return this.http.get<Day[]>(this.apiUrl + "/Day/GetDays");
  }
  getAllDayss() {
    return this.http.get<Day[]>(this.apiUrl + "/Day/GetDayss");
  }

  addDay(data: any) {
    return this.http.post(this.apiUrl + "/Day/InsertDay", data);
  }
  updateDay(day: Day) {
    return this.http.put(this.apiUrl + "/Day/UpdateDay/" + day.dayId, day)
  }
  deleteDay(id: number) {
    return this.http.delete(this.apiUrl + "/Day/DeleteDay/" + id);
  }


}
