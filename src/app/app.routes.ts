import { Routes } from '@angular/router';
import { NgModule } from '@angular/core';
import { AdmissionComponent } from './Components/admission/admission.component'; // পাথ ঠিক করুন যদি '..' থাকে
import { DashboardComponent } from './Components/dashboard/dashboard.component';
import { DayComponent } from './Components/day/day.component';
import { DepartmentComponent } from './Components/department/department.component';
import { DesignationComponent } from './Components/designation/designation.component';
import { OfferComponent } from './Components/offer/offer.component';
import { VisitorComponent } from './Components/visitor/visitor.component';
import { CourseComponent } from './Components/course/course.component';
import { EmployeeComponent } from './Components/employee/employee.component';
import { HomeComponent } from './Components/home/home.component';
import { LoginComponent } from './Components/login/login.component';
import { RegisterComponent } from './Components/register/register.component';
import { PrivacyComponent } from './Components/privacy/privacy.component';
import { RouterModule } from '@angular/router';
import { BatchComponent } from './Components/batch/batch.component'; // BatchComponent ইম্পোর্ট করুন
import { ClassRoomComponent } from './Components/classroom/classroom.component'; // ClassroomComponent ইম্পোর্ট করুন
import { InstructorComponent } from './Components/instructor/instructor.component'; // InstructorComponent ইম্পোর্ট করুন
import { SlotComponent } from './Components/slot/slot.component'; // SlotComponent ইম্পোর্ট করুন
import { RoleManagementComponent } from './Components/rolemanagement/rolemanagement.component';
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
import { ResetPasswordComponent } from './Components/resetpassword/resetpassword.component';
import { ForgotPasswordComponent } from './Components/forgotpassword/forgotpassword.component';
import { AssessmentFormComponent } from './Components/assessment/assessment-form.component';


export const routes: Routes = [
  { path: '', component: HomeComponent }, // ভিজিটর সাইটে আসলে HomeComponent দেখাবে
  { path: 'home', component: HomeComponent }, // /home পাথেও HomeComponent দেখাবে

  { path: 'dashboard', component: DashboardComponent }, // /dashboard পাথে DashboardComponent দেখাবে

  // ড্যাশবোর্ডের কার্ডের জন্য রাউটগুলো
  { path: 'admission', component: AdmissionComponent }, // 'Admission' এর বদলে 'admission' ব্যবহার করুন
  { path: 'batch', component: BatchComponent }, // BatchComponent এর জন্য রাউট
  { path: 'course', component: CourseComponent },
  // CourseCombo এর জন্য যদি আলাদা কম্পোনেন্ট থাকে, তাহলে তার রাউট যোগ করুন
  // { path: 'coursecombo', component: CourseComboComponent }, // যদি CourseComboComponent থাকে
  { path: 'classroom', component: ClassRoomComponent }, // ClassroomComponent এর জন্য রাউট
  { path: 'day', component: DayComponent },
  { path: 'department', component: DepartmentComponent },
  { path: 'designation', component: DesignationComponent },
  { path: 'employee', component: EmployeeComponent },
  { path: 'instructor', component: InstructorComponent }, // InstructorComponent এর জন্য রাউট
  { path: 'offer', component: OfferComponent },
  { path: 'slot', component: SlotComponent }, // SlotComponent এর জন্য রাউট
  { path: 'visitor', component: VisitorComponent },
  { path: 'registration', component: RegistrationComponent },
  { path: 'coursecombo', component: CourseComboComponent },
  { path: 'money-receipt', component: MoneyReceiptComponent },
  { path: 'visitorassignment', component: VisitorAssignmentComponent },
  { path: 'batchtransfer', component: BatchTransferComponent },
  { path: 'dailysalesrecord', component: DailySalesRecordComponent },
  { path: 'class-schedule', component: ClassScheduleComponent },
  { path: 'dailysalesreport', component: DailySalesMonitorComponent },
  { path: 'traineeattendance', component: TraineeAttendanceComponent },
  { path: 'assessment', component: AssessmentComponent },
  { path: 'assessment/form', component: AssessmentFormComponent },
  { path: 'assessment/form/:id', component: AssessmentFormComponent },
  { path: 'certificate', component: CertificateComponent },
  { path: 'recommendation', component: RecommendationComponent },
  { path: 'forgotpassword', component: ForgotPasswordComponent },
  { path: 'resetpassword', component: ResetPasswordComponent },





  // অন্যান্য সাধারণ রাউটগুলো
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'privacy', component: PrivacyComponent },
  { path: 'role', component: RoleManagementComponent },


  // অজানা যেকোনো পাথের জন্য হোম পেজে রিডাইরেক্ট
  { path: '', redirectTo: '/home', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }



