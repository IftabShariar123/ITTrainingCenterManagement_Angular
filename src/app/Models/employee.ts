export interface Employee {
  employeeId: number;
  employeeIDNo: string;
  employeeName: string;
  designationId: number;
  designation?: Designation;
  departmentId: number;
  department?: Department;
  contactNo: string;
  dob: Date; // DateOnly in C# maps to Date in TypeScript
  joiningDate: Date;
  endDate?: Date;
  emailAddress: string;
  permanentAddress: string;
  presentAddress: string;
  fathersName: string;
  mothersName: string;
  birthOrNIDNo: number;
  isAvailable: boolean;
  isWillingToSell: boolean;
  imagePath?: string;
  documentPath?: string;
  imageFile?: File; // IFormFile in C# maps to File in TypeScript
  documentFile?: File;
  visitors?: Visitor[];
  remarks?: string;
}

export interface Designation {
  designationId: number;
  designationName: string;
  // Add other properties if needed
}

export interface Department {
  departmentId: number;
  departmentName: string;
  // Add other properties if needed
}

export interface Visitor {
  visitorId: number;
  // Add other visitor properties as needed
}

