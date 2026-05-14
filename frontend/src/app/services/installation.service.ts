import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Platform } from '../models/types';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class InstallationService {
  private apiUrl = `${environment.apiUrl}/installations`;

  constructor(private http: HttpClient) {}

  create(platform: Platform, selectedSoftware: string[]): Observable<{ id: string }> {
    return this.http.post<{ id: string }>(this.apiUrl, { platform, selectedSoftware });
  }

  getStatus(installationId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${installationId}`);
  }

  start(installationId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${installationId}/start`, {});
  }

  retryTask(installationId: string, taskId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${installationId}/retry/${taskId}`, {});
  }

  getLogs(installationId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${installationId}/logs`);
  }
}
