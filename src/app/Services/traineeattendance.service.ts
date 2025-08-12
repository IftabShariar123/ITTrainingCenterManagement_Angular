import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment.development';
import { BatchDetail } from '../Models/traineeattendance';
import { Batch } from '../Models/batch';

@Injectable({
  providedIn: 'root'
})
export class TraineeAttendanceService {
  private apiUrl = environment.apiBaseUrl;
  http = inject(HttpClient);

  getBatchDetails(batchId: number) {
    return this.http.get<BatchDetail>(`${this.apiUrl}/TraineeAttendance/GetBatchDetails/${batchId}`);
  }

  saveAttendance(data: any) {
    return this.http.post(`${this.apiUrl}/TraineeAttendance/InsertTraineeAttendance`, data);
  }
  getAllBatches() {
    return this.http.get<Batch[]>(`${this.apiUrl}/Batch/GetBatches`);
  }

  // Add these methods to your TraineeAttendanceService
  getAllAttendances() {
    return this.http.get<any[]>(`${this.apiUrl}/TraineeAttendance/GetTraineeAttendances`);
  }

  getAttendanceDetails(id: number) {
    return this.http.get<any>(`${this.apiUrl}/TraineeAttendance/GetTraineeAttendance/${id}`);
  }

  // In your TraineeAttendanceService
  updateAttendance(id: number, data: any) {
    // Ensure proper formatting of the data
    const payload = {
      traineeAttendanceId: id,
      attendanceDate: data.attendanceDate,
      batchId: data.batchId,
      instructorId: data.instructorId,
      traineeAttendanceDetails: data.traineeAttendanceDetails.map((detail: any) => ({
        traineeAttendanceDetailId: detail.traineeAttendanceDetailId || 0,
        traineeId: detail.traineeId,
        admissionId: detail.admissionId,
        invoiceId: detail.invoiceId || null,
        attendanceStatus: detail.attendanceStatus,
        markedTime: detail.attendanceStatus ? new Date().toISOString().split('T')[1].split('.')[0] : null,
        remarks: detail.remarks || ''
      }))
    };

    return this.http.put(
      `${this.apiUrl}/TraineeAttendance/UpdateTraineeAttendance/${id}`,
      payload,
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        })
      }
    );
  }

  deleteAttendance(id: number) {
    return this.http.delete(`${this.apiUrl}/TraineeAttendance/DeleteTraineeAttendance/${id}`);
  }
}
