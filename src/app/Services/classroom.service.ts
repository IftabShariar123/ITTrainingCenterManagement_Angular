import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ClassRoom, ClassRoomCourseJunction } from '../Models/classroom';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ClassRoomService {
  private apiUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) { }

  getAllClassRooms(): Observable<any> {
    return this.http.get(`${this.apiUrl}/ClassRoom/GetAllClassRooms`);
  }

  getClassRoomById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/ClassRoom/GetClassRoom/${id}`);
  }

  createClassRoom(classRoom: ClassRoom): Observable<any> {
    return this.http.post(`${this.apiUrl}/ClassRoom/InsertClassRoom`, classRoom);
  }

  updateClassRoom(id: number, classRoom: ClassRoom): Observable<any> {
    return this.http.put(`${this.apiUrl}/ClassRoom/UpdateClassRoom/${id}`, classRoom);
  }

  deleteClassRoom(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/ClassRoom/DeleteClassRoom/${id}`);
  }
}



