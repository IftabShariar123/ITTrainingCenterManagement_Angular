export interface Day {
  dayId: number;
  dayName: string;
  isActive: boolean;
}

export interface Slot {
  slotID: number;
  timeSlotType: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

export interface ClassSchedule {
  classScheduleId: number;
  selectedDayIds: number[];
  selectedDays?: string;
  slotId: number;
  slot?: Slot;
  scheduleDate: string;
  isActive: boolean;
}

export interface ClassScheduleDto {
  slotId: number;
  scheduleDate: string;
  selectedDayIds: number[];
  isActive: boolean;
}
