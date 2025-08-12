import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Assessment, BatchDetailsResponse} from '../Models/assessment';
import { Batch } from '../Models/batch';
import { environment } from '../../environments/environment.development';
import { tap } from 'rxjs/operators';


@Injectable({
  providedIn: 'root',
})
export class AssessmentService {
  private apiUrl = environment.apiBaseUrl + '/Assessment';
  private http = inject(HttpClient);

  getAllAssessments(): Observable<Assessment[]> {
    return this.http.get<Assessment[]>(`${this.apiUrl}/GetAssessments`);
  }

  getAssessmentById(id: number): Observable<Assessment> {
    return this.http.get<Assessment>(`${this.apiUrl}/GetAssessment/${id}`);
  }

  // In assessment.service.ts
  addAssessment(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/InsertAssessment`, data);
  }

  updateAssessment(id: number, payload: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/UpdateAssessment/${id}`, payload);
  }


  deleteAssessment(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/DeleteAssessment/${id}`);
  }

  finalizeAssessment(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/Finalize/${id}`, {});
  }


  getInstructorAndTraineesByBatch(batchId: number): Observable<BatchDetailsResponse> {
    return this.http.get<BatchDetailsResponse>(`${this.apiUrl}/GetInsTraiByBatches/${batchId}`);
  }



  getBatches(): Observable<Batch[]> {
    const batchApiUrl = this.apiUrl.replace('/Assessment', '/Batch');
    return this.http.get<Batch[]>(`${batchApiUrl}/GetBatches`);
  }

  getAssessedTraineeIds(batchId: number): Observable<number[]> {
    return this.http.get<number[]>(`${this.apiUrl}/AssessedTrainees/${batchId}`);
  }
  getTraineeById(traineeId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/GetTrainee/${traineeId}`);
  }

  // In assessment.service.ts
  getAssessmentDetails(id: number): Observable<Assessment> {
    return this.http.get<Assessment>(`${this.apiUrl}/GetAssessment/${id}`).pipe(
      tap(assessment => {
        // Ensure all properties are properly initialized
        assessment.attendancePercentage = assessment.attendancePercentage || 0;
        assessment.overallScore = assessment.overallScore || 0;
        // Add any other necessary default values
      })
    );
  }
}
