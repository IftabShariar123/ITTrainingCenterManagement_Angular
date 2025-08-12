import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { Batch } from "../../Models/batch";
import { ActivatedRoute, Router } from "@angular/router";
import { AssessmentService } from "../../Services/assessment.service";
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from "@angular/material/autocomplete";
import { forkJoin } from "rxjs";
interface BatchInstructor {
  instructorId: number;
  instructorName: string;
}

interface BatchTrainee {
  traineeId: number;
  traineeName: string;      
  traineeIDNo?: string; 
  registration?: {
    traineeName: string;
    traineeIDNo: string;
  };
}

interface BatchDetailsResponse {
  instructor: BatchInstructor | null;
  trainees: BatchTrainee[];
}
interface Trainee {
  traineeId: number;
  traineeName: string;      
  traineeIDNo?: string;     
}

@Component({
  standalone: true,
  selector: 'app-assessment-form',
  imports: [CommonModule, ReactiveFormsModule, FormsModule, MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    ReactiveFormsModule, MatAutocompleteModule,],
  templateUrl: './assessment-form.component.html'
})
export class AssessmentFormComponent implements OnInit {
  assessmentForm: FormGroup;
  assessmentId = 0;
  batches: Batch[] = [];
  trainees: BatchTrainee[] = [];
  //isEditMode = false;
  selectedBatchInstructorName: string = '';
  isSubmitting = false;

  // Dropdown options
  assessmentTypes = ['Weekly Test', 'Final Evaluation', 'Behavioral'];
  participationLevels = ['Low', 'Medium', 'High'];
  skillRatings = ['Poor', 'Average', 'Good', 'Excellent'];
  punctualityOptions = ['AlwaysOnTime', 'UsuallyOnTime', 'OccasionallyLate', 'FrequentlyLate', 'RarelyOnTime'];
  attitudeRatings = ['Poor', 'Average', 'Good', 'Excellent'];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    public router: Router,
    private assessmentService: AssessmentService
  ) {
    this.assessmentForm = this.fb.group({
      assessmentId: [0],
      traineeId: [null, Validators.required],
      batchId: [null, Validators.required],
      instructorId: [{ value: null, disabled: true }],
      assessmentDate: ['', Validators.required],
      assessmentType: ['', Validators.required],
      theoreticalScore: [null, [Validators.min(0), Validators.max(100)]],
      practicalScore: [null, [Validators.min(0), Validators.max(100)]],
      overallScore: [{ value: null, disabled: true }],
      daysPresent: [0, [Validators.required, Validators.min(0)]],
      totalDays: [0, [Validators.required, Validators.min(0)]],
      attendancePercentage: [{ value: 0, disabled: true }],
      participationLevel: [''],
      technicalSkillsRating: [''],
      communicationSkillsRating: [''],
      teamworkRating: [''],
      disciplineRemarks: [''],
      punctuality: [''],
      attitudeRating: [''],
      strengths: [''],
      weaknesses: [''],
      improvementAreas: [''],
      trainerRemarks: [''],
      createdDate: [''],
      lastModifiedDate: [''],
      isFinalized: [false],
    });
  }

  batchSearchControl = new FormControl();
  filteredBatchList: Batch[] = [];
  assessedTraineeIds: number[] = [];


  filterBatches(search: string) {
    const lowerSearch = search.toLowerCase();
    this.filteredBatchList = this.batches.filter(batch =>
      batch.batchName.toLowerCase().includes(lowerSearch)
    );
  }
 

  onBatchSelected(selectedName: string) {
    if (this.isEditMode) return; // Prevent changes in edit mode

    const selected = this.batches.find(b => b.batchName === selectedName);
    if (selected) {
      this.assessmentForm.patchValue({
        batchId: selected.batchId,
        instructorId: selected.instructorId
      });
      this.batchSearchControl.setValue(selected.batchName);
      this.loadBatchDetails(selected.batchId);
    }
  }

  get isEditMode(): boolean {
    return this.assessmentId > 0;
  }


  async ngOnInit(): Promise<void> {
    await this.loadBatches();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      //this.isEditMode = true;
      this.assessmentId = +id;
      await this.loadAssessment(this.assessmentId);
    }

    // Rest of your ngOnInit code...
    this.batchSearchControl.valueChanges.subscribe(searchText => {
      this.filterBatches(searchText || '');
    });

    this.assessmentForm.get('batchId')?.valueChanges.subscribe(batchId => {
      if (batchId) {
        this.loadBatchDetails(batchId);
      } else {
        this.trainees = [];
        this.selectedBatchInstructorName = '';
        this.assessmentForm.patchValue({ instructorId: null, traineeId: null });
      }
    });

    this.assessmentForm.get('theoreticalScore')?.valueChanges.subscribe(() => this.calculateOverallScore());
    this.assessmentForm.get('practicalScore')?.valueChanges.subscribe(() => this.calculateOverallScore());
    this.assessmentForm.get('daysPresent')?.valueChanges.subscribe(() => this.calculateAttendancePercentage());
    this.assessmentForm.get('totalDays')?.valueChanges.subscribe(() => this.calculateAttendancePercentage());
  }


  calculateOverallScore(): void {
    const theoretical = this.assessmentForm.get('theoreticalScore')?.value || 0;
    const practical = this.assessmentForm.get('practicalScore')?.value || 0;
    const overall = (theoretical + practical) / 2;
    this.assessmentForm.patchValue({ overallScore: overall.toFixed(2) });
  }

  calculateAttendancePercentage(): void {
    const present = this.assessmentForm.get('daysPresent')?.value || 0;
    const total = this.assessmentForm.get('totalDays')?.value || 1; // Avoid division by zero
    const percentage = (present / total) * 100;
    this.assessmentForm.patchValue({ attendancePercentage: percentage.toFixed(2) });
  }

   

  loadAssessment(id: number) {
    this.assessmentService.getAssessmentById(id).subscribe({
      next: (data) => {
        // Patch form values
        this.assessmentForm.patchValue(data);
        if (this.isEditMode) {
          this.assessmentForm.get('traineeId')?.disable();
        }

        // Find and set the batch name
        const selectedBatch = this.batches.find(b => b.batchId === data.batchId);
        if (selectedBatch) {
          this.batchSearchControl.setValue(selectedBatch.batchName);
          if (this.isEditMode) {
            this.batchSearchControl.disable(); // Disable control in edit mode
          }
        }

        this.loadBatchDetails(data.batchId);
      },
      error: (error) => console.error('Error loading assessment:', error)
    });
  }

  onSubmit() {
    if (this.assessmentForm.invalid) {
      this.assessmentForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const formData = this.assessmentForm.getRawValue();

    const apiPayload = {
      assessmentDate: new Date(formData.assessmentDate).toISOString().split('T')[0],
      batchId: +formData.batchId,
      instructorId: +formData.instructorId,
      assessments: [
        {
          traineeId: +formData.traineeId,
          assessmentType: formData.assessmentType,
          theoreticalScore: +formData.theoreticalScore,
          practicalScore: +formData.practicalScore,
          daysPresent: +formData.daysPresent,
          totalDays: +formData.totalDays,
          participationLevel: formData.participationLevel,
          technicalSkillsRating: formData.technicalSkillsRating,
          communicationSkillsRating: formData.communicationSkillsRating,
          teamworkRating: formData.teamworkRating,
          disciplineRemarks: formData.disciplineRemarks,
          punctuality: formData.punctuality,
          attitudeRating: formData.attitudeRating,
          strengths: formData.strengths,
          weaknesses: formData.weaknesses,
          improvementAreas: formData.improvementAreas,
          trainerRemarks: formData.trainerRemarks,
          isFinalized: formData.isFinalized
        }
      ]
    };

    const action$ = this.isEditMode
      ? this.assessmentService.updateAssessment(this.assessmentId, apiPayload)
      : this.assessmentService.addAssessment(apiPayload);

    action$.subscribe({
      next: () => {
        alert('Assessment saved successfully!');
        this.router.navigate(['/assessment']);
      },
      error: (error) => {
        console.error('Error saving assessment:', error);
        this.isSubmitting = false;
      }
    });
  }


  loadBatches(): Promise<void> {
    return new Promise((resolve) => {
      this.assessmentService.getBatches().subscribe({
        next: (batches) => {
          this.batches = batches;
          this.filteredBatchList = batches;
          resolve();
        },
        error: (error) => {
          console.error('Error loading batches:', error);
          resolve();
        }
      });
    });
  }



  loadBatchDetails(batchId: number): void {
    forkJoin({
      details: this.assessmentService.getInstructorAndTraineesByBatch(batchId),
      assessedIds: this.assessmentService.getAssessedTraineeIds(batchId)
    }).subscribe({
      next: ({ details, assessedIds }) => {
        // Set instructor info
        this.selectedBatchInstructorName = details.instructor?.instructorName || '';
        this.assessmentForm.patchValue({ instructorId: details.instructor?.instructorId || null });

        // Process all trainees from the batch
        const allTrainees = details.trainees.map(t => ({
          traineeId: t.traineeId,
          traineeName: t.registration?.traineeName || t.traineeName,
          traineeIDNo: t.registration?.traineeIDNo || t.traineeIDNo || ''
        }));

        // Filter logic:
        if (this.isEditMode) {
          // In edit mode - show ALL trainees (including already assessed ones)
          this.trainees = allTrainees;

          // Ensure current trainee is included (in case they were deleted from the batch)
          const currentTraineeId = this.assessmentForm.get('traineeId')?.value;
          if (currentTraineeId && !this.trainees.some(t => t.traineeId === currentTraineeId)) {
            this.assessmentService.getTraineeById(currentTraineeId).subscribe(trainee => {
              this.trainees.push({
                traineeId: trainee.traineeId,
                traineeName: trainee.registration?.traineeName || trainee.traineeName,
                traineeIDNo: trainee.registration?.traineeIDNo || trainee.traineeIDNo || ''
              });
            });
          }
        } else {
          // In create mode - filter out already assessed trainees
          this.trainees = allTrainees.filter(t => !assessedIds.includes(t.traineeId));
        }
      },
      error: (error) => console.error('Error loading batch details:', error)
    });
  }
}
