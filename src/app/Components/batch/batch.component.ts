import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Batch, BatchDto } from '../../Models/batch';
import { BatchService } from '../../Services/batch.service';
import { Course } from '../../Models/course';
import { Instructor } from '../../Models/instructor';
import { ClassRoom } from '../../Models/classroom';
import { ClassSchedule } from '../../Models/class-schedule';
import { CourseService } from '../../Services/course.service';
import { InstructorService } from '../../Services/instructor.service';
import { ClassRoomService } from '../../Services/classroom.service';
import { ClassScheduleService } from '../../Services/class-schedule.service';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ReactiveFormsModule } from '@angular/forms';
import { Day } from '../../Models/day';
import { NgxPaginationModule } from 'ngx-pagination';

@Component({
  selector: 'app-batch',
  standalone: true,
  imports: [CommonModule, FormsModule, MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatCheckboxModule,
    ReactiveFormsModule,
    NgxPaginationModule],
  templateUrl: './batch.component.html',
  styleUrls: ['./batch.component.css']
})
export class BatchComponent implements OnInit {
  days: Day[] = [];
  batches: BatchDto[] = [];
  displayedColumns: string[] = [
    'batchName',
    'courseName',
    'startDate',
    'endDate',
    'batchType',
    'employeeName',
    'classRoomName',
    'isActive',
    'actions'
  ];

  // Form related properties
  batchForm: FormGroup;
  showForm = false;
  isEditMode = false;
  currentBatchId?: number;
  private originalCourseId?: number;
  showDetailsModal = false;
  selectedBatch: BatchDto | null = null;
  showAlert = false;
  alertMessage = '';
  alertType: 'success' | 'danger' = 'success';
  courses: Course[] = [];
  //instructors: Instructor[] = [];
  filteredInstructors: Instructor[] = [];
  classrooms: ClassRoom[] = [];
  schedules: ClassSchedule[] = [];
  batchTypes = ['Regular', 'Weekend', 'Online'];
  selectedSchedules: ClassSchedule[] = [];
  p: number = 1; // current page for pagination
  itemsPerPage: number = 5; // default page size
  allInstructors: Instructor[] = [];


  constructor(
    private batchService: BatchService,
    private courseService: CourseService,
    private instructorService: InstructorService,
    private classroomService: ClassRoomService,
    private scheduleService: ClassScheduleService,
    private fb: FormBuilder,
    private dialog: MatDialog
  ) {
    this.batchForm = this.fb.group({
      batchName: ['', Validators.required],
      courseId: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: [''],
      batchType: ['', Validators.required],
      instructorId: ['', Validators.required],
      classRoomId: ['', Validators.required],
      isActive: [true],
      remarks: [''],
      selectedScheduleIds: [[]],
      previousInstructorIds: [[]]
    });
  }

  ngOnInit(): void {
    this.loadBatches();
    this.loadDropdowns();
    this.loadInstructors();
  }
  

  private showAlertMessage(message: string, type: 'success' | 'danger') {
    this.alertMessage = message;
    this.alertType = type;
    this.showAlert = true;

    // Auto hide after 3 seconds
    setTimeout(() => {
      this.showAlert = false;
    }, 3000);
  }

  loadInstructors(): void {
    this.instructorService.getAllInstructors().subscribe({
      next: (instructors) => {
        this.filteredInstructors = instructors.filter(instructor =>
          // Only include instructors with some name available
          instructor.employeeName || instructor.employee?.employeeName
        );
      },
      error: (err) => console.error('Error loading instructors', err)
    });
  }

  // Helper method to get display name
  getInstructorDisplayName(instructor: Instructor): string {
    return instructor.employeeName || instructor.employee?.employeeName || '';
  }

  loadBatches(): void {
    this.batchService.getBatches().subscribe(batches => {
      this.batches = batches;
    });
  }

  loadDropdowns(): void {
    this.courseService.getAllCourses().subscribe(courses => this.courses = courses);
    //this.instructorService.getAllInstructors().subscribe(instructors => this.instructors = instructors);
    this.classroomService.getAllClassRooms().subscribe(classrooms => this.classrooms = classrooms);
    this.scheduleService.getSchedules().subscribe(schedules => this.schedules = schedules);
  }

  showAddForm(): void {
    this.isEditMode = false;
    this.currentBatchId = undefined;
    this.selectedSchedules = [];
    this.batchForm.reset({
      isActive: true,
      selectedScheduleIds: []
    });
    this.showForm = true;
  }


  


  showEditForm(batch: BatchDto): void {
    this.isEditMode = true;
    this.currentBatchId = batch.batchId;
    this.originalCourseId = batch.courseId;
    // Load course first to filter instructors
    this.filterInstructorsByCourse(batch.courseId);
    //this.updateBatchNameDisplay(batch.courseId);

    this.selectedSchedules = [];
    if (batch.selectedScheduleIds?.length) {
      this.selectedSchedules = this.schedules.filter(s =>
        batch.selectedScheduleIds.includes(s.classScheduleId)
      );
    }

    // Format dates for the form
    const formattedStartDate = this.formatDateForInput(batch.startDate);
    const formattedEndDate = batch.endDate ? this.formatDateForInput(batch.endDate) : '';

    // Load existing previous instructors
    const existingPreviousInstructors = batch.previousInstructorIds || [];

    this.batchForm.patchValue({
      batchName: batch.batchName, // Keep original stored name
      courseId: batch.courseId,
      startDate: formattedStartDate,
      endDate: formattedEndDate,
      batchType: batch.batchType,
      instructorId: batch.instructorId,
      classRoomId: batch.classRoomId,
      isActive: batch.isActive,
      remarks: batch.remarks,
      selectedScheduleIds: batch.selectedScheduleIds,
      previousInstructorIds: existingPreviousInstructors
    });

    // Add a temporary display name field
    this.updateDisplayName(batch.courseId);
    this.showForm = true;
  }

  private updateDisplayName(courseId: number): void {
    const course = this.courses.find(c => c.courseId === courseId);
    if (course) {
      // This is just for display, won't affect the saved value
      const displayName = `${course.courseName}-${this.batchForm.value.batchName.split('-')[1]}`;
      this.batchForm.get('batchName')?.setValue(displayName);
    }
  }


  

  // Add this helper method to format dates for the input field
  private formatDateForInput(date: Date | string): string {
    if (!date) return '';

    const d = new Date(date);
    const year = d.getFullYear();
    const month = ('0' + (d.getMonth() + 1)).slice(-2);
    const day = ('0' + d.getDate()).slice(-2);

    return `${year}-${month}-${day}`;
  }

  cancelForm(): void {
    this.showForm = false;
    this.batchForm.reset();
  }
   



  //onSubmit(): void {
  //  if (this.batchForm.invalid) return;

  //  const formValue = this.batchForm.value;
  //  let batchName = formValue.batchName;

  //  if (this.isEditMode && this.currentBatchId) {
  //    const originalBatch = this.batches.find(b => b.batchId === this.currentBatchId);
  //    batchName = originalBatch?.batchName || formValue.batchName;
  //  }

  //  const batchData: Batch = {
  //    ...formValue,
  //    batchName: formValue.batchName,
  //    batchId: this.currentBatchId,
  //    startDate: new Date(formValue.startDate),
  //    endDate: formValue.endDate ? new Date(formValue.endDate) : null,
  //    previousInstructorIds: formValue.previousInstructorIds || []
  //  };

  //  const operation = this.isEditMode && this.currentBatchId
  //    ? this.batchService.updateBatch(this.currentBatchId, batchData)
  //    : this.batchService.createBatch(batchData);

  //  operation.subscribe({
  //    next: () => {
  //      const action = this.isEditMode ? 'updated' : 'created';
  //      this.showAlertMessage(`Batch ${action} successfully!`, 'success');
  //      this.loadBatches();
  //      this.showForm = false;
  //    },
  //    error: (err) => {
  //      console.error('Error saving batch:', err);
  //      this.showAlertMessage(`Failed to ${this.isEditMode ? 'update' : 'create'} batch!`, 'danger');
  //    }
  //  });
  //}


  onSubmit(): void {
    if (this.batchForm.invalid) return;

    const formValue = this.batchForm.value;
    let batchName = formValue.batchName;

    if (this.isEditMode && this.currentBatchId) {
      const originalBatch = this.batches.find(b => b.batchId === this.currentBatchId);
      batchName = originalBatch?.batchName || formValue.batchName;
    }

    const batchData: Batch = {
      ...formValue,
      batchName: formValue.batchName,
      batchId: this.currentBatchId,
      startDate: new Date(formValue.startDate),
      endDate: formValue.endDate ? new Date(formValue.endDate) : null,
      previousInstructorIds: formValue.previousInstructorIds || []
    };

    if (this.isEditMode && this.currentBatchId) {
      this.batchService.updateBatch(this.currentBatchId, batchData).subscribe({
        next: () => {
          this.showAlertMessage('Batch updated successfully!', 'success');
          this.loadBatches();
          this.showForm = false;
        },
        error: (err: any) => {
          console.error('Error updating batch:', err);
          this.showAlertMessage('Failed to update batch!', 'danger');
        }
      });
    } else {
      this.batchService.createBatch(batchData).subscribe({
        next: () => {
          this.showAlertMessage('Batch created successfully!', 'success');
          this.loadBatches();
          this.showForm = false;
        },
        error: (err: any) => {
          console.error('Error creating batch:', err);
          this.showAlertMessage('Failed to create batch!', 'danger');
        }
      });
    }
  }

  deleteBatch(id: number): void {
    if (confirm('Are you sure you want to delete this batch?')) {
      this.batchService.deleteBatch(id).subscribe({
        next: () => {
          this.showAlertMessage('Batch deleted successfully!', 'success');
          this.loadBatches();
        },
        error: (err) => {
          console.error('Error deleting batch:', err);
          this.showAlertMessage('Failed to delete batch!', 'danger');
        }
      });
    }
  }

  compareById(item1: any, item2: any): boolean {
    return item1 && item2 ? item1.id === item2.id : item1 === item2;
  }

  onScheduleSelect(event: any): void {
    const selectedId = +event.target.value;
    const schedule = this.schedules.find(s => s.classScheduleId === selectedId);

    if (schedule && !this.selectedSchedules.some(s => s.classScheduleId === selectedId)) {
      this.selectedSchedules.push(schedule);

      const currentIds = this.batchForm.get('selectedScheduleIds')?.value || [];
      this.batchForm.get('selectedScheduleIds')?.setValue([...currentIds, selectedId]);
    }

    // Reset dropdown
    event.target.value = '';
  }

  removeSchedule(scheduleId: number): void {
    this.selectedSchedules = this.selectedSchedules.filter(s => s.classScheduleId !== scheduleId);

    const currentIds = this.batchForm.get('selectedScheduleIds')?.value || [];
    this.batchForm.get('selectedScheduleIds')?.setValue(
      currentIds.filter((id: number) => id !== scheduleId)
    );
  }

  // Update your getScheduleDisplay method
  //getScheduleDisplay(schedule: ClassSchedule): string {

  //  const dayNames = schedule.selectedDays
  //    ? `(${schedule.selectedDays})`  // assuming selectedDays is already a comma-separated string
  //    : '(No days selected)';

  //  const times = schedule.slot
  //    ? `${schedule.slot.startTime} to ${schedule.slot.endTime}`
  //    : 'No time set';

  //  return `${dayNames} - ${times}`;
  //}

  getScheduleDisplay(schedule: ClassSchedule | number): string {
    // If it's a number (ID), find the corresponding schedule
    if (typeof schedule === 'number') {
      const foundSchedule = this.schedules.find(s => s.classScheduleId === schedule);
      if (!foundSchedule) return 'Schedule not found';
      schedule = foundSchedule;
    }

    const dayNames = schedule.selectedDays
      ? `(${schedule.selectedDays})`  // assuming selectedDays is already a comma-separated string
      : 'No days selected';

    const times = schedule.slot
      ? `${schedule.slot.startTime} to ${schedule.slot.endTime}`
      : 'No time set';

    return `${dayNames} - ${times}`;
  }

  getSelectedSchedulesDisplay(selectedScheduleIds: number[]): string {
    if (!selectedScheduleIds || selectedScheduleIds.length === 0) {
      return 'No schedules selected';
    }

    return selectedScheduleIds
      .map(id => this.getScheduleDisplay(id))
      .join('; ');
  }


  filterInstructorsByCourse(courseId: number): void {
    if (!courseId) {
      this.filteredInstructors = [];
      return;
    }

    this.courseService.getCourseWithInstructors(courseId).subscribe({
      next: (response) => {
        if (response && response.instructors) {
          // Map the API response to your instructor format
          this.filteredInstructors = response.instructors.map((instructor: any) => ({
            instructorId: instructor.instructorId,
            employeeName: instructor.employeeName,
            // Add other properties if needed
          }));
        } else {
          this.filteredInstructors = [];
        }

        // Reset instructor selection if current one is not in the filtered list
        const currentInstructorId = this.batchForm.get('instructorId')?.value;
        if (currentInstructorId && !this.filteredInstructors.some(i => i.instructorId === currentInstructorId)) {
          this.batchForm.get('instructorId')?.setValue(null);
        }
      },
      error: (err) => {
        console.error('Error loading course instructors', err);
        this.filteredInstructors = [];
      }
    });
  }

  



  onCourseSelect(): void {
    const courseId = this.batchForm.get('courseId')?.value;

    // Only generate name when in add mode
    if (!this.isEditMode && courseId) {
      this.batchService.generateBatchName(courseId).subscribe({
        next: (generatedName) => {
          this.batchForm.patchValue({
            batchName: generatedName
          });
        },
        error: (err) => {
          console.error('Error generating batch name', err);
          // Fallback to manual name
          const course = this.courses.find(c => c.courseId == courseId);
          if (course) {
            this.batchForm.patchValue({
              batchName: `${course.courseName}-01`
            });
          }
        }
      });
    }

    this.filterInstructorsByCourse(courseId);

    // Reset instructor if needed
    const currentInstructorId = this.batchForm.get('instructorId')?.value;
    if (currentInstructorId && !this.filteredInstructors.some(i => i.instructorId === currentInstructorId)) {
      this.batchForm.get('instructorId')?.setValue(null);
    }
  }


  getInstructorNames(instructorIds: number[]): string {
    if (!instructorIds?.length) return 'None';

    return instructorIds.map(id => {
      const instructor = [...this.filteredInstructors, ...this.allInstructors]
        .find(i => i.instructorId === id);
      return instructor?.employeeName || `Instructor #${id}`;
    }).join(', ');
  }

  

  onInstructorChange(): void {
    if (this.isEditMode && this.currentBatchId) {
      const newInstructorId = this.batchForm.get('instructorId')?.value;
      const originalBatch = this.batches.find(b => b.batchId === this.currentBatchId);

      if (!originalBatch) return;

      const currentInstructorBeforeChange = originalBatch.instructorId;
      const existingPrevious = this.batchForm.get('previousInstructorIds')?.value || [];

      if (newInstructorId && currentInstructorBeforeChange &&
        newInstructorId !== currentInstructorBeforeChange &&
        !existingPrevious.includes(currentInstructorBeforeChange)) {

        // Add to existing previous instructors
        this.batchForm.get('previousInstructorIds')?.setValue([
          ...existingPrevious,
          currentInstructorBeforeChange
        ]);
      }
    }
  }
  showDetails(batch: BatchDto): void {
    this.selectedBatch = batch;
    this.showDetailsModal = true;
  }

  closeDetails(): void {
    this.showDetailsModal = false;
    this.selectedBatch = null;
  }

}
