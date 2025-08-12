// src/app/components/batch-transfer/batch-transfer.component.ts
import { Component, OnInit } from '@angular/core';
import { BatchTransferService } from '../../Services/batchtransfer.service';
import { BatchTransfer, TraineeDisplay } from '../../Models/batchtransfer';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Batch } from '../../Models/batch';
import { BatchService } from '../../Services/batch.service';

@Component({
  selector: 'app-batch-transfer',
  standalone: true,
  imports:[CommonModule, FormsModule],
  templateUrl: './batchtransfer.component.html',
  styleUrls: ['./batchtransfer.component.css']
})
export class BatchTransferComponent implements OnInit {
  batchTransfers: BatchTransfer[] = [];
  currentBatchTransfer: BatchTransfer = {} as BatchTransfer;
  isEditing = false;
  batches: Batch[] = [];
  traineeList: TraineeDisplay[] = [];

  constructor(private batchTransferService: BatchTransferService,
    private batchService: BatchService
  ) { }

  ngOnInit(): void {
    this.loadBatchTransfers();
    this.loadBatches();
    this.loadTrainees();
  }
  loadBatches(): void {
    this.batchService.getBatches().subscribe({
      next: (data) => this.batches = data,
      error: (err) => console.error('Failed to load batches', err)
    });
  }
  loadTrainees(): void {
    this.batchTransferService.getTraineeDisplayList().subscribe({
      next: (data) => this.traineeList = data,
      error: (err) => console.error('Failed to load trainees', err)
    });
  }
  loadBatchTransfers(): void {
    this.batchTransferService.getAllBatchTransfers().subscribe({
      next: (data) => this.batchTransfers = data,
      error: (err) => console.error('Failed to load batch transfers', err)
    });
  }

  onSubmit(form: NgForm): void {
    if (form.valid) {
      this.batchTransferService.createBatchTransfer(this.currentBatchTransfer).subscribe({
        next: () => {
          this.resetForm(form);
          this.loadBatchTransfers();
        },
        error: err => this.handleError(err)
      });
    }
  }
  

  private formatDate(dateInput: string | Date): string {
    // Handle both string and Date inputs
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    return date.toISOString().split('T')[0]; // YYYY-MM-DD format
  }

  private showSuccessMessage(message: string): void {
    // You can replace this with a proper notification system
    alert(message);
  }

  private handleError(error: any): void {
    if (error.status === 400) {
      if (error.error.errors) {
        // Handle validation errors
        const validationErrors = error.error.errors;
        let errorMessage = 'Validation errors:\n';

        for (const field in validationErrors) {
          if (validationErrors.hasOwnProperty(field)) {
            errorMessage += `${field}: ${validationErrors[field].join(', ')}\n`;
          }
        }
        alert(errorMessage);
      } else {
        alert(error.error.title || 'Bad request');
      }
    } else if (error.status === 404) {
      alert('Resource not found');
    } else if (error.status === 409) {
      alert('This batch transfer already exists');
    } else {
      alert('An unexpected error occurred. Please try again.');
    }
  }

  editBatchTransfer(transfer: BatchTransfer): void {
    this.currentBatchTransfer = { ...transfer };
    this.isEditing = true;
  }

  deleteBatchTransfer(batchTransferId: number): void {
    if (confirm('Are you sure to delete this batch transfer?')) {
      this.batchTransferService.deleteBatchTransfer(batchTransferId).subscribe({
        next: () => this.loadBatchTransfers(),
        error: err => console.error('Delete failed', err)
      });
    }
  }


  resetForm(form: NgForm): void {
    form.resetForm();
    this.currentBatchTransfer = {} as BatchTransfer;
    this.isEditing = false;
  }

  // Add these methods to your BatchTransferComponent class

  getTraineeName(traineeId: number): string {
    const trainee = this.traineeList.find(t => t.traineeId === traineeId);
    return trainee ? trainee.displayText : 'Unknown';
  }

  getBatchName(batchId: number): string {
    const batch = this.batches.find(b => b.batchId === batchId);
    return batch ? batch.batchName : 'Unknown';
  }
}
