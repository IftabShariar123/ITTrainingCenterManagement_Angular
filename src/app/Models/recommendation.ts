import { Assessment } from "./assessment";
import { Invoice } from "./invoice";

export interface Recommendation {
  recommendationId: number;
  recommendationDate: string;
  recommendationText: string;
  recommendationStatus: string;

  // Navigation properties
  batchId: number;
  batch?: {
    batchName: string;
  };

  traineeId: number;
  trainee?: {
    traineeId: number;
    TraineeIDNo: string;
    registration?: {
      traineeName: string;
    };
  };

  instructorId: number;
  instructor?: {
    instructorId: number;
    employee?: {
      employeeName: string;
    };
  };

  assessmentId: number;
  assessment?: {
    assessmentId: number;
    assessmentType: string;
    assessmentDate: string;
    isFinalized: boolean;
    theoreticalScore?: number;
    practicalScore?: number;
    overallScore?: number;
  };

  invoiceId: number;
  invoice?: {
    invoiceId: number;
    invoiceNo: string;
    creatingDate: string;
    invoiceCategory: string;
    moneyReceiptNo: string;
  };
}


export interface RecommendationEntry {
  traineeId: number;
  traineeName: string;
  assessmentId: number | null;
  invoiceId: number | null;
  recommendationText: string;
  recommendationDate: string;
  recommendationStatus: string;
  assessments: Assessment[];
  invoices: Invoice[];
  paymentSummary?: {
    invoiceNo?: string;
    totalAmount?: number;
    totalPaid?: number;
    dueAmount?: number;
    statusMessage?: string;
  };
}

export interface RecommendationDetailDTO {
  traineeId: number;
  assessmentId: number;
  invoiceId: number;
  recommendationText: string;
  recommendationStatus: string;
}

export interface RecommendationCreateDTO {
  recommendationDate: string; // ISO date format (yyyy-MM-dd)
  batchId: number;
  instructorId: number;
  recommendations: RecommendationDetailDTO[];
}


