import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DailySalesService } from '../../Services/dailysalesreport.service';
import { EmployeeService } from '../../Services/employee.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'appdailysales-monitor',
  standalone:true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './dailysalesreport.component.html',
})
export class DailySalesMonitorComponent implements OnInit {
  form!: FormGroup;
  salesRecords: any[] = [];
  employees: any[] = [];

  constructor(
    private fb: FormBuilder,
    private salesService: DailySalesService,
    private employeeService: EmployeeService
  ) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      employeeId: [0],
      startDate: [null],
      endDate: [null],
    });

    this.employeeService.getAllEmployees().subscribe((res) => {
      this.employees = res;
    });
  }

  search() {
    const { employeeId, startDate, endDate } = this.form.value;
    if (employeeId && startDate && endDate) {
      this.salesService.getByEmployeeAndDateRange(employeeId, startDate, endDate)
        .subscribe(res => {
          this.salesRecords = res;
        });
    }
  }
  get grandTotal(): number {
    return this.salesRecords.reduce((sum, record) => sum + (record.newCollections + record.dueCollections), 0);
  }


  exportToPDF() {
    const doc = new jsPDF();
    const columns = ['Date', 'New Collections', 'Due Collections', 'Remarks', 'Employee'];
    const rows = this.salesRecords.map(record => [
      new Date(record.date).toLocaleDateString(),
      record.newCollections,
      record.dueCollections,
      record.remarks,
      record.employee?.employeeName
    ]);

    // autoTable returns the final position info
    autoTable(doc, {
      head: [columns],
      body: rows,
      startY: 20,
    });

    // Access finalY from doc.lastAutoTable
    const finalY = (doc as any).lastAutoTable.finalY;
    doc.text(`Grand Total (New + Due Collections): ${this.grandTotal}`, 14, finalY + 10);

    doc.save('DailySalesReport.pdf');

  }


  exportToExcel() {
    const worksheet = XLSX.utils.json_to_sheet(this.salesRecords);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'SalesReport');
    XLSX.writeFile(workbook, 'DailySalesReport.xlsx');
  }
}
