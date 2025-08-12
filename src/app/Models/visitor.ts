export interface Visitor {

  visitorId: number;
  visitorNo:string;         
  visitorName: string;
  contactNo: string;
  email: string;
  visitDateTime: Date;         
  visitPurpose: string;
  address: string;
  educationLevel: string;
  visitorType: string;            
  employeeComments: string;
  employeeId: number;
  employee?: Employee;
  employeeName?: string; 
  expectedCourse: string;
  visitorSource: string;
  reference: string;
  companyName: string;
}
export interface Employee {
  employeeId: number;
  employeeName: string;
  isAvailable: boolean;
  isWillingToSell: boolean;
}



