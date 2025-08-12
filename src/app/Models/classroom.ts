export interface ClassRoom {
  classRoomId?: number;
  roomName: string;
  seatCapacity: number;
  location: string;
  hasProjector: boolean;
  hasAirConditioning: boolean;
  hasWhiteboard: boolean;
  hasSoundSystem: boolean;
  hasInternetAccess: boolean;
  isActive: boolean;
  remarks?: string;
  additionalFacilities?: string;
  classRoomCourse_Junction_Tables?: ClassRoomCourseJunction[];
}

export interface ClassRoomCourseJunction {
  classRoomCourseId?: number;
  classRoomId?: number;
  courseId: number;
  isAvailable: boolean;
  courseName?: string; 
}
