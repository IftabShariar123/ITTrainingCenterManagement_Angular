export interface Certificate {
  certificateId: number;
  traineeId: number;
  registrationId: number;
  batchId: number;
  courseId: number;
  recommendationId: number;
  issueDate: string; // ISO string date
  certificateNumber?: string | null;

  // Optional display properties (must match backend response!)
  traineeName?: string;
  registrationNo?: string;
  batchName?: string;
  courseName?: string;
  recommendationStatus?: string;
}

