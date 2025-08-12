import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Employee, Visitor } from '../Models/visitor';
import { environment } from '../../environments/environment.development';
import { Observable, catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VisitorService {

  private apiUrl = environment.apiBaseUrl;

  constructor() { }

  http = inject(HttpClient);

  getAllVisitors() {
    return this.http.get<Visitor[]>(this.apiUrl + "/Visitor/GetVisitors");
  }

  getVisitorById(id: number) {
    return this.http.get<Visitor>(this.apiUrl + "/Visitor/GetVisitor/" + id);
  }

  addVisitor(visitor: Visitor) {
    return this.http.post(this.apiUrl + "/Visitor/InsertVisitor", visitor);
  }

  updateVisitor(visitor: Visitor) {
    return this.http.put(this.apiUrl + "/Visitor/UpdateVisitor/" + visitor.visitorId, visitor);
  }

  //deleteVisitor(id: number) {
  //  return this.http.delete(this.apiUrl + "/Visitor/DeleteVisitor/" + id);
  //}

  deleteVisitor(id: number) {
    return this.http.delete(this.apiUrl + "/Visitor/DeleteVisitor/" + id, {
      observe: 'response' // This will give us the full response including status
    }).pipe(
      catchError(error => {
        // Forward the error with the actual error message
        return throwError(() => error.error || "You can't delete this visitor because this visitor related with another records.");
      })
    );
  }

  getEmployees() {
    return this.http.get<Employee[]>(this.apiUrl + "/Employee/GetEmployees");
  }
   
  assignVisitors(payload: any): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(`${this.apiUrl}/VisitorTransfer/assign`, payload, { headers }).pipe(
      catchError(error => {
        console.error('Assignment error:', error);
        return throwError(error);
      })
    );
  }
  // get visitors by employeeId
  getVisitorsByEmployee(employeeId: number) {
    return this.http.get<Visitor[]>(`${this.apiUrl}/Visitor/ByEmployee/${employeeId}`);
  }
  getVisitorWithHistory(visitorId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/Visitor/GetVisitorWithHistory/${visitorId}`);
  }

  getVisitorAssignmentHistory(visitorId: number): Observable<VisitorAssignmentHistory[]> {
    return this.http.get<VisitorAssignmentHistory[]>(`${this.apiUrl}/VisitorTransfer/GetVisitorAssignments/${visitorId}`);
  }

// Add this interface

}
export interface VisitorAssignmentHistory {
  transferDate: string;
  notes: string;
  userName: string;
  employeeName: string;
}
