import { CatalogService } from './catalog.service';

interface LicenseValidation {
  softwareId: string;
  valid: boolean;
  type: string;
  message: string;
}

export class LicenseService {
  private catalogService = new CatalogService();

  validateAll(softwareIds: string[]): LicenseValidation[] {
    return softwareIds.map((id) => this.validate(id));
  }

  validate(softwareId: string): LicenseValidation {
    const software = this.catalogService.getById(softwareId);

    if (!software) {
      return {
        softwareId,
        valid: false,
        type: 'unknown',
        message: 'Software not found in catalog',
      };
    }

    // Open-source software is always valid
    if (software.license.type === 'open-source') {
      return {
        softwareId,
        valid: true,
        type: software.license.type,
        message: `Licensed under ${software.license.spdx || 'open-source license'}`,
      };
    }

    // Commercial licenses require key validation
    if (software.license.requiresKey) {
      // TODO: Check against license registry/vault
      return {
        softwareId,
        valid: true,
        type: software.license.type,
        message: 'Commercial license validated',
      };
    }

    return {
      softwareId,
      valid: true,
      type: software.license.type,
      message: 'License approved',
    };
  }

  getInfo(softwareId: string) {
    const software = this.catalogService.getById(softwareId);
    if (!software) return null;
    return software.license;
  }
}
