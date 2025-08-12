import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app.routes'; // আপনার AppRoutingModule কে সঠিক ভাবে ইম্পোর্ট করুন
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { AdmissionComponent } from './Components/admission/admission.component';
import { DashboardComponent } from './Components/dashboard/dashboard.component';
import { DayComponent } from './Components/day/day.component';
import { DepartmentComponent } from './Components/department/department.component';
import { DesignationComponent } from './Components/designation/designation.component';
import { OfferComponent } from './Components/offer/offer.component';
import { VisitorComponent } from './Components/visitor/visitor.component';
import { CourseComponent } from './Components/course/course.component';
import { EmployeeComponent } from './Components/employee/employee.component';
import { HomeComponent } from './Components/home/home.component'; // HomeComponent ইম্পোর্ট করুন
import { LoginComponent } from './Components/login/login.component'; // LoginComponent ইম্পোর্ট করুন
import { RegisterComponent } from './Components/register/register.component'; // RegisterComponent ইম্পোর্ট করুন
import { PrivacyComponent } from './Components/privacy/privacy.component'; // PrivacyComponent ইম্পোর্ট করুন
import { BatchComponent } from './Components/batch/batch.component'; // BatchComponent ইম্পোর্ট করুন
import { ClassRoomComponent } from './Components/classroom/classroom.component'; // ClassroomComponent ইম্পোর্ট করুন
import { InstructorComponent } from './Components/instructor/instructor.component'; // InstructorComponent ইম্পোর্ট করুন
import { SlotComponent } from './Components/slot/slot.component'; // SlotComponent ইম্পোর্ট করুন
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { RoleManagementComponent } from './Components/rolemanagement/rolemanagement.component';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { RegistrationComponent } from './Components/registration/registration.component';
import { CourseComboComponent } from './Components/coursecombo/coursecombo.component';
import { MoneyReceiptComponent } from './Components/money-receipt/money-receipt.component';
import { VisitorAssignmentComponent } from './Components/visitorassignment/visitorassignment.component';
import { BatchTransferComponent } from './Components/batchtransfer/batchtransfer.component';
import { DailySalesRecordComponent } from './Components/dailysalesrecord/dailysalesrecord.component';
import { ClassScheduleComponent } from './Components/class-schedule/class-schedule.component';
import { DailySalesMonitorComponent } from './Components/dailysalesreport/dailysalesreport.component';
import { TraineeAttendanceComponent } from './Components/traineeattendance/traineeattendance.component';
import { AssessmentComponent } from './Components/assessment/assessment.component';
import { CertificateComponent } from './Components/certificate/certificate.component';
import { RecommendationComponent } from './Components/recommendation/recommendation.component';
import { ForgotPasswordComponent } from './Components/forgotpassword/forgotpassword.component';
import { ResetPasswordComponent } from './Components/resetpassword/resetpassword.component';
import { RouterModule } from '@angular/router';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent, // HomeComponent ডিক্লেয়ার করুন
    DashboardComponent,
    AdmissionComponent,
    DayComponent,
    DepartmentComponent,
    DesignationComponent,
    OfferComponent,
    VisitorComponent,
    CourseComponent,
    EmployeeComponent,
    LoginComponent, 
    RegisterComponent, 
    PrivacyComponent, 
    BatchComponent, 
    ClassRoomComponent, 
    InstructorComponent, 
    SlotComponent,
    RoleManagementComponent,
    RegistrationComponent,
    CourseComboComponent,
    MoneyReceiptComponent,
    VisitorAssignmentComponent,
    BatchTransferComponent,
    DailySalesRecordComponent,
    ClassScheduleComponent,
    DailySalesMonitorComponent,
    TraineeAttendanceComponent,
    AssessmentComponent,
    CertificateComponent,
    RecommendationComponent,
    ForgotPasswordComponent,
    ResetPasswordComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatAutocompleteModule,
    AppRoutingModule, // AppRoutingModule কে imports অ্যারেতে যোগ করুন
    RouterModule
  
  ],
  providers: [{ provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }], // যদি কোনো সার্ভিস থাকে, সেগুলো এখানে যোগ করুন
  bootstrap: [AppComponent]
})
export class AppModule { }
