export interface VisitorTransfer_Junction {
  visitorTransferId?: number; // optional because it will be auto-generated
  visitorId: number;
  employeeId: number;
  createdDate?: Date;
  transferDate: Date;
  notes?: string;
  userName: string;
}
