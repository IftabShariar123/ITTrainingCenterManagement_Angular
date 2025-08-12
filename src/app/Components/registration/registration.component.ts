import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Registration } from '../../Models/registration';
import { RegistrationService } from '../../Services/registration.service';
import { CommonModule } from '@angular/common';
import { VisitorService } from '../../Services/visitor.service';
import { CourseComboService } from '../../Services/coursecombo.service';
import { Visitor } from '../../Models/visitor';
import { CourseCombo } from '../../Models/course-combo';
import { environment } from '../../../environments/environment';
import { Course } from '../../Models/course';
import { CourseService } from '../../Services/course.service';

@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './registration.component.html',
  styleUrl: './registration.component.css'
})
export class RegistrationComponent implements OnInit {
  @ViewChild('myModal') model: ElementRef | undefined;
  @ViewChild('detailsModal') detailsModal: ElementRef | undefined;
  @ViewChild('fileInput') fileInput!: ElementRef;
  @ViewChild('docInput') docInput!: ElementRef;

  environment = environment;
  registrationList: Registration[] = [];
  paginatedRegistrations: Registration[] = [];
  registrationForm: FormGroup = new FormGroup({});
  registrationService = inject(RegistrationService);
  visitorService = inject(VisitorService);
  courseComboService = inject(CourseComboService);
  selectedRegistration: Registration | null = null;
  visitors: Visitor[] = [];
  courseCombos: CourseCombo[] = [];
  imagePreview?: string;
  docPreview?: string;

  // Pagination variables
  currentPage: number = 1;
  itemsPerPage: number = 5;
  totalItems: number = 0;
  totalPages: number = 0;
  pageNumbers: number[] = [];

  courses: Course[] = [];
  selectedCourseIds: number[] = [];
  constructor(private fb: FormBuilder,
    private courseService: CourseService) { }


  ngOnInit(): void {
    this.setFormState();
    this.getRegistrations();
    this.getVisitors();
    this.getCourseCombos();
    this.getCourses();
  }

  getCourses() {
    this.registrationService.getAllCourses().subscribe(res => {
      this.courses = res.filter(c => c.isActive);
    });
  }


  onCourseChange(courseId: number, event: any) {
    if (event.target.checked) {
      this.selectedCourseIds.push(courseId);
    } else {
      this.selectedCourseIds = this.selectedCourseIds.filter(id => id !== courseId);
    }
    this.registrationForm.patchValue({
      selectedCourseIds: this.selectedCourseIds.join(',')
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
    this.imagePreview = undefined;
    this.docPreview = undefined;
    if (this.model != null) {
      this.model.nativeElement.style.display = 'none';
    }
  }

  getRegistrations() {
    this.registrationService.getAllRegistrations().subscribe((res) => {
      this.registrationList = res;
      this.totalItems = res.length;
      this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
      this.generatePageNumbers();
      this.paginateRegistrations();
    });
  }



  getVisitors() {
    this.visitorService.getAllVisitors().subscribe(res => {
      this.visitors = res.map(visitor => ({
        ...visitor,
        employeeName: visitor.employee?.employeeName || ''
      }));
    });
  }

  getCourseCombos() {
    this.courseComboService.getAllCourseCombos().subscribe(res => {
      this.courseCombos = res;
    });
  }

  setFormState() {
    this.registrationForm = this.fb.group({
      registrationId: [0],
      //registraionNo: ['', [Validators.required]],
      visitorId: ['', [Validators.required]],
      traineeName: ['', [Validators.required]],
      registrationDate: ['', [Validators.required]],
      courseId: [''],
      courseComboId: [''],
      //registrationFee: [0, [Validators.required]],
      //paymentMode: ['', [Validators.required]],
      gender: ['', [Validators.required]],
      nationality: ['', [Validators.required]],
      religion: ['', [Validators.required]],
      dateOfBirth: [''],
      originatDateofBirth: [''],
      maritalStatus: [''],
      fatherName: [''],
      motherName: [''],
      contactNo: ['', [Validators.required]],
      emergencyContactNo: [null],
      emailAddress: ['', [Validators.email]],
      bloodGroup: [''],
      imageFile: [null],
      documentFile: [null],
      birthOrNIDNo: [''],
      presentAddress: [''],
      permanentAddress: [''],
      highestEducation: [''],
      institutionName: [''],
      reference: [''],
      remarks:[null]
    });
  }

  onFileChange(event: Event, type: 'image' | 'document') {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      if (type === 'image') {
        this.registrationForm.patchValue({ imageFile: file });
        this.registrationForm.get('imageFile')?.updateValueAndValidity();

        // Create preview
        const reader = new FileReader();
        reader.onload = () => {
          this.imagePreview = reader.result as string;
        };
        reader.readAsDataURL(file);
      } else {
        this.registrationForm.patchValue({ documentFile: file });
        this.registrationForm.get('documentFile')?.updateValueAndValidity();

        // For documents, we'll just show the file name
        this.docPreview = file.name;
      }
    }
  }



  onSubmit() {
    if (this.registrationForm.invalid) {
      alert('Please fill all required fields');
      return;
    }

    const formData = new FormData();
    const formValues = this.registrationForm.value;

    // Get the selected course
    const selectedCourse = this.courses.find(c => c.courseId == formValues.courseId);

    // Append all form values
    Object.keys(formValues).forEach(key => {
      if (key !== 'imageFile' && key !== 'documentFile' &&
        key !== 'registrationDate' && key !== 'dateOfBirth' &&
        key !== 'originatDateofBirth' && key !== 'registrationNo') {
        if (formValues[key] !== null && formValues[key] !== undefined) {
          formData.append(key, formValues[key]);
        }
      }
    });

    // Add the course name if a course is selected
    if (selectedCourse) {
      formData.append('courseName', selectedCourse.courseName);
    }

    // Handle dates
    ['registrationDate', 'dateOfBirth', 'originatDateofBirth'].forEach(dateField => {
      if (formValues[dateField]) {
        const date = new Date(formValues[dateField]);
        if (!isNaN(date.getTime())) {
          formData.append(dateField, date.toISOString().split('T')[0]);
        }
      }
    });

    // Handle files
    if (formValues.imageFile) {
      formData.append('imageFile', formValues.imageFile);
    }
    if (formValues.documentFile) {
      formData.append('documentFile', formValues.documentFile);
    }

    if (formValues.registrationId === 0) {
      this.registrationService.addRegistration(formData).subscribe({
        next: () => {
          alert('Registration added successfully');
          this.getRegistrations();
          this.closeModal();
        },
        error: (err) => {
          console.error('Error:', err);
          alert('Error adding registration');
        }
      });
    } else {
      this.registrationService.updateRegistration(formValues.registrationId, formData).subscribe({
        next: () => {
          alert('Registration updated successfully');
          this.getRegistrations();
          this.closeModal();
        },
        error: (err) => {
          console.error('Error:', err);
          alert('Error updating registration');
        }
      });
    }
  }


  private formatDate(date: Date | string): string {
    if (!date) return '';

    const d = new Date(date);
    if (isNaN(d.getTime())) {
      console.error('Invalid date:', date);
      return '';
    }

    return d.toISOString().split('T')[0];
  }

  getCourseNames(selectedCourseIds: string): string {
    if (!selectedCourseIds) return '';
    const ids = selectedCourseIds.split(',').map(Number);
    return this.courses
      .filter(c => ids.includes(c.courseId))
      .map(c => c.courseName)
      .join(', ');
  }



  onEdit(registration: Registration) {
    this.openModal();

    // Reset file inputs
    if (this.fileInput) this.fileInput.nativeElement.value = '';
    if (this.docInput) this.docInput.nativeElement.value = '';

    const formattedRegistration = {
      ...registration,
      dateOfBirth: registration.dateOfBirth
        ? this.formatDateOnly(registration.dateOfBirth)
        : null,
      originatDateofBirth: registration.originatDateofBirth
        ? this.formatDateOnly(registration.originatDateofBirth)
        : null
    };

    this.registrationForm.patchValue({
      ...formattedRegistration,
      registrationNo: registration.registrationNo,
      registrationDate: this.formatDate(registration.registrationDate),
      imageFile: null,
      documentFile: null
    });

    this.imagePreview = registration.imagePath
      ? `${environment.apiBaseUrl}/${registration.imagePath}`
      : undefined;

    this.docPreview = registration.documentPath
      ? 'Existing document: ' + registration.documentPath.split('/').pop()
      : undefined;
  }

  private formatDateOnly(date: any): string {
    if (typeof date === 'string') {
      if (date.includes('T')) {
        return date.split('T')[0];
      }
      return date; // Assume it's already in YYYY-MM-DD format
    }

    // Handle DateOnly object from C#
    if (date && date.year && date.month && date.day) {
      return `${date.year}-${date.month.toString().padStart(2, '0')}-${date.day.toString().padStart(2, '0')}`;
    }

    return '';
  }


  onDelete(registration: Registration) {
    const isConfirm = confirm("Are you sure you want to delete this Registration: " + registration.traineeName);
    if (isConfirm) {
      this.registrationService.deleteRegistration(registration.registrationId).subscribe({
        next: () => {
          alert('Registration deleted successfully');
          this.getRegistrations();
        },
        error: (err) => {
          console.error('Error deleting registration:', err);
          alert('Error deleting registration');
        }
      });
    }
  }
  // In your component class
  onVisitorSelected() {
    const visitorId = this.registrationForm.get('visitorId')?.value;
    if (visitorId) {
      const selectedVisitor = this.visitors.find(v => v.visitorId == visitorId);
      if (selectedVisitor && selectedVisitor.employee) {
        this.registrationForm.patchValue({
          reference: selectedVisitor.employee.employeeName
        });
      }
    }
  }

  onVisitorChange(visitorId: number) {
    const selectedVisitor = this.visitors.find(v => v.visitorId === visitorId);
    if (selectedVisitor) {
      // Set the reference field to the employee name
      this.registrationForm.patchValue({
        reference: selectedVisitor.employee?.employeeName || ''
      });
    }
  }


  onDetails(registration: Registration) {
    this.registrationService.getRegistrationById(registration.registrationId).subscribe({
      next: (res) => {
        this.selectedRegistration = res;

        // Load visitor details if needed
        if (res.visitorId && !res.visitor?.visitorName) {
          this.loadVisitorDetails(res.visitorId);
        }

        if (res.courseId && !res.course?.courseName) {
          this.loadCourseDetails(res.courseId);
        }

        // Load course combo details if needed
        if (res.courseComboId && !res.courseCombo?.comboName) {
          this.loadCourseComboDetails(res.courseComboId);
        }

        this.openDetailsModal();
      },
      error: (err) => {
        console.error('Error loading registration:', err);
        alert('Error loading registration details');
      }
    });
  }

  private loadVisitorDetails(visitorId: number) {
    this.visitorService.getVisitorById(visitorId).subscribe({
      next: (visitor) => {
        if (this.selectedRegistration) {
          this.selectedRegistration.visitor = visitor;
        }
      },
      error: (err) => {
        console.warn('Could not load visitor details', err);
      }
    });
  }

  private loadCourseDetails(courseId: number) {
    this.courseService.getCourseById(courseId).subscribe({
      next: (course) => {
        if (this.selectedRegistration) {
          this.selectedRegistration.course = course;
        }
      },
      error: (err) => {
        console.warn('Could not load course combo details', err);
      }
    });
  }


  private loadCourseComboDetails(courseComboId: number) {
    this.courseComboService.getCourseComboById(courseComboId).subscribe({
      next: (combo) => {
        if (this.selectedRegistration) {
          this.selectedRegistration.courseCombo = combo;
        }
      },
      error: (err) => {
        console.warn('Could not load course combo details', err);
      }
    });
  }


  private openDetailsModal() {
    const modal = document.getElementById('detailsModal');
    if (modal) {
      modal.style.display = 'block';
    }
  }



  closeDetailsModal() {
    this.selectedRegistration = null;
    if (this.detailsModal) {
      this.detailsModal.nativeElement.style.display = 'none';
    }
  }

  // Pagination methods
  paginateRegistrations() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedRegistrations = this.registrationList.slice(startIndex, endIndex);
  }

  changePage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.paginateRegistrations();
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
    this.paginateRegistrations();
  }

  getDocumentUrl(documentPath: string | undefined): string {
    if (!documentPath) return '#';
    return `${environment.apiBaseUrl}/${documentPath}`;
  }

}
