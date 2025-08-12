export interface Registration {
  registrationId: number;
  registrationNo: string;
  visitorId: number;
  visitor?: Visitor;
  traineeName: string;
  registrationDate: Date;
  // Single course selection (replaced the selectedCourses/selectedCourseIds)
  courseId?: number;
  course?: Course;
  // For Course combo
  courseComboId?: number;
  courseCombo?: CourseCombo;
  //registrationFee: number;
  //paymentMode: string; 
  gender: string;
  nationality: string;
  religion: ReligionType;
  dateOfBirth?: Date;
  originatDateofBirth?: Date;
  maritalStatus: string;
  fatherName: string;
  motherName: string;
  contactNo: string;
  emergencyContactNo: string;
  emailAddress: string;
  bloodGroup: string;
  imagePath?: string;
  imageFile?: File; // Not mapped in backend
  documentPath?: string;
  documentFile?: File; // Not mapped in backend
  birthOrNIDNo: string;
  presentAddress: string;
  permanentAddress: string;
  highestEducation: string;
  institutionName: string;
  reference: string; // Executive name
  remarks?: string;
}

export interface Visitor {
  visitorId: number;
  visitorName: string;
  employeeId: number;
  employee?: Employee;
  employeeName?: string;
}

export interface Employee {
  employeeId: number;
  employeeName: string;
}

export interface CourseCombo {
  courseComboId: number;
  comboName: string;
}

export interface Course {
  courseId: number;
  courseName: string;
}

export type ReligionType = 'Islam' | 'Hindu' | 'Christian' | 'Buddhist' | 'Other';
