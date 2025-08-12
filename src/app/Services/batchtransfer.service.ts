import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { BatchTransfer, TraineeDisplay } from '../Models/batchtransfer';

@Injectable({
  providedIn: 'root'
})
export class BatchTransferService {
  private apiUrl = `${environment.apiBaseUrl}/BatchTransfer`;

  constructor(private http: HttpClient) { }

  getAllBatchTransfers(): Observable<BatchTransfer[]> {
    return this.http.get<BatchTransfer[]>(`${this.apiUrl}/GetBatchTransfers`);
  }

  getBatchTransferById(id: number): Observable<BatchTransfer> {
    return this.http.get<BatchTransfer>(`${this.apiUrl}/GetBatchTransfer/${id}`);
  }

  createBatchTransfer(batchTransfer: BatchTransfer): Observable<BatchTransfer> {
    return this.http.post<BatchTransfer>(`${this.apiUrl}/InsertBatchTransfer`, batchTransfer);
  }

  deleteBatchTransfer(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/DeleteBatchTransfer/${id}`);
  }

  getTraineeDisplayList(): Observable<TraineeDisplay[]> {
    return this.http.get<TraineeDisplay[]>(`${this.apiUrl}/GetTraineeOptions`);
  }

  getBatchOptions(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/GetBatchOptions`);
  }
}

