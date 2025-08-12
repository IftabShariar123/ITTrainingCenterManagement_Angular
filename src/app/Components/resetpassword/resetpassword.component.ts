import { Component, Input } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../Services/auth.service';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './resetpassword.component.html',
  styleUrls: ['./resetpassword.component.css']
})
export class ResetPasswordComponent {
  @Input() email!: string;
  @Input() token!: string;

  resetForm!: FormGroup;
  message: string = '';


  constructor(private fb: FormBuilder, private router: Router,
 private authService: AuthService) {
    this.resetForm = this.fb.group({
      newPassword: ['', Validators.required]
    });
  }
  showPassword = false;

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }



  onReset() {
    if (this.resetForm.invalid) {
      this.message = 'Please enter a valid password';
      return;
    }

    if (!this.email) {
      this.message = 'Email is required';
      return;
    }

    const model = {
      email: this.email,
      token: encodeURIComponent(this.token),
      newPassword: this.resetForm.value.newPassword
    };

    console.log('Sending reset payload:', model); // Verify payload before sending

    this.authService.resetPassword(model).subscribe({
      next: (res) => {
        this.message = res.message || 'Password reset successfully!';
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (err) => {
        console.error('Reset error:', err);
        this.message = err.error?.message || 'Password reset failed';
      }
    });
  }
}
