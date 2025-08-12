export class Slot {
  slotID: number;
  timeSlotType: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
  remarks?: string;
  constructor(
    slotID: number = 0,
    timeSlotType: string = '',
    startTime: string = '',
    endTime: string = '',
    isActive: boolean = false,
    remarks: ''
  ) {
    this.slotID = slotID;
    this.timeSlotType = timeSlotType;
    this.startTime = startTime;
    this.endTime = endTime;
    this.isActive = isActive;
    this.remarks = remarks;
  }

  // For UI display (09:00 AM format)
  get startTimeDisplay(): string {
    return this.formatTimeForDisplay(this.startTime);
  }

  get endTimeDisplay(): string {
    return this.formatTimeForDisplay(this.endTime);
  }

  // For database (HH:mm:ss format)
  get startTimeDB(): string {
    return this.formatTimeForDB(this.startTime);
  }

  get endTimeDB(): string {
    return this.formatTimeForDB(this.endTime);
  }

  private formatTimeForDisplay(time: string): string {
    if (!time) return '';

    // If already in display format, return as is
    if (time.includes('AM') || time.includes('PM')) return time;

    // Convert from DB format (HH:mm:ss) to display format (hh:mm AM/PM)
    const [hours, minutes] = time.split(':');
    const hourNum = parseInt(hours, 10);
    const period = hourNum >= 12 ? 'PM' : 'AM';
    const displayHour = hourNum % 12 || 12;
    return `${displayHour}:${minutes} ${period}`;
  }

  private formatTimeForDB(time: string): string {
    if (!time) return '';

    // If already in DB format (HH:mm:ss), return as is
    if (/^\d{2}:\d{2}:\d{2}$/.test(time)) return time;

    // Convert from display format (hh:mm AM/PM) to DB format (HH:mm:ss)
    const [timePart, period] = time.split(' ');
    let [hours, minutes] = timePart.split(':');
    let hourNum = parseInt(hours, 10);

    if (period === 'PM' && hourNum < 12) {
      hourNum += 12;
    } else if (period === 'AM' && hourNum === 12) {
      hourNum = 0;
    }

    return `${hourNum.toString().padStart(2, '0')}:${minutes}:00`;
  }
}
