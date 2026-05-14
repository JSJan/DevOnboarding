import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SoftwareItem, LicenseValidation, VersionCheckResult } from '../models/types';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CatalogService {
  private apiUrl = `${environment.apiUrl}/catalog`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<SoftwareItem[]> {
    return this.http.get<SoftwareItem[]>(this.apiUrl);
  }

  getByPlatform(platform: string): Observable<SoftwareItem[]> {
    return this.http.get<SoftwareItem[]>(`${this.apiUrl}/platform/${platform}`);
  }

  checkVersions(platform: string): Observable<VersionCheckResult[]> {
    return this.http.get<VersionCheckResult[]>(`${environment.apiUrl}/version-check/${platform}`);
  }

  validateLicenses(softwareIds: string[]): Observable<LicenseValidation[]> {
    return this.http.post<LicenseValidation[]>(
      `${environment.apiUrl}/licenses/validate`,
      { softwareIds }
    );
  }
}
