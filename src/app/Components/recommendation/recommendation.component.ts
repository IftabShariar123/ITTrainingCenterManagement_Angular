// recommendation.component.ts
import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { RecommendationService } from '../../Services/recommendation.service';
import { Batch } from '../../Models/batch';
import { Recommendation } from '../../Models/recommendation';
import { forkJoin, map } from 'rxjs';

export interface Assessment {
  assessmentId: number;
  assessmentType: string;
  assessmentDate: string;
  overallScore: number;
  isFinalized: boolean;
}

export interface Invoice {
  invoiceId: number;
  invoiceNo: string;
  creatingDate: string;
  invoiceCategory: string;
  moneyReceiptNo: string;
}

export interface RecommendationEntry {
  traineeId: number;
  traineeName: string;
  assessmentId: number | null;
  invoiceId: number | null;
  recommendationText: string;
  recommendationDate: string;
  recommendationStatus: string;
  assessments: Assessment[];
  invoices: Invoice[];
  paymentSummary?: {
    invoiceNo?: string;
    totalAmount?: number;
    totalPaid?: number;
    dueAmount?: number;
    statusMessage?: string;
  };
}

interface RecommendationDetailDTO {
  traineeId: number;
  assessmentId: number;
  invoiceId: number;
  recommendationText: string;
  recommendationStatus: string;
}

interface RecommendationCreateDTO {
  recommendationDate: string; // ISO date format (yyyy-MM-dd)
  batchId: number;
  instructorId: number;
  recommendations: RecommendationDetailDTO[];
}


@Component({
  selector: 'app-recommendation',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule, NgxPaginationModule],
  templateUrl: './recommendation.component.html',
  styleUrls: ['./recommendation.component.css']
})
export class RecommendationComponent implements OnInit {

  batches: Batch[] = [];
  selectedBatchId: number | null = null;
  selectedInstructorName: string | null = null;
  selectedInstructorId: number | null = null;
  recommendationEntries: RecommendationEntry[] = [];

  recommendations: any[] = [];
  p: number = 1;
  itemsPerPage: number = 5;

  showModal: boolean = false;

  recommendationStatuses = [
    { value: 'pending', display: 'Pending' },
    { value: 'approved', display: 'Approved' },
    { value: 'rejected', display: 'Rejected' }
  ];

  recommendationService = inject(RecommendationService);
  fb = inject(FormBuilder);

  @ViewChild('myModal') modal!: ElementRef;

  ngOnInit(): void {
    this.loadBatches();
    this.loadRecommendations();
  }

  loadBatches() {
    this.recommendationService.getBatches().subscribe({
      next: res => this.batches = res
    });
  }

  loadRecommendations() {
    this.recommendationService.getRecommendations().subscribe({
      next: res => this.recommendations = res
    });
  }

  openModal() {
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.selectedBatchId = null;
    this.selectedInstructorName = null;
    this.recommendationEntries = [];
  }  


  //onBatchChanged(batchId: number) {
  //  this.recommendationEntries = []; // Clear previous entries
  //  this.selectedInstructorName = null;
  //  this.selectedInstructorId = null;

  //  this.recommendationService.getInstructorAndTrainees(batchId).subscribe({
  //    next: (res) => {
  //      this.selectedInstructorName = res.instructor?.instructorName || null;
  //      this.selectedInstructorId = res.instructor?.instructorId || null;

  //      if (!res.trainees || res.trainees.length === 0) {
  //        return;
  //      }

  //      // Create an array of observables for all trainee data requests
  //      const traineeRequests = res.trainees.map((trainee: any) => {
  //        const traineeId = trainee.traineeId;
  //        // Try different property paths for trainee name
  //        const traineeName = trainee.traineeName || trainee.registration?.traineeName || trainee.name || 'Unknown';
  //        return forkJoin([
  //          this.recommendationService.getInvAssessByTrainee(traineeId),
  //          this.recommendationService.getTraineePaymentSummary(traineeId)
  //        ]).pipe(
  //          map(([assessmentRes, paymentRes]) => ({
  //            traineeId,
  //            traineeName,
  //            assessments: assessmentRes.assessments || [],
  //            invoices: assessmentRes.invoices || [],
  //            paymentSummary: paymentRes
  //          }))
  //        );
  //      });

  //      // Execute all requests in parallel
  //      forkJoin(traineeRequests).subscribe({
  //        next: (traineeData) => {
  //          this.recommendationEntries = traineeData
  //            .filter(data => {
  //              const hasFinalizedAssessment = data.assessments?.some((a: { isFinalized: any; }) => a.isFinalized);
  //              const isInvoiceCleared = data.paymentSummary?.statusMessage === 'Cleared';
  //              return hasFinalizedAssessment && isInvoiceCleared;
  //            })
  //            .map(data => ({
  //              traineeId: data.traineeId,
  //              traineeName: data.traineeName,
  //              assessmentId: null,
  //              invoiceId: null,
  //              recommendationText: '',
  //              recommendationDate: new Date().toISOString().substring(0, 10),
  //              recommendationStatus: 'pending',
  //              assessments: data.assessments,
  //              invoices: data.invoices,
  //              paymentSummary: data.paymentSummary
  //            }));
  //        },

  //        error: (err) => {
  //          console.error('Error loading trainee data:', err);
  //        }
  //      });
  //    },
  //    error: (err) => {
  //      console.error('Error loading batch data:', err);
  //    }
  //  });
  //}

  onBatchChanged(batchId: number) {
    this.recommendationEntries = [];
    this.selectedInstructorName = null;
    this.selectedInstructorId = null;

    forkJoin([
      this.recommendationService.getInstructorAndTrainees(batchId),
      this.recommendationService.getRecommendationsByBatch(batchId) // নতুন মেথড ব্যবহার
    ]).subscribe({
      next: ([batchRes, batchRecommendations]) => {
        this.selectedInstructorName = batchRes.instructor?.instructorName || null;
        this.selectedInstructorId = batchRes.instructor?.instructorId || null;

        if (!batchRes.trainees || batchRes.trainees.length === 0) {
          return;
        }

        // Get trainee IDs that already have recommendations
        const existingTraineeIds = batchRecommendations.map(rec => rec.traineeId);

        // Filter out trainees who already have recommendations
        const eligibleTrainees = batchRes.trainees
          .filter(trainee => !existingTraineeIds.includes(trainee.traineeId));

        if (eligibleTrainees.length === 0) {
          alert('All trainees in this batch already have recommendations');
          return;
        }

        // Create requests for eligible trainees
        const traineeRequests = eligibleTrainees.map((trainee: any) => {
          const traineeId = trainee.traineeId;
          const traineeName = trainee.traineeName || trainee.registration?.traineeName || trainee.name || 'Unknown';

          return forkJoin([
            this.recommendationService.getInvAssessByTrainee(traineeId),
            this.recommendationService.getTraineePaymentSummary(traineeId)
          ]).pipe(
            map(([assessmentRes, paymentRes]) => ({
              traineeId,
              traineeName,
              assessments: assessmentRes.assessments || [],
              invoices: assessmentRes.invoices || [],
              paymentSummary: paymentRes
            }))
          );
        });

        forkJoin(traineeRequests).subscribe({
          next: (traineeData) => {
            this.recommendationEntries = traineeData
              .filter(data => {
                const hasFinalizedAssessment = data.assessments?.some((a: { isFinalized: any; }) => a.isFinalized);
                const isInvoiceCleared = data.paymentSummary?.statusMessage === 'Cleared';
                return hasFinalizedAssessment && isInvoiceCleared;
              })
              .map(data => ({
                traineeId: data.traineeId,
                traineeName: data.traineeName,
                assessmentId: null,
                invoiceId: null,
                recommendationText: '',
                recommendationDate: new Date().toISOString().substring(0, 10),
                recommendationStatus: 'pending',
                assessments: data.assessments,
                invoices: data.invoices,
                paymentSummary: data.paymentSummary
              }));

            if (this.recommendationEntries.length === 0) {
              alert('No eligible trainees found (must have finalized assessment and cleared payment)');
            }
          },
          error: (err) => {
            console.error('Error loading trainee data:', err);
          }
        });
      },
      error: (err) => {
        console.error('Error loading batch data:', err);
      }
    });
  }
  

  getAssessmentStatusText(assessment: any): string {
    if (!assessment || !assessment.assessmentId) {
      return 'N/A';
    }

    const dateStr = assessment.assessmentDate
      ? new Date(assessment.assessmentDate).toLocaleDateString()
      : '';

    // Check if isFinalized is explicitly false
    if (assessment.isFinalized === true) {
      return `${assessment.assessmentType} - ${dateStr} (Assessment Finalized)`;
    } else if (assessment.isFinalized === false) {
      return `${assessment.assessmentType} - ${dateStr} (Assessment Not Finalized)`;
    } else {
      // isFinalized is missing or undefined
      return `${assessment.assessmentType || 'Unknown'} - ${dateStr || 'No Date'} (N/A)`;
    }
  }
    

  onDelete(rec: any) {
    if (confirm(`Do you want to delete this?`)) {
      this.recommendationService.deleteRecommendation(rec.recommendationId).subscribe({
        next: () => this.loadRecommendations()
      });
    }
  }

  getInvoiceStatusText(entry: RecommendationEntry): string {
    if (!entry.paymentSummary) return 'Loading payment status...';
    if (entry.paymentSummary.invoiceNo) {
      return entry.paymentSummary.statusMessage === 'Cleared'
        ? `${entry.paymentSummary.invoiceNo} (Cleared)`
        : entry.paymentSummary.invoiceNo;
    }
    return entry.paymentSummary.statusMessage === 'Cleared'
      ? 'Cleared (No Invoice)'
      : 'Not Cleared';
  }

  isPaymentCleared(entry: RecommendationEntry): boolean {
    return entry.paymentSummary?.statusMessage === 'Cleared';
  }

  getStatusBadgeClass(entry: RecommendationEntry): any {
    return {
      'bg-success text-white': entry.paymentSummary?.statusMessage === 'Cleared',
      'bg-warning text-dark': entry.paymentSummary?.statusMessage === 'Not Cleared',
      'bg-secondary text-white': !entry.paymentSummary?.statusMessage
    };
  }
  recommendationDate: any; // you can use 'Date' instead of 'any' if you prefer
  batchId!: number;
  instructorId!: number;
  submitRecommendations() {
    if (!this.selectedBatchId || !this.selectedInstructorId) return;

    const payload: RecommendationCreateDTO = {
      recommendationDate: new Date().toISOString().substring(0, 10),
      batchId: this.selectedBatchId,
      instructorId: this.selectedInstructorId,
      recommendations: this.recommendationEntries.map(entry => ({
        traineeId: entry.traineeId,
        assessmentId: entry.assessmentId!,
        invoiceId: entry.invoiceId!,
        recommendationText: entry.recommendationText,
        recommendationStatus: entry.recommendationStatus
      }))
    };

    console.log('Submitting Recommendation Payload:', payload);

    this.recommendationService.createRecommendations(payload).subscribe({
      next: (res) => {
        console.log('API Response:', res);
        alert('Recommendations submitted successfully.');
        this.loadRecommendations();
        this.closeModal();
      },
      error: (err) => {
        console.error('Error submitting recommendations:', err);
        alert('Something went wrong.');
      }
    });
  }

  showDetailsModal = false;
  selectedRecommendation: Recommendation | null = null;

  
  openDetailsModal(recommendationId: number) {
    this.recommendationService.getRecommendation(recommendationId).subscribe({
      next: (res: any) => {
        this.selectedRecommendation = {
          ...res,
          trainee: {
            traineeId: res.traineeId,
            TraineeIDNo: res.trainee?.TraineeIDNo || res.trainee?.traineeIDNo, // কেস সেনসিটিভিটি হ্যান্ডল করুন
            registration: {
              traineeName: res.trainee?.registration?.traineeName
            }
          },
        };
        this.showDetailsModal = true;
      },
      error: (err) => {
        console.error('Error loading recommendation details:', err);
        alert('Failed to load recommendation details');
      }
    });
  }

  showEditModal = false;
  selectedEditRecommendation: Recommendation | null = null;

  
  openEditModal(recommendationId: number) {
    this.recommendationService.getRecommendation(recommendationId).subscribe({
      next: (res: any) => {
        console.log('API Response:', res); // লগ দেখুন
        this.selectedEditRecommendation = {
          ...res,
          trainee: {
            traineeId: res.traineeId,
            TraineeIDNo: res.trainee?.TraineeIDNo || res.trainee?.traineeIDNo, // কেস সেনসিটিভিটি হ্যান্ডল করুন
            registration: {
              traineeName: res.trainee?.registration?.traineeName
            }
          },
          instructor: res.instructor,
          assessment: res.assessment,
          invoice: res.invoice,
          batch: res.batch
        };
        this.showEditModal = true;
      },
      error: (err) => {
        console.error('Error loading recommendation for edit:', err);
        alert('Failed to load recommendation for editing.');
      }
    });
  }
  // In your recommendation.component.ts
  submitEditRecommendation() {
    if (!this.selectedEditRecommendation) return;

    const updatedData = {
      recommendationId: this.selectedEditRecommendation.recommendationId,
      recommendationDate: this.selectedEditRecommendation.recommendationDate,
      recommendationText: this.selectedEditRecommendation.recommendationText,
      recommendationStatus: this.selectedEditRecommendation.recommendationStatus,
      instructorId: this.selectedEditRecommendation.instructorId,
      traineeId: this.selectedEditRecommendation.traineeId,
      batchId: this.selectedEditRecommendation.batchId,
      assessmentId: this.selectedEditRecommendation.assessmentId,  // Add this
      invoiceId: this.selectedEditRecommendation.invoiceId        // Add this
    };

    this.recommendationService.updateRecommendation(updatedData).subscribe({
      next: () => {
        alert('Recommendation updated successfully.');
        this.loadRecommendations();
        this.showEditModal = false;
      },
      error: (err) => {
        console.error('Update failed:', err);
        alert('Failed to update recommendation.');
      }
    });
  }

}
