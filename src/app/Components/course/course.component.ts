import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CourseService } from '../../Services/course.service';
import { Instructor } from '../../Models/instructor';
import { ClassRoom } from '../../Models/classroom';
import { Employee } from '../../Models/employee';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { Course } from '../../Models/course';

@Component({
  selector: 'app-course',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgxPaginationModule],
  templateUrl: './course.component.html',
  styleUrls: ['./course.component.css']
})
export class CourseComponent implements OnInit {
  @ViewChild('courseModal') modal!: ElementRef;
  @ViewChild('detailsModal') detailsModal!: ElementRef;
  
  courseForm: FormGroup;
  courses: any[] = [];
  instructors: Instructor[] = [];
  classrooms: ClassRoom[] = [];
  employees: Employee[] = [];
  p: number = 1;
  itemsPerPage: number = 5;
  searchText: string = '';
  filteredList: any[] = [];
  isSubmitting = false;
  selectedCourse: any = null;
  isEditMode = false;
  selectedCourseId: number | null = null;


  constructor(
    private fb: FormBuilder,
    private courseService: CourseService
  ) {
    this.courseForm = this.fb.group({
      courseId: [0],
      courseName: ['', Validators.required],
      shortCode: ['', Validators.required],
      totalHours: ['', Validators.required],
      courseFee: ['', Validators.required],
      remarks: [''],
      isActive: [true, Validators.required],
      createdDate: [new Date().toISOString()],
      instructorAssignments: this.fb.array([]),
      classroomAssignments: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.loadCourses();
    this.loadInstructorsWithEmployees();
    this.loadClassrooms();
  }

  // Form array getters
  get instructorAssignments(): FormArray {
    return this.courseForm.get('instructorAssignments') as FormArray;
  }

  get classroomAssignments(): FormArray {
    return this.courseForm.get('classroomAssignments') as FormArray;
  }

  // Data loading methods
  loadCourses(): void {
    this.courseService.getAllCourses().subscribe({
      next: (res) => {
        this.courses = res;
        this.filteredList = [...this.courses];
      },
      error: (err) => console.error('Error fetching courses:', err)
    });
  }

  loadInstructorsWithEmployees(): void {
    this.courseService.getEmployees().subscribe(employees => {
      this.employees = employees;
      this.courseService.getInstructors().subscribe(instructors => {
        this.instructors = instructors.map(instructor => ({
          ...instructor,
          employee: employees.find(e => e.employeeId === instructor.employeeId)
        }));
      });
    });
  }

  loadClassrooms(): void {
    this.courseService.getClassrooms().subscribe({
      next: (res) => this.classrooms = res,
      error: (err) => console.error('Error fetching classrooms:', err)
    });
  }

  // Form array management
  addInstructorAssignment(): void {
    this.instructorAssignments.push(this.fb.group({
      instructorId: ['', Validators.required],
      isPrimaryInstructor: [false]
    }));
  }

  addClassroomAssignment(): void {
    this.classroomAssignments.push(this.fb.group({
      classRoomId: ['', Validators.required],
      isAvailable: [true]
    }));
  }

  removeInstructorAssignment(index: number): void {
    this.instructorAssignments.removeAt(index);
  }

  removeClassroomAssignment(index: number): void {
    this.classroomAssignments.removeAt(index);
  }

  // Modal methods
  openModal(): void {
    const modal = this.modal.nativeElement;
    if (modal) modal.style.display = 'block';
  }

  closeModal(): void {
    const modal = this.modal.nativeElement;
    if (modal) modal.style.display = 'none';
    this.resetForm();
  }

  openDetailsModal(course: any): void {
    this.selectedCourse = course;
    const modal = this.detailsModal.nativeElement;
    if (modal) modal.style.display = 'block';
  }

  closeDetailsModal(): void {
    const modal = this.detailsModal.nativeElement;
    if (modal) modal.style.display = 'none';
  }

  // CRUD operations
  //onSubmit(): void {
  //  if (this.courseForm.invalid || this.isSubmitting) return;

  //  this.isSubmitting = true;
  //  const formData = this.prepareCourseData();

  //  const operation = this.isEditMode
  //    ? this.courseService.updateCourse(formData.courseId, formData)
  //    : this.courseService.createCourse(formData);

  //  operation.subscribe({
  //    next: () => this.handleSuccess(),
  //    error: (err) => this.handleError(err)
  //  });
  //}


  onSubmit(): void {
    if (this.courseForm.invalid || this.isSubmitting) return;

    this.isSubmitting = true;
    const formData = this.prepareCourseData();

    // Ensure we have a valid courseId for updates
    const courseId = this.courseForm.value.courseId || this.selectedCourseId;

    if (!courseId && this.isEditMode) {
      alert('Invalid course ID');
      this.isSubmitting = false;
      return;
    }

    const operation = this.isEditMode
      ? this.courseService.updateCourse(courseId, formData)
      : this.courseService.createCourse(formData);

    operation.subscribe({
      next: () => this.handleSuccess(),
      error: (err) => this.handleError(err)
    });
  }

  //private prepareCourseData(): any {
  //  const formData = this.courseForm.value;
  //  return {
  //    CourseId: formData.courseId || 0,
  //    CourseName: formData.courseName,
  //    ShortCode: formData.shortCode,
  //    TotalHours: formData.totalHours,
  //    CourseFee: Number(formData.courseFee),
  //    Remarks: formData.remarks || null,
  //    IsActive: Boolean(formData.isActive),
  //    CreatedDate: new Date(formData.createdDate).toISOString(),
  //    InstructorCourse_Junction_Tables: formData.instructorAssignments.map((ia: any) => ({
  //      InstructorId: Number(ia.instructorId),
  //      IsPrimaryInstructor: Boolean(ia.isPrimaryInstructor),
  //      AssignmentDate: new Date().toISOString()
  //    })),
  //    ClassRoomCourse_Junction_Tables: formData.classroomAssignments.map((ca: any) => ({
  //      ClassRoomId: Number(ca.classRoomId),
  //      IsAvailable: Boolean(ca.isAvailable)
  //    }))
  //  };
  //}

  private prepareCourseData(): any {
    const formData = this.courseForm.value;
    return {
      CourseId: formData.courseId || 0,
      CourseName: formData.courseName,
      ShortCode: formData.shortCode,
      TotalHours: formData.totalHours,
      CourseFee: Number(formData.courseFee),
      Remarks: formData.remarks || null,
      IsActive: Boolean(formData.isActive),
      CreatedDate: new Date(formData.createdDate).toISOString(),
      InstructorCourse_Junction_Tables: formData.instructorAssignments?.map((ia: any) => ({
        InstructorId: Number(ia.instructorId),
        IsPrimaryInstructor: Boolean(ia.isPrimaryInstructor),
        AssignmentDate: new Date().toISOString()
      })) || [],
      ClassRoomCourse_Junction_Tables: formData.classroomAssignments?.map((ca: any) => ({
        ClassRoomId: Number(ca.classRoomId),
        IsAvailable: Boolean(ca.isAvailable)
      })) || []
    };
  }


  private handleError(err: any): void {
    console.error('Error:', err);
    let errorMessage = 'An error occurred';

    if (err.status === 400) {
      errorMessage = 'Bad request - please check your data';
    } else if (err.error?.message) {
      errorMessage = err.error.message;
    }

    alert(errorMessage);
    this.isSubmitting = false;
  }

  onEdit(course: Course): void {
    this.isEditMode = true;
    this.selectedCourseId = course.courseId;

    // Format the date for the input field
    const formattedDate = this.formatDateForInput(course.createdDate);

    this.courseForm.patchValue({
      courseId: course.courseId,
      courseName: course.courseName,
      shortCode: course.shortCode,
      totalHours: course.totalHours,
      courseFee: course.courseFee,
      remarks: course.remarks,
      isActive: course.isActive,
      createdDate: formattedDate
    });

    // Clear existing assignments
    this.clearFormArrays();

    // Populate instructor assignments
    if (course.instructors) {
      course.instructors.forEach(instructor => {
        this.instructorAssignments.push(this.fb.group({
          instructorId: [instructor.instructorId, Validators.required],
          isPrimaryInstructor: [instructor.isPrimaryInstructor]
        }));
      });
    }

    // Populate classroom assignments
    if (course.classRoom) {
      course.classRoom.forEach(room => {
        this.classroomAssignments.push(this.fb.group({
          classRoomId: [room.classRoomId, Validators.required],
          isAvailable: [room.isAvailable]
        }));
      });
    }

    this.openModal();
  }

  private clearFormArrays(): void {
    while (this.instructorAssignments.length) {
      this.instructorAssignments.removeAt(0);
    }
    while (this.classroomAssignments.length) {
      this.classroomAssignments.removeAt(0);
    }
  }

  private formatDateForInput(dateString: string): string {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  onDelete(course: any): void {
    if (confirm(`Are you sure you want to delete ${course.courseName}?`)) {
      this.courseService.deleteCourse(course.courseId).subscribe({
        next: () => {
          alert('Course deleted successfully');
          this.loadCourses();
        },
        error: (err) => console.error('Error deleting course:', err)
      });
    }
  }

  //// Helper methods
  //private clearFormArrays(): void {
  //  while (this.instructorAssignments.length) this.instructorAssignments.removeAt(0);
  //  while (this.classroomAssignments.length) this.classroomAssignments.removeAt(0);
  //}

  //private populateAssignments(course: any): void {
  //  if (course.instructorCourse_Junction_Tables) {
  //    course.instructorCourse_Junction_Tables.forEach((ia: any) => {
  //      this.instructorAssignments.push(this.fb.group({
  //        instructorId: [ia.instructorId, Validators.required],
  //        isPrimaryInstructor: [ia.isPrimaryInstructor]
  //      }));
  //    });
  //  }

  //  if (course.classRoomCourse_Junction_Tables) {
  //    course.classRoomCourse_Junction_Tables.forEach((ca: any) => {
  //      this.classroomAssignments.push(this.fb.group({
  //        classRoomId: [ca.classRoomId, Validators.required],
  //        isAvailable: [ca.isAvailable]
  //      }));
  //    });
  //  }
  //}

  private populateAssignments(course: any): void {
    // Populate instructor assignments
    if (course.instructorCourse_Junction_Tables) {
      course.instructorCourse_Junction_Tables.forEach((ia: any) => {
        this.instructorAssignments.push(this.fb.group({
          instructorId: [ia.instructorId, Validators.required],
          isPrimaryInstructor: [ia.isPrimaryInstructor || false]
        }));
      });
    }

    // Populate classroom assignments
    if (course.classRoomCourse_Junction_Tables) {
      course.classRoomCourse_Junction_Tables.forEach((ca: any) => {
        this.classroomAssignments.push(this.fb.group({
          classRoomId: [ca.classRoomId, Validators.required],
          isAvailable: [ca.isAvailable || true]
        }));
      });
    }
  }

  private handleSuccess(): void {
    alert(`Course ${this.isEditMode ? 'updated' : 'created'} successfully!`);
    this.loadCourses();
    this.resetForm();
    this.isSubmitting = false;
    this.closeModal();
  }

  //private handleError(err: any): void {
  //  console.error('Error:', err);
  //  alert(err.error?.message || 'An error occurred');
  //  this.isSubmitting = false;
  //}

  resetForm(): void {
    this.courseForm.reset({
      courseId: 0,
      courseName: '',
      shortCode: '',
      totalHours: '',
      courseFee: '',
      remarks: '',
      isActive: true,
      createdDate: new Date().toISOString()
    });
    this.clearFormArrays();
    this.isEditMode = false;
  }
}
