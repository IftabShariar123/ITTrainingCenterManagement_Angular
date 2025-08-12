// src/app/components/register/register.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../Services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms'
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
//import { MatError } from '@angular/material/form-field';


@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    RouterLink

   // MatError
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  errorMessage!: string;
  successMessage!: string;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      fullName: ['', Validators.required],
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      contactNo: ['',Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  showPassword: boolean = false;

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }


  onSubmit() {
    if (this.registerForm.invalid) {
      return;
    }

    const { fullName, username, email, password, contactNo } = this.registerForm.value;
    this.authService.register(fullName, username, email, password, contactNo).subscribe(
      (response: any) => {
        // ✅ extract message from response object
        this.successMessage = response.message || 'Registration successful!';
        this.errorMessage = ''; // clear any previous error

        // optional redirect after delay
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error => {
        this.successMessage = ''; // clear any previous success
        if (typeof error.error === 'object') {
          this.errorMessage = JSON.stringify(error.error); // or show a specific field
        } else {
          this.errorMessage = error.error || 'Registration failed';
        }
      }
    );
  }
}
