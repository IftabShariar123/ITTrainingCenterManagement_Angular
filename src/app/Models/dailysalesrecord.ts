import { Employee } from "./employee";

export interface DailySalesRecord {
  dailySalesRecordId: number;
  employeeId: number;
  employee?: {
    employeeId: number;
    employeeName: string;
  };
  date: Date | string;
  coldCallsMade: number;
  meetingsScheduled: number;
  meetingsConducted: number;
  visitorNo: string;
  walkInsAttended: number;
  walkInVisitorNo: string;
  evaluationsAttended: number;
  corporateVisitsScheduled: number;
  corporateVisitsConducted: number;
  newRegistrations: number;
  enrollments: number;
  newCollections: number;
  dueCollections: number;
  remarks?: string;
}

export interface MonthlySummary {
  totalColdCalls: number;
  totalMeetingsConducted: number;
  totalWalkIns: number;
  totalEnrollments: number;
  totalCollections: number;
  totalDueCollections: number;
  employeeId: number;
  employee?: Employee;
}
