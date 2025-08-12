import { Component, ElementRef, HostListener, OnInit } from '@angular/core';
import { VisitorService } from '../../Services/visitor.service';
import { Visitor, Employee } from '../../Models/visitor';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {  VisitorTransfer_Junction } from '../../Models/visitor-employee';

@Component({
  selector: 'app-visitor-assignment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './visitorassignment.component.html',
  styleUrl: './visitorassignment.component.css',
})
export class VisitorAssignmentComponent implements OnInit {
  visitorsFromSearch: Visitor[] = []; // For search results in records section
  unavailableEmployees: Employee[] = [];
  availableEmployees: Employee[] = [];
  selectedUnavailableEmployeeId: number = 0;
  visitorsUnderSelectedEmployee: Visitor[] = [];
  selectedVisitorIds: number[] = [];
  selectedAssignEmployeeId: number = 0;
  isLoading = false;
  visitorSearchTerm: string = '';
  filteredVisitors: Visitor[] = [];
  selectedVisitor: Visitor | null = null;
  allVisitors: Visitor[] = [];
  selectedVisitorDetails: any = null;
  visitorSearchText: string = '';
  unavailableEmpSearchText: string = '';
  filteredUnavailableEmployees: Employee[] = [];
  showUnavailableDropdown = false;
  hovered: number = -1;
  availableEmpSearchText: string = '';
  filteredAvailableEmployees: Employee[] = [];
  showAvailableDropdown = false;
  hoveredAvailable: number = -1;

  newAssignment: VisitorTransfer_Junction = {
    visitorId: 0,
    employeeId: 0,
    createdDate: new Date(),
    transferDate: new Date(), // Default to current date
    notes: '',
    userName: ''
  };


  constructor(private visitorService: VisitorService, private eRef: ElementRef) { }

  ngOnInit(): void {
    this.loadEmployees();
    this.loadAllVisitors();
  }

  loadAllVisitors() {
    this.visitorService.getAllVisitors().subscribe(visitors => {
      this.allVisitors = visitors;
    });
  }

  //searchVisitors() {
  //  if (!this.visitorSearchTerm) {
  //    this.filteredVisitors = [];
  //    return;
  //  }

  //  const term = this.visitorSearchTerm.toLowerCase();
  //  this.filteredVisitors = this.allVisitors.filter(v =>
  //    v.visitorName.toLowerCase().includes(term) ||
  //    v.contactNo.includes(term)
  //  );
  //}

  searchVisitors() {
    if (!this.visitorSearchTerm) {
      this.visitorsFromSearch = [];
      return;
    }

    const term = this.visitorSearchTerm.toLowerCase();
    this.visitorsFromSearch = this.allVisitors.filter(v =>
      v.visitorName.toLowerCase().includes(term) ||
      v.contactNo.includes(term)
    );
  }


  areAllVisibleVisitorsSelected(): boolean {
    if (this.filteredVisitors.length === 0) return false;
    return this.filteredVisitors.every(visitor =>
      this.selectedVisitorIds.includes(visitor.visitorId)
    );
  }

  // Toggle select all/deselect all
  toggleSelectAll(event: any): void {
    const isChecked = event.target.checked;

    if (isChecked) {
      // Add all filtered visitors to selection
      this.filteredVisitors.forEach(visitor => {
        if (!this.selectedVisitorIds.includes(visitor.visitorId)) {
          this.selectedVisitorIds.push(visitor.visitorId);
        }
      });
    } else {
      // Remove all filtered visitors from selection
      this.selectedVisitorIds = this.selectedVisitorIds.filter(id =>
        !this.filteredVisitors.some(visitor => visitor.visitorId === id)
      );
    }
  }

  // Update your existing filterVisitors method to maintain selections
  filterVisitors(): void {
    if (!this.visitorSearchText) {
      this.filteredVisitors = [...this.visitorsUnderSelectedEmployee];
      return;
    }

    const searchTerm = this.visitorSearchText.toLowerCase();
    this.filteredVisitors = this.visitorsUnderSelectedEmployee.filter(visitor =>
      visitor.visitorName.toLowerCase().includes(searchTerm) ||
      visitor.contactNo.includes(searchTerm)
    );
  }


  //selectVisitor(visitor: Visitor) {
  //  // In your selectVisitor method:

  //    this.visitorService.getVisitorWithHistory(visitor.visitorId).subscribe({
  //      next: (details) => {
  //        // Normalize contact number property
  //        this.selectedVisitorDetails = {
  //          ...details,
  //          contactNo: details.contactNo || details.contactNumber
  //        };
  //      },
  //      // ... error handling
  //    });

  //  this.selectedVisitor = visitor;
  //  this.visitorSearchTerm = `${visitor.visitorName} - ${visitor.contactNo}`;
  //  this.filteredVisitors = [];
  //  this.showVisitorDetails(visitor.visitorId);
  //}

  selectVisitor(visitor: Visitor) {
    this.selectedVisitor = visitor;
    this.visitorSearchTerm = `${visitor.visitorName} - ${visitor.contactNo}`;
    this.visitorsFromSearch = [];

    // Load basic visitor details
    this.visitorService.getVisitorById(visitor.visitorId).subscribe({
      next: (visitorDetails) => {
        this.selectedVisitorDetails = {
          ...visitorDetails,
          currentEmployee: null,
          assignmentHistory: []
        };

        // Load assignment history
        this.visitorService.getVisitorAssignmentHistory(visitor.visitorId).subscribe({
          next: (history) => {
            if (history && history.length > 0) {
              this.selectedVisitorDetails.currentEmployee = {
                employeeName: history[0].employeeName
              };
              this.selectedVisitorDetails.assignmentHistory = history;
            }
          },
          error: (err) => console.error('Error loading history:', err)
        });
      },
      error: (err) => console.error('Error loading visitor:', err)
    });
  }


  showVisitorDetails(visitorId: number) {
    this.visitorService.getVisitorWithHistory(visitorId).subscribe({
      next: (details) => {
        this.selectedVisitorDetails = {
          ...details,
          // Format all previous employees (not just the immediate previous)
          previousEmployees: this.getAllPreviousEmployees(details.assignmentHistory)
        };
      },
      error: (err) => {
        console.error('Error loading visitor details:', err);
        this.selectedVisitorDetails = null;
      }
    });
  }

  private getAllPreviousEmployees(history: any[]): string {
    if (!history || history.length <= 1) return 'None';

    // Get all unique previous employees (skip current)
    const previousEmployees = history
      .slice(1) // Skip current assignment
      .map(a => a.employeeName)
      .filter((name, index, self) => self.indexOf(name) === index); // Get distinct names

    return previousEmployees.length > 0
      ? previousEmployees.join(', ')
      : 'None';
  }


  //loadEmployees() {
  //  this.visitorService.getEmployees().subscribe((emps: Employee[]) => {
  //    this.unavailableEmployees = emps;
  //    this.filteredUnavailableEmployees = [...emps];
  //    this.availableEmployees = emps.filter(e => e.isAvailable);
  //    this.filteredAvailableEmployees = [...this.availableEmployees];
  //  });
  //}

  loadEmployees() {
    this.visitorService.getEmployees().subscribe((emps: Employee[]) => {
      // Filter only employees who are willing to sell
      const willingEmployees = emps.filter(e => e.isWillingToSell);

      this.unavailableEmployees = willingEmployees; // show all for selection
      this.availableEmployees = willingEmployees.filter(e => e.isAvailable);

      this.filteredUnavailableEmployees = [...this.unavailableEmployees];
      this.filteredAvailableEmployees = [...this.availableEmployees];
    });
  }


  filterUnavailableEmployees() {
    const search = this.unavailableEmpSearchText.toLowerCase();
    this.filteredUnavailableEmployees = this.unavailableEmployees.filter(emp =>
      emp.employeeName.toLowerCase().includes(search)
    );
  }

  selectUnavailableEmployee(emp: Employee) {
    this.selectedUnavailableEmployeeId = emp.employeeId;
    this.unavailableEmpSearchText = emp.employeeName;
    this.showUnavailableDropdown = false;
    this.onUnavailableEmployeeChange();
  }

  filterAvailableEmployees() {
    const search = this.availableEmpSearchText.toLowerCase();
    this.filteredAvailableEmployees = this.availableEmployees.filter(emp =>
      emp.employeeName.toLowerCase().includes(search)
    );
  }

  selectAvailableEmployee(emp: Employee) {
    this.selectedAssignEmployeeId = emp.employeeId;
    this.availableEmpSearchText = emp.employeeName;
    this.showAvailableDropdown = false;
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.showUnavailableDropdown = false;
      this.showAvailableDropdown = false;
    }
  }
  onUnavailableEmployeeChange() {
    if (this.selectedUnavailableEmployeeId === 0) {
      this.visitorsUnderSelectedEmployee = [];
      this.filteredVisitors = [];
      this.selectedVisitorIds = [];
      return;
    }

    this.visitorService.getVisitorsByEmployee(this.selectedUnavailableEmployeeId).subscribe(visitors => {
      this.visitorsUnderSelectedEmployee = visitors;
      this.filteredVisitors = [...visitors]; // Initialize filtered list
      this.selectedVisitorIds = [];
    });
  }
  

  toggleVisitorSelection(visitorId: number, event: any) {
    if (event.target.checked) {
      if (!this.selectedVisitorIds.includes(visitorId)) {
        this.selectedVisitorIds.push(visitorId);
      }
    } else {
      this.selectedVisitorIds = this.selectedVisitorIds.filter(id => id !== visitorId);
    }
  }

  

  assignVisitors() {
    // First validate the userName
    if (!this.newAssignment.userName || this.newAssignment.userName.trim() === '') {
      alert('Please enter your name before assigning visitors');
      return;
    }

    // Then check other validations
    if (this.selectedVisitorIds.length === 0) {
      alert('Please select at least one visitor to assign');
      return;
    }

    if (!this.selectedAssignEmployeeId) {
      alert('Please select an employee to assign visitors to');
      return;
    }

    this.isLoading = true;

    const payload = {
      visitorIds: this.selectedVisitorIds,
      employeeId: Number(this.selectedAssignEmployeeId),
      transferDate: this.newAssignment.transferDate.toISOString(),
      notes: this.newAssignment.notes || '',
      userName: this.newAssignment.userName.trim() // Ensure trimmed value
    };

    this.visitorService.assignVisitors(payload).subscribe({
      next: () => {
        alert('Visitors assigned successfully!');
        this.isLoading = false;
        this.resetForm();
        this.refreshData();
      },
      error: (err) => {
        this.isLoading = false;
        this.handleError(err);
      }
    });
  }

  private handleError(err: any) {
    console.error('Assignment error:', err);

    if (err.status === 409) {
      alert('These visitors are already assigned to this employee');
    } else if (err.status === 400) {
      alert('Invalid request: ' + (err.error?.message || 'Please check your input'));
    } else {
      alert('An unexpected error occurred. Please try again');
    }
  }
  

  resetForm() {
    // Reset form fields
    this.newAssignment = {
      visitorId: 0,
      employeeId: 0,
      createdDate: new Date(),
      transferDate: new Date(), // Reset to current date
      notes: '',
      userName: ''
    };
  }
  private refreshData() {
    // Refresh the visitors list if an employee was selected
    if (this.selectedUnavailableEmployeeId) {
      this.onUnavailableEmployeeChange();
    }

    // You might want to refresh other data here as needed
  }

  isFormValid(): boolean {
    return this.selectedVisitorIds.length > 0 &&
      this.selectedAssignEmployeeId > 0 &&
      this.newAssignment.userName?.trim() !== '';
  }
}
