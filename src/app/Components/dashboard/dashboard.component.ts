
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../Services/auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {

  constructor(private router: Router,
    private authService: AuthService) { }

  //goTo(route: string) {
  //  this.router.navigate(['/' + route]);
  //}


  goTo(route: string) {
    const permissionMap: { [key: string]: string } = {
      department: 'Department.View',
    };

    const requiredPermission = permissionMap[route];

    if (!requiredPermission) {
      this.router.navigate(['/' + route]);
      return;
    }

    // Always get fresh permissions
    this.authService.getUserPermissionsFromServer().subscribe({
      next: (permissions) => {
        if (permissions.includes(requiredPermission)) {
          // Update localStorage if you want
          localStorage.setItem('permissions', JSON.stringify(permissions));
          this.router.navigate(['/' + route]);
        } else {
          alert('You do not have permission to access this module.');
        }
      },
      error: () => {
        alert('Could not verify permissions.');
      }
    });
  }



}
