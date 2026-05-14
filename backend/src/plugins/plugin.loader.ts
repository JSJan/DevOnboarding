import path from 'path';
import fs from 'fs';
import YAML from 'yaml';
import { SoftwareItem } from '../types';

const PLUGINS_DIR = path.join(__dirname, '../../plugins');

export function loadCatalog(): SoftwareItem[] {
  const defaults = getDefaultCatalog();

  if (!fs.existsSync(PLUGINS_DIR)) {
    return defaults;
  }

  const files = fs.readdirSync(PLUGINS_DIR).filter((f) => f.endsWith('.yaml') || f.endsWith('.yml'));

  if (files.length === 0) {
    return defaults;
  }

  // YAML plugins override defaults with matching IDs, extras are appended
  const overrides = files.map((file) => {
    const content = fs.readFileSync(path.join(PLUGINS_DIR, file), 'utf-8');
    return YAML.parse(content) as SoftwareItem;
  });

  const overrideIds = new Set(overrides.map((o) => o.id));
  const merged = defaults.map((d) => overrideIds.has(d.id) ? overrides.find((o) => o.id === d.id)! : d);
  const extras = overrides.filter((o) => !defaults.some((d) => d.id === o.id));

  return [...merged, ...extras];
}

function getDefaultCatalog(): SoftwareItem[] {
  return [
    {
      id: 'node',
      name: 'node',
      displayName: 'Node.js',
      category: 'Runtime',
      version: '20.x',
      dependencies: [],
      platforms: {
        macos: { manager: 'brew', command: 'brew install node@20', verify: 'node --version' },
        linux: { manager: 'apt', command: 'curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && sudo apt-get install -y nodejs', verify: 'node --version' },
        windows: { manager: 'winget', command: 'winget install OpenJS.NodeJS.LTS', verify: 'node --version' },
      },
      license: { type: 'open-source', spdx: 'MIT' },
    },
    {
      id: 'npm',
      name: 'npm',
      displayName: 'npm',
      category: 'Package Manager',
      version: '10.x',
      dependencies: ['node'],
      platforms: {
        macos: { manager: 'bundled', command: 'npm install -g npm@latest', verify: 'npm --version' },
        linux: { manager: 'bundled', command: 'npm install -g npm@latest', verify: 'npm --version' },
        windows: { manager: 'bundled', command: 'npm install -g npm@latest', verify: 'npm --version' },
      },
      license: { type: 'open-source', spdx: 'Artistic-2.0' },
    },
    {
      id: 'angular',
      name: 'angular',
      displayName: 'Angular CLI',
      category: 'Framework',
      version: '18.x',
      dependencies: ['node', 'npm'],
      platforms: {
        macos: { manager: 'npm', command: 'npm install -g @angular/cli', verify: 'ng version' },
        linux: { manager: 'npm', command: 'npm install -g @angular/cli', verify: 'ng version' },
        windows: { manager: 'npm', command: 'npm install -g @angular/cli', verify: 'ng version' },
      },
      license: { type: 'open-source', spdx: 'MIT' },
    },
    {
      id: 'python',
      name: 'python',
      displayName: 'Python',
      category: 'Runtime',
      version: '3.12',
      dependencies: [],
      platforms: {
        macos: { manager: 'brew', command: 'brew install python@3.12', verify: 'python3 --version' },
        linux: { manager: 'apt', command: 'sudo apt-get install -y python3.12', verify: 'python3 --version' },
        windows: { manager: 'winget', command: 'winget install Python.Python.3.12', verify: 'python --version' },
      },
      license: { type: 'open-source', spdx: 'PSF-2.0' },
    },
    {
      id: 'go',
      name: 'go',
      displayName: 'Go',
      category: 'Runtime',
      version: '1.22',
      dependencies: [],
      platforms: {
        macos: { manager: 'brew', command: 'brew install go', verify: 'go version' },
        linux: { manager: 'apt', command: 'sudo apt-get install -y golang-go', verify: 'go version' },
        windows: { manager: 'winget', command: 'winget install GoLang.Go', verify: 'go version' },
      },
      license: { type: 'open-source', spdx: 'BSD-3-Clause' },
    },
    {
      id: 'docker',
      name: 'docker',
      displayName: 'Docker',
      category: 'Containerization',
      version: 'latest',
      dependencies: [],
      platforms: {
        macos: { manager: 'brew', command: 'brew install --cask docker', verify: 'docker --version' },
        linux: { manager: 'apt', command: 'curl -fsSL https://get.docker.com | sh', verify: 'docker --version' },
        windows: { manager: 'winget', command: 'winget install Docker.DockerDesktop', verify: 'docker --version' },
      },
      license: { type: 'open-source', spdx: 'Apache-2.0' },
    },
    {
      id: 'postgres',
      name: 'postgres',
      displayName: 'PostgreSQL',
      category: 'Database',
      version: '16',
      dependencies: [],
      platforms: {
        macos: { manager: 'brew', command: 'brew install postgresql@16', verify: 'psql --version' },
        linux: { manager: 'apt', command: 'sudo apt-get install -y postgresql-16', verify: 'psql --version' },
        windows: { manager: 'winget', command: 'winget install PostgreSQL.PostgreSQL', verify: 'psql --version' },
      },
      license: { type: 'open-source', spdx: 'PostgreSQL' },
    },
    {
      id: 'pgadmin',
      name: 'pgadmin',
      displayName: 'pgAdmin',
      category: 'Database Tool',
      version: '4',
      dependencies: ['postgres'],
      platforms: {
        macos: { manager: 'brew', command: 'brew install --cask pgadmin4', verify: 'ls /Applications/pgAdmin*' },
        linux: { manager: 'apt', command: 'sudo apt-get install -y pgadmin4', verify: 'which pgadmin4' },
        windows: { manager: 'winget', command: 'winget install PostgreSQL.pgAdmin', verify: 'where pgadmin4' },
      },
      license: { type: 'open-source', spdx: 'PostgreSQL' },
    },
    {
      id: 'vscode',
      name: 'vscode',
      displayName: 'Visual Studio Code',
      category: 'IDE',
      version: 'latest',
      dependencies: [],
      platforms: {
        macos: { manager: 'brew', command: 'brew install --cask visual-studio-code', verify: 'code --version' },
        linux: { manager: 'snap', command: 'sudo snap install code --classic', verify: 'code --version' },
        windows: { manager: 'winget', command: 'winget install Microsoft.VisualStudioCode', verify: 'code --version' },
      },
      license: { type: 'open-source', spdx: 'MIT' },
    },
    {
      id: 'awscli',
      name: 'awscli',
      displayName: 'AWS CLI',
      category: 'Cloud Tool',
      version: '2',
      dependencies: [],
      platforms: {
        macos: { manager: 'brew', command: 'brew install awscli', verify: 'aws --version' },
        linux: { manager: 'curl', command: 'curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" && unzip awscliv2.zip && sudo ./aws/install', verify: 'aws --version' },
        windows: { manager: 'winget', command: 'winget install Amazon.AWSCLI', verify: 'aws --version' },
      },
      license: { type: 'open-source', spdx: 'Apache-2.0' },
    },
  ];
}
