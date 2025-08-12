import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../Services/auth.service';
import { CommonModule } from '@angular/common';
import { ResetPasswordComponent } from '../resetpassword/resetpassword.component';

@Component({
  selector: 'app-forgot-password',
  imports: [CommonModule, ReactiveFormsModule, FormsModule, ResetPasswordComponent,],
  templateUrl: './forgotpassword.component.html',
  styleUrls: ['./forgotpassword.component.css']
})
export class ForgotPasswordComponent {
  forgotForm!: FormGroup;
  token: string = '';
  email: string = '';
  message: string = '';
  showResetForm = false;

  constructor(private fb: FormBuilder, private authService: AuthService) {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit() {
    if (this.forgotForm.invalid) return;

    this.authService.forgotPassword(this.forgotForm.value).subscribe({
      next: (res) => {
        this.token = res.token;
        this.email = this.forgotForm.value.email;
        this.message = res.message;
        this.showResetForm = true;
      },
      error: (err) => {
        this.message = 'Failed to send reset token';
      }
    });
  }
}
