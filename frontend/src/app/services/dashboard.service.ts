import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RolePreset, RoleDashboard } from '../models/types';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private apiUrl = `${environment.apiUrl}/dashboard`;

  constructor(private http: HttpClient) {}

  getRoles(): Observable<RolePreset[]> {
    return this.http.get<RolePreset[]>(`${this.apiUrl}/roles`);
  }

  getRoleDashboard(roleId: string): Observable<RoleDashboard> {
    return this.http.get<RoleDashboard>(`${this.apiUrl}/roles/${roleId}`);
  }

  getAllDashboards(): Observable<RoleDashboard[]> {
    return this.http.get<RoleDashboard[]>(this.apiUrl);
  }
}
