import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule, FormControl } from '@angular/forms';
import { CertificateService } from '../../Services/certificate.service';
import { Certificate } from '../../Models/certificate';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { OverlayContainer } from '@angular/cdk/overlay';

@Component({
  selector: 'app-certificate',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    CommonModule,
    NgxPaginationModule,
    MatAutocompleteModule,
    MatInputModule,
    MatFormFieldModule
  ],
  templateUrl: './certificate.component.html',
  styleUrls: ['./certificate.component.css']
})
export class CertificateComponent implements OnInit {
  @ViewChild('myModal') modal: ElementRef | undefined;
  @ViewChild('detailsModal') detailsModal!: ElementRef;

  certificateList: Certificate[] = [];
  filteredList: Certificate[] = [];
  certificateService = inject(CertificateService);
  certificateForm: FormGroup;
  p: number = 1;
  itemsPerPage: number = 5;
  isSubmitting: boolean = false;
  selectedCertificate: Certificate | null = null;
  traineeDropdown: any[] = [];
  selectedTraineeDetails: {
    registrationNo: string;
    batchName: string;
    courseName: string;
    recommendationStatus: string;
  } | null = null;


  filteredTrainees: any[] = [];
  traineeSearchControl = new FormControl();
  constructor(private fb: FormBuilder, private overlayContainer: OverlayContainer) {
    this.certificateForm = this.fb.group({
      certificateId: [0],
      traineeId: [null, Validators.required],
      registrationId: [null, Validators.required],
      batchId: [null, Validators.required],
      courseId: [null, Validators.required],
      recommendationId: [null, Validators.required],
      issueDate: [new Date().toISOString().substring(0, 10), Validators.required], // YYYY-MM-DD
      certificateNumber: ['']
    });
  }

  ngOnInit(): void {

    this.loadCertificates();
    this.loadAvailableTrainees();
    //this.certificateService.getTraineeDropdown().subscribe({
    //  next: (res) => {
    //    this.traineeDropdown = res;
    //    this.filteredTrainees = [...this.traineeDropdown];
    //  },
    //  error: (err) => console.error('Failed to load trainees', err)
    //});
    this.certificateService.getAvailableTrainees().subscribe({
      next: (res) => {
        this.traineeDropdown = res;
        this.filteredTrainees = [...this.traineeDropdown];
      },
      error: (err) => console.error('Failed to load available trainees', err)
    });


    // Add trainee search functionality
    this.traineeSearchControl.valueChanges.subscribe(searchTerm => {
      if (typeof searchTerm === 'string') {
        this.filterTrainees(searchTerm);
      }
    });
    const container = this.overlayContainer.getContainerElement();
    container.style.zIndex = '1100';
    this.certificateForm.get('traineeId')?.valueChanges.subscribe(id => {
      console.log('🟡 Selected Trainee ID:', id); // ⬅️ এটা কি দেখায়?
      if (id) {
        this.certificateService.getTraineeInfo(id).subscribe({
          next: (info) => {
            console.log('🟢 Loaded Trainee Info:', info); // ⬅️ এটা কি দেখায়?
            this.certificateForm.patchValue({
              registrationId: info.registrationId,
              batchId: info.batchId,
              courseId: info.courseId,
              recommendationId: info.recommendationId
            });
            this.selectedTraineeDetails = {
              registrationNo: info.registrationNo,
              batchName: info.batchName,
              courseName: info.courseName,
              recommendationStatus: info.recommendationStatus
            };
          },
          error: (err) => {
            console.error('Failed to load trainee info', err);
          }
        });
      }
      else {
        // fallback: trainee deselected
        this.certificateForm.patchValue({
          registrationId: null,
          batchId: null,
          courseId: null,
          recommendationId: null
        });
      }
    });
  }

  private filterTrainees(searchTerm: string): void {
    if (!searchTerm) {
      this.filteredTrainees = [...this.traineeDropdown];
      return;
    }

    const term = searchTerm.toLowerCase();
    this.filteredTrainees = this.traineeDropdown.filter(trainee =>
      trainee.traineeName.toLowerCase().includes(term) ||
      trainee.traineeIDNo.toLowerCase().includes(term)
    );
  }



  displayTraineeFn(trainee: any): string {
    if (!trainee) return '';

    // If it's already a string (from search input), return it
    if (typeof trainee === 'string') return trainee;

    // Otherwise format the trainee object
    return `${trainee.traineeIDNo} - ${trainee.traineeName}`;
  }


  onTraineeSelected(trainee: any): void {
    this.certificateForm.patchValue({
      traineeId: trainee.traineeId
    });
    this.traineeSearchControl.setValue(trainee);

    // Trigger the existing trainee info load
    this.certificateService.getTraineeInfo(trainee.traineeId).subscribe({
      next: (info) => {
        this.certificateForm.patchValue({
          registrationId: info.registrationId,
          batchId: info.batchId,
          courseId: info.courseId,
          recommendationId: info.recommendationId
        });
        this.selectedTraineeDetails = {
          registrationNo: info.registrationNo,
          batchName: info.batchName,
          courseName: info.courseName,
          recommendationStatus: info.recommendationStatus
        };
      },
      error: (err) => {
        console.error('Failed to load trainee info', err);
      }
    });
  }

  openModal() {
    this.setFormState();
    if (this.modal) {
      this.modal.nativeElement.style.display = 'block';
    }
  }

  closeModal() {
    this.setFormState();
    if (this.modal) {
      this.modal.nativeElement.style.display = 'none';
    }
  }

  openDetailsModal() {
    if (this.detailsModal) {
      this.detailsModal.nativeElement.style.display = 'block';
    }
  }

  closeDetailsModal() {
    this.selectedCertificate = null;
    if (this.detailsModal) {
      this.detailsModal.nativeElement.style.display = 'none';
    }
  }

  loadCertificates() {
    this.certificateService.getAllCertificates().subscribe({
      next: (res) => {
        this.certificateList = res;
        this.filteredList = [...this.certificateList];
      },
      error: (err) => console.error('Error fetching certificates:', err)
    });
  }

  setFormState() {
    this.certificateForm.reset({
      certificateId: 0,
      traineeId: null,
      registrationId: null,
      batchId: null,
      courseId: null,
      recommendationId: null,
      issueDate: new Date().toISOString().substring(0, 10),
      certificateNumber: ''
    });
    this.traineeSearchControl.reset();
  }

  //onSubmit() {
  //  if (this.certificateForm.invalid || this.isSubmitting) return;

  //  this.isSubmitting = true;
  //  const formData: Certificate = this.certificateForm.value;

  //  const operation = formData.certificateId === 0
  //    ? this.certificateService.createCertificate(formData)
  //    : this.certificateService.updateCertificate(formData);

  //  operation.subscribe({
  //    next: () => {
  //      this.handleSuccess(formData.certificateId === 0 ? 'issued' : 'updated');
  //    },
  //    error: (err) => {
  //      this.handleError(err, formData.certificateId === 0 ? 'issue' : 'update');
  //    }
  //  });
  //}
  onSubmit() {
    if (this.certificateForm.invalid || this.isSubmitting) return;

    this.isSubmitting = true;
    const formData: Certificate = this.certificateForm.value;

    const operation = formData.certificateId === 0
      ? this.certificateService.createCertificate(formData)
      : this.certificateService.updateCertificate(formData);

    operation.subscribe({
      next: () => {
        this.handleSuccess(formData.certificateId === 0 ? 'issued' : 'updated');
        // Refresh the trainee list after successful operation
        this.loadAvailableTrainees();
      },
      error: (err) => {
        this.handleError(err, formData.certificateId === 0 ? 'issue' : 'update');
      }
    });
  }

  private loadAvailableTrainees() {
    this.certificateService.getAvailableTrainees().subscribe({
      next: (res) => {
        this.traineeDropdown = res;
        this.filteredTrainees = [...this.traineeDropdown];

        // Reset the search control if the selected trainee is no longer available
        const currentValue = this.traineeSearchControl.value;
        if (currentValue && !this.traineeDropdown.some(t => t.traineeId === currentValue.traineeId)) {
          this.traineeSearchControl.reset();
        }
      },
      error: (err) => console.error('Failed to load available trainees', err)
    });
  }

  private handleSuccess(action: string) {
    alert(`Certificate ${action} successfully!`);
    this.loadCertificates();
    this.resetForm();
    this.isSubmitting = false;
  }

  private handleError(err: any, action: string) {
    alert(`Error ${action}ing certificate. Please try again.`);
    this.isSubmitting = false;
  }

  private resetForm() {
    this.certificateForm.reset({
      certificateId: 0,
      traineeId: null,
      registrationId: null,
      batchId: null,
      courseId: null,
      recommendationId: null,
      issueDate: new Date().toISOString().substring(0, 10),
      certificateNumber: ''
    });
    this.closeModal();
    this.selectedTraineeDetails = null;
  }

  //onEdit(item: Certificate) {
  //  this.openModal();
  //  // Patch form with incoming Certificate data
  //  // Format IssueDate to yyyy-MM-dd for input[type=date]
  //  if (item.issueDate) {
  //    const formattedDate = item.issueDate.substring(0, 10);
  //    this.certificateForm.patchValue({ ...item, issueDate: formattedDate });
  //  } else {
  //    this.certificateForm.patchValue(item);
  //  }
  //}

  onEdit(item: Certificate) {
    this.openModal();

    // Find the trainee in the dropdown that matches the certificate's traineeId
    const selectedTrainee = this.traineeDropdown.find(t => t.traineeId === item.traineeId);

    if (selectedTrainee) {
      // Set the trainee in the search control
      this.traineeSearchControl.setValue(selectedTrainee);

      // Load the trainee details
      this.certificateService.getTraineeInfo(item.traineeId).subscribe({
        next: (info) => {
          this.selectedTraineeDetails = {
            registrationNo: info.registrationNo,
            batchName: info.batchName,
            courseName: info.courseName,
            recommendationStatus: info.recommendationStatus
          };
        },
        error: (err) => {
          console.error('Failed to load trainee info', err);
        }
      });
    }

    // Patch form with incoming Certificate data
    // Format IssueDate to yyyy-MM-dd for input[type=date]
    if (item.issueDate) {
      const formattedDate = item.issueDate.substring(0, 10);
      this.certificateForm.patchValue({ ...item, issueDate: formattedDate });
    } else {
      this.certificateForm.patchValue(item);
    }
  }

  onDelete(item: Certificate) {
    if (confirm(`Are you sure you want to delete Certificate ID ${item.certificateId}?`)) {
      this.certificateService.deleteCertificate(item.certificateId).subscribe({
        next: () => {
          alert('Certificate deleted successfully');
          this.loadCertificates();
        },
        error: (err) => {
          alert('Error deleting certificate.');
          console.error(err);
        }
      });
    }
  }

  onDetails(item: Certificate) {
    this.selectedCertificate = item;
    this.openDetailsModal();
  }

}
