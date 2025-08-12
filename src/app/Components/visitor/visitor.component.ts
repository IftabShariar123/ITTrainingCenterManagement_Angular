import { Component, ElementRef, OnInit, ViewChild, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { VisitorService } from '../../Services/visitor.service';
import { Employee, Visitor } from '../../Models/visitor';
import { NgxPaginationModule } from 'ngx-pagination';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-visitor',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, NgxPaginationModule],
  templateUrl: './visitor.component.html',
  styleUrl: './visitor.component.css'
})
export class VisitorComponent implements OnInit {
  @ViewChild('visitorModal') visitorModalRef!: ElementRef;
  @ViewChild('visitorDetailsModal') visitorDetailsModalRef!: ElementRef;

  visitorForm!: FormGroup;
  visitorList: Visitor[] = [];
  filteredList: Visitor[] = [];
  employeeList: Employee[] = [];
  selectedVisitor: Visitor | null = null;
  isSubmitting = false;

  showCompanyNameField: boolean = false;
  showReferenceField: boolean = false;

  // Pagination properties
  p: number = 1;
  itemsPerPage: number = 5;
  searchText: string = '';
  searchBy: string = 'visitorName'; // Default search field

  // Sorting properties
  sortColumn: string = 'visitorName';
  sortDirection: 'asc' | 'desc' = 'asc';

  visitorService = inject(VisitorService);

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.initForm();
    this.getVisitors();
    this.getEmployees();
  }

  // Add these methods to handle dropdown changes
  onVisitorTypeChange() {
    const visitorType = this.visitorForm.get('visitorType')?.value;
    this.showCompanyNameField = visitorType === 'Organization';

    // Clear company name if not organization
    if (!this.showCompanyNameField) {
      this.visitorForm.patchValue({ companyName: null });
    }
  }

  onVisitorSourceChange() {
    const visitorSource = this.visitorForm.get('visitorSource')?.value;
    this.showReferenceField = visitorSource === 'Referral';

    // Clear reference if not referral
    if (!this.showReferenceField) {
      this.visitorForm.patchValue({ reference: null });
    }
  }

  applyFilter() {
    if (!this.searchText) {
      this.filteredList = [...this.visitorList];
      this.applySorting();
      return;
    }

    this.filteredList = this.visitorList.filter(visitor => {
      const searchField = visitor[this.searchBy as keyof Visitor];

      // Special handling for employee name
      if (this.searchBy === 'employeeId') {
        const empName = this.getEmployeeName(visitor.employeeId).toLowerCase();
        return empName.includes(this.searchText.toLowerCase());
      }

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
      let valA = a[this.sortColumn as keyof Visitor];
      let valB = b[this.sortColumn as keyof Visitor];

      // Special handling for employee name sorting
      if (this.sortColumn === 'employeeId') {
        valA = this.getEmployeeName(a.employeeId);
        valB = this.getEmployeeName(b.employeeId);
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

  initForm() {
    this.visitorForm = this.fb.group({
      visitorId: [0],
      visitorName: ['', Validators.required],
      contactNo: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      visitDateTime: [new Date().toISOString().substring(0, 16)],
      visitPurpose: ['', Validators.required],
      expectedCourse: [''],
      address: [''],
      educationLevel: [''],
      visitorType: [''],
      employeeComments: [''],
      employeeId: [0, Validators.required],
      visitorSource: ['', Validators.required],
      reference: [null],
      companyName: [null]
    });

    this.showCompanyNameField = false;
    this.showReferenceField = false;
  }

  getVisitors() {
    this.visitorService.getAllVisitors().subscribe(res => {
      this.visitorList = res;
      this.filteredList = [...res];
      this.applySorting();
    });
  }

  getEmployees() {
    this.visitorService.getEmployees().subscribe(res => {
      this.employeeList = res;
    });
  }

  getEmployeeName(id: number): string {
    const emp = this.employeeList.find(e => e.employeeId === id);
    return emp ? emp.employeeName : 'Unknown';
  }

  openVisitorModal() {
    this.visitorForm.reset();
    this.visitorForm.patchValue({ visitorId: 0, visitDateTime: new Date().toISOString().substring(0, 16) });
    this.visitorModalRef.nativeElement.style.display = 'block';
  }

  closeVisitorModal() {
    this.visitorModalRef.nativeElement.style.display = 'none';
  }

  onVisitorSubmit() {
    if (this.visitorForm.invalid || this.isSubmitting) {
      alert('Please fill all required fields.');
      return;
    }

    this.isSubmitting = true;
    const formData = this.visitorForm.value;

    if (formData.visitorId == 0) {
      this.visitorService.addVisitor(formData).subscribe({
        next: () => {
          alert('Visitor added successfully.');
          this.getVisitors();
          this.closeVisitorModal();
          this.isSubmitting = false;
        },
        error: () => {
          this.isSubmitting = false;
        }
      });
    } else {
      this.visitorService.updateVisitor(formData).subscribe({
        next: () => {
          alert('Visitor updated successfully.');
          this.getVisitors();
          this.closeVisitorModal();
          this.isSubmitting = false;
        },
        error: () => {
          this.isSubmitting = false;
        }
      });
    }
  }

  onVisitorEdit(visitor: Visitor) {
    this.visitorForm.patchValue({
      ...visitor,
      visitDateTime: this.formatDateForInput(visitor.visitDateTime)
    });

    // Set the visibility flags based on existing data
    this.showCompanyNameField = visitor.visitorType === 'Organization';
    this.showReferenceField = visitor.visitorSource === 'Referral';

    this.visitorModalRef.nativeElement.style.display = 'block';
  }


  formatDateForInput(date: string | Date): string {
    const dt = new Date(date);
    const offset = dt.getTimezoneOffset() * 60000;
    return new Date(dt.getTime() - offset).toISOString().substring(0, 16);
  }

  onVisitorDetails(visitor: Visitor) {
    this.selectedVisitor = visitor;
    this.visitorDetailsModalRef.nativeElement.style.display = 'block';
  }

  closeVisitorDetailsModal() {
    this.selectedVisitor = null;
    this.visitorDetailsModalRef.nativeElement.style.display = 'none';
  }


  onVisitorDelete(visitor: Visitor) {
    if (confirm(`Are you sure to delete visitor: ${visitor.visitorName}?`)) {
      this.visitorService.deleteVisitor(visitor.visitorId).subscribe({
        next: () => {
          alert('Visitor deleted successfully.');
          this.getVisitors();
        },
        error: (error) => {
          if (error.status === 400 && error.error.includes('related records')) {
            alert(error.error); // Show the specific error message from backend
          } else {
            alert("You can't delete this visitor because this visitor related with another records.");
          }
        }
      });
    }
  }
}
