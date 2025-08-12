import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ClassScheduleService } from '../../Services/class-schedule.service';
import { ClassSchedule, Day, Slot, ClassScheduleDto } from '../../Models/class-schedule';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { DayService } from '../../Services/day.service';

@Component({
  selector: 'app-class-schedule',
  templateUrl: './class-schedule.component.html',
  styleUrls: ['./class-schedule.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatCheckboxModule,
    MatChipsModule,
    MatProgressBarModule
  ]
})
export class ClassScheduleComponent implements OnInit {
  // List properties
  schedules: ClassSchedule[] = [];
  days: Day[] = [];
  slots: Slot[] = [];
  isLoading = true;
  checkedDays: number[] = [];

  // Form properties
  scheduleForm: FormGroup;
  isFormVisible = false;
  isEditMode = false;
  currentScheduleId: number | null = null;

  constructor(
    private scheduleService: ClassScheduleService,
    private dayService: DayService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    this.scheduleForm = this.fb.group({
      scheduleDate: ['', Validators.required],
      slotId: ['', Validators.required],
      selectedDayIds: [[], Validators.required],
      isActive: [true]
    });
  }

  ngOnInit(): void {
    this.loadDropdownData(); // schedules will load from inside this
  }


  loadSchedules(): void {
    this.isLoading = true;
    this.scheduleService.getSchedules().subscribe({
      next: (data) => {
        this.schedules = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading schedules:', err);
        this.isLoading = false;
        this.showError('Failed to load schedules');
      }
    });
  }

  loadDropdownData(): void {
    this.dayService.getAllDayss().subscribe({
      next: (response: any) => {
        this.days = (response as any).data || [];
        console.log('Days loaded:', this.days);

        // Now load schedules after days are loaded
        this.loadSchedules();
      },
      error: (err) => {
        console.error('Error loading days:', err);
        this.days = [];
        this.loadSchedules(); // Still try to load schedules
      }
    });

    this.scheduleService.getSlots().subscribe({
      next: (data) => {
        this.slots = data;
      },
      error: (err) => {
        console.error('Error loading slots:', err);
        this.showError('Failed to load time slots');
      }
    });
  }


  showAddForm(): void {
    this.isFormVisible = true;
    this.isEditMode = false;
    this.currentScheduleId = null;
    this.scheduleForm.reset({ isActive: true });
  }

  

  cancelForm(): void {
    this.isFormVisible = false;
    this.scheduleForm.reset();
  }

  onSubmit(): void {
    if (this.scheduleForm.invalid) {
      return;
    }

    const formValue = this.scheduleForm.value;
    const scheduleData: ClassScheduleDto = {
      slotId: formValue.slotId,
      scheduleDate: formValue.scheduleDate,
      selectedDayIds: formValue.selectedDayIds,
      isActive: formValue.isActive
    };

    if (this.isEditMode && this.currentScheduleId) {
      this.updateSchedule(this.currentScheduleId, scheduleData);
    } else {
      this.createSchedule(scheduleData);
    }
  }

  createSchedule(scheduleData: ClassScheduleDto): void {
    this.scheduleService.createSchedule(scheduleData).subscribe({
      next: () => {
        this.showSuccess('Schedule created successfully');
        this.resetAfterSubmit();
      },
      error: (err) => {
        console.error('Error creating schedule:', err);
        this.showError('Failed to create schedule');
      }
    });
  }

  showEditForm(schedule: ClassSchedule): void {
    this.isFormVisible = true;
    this.isEditMode = true;
    this.currentScheduleId = schedule.classScheduleId;

    // Convert date to proper format (YYYY-MM-DD)
    const date = new Date(schedule.scheduleDate);
    const formattedDate = date.toISOString().split('T')[0];

    // First reset the form
    this.scheduleForm.reset({
      scheduleDate: formattedDate,
      slotId: schedule.slotId,
      selectedDayIds: schedule.selectedDayIds,
      isActive: schedule.isActive
    });

    // Then update checkedDays for checkboxes
    this.checkedDays = [...schedule.selectedDayIds];

    // Force change detection for checkboxes
    setTimeout(() => {
      this.scheduleForm.get('selectedDayIds')?.setValue([...schedule.selectedDayIds]);
    });

    this.openModal();
  }

  updateSchedule(id: number, scheduleData: ClassScheduleDto): void {
    this.scheduleService.updateSchedule(id, scheduleData).subscribe({
      next: () => {
        this.showSuccess('Schedule updated successfully');
        this.resetAfterSubmit();
      },
      error: (err) => {
        console.error('Error updating schedule:', err);
        this.showError('Failed to update schedule');
      }
    });
  }

  deleteSchedule(id: number): void {
    if (confirm('Are you sure you want to delete this schedule?')) {
      this.scheduleService.deleteSchedule(id).subscribe({
        next: () => {
          this.showSuccess('Schedule deleted successfully');
          this.loadSchedules();
        },
        error: (err) => {
          console.error('Error deleting schedule:', err);
          this.showError('Failed to delete schedule');
        }
      });
    }
  }

  resetAfterSubmit(): void {
    this.loadSchedules();
    this.closeModal();
    this.scheduleForm.reset({ isActive: true });
    //this.checkedDays = [];
    this.isFormVisible = false;
  //  this.scheduleForm.reset();
  }

  getDayNames(dayIds: number[]): string {
    if (!dayIds || dayIds.length === 0) return '';

    const numericDayIds = dayIds.map(id => +id); // Cast all to numbers

    return this.days
      .filter(day => numericDayIds.includes(day.dayId))
      .map(day => day.dayName)
      .join(', ');
  }


  getSlotTime(slotId: number): string {
    const slot = this.slots.find(s => s.slotID === slotId);
    return slot ? `${slot.startTime} - ${slot.endTime}` : '';
  }

  showSuccess(message: string): void {
    this.snackBar.open(message, 'Close', { duration: 3000 });
  }

  showError(message: string): void {
    this.snackBar.open(message, 'Close', { duration: 3000, panelClass: ['error-snackbar'] });
  }

  @ViewChild('scheduleModal') scheduleModal!: ElementRef;

 
  openModal() {
    if (this.scheduleModal) {
      this.scheduleModal.nativeElement.style.display = 'block';
    }
  }

  closeModal() {
    if (this.scheduleModal) {
      this.scheduleModal.nativeElement.style.display = 'none';
    }
    this.scheduleForm.reset();
  }  


  onCheckboxChange(event: any): void {
    const dayId = +event.target.value;
    const isChecked = event.target.checked;
    const selectedDays = this.scheduleForm.get('selectedDayIds')?.value || [];

    if (isChecked && !selectedDays.includes(dayId)) {
      selectedDays.push(dayId);
    } else if (!isChecked) {
      const index = selectedDays.indexOf(dayId);
      if (index >= 0) selectedDays.splice(index, 1);
    }

    this.scheduleForm.get('selectedDayIds')?.setValue(selectedDays);
    this.scheduleForm.get('selectedDayIds')?.markAsTouched();
  }

}
