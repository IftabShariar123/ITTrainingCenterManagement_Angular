//import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
//import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
//import { Designation } from '../../Models/designation';
//import { DesignationService } from '../../Services/designation.service';
//import { CommonModule } from '@angular/common';

//@Component({
//  selector: 'app-designation',
//  standalone: true,
//  imports: [ReactiveFormsModule, CommonModule],
//  templateUrl: './designation.component.html',
//  styleUrl: './designation.component.css'
//})
//export class DesignationComponent implements OnInit {
//  @ViewChild('myModal') model: ElementRef | undefined;
//  @ViewChild('detailsModal') detailsModal: ElementRef | undefined;

//  designationList: Designation[] = [];
//  paginatedDesignations: Designation[] = [];
//  designationForm: FormGroup = new FormGroup({});
//  selectedDesignation: Designation | null = null;

//  isSubmitting = false;

//  // Pagination variables
//  currentPage: number = 1;
//  itemsPerPage: number = 5;
//  totalItems: number = 0;
//  totalPages: number = 0;
//  pageNumbers: number[] = [];

//  //designationService = inject(DesignationService);

//  constructor(
//    private fb: FormBuilder,
//    private designationService: DesignationService
//  ) {
//    this.designationForm = this.fb.group({
//      designationId: [0],
//      designationName: ['', [Validators.required]],
//      jobRoles: [''],
//      remarks: [null],
//      isActive: [true, [Validators.required]]
//    });
//  }
//  ngOnInit(): void {
//    this.setFormState();
//    this.getDesignations();
//    this.loadDesignations();
//  }

//  loadDesignations() {
//    this.designationService.getAllDesignations().subscribe({
//      next: (res) => {
//        this.designationList = res;
//        this.updatePagination();
//      },
//      error: (err) => console.error('Error loading designations:', err)
//    });
//  }

//  openModal() {
//    const modal = document.getElementById('myModal');
//    if (modal != null) {
//      modal.style.display = 'block';
//    }
//  }

//  closeModal() {
//    this.setFormState();
//    if (this.model != null) {
//      this.model.nativeElement.style.display = 'none';
//    }
//  }

//  getDesignations() {
//    this.designationService.getAllDesignations().subscribe((res) => {
//      this.designationList = res;
//      this.totalItems = res.length;
//      this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
//      this.generatePageNumbers();
//      this.paginateDesignations();
//    });
//  }

//  setFormState() {
//    this.designationForm = this.fb.group({
//      designationId: [0],
//      designationName: ['', [Validators.required]],
//      jobRoles: [''],
//      remarks: [null],
//      isActive: [true, [Validators.required]]
//    });
//  }

//  onSubmit() {
//    if (this.designationForm.invalid || this.isSubmitting) return;

//    this.isSubmitting = true;
//    const formData = this.designationForm.value;
//    const operation = formData.designationId === 0
//      ? this.designationService.addDesignation(formData)
//      : this.designationService.updateDesignation(formData);

//    operation.subscribe({
//      next: () => {
//        this.handleSuccess(formData.designationId === 0 ? 'added' : 'updated');
//      },
//      error: (err) => {
//        this.handleError(err, formData.designationId === 0 ? 'add' : 'update');
//      }
//    });
//  }

//  private handleSuccess(action: string) {
//    alert(`Designation ${action} successfully!`);
//    this.loadDesignations();
//    this.resetForm();
//    this.isSubmitting = false;
//  }

//  private handleError(err: any, action: string) {
//    const errorMessage = err.status === 409
//      ? `Designation '${this.designationForm.value.designationName}' already exists!`
//      : `Error ${action}ing designation. Please try again.`;

//    alert(errorMessage);
//    this.isSubmitting = false;
//  }

//  private resetForm() {
//    this.designationForm.reset({
//      designationId: 0,
//      designationName: '',
//      jobRoles: '',
//      remarks: [null],
//      isActive: true
//    });
//    this.closeModal();
//  }


//  onEdit(designation: Designation) {
//    this.openModal();
//    this.designationForm.patchValue({
//      designationId: designation.designationId,
//      designationName: designation.designationName,
//      jobRoles: designation.jobRoles,
//      isActive: designation.isActive,
//      remarks: designation.remarks

//    });
//  }

//  onDelete(designation: Designation) {
//    const isConfirm = confirm("Are you sure you want to delete this Designation " + designation.designationName);
//    if (isConfirm) {
//      this.designationService.deleteDesignation(designation.designationId).subscribe({
//        next: () => {
//          alert('Designation deleted successfully');
//          this.getDesignations();
//        },
//        error: (err) => {
//          console.error('Error deleting designation:', err);
//          alert('Error deleting designation');
//        }
//      });
//    }
//  }

//  viewDetails(designation: Designation) {
//    this.selectedDesignation = designation;
//    if (this.detailsModal) {
//      this.detailsModal.nativeElement.style.display = 'block';
//    }
//  }

//  closeDetailsModal() {
//    this.selectedDesignation = null;
//    if (this.detailsModal) {
//      this.detailsModal.nativeElement.style.display = 'none';
//    }
//  }

//  updatePagination() {
//    this.totalItems = this.designationList.length;
//    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
//    this.generatePageNumbers();
//    this.paginateDesignations();
//  }

//  // Pagination methods
//  paginateDesignations() {
//    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
//    const endIndex = startIndex + this.itemsPerPage;
//    this.paginatedDesignations = this.designationList.slice(startIndex, endIndex);
//  }

//  changePage(page: number) {
//    if (page < 1 || page > this.totalPages) return;
//    this.currentPage = page;
//    this.paginateDesignations();
//  }

//  generatePageNumbers() {
//    this.pageNumbers = [];
//    for (let i = 1; i <= this.totalPages; i++) {
//      this.pageNumbers.push(i);
//    }
//  }

//  onItemsPerPageChange(event: Event) {
//    const selectElement = event.target as HTMLSelectElement;
//    this.itemsPerPage = Number(selectElement.value);
//    this.currentPage = 1;
//    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
//    this.generatePageNumbers();
//    this.paginateDesignations();
//  }
//}

import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Designation } from '../../Models/designation';
import { DesignationService } from '../../Services/designation.service';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-designation',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormsModule, NgxPaginationModule],
  templateUrl: './designation.component.html',
  styleUrl: './designation.component.css'
})
export class DesignationComponent implements OnInit {
  @ViewChild('myModal') model: ElementRef | undefined;
  @ViewChild('detailsModal') detailsModal: ElementRef | undefined;

  designationList: Designation[] = [];
  filteredList: Designation[] = [];
  designationForm: FormGroup = new FormGroup({});
  selectedDesignation: Designation | null = null;
  isSubmitting = false;

  // Pagination properties
  p: number = 1;
  itemsPerPage: number = 5;
  searchText: string = '';
  searchBy: string = 'designationName'; // Default search field

  // Sorting properties
  sortColumn: string = 'designationName';
  sortDirection: 'asc' | 'desc' = 'asc';

  constructor(
    private fb: FormBuilder,
    private designationService: DesignationService
  ) {
    this.designationForm = this.fb.group({
      designationId: [0],
      designationName: ['', [Validators.required]],
      jobRoles: [''],
      remarks: [null],
      isActive: [true, [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.setFormState();
    this.getDesignations();
  }

  applyFilter() {
    if (!this.searchText) {
      this.filteredList = [...this.designationList];
      this.applySorting();
      return;
    }

    this.filteredList = this.designationList.filter(designation => {
      const searchField = designation[this.searchBy as keyof Designation];

      if (typeof searchField === 'string') {
        return searchField.toLowerCase().includes(this.searchText.toLowerCase());
      } else if (this.searchBy === 'isActive') {
        const statusText = designation.isActive ? 'active' : 'inactive';
        return statusText.includes(this.searchText.toLowerCase());
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
      let valA = a[this.sortColumn as keyof Designation];
      let valB = b[this.sortColumn as keyof Designation];

      // Handle boolean sorting for isActive
      if (this.sortColumn === 'isActive') {
        valA = a.isActive ? 'active' : 'inactive';
        valB = b.isActive ? 'active' : 'inactive';
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

      // Handle number/date comparison
      return this.sortDirection === 'asc'
        ? (valA > valB ? 1 : -1)
        : (valB > valA ? 1 : -1);
    });
  }

  getDesignations() {
    this.designationService.getAllDesignations().subscribe((res) => {
      this.designationList = res;
      this.filteredList = [...res];
      this.applySorting();
    });
  }

  setFormState() {
    this.designationForm = this.fb.group({
      designationId: [0],
      designationName: ['', [Validators.required]],
      jobRoles: [''],
      remarks: [null],
      isActive: [true, [Validators.required]]
    });
  }

  openModal() {
    const modal = document.getElementById('myModal');
    if (modal != null) {
      modal.style.display = 'block';
    }
  }

  closeModal() {
    this.setFormState();
    if (this.model != null) {
      this.model.nativeElement.style.display = 'none';
    }
  }

  onSubmit() {
    if (this.designationForm.invalid || this.isSubmitting) return;

    this.isSubmitting = true;
    const formData = this.designationForm.value;
    const operation = formData.designationId === 0
      ? this.designationService.addDesignation(formData)
      : this.designationService.updateDesignation(formData);

    operation.subscribe({
      next: () => {
        this.handleSuccess(formData.designationId === 0 ? 'added' : 'updated');
      },
      error: (err) => {
        this.handleError(err, formData.designationId === 0 ? 'add' : 'update');
      }
    });
  }

  private handleSuccess(action: string) {
    alert(`Designation ${action} successfully!`);
    this.getDesignations();
    this.resetForm();
    this.isSubmitting = false;
  }

  private handleError(err: any, action: string) {
    const errorMessage = err.status === 409
      ? `Designation '${this.designationForm.value.designationName}' already exists!`
      : `Error ${action}ing designation. Please try again.`;

    alert(errorMessage);
    this.isSubmitting = false;
  }

  private resetForm() {
    this.designationForm.reset({
      designationId: 0,
      designationName: '',
      jobRoles: '',
      remarks: [null],
      isActive: true
    });
    this.closeModal();
  }

  onEdit(designation: Designation) {
    this.openModal();
    this.designationForm.patchValue({
      designationId: designation.designationId,
      designationName: designation.designationName,
      jobRoles: designation.jobRoles,
      isActive: designation.isActive,
      remarks: designation.remarks
    });
  }

  onDelete(designation: Designation) {
    const isConfirm = confirm("Are you sure you want to delete this Designation " + designation.designationName);
    if (isConfirm) {
      this.designationService.deleteDesignation(designation.designationId).subscribe({
        next: () => {
          alert('Designation deleted successfully');
          this.getDesignations();
        },
        error: (err) => {
          console.error('Error deleting designation:', err);
          alert('Error deleting designation');
        }
      });
    }
  }

  viewDetails(designation: Designation) {
    this.selectedDesignation = designation;
    if (this.detailsModal) {
      this.detailsModal.nativeElement.style.display = 'block';
    }
  }

  closeDetailsModal() {
    this.selectedDesignation = null;
    if (this.detailsModal) {
      this.detailsModal.nativeElement.style.display = 'none';
    }
  }
}
