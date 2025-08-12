import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CourseCombo } from '../Models/course-combo';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class CourseComboService {
  private apiUrl = environment.apiBaseUrl;

  constructor() { }

  http = inject(HttpClient);

  getAllCourseCombos(): Observable<CourseCombo[]> {
    return this.http.get<CourseCombo[]>(this.apiUrl + "/CourseCombo/GetCourseCombos");
  }

  getCourseComboById(id: number): Observable<CourseCombo> {
    return this.http.get<CourseCombo>(this.apiUrl + "/CourseCombo/GetCourseCombo/" + id);
  }

  addCourseCombo(data: CourseCombo): Observable<any> {
    return this.http.post(this.apiUrl + "/CourseCombo/InsertCourseCombo", data);
  }

  updateCourseCombo(courseCombo: CourseCombo): Observable<any> {
    return this.http.put(this.apiUrl + "/CourseCombo/UpdateCourseCombo/" + courseCombo.courseComboId, courseCombo);
  }

  deleteCourseCombo(id: number): Observable<any> {
    return this.http.delete(this.apiUrl + "/CourseCombo/DeleteCourseCombo/" + id);
  }

  // Additional methods if needed
  getActiveCourseCombos(): Observable<CourseCombo[]> {
    return this.http.get<CourseCombo[]>(this.apiUrl + "/CourseCombo/GetActiveCourseCombos");
  }

  // Method to get courses for dropdown when creating/editing combos
  getAvailableCourses(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl + "/Course/GetCourses");
  }

  checkNameUnique(name: string, id: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/CourseCombo/CheckNameUnique`, {
      params: {
        name,
        id: id.toString()
      }
    });
  }
}
