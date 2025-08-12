import { Component, ElementRef, OnInit, ViewChild, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule, FormArray } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TraineeAttendanceService } from '../../Services/traineeattendance.service';
import { BatchDetail, TraineeDetail } from '../../Models/traineeattendance';
import { BatchService } from '../../Services/batch.service';
import { Batch } from '../../Models/batch';

@Component({
  selector: 'app-trainee-attendance',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './traineeattendance.component.html',
  styleUrl: './traineeattendance.component.css'
})
export class TraineeAttendanceComponent implements OnInit {
  @ViewChild('myModal') modal!: ElementRef;
  selectedBatchId = 0;
  selectedBatchDetails?: BatchDetail;
  traineeList: TraineeDetail[] = [];
  batchList: Batch[] = [];

  attendanceForm: FormGroup;
  isSubmitting = false;
  attendanceList: any[] = [];
  selectedAttendance: any = null;
  isEditMode = false;

  private fb = inject(FormBuilder);
  private service = inject(TraineeAttendanceService);

  constructor(private batchService: BatchService) {
    this.attendanceForm = this.fb.group({
      attendanceDate: [new Date().toISOString().substring(0, 10)],
      batchId: [0],
      instructorId: [0],
      traineeAttendanceDetails: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.getBatches();
    this.loadAttendances();
  }

  loadAttendances() {
    this.service.getAllAttendances().subscribe({
      next: (res) => {
        this.attendanceList = res;
      },
      error: (err) => {
        console.error('Error loading attendances', err);
      }
    });
  }

  viewDetails(id: number) {
    this.service.getAttendanceDetails(id).subscribe({
      next: (res) => {
        this.selectedAttendance = res;
        this.openModal();
      },
      error: (err) => {
        console.error('Error loading attendance details', err);
      }
    });
  }

  editAttendance(id: number) {
    this.isEditMode = true;
    this.service.getAttendanceDetails(id).subscribe({
      next: (res) => {
        this.selectedAttendance = res;
        this.attendanceForm.patchValue({
          attendanceDate: res.attendanceDate.substring(0, 10),
          batchId: res.batchId,
          instructorId: res.instructorId
        });

        // Load batch details to get trainee information
        this.service.getBatchDetails(res.batchId).subscribe(batchDetails => {
          this.selectedBatchDetails = batchDetails;

          // Create form array for attendance details
          const detailsArray = this.fb.array(
            res.traineeAttendanceDetails.map((d: any) => {
              // Find the matching trainee from batch details
              const trainee = batchDetails.trainees.find(t => t.traineeId === d.traineeId);

              return this.fb.group({
                traineeAttendanceDetailId: [d.traineeAttendanceDetailId],
                traineeId: [d.traineeId],
                admissionId: [d.admissionId],
                invoiceId: [d.invoiceId],
                attendanceStatus: [d.attendanceStatus],
                remarks: [d.remarks],
                // Store trainee details for display
                _traineeName: [trainee?.traineeName || ''],
                _admissionNo: [trainee?.admissionNo || ''],
                _invoiceNo: [trainee?.invoiceNos?.[0]?.invoiceNo || 'N/A']
              });
            })
          );

          this.attendanceForm.setControl('traineeAttendanceDetails', detailsArray);
          this.openModal();
        });
      },
      error: (err) => {
        console.error('Error loading attendance for edit', err);
      }
    });
  }


  deleteAttendance(id: number) {
    if (confirm('Are you sure you want to delete this attendance record?')) {
      this.service.deleteAttendance(id).subscribe({
        next: () => {
          this.loadAttendances();
          alert('Attendance deleted successfully!');
        },
        error: (err) => {
          console.error('Error deleting attendance', err);
          alert('Failed to delete attendance!');
        }
      });
    }
  }
  getPresentCount(attendance: any): number {
    if (!attendance.traineeAttendanceDetails) return 0;
    return attendance.traineeAttendanceDetails.filter((d: any) => d.attendanceStatus).length;
  }

  getAbsentCount(attendance: any): number {
    if (!attendance.traineeAttendanceDetails) return 0;
    return attendance.traineeAttendanceDetails.filter((d: any) => !d.attendanceStatus).length;
  }

  getBatches() {
    this.batchService.getAllBatches().subscribe({
      next: (res) => {
        this.batchList = res;
      },
      error: (err) => {
        console.error('Error loading batches', err);
      }
    });
  }

  get traineeFormArray() {
    return this.attendanceForm.get('traineeAttendanceDetails') as FormArray;
  }
  get trainees() {
    return this.selectedBatchDetails?.trainees ?? [];
  }


  //onBatchSelect() {
  //  const batchId = this.attendanceForm.value.batchId;
  //  if (!batchId) return;

  //  this.service.getBatchDetails(batchId).subscribe({
  //    next: (res) => {
  //      this.selectedBatchDetails = res;
  //      this.attendanceForm.patchValue({
  //        instructorId: res.instructorId
  //      });

  //      const traineeArray = this.fb.array(
  //        res.trainees.map(t => this.fb.group({
  //          traineeId: [t.traineeId],
  //          admissionId: [t.admissionId],
  //          invoiceId: [t.invoiceNos?.[0]?.invoiceId || null],
  //          attendanceStatus: [false],
  //          remarks: ['']
  //        }))
  //      );

  //      this.attendanceForm.setControl('traineeAttendanceDetails', traineeArray);

  //    }
  //  });
  //}


  onBatchSelect() {
    const batchId = this.attendanceForm.value.batchId;
    if (!batchId) return;

    this.service.getBatchDetails(batchId).subscribe({
      next: (res) => {
        this.selectedBatchDetails = res;
        this.attendanceForm.patchValue({
          instructorId: res.instructorId
        });

        const traineeArray = this.fb.array(
          res.trainees.map(t => this.fb.group({
            traineeId: [t.traineeId],
            admissionId: [t.admissionId],
            invoiceId: [t.invoiceNos?.[0]?.invoiceId || null],
            attendanceStatus: [false],
            remarks: [''],
            // Store trainee details for display
            _traineeName: [t.traineeName || ''],
            _admissionNo: [t.admissionNo || ''],
            _invoiceNo: [t.invoiceNos?.[0]?.invoiceNo || 'N/A']
          }))
        );

        this.attendanceForm.setControl('traineeAttendanceDetails', traineeArray);
      }
    });
  }

  saveAttendance() {
    if (this.isEditMode) {
      this.updateAttendance();
    } else {
      this.createAttendance();
    }
  }

  //createAttendance() {
  //  const data = {
  //    attendanceDate: this.attendanceForm.value.attendanceDate,
  //    batchId: this.attendanceForm.value.batchId,
  //    instructorId: this.attendanceForm.value.instructorId,
  //    traineeAttendanceDetails: this.attendanceForm.value.traineeAttendanceDetails
  //  };

  //  this.isSubmitting = true;
  //  this.service.saveAttendance(data).subscribe({
  //    next: () => {
  //      alert('Attendance saved successfully!');
  //      this.isSubmitting = false;
  //      this.closeModal();
  //      this.loadAttendances();
  //    },
  //    error: (err) => {
  //      alert('Failed to save attendance!');
  //      this.isSubmitting = false;
  //    }
  //  });
  //}

  //updateAttendance() {
  //  const data = {
  //    attendanceDate: this.attendanceForm.value.attendanceDate,
  //    batchId: this.attendanceForm.value.batchId,
  //    instructorId: this.attendanceForm.value.instructorId,
  //    traineeAttendanceDetails: this.attendanceForm.value.traineeAttendanceDetails
  //  };

  //  this.isSubmitting = true;
  //  this.service.updateAttendance(this.selectedAttendance.TraineeAttendanceId, data).subscribe({
  //    next: () => {
  //      alert('Attendance updated successfully!');
  //      this.isSubmitting = false;
  //      this.closeModal();
  //      this.loadAttendances();
  //    },
  //    error: (err) => {
  //      alert('Failed to update attendance!');
  //      this.isSubmitting = false;
  //    }
  //  });
  //}

  createAttendance() {
    const formValue = this.attendanceForm.value;
    const data = {
      attendanceDate: formValue.attendanceDate,
      batchId: formValue.batchId,
      instructorId: formValue.instructorId,
      traineeAttendanceDetails: formValue.traineeAttendanceDetails.map((d: any) => ({
        traineeId: d.traineeId,
        admissionId: d.admissionId,
        invoiceId: d.invoiceId,
        attendanceStatus: d.attendanceStatus,
        remarks: d.remarks
      }))
    };

    this.isSubmitting = true;
    this.service.saveAttendance(data).subscribe({
      next: () => {
        alert('Attendance saved successfully!');
        this.isSubmitting = false;
        this.closeModal();
        this.loadAttendances();
      },
      error: (err) => {
        alert('Failed to save attendance!');
        this.isSubmitting = false;
      }
    });
  }

  // In your component
  updateAttendance() {
    if (!this.selectedAttendance) return;

    const formValue = this.attendanceForm.value;

    this.isSubmitting = true;
    this.service.updateAttendance(
      this.selectedAttendance.traineeAttendanceId,
      {
        attendanceDate: formValue.attendanceDate,
        batchId: formValue.batchId,
        instructorId: formValue.instructorId,
        traineeAttendanceDetails: formValue.traineeAttendanceDetails
      }
    ).subscribe({
      next: () => {
        alert('Attendance updated successfully!');
        this.isSubmitting = false;
        this.closeModal();
        this.loadAttendances();
      },
      error: (err) => {
        console.error('Update error:', err);
        if (err.error) {
          console.error('Server response:', err.error);
          alert(`Error: ${err.status}\n${JSON.stringify(err.error, null, 2)}`);
        } else {
          alert('Failed to update attendance!');
        }
        this.isSubmitting = false;
      }
    });
  }

  closeModal() {
    if (this.modal) {
      this.modal.nativeElement.style.display = 'none';
    }
    this.attendanceForm.reset({
      attendanceDate: new Date().toISOString().substring(0, 10),
      batchId: 0,
      instructorId: 0
    });
    this.attendanceForm.setControl('traineeAttendanceDetails', this.fb.array([]));
    this.selectedAttendance = null;
    this.isEditMode = false;
    this.selectedBatchDetails = undefined;
  }


  openModal() {
    if (this.modal) {
      this.modal.nativeElement.style.display = 'block';
    }
  }


}
