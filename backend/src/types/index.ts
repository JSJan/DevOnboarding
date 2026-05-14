export type Platform = 'macos' | 'linux' | 'windows';

export type InstallStatus = 'pending' | 'in-progress' | 'completed' | 'failed' | 'skipped';

export interface SoftwareItem {
  id: string;
  name: string;
  displayName: string;
  category: string;
  version: string;
  dependencies: string[];
  platforms: Record<Platform, PlatformInstall>;
  license: LicenseInfo;
}

export interface PlatformInstall {
  manager: string;
  command: string;
  verify: string;
}

export interface LicenseInfo {
  type: 'open-source' | 'commercial';
  spdx?: string;
  requiresKey?: boolean;
}

export interface InstallationRequest {
  id: string;
  platform: Platform;
  selectedSoftware: string[];
  createdAt: string;
}

export interface InstallationTask {
  id: string;
  installationId: string;
  softwareId: string;
  status: InstallStatus;
  logs: string[];
  startedAt?: string;
  completedAt?: string;
  error?: string;
}

export interface InstallationProgress {
  installationId: string;
  taskId: string;
  softwareId: string;
  status: InstallStatus;
  progress: number; // 0-100
  log?: string;
  error?: string;
}
