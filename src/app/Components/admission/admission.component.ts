import { Component, OnInit, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Visitor } from '../../Models/visitor';
import { Batch } from '../../Models/batch';
import { Registration } from '../../Models/registration';
import { AdmissionService } from '../../Services/admission.service';
import { VisitorService } from '../../Services/visitor.service';
import { RegistrationService } from '../../Services/registration.service';
import { BatchService } from '../../Services/batch.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Offer } from '../../Models/offer';
import { OfferService } from '../../Services/offer.service';
import { Admission } from '../../Models/admission';
import { NgxPaginationModule } from 'ngx-pagination';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-admission',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    NgxPaginationModule,
    FormsModule
  ],
  templateUrl: './admission.component.html',
  styleUrls: ['./admission.component.css']
})
export class AdmissionComponent implements OnInit {
  @ViewChild('admissionModal') admissionModal!: ElementRef;
  @ViewChild('detailsModal') detailsModal!: ElementRef;

  admissionForm: FormGroup;
  admissions: Admission[] = [];
  visitors: Visitor[] = [];
  batches: Batch[] = [];
  visitorRegistrations: Registration[] = [];
  offers: Offer[] = [];
  selectedOffer: Offer | null = null;
  selectedAdmission: Admission | null = null;
  showOrganizationField = false;

  // Pagination properties
  p: number = 1;
  itemsPerPage: number = 5;
  searchText: string = '';
  filteredAdmissions: Admission[] = [];
  searchBy: string = 'admissionNo'; // Default search field

  // Sorting properties
  sortColumn: string = 'admissionNo';
  sortDirection: 'asc' | 'desc' = 'asc';

  constructor(
    private fb: FormBuilder,
    private admissionService: AdmissionService,
    private visitorService: VisitorService,
    private registrationService: RegistrationService,
    private batchService: BatchService,
    private offerService: OfferService,
    private cd: ChangeDetectorRef
  ) {
    this.admissionForm = this.fb.group({
      admissionId: [0],
      visitorId: ['', Validators.required],
      offerId: [null],
      discountAmount: [0],
      organizationName: [''],
      remarks: [''],
      admissionDate: [new Date().toISOString().substring(0, 10), Validators.required],
      admissionDetails: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.loadAdmissions();
    this.loadVisitors();
    this.loadBatches();
    this.loadOffers();
  }

  // Add these new methods for filtering and sorting
  applyFilter() {
    if (!this.searchText) {
      this.filteredAdmissions = [...this.admissions];
      this.applySorting();
      return;
    }

    this.filteredAdmissions = this.admissions.filter(admission => {
      const searchField = admission[this.searchBy as keyof Admission];

      // Special handling for visitor name
      if (this.searchBy === 'visitorId') {
        const visitorName = this.getVisitorName(admission.visitorId).toLowerCase();
        return visitorName.includes(this.searchText.toLowerCase());
      }

      if (typeof searchField === 'string') {
        return searchField.toLowerCase().includes(this.searchText.toLowerCase());
      } else if (typeof searchField === 'number') {
        return searchField.toString().includes(this.searchText);
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
    this.filteredAdmissions.sort((a, b) => {
      let valA = a[this.sortColumn as keyof Admission];
      let valB = b[this.sortColumn as keyof Admission];

      // Special handling for visitor name sorting
      if (this.sortColumn === 'visitorId') {
        valA = this.getVisitorName(a.visitorId);
        valB = this.getVisitorName(b.visitorId);
      }

      // Handle date sorting
      if (this.sortColumn === 'admissionDate') {
        valA = new Date(a.admissionDate).getTime();
        valB = new Date(b.admissionDate).getTime();
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

  // Update the loadAdmissions method to apply filtering and sorting initially
  loadAdmissions(): void {
    this.admissionService.getAllAdmissions().subscribe({
      next: (admissions) => {
        this.admissions = admissions;
        this.filteredAdmissions = [...this.admissions];
        this.applySorting();
      },
      error: (err) => console.error('Error loading admissions', err)
    });
  }

  // ... rest of your existing methods remain the same ...
  get admissionDetails(): FormArray {
    return this.admissionForm.get('admissionDetails') as FormArray;
  }

  loadVisitors(): void {
    this.visitorService.getAllVisitors().subscribe({
      next: (visitors) => this.visitors = visitors,
      error: (err) => console.error('Error loading visitors', err)
    });
  }

  loadBatches(): void {
    this.batchService.getBatches().subscribe({
      next: (batches) => this.batches = batches,
      error: (err) => console.error('Error loading batches', err)
    });
  }

  loadOffers(): void {
    this.offerService.getActiveOffers().subscribe({
      next: (offers) => this.offers = offers,
      error: (err) => console.error('Error loading offers', err)
    });
  }

  openAddModal(): void {
    this.admissionForm.reset({
      admissionId: 0,
      admissionDate: new Date().toISOString().substring(0, 10),
      discountAmount: 0
    });
    this.admissionModal.nativeElement.style.display = 'block';
  }

  closeModal(): void {
    this.admissionModal.nativeElement.style.display = 'none';
    this.admissionDetails.clear();
    this.visitorRegistrations = [];
  }

  closeDetailsModal(): void {
    this.detailsModal.nativeElement.style.display = 'none';
    this.selectedAdmission = null;
  }

  onSubmit(): void {
    if (this.admissionForm.valid) {
      const formData = this.admissionForm.value;

      const admissionData: Admission = {
        admissionId: formData.admissionId,
        visitorId: formData.visitorId,
        offerId: formData.offerId,
        discountAmount: formData.discountAmount,
        organizationName: formData.organizationName,
        admissionDate: formData.admissionDate,
        admissionDetails: formData.admissionDetails,
        remarks: formData.remarks
      };

      if (formData.admissionId === 0) {
        this.admissionService.createAdmission(admissionData).subscribe({
          next: (response) => {
            console.log('Admission, Trainee and BatchTransfer generated successfully', response);
            this.loadAdmissions();
            this.closeModal();
          },
          error: (err) => console.error('Error creating admission', err)
        });
      } else {
        this.admissionService.updateAdmission(formData.admissionId, admissionData).subscribe({
          next: (response) => {
            console.log('Admission updated successfully', response);
            this.loadAdmissions();
            this.closeModal();
          },
          error: (err) => console.error('Error updating admission', err)
        });
      }
    }
  }

  removeDetail(index: number): void {
    this.admissionDetails.removeAt(index);
    this.cd.detectChanges();
  }

  onEdit(admission: Admission): void {
    this.registrationService.getRegistrationsByVisitor(admission.visitorId).subscribe({
      next: (registrations) => {
        this.visitorRegistrations = registrations || [];

        this.admissionForm.patchValue({
          ...admission,
          admissionDate: new Date(admission.admissionDate).toISOString().substring(0, 10),
          admissionNo: admission.admissionNo
        });

        this.admissionDetails.clear();
        admission.admissionDetails.forEach(detail => {
          const reg = this.visitorRegistrations.find(r => r.registrationId === detail.registrationId);
          if (reg) {
            this.addRegistrationDetail(reg, detail.batchId);
          }
        });

        this.admissionModal.nativeElement.style.display = 'block';
      },
      error: (err) => {
        console.error('Error loading registrations', err);
        this.admissionForm.patchValue({
          ...admission,
          admissionDate: new Date(admission.admissionDate).toISOString().substring(0, 10),
          admissionNo: admission.admissionNo
        });
        this.admissionDetails.clear();
        this.admissionModal.nativeElement.style.display = 'block';
      }
    });
  }

  addRegistrationDetail(registration: Registration, batchId?: number): void {
    const detailGroup = this.fb.group({
      admissionDetailsId: [0],
      registrationId: [registration.registrationId, Validators.required],
      batchId: [batchId || null, Validators.required],
      registrationNo: [registration.registrationNo],
      traineeName: [registration.traineeName]
    });

    this.admissionDetails.push(detailGroup);
    this.cd.detectChanges();
  }

  onDelete(admission: Admission): void {
    if (confirm(`Delete admission ${admission.admissionNo}?`)) {
      this.admissionService.deleteAdmission(admission.admissionId).subscribe({
        next: () => this.loadAdmissions(),
        error: (err) => console.error('Error deleting admission', err)
      });
    }
  }

  onVisitorChange(visitorId: string | number): void {
    const id = Number(visitorId);

    if (!id) {
      this.showOrganizationField = false;
      this.cd.detectChanges();
      return;
    }

    const selectedVisitor = this.visitors.find(v => v.visitorId === id);

    if (selectedVisitor) {
      this.showOrganizationField = selectedVisitor.visitorType === 'Organization';
    } else {
      this.showOrganizationField = false;
    }

    while (this.admissionDetails.length) {
      this.admissionDetails.removeAt(0);
    }

    this.registrationService.getRegistrationsByVisitor(id).subscribe({
      next: (registrations) => {
        this.visitorRegistrations = registrations || [];
        this.cd.detectChanges();
      },
      error: (err) => {
        console.error('Error loading registrations', err);
        this.visitorRegistrations = [];
        this.cd.detectChanges();
      }
    });
  }

  onOfferChange(offerId: number): void {
    this.selectedOffer = this.offers.find(o => o.offerId === offerId) || null;
    if (this.selectedOffer) {
      this.admissionForm.patchValue({
        discountAmount: this.selectedOffer.discountPercentage
      });
    } else {
      this.admissionForm.patchValue({
        discountAmount: 0
      });
    }
  }

  getVisitorName(visitorId: number): string {
    const visitor = this.visitors.find(v => v.visitorId === visitorId);
    return visitor ? visitor.visitorName : 'Unknown';
  }

  getRegistrationNo(registrationId: number): string {
    const registration = this.visitorRegistrations.find(r => r.registrationId === registrationId);
    return registration ? registration.registrationNo : 'Unknown';
  }

  getTraineeName(registrationId: number): string {
    const registration = this.visitorRegistrations.find(r => r.registrationId === registrationId);
    return registration ? registration.traineeName : 'Unknown';
  }

  getBatchName(batchId: number): string {
    const batch = this.batches.find(b => b.batchId === batchId);
    return batch ? `${batch.batchName} (${new Date(batch.startDate).toLocaleDateString()})` : 'Not assigned';
  }

  getCourseName(registrationId: number): string {
    const registration = this.visitorRegistrations.find(r => r.registrationId === registrationId);
    if (!registration) return 'Unknown';

    if (registration.course) {
      return registration.course.courseName;
    } else if (registration.courseCombo) {
      return registration.courseCombo.comboName;
    }
    return 'Not specified';
  }

  onDetails(admission: Admission): void {
    this.selectedAdmission = admission;
    this.registrationService.getRegistrationsByVisitor(admission.visitorId).subscribe({
      next: (registrations) => {
        this.visitorRegistrations = registrations || [];
        this.detailsModal.nativeElement.style.display = 'block';
      },
      error: (err) => {
        console.error('Error loading registrations', err);
        this.visitorRegistrations = [];
        this.detailsModal.nativeElement.style.display = 'block';
      }
    });
  }
}
