export interface Permission {
  id?: number;       
  roleName: string;
  permission: string;
}
export interface Role {
  userName: string;
  email: string;
}
export interface UpdateRolePermissions {
  roleName: string;
  permissions: string[];
}
