import { execSync } from 'child_process';
import { SoftwareItem, Platform } from '../types';
import { loadCatalog } from '../plugins/plugin.loader';

export interface VersionCheckResult {
  softwareId: string;
  displayName: string;
  installed: boolean;
  currentVersion: string | null;
  catalogVersion: string;
}

export class VersionCheckService {
  private catalog: SoftwareItem[];

  constructor() {
    this.catalog = loadCatalog();
  }

  checkAll(platform: Platform): VersionCheckResult[] {
    return this.catalog.map((item) => this.checkOne(item, platform));
  }

  checkOne(item: SoftwareItem, platform: Platform): VersionCheckResult {
    const platformConfig = item.platforms[platform];
    if (!platformConfig) {
      return {
        softwareId: item.id,
        displayName: item.displayName,
        installed: false,
        currentVersion: null,
        catalogVersion: item.version,
      };
    }

    const version = this.getInstalledVersion(platformConfig.verify);

    return {
      softwareId: item.id,
      displayName: item.displayName,
      installed: version !== null,
      currentVersion: version,
      catalogVersion: item.version,
    };
  }

  checkById(softwareId: string, platform: Platform): VersionCheckResult | null {
    const item = this.catalog.find((s) => s.id === softwareId);
    if (!item) return null;
    return this.checkOne(item, platform);
  }

  private getInstalledVersion(verifyCommand: string): string | null {
    try {
      const output = execSync(verifyCommand, {
        encoding: 'utf-8',
        timeout: 10000,
        stdio: ['pipe', 'pipe', 'pipe'],
      }).trim();

      // Extract version number from output (e.g., "v20.11.0" → "20.11.0", "go version go1.22.0 ..." → "1.22.0")
      const versionMatch = output.match(/v?(\d+\.\d+[\.\d]*)/);
      return versionMatch ? versionMatch[1] : output;
    } catch {
      return null;
    }
  }
}
