import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DashboardService } from '../../services/dashboard.service';
import { CatalogService } from '../../services/catalog.service';
import { RoleDashboard, TimeEstimate, VersionCheckResult, Platform } from '../../models/types';

@Component({
  selector: 'app-role-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-page">
      <h2>Onboarding Dashboard</h2>
      <p class="subtitle">Choose a role to see the required software and estimated setup time.</p>

      <!-- Loading Spinner -->
      <div *ngIf="loadingDashboards" class="spinner-container">
        <div class="spinner"></div>
        <span>Loading roles...</span>
      </div>

      <!-- Role Cards -->
      <section class="role-section" *ngIf="!loadingDashboards">
        <div class="role-grid">
          <div
            *ngFor="let d of dashboards"
            class="role-card"
            [class.active]="selectedRoleId === d.role.id"
            (click)="selectRole(d.role.id)">
            <span class="role-icon">{{ d.role.icon }}</span>
            <h3>{{ d.role.name }}</h3>
            <p class="role-desc">{{ d.role.description }}</p>
            <span class="software-count">{{ d.software.length }} tools</span>
          </div>
        </div>
      </section>

      <!-- Selected Role Detail -->
      <section *ngIf="selected" class="detail-section">
        <h3>{{ selected.role.icon }} {{ selected.role.name }}</h3>
        <p class="installed-summary" *ngIf="!loadingVersions">
          <span class="installed-count">{{ installedCount }}/{{ selected.software.length }}</span>
          tools already installed on your machine
        </p>
        <div *ngIf="loadingVersions" class="spinner-inline">
          <div class="spinner small"></div>
          <span>Checking installed versions...</span>
        </div>

        <!-- Time Comparison Summary -->
        <div class="time-comparison">
          <div class="time-card manual">
            <span class="time-label">Manual Setup</span>
            <span class="time-value">{{ selected.totalManualMinutes }} min</span>
            <span class="time-sub">~{{ formatHours(selected.totalManualMinutes) }}</span>
          </div>
          <div class="time-card arrow">
            <span class="arrow-icon">→</span>
          </div>
          <div class="time-card automated">
            <span class="time-label">With Onboarding Tool</span>
            <span class="time-value">{{ selected.totalAutomatedMinutes }} min</span>
            <span class="time-sub">~{{ formatHours(selected.totalAutomatedMinutes) }}</span>
          </div>
          <div class="time-card saved">
            <span class="time-label">Time Saved</span>
            <span class="time-value saved-value">{{ selected.timeSavedMinutes }} min</span>
            <span class="time-sub">{{ selected.timeSavedPercent }}% faster</span>
          </div>
        </div>

        <!-- Per-Software Time Breakdown -->
        <h4>Per-Tool Breakdown</h4>
        <div class="breakdown-table">
          <div class="table-header">
            <span>Software</span>
            <span>Status</span>
            <span>Manual</span>
            <span>Automated</span>
            <span>Saved</span>
          </div>
          <div *ngFor="let t of selected.timeEstimates" class="table-row">
            <span class="sw-name">{{ t.displayName }}</span>
            <span class="status-cell">
              <span *ngIf="getVersion(t.softwareId)" class="installed-badge">✓ v{{ getVersion(t.softwareId) }}</span>
              <span *ngIf="!getVersion(t.softwareId)" class="not-installed-badge">✗ Not installed</span>
            </span>
            <span class="manual-time">{{ t.manualMinutes }} min</span>
            <span class="auto-time">{{ t.automatedMinutes }} min</span>
            <span class="saved-time">{{ t.manualMinutes - t.automatedMinutes }} min</span>
          </div>
        </div>

        <!-- Required Software List -->
        <h4>Required Software</h4>
        <div class="software-list">
          <div *ngFor="let s of selected.software" class="sw-chip" [class.chip-installed]="getVersion(s.id)">
            <div class="chip-header">
              <strong>{{ s.displayName }}</strong>
              <span *ngIf="getVersion(s.id)" class="chip-status installed-badge">✓</span>
              <span *ngIf="!getVersion(s.id)" class="chip-status not-installed-badge">✗</span>
            </div>
            <span class="cat">{{ s.category }}</span>
            <span class="ver" *ngIf="getVersion(s.id)">Installed: v{{ getVersion(s.id) }}</span>
            <span class="ver" *ngIf="!getVersion(s.id)">Required: v{{ s.version }}</span>
          </div>
        </div>

        <!-- Action -->
        <div class="actions">
          <button class="btn-primary" (click)="startSetup()">
            Install {{ selected.role.name }} Stack
          </button>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .dashboard-page { padding: 16px 0; }
    .subtitle { color: #666; margin-bottom: 24px; }

    .role-grid {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px;
    }
    .role-card {
      padding: 24px; border: 2px solid #e0e0e0; border-radius: 12px;
      background: #fff; cursor: pointer; transition: all 0.2s; text-align: center;
    }
    .role-card:hover { border-color: #0f3460; transform: translateY(-2px); }
    .role-card.active { border-color: #0f3460; background: #e8f0fe; }
    .role-icon { font-size: 2.5rem; display: block; margin-bottom: 8px; }
    .role-card h3 { margin: 0 0 8px; color: #1a1a2e; }
    .role-desc { font-size: 0.85rem; color: #555; margin: 0 0 12px; }
    .software-count { font-size: 0.8rem; color: #0f3460; font-weight: 600; }

    .detail-section { margin-top: 32px; }
    .detail-section h3 { font-size: 1.3rem; margin-bottom: 8px; color: #1a1a2e; }
    .detail-section h4 { margin: 24px 0 12px; color: #333; }
    .installed-summary { color: #555; margin-bottom: 16px; font-size: 0.95rem; }
    .installed-count { font-weight: 700; color: #2e7d32; font-size: 1.1rem; }

    /* Time comparison cards */
    .time-comparison {
      display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 24px;
    }
    .time-card {
      flex: 1; min-width: 140px; padding: 20px; border-radius: 12px; text-align: center;
      display: flex; flex-direction: column; gap: 4px;
    }
    .time-card.manual { background: #fff3e0; border: 1px solid #ffe0b2; }
    .time-card.automated { background: #e8f5e9; border: 1px solid #c8e6c9; }
    .time-card.saved { background: #e3f2fd; border: 1px solid #bbdefb; }
    .time-card.arrow {
      flex: 0; min-width: 40px; display: flex; align-items: center; justify-content: center;
      background: transparent; border: none;
    }
    .arrow-icon { font-size: 1.5rem; color: #999; }
    .time-label { font-size: 0.8rem; color: #666; text-transform: uppercase; font-weight: 600; }
    .time-value { font-size: 1.8rem; font-weight: 700; color: #333; }
    .saved-value { color: #1565c0; }
    .time-sub { font-size: 0.85rem; color: #888; }

    /* Breakdown table */
    .breakdown-table { border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; }
    .table-header, .table-row {
      display: grid; grid-template-columns: 2fr 2fr 1fr 1fr 1fr;
      padding: 10px 16px; align-items: center;
    }
    .table-header {
      background: #f5f5f5; font-weight: 600; font-size: 0.85rem; color: #555;
    }
    .table-row { border-top: 1px solid #eee; }
    .table-row:hover { background: #fafafa; }
    .sw-name { font-weight: 500; }
    .manual-time { color: #e65100; }
    .auto-time { color: #2e7d32; }
    .saved-time { color: #1565c0; font-weight: 600; }
    .status-cell { font-size: 0.85rem; }
    .installed-badge { color: #2e7d32; font-weight: 500; }
    .not-installed-badge { color: #9e9e9e; }

    /* Software chips */
    .software-list { display: flex; flex-wrap: wrap; gap: 10px; }
    .sw-chip {
      display: flex; flex-direction: column; padding: 12px 16px;
      background: #fff; border: 1px solid #e0e0e0; border-radius: 8px;
    }
    .sw-chip.chip-installed { border-color: #a5d6a7; background: #f1f8e9; }
    .chip-header { display: flex; align-items: center; gap: 6px; }
    .chip-status { font-size: 0.85rem; }
    .sw-chip .cat { font-size: 0.75rem; color: #666; }
    .sw-chip .ver { font-size: 0.75rem; color: #888; }

    .actions { margin-top: 24px; }
    .btn-primary {
      padding: 12px 32px; background: #0f3460; color: #fff; border: none;
      border-radius: 8px; font-size: 1rem; cursor: pointer;
    }
    .btn-primary:hover { background: #1a4a8a; }

    /* Spinner */
    .spinner-container {
      display: flex; align-items: center; gap: 12px;
      padding: 32px; justify-content: center;
    }
    .spinner-inline {
      display: flex; align-items: center; gap: 8px;
      margin-bottom: 16px; font-size: 0.9rem; color: #666;
    }
    .spinner {
      width: 32px; height: 32px; border: 3px solid #e0e0e0;
      border-top-color: #0f3460; border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    .spinner.small { width: 18px; height: 18px; border-width: 2px; }
    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class RoleDashboardComponent implements OnInit {
  dashboards: RoleDashboard[] = [];
  selectedRoleId: string | null = null;
  selected: RoleDashboard | null = null;
  versionMap: Map<string, string | null> = new Map();
  platform: Platform = 'macos';
  installedCount = 0;
  loadingDashboards = true;
  loadingVersions = true;
  private maxManualMinutes = 25; // for bar scaling

  constructor(
    private dashboardService: DashboardService,
    private catalogService: CatalogService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.detectPlatform();
    this.loadVersions();
    this.dashboardService.getAllDashboards().subscribe((data) => {
      this.dashboards = data;
      this.loadingDashboards = false;
      if (data.length > 0) {
        this.selectRole(data[0].role.id);
      }
    });
  }

  private detectPlatform(): void {
    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes('mac')) this.platform = 'macos';
    else if (ua.includes('win')) this.platform = 'windows';
    else this.platform = 'linux';
  }

  private loadVersions(): void {
    this.loadingVersions = true;
    this.catalogService.checkVersions(this.platform).subscribe((results) => {
      this.versionMap.clear();
      for (const r of results) {
        if (r.installed && r.currentVersion) {
          this.versionMap.set(r.softwareId, r.currentVersion);
        }
      }
      this.loadingVersions = false;
      this.updateInstalledCount();
    });
  }

  getVersion(softwareId: string): string | null {
    return this.versionMap.get(softwareId) ?? null;
  }

  private updateInstalledCount(): void {
    if (!this.selected) return;
    this.installedCount = this.selected.software.filter((s) => this.versionMap.has(s.id)).length;
  }

  selectRole(roleId: string): void {
    this.selectedRoleId = roleId;
    this.selected = this.dashboards.find((d) => d.role.id === roleId) ?? null;
    if (this.selected) {
      this.maxManualMinutes = Math.max(...this.selected.timeEstimates.map((t) => t.manualMinutes), 1);
    }
    this.updateInstalledCount();
  }

  formatHours(minutes: number): string {
    if (minutes < 60) return `${minutes} min`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  }

  barWidth(minutes: number): number {
    return Math.round((minutes / this.maxManualMinutes) * 100);
  }

  startSetup(): void {
    if (!this.selected) return;
    // Navigate to setup page; the software-selection component can read query params
    this.router.navigate(['/setup'], {
      queryParams: { role: this.selected.role.id },
    });
  }
}
