import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Batch, BatchDto } from '../Models/batch';
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class BatchService {
  private apiUrl = environment.apiBaseUrl

  constructor(private http: HttpClient) { }

  getBatches(): Observable<BatchDto[]> {
    return this.http.get<BatchDto[]>(`${this.apiUrl}/Batch/GetBatches`);
  }

  getAllBatches() {
    return this.http.get<Batch[]>(`${this.apiUrl}/Batch/GetBatches`);
  }

  getBatch(id: number): Observable<Batch> {
    return this.http.get<Batch>(`${this.apiUrl}/Batch/GetBatch/${id}`);
  }

  createBatch(batch: Batch): Observable<Batch> {
    return this.http.post<Batch>(`${this.apiUrl}/Batch/InsertBatch`, batch);
  }

  updateBatch(id: number, batch: Batch): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/Batch/UpdateBatch/${id}`, batch);
  }

  deleteBatch(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/Batch/DeleteBatch/${id}`);
  }

  generateBatchName(courseId: number): Observable<string> {
    return this.http.get<string>(`${this.apiUrl}/Batch/GenerateBatchName/${courseId}`);
  }
}
