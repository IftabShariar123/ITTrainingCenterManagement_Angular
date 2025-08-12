
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AssessmentService } from '../../Services/assessment.service';
import { Assessment } from '../../Models/assessment';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-assessment',
  standalone: true,
  imports: [CommonModule, NgxPaginationModule, FormsModule],
  templateUrl: './assessment.component.html',
  styleUrls: ['./assessment.component.css']
})
export class AssessmentComponent implements OnInit {
  @ViewChild('detailsModal') detailsModal!: ElementRef;

  assessmentList: Assessment[] = [];
  filteredList: Assessment[] = [];
  p = 1;
  itemsPerPage = 5;
  selectedAssessment: Assessment | null = null;
  searchTerm = '';

  constructor(
    private assessmentService: AssessmentService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadAssessments();
  }

  loadAssessments(): void {
    this.assessmentService.getAllAssessments().subscribe({
      next: (assessments) => {
        this.assessmentList = assessments;
        this.filteredList = [...this.assessmentList];
      },
      error: (error) => {
        console.error('Error loading assessments:', error);
      }
    });
  }

  // Modal control methods
  //openDetailsModal(assessment: Assessment): void {
  //  this.selectedAssessment = assessment;
  //  this.showModal(this.detailsModal);
  //}

  // assessment.component.ts এ নিচের মতো করে মেথড আপডেট করুন
  openDetailsModal(assessment: Assessment): void {
    this.assessmentService.getAssessmentById(assessment.assessmentId).subscribe({
      next: (detailedAssessment) => {
        this.selectedAssessment = detailedAssessment;
        this.showModal(this.detailsModal);
      },
      error: (error) => {
        console.error('Error loading assessment details:', error);
      }
    });
  }

  closeDetailsModal(): void {
    this.hideModal(this.detailsModal);
    this.selectedAssessment = null;
  }

  private showModal(modal: ElementRef): void {
    if (modal) {
      modal.nativeElement.style.display = 'block';
      modal.nativeElement.classList.add('show');
    }
  }

  private hideModal(modal: ElementRef): void {
    if (modal) {
      modal.nativeElement.style.display = 'none';
      modal.nativeElement.classList.remove('show');
    }
  }

  // Rest of your existing methods...
  onEdit(assessment: Assessment): void {
    this.router.navigate(['/assessment/form', assessment.assessmentId]);
  }

  onDelete(assessment: Assessment): void {
    if (confirm('Are you sure you want to delete this assessment?')) {
      this.assessmentService.deleteAssessment(assessment.assessmentId).subscribe({
        next: () => {
          this.loadAssessments();
        },
        error: (error) => {
          console.error('Error deleting assessment:', error);
        }
      });
    }
  }

  navigateToCreate(): void {
    this.router.navigate(['/assessment/form']);
  }

  filterAssessments(): void {
    if (!this.searchTerm) {
      this.filteredList = [...this.assessmentList];
      return;
    }

    const term = this.searchTerm.toLowerCase();
    this.filteredList = this.assessmentList.filter(assessment =>
      assessment.assessmentType.toLowerCase().includes(term) ||
      (assessment.traineeName && assessment.traineeName.toLowerCase().includes(term)) ||
      (assessment.batchName && assessment.batchName.toLowerCase().includes(term))
    );
  }

  
}
