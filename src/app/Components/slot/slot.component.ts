import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Slot } from '../../Models/slot';
import { SlotService } from '../../Services/slot.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';

@Component({
  selector: 'app-slot',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, NgxPaginationModule],
  templateUrl: './slot.component.html',
  styleUrls: ['./slot.component.css']
})
export class SlotComponent implements OnInit {
  @ViewChild('slotModal') slotModal!: ElementRef;
  @ViewChild('detailsModal') detailsModal!: ElementRef;

  slotList: Slot[] = [];
  filteredList: Slot[] = [];
  slotForm: FormGroup;
  isSubmitting = false;

  // Pagination properties
  p: number = 1;
  itemsPerPage: number = 5;
  searchText: string = '';
  searchBy: string = 'timeSlotType';
  // Sorting properties
  sortColumn: string = 'timeSlotType';
  sortDirection: 'asc' | 'desc' = 'asc';

  constructor(
    private slotService: SlotService,
    private fb: FormBuilder
  ) {
    this.slotForm = this.fb.group({
      slotID: [0],
      timeSlotType: ['', Validators.required],
      startTime: ['', [Validators.required, Validators.pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)]],
      endTime: ['', [Validators.required, Validators.pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)]],
      isActive: [true],
      remarks: [null]
    }, { validator: this.timeValidator });
  }

  ngOnInit(): void {
    this.loadSlots();
  }

  applyFilter() {
    if (!this.searchText) {
      this.filteredList = [...this.slotList];
      return;
    }

    this.filteredList = this.slotList.filter(slot => {
      const searchField = slot[this.searchBy as keyof Slot];
      if (typeof searchField === 'string') {
        return searchField.toLowerCase().includes(this.searchText.toLowerCase());
      }
      return false;
    });

    this.applySorting();
  }
  sort(column: string) {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.applySorting();
  }

  applySorting() {
    this.filteredList.sort((a, b) => {
      let valA = a[this.sortColumn as keyof Slot];
      let valB = b[this.sortColumn as keyof Slot];

      // Handle null/undefined values
      if (valA == null) return this.sortDirection === 'asc' ? 1 : -1;
      if (valB == null) return this.sortDirection === 'asc' ? -1 : 1;

      // Special handling for boolean values (isActive)
      if (this.sortColumn === 'isActive') {
        return this.sortDirection === 'asc'
          ? (valA === valB ? 0 : valA ? -1 : 1)
          : (valA === valB ? 0 : valA ? 1 : -1);
      }

      // Special handling for time strings
      if (this.sortColumn === 'startTime' || this.sortColumn === 'endTime') {
        const timeA = this.parseTimeString(valA as string);
        const timeB = this.parseTimeString(valB as string);
        return this.sortDirection === 'asc'
          ? timeA - timeB
          : timeB - timeA;
      }

      // Default string comparison
      if (typeof valA === 'string' && typeof valB === 'string') {
        return this.sortDirection === 'asc'
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      }

      // Handle number comparison
      return this.sortDirection === 'asc'
        ? (valA > valB ? 1 : -1)
        : (valB > valA ? 1 : -1);
    });
  }

  // Helper method to parse time strings into minutes
  private parseTimeString(timeString: string): number {
    if (!timeString) return 0;
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private timeValidator(group: FormGroup) {
    const start = group.get('startTime')?.value;
    const end = group.get('endTime')?.value;

    if (!start || !end) return null;

    const startDate = new Date(`2000-01-01T${start}`);
    const endDate = new Date(`2000-01-01T${end}`);

    if (startDate >= endDate) {
      return { timeError: true };
    }
    return null;
  }

  loadSlots(): void {
    this.slotService.getAllSlots().subscribe({
      next: (slots) => {
        this.slotList = slots;
        this.filteredList = [...slots];
        this.applySorting();
      },
      error: (err) => {
        console.error('Error loading slots:', err);
        alert('Failed to load slots');
      }
    });
  }

  openModal(): void {
    this.slotModal.nativeElement.style.display = 'block';
  }

  closeModal(): void {
    this.slotModal.nativeElement.style.display = 'none';
    this.slotForm.reset({
      slotID: 0,
      isActive: true
    });
  }

  onEdit(slot: Slot): void {
    this.slotForm.patchValue({
      ...slot,
      startTime: this.formatTimeForInput(slot.startTime),
      endTime: this.formatTimeForInput(slot.endTime)
    });
    this.openModal();
  }

  private formatTimeForInput(time: string): string {
    if (!time) return '';

    if (/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time)) return time;

    const [timePart, period] = time.split(' ');
    let [hours, minutes] = timePart.split(':');
    let hourNum = parseInt(hours, 10);

    if (period === 'PM' && hourNum < 12) {
      hourNum += 12;
    } else if (period === 'AM' && hourNum === 12) {
      hourNum = 0;
    }

    return `${hourNum.toString().padStart(2, '0')}:${minutes}`;
  }

  onDelete(slot: Slot): void {
    if (confirm(`Delete ${slot.timeSlotType} slot (${slot.startTime} - ${slot.endTime})?`)) {
      this.slotService.deleteSlot(slot.slotID).subscribe({
        next: () => this.loadSlots(),
        error: (err) => console.error('Error deleting slot:', err)
      });
    }
  }

  onSubmit(): void {
    if (this.slotForm.invalid || this.isSubmitting) return;

    this.isSubmitting = true;
    const formValue = this.slotForm.value;

    const slot = new Slot(
      formValue.slotID,
      formValue.timeSlotType,
      this.formatTimeForDB(formValue.startTime),
      this.formatTimeForDB(formValue.endTime),
      formValue.isActive,
      formValue.remarks
    );

    const operation = slot.slotID === 0
      ? this.slotService.addSlot(slot)
      : this.slotService.updateSlot(slot);

    operation.subscribe({
      next: () => {
        alert('Slot saved successfully!');
        this.loadSlots();
        this.closeModal();
        this.isSubmitting = false;
      },
      error: (err) => {
        this.handleError(err);
        this.isSubmitting = false;
      }
    });
  }

  private handleError(err: any) {
    if (err.status === 409) {
      alert('Error: A slot with the same type and timing already exists');
    }
    else if (err.status === 400) {
      alert('Error: ' + (err.error || 'Invalid data'));
    }
    else {
      alert('Error saving slot. Please try again.');
    }
    console.error('API Error:', err);
  }

  private formatTimeForDB(time: string): string {
    if (!time) return '00:00:00';

    if (/^\d{2}:\d{2}:\d{2}$/.test(time)) return time;

    const [hours, minutes] = time.split(':');
    return `${hours}:${minutes}:00`;
  }

  selectedSlot: Slot | null = null;

  onDetails(slot: Slot): void {
    this.selectedSlot = slot;
    this.detailsModal.nativeElement.style.display = 'block';
  }

  closeDetailsModal(): void {
    this.detailsModal.nativeElement.style.display = 'none';
    this.selectedSlot = null;
  }

  toggleSlotStatus(slot: Slot): void {
    this.slotService.toggleSlotStatus(slot.slotID, !slot.isActive).subscribe({
      next: () => this.loadSlots(),
      error: (err) => console.error('Error toggling slot status:', err)
    });
  }

  calculateDuration(startTime: string, endTime: string): string {
    if (!startTime || !endTime) return 'N/A';

    try {
      // Parse times (assuming format is HH:MM or HH:MM:SS)
      const [startHours, startMinutes] = startTime.split(':').map(Number);
      const [endHours, endMinutes] = endTime.split(':').map(Number);

      // Calculate total minutes
      const startTotal = startHours * 60 + startMinutes;
      const endTotal = endHours * 60 + endMinutes;

      // Handle overnight case (end time is next day)
      const durationMinutes = endTotal >= startTotal
        ? endTotal - startTotal
        : (1440 - startTotal) + endTotal; // 1440 minutes in a day

      // Convert to hours and minutes
      const hours = Math.floor(durationMinutes / 60);
      const minutes = durationMinutes % 60;

      // Format the output
      if (hours > 0 && minutes > 0) {
        return `${hours}h ${minutes}m`;
      } else if (hours > 0) {
        return `${hours}h`;
      } else {
        return `${minutes}m`;
      }
    } catch {
      return 'Invalid';
    }
  }
}
