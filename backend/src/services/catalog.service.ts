import { SoftwareItem, Platform } from '../types';
import { loadCatalog } from '../plugins/plugin.loader';

export class CatalogService {
  private catalog: SoftwareItem[];

  constructor() {
    this.catalog = loadCatalog();
  }

  getAll(): SoftwareItem[] {
    return this.catalog;
  }

  getById(id: string): SoftwareItem | undefined {
    return this.catalog.find((item) => item.id === id);
  }

  getByPlatform(platform: string): SoftwareItem[] {
    return this.catalog.filter((item) => platform in item.platforms);
  }

  getDependencyOrder(selectedIds: string[], platform: Platform): string[] {
    const selected = new Set(selectedIds);
    const ordered: string[] = [];
    const visited = new Set<string>();

    const visit = (id: string) => {
      if (visited.has(id)) return;
      visited.add(id);

      const item = this.getById(id);
      if (!item) return;

      // Visit dependencies first
      for (const dep of item.dependencies) {
        if (selected.has(dep)) {
          visit(dep);
        }
      }
      ordered.push(id);
    };

    for (const id of selectedIds) {
      visit(id);
    }

    return ordered;
  }
}
