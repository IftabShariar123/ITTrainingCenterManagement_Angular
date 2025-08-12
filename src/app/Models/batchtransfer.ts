export interface BatchTransfer {
  batchTransferId?: number; // New key property
  traineeId: number;
  batchId: number;
  createdDate?: Date;
  transferDate?: Date | null;
  trainee?: any;
  batch?: any;
}

export interface TraineeDisplay {
  traineeId: number;
  displayText: string;
}
