export interface Invoice {
  invoiceId?: number;
  invoiceNo: string;
  creatingDate: Date;
  invoiceCategory: 'Course' | 'NonCourse' | 'Registration';
  moneyReceiptNo: string; // Comma-separated receipt numbers
}
