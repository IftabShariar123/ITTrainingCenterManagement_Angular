import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './Services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  imports: [CommonModule, RouterModule],


})


export class AppComponent implements OnInit {
  title = 'TSPManagement';
  isAuthenticated = false;
  username: string | null = null;

  constructor(private router: Router , private authService: AuthService ) { }

  ngOnInit(): void {
    // ✅ Reactively listen to login/logout state
    this.authService.currentUser.subscribe(user => {
      this.isAuthenticated = !!user?.token;
      this.username = user?.username || null;
    });

    // Logo animation (no changes)
    const cpuCore = document.getElementById("cpu-core");
    if (cpuCore) {
      setInterval(() => {
        cpuCore.style.transform = "scale(0.95)";
        setTimeout(() => {
          cpuCore.style.transform = "scale(1)";
        }, 500);
      }, 2000);
    }
  }

  logout() {
    this.authService.logout(); // this will also trigger .next(null)
  }
}

