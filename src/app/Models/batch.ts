export interface Batch {
  batchId: number;
  batchName: string;
  courseId: number;
  startDate: Date;
  endDate?: Date;
  batchType: string;
  instructorId: number;
  classRoomId: number;
  isActive: boolean;
  remarks?: string;
  selectedScheduleIds: number[];
  previousInstructorIds: number[];
}

export interface BatchDto {
  batchId: number;
  batchName: string;
  courseId: number;
  courseName?: string;
  startDate: Date;
  endDate?: Date;
  batchType: string;
  instructorId: number;
  instructor?: {
    instructorId: number;
    employee?: {
      employeeId: number;
      employeeName: string;
    };
  };
  employeeName?: string;
  classRoomId: number;
  classRoomName?: string;
  isActive: boolean;
  remarks?: string;
  selectedScheduleIds: number[];
  previousInstructorIds: number[];
  previousInstructorIdsString: string;
  selectedClassSchedules: string;
}

export interface BatchForm {
  batchName: string;
  courseId: number;
  startDate: Date;
  endDate?: Date;
  batchType: string;
  instructorId: number;
  classRoomId: number;
  isActive: boolean;
  remarks?: string;
  selectedScheduleIds: number[];
}

