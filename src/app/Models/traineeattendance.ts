export interface InvoiceInfo {
  invoiceId: number;
  invoiceNo: string;
}

export interface TraineeDetail {
  traineeId: number;
  traineeName: string;
  admissionId: number;
  admissionNo: string;
  invoiceNos: InvoiceInfo[];
  attendanceStatus?: boolean;
  remarks?: string;
}

export interface BatchDetail {
  batchId: number;
  batchName: string;
  instructorId: number;
  instructorName: string;
  trainees: TraineeDetail[];
}
