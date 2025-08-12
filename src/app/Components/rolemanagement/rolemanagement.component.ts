import { Component, OnInit } from '@angular/core';
import { RoleService } from '../../Services/role.service';
import { AuthService } from '../../Services/auth.service';
import { RoleModel, AssignRoleModel } from '../../Models/role';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Modal } from 'bootstrap';

@Component({
  selector: 'app-role-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './rolemanagement.component.html',
  styleUrls: ['./rolemanagement.component.css']
})
export class RoleManagementComponent implements OnInit {
  // Navigation state
  activeTab: string = 'roles';

  // Role management
  newRole: RoleModel = { roleName: '' };
  editingRole: { originalName: string, roleName: string } = { originalName: '', roleName: '' };
  roles: string[] = [];

  // User-Role assignment
  roleAssignment: AssignRoleModel = { username: '', roleName: '' };
  roleRemoval: AssignRoleModel = { username: '', roleName: '' };
  users: any[] = [];
  userRoles: string[] = [];

  userRolesMap: { [username: string]: string[] } = {};

  // Permissions management
  selectedRole: string = '';
  selectedPermissions: { [key: string]: boolean } = {};
  modules: string[] = [];
  modulePermissions: { [module: string]: string[] } = {};
  //selectedUsername: string = '';

  selectedUser: any = null;

  editUser: any = null;
  editUserRoles: string[] = [];
  selectedNewRole: string = '';
  private editUserRolesModal: Modal | undefined;

  // Modals
  private editModal: Modal | undefined;
  private permissionsModal: Modal | undefined;
  private userRolesModal: Modal | undefined;

  constructor(private roleService: RoleService,
  private authService: AuthService) { }

  isStandardPermission(permission: string): boolean {
    const standardPermissions = ['Create', 'Read', 'Update', 'Delete', 'List', 'Approve'];
    return standardPermissions.includes(permission);
  }

  ngOnInit(): void {
    this.loadInitialData();
    this.initializeModals();
  }

  loadInitialData(): void {
    this.loadRoles();
    this.loadUsers();
    this.loadModules();
  }

  initializeModals(): void {
    setTimeout(() => {
      this.editModal = new Modal(document.getElementById('editRoleModal') as HTMLElement);
      this.permissionsModal = new Modal(document.getElementById('permissionsModal') as HTMLElement);
      this.userRolesModal = new Modal(document.getElementById('userRolesModal') as HTMLElement);
      this.editUserRolesModal = new Modal(document.getElementById('editUserRolesModal')!);

    });
  }

  // Navigation methods
  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  isActiveTab(tab: string): boolean {
    return this.activeTab === tab;
  }

  // Role methods
  loadRoles(): void {
    this.roleService.getAllRoles().subscribe(
      roles => this.roles = roles,
      error => console.error('Failed to load roles', error)
    );
  }

  createRole(): void {
    if (!this.newRole.roleName) {
      alert('Role name is required');
      return;
    }

    this.roleService.createRole(this.newRole).subscribe({
      next: (response) => {
        alert(response?.message || 'Role created successfully');
        this.newRole.roleName = '';
        this.loadRoles();
      },
      error: (err) => {
        console.error('Error creating role:', err);
        alert(`Failed to create role: ${err.error?.message || err.message}`);
      }
    });
  }

  openEditModal(roleName: string): void {
    this.editingRole = {
      originalName: roleName,
      roleName: roleName
    };
    this.editModal?.show();
  }

  updateRole(): void {
    if (!this.editingRole.roleName) {
      alert('Role name cannot be empty');
      return;
    }

    if (this.editingRole.originalName === this.editingRole.roleName) {
      this.editModal?.hide();
      return;
    }

    this.roleService.updateRole(this.editingRole.originalName, this.editingRole.roleName).subscribe({
      next: () => {
        alert('Role updated successfully');
        this.loadRoles();
        this.editModal?.hide();
      },
      error: (err) => {
        console.error('Error updating role:', err);
        alert(`Failed to update role: ${err.error?.message || err.message}`);
      }
    });
  }

  deleteRole(roleName: string): void {
    if (!confirm(`Are you sure you want to delete role "${roleName}"?`)) {
      return;
    }

    this.roleService.deleteRole(roleName).subscribe({
      next: () => {
        alert(`Role "${roleName}" deleted successfully`);
        this.loadRoles();
      },
      error: (err) => {
        console.error('Error deleting role:', err);
        alert(`Failed to delete role: ${err.error?.message || err.message}`);
      }
    });
  }

  loadUsers(): void {
    this.roleService.getUsers().subscribe({
      next: (users) => {
        console.log('✅ Loaded users:', users);  // 👈 Check userId exists here
        this.users = users;
      },
      error: (err) => console.error('Failed to load users', err)
    });
  }
    
  onUserSelect(username: string): void {
    if (!username) {
      this.userRoles = [];
      return;
    }

    this.roleService.getUserRoles(username).subscribe({
      next: (roles) => {
        this.userRoles = roles;
        this.userRolesMap[username] = roles;
      },
      error: (err) => console.error('Error fetching user roles:', err)
    });
  }


  getUserRoles(username: string): string[] {
    return this.userRolesMap[username] || [];
  }



  viewUserRoles(username: string): void {
    this.selectedUser = username;
    this.selectedUser = this.users.find(u => u.userName === username); // 👈 Get full user info

    this.roleService.getUserRoles(username).subscribe({
      next: (roles) => {
        this.userRoles = roles;
        this.userRolesModal?.show();
      },
      error: (err) => {
        console.error('Error fetching user roles:', err);
        alert('Failed to fetch user roles');
      }
    });
  }



  //assignRole(): void {
  //  if (!this.roleAssignment.username || !this.roleAssignment.roleName) {
  //    alert('Both username and role are required');
  //    return;
  //  }

  //  this.roleService.assignRoleToUser(this.roleAssignment).subscribe({
  //    next: () => {
  //      alert('Role assigned successfully');
  //      this.roleAssignment = { username: '', roleName: '' };
  //      this.onUserSelect(this.roleAssignment.username);
  //    },
  //    error: (err) => alert(`Failed to assign role: ${err.error?.message || err.message}`)
  //  });
  //}

  //removeRole(): void {
  //  if (!this.roleRemoval.username || !this.roleRemoval.roleName) {
  //    alert('Both username and role are required');
  //    return;
  //  }

  //  if (!confirm(`Remove role "${this.roleRemoval.roleName}" from user "${this.roleRemoval.username}"?`)) {
  //    return;
  //  }

  //  this.roleService.removeRoleFromUser(this.roleRemoval).subscribe({
  //    next: () => {
  //      alert(`Role removed successfully`);
  //      this.roleRemoval = { username: '', roleName: '' };
  //      this.onUserSelect(this.roleRemoval.username);
  //    },
  //    error: (err) => alert(`Failed to remove role: ${err.error?.message || err.message}`)
  //  });
  //}

  // Permission methods
  loadModules(): void {
    this.roleService.getAllModules().subscribe({
      next: (modules) => {
        this.modules = modules;
        modules.forEach(module => {
          this.roleService.getModulePermissions(module).subscribe(
            permissions => this.modulePermissions[module] = permissions
          );
        });
      },
      error: (err) => console.error('Failed to load modules', err)
    });
  }

  openPermissionsModal(roleName: string): void {
    this.selectedRole = roleName;
    this.selectedPermissions = {};

    this.roleService.getRolePermissions(roleName).subscribe({
      next: (permissions) => {
        permissions.forEach(perm => {
          this.selectedPermissions[perm] = true;
        });
        this.permissionsModal?.show();
      },
      error: (err) => {
        console.error('Error loading permissions:', err);
        this.permissionsModal?.show();
      }
    });
  }

  savePermissions(): void {
    const permissionsToSave = Object.keys(this.selectedPermissions)
      .filter(perm => this.selectedPermissions[perm]);

    this.roleService.updateRolePermissions(this.selectedRole, permissionsToSave).subscribe({
      next: () => {
        alert('Permissions updated successfully');
        this.permissionsModal?.hide();
      },
      error: (err) => {
        console.error('Error saving permissions:', err);
        alert('Failed to update permissions');
      }
    });
  }

  softDeleteUser(id: string): void {
    if (!confirm(`Are you sure you want to inactive this user?`)) return;

    this.authService.softDeleteUserById(id).subscribe({
      next: () => {
        alert(`User inactive successfully.`);
        this.loadUsers();
      },
      error: (err) => {
        console.error('Error deactivating user:', err);
        alert(`Failed to deactivate user: ${err.error?.message || err.message}`);
      }
    });
  }


  openEditUserRoles(user: any): void {
    this.editUser = user;
    this.selectedNewRole = '';

    this.roleService.getUserRoles(user.userName).subscribe({
      next: (roles) => {
        this.editUserRoles = roles;
        this.editUserRolesModal?.show();
      },
      error: (err) => {
        console.error('Error loading roles for edit:', err);
        alert('Could not load user roles.');
      }
    });
  }


  addRoleToUser(): void {
    if (!this.selectedNewRole || !this.editUser) {
      alert('Please select a role');
      return;
    }

    const payload = {
      username: this.editUser.userName,
      roleName: this.selectedNewRole
    };

    this.roleService.assignRoleToUser(payload).subscribe({
      next: () => {
        this.editUserRoles.push(this.selectedNewRole);
        this.selectedNewRole = '';
        alert('Role added successfully');
      },
      error: (err) => {
        console.error('Failed to assign role', err);
        alert('Failed to assign role');
      }
    });
  }

  removeRoleFromUser(roleName: string): void {
    if (!confirm(`Remove role "${roleName}" from user "${this.editUser.userName}"?`)) return;

    const payload = {
      username: this.editUser.userName,
      roleName: roleName
    };

    this.roleService.removeRoleFromUser(payload).subscribe({
      next: () => {
        this.editUserRoles = this.editUserRoles.filter(r => r !== roleName);
        alert('Role removed successfully');
      },
      error: (err) => {
        console.error('Failed to remove role', err);
        alert('Failed to remove role');
      }
    });
  }

  updateUserStatusAndRoles(): void {
    if (!this.editUser) return;

    const updatePayload = {
      userId: this.editUser.id,          // ✅ Corrected key name
      isActive: this.editUser.isActive
    };

    this.authService.updateUserStatus(updatePayload).subscribe({
      next: () => {
        alert('User status updated');
        this.editUserRolesModal?.hide();
        this.loadUsers(); // refresh list
      },
      error: (err) => {
        console.error('Failed to update user status', err);
        alert('Failed to update user status');
      }
    });
  }
}
