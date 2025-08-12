import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { CourseCombo } from '../../Models/course-combo';
import { CourseComboService } from '../../Services/coursecombo.service';
import { Course } from '../../Models/course';
import { CourseService } from '../../Services/course.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Observable, catchError, of, tap, lastValueFrom } from 'rxjs';
import { ChangeDetectorRef } from '@angular/core';
import { NgxPaginationModule } from 'ngx-pagination';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-course-combo',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, NgxPaginationModule],
  templateUrl: './coursecombo.component.html',
  styleUrls: ['./coursecombo.component.css']
})
export class CourseComboComponent implements OnInit {
  @ViewChild('comboModal') comboModal!: ElementRef;
  @ViewChild('detailsModal') detailsModal!: ElementRef;

  comboList: CourseCombo[] = [];
  filteredList: CourseCombo[] = [];
  courseList: Course[] = [];
  selectedCombo: CourseCombo | null = null;

  comboForm: FormGroup;
  isLoading = true;
  isSubmitting = false;

  // Pagination properties
  p: number = 1;
  itemsPerPage: number = 5;
  searchText: string = '';
  searchBy: string = 'comboName'; // Default search field

  // Sorting properties
  sortColumn: string = 'comboName';
  sortDirection: 'asc' | 'desc' = 'asc';

  constructor(
    private comboService: CourseComboService,
    private courseService: CourseService,
    private fb: FormBuilder,
    private cdRef: ChangeDetectorRef
  ) {
    this.comboForm = this.fb.group({
      courseComboId: [0],
      comboName: ['', Validators.required],
      selectedCourse: [''],
      selectedCourseIds: [[], [Validators.required, this.minSelectedCourses(2)]],      isActive: [true],
      remarks: ['']
    });
  }

  private minSelectedCourses(min: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (control.value && control.value.length >= min) {
        return null; // Validation passes
      }
      return { minSelected: { required: min, actual: control.value?.length || 0 } };
    };
  }

  ngOnInit(): void {
    this.isLoading = true;
    this.loadCourses().subscribe({
      complete: () => {
        this.loadCombos().subscribe({
          complete: () => {
            this.isLoading = false;
            this.filteredList = [...this.comboList];
            this.applySorting();
          },
          error: () => {
            this.isLoading = false;
          }
        });
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  applyFilter() {
    if (!this.searchText) {
      this.filteredList = [...this.comboList];
      this.applySorting();
      return;
    }

    this.filteredList = this.comboList.filter(combo => {
      const searchField = combo[this.searchBy as keyof CourseCombo];

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
      let valA = a[this.sortColumn as keyof CourseCombo];
      let valB = b[this.sortColumn as keyof CourseCombo];

      // Handle status sorting differently
      if (this.sortColumn === 'isActive') {
        valA = a.isActive ? 'Active' : 'Inactive';
        valB = b.isActive ? 'Active' : 'Inactive';
      }

      // Handle null/undefined values
      if (valA == null) return this.sortDirection === 'asc' ? 1 : -1;
      if (valB == null) return this.sortDirection === 'asc' ? -1 : 1;

      // Handle string comparison
      if (typeof valA === 'string' && typeof valB === 'string') {
        return this.sortDirection === 'asc'
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      }

      // Handle boolean comparison
      if (typeof valA === 'boolean' && typeof valB === 'boolean') {
        return this.sortDirection === 'asc'
          ? (valA === valB ? 0 : valA ? -1 : 1)
          : (valA === valB ? 0 : valA ? 1 : -1);
      }

      // Default comparison
      return this.sortDirection === 'asc'
        ? (valA > valB ? 1 : -1)
        : (valB > valA ? 1 : -1);
    });
  }

  // Rest of your existing methods remain the same...
  loadCombos(): Observable<CourseCombo[]> {
    return this.comboService.getAllCourseCombos().pipe(
      tap(combos => {
        this.comboList = combos;
        this.filteredList = [...this.comboList];
      }),
      catchError(error => {
        console.error('Error loading course combos:', error);
        return of([]);
      })
    );
  }

  loadCourses(): Observable<Course[]> {
    return this.courseService.getAllCourses().pipe(
      tap(courses => {
        this.courseList = courses;
      }),
      catchError(error => {
        console.error('Error loading courses:', error);
        return of([]);
      })
    );
  }

  refreshComboList(): void {
    this.isLoading = true;
    this.loadCombos().subscribe({
      complete: () => {
        this.isLoading = false;
        this.applyFilter();
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  openModal(): void {
    this.comboModal.nativeElement.style.display = 'block';
  }

  closeModal(): void {
    this.comboModal.nativeElement.style.display = 'none';
    this.comboForm.reset({
      courseComboId: 0,
      comboName: '',
      selectedCourse: '',
      selectedCourseIds: [],
      isActive: true,
      remarks: ''
    });
  }

  onEdit(combo: CourseCombo): void {
    const selectedCourses = combo.selectedCourse
      ? combo.selectedCourse.split(',').map(name => name.trim())
      : [];

    const selectedIds = this.courseList
      .filter(course => selectedCourses.includes(course.courseName))
      .map(course => course.courseId);

    this.comboForm.patchValue({
      ...combo,
      selectedCourseIds: selectedIds
    });
    this.openModal();
  }

  onDelete(combo: CourseCombo): void {
    if (confirm(`Delete course combo "${combo.comboName}"?`)) {
      this.comboService.deleteCourseCombo(combo.courseComboId).subscribe({
        next: () => {
          this.refreshComboList();
          this.cdRef.detectChanges();
        },
        error: (err) => console.error('Error deleting course combo:', err)
      });
    }
  }

  async isNameUnique(): Promise<boolean> {
    const comboName = this.comboForm.get('comboName')?.value;
    const currentId = this.comboForm.get('courseComboId')?.value || 0;

    try {
      const isUnique = await lastValueFrom(
        this.comboService.checkNameUnique(comboName, currentId)
      );
      return isUnique;
    } catch {
      return false;
    }
  }

  async onSubmit(): Promise<void> {
    if (this.comboForm.invalid || this.isSubmitting) return;

    // নাম ইউনিক কিনা চেক
    const isUnique = await this.isNameUnique();
    if (!isUnique) {
      alert('A combo with this name already exists');
      return;
    }
    this.isSubmitting = true;
    const formValue = this.comboForm.value;
    const selectedCourses = this.getSelectedCourseNames(formValue.selectedCourseIds);

    const combo: CourseCombo = {
      ...formValue,
      selectedCourse: selectedCourses
    };

    const operation = combo.courseComboId === 0
      ? this.comboService.addCourseCombo(combo)
      : this.comboService.updateCourseCombo(combo);

    operation.subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.loadCombos().subscribe(() => {
          this.closeModal();
        });
      },
      error: (err) => {
        this.isSubmitting = false;
        console.error('Error saving course combo:', err);
      }
    });
  }

  onDetails(combo: CourseCombo): void {
    this.selectedCombo = combo;
    this.detailsModal.nativeElement.style.display = 'block';
  }

  closeDetailsModal(): void {
    this.detailsModal.nativeElement.style.display = 'none';
    this.selectedCombo = null;
  }

  getSelectedCourseNames(courseIds: number[]): string {
    return this.courseList
      .filter(c => courseIds.includes(c.courseId))
      .map(c => c.courseName)
      .join(', ');
  }

  isCourseSelected(courseId: number): boolean {
    return this.comboForm.get('selectedCourseIds')?.value.includes(courseId);
  }

  onCourseCheckboxChange(event: any, courseId: number): void {
    const checked = event.target.checked;
    const current = this.comboForm.value.selectedCourseIds || [];

    const updated = checked
      ? [...current, courseId]
      : current.filter((id: number) => id !== courseId);

    this.comboForm.patchValue({
      selectedCourseIds: updated,
      selectedCourse: this.getSelectedCourseNames(updated)
    });
  }

  private handleError(err: any) {
    if (err.status === 409) {
      alert('Error: A combo with this name already exists');
    }
    else if (err.status === 400) {
      alert('Error: ' + (err.error || 'Invalid data'));
    }
    else {
      alert('Error saving combo. Please try again.');
    }
  }
}
