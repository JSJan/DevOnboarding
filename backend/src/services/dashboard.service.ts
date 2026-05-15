import { RolePreset, RoleDashboard, TimeEstimate } from '../types';
import { CatalogService } from './catalog.service';

const ROLE_PRESETS: RolePreset[] = [
  {
    id: 'testing',
    name: 'Testing / QA Engineer',
    description:
      'End-to-end, API, performance, and browser automation testing tools.',
    icon: '🧪',
    softwareIds: [
      'git', 'node', 'npm', 'python', 'vscode',
      'playwright', 'cypress', 'selenium', 'jest',
      'postman', 'k6', 'jmeter', 'allure',
      'docker', 'postgres', 'pgadmin',
    ],
  },
  {
    id: 'ai-developer',
    name: 'AI / ML Developer',
    description:
      'AI coding assistants, model runtimes, GPU toolkits, notebooks, and cloud CLIs.',
    icon: '🤖',
    softwareIds: [
      'git', 'python', 'conda', 'jupyter',
      'node', 'npm',
      'copilot-cli', 'claude-cli', 'cursor',
      'ollama', 'huggingface-cli', 'cuda-toolkit',
      'docker', 'vscode', 'awscli',
    ],
  },
  {
    id: 'fullstack',
    name: 'Full-Stack Developer',
    description:
      'Front-end frameworks, back-end runtimes, databases, and containerisation.',
    icon: '💻',
    softwareIds: [
      'git', 'gh-cli',
      'node', 'npm', 'pnpm', 'angular',
      'python', 'go',
      'docker', 'postgres', 'pgadmin', 'redis', 'mongodb',
      'vscode', 'awscli',
    ],
  },
  {
    id: 'devops',
    name: 'DevOps / SRE Engineer',
    description:
      'Infrastructure-as-code, container orchestration, CI/CD, and cloud management.',
    icon: '🔧',
    softwareIds: [
      'git', 'gh-cli',
      'docker', 'kubectl', 'helm',
      'terraform', 'ansible',
      'python', 'go',
      'awscli', 'vscode',
    ],
  },
  {
    id: 'mobile',
    name: 'Mobile Developer',
    description:
      'Cross-platform and native mobile SDKs, emulators, and build tools.',
    icon: '📱',
    softwareIds: [
      'git', 'gh-cli',
      'node', 'npm',
      'flutter', 'react-native-cli',
      'android-studio', 'xcode-tools', 'cocoapods',
      'vscode', 'docker',
    ],
  },
  {
    id: 'data-engineer',
    name: 'Data Engineer',
    description:
      'ETL pipelines, distributed processing, databases, and transformation tools.',
    icon: '📊',
    softwareIds: [
      'git', 'python', 'conda', 'jupyter',
      'spark', 'dbt',
      'postgres', 'pgadmin', 'redis', 'mongodb',
      'docker', 'awscli', 'vscode',
    ],
  },
  {
    id: 'frontend',
    name: 'Frontend Developer',
    description:
      'UI frameworks, design tools, component libraries, and testing utilities.',
    icon: '🎨',
    softwareIds: [
      'git', 'gh-cli',
      'node', 'npm', 'pnpm',
      'angular', 'storybook',
      'playwright', 'cypress', 'jest',
      'figma', 'vscode',
    ],
  },
];

// Estimated minutes to manually download, install, configure, and verify each tool.
const MANUAL_INSTALL_MINUTES: Record<string, number> = {
  git: 10,
  'gh-cli': 8,
  node: 15,
  npm: 5,
  pnpm: 5,
  angular: 10,
  python: 15,
  go: 15,
  docker: 25,
  postgres: 20,
  pgadmin: 10,
  redis: 12,
  mongodb: 18,
  vscode: 10,
  awscli: 15,
  // Testing
  playwright: 15,
  cypress: 12,
  selenium: 12,
  jest: 5,
  postman: 8,
  k6: 10,
  jmeter: 15,
  allure: 8,
  // AI / ML
  'copilot-cli': 10,
  'claude-cli': 10,
  cursor: 10,
  jupyter: 12,
  conda: 15,
  ollama: 10,
  'huggingface-cli': 8,
  'cuda-toolkit': 30,
  // DevOps
  terraform: 12,
  kubectl: 10,
  helm: 8,
  ansible: 12,
  // Mobile
  flutter: 20,
  'android-studio': 25,
  'xcode-tools': 15,
  cocoapods: 8,
  'react-native-cli': 12,
  // Data
  spark: 25,
  dbt: 10,
  // Frontend
  figma: 8,
  storybook: 8,
};

// Estimated minutes when automated through this onboarding tool.
const AUTOMATED_INSTALL_MINUTES: Record<string, number> = {
  git: 1,
  'gh-cli': 1,
  node: 2,
  npm: 1,
  pnpm: 1,
  angular: 1,
  python: 2,
  go: 2,
  docker: 3,
  postgres: 3,
  pgadmin: 2,
  redis: 2,
  mongodb: 3,
  vscode: 2,
  awscli: 2,
  // Testing
  playwright: 3,
  cypress: 2,
  selenium: 2,
  jest: 1,
  postman: 2,
  k6: 1,
  jmeter: 2,
  allure: 1,
  // AI / ML
  'copilot-cli': 1,
  'claude-cli': 1,
  cursor: 2,
  jupyter: 2,
  conda: 3,
  ollama: 2,
  'huggingface-cli': 1,
  'cuda-toolkit': 5,
  // DevOps
  terraform: 2,
  kubectl: 1,
  helm: 1,
  ansible: 2,
  // Mobile
  flutter: 3,
  'android-studio': 4,
  'xcode-tools': 3,
  cocoapods: 1,
  'react-native-cli': 2,
  // Data
  spark: 4,
  dbt: 2,
  // Frontend
  figma: 2,
  storybook: 1,
};

export class DashboardService {
  private catalogService: CatalogService;

  constructor() {
    this.catalogService = new CatalogService();
  }

  getRoles(): RolePreset[] {
    return ROLE_PRESETS;
  }

  getRoleDashboard(roleId: string): RoleDashboard | undefined {
    const role = ROLE_PRESETS.find((r) => r.id === roleId);
    if (!role) return undefined;

    const software = role.softwareIds
      .map((id) => this.catalogService.getById(id))
      .filter(Boolean) as import('../types').SoftwareItem[];

    const timeEstimates: TimeEstimate[] = software.map((s) => ({
      softwareId: s.id,
      displayName: s.displayName,
      manualMinutes: MANUAL_INSTALL_MINUTES[s.id] ?? 15,
      automatedMinutes: AUTOMATED_INSTALL_MINUTES[s.id] ?? 2,
    }));

    const totalManualMinutes = timeEstimates.reduce((sum, t) => sum + t.manualMinutes, 0);
    const totalAutomatedMinutes = timeEstimates.reduce((sum, t) => sum + t.automatedMinutes, 0);
    const timeSavedMinutes = totalManualMinutes - totalAutomatedMinutes;
    const timeSavedPercent =
      totalManualMinutes > 0 ? Math.round((timeSavedMinutes / totalManualMinutes) * 100) : 0;

    return {
      role,
      software,
      timeEstimates,
      totalManualMinutes,
      totalAutomatedMinutes,
      timeSavedMinutes,
      timeSavedPercent,
    };
  }

  getAllRoleDashboards(): RoleDashboard[] {
    return ROLE_PRESETS.map((r) => this.getRoleDashboard(r.id)!);
  }
}
