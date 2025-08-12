import { Employee } from "./employee";

export interface Instructor {
  instructorId: number;
  employeeId: number;
  employeeName?: string;
  employee?: Employee;
  isActive: boolean;
  remarks?: string;
  selectedCourseIds: number[];
  courses?: {  // Add this to match the new API response
    courseId: number;
    courseName: string;
    isPrimaryInstructor: boolean;
  }[];  instructorCourses?: InstructorCourse[];
}

export interface InstructorCourse {
  courseId: number;
  courseName: string;
  isPrimaryInstructor?: boolean;
}
