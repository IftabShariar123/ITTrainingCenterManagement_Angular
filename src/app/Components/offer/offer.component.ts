import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { OfferService } from '../../Services/offer.service';
import { Offer } from '../../Models/offer';
import { NgxPaginationModule } from 'ngx-pagination';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-offer',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormsModule, NgxPaginationModule],
  templateUrl: './offer.component.html',
  styleUrl: './offer.component.css'
})
export class OfferComponent implements OnInit {
  @ViewChild('offerModal') modal: ElementRef | undefined;
  @ViewChild('detailsModal') detailsModal: ElementRef | undefined;

  offerList: Offer[] = [];
  filteredOffers: Offer[] = [];
  offerForm: FormGroup = new FormGroup({});
  offerService = inject(OfferService);
  offerTypes = ['Seasonal', 'Occasional', 'PaymentBased'];
  selectedOffer: Offer | null = null;
  isSubmitting = false;

  // Pagination properties
  p: number = 1;
  itemsPerPage: number = 5;
  searchText: string = '';
  searchBy: string = 'offerName'; // Default search field

  // Sorting properties
  sortColumn: string = 'offerName';
  sortDirection: 'asc' | 'desc' = 'asc';

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.setFormState();
    this.getOffers();
  }

  // ======================
  // FILTERING & SORTING
  // ======================
  applyFilter() {
    if (!this.searchText) {
      this.filteredOffers = [...this.offerList];
      this.applySorting();
      return;
    }

    const searchTerm = this.searchText.toLowerCase();
    this.filteredOffers = this.offerList.filter(offer => {
      const searchField = offer[this.searchBy as keyof Offer];

      if (typeof searchField === 'string') {
        return searchField.toLowerCase().includes(searchTerm);
      } else if (typeof searchField === 'number') {
        return searchField.toString().includes(searchTerm);
      } else if (this.searchBy === 'isActive') {
        const status = offer.isActive ? 'active' : 'inactive';
        return status.includes(searchTerm);
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
    this.filteredOffers.sort((a, b) => {
      // Get values with proper type handling
      let valA: any = a[this.sortColumn as keyof Offer];
      let valB: any = b[this.sortColumn as keyof Offer];

      // Handle dates
      if (this.sortColumn === 'validFrom' || this.sortColumn === 'validTo') {
        const dateA = new Date(valA).getTime();
        const dateB = new Date(valB).getTime();
        return this.sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
      }

      // Handle status
      if (this.sortColumn === 'isActive') {
        valA = a.isActive ? 1 : 0;
        valB = b.isActive ? 1 : 0;
        return this.sortDirection === 'asc' ? valA - valB : valB - valA;
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

      // Handle number comparison
      if (typeof valA === 'number' && typeof valB === 'number') {
        return this.sortDirection === 'asc' ? valA - valB : valB - valA;
      }

      // Default case (shouldn't normally reach here)
      return 0;
    });
  }
  // ======================
  // FORM & DATA METHODS
  // ======================
  setFormState() {
    const now = new Date();
    const later = new Date();
    later.setMonth(now.getMonth() + 1);

    this.offerForm = this.fb.group({
      offerId: [0],
      offerName: ['', Validators.required],
      offerType: ['Seasonal'],
      validFrom: [now.toISOString().substring(0, 16), Validators.required],
      validTo: [later.toISOString().substring(0, 16), Validators.required],
      discountPercentage: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
      seasonOrOccasion: [''],
      description: [''],
      paymentCondition: [''],
      isActive: [true],
      remarks: [null]
    });
  }

  getOffers() {
    this.offerService.getAllOffers().subscribe({
      next: (res) => {
        this.offerList = res;
        this.filteredOffers = [...res];
        this.applySorting();
      },
      error: (err) => {
        console.error('Error fetching offers:', err);
        alert('Failed to load offers');
      }
    });
  }

  // ======================
  // MODAL METHODS
  // ======================
  openModal() {
    this.offerForm.reset();
    this.offerForm.patchValue({
      offerId: 0,
      validFrom: new Date().toISOString().substring(0, 16),
      validTo: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().substring(0, 16),
      isActive: true
    });
    if (this.modal) this.modal.nativeElement.style.display = 'block';
  }

  closeModal() {
    if (this.modal) this.modal.nativeElement.style.display = 'none';
  }

  // ======================
  // CRUD OPERATIONS
  // ======================
  onSubmit() {
    if (this.offerForm.invalid || this.isSubmitting) {
      alert('Please fill all required fields');
      return;
    }

    this.isSubmitting = true;
    const formValues = this.offerForm.value;

    if (formValues.offerId === 0) {
      this.offerService.addOffer(formValues).subscribe({
        next: () => {
          alert('Offer added successfully');
          this.getOffers();
          this.closeModal();
          this.isSubmitting = false;
        },
        error: () => {
          this.isSubmitting = false;
          alert('Failed to add offer');
        }
      });
    } else {
      this.offerService.updateOffer(formValues).subscribe({
        next: () => {
          alert('Offer updated successfully');
          this.getOffers();
          this.closeModal();
          this.isSubmitting = false;
        },
        error: () => {
          this.isSubmitting = false;
          alert('Failed to update offer');
        }
      });
    }
  }

  onEdit(offer: Offer) {
    this.offerForm.patchValue({
      ...offer,
      validFrom: this.formatDateForInput(offer.validFrom),
      validTo: this.formatDateForInput(offer.validTo)
    });
    this.openModal();
  }

  formatDateForInput(date: string | Date): string {
    const dt = new Date(date);
    const offset = dt.getTimezoneOffset() * 60000;
    return new Date(dt.getTime() - offset).toISOString().substring(0, 16);
  }

  onDelete(offer: Offer) {
    const confirmDelete = confirm(`Are you sure you want to delete the offer "${offer.offerName}"?`);
    if (confirmDelete) {
      this.offerService.deleteOffer(offer.offerId).subscribe({
        next: () => {
          alert('Offer deleted successfully');
          this.getOffers();
        },
        error: () => alert('Failed to delete offer')
      });
    }
  }

  onDetails(offer: Offer) {
    this.selectedOffer = offer;
    if (this.detailsModal) this.detailsModal.nativeElement.style.display = 'block';
  }

  closeDetailsModal() {
    this.selectedOffer = null;
    if (this.detailsModal) this.detailsModal.nativeElement.style.display = 'none';
  }

  isOfferValid(offer: Offer): boolean {
    const now = new Date();
    return new Date(offer.validFrom) <= now && new Date(offer.validTo) >= now;
  }
}
