import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Day } from '../../Models/day';
import { DayService } from '../../Services/day.service';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';

@Component({
  selector: 'app-day',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormsModule, NgxPaginationModule],
  templateUrl: './day.component.html',
  styleUrl: './day.component.css'
 
})
export class DayComponent implements OnInit {
  @ViewChild('myModal') model: ElementRef | undefined;
  dayList: Day[] = [];
  dayService = inject(DayService);
  dayForm: FormGroup = new FormGroup({});
  p: number = 1; // current page
  itemsPerPage: number = 5; // default per-page value
  searchText: string = '';
  filteredList: any[] = [];
  isSubmitting = false;


  constructor(private fb: FormBuilder) {
    this.dayForm = this.fb.group({
      dayId: [0],
      dayName: ['', [Validators.required]],
      isActive: [false, [Validators.required]]
    });
  }
  ngOnInit(): void {
    this.setFormState();
    this.getDays();
  }
  openModal() {
    const dayModal = document.getElementById('myModal');
    if (dayModal != null) {
      dayModal.style.display = 'block';
    }
  }

  closeModal() {
    this.setFormState();
    if (this.model != null) {
      this.model.nativeElement.style.display = 'none';
    }
  }
  getDays() {
    this.dayService.getAllDays().subscribe({
      next: (res) => {
        this.dayList = res;
        this.filteredList = [...this.dayList];
      },
      error: (err) => console.error('Error fetching days:', err)
    });
  }
  setFormState() {
    this.dayForm = this.fb.group({
      dayId: [0],
      dayName: ['', [Validators.required]],
        isActive: [false, [Validators.required]]
    });
  }
  formValues: any;
  onSubmit() {
    if (this.dayForm.invalid || this.isSubmitting) return;

    this.isSubmitting = true;
    const formData = this.dayForm.value;
    const operation = formData.dayId === 0
      ? this.dayService.addDay(formData)
      : this.dayService.updateDay(formData);

    operation.subscribe({
      next: (res) => {
        this.handleSuccess(formData.dayId === 0 ? 'added' : 'updated');
      },
      error: (err) => {
        this.handleError(err, formData.dayId === 0 ? 'add' : 'update');
      }
    });
  }

  private handleSuccess(action: string) {
    alert(`Day ${action} successfully!`);
    this.getDays();
    this.resetForm();
    this.isSubmitting = false;
  }

  private handleError(err: any, action: string) {
    const errorMessage = err.status === 409
      ? `Day '${this.dayForm.value.dayName}' already exists!`
      : `Error ${action}ing day. Please try again.`;

    alert(errorMessage);
    this.isSubmitting = false;
  }

  private resetForm() {
    this.dayForm.reset({
      dayId: 0,
      dayName: '',
      isActive: false
    });
    this.closeModal();
  }


  OnEdit(day: Day) {
    this.openModal();
    this.dayForm.patchValue(day);
  }
  onDelete(day: Day) {
    const isConfirm = confirm("Are you sure you want to delete this Day " + day.dayName);
    if (isConfirm) {
      this.dayService.deleteDay(day.dayId).subscribe((res) => {
        alert("Day Deleted Successfully");
        this.getDays();
      });
    }

  }

  @ViewChild('detailsModal') detailsModal!: ElementRef;
  selectedDay: Day | null = null;

  onDetails(day: Day) {
    this.selectedDay = day;
    const modal = document.getElementById('detailsModal');
    if (modal) {
      modal.style.display = 'block';
    }
  }

  closeDetailsModal() {
    this.selectedDay = null;
    if (this.detailsModal) {
      this.detailsModal.nativeElement.style.display = 'none';
    }
  }
}
