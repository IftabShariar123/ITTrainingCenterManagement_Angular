import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Employee } from '../../Models/employee';
import { EmployeeService } from '../../Services/employee.service';
import { CommonModule } from '@angular/common';
import { DepartmentService } from '../../Services/department.service';
import { DesignationService } from '../../Services/designation.service';
import { Department } from '../../Models/department';
import { Designation } from '../../Models/designation';
//import { environment } from '../../../environments/environment.development';
import { environment } from '../../../environments/environment';


@Component({
  selector: 'app-employee',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './employee.component.html',
  styleUrl: './employee.component.css'
})
export class EmployeeComponent implements OnInit {
  @ViewChild('myModal') model: ElementRef | undefined;
  @ViewChild('detailsModal') detailsModal: ElementRef | undefined;
  @ViewChild('fileInput') fileInput!: ElementRef;
  @ViewChild('docInput') docInput!: ElementRef;


  environment = environment;
  employeeList: Employee[] = [];
  paginatedEmployees: Employee[] = [];
  employeeForm: FormGroup = new FormGroup({});
  employeeService = inject(EmployeeService);
  departmentService = inject(DepartmentService);
  designationService = inject(DesignationService);
  selectedEmployee: Employee | null = null;
  departments: Department[] = [];
  designations: Designation[] = [];
  imagePreview?: string;
  docPreview?: string;

  // Pagination variables
  currentPage: number = 1;
  itemsPerPage: number = 5;
  totalItems: number = 0;
  totalPages: number = 0;
  pageNumbers: number[] = [];

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.setFormState();
    this.getEmployees();
    this.getDepartments();
    this.getDesignations();
  }

  openModal() {
    const modal = document.getElementById('myModal');
    if (modal != null) {
      modal.style.display = 'block';
    }
  }

  closeModal() {
    this.setFormState();
    this.imagePreview = undefined;
    this.docPreview = undefined;
    if (this.model != null) {
      this.model.nativeElement.style.display = 'none';
    }
  }

  getEmployees() {
    this.employeeService.getAllEmployees().subscribe((res) => {
      this.employeeList = res;
      this.totalItems = res.length;
      this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
      this.generatePageNumbers();
      this.paginateEmployees();
    });
  }

  getDepartments() {
    this.departmentService.getAllDepartments().subscribe(res => {
      this.departments = res;
    });
  }

  getDesignations() {
    this.designationService.getAllDesignations().subscribe(res => {
      this.designations = res;
    });
  }

  setFormState() {
    this.employeeForm = this.fb.group({
      employeeId: [0],
      //employeeIDNo: ['', [Validators.required]],
      employeeName: ['', [Validators.required]],
      designationId: ['', [Validators.required]],
      departmentId: ['', [Validators.required]],
      contactNo: ['', [Validators.required]],
      dob: ['', [Validators.required]],
      joiningDate: ['', [Validators.required]],
      endDate: [''],
      emailAddress: ['', [Validators.required, Validators.email]],
      permanentAddress: ['', [Validators.required]],
      presentAddress: ['', [Validators.required]],
      fathersName: ['', [Validators.required]],
      mothersName: ['', [Validators.required]],
      birthOrNIDNo: ['', [Validators.required]],
      isAvailable: [true],
      isWillingToSell: [false],
      imageFile: [null],
      documentFile: [null],
      remarks: ['']
    });
  }

  onFileChange(event: Event, type: 'image' | 'document') {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      if (type === 'image') {
        this.employeeForm.patchValue({ imageFile: file });
        this.employeeForm.get('imageFile')?.updateValueAndValidity();

        // Create preview
        const reader = new FileReader();
        reader.onload = () => {
          this.imagePreview = reader.result as string;
        };
        reader.readAsDataURL(file);
      } else {
        this.employeeForm.patchValue({ documentFile: file });
        this.employeeForm.get('documentFile')?.updateValueAndValidity();

        // For documents, we'll just show the file name
        this.docPreview = file.name;
      }
    }
  }

  //onSubmit() {
  //  if (this.employeeForm.invalid) {
  //    alert('Please fill all required fields');
  //    return;
  //  }

  //  const formData = new FormData();
  //  const formValues = this.employeeForm.value;

  //  Object.keys(formValues).forEach(key => {
  //    if (key === 'employeeIDNo') return; // Skip this field

  //    if (key === 'imageFile' || key === 'documentFile') {
  //      if (formValues[key]) {
  //        formData.append(key, formValues[key]);
  //      }
  //    } else if (key === 'dob' || key === 'joiningDate') {
  //      const date = new Date(formValues[key]);
  //      const formattedDate = date.toISOString().split('T')[0];
  //      formData.append(key, formattedDate);
  //    } else {
  //      formData.append(key, formValues[key]);
  //    }
  //  });

  //  if (formValues.employeeId === 0) {
  //    this.employeeService.addEmployee(formData).subscribe({
  //      next: () => {
  //        alert('Employee added successfully');
  //        this.getEmployees();
  //        this.closeModal();
  //      },
  //      error: (err) => {
  //        console.error('Error adding employee:', err);
  //        alert('Error adding employee');
  //      }
  //    });
  //  } else {
  //    this.employeeService.updateEmployee(formValues.employeeId, formData).subscribe({
  //      next: () => {
  //        alert('Employee updated successfully');
  //        this.getEmployees();
  //        this.closeModal();
  //      },
  //      error: (err) => {
  //        console.error('Error updating employee:', err);
  //        alert('Error updating employee');
  //      }
  //    });
  //  }
  //}


  onSubmit() {
    if (this.employeeForm.invalid) {
      alert('Please fill all required fields');
      return;
    }

    const formData = new FormData();
    const formValues = this.employeeForm.value;

    Object.keys(formValues).forEach(key => {
      if (key === 'employeeIDNo') return;

      if (key === 'imageFile' || key === 'documentFile') {
        if (formValues[key]) {
          formData.append(key, formValues[key]);
        }
      } else if (key === 'dob' || key === 'joiningDate' || key === 'endDate') {
        // Only add date if it exists (especially for endDate)
        if (formValues[key]) {
          const date = new Date(formValues[key]);
          const formattedDate = date.toISOString().split('T')[0];
          formData.append(key, formattedDate);
        }
      } else {
        formData.append(key, formValues[key]);
      }
    });

    if (formValues.employeeId === 0) {
      this.employeeService.addEmployee(formData).subscribe({
        next: () => {
          alert('Employee added successfully');
          this.getEmployees();
          this.closeModal();
        },
        error: (err) => {
          console.error('Error adding employee:', err);
          alert('Error adding employee: ' + err.message);
        }
      });
    } else {
      this.employeeService.updateEmployee(formValues.employeeId, formData).subscribe({
        next: () => {
          alert('Employee updated successfully');
          this.getEmployees();
          this.closeModal();
        },
        error: (err) => {
          console.error('Error updating employee:', err);
          alert('Error updating employee: ' + (err.error?.message || err.message));
        }
      });
    }
  }



  // Add this method to handle date formatting
  private formatDate(date: Date | string): string {
    if (!date) return '';

    const d = new Date(date);
    if (isNaN(d.getTime())) {
      console.error('Invalid date:', date);
      return '';
    }

    return d.toISOString().split('T')[0];
  }

  onEdit(employee: Employee) {
    this.openModal();

    // Reset file inputs
    if (this.fileInput) this.fileInput.nativeElement.value = '';
    if (this.docInput) this.docInput.nativeElement.value = '';

    // Patch form values with formatted dates
    this.employeeForm.patchValue({
      ...employee,
      dob: this.formatDate(employee.dob),
      joiningDate: this.formatDate(employee.joiningDate),
      imageFile: null,
      documentFile: null
    });

    // Set image preview
    this.imagePreview = employee.imagePath
      ? `${environment.apiBaseUrl}/${employee.imagePath}`
      : undefined;

    // Set document preview
    this.docPreview = employee.documentPath
      ? 'Existing document: ' + employee.documentPath.split('/').pop()
      : undefined;
  }



  onDelete(employee: Employee) {
    const isConfirm = confirm(`Are you sure you want to mark ${employee.employeeName} as unavailable?`);
    if (isConfirm) {
      this.employeeService.markAsUnavailable(employee.employeeId).subscribe({
        next: () => {
          alert('Employee marked as unavailable!');
          this.getEmployees(); // Refresh the list
        },
        error: (err) => {
          console.error('Error:', err);
          alert('Failed to update status.');
        }
      });
    }
  }



  onDetails(employee: Employee) {
    // API থেকে ফ্রেশ ডেটা লোড করুন
    this.employeeService.getEmployeeById(employee.employeeId).subscribe({
      next: (res) => {
        this.selectedEmployee = res;
        const modal = document.getElementById('detailsModal');
        if (modal) {
          modal.style.display = 'block';
        }
      },
      error: (err) => {
        console.error('Error loading employee details:', err);
        alert('Error loading details');
      }
    });
  }

  closeDetailsModal() {
    this.selectedEmployee = null;
    if (this.detailsModal) {
      this.detailsModal.nativeElement.style.display = 'none';
    }
  }

  toggleAvailability(employee: Employee) {
    this.employeeService.toggleEmployeeAvailability(employee.employeeId, !employee.isAvailable)
      .subscribe({
        next: () => {
          this.getEmployees();
        },
        error: (err) => {
          console.error('Error toggling availability:', err);
        }
      });
  }

  // Pagination methods
  paginateEmployees() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedEmployees = this.employeeList.slice(startIndex, endIndex);
  }

  changePage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.paginateEmployees();
  }

  generatePageNumbers() {
    this.pageNumbers = [];
    for (let i = 1; i <= this.totalPages; i++) {
      this.pageNumbers.push(i);
    }
  }

  onItemsPerPageChange(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    this.itemsPerPage = Number(selectElement.value);
    this.currentPage = 1;
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
    this.generatePageNumbers();
    this.paginateEmployees();
  }


  getDocumentUrl(documentPath: string | undefined): string {
    if (!documentPath) return '#';

    // If using API endpoint to serve files
    return `${environment.apiBaseUrl}/${documentPath}`;
  }
}
