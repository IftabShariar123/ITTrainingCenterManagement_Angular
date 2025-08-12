export interface Assessment {
  assessmentId: number;
  traineeId: number;
  traineeName: string;
  instructorName: string;
  batchId: number;
  batchName: string;
  instructorId: number;
  assessmentDate: string;
  assessmentType: string;
  theoreticalScore?: number;
  practicalScore?: number;
  overallScore?: number;
  daysPresent: number;
  totalDays: number;
  attendancePercentage: number;
  participationLevel: string;
  technicalSkillsRating: string;
  communicationSkillsRating: string;
  teamworkRating: string;
  disciplineRemarks: string;
  punctuality: string;
  attitudeRating: string;
  strengths: string;
  weaknesses: string;
  improvementAreas: string;
  trainerRemarks: string;
  createdDate: string;
  lastModifiedDate?: string;
  isFinalized: boolean;
}

// Inside assessment.ts
export interface Trainee {
  traineeId: number;
  traineeName: string;
  traineeIDNo?: string;
  imagePath?: string;
  registration?: {
    traineeName: string;
    traineeIDNo: string;
    imagePath?: string;
  };
}

export interface BatchInstructor {
  instructorId: number;
  instructorName: string;
}

export interface BatchTrainee {
  traineeId: number;
  traineeName: string;
  traineeIDNo?: string;
  imagePath?: string;
  registration?: {
    traineeName: string;
    traineeIDNo: string;
    imagePath?: string;
  };
}

export interface BatchDetailsResponse {
  instructor: BatchInstructor | null;
  trainees: BatchTrainee[];
}

export interface InstructorResponse {
  instructorId: number;
  instructorName: string;
}

export interface TraineeResponse {
  traineeId: number;
  traineeName: string;
  traineeIDNo: string;
}


