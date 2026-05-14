import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CatalogService } from '../../services/catalog.service';
import { InstallationService } from '../../services/installation.service';
import { SoftwareItem, Platform, VersionCheckResult } from '../../models/types';

@Component({
  selector: 'app-software-selection',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="selection-page">
      <h2>Select Your Setup</h2>

      <!-- Platform Selection -->
      <section class="section">
        <h3>1. Choose your platform</h3>
        <div class="platform-grid">
          <button
            *ngFor="let p of platforms"
            [class.selected]="selectedPlatform === p.value"
            (click)="selectPlatform(p.value)"
            class="platform-btn">
            <span class="platform-icon">{{ p.icon }}</span>
            <span>{{ p.label }}</span>
          </button>
        </div>
      </section>

      <!-- Software Selection -->
      <section class="section">
        <h3>2. Select software to install</h3>
        <div class="controls">
          <button (click)="selectAll()" class="btn-sm">Select All</button>
          <button (click)="deselectAll()" class="btn-sm">Deselect All</button>
        </div>
        <div class="software-grid">
          <div
            *ngFor="let item of catalog"
            class="software-card"
            [class.selected]="isSelected(item.id)"
            (click)="toggleSoftware(item.id)">
            <div class="card-header">
              <input type="checkbox" [checked]="isSelected(item.id)" />
              <strong>{{ item.displayName }}</strong>
            </div>
            <span class="category">{{ item.category }}</span>
            <span class="version">v{{ item.version }}</span>
            <span *ngIf="getInstalledVersion(item.id)" class="installed">
              ✓ Installed: v{{ getInstalledVersion(item.id) }}
            </span>
            <span *ngIf="!getInstalledVersion(item.id)" class="not-installed">
              ✗ Not installed
            </span>
            <span *ngIf="item.dependencies.length" class="deps">
              Requires: {{ item.dependencies.join(', ') }}
            </span>
          </div>
        </div>
      </section>

      <!-- Actions -->
      <section class="actions">
        <p class="summary">
          {{ selectedSoftware.length }} package(s) selected for {{ selectedPlatform }}
        </p>
        <button
          class="btn-primary"
          [disabled]="!selectedPlatform || selectedSoftware.length === 0 || isLoading"
          (click)="startInstallation()">
          {{ isLoading ? 'Starting...' : 'Start Installation' }}
        </button>
      </section>
    </div>
  `,
  styles: [`
    .selection-page { padding: 16px 0; }
    .section { margin-bottom: 32px; }
    h2 { color: #1a1a2e; margin-bottom: 24px; }
    h3 { color: #333; margin-bottom: 12px; }

    .platform-grid {
      display: flex; gap: 16px; flex-wrap: wrap;
    }
    .platform-btn {
      display: flex; flex-direction: column; align-items: center;
      padding: 20px 32px; border: 2px solid #e0e0e0; border-radius: 12px;
      background: #fff; cursor: pointer; transition: all 0.2s;
    }
    .platform-btn:hover { border-color: #0f3460; }
    .platform-btn.selected { border-color: #0f3460; background: #e8f0fe; }
    .platform-icon { font-size: 2rem; margin-bottom: 8px; }

    .controls { margin-bottom: 12px; display: flex; gap: 8px; }
    .btn-sm {
      padding: 4px 12px; border: 1px solid #ccc; border-radius: 4px;
      background: #f5f5f5; cursor: pointer; font-size: 0.85rem;
    }

    .software-grid {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 12px;
    }
    .software-card {
      padding: 16px; border: 2px solid #e0e0e0; border-radius: 8px;
      cursor: pointer; transition: all 0.2s; background: #fff;
    }
    .software-card:hover { border-color: #0f3460; }
    .software-card.selected { border-color: #0f3460; background: #e8f0fe; }
    .card-header { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
    .category { font-size: 0.8rem; color: #666; display: block; }
    .version { font-size: 0.8rem; color: #888; }
    .installed { font-size: 0.8rem; color: #388e3c; display: block; margin-top: 4px; font-weight: 500; }
    .not-installed { font-size: 0.8rem; color: #9e9e9e; display: block; margin-top: 4px; }
    .deps { font-size: 0.75rem; color: #e65100; display: block; margin-top: 4px; }

    .actions { display: flex; align-items: center; gap: 16px; padding-top: 16px; border-top: 1px solid #eee; }
    .summary { color: #555; }
    .btn-primary {
      padding: 12px 32px; background: #0f3460; color: #fff; border: none;
      border-radius: 8px; font-size: 1rem; cursor: pointer;
    }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
  `]
})
export class SoftwareSelectionComponent implements OnInit {
  catalog: SoftwareItem[] = [];
  selectedSoftware: string[] = [];
  selectedPlatform: Platform = 'macos';
  isLoading = false;
  versionMap: Map<string, string | null> = new Map();

  platforms = [
    { value: 'macos' as Platform, label: 'macOS', icon: '🍎' },
    { value: 'windows' as Platform, label: 'Windows', icon: '🪟' },
    { value: 'linux' as Platform, label: 'Linux', icon: '🐧' },
  ];

  constructor(
    private catalogService: CatalogService,
    private installationService: InstallationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.catalogService.getAll().subscribe((items) => {
      this.catalog = items;
    });
    this.detectPlatform();
    this.loadVersions();
  }

  private detectPlatform(): void {
    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes('mac')) this.selectedPlatform = 'macos';
    else if (ua.includes('win')) this.selectedPlatform = 'windows';
    else this.selectedPlatform = 'linux';
  }

  private loadVersions(): void {
    this.catalogService.checkVersions(this.selectedPlatform).subscribe((results) => {
      this.versionMap.clear();
      for (const r of results) {
        this.versionMap.set(r.softwareId, r.currentVersion);
      }
    });
  }

  getInstalledVersion(softwareId: string): string | null {
    return this.versionMap.get(softwareId) ?? null;
  }

  selectPlatform(platform: Platform): void {
    this.selectedPlatform = platform;
    this.loadVersions();
  }

  toggleSoftware(id: string): void {
    const index = this.selectedSoftware.indexOf(id);
    if (index >= 0) {
      this.selectedSoftware.splice(index, 1);
    } else {
      this.selectedSoftware.push(id);
      // Auto-select dependencies
      const item = this.catalog.find((s) => s.id === id);
      if (item) {
        for (const dep of item.dependencies) {
          if (!this.selectedSoftware.includes(dep)) {
            this.selectedSoftware.push(dep);
          }
        }
      }
    }
  }

  isSelected(id: string): boolean {
    return this.selectedSoftware.includes(id);
  }

  selectAll(): void {
    this.selectedSoftware = this.catalog.map((item) => item.id);
  }

  deselectAll(): void {
    this.selectedSoftware = [];
  }

  startInstallation(): void {
    this.isLoading = true;
    this.installationService
      .create(this.selectedPlatform, this.selectedSoftware)
      .subscribe({
        next: (response) => {
          this.router.navigate(['/progress', response.id]);
        },
        error: () => {
          this.isLoading = false;
        },
      });
  }
}
