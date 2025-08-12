import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ClassRoomService } from '../../Services/classroom.service';
import { CourseService } from '../../Services/course.service';
import { ClassRoom, ClassRoomCourseJunction } from '../../Models/classroom';
import { Course } from '../../Models/course';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';



@Component({
  selector: 'app-classroom',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormsModule, NgxPaginationModule],
  templateUrl: './classroom.component.html',
  styleUrls: ['./classroom.component.css']
})
export class ClassRoomComponent implements OnInit {
  // List view properties
  classRooms: any[] = [];
  isLoadingList = true;
  p: number = 1;
  itemsPerPage = 10;
  // Form view properties
  classRoomForm: FormGroup;
  isFormVisible = false;
  isEditMode = false;
  currentClassRoomId?: number;
  courses: Course[] = [];
  isLoadingForm = false;
  formErrorMessage = '';

  selectedClassRoom: any = null;
  isDetailsVisible = false;

  @ViewChild('classroomModal') classroomModal!: ElementRef;
  @ViewChild('detailsModal') detailsModal!: ElementRef;

  constructor(
    private fb: FormBuilder,
    private classRoomService: ClassRoomService,
    private courseService: CourseService
  ) {
    this.classRoomForm = this.fb.group({
      roomName: ['', Validators.required],
      seatCapacity: ['', [Validators.required, Validators.min(1)]],
      location: ['', Validators.required],
      hasProjector: [false],
      hasAirConditioning: [false],
      hasWhiteboard: [false],
      hasSoundSystem: [false],
      hasInternetAccess: [false],
      isActive: [true],
      remarks: [''],
      additionalFacilities: [''],
      classRoomCourses: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.loadClassRooms();
    this.loadCourses();
  }

  // Form array getter for courses
  get classRoomCourses(): FormArray {
    return this.classRoomForm.get('classRoomCourses') as FormArray;
  }

  // List view methods
  loadClassRooms(): void {
    this.isLoadingList = true;
    this.classRoomService.getAllClassRooms().subscribe({
      next: (data) => {
        this.classRooms = data;
        this.isLoadingList = false;
      },
      error: (error) => {
        console.error('Error loading classrooms:', error);
        this.isLoadingList = false;
      }
    });
  }


  //showDetails(classRoom: any): void {
  //  this.selectedClassRoom = classRoom;
  //  this.isDetailsVisible = true;
  //  this.isFormVisible = false;
  //  this.isEditMode = false;
  //}


  closeDetails(): void {
    this.isDetailsVisible = false;
    this.selectedClassRoom = null;
  }

  deleteClassRoom(id: number): void {
    if (confirm('Are you sure you want to delete this classroom?')) {
      this.classRoomService.deleteClassRoom(id).subscribe({
        next: () => {
          this.loadClassRooms();
        },
        error: (error) => {
          console.error('Error deleting classroom:', error);
          alert('Could not delete classroom. It might be assigned to batches.');
        }
      });
    }
  }

  // Form view methods
  //showAddForm(): void {
  //  this.isFormVisible = true;
  //  this.isEditMode = false;
  //  this.currentClassRoomId = undefined;
  //  this.classRoomForm.reset({
  //    hasProjector: false,
  //    hasAirConditioning: false,
  //    hasWhiteboard: false,
  //    hasSoundSystem: false,
  //    hasInternetAccess: false,
  //    isActive: true
  //  });
  //  this.clearCourses();
  //}

  //showEditForm(id: number): void {
  //  this.isFormVisible = true;
  //  this.isEditMode = true;
  //  this.currentClassRoomId = id;
  //  this.isLoadingForm = true;

  //  this.classRoomService.getClassRoomById(id).subscribe({
  //    next: (classRoom) => {
  //      this.classRoomForm.patchValue({
  //        roomName: classRoom.roomName,
  //        seatCapacity: classRoom.seatCapacity,
  //        location: classRoom.location,
  //        hasProjector: classRoom.hasProjector,
  //        hasAirConditioning: classRoom.hasAirConditioning,
  //        hasWhiteboard: classRoom.hasWhiteboard,
  //        hasSoundSystem: classRoom.hasSoundSystem,
  //        hasInternetAccess: classRoom.hasInternetAccess,
  //        isActive: classRoom.isActive,
  //        remarks: classRoom.remarks,
  //        additionalFacilities: classRoom.additionalFacilities
  //      });

  //      this.clearCourses();
  //      if (classRoom.assignedCourses && classRoom.assignedCourses.length > 0) {
  //        classRoom.assignedCourses.forEach((course: any) => {
  //          this.addCourseToForm(course.courseId, course.isAvailable);
  //        });
  //      }

  //      this.isLoadingForm = false;
  //    },
  //    error: (error) => {
  //      console.error('Error loading classroom:', error);
  //      this.isLoadingForm = false;
  //    }
  //  });
  //}

  showAddForm(): void {
    this.isEditMode = false;
    this.currentClassRoomId = undefined;
    this.classRoomForm.reset({
      hasProjector: false,
      hasAirConditioning: false,
      hasWhiteboard: false,
      hasSoundSystem: false,
      hasInternetAccess: false,
      isActive: true
    });
    this.clearCourses();
    this.openModal();
  }

  showEditForm(id: number): void {
    this.isEditMode = true;
    this.currentClassRoomId = id;
    this.isLoadingForm = true;

    this.classRoomService.getClassRoomById(id).subscribe({
      next: (classRoom) => {
        this.classRoomForm.patchValue({
          roomName: classRoom.roomName,
          seatCapacity: classRoom.seatCapacity,
          location: classRoom.location,
          hasProjector: classRoom.hasProjector,
          hasAirConditioning: classRoom.hasAirConditioning,
          hasWhiteboard: classRoom.hasWhiteboard,
          hasSoundSystem: classRoom.hasSoundSystem,
          hasInternetAccess: classRoom.hasInternetAccess,
          isActive: classRoom.isActive,
          remarks: classRoom.remarks,
          additionalFacilities: classRoom.additionalFacilities
        });

        this.clearCourses();
        if (classRoom.assignedCourses && classRoom.assignedCourses.length > 0) {
          classRoom.assignedCourses.forEach((course: any) => {
            this.addCourseToForm(course.courseId, course.isAvailable);
          });
        }

        this.isLoadingForm = false;
        this.openModal();
      },
      error: (error) => {
        console.error('Error loading classroom:', error);
        this.isLoadingForm = false;
      }
    });
  }

  showDetails(classRoom: any): void {
    this.isLoadingForm = true;
    this.classRoomService.getClassRoomById(classRoom.classRoomId).subscribe({
      next: (detailedClassRoom) => {
        this.selectedClassRoom = detailedClassRoom;
        this.openDetailsModal();
        this.isLoadingForm = false;
      },
      error: (error) => {
        console.error('Error loading classroom details:', error);
        this.isLoadingForm = false;
      }
    });
  }
  cancelForm(): void {
    this.isFormVisible = false;
    this.classRoomForm.reset();
  }

  loadCourses(): void {
    this.courseService.getAllCourses().subscribe({
      next: (courses) => {
        this.courses = courses;
      },
      error: (error) => {
        console.error('Error loading courses:', error);
      }
    });
  }

  addCourseToForm(courseId?: number, isAvailable: boolean = true): void {
    // Check if there's already an empty course row
    if (!courseId && this.hasEmptyCourse()) {
      return;
    }

    // Get the current list of course IDs already in the form (excluding null/undefined)
    const existingCourseIds = this.classRoomCourses.controls
      .map(control => control.get('courseId')?.value)
      .filter(id => id !== null && id !== undefined);

    // If a specific course is being added
    if (courseId) {
      // Check if this course is already added
      if (existingCourseIds.includes(courseId)) {
        alert('This course has already been added!');
        return;
      }
    }

    // Add the course
    this.classRoomCourses.push(this.fb.group({
      courseId: [courseId || null, Validators.required],
      isAvailable: [isAvailable]
    }));
  }
  getAvailableCourses(index: number): Course[] {
    // Get all selected course IDs except the current one
    const selectedCourseIds = this.classRoomCourses.controls
      .map((control, i) => i !== index ? control.get('courseId')?.value : null)
      .filter(id => id !== null && id !== undefined);

    // Return courses that aren't selected (or all if none selected)
    return this.courses.filter(course =>
      !selectedCourseIds.includes(course.courseId)
    );
  }


  hasEmptyCourse(): boolean {
    return this.classRoomCourses.controls.some(c => !c.get('courseId')?.value);
  }

  removeCourse(index: number): void {
    this.classRoomCourses.removeAt(index);
  }

  clearCourses(): void {
    while (this.classRoomCourses.length !== 0) {
      this.classRoomCourses.removeAt(0);
    }
  }

  openModal() {
    const modal = document.getElementById('classroomModal');
    if (modal) {
      modal.style.display = 'block';
    }
  }

  closeModal() {
    const modal = document.getElementById('classroomModal');
    if (modal) {
      modal.style.display = 'none';
    }
    this.classRoomForm.reset();
  }

  openDetailsModal() {
    const modal = document.getElementById('detailsModal');
    if (modal) {
      modal.style.display = 'block';
    }
  }

  closeDetailsModal() {
    const modal = document.getElementById('detailsModal');
    if (modal) {
      modal.style.display = 'none';
    }
  }



  onSubmit(): void {
    if (this.classRoomForm.invalid) {
      this.classRoomForm.markAllAsTouched();
      return;
    }

    const courseIds = this.classRoomCourses.controls
      .map(control => control.get('courseId')?.value)
      .filter(id => id !== null && id !== undefined);

    const uniqueCourseIds = [...new Set(courseIds)];

    if (courseIds.length !== uniqueCourseIds.length) {
      alert('Error: You have selected the same course multiple times!');
      return;
    }

    const formData = this.classRoomForm.value;

    // Prepare the data exactly as your API expects it
    const classRoomData = {
      classRoomId: this.isEditMode ? this.currentClassRoomId : 0,
      roomName: formData.roomName,
      seatCapacity: formData.seatCapacity,
      location: formData.location,
      hasProjector: formData.hasProjector,
      hasAirConditioning: formData.hasAirConditioning,
      hasWhiteboard: formData.hasWhiteboard,
      hasSoundSystem: formData.hasSoundSystem,
      hasInternetAccess: formData.hasInternetAccess,
      isActive: formData.isActive,
      remarks: formData.remarks || null,
      additionalFacilities: formData.additionalFacilities || null,
      classRoomCourse_Junction_Tables: formData.classRoomCourses.map((course: any) => ({
        courseId: course.courseId,
        isAvailable: course.isAvailable
      }))

    };

    this.isLoadingForm = true;

    if (this.isEditMode && this.currentClassRoomId) {
      this.classRoomService.updateClassRoom(this.currentClassRoomId, classRoomData).subscribe({
        next: () => {
          this.loadClassRooms();
          this.isLoadingForm = false;
          this.closeModal(); // Close the modal
          alert('Classroom updated successfully!');
        },
        error: (error) => {
          console.error('Error updating classroom:', error);
          if (error.error) {
            console.log('Validation errors:', error.error);
            alert(`Validation error: ${JSON.stringify(error.error.errors || error.error)}`);
          } else {
            alert('Error updating classroom. Please try again.');
          }
          this.isLoadingForm = false;
        }
      });
    } else {
      this.classRoomService.createClassRoom(classRoomData).subscribe({
        next: () => {
          this.loadClassRooms();
          this.isLoadingForm = false;
          this.closeModal(); // Close the modal
          alert('Classroom created successfully!');
        },
        error: (error) => {
          console.error('Error creating classroom:', error);
          if (error.error) {
            console.log('Validation errors:', error.error);
            alert(`Validation error: ${JSON.stringify(error.error.errors || error.error)}`);
          } else {
            alert('Error creating classroom. Please try again.');
          }
          this.isLoadingForm = false;
        }
      });
    }

  }
}
