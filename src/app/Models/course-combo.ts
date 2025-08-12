export interface CourseCombo {
  courseComboId: number;
  comboName: string ;
  selectedCourse: string ;
  selectedCourseIds: number[];
  isActive: boolean;
  remarks?: string;
}
