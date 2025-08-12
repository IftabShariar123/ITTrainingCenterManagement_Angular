import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Department } from '../../Models/department';
import { DepartmentService } from '../../Services/department.service';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-department',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormsModule, NgxPaginationModule],
  templateUrl: './department.component.html',
  styleUrls: ['./department.component.css']
})
export class DepartmentComponent implements OnInit {
  @ViewChild('myModal') model?: ElementRef;
  @ViewChild('detailsModal') detailsModal?: ElementRef;

  departmentList: Department[] = [];
  filteredList: Department[] = [];
  departmentForm: FormGroup;
  isSubmitting = false;
  selectedDepartment: Department | null = null;

  // Pagination properties
  p: number = 1;
  itemsPerPage: number = 5;
  searchText: string = '';
  searchBy: string = 'departmentName'; // Default search field

  // Sorting properties
  sortColumn: string = 'departmentName';
  sortDirection: 'asc' | 'desc' = 'asc';

  constructor(
    private fb: FormBuilder,
    private departmentService: DepartmentService
  ) {
    this.departmentForm = this.fb.group({
      departmentId: [0],
      departmentName: ['', [Validators.required]],
      remarks: [''],
      isActive: [true, [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.loadDepartments();
  }

  

  loadDepartments() {
    this.departmentService.getAllDepartments().subscribe({
      next: (res) => {
        this.departmentList = res;
        this.filteredList = [...res];
        this.applySorting();
      },
      error: (err) => {
        if (err.status === 403) {
          alert("🛑 You do not have permission to view departments.");
        } else {
          console.error('Error loading departments:', err);
          alert("❌ Error loading departments. Please try again later.");
        }
      }
    });
  }


  applyFilter() {
    if (!this.searchText) {
      this.filteredList = [...this.departmentList];
      this.applySorting();
      return;
    }

    this.filteredList = this.departmentList.filter(dept => {
      const searchField = dept[this.searchBy as keyof Department];

      if (typeof searchField === 'string') {
        return searchField.toLowerCase().includes(this.searchText.toLowerCase());
      }

      // Handle boolean fields like isActive
      if (typeof searchField === 'boolean') {
        return searchField.toString().toLowerCase().includes(this.searchText.toLowerCase());
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
      let valA = a[this.sortColumn as keyof Department];
      let valB = b[this.sortColumn as keyof Department];

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

      // Handle number/date comparison
      return this.sortDirection === 'asc'
        ? (valA > valB ? 1 : -1)
        : (valB > valA ? 1 : -1);
    });
  }

  onSubmit() {
    if (this.departmentForm.invalid || this.isSubmitting) return;

    this.isSubmitting = true;
    const formData = this.departmentForm.value;
    const operation = formData.departmentId === 0
      ? this.departmentService.addDepartment(formData)
      : this.departmentService.updateDepartment(formData);

    operation.subscribe({
      next: () => {
        this.handleSuccess(formData.departmentId === 0 ? 'added' : 'updated');
      },
      error: (err) => {
        this.handleError(err, formData.departmentId === 0 ? 'add' : 'update');
      }
    });
  }

  private handleSuccess(action: string) {
    alert(`Department ${action} successfully!`);
    this.loadDepartments();
    this.resetForm();
    this.isSubmitting = false;
  }

  private handleError(err: any, action: string) {
    let errorMessage = '';

    if (err.status === 403) {
      errorMessage = "🛑 You do not have permission to perform this action.";
    } else if (err.status === 409) {
      errorMessage = `Department '${this.departmentForm.value.departmentName}' already exists!`;
    } else {
      errorMessage = `Error ${action}ing department. Please try again.`;
    }

    alert(errorMessage);
    this.isSubmitting = false;
  }


  private resetForm() {
    this.departmentForm.reset({
      departmentId: 0,
      departmentName: '',
      remarks: '',
      isActive: true
    });
    this.closeModal();
  }

  // Modal controls
  openModal() {
    const modal = document.getElementById('myModal');
    if (modal != null) {
      modal.style.display = 'block';
    }
  }

  closeModal() {
    this.departmentForm.reset({
      departmentId: 0,
      departmentName: '',
      remarks: '',
      isActive: true
    });
    if (this.model != null) {
      this.model.nativeElement.style.display = 'none';
    }
  }

  // CRUD operations
  onEdit(department: Department) {
    this.departmentForm.patchValue(department);
    this.openModal();
  }

  onDelete(department: Department) {
    if (confirm(`Are you sure you want to delete ${department.departmentName}?`)) {
      this.departmentService.deleteDepartment(department.departmentId).subscribe({
        next: () => this.handleSuccess('deleted'),
        error: (err) => this.handleError(err, 'delete')
      });
    }
  }

  // Details modal
  onDetails(department: Department) {
    this.selectedDepartment = department;
    const modal = document.getElementById('detailsModal');
    if (modal) {
      modal.style.display = 'block';
    }
  }

  closeDetailsModal() {
    this.selectedDepartment = null;
    if (this.detailsModal) {
      this.detailsModal.nativeElement.style.display = 'none';
    }
  }
}
