import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { Observable } from 'rxjs';
import { Recommendation, RecommendationCreateDTO } from '../Models/recommendation';
import { Trainee } from '../Models/assessment';
import { Batch } from '../Models/batch';

@Injectable({
  providedIn: 'root'
})
export class RecommendationService {

  private apiUrl = environment.apiBaseUrl;
  http = inject(HttpClient);

  getBatches(): Observable<Batch[]> {
    return this.http.get<Batch[]>(this.apiUrl + '/Batch/GetBatches');
    // যদি না থাকে, তাহলে ব্যবহার করুন '/Batch' বা '/GetBatch' 
  }

  getInstructorAndTrainees(batchId: number): Observable<{ instructor: any, trainees: Trainee[] }> {
    return this.http.get<{ instructor: any, trainees: Trainee[] }>(this.apiUrl + `/Recommendation/GetInsTraiByBatch/${batchId}`);
  }

  getRecommendations(): Observable<Recommendation[]> {
    return this.http.get<Recommendation[]>(this.apiUrl + '/Recommendation/GetRecommendations');
  }

  getRecommendation(id: number): Observable<Recommendation> {
    return this.http.get<Recommendation>(this.apiUrl + `/Recommendation/GetRecommendation/${id}`);
  }

  createRecommendations(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/Recommendation/InsertRecommendation`, data);
  }
  // In your recommendation.service.ts
  updateRecommendation(data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/Recommendation/UpdateRecommendation/${data.recommendationId}`, {
      RecommendationId: data.recommendationId,
      RecommendationText: data.recommendationText,
      RecommendationDate: data.recommendationDate,
      RecommendationStatus: data.recommendationStatus,
      InstructorId: data.instructorId,
      TraineeId: data.traineeId,
      BatchId: data.batchId,
      AssessmentId: data.assessmentId,  // Add this
      InvoiceId: data.invoiceId        // Add this
    });
  }

  // recommendation.service.ts
  getRecommendationsByBatch(batchId: number): Observable<Recommendation[]> {
    return this.http.get<Recommendation[]>(`${this.apiUrl}/Recommendation/GetRecommendationsByBatch/${batchId}`);
  }

  deleteRecommendation(id: number) {
    return this.http.delete(this.apiUrl + `/Recommendation/DeleteRecommendation/${id}`);
  }

  getInvAssessByTrainee(traineeId: number): Observable<any> {
    return this.http.get<any>(this.apiUrl + `/Recommendation/GetInvAssessbyTrainee/${traineeId}`);
  }

  // recommendation.service.ts
  getTraineePaymentSummary(traineeId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/Recommendation/trainee-payment-summary/${traineeId}`);
  }
}
