import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Slot } from '../Models/slot';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class SlotService {

  private apiUrl = environment.apiBaseUrl;

  constructor() { }

  http = inject(HttpClient);

  getAllSlots() {
    return this.http.get<Slot[]>(this.apiUrl + "/Slot/GetSlots");
  }

  getActiveSlots() {
    return this.http.get<Slot[]>(this.apiUrl + "/Slot/GetActiveSlots");
  }

  getSlotById(id: number) {
    return this.http.get<Slot>(this.apiUrl + "/Slot/GetSlot/" + id);
  }

  //addSlot(slot: Slot) {
  //  return this.http.post(this.apiUrl + "/Slot/InsertSlot", slot);
  //}

  addSlot(slot: Slot) {
    const slotForDB = {
      ...slot,
      startTime: slot.startTimeDB,
      endTime: slot.endTimeDB
    };
    return this.http.post(this.apiUrl + "/Slot/InsertSlot", slotForDB);
  }



  //updateSlot(slot: Slot) {
  //  return this.http.put(this.apiUrl + "/Slot/UpdateSlot/" + slot.slotID, slot);
  //}
  updateSlot(slot: Slot) {
    const slotForDB = {
      ...slot,
      startTime: slot.startTimeDB,
      endTime: slot.endTimeDB
    };
    return this.http.put(this.apiUrl + "/Slot/UpdateSlot/" + slot.slotID, slotForDB);
  }


  deleteSlot(id: number) {
    return this.http.delete(this.apiUrl + "/Slot/DeleteSlot/" + id);
  }

  toggleSlotStatus(id: number, isActive: boolean) {
    return this.http.patch(this.apiUrl + "/Slot/ToggleSlotStatus/" + id, { isActive });
  }

  // Additional methods that might be useful for slots
  getSlotsByType(timeSlotType: string) {
    return this.http.get<Slot[]>(this.apiUrl + "/Slot/GetSlotsByType/" + timeSlotType);
  }

  getSlotsByTimeRange(startTime: string, endTime: string) {
    return this.http.get<Slot[]>(`${this.apiUrl}/Slot/GetSlotsByTimeRange?start=${startTime}&end=${endTime}`);
  }
}
