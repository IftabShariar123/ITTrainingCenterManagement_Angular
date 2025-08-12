//export interface Course {
//  courseId: number;
//  courseName: string;
//  shortCode: string;
//  totalHours: string;
//  courseFee: number;
//  remarks?: string;
//  isActive: boolean;
//  createdDate: string;
//  instructorCourse_Junction_Tables?: InstructorCourseJunction[];
//  classRoomCourse_Junction_Tables?: ClassRoomCourseJunction[];
//}


export interface Course {
  courseId: number;
  courseName: string;
  shortCode: string;
  totalHours: string;
  courseFee: number;
  remarks?: string;
  isActive: boolean;
  createdDate: string;
  instructors?: {
    instructorId: number;
    employeeName: string;
    isPrimaryInstructor: boolean;
    assignmentDate: string;
  }[];
  classRoom?: {
    classRoomId: number;
    roomName: string;
    courseName: string;
    isAvailable: boolean;
  }[];
}


export interface InstructorCourseJunction {
  instructorCourseId?: number;
  instructorId: number;
  courseId?: number;
  assignmentDate?: string;
  isPrimaryInstructor: boolean;
  instructor?: Instructor;
}

export interface ClassRoomCourseJunction {
  classRoomCourseId?: number;
  classRoomId: number;
  courseId?: number;
  isAvailable: boolean;
  classRoom?: ClassRoom;
}


// src/app/models/instructor.model.ts
export interface Instructor {
  instructorId: number;
  employeeId: number;
  employee?: Employee;
}

export interface Employee {
  employeeId: number;
  employeeName: string;
}

export interface ClassRoom {
  classRoomId: number;
  roomName: string;
}
