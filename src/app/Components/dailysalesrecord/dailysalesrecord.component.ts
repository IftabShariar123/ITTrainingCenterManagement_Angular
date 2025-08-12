import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DailySalesRecordService } from '../../Services/dailysalesrecord.service';
import { DailySalesRecord, MonthlySummary } from '../../Models/dailysalesrecord';
import { CommonModule } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { Employee } from '../../Models/employee';
import { Visitor } from '../../Models/visitor';
import { VisitorService } from '../../Services/visitor.service';

@Component({
  selector: 'app-daily-sales-record',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormsModule, NgxPaginationModule],
  templateUrl: './dailysalesrecord.component.html',
  styleUrl: './dailysalesrecord.component.css'
})
export class DailySalesRecordComponent implements OnInit {
  @ViewChild('myModal') model: ElementRef | undefined;
  recordList: DailySalesRecord[] = [];
  filteredList: DailySalesRecord[] = [];
  recordService = inject(DailySalesRecordService);
  recordForm: FormGroup;
  p: number = 1;
  itemsPerPage: number = 5;
  searchText: string = '';
  isSubmitting = false;
  monthlySummary?: MonthlySummary;
  selectedDate = new Date();
  employees: Employee[] = [];
  allVisitors: Visitor[] = [];
  filteredVisitors: Visitor[] = [];
  selectedVisitor: Visitor | null = null;
  selectedWalkInVisitor: Visitor | null = null;
  totalCollection: number = 0;
  displayedTotal: number = 0;

  constructor(private fb: FormBuilder,
    private dailyrecordservice: DailySalesRecordService,
    private visitorService: VisitorService) {
    this.recordForm = this.fb.group({
      dailySalesRecordId: [0],
      employeeId: ['', Validators.required],
      date: [this.formatDate(new Date()), Validators.required],
      coldCallsMade: [0, [Validators.required, Validators.min(0)]],
      meetingsScheduled: [0, [Validators.required, Validators.min(0)]],
      meetingsConducted: [0, [Validators.required, Validators.min(0)]],
      visitorNo: [''],
      walkInsAttended: [0, [Validators.required, Validators.min(0)]],
      walkInVisitorNo: [''],
      evaluationsAttended: [0, [Validators.required, Validators.min(0)]],
      corporateVisitsScheduled: [0, [Validators.required, Validators.min(0)]],
      corporateVisitsConducted: [0, [Validators.required, Validators.min(0)]],
      newRegistrations: [0, [Validators.required, Validators.min(0)]],
      enrollments: [0, [Validators.required, Validators.min(0)]],
      newCollections: [0, [Validators.required, Validators.min(0)]],
      dueCollections: [0, [Validators.required, Validators.min(0)]],
      remarks: ['']
    });

  }
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }


  ngOnInit(): void {
    this.getVisitors();
    this.getEmployees();
    this.getRecords();
    this.loadMonthlySummary();

    this.recordForm.valueChanges.subscribe(val => {
      const newColl = val.newCollections || 0;
      const dueColl = val.dueCollections || 0;
      this.updateTotalDisplay(newColl, dueColl);
    });
  }
  updateTotalDisplay(extraNew: number = 0, extraDue: number = 0) {
    this.displayedTotal = this.totalCollection + extraNew + extraDue;
  }

  onEmployeeSelect(employeeId: number) {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;

    this.recordService.getEmployeeTotalCollection(employeeId, year, month).subscribe({
      next: (total) => {
        this.totalCollection = total;
        this.updateTotalDisplay(); // Optional if live total needed
      },
      error: (err) => console.error('Error loading total collection:', err)
    });
  }



  getVisitors() {
    this.visitorService.getAllVisitors().subscribe({
      next: (res) => {
        this.allVisitors = res;
        this.filteredVisitors = [...this.allVisitors];
      },
      error: (err) => console.error('Error fetching visitors:', err)
    });
  }

  onVisitorSelect(visitor: Visitor, section: 'coldCalling' | 'walkIn') {
    if (section === 'coldCalling') {
      this.selectedVisitor = visitor;
      const currentVisitorNos = this.recordForm.get('visitorNo')?.value || '';
      const newVisitorNos = currentVisitorNos
        ? `${currentVisitorNos},${visitor.visitorNo}`
        : visitor.visitorNo;
      this.recordForm.get('visitorNo')?.setValue(newVisitorNos);
    } else {
      this.selectedWalkInVisitor = visitor;
      const currentVisitorNos = this.recordForm.get('walkInVisitorNo')?.value || '';
      const newVisitorNos = currentVisitorNos
        ? `${currentVisitorNos},${visitor.visitorNo}`
        : visitor.visitorNo;
      this.recordForm.get('walkInVisitorNo')?.setValue(newVisitorNos);
    }
  }

  getEmployees() {
    this.recordService.getAllEmployees().subscribe({
      next: (res) => {
        this.employees = res;
      },
      error: (err) => console.error('Error fetching employees:', err)
    });
  }

  getEmployeeName(employeeId: number): string {
    const employee = this.employees.find(e => e.employeeId === employeeId);
    return employee ? employee.employeeName : 'N/A';
  }


  openModal() {
    const modal = document.getElementById('myModal');
    if (modal != null) {
      modal.style.display = 'block';
    }

    // Reset form date to today (new month)
    const today = new Date();
    this.recordForm.patchValue({
      date: this.formatDate(today)
    });

    // Load collection for current month if employee already selected
    const employeeId = this.recordForm.get('employeeId')?.value;
    if (employeeId) {
      this.loadTotalCollectionFor(employeeId, today);
    }

    // Subscribe to employee selection — ONLY ONCE
    this.recordForm.get('employeeId')?.valueChanges.subscribe(empId => {
      const selectedDate = new Date(this.recordForm.get('date')?.value);
      if (empId) this.loadTotalCollectionFor(empId, selectedDate);
    });
  }

  loadTotalCollectionFor(employeeId: number, date: Date) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;

    this.recordService.getEmployeeTotalCollection(employeeId, year, month).subscribe({
      next: (total) => {
        this.totalCollection = total;
        this.updateTotalDisplay(); // with 0 new/due inputs
      },
      error: (err) => console.error('Error loading total:', err)
    });
  }


 

  getRecords() {
    this.recordService.getAllRecords().subscribe({
      next: (res) => {
        this.recordList = res;
        this.filteredList = [...this.recordList];
      },
      error: (err) => console.error('Error fetching records:', err)
    });
  }

  getRecordsByDate() {
    this.recordService.getRecordsByDate(this.selectedDate).subscribe({
      next: (res) => {
        this.recordList = res;
        this.filteredList = [...this.recordList];
      },
      error: (err) => console.error('Error fetching records by date:', err)
    });
  }

  loadMonthlySummary() {
    const currentDate = new Date();
    this.recordService.getMonthlySummary(currentDate.getFullYear(), currentDate.getMonth() + 1)
      .subscribe({
        next: (res) => this.monthlySummary = res,
        error: (err) => console.error('Error fetching monthly summary:', err)
      });
  }

  onSubmit() {
    if (this.recordForm.invalid || this.isSubmitting) return;

    this.isSubmitting = true;
    const formData = this.recordForm.value;
    const record: DailySalesRecord = {
      ...formData,
      date: new Date(formData.date)
    };

    const operation = formData.dailySalesRecordId === 0
      ? this.recordService.addRecord(record)
      : this.recordService.updateRecord(formData.dailySalesRecordId, record);

    operation.subscribe({
      next: (res) => {
        this.handleSuccess(formData.dailySalesRecordId === 0 ? 'added' : 'updated');
      },
      error: (err) => {
        this.handleError(err, formData.dailySalesRecordId === 0 ? 'add' : 'update');
      }
    });
  }

  private handleSuccess(action: string) {
    alert(`Record ${action} successfully!`);
    this.getRecords();
    this.loadMonthlySummary();
    this.resetForm();
    this.closeModal(); 
    this.isSubmitting = false;
  }

  private handleError(err: any, action: string) {
    alert(`Error ${action}ing record. Please try again.`);
    this.isSubmitting = false;
  }

  private resetForm() {
    this.recordForm.reset({
      dailySalesRecordId: 0,
      employeeId: '',
      date: this.formatDate(new Date()),
      coldCallsMade: 0,
      meetingsScheduled: 0,
      meetingsConducted: 0,
      visitorNo: '',
      walkInsAttended: 0,
      walkInVisitorNo: '',
      evaluationsAttended: 0,
      corporateVisitsScheduled: 0,
      corporateVisitsConducted: 0,
      newRegistrations: 0,
      enrollments: 0,
      newCollections: 0,
      dueCollections: 0,
      remarks: ''
    });
  }

  

  onEdit(record: DailySalesRecord) {
    this.openModal();
    this.recordForm.patchValue({
      ...record,
      date: this.formatDate(new Date(record.date))
    });
  }

  onDelete(record: DailySalesRecord) {
    const isConfirm = confirm(`Are you sure you want to delete record for ${new Date(record.date).toLocaleDateString()}?`);
    if (isConfirm) {
      this.recordService.deleteRecord(record.dailySalesRecordId).subscribe({
        next: () => {
          alert("Record deleted successfully");
          this.getRecords();
          this.loadMonthlySummary();
        },
        error: (err) => console.error('Error deleting record:', err)
      });
    }
  }

  @ViewChild('detailsModal') detailsModal!: ElementRef;
  selectedRecord: DailySalesRecord | null = null;

  onDetails(record: DailySalesRecord) {
    this.selectedRecord = record;
    const modal = document.getElementById('detailsModal');
    if (modal) {
      modal.style.display = 'block';
    }
  }

  closeDetailsModal() {
    this.selectedRecord = null;
    if (this.detailsModal) {
      this.detailsModal.nativeElement.style.display = 'none';
    }
  }


  closeModal() {
    if (this.model) {
      const modal = this.model.nativeElement;
      modal.style.display = 'none';
      document.body.classList.remove('modal-open');
      const backdrop = document.querySelector('.modal-backdrop');
      if (backdrop) {
        backdrop.remove();
      }
    }
  }
}
