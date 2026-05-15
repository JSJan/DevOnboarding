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

    // ── Testing / QA Tools ──────────────────────────────────────────
    {
      id: 'playwright',
      name: 'playwright',
      displayName: 'Playwright',
      category: 'Test Framework',
      version: 'latest',
      dependencies: ['node', 'npm'],
      platforms: {
        macos: { manager: 'npm', command: 'npm install -g playwright && npx playwright install', verify: 'npx playwright --version' },
        linux: { manager: 'npm', command: 'npm install -g playwright && npx playwright install --with-deps', verify: 'npx playwright --version' },
        windows: { manager: 'npm', command: 'npm install -g playwright && npx playwright install', verify: 'npx playwright --version' },
      },
      license: { type: 'open-source', spdx: 'Apache-2.0' },
    },
    {
      id: 'cypress',
      name: 'cypress',
      displayName: 'Cypress',
      category: 'Test Framework',
      version: 'latest',
      dependencies: ['node', 'npm'],
      platforms: {
        macos: { manager: 'npm', command: 'npm install -g cypress', verify: 'npx cypress --version' },
        linux: { manager: 'npm', command: 'npm install -g cypress', verify: 'npx cypress --version' },
        windows: { manager: 'npm', command: 'npm install -g cypress', verify: 'npx cypress --version' },
      },
      license: { type: 'open-source', spdx: 'MIT' },
    },
    {
      id: 'selenium',
      name: 'selenium',
      displayName: 'Selenium WebDriver',
      category: 'Test Framework',
      version: 'latest',
      dependencies: ['python'],
      platforms: {
        macos: { manager: 'pip', command: 'pip3 install selenium webdriver-manager', verify: 'python3 -c "import selenium; print(selenium.__version__)"' },
        linux: { manager: 'pip', command: 'pip3 install selenium webdriver-manager', verify: 'python3 -c "import selenium; print(selenium.__version__)"' },
        windows: { manager: 'pip', command: 'pip install selenium webdriver-manager', verify: 'python -c "import selenium; print(selenium.__version__)"' },
      },
      license: { type: 'open-source', spdx: 'Apache-2.0' },
    },
    {
      id: 'postman',
      name: 'postman',
      displayName: 'Postman',
      category: 'API Testing',
      version: 'latest',
      dependencies: [],
      platforms: {
        macos: { manager: 'brew', command: 'brew install --cask postman', verify: 'ls /Applications/Postman.app' },
        linux: { manager: 'snap', command: 'sudo snap install postman', verify: 'which postman' },
        windows: { manager: 'winget', command: 'winget install Postman.Postman', verify: 'where postman' },
      },
      license: { type: 'commercial' },
    },
    {
      id: 'k6',
      name: 'k6',
      displayName: 'k6 (Load Testing)',
      category: 'Performance Testing',
      version: 'latest',
      dependencies: [],
      platforms: {
        macos: { manager: 'brew', command: 'brew install k6', verify: 'k6 version' },
        linux: { manager: 'apt', command: 'sudo gpg -k && sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D68 && echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list && sudo apt-get update && sudo apt-get install k6', verify: 'k6 version' },
        windows: { manager: 'winget', command: 'winget install k6.k6', verify: 'k6 version' },
      },
      license: { type: 'open-source', spdx: 'AGPL-3.0' },
    },
    {
      id: 'jest',
      name: 'jest',
      displayName: 'Jest',
      category: 'Test Framework',
      version: 'latest',
      dependencies: ['node', 'npm'],
      platforms: {
        macos: { manager: 'npm', command: 'npm install -g jest', verify: 'jest --version' },
        linux: { manager: 'npm', command: 'npm install -g jest', verify: 'jest --version' },
        windows: { manager: 'npm', command: 'npm install -g jest', verify: 'jest --version' },
      },
      license: { type: 'open-source', spdx: 'MIT' },
    },
    {
      id: 'jmeter',
      name: 'jmeter',
      displayName: 'Apache JMeter',
      category: 'Performance Testing',
      version: '5.6',
      dependencies: [],
      platforms: {
        macos: { manager: 'brew', command: 'brew install jmeter', verify: 'jmeter --version' },
        linux: { manager: 'apt', command: 'sudo apt-get install -y jmeter', verify: 'jmeter --version' },
        windows: { manager: 'choco', command: 'choco install jmeter', verify: 'jmeter --version' },
      },
      license: { type: 'open-source', spdx: 'Apache-2.0' },
    },
    {
      id: 'allure',
      name: 'allure',
      displayName: 'Allure Report',
      category: 'Test Reporting',
      version: 'latest',
      dependencies: [],
      platforms: {
        macos: { manager: 'brew', command: 'brew install allure', verify: 'allure --version' },
        linux: { manager: 'npm', command: 'npm install -g allure-commandline', verify: 'allure --version' },
        windows: { manager: 'npm', command: 'npm install -g allure-commandline', verify: 'allure --version' },
      },
      license: { type: 'open-source', spdx: 'Apache-2.0' },
    },

    // ── AI / ML Developer Tools ─────────────────────────────────────
    {
      id: 'copilot-cli',
      name: 'copilot-cli',
      displayName: 'GitHub Copilot CLI',
      category: 'AI Assistant',
      version: 'latest',
      dependencies: ['node', 'npm'],
      platforms: {
        macos: { manager: 'npm', command: 'npm install -g @githubnext/github-copilot-cli', verify: 'github-copilot-cli --version' },
        linux: { manager: 'npm', command: 'npm install -g @githubnext/github-copilot-cli', verify: 'github-copilot-cli --version' },
        windows: { manager: 'npm', command: 'npm install -g @githubnext/github-copilot-cli', verify: 'github-copilot-cli --version' },
      },
      license: { type: 'commercial' },
    },
    {
      id: 'claude-cli',
      name: 'claude-cli',
      displayName: 'Claude Code CLI',
      category: 'AI Assistant',
      version: 'latest',
      dependencies: ['node', 'npm'],
      platforms: {
        macos: { manager: 'npm', command: 'npm install -g @anthropic-ai/claude-code', verify: 'claude --version' },
        linux: { manager: 'npm', command: 'npm install -g @anthropic-ai/claude-code', verify: 'claude --version' },
        windows: { manager: 'npm', command: 'npm install -g @anthropic-ai/claude-code', verify: 'claude --version' },
      },
      license: { type: 'commercial' },
    },
    {
      id: 'cursor',
      name: 'cursor',
      displayName: 'Cursor IDE',
      category: 'AI IDE',
      version: 'latest',
      dependencies: [],
      platforms: {
        macos: { manager: 'brew', command: 'brew install --cask cursor', verify: 'ls /Applications/Cursor.app' },
        linux: { manager: 'appimage', command: 'curl -fsSL https://downloader.cursor.sh/linux/appImage/x64 -o cursor.AppImage && chmod +x cursor.AppImage && sudo mv cursor.AppImage /usr/local/bin/cursor', verify: 'cursor --version' },
        windows: { manager: 'winget', command: 'winget install Anysphere.Cursor', verify: 'where cursor' },
      },
      license: { type: 'commercial' },
    },
    {
      id: 'jupyter',
      name: 'jupyter',
      displayName: 'Jupyter Notebook',
      category: 'Data Science',
      version: 'latest',
      dependencies: ['python'],
      platforms: {
        macos: { manager: 'pip', command: 'pip3 install jupyterlab notebook', verify: 'jupyter --version' },
        linux: { manager: 'pip', command: 'pip3 install jupyterlab notebook', verify: 'jupyter --version' },
        windows: { manager: 'pip', command: 'pip install jupyterlab notebook', verify: 'jupyter --version' },
      },
      license: { type: 'open-source', spdx: 'BSD-3-Clause' },
    },
    {
      id: 'conda',
      name: 'conda',
      displayName: 'Miniconda',
      category: 'Package Manager',
      version: 'latest',
      dependencies: [],
      platforms: {
        macos: { manager: 'brew', command: 'brew install --cask miniconda', verify: 'conda --version' },
        linux: { manager: 'curl', command: 'mkdir -p ~/miniconda3 && curl -fsSL https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh -o ~/miniconda3/miniconda.sh && bash ~/miniconda3/miniconda.sh -b -u -p ~/miniconda3 && rm ~/miniconda3/miniconda.sh', verify: 'conda --version' },
        windows: { manager: 'winget', command: 'winget install Anaconda.Miniconda3', verify: 'conda --version' },
      },
      license: { type: 'open-source', spdx: 'BSD-3-Clause' },
    },
    {
      id: 'ollama',
      name: 'ollama',
      displayName: 'Ollama (Local LLM)',
      category: 'AI Runtime',
      version: 'latest',
      dependencies: [],
      platforms: {
        macos: { manager: 'brew', command: 'brew install ollama', verify: 'ollama --version' },
        linux: { manager: 'curl', command: 'curl -fsSL https://ollama.com/install.sh | sh', verify: 'ollama --version' },
        windows: { manager: 'winget', command: 'winget install Ollama.Ollama', verify: 'ollama --version' },
      },
      license: { type: 'open-source', spdx: 'MIT' },
    },
    {
      id: 'huggingface-cli',
      name: 'huggingface-cli',
      displayName: 'Hugging Face CLI',
      category: 'AI Tool',
      version: 'latest',
      dependencies: ['python'],
      platforms: {
        macos: { manager: 'pip', command: 'pip3 install huggingface_hub[cli]', verify: 'huggingface-cli --help' },
        linux: { manager: 'pip', command: 'pip3 install huggingface_hub[cli]', verify: 'huggingface-cli --help' },
        windows: { manager: 'pip', command: 'pip install huggingface_hub[cli]', verify: 'huggingface-cli --help' },
      },
      license: { type: 'open-source', spdx: 'Apache-2.0' },
    },
    {
      id: 'cuda-toolkit',
      name: 'cuda-toolkit',
      displayName: 'CUDA Toolkit',
      category: 'GPU Computing',
      version: '12.x',
      dependencies: [],
      platforms: {
        macos: { manager: 'manual', command: 'echo "CUDA not supported on macOS — use Metal via PyTorch"', verify: 'echo "N/A on macOS"' },
        linux: { manager: 'apt', command: 'sudo apt-get install -y nvidia-cuda-toolkit', verify: 'nvcc --version' },
        windows: { manager: 'winget', command: 'winget install Nvidia.CUDA', verify: 'nvcc --version' },
      },
      license: { type: 'commercial' },
    },

    // ── DevOps / SRE Tools ──────────────────────────────────────────
    {
      id: 'terraform',
      name: 'terraform',
      displayName: 'Terraform',
      category: 'IaC',
      version: 'latest',
      dependencies: [],
      platforms: {
        macos: { manager: 'brew', command: 'brew install terraform', verify: 'terraform --version' },
        linux: { manager: 'apt', command: 'sudo apt-get install -y terraform', verify: 'terraform --version' },
        windows: { manager: 'winget', command: 'winget install Hashicorp.Terraform', verify: 'terraform --version' },
      },
      license: { type: 'open-source', spdx: 'BUSL-1.1' },
    },
    {
      id: 'kubectl',
      name: 'kubectl',
      displayName: 'kubectl',
      category: 'Container Orchestration',
      version: 'latest',
      dependencies: [],
      platforms: {
        macos: { manager: 'brew', command: 'brew install kubectl', verify: 'kubectl version --client' },
        linux: { manager: 'apt', command: 'sudo apt-get install -y kubectl', verify: 'kubectl version --client' },
        windows: { manager: 'winget', command: 'winget install Kubernetes.kubectl', verify: 'kubectl version --client' },
      },
      license: { type: 'open-source', spdx: 'Apache-2.0' },
    },
    {
      id: 'helm',
      name: 'helm',
      displayName: 'Helm',
      category: 'Container Orchestration',
      version: 'latest',
      dependencies: ['kubectl'],
      platforms: {
        macos: { manager: 'brew', command: 'brew install helm', verify: 'helm version' },
        linux: { manager: 'snap', command: 'sudo snap install helm --classic', verify: 'helm version' },
        windows: { manager: 'winget', command: 'winget install Helm.Helm', verify: 'helm version' },
      },
      license: { type: 'open-source', spdx: 'Apache-2.0' },
    },
    {
      id: 'ansible',
      name: 'ansible',
      displayName: 'Ansible',
      category: 'Configuration Management',
      version: 'latest',
      dependencies: ['python'],
      platforms: {
        macos: { manager: 'pip', command: 'pip3 install ansible', verify: 'ansible --version' },
        linux: { manager: 'pip', command: 'pip3 install ansible', verify: 'ansible --version' },
        windows: { manager: 'pip', command: 'pip install ansible', verify: 'ansible --version' },
      },
      license: { type: 'open-source', spdx: 'GPL-3.0' },
    },
    {
      id: 'gh-cli',
      name: 'gh-cli',
      displayName: 'GitHub CLI',
      category: 'Version Control',
      version: 'latest',
      dependencies: [],
      platforms: {
        macos: { manager: 'brew', command: 'brew install gh', verify: 'gh --version' },
        linux: { manager: 'apt', command: 'sudo apt-get install -y gh', verify: 'gh --version' },
        windows: { manager: 'winget', command: 'winget install GitHub.cli', verify: 'gh --version' },
      },
      license: { type: 'open-source', spdx: 'MIT' },
    },

    // ── Mobile Developer Tools ──────────────────────────────────────
    {
      id: 'flutter',
      name: 'flutter',
      displayName: 'Flutter SDK',
      category: 'Mobile Framework',
      version: 'latest',
      dependencies: [],
      platforms: {
        macos: { manager: 'brew', command: 'brew install --cask flutter', verify: 'flutter --version' },
        linux: { manager: 'snap', command: 'sudo snap install flutter --classic', verify: 'flutter --version' },
        windows: { manager: 'winget', command: 'winget install Google.Flutter', verify: 'flutter --version' },
      },
      license: { type: 'open-source', spdx: 'BSD-3-Clause' },
    },
    {
      id: 'android-studio',
      name: 'android-studio',
      displayName: 'Android Studio',
      category: 'Mobile IDE',
      version: 'latest',
      dependencies: [],
      platforms: {
        macos: { manager: 'brew', command: 'brew install --cask android-studio', verify: 'ls /Applications/Android\\ Studio.app' },
        linux: { manager: 'snap', command: 'sudo snap install android-studio --classic', verify: 'which android-studio' },
        windows: { manager: 'winget', command: 'winget install Google.AndroidStudio', verify: 'where android-studio' },
      },
      license: { type: 'open-source', spdx: 'Apache-2.0' },
    },
    {
      id: 'xcode-tools',
      name: 'xcode-tools',
      displayName: 'Xcode Command Line Tools',
      category: 'Build Tool',
      version: 'latest',
      dependencies: [],
      platforms: {
        macos: { manager: 'xcode-select', command: 'xcode-select --install', verify: 'xcode-select -p' },
        linux: { manager: 'none', command: 'echo "Xcode is macOS only"', verify: 'echo "N/A"' },
        windows: { manager: 'none', command: 'echo "Xcode is macOS only"', verify: 'echo "N/A"' },
      },
      license: { type: 'commercial' },
    },
    {
      id: 'cocoapods',
      name: 'cocoapods',
      displayName: 'CocoaPods',
      category: 'Package Manager',
      version: 'latest',
      dependencies: [],
      platforms: {
        macos: { manager: 'brew', command: 'brew install cocoapods', verify: 'pod --version' },
        linux: { manager: 'none', command: 'echo "CocoaPods is macOS only"', verify: 'echo "N/A"' },
        windows: { manager: 'none', command: 'echo "CocoaPods is macOS only"', verify: 'echo "N/A"' },
      },
      license: { type: 'open-source', spdx: 'MIT' },
    },
    {
      id: 'react-native-cli',
      name: 'react-native-cli',
      displayName: 'React Native CLI',
      category: 'Mobile Framework',
      version: 'latest',
      dependencies: ['node', 'npm'],
      platforms: {
        macos: { manager: 'npm', command: 'npm install -g react-native-cli', verify: 'react-native --version' },
        linux: { manager: 'npm', command: 'npm install -g react-native-cli', verify: 'react-native --version' },
        windows: { manager: 'npm', command: 'npm install -g react-native-cli', verify: 'react-native --version' },
      },
      license: { type: 'open-source', spdx: 'MIT' },
    },

    // ── Data Engineering Tools ───────────────────────────────────────
    {
      id: 'spark',
      name: 'spark',
      displayName: 'Apache Spark',
      category: 'Data Processing',
      version: '3.5',
      dependencies: [],
      platforms: {
        macos: { manager: 'brew', command: 'brew install apache-spark', verify: 'spark-shell --version' },
        linux: { manager: 'curl', command: 'curl -fsSL https://dlcdn.apache.org/spark/spark-3.5.1/spark-3.5.1-bin-hadoop3.tgz | sudo tar xz -C /opt/', verify: 'spark-shell --version' },
        windows: { manager: 'choco', command: 'choco install spark', verify: 'spark-shell --version' },
      },
      license: { type: 'open-source', spdx: 'Apache-2.0' },
    },
    {
      id: 'dbt',
      name: 'dbt',
      displayName: 'dbt (Data Build Tool)',
      category: 'Data Transformation',
      version: 'latest',
      dependencies: ['python'],
      platforms: {
        macos: { manager: 'pip', command: 'pip3 install dbt-core dbt-postgres', verify: 'dbt --version' },
        linux: { manager: 'pip', command: 'pip3 install dbt-core dbt-postgres', verify: 'dbt --version' },
        windows: { manager: 'pip', command: 'pip install dbt-core dbt-postgres', verify: 'dbt --version' },
      },
      license: { type: 'open-source', spdx: 'Apache-2.0' },
    },

    // ── Frontend-specific Tools ──────────────────────────────────────
    {
      id: 'pnpm',
      name: 'pnpm',
      displayName: 'pnpm',
      category: 'Package Manager',
      version: 'latest',
      dependencies: ['node'],
      platforms: {
        macos: { manager: 'brew', command: 'brew install pnpm', verify: 'pnpm --version' },
        linux: { manager: 'npm', command: 'npm install -g pnpm', verify: 'pnpm --version' },
        windows: { manager: 'winget', command: 'winget install pnpm.pnpm', verify: 'pnpm --version' },
      },
      license: { type: 'open-source', spdx: 'MIT' },
    },
    {
      id: 'figma',
      name: 'figma',
      displayName: 'Figma',
      category: 'Design Tool',
      version: 'latest',
      dependencies: [],
      platforms: {
        macos: { manager: 'brew', command: 'brew install --cask figma', verify: 'ls /Applications/Figma.app' },
        linux: { manager: 'snap', command: 'sudo snap install figma-linux', verify: 'which figma-linux' },
        windows: { manager: 'winget', command: 'winget install Figma.Figma', verify: 'where figma' },
      },
      license: { type: 'commercial' },
    },
    {
      id: 'storybook',
      name: 'storybook',
      displayName: 'Storybook',
      category: 'UI Development',
      version: 'latest',
      dependencies: ['node', 'npm'],
      platforms: {
        macos: { manager: 'npm', command: 'npm install -g storybook', verify: 'npx storybook --version' },
        linux: { manager: 'npm', command: 'npm install -g storybook', verify: 'npx storybook --version' },
        windows: { manager: 'npm', command: 'npm install -g storybook', verify: 'npx storybook --version' },
      },
      license: { type: 'open-source', spdx: 'MIT' },
    },

    // ── Common / Shared Tools ────────────────────────────────────────
    {
      id: 'git',
      name: 'git',
      displayName: 'Git',
      category: 'Version Control',
      version: 'latest',
      dependencies: [],
      platforms: {
        macos: { manager: 'brew', command: 'brew install git', verify: 'git --version' },
        linux: { manager: 'apt', command: 'sudo apt-get install -y git', verify: 'git --version' },
        windows: { manager: 'winget', command: 'winget install Git.Git', verify: 'git --version' },
      },
      license: { type: 'open-source', spdx: 'GPL-2.0' },
    },
    {
      id: 'redis',
      name: 'redis',
      displayName: 'Redis',
      category: 'Database',
      version: '7',
      dependencies: [],
      platforms: {
        macos: { manager: 'brew', command: 'brew install redis', verify: 'redis-server --version' },
        linux: { manager: 'apt', command: 'sudo apt-get install -y redis-server', verify: 'redis-server --version' },
        windows: { manager: 'winget', command: 'winget install Redis.Redis', verify: 'redis-server --version' },
      },
      license: { type: 'open-source', spdx: 'BSD-3-Clause' },
    },
    {
      id: 'mongodb',
      name: 'mongodb',
      displayName: 'MongoDB',
      category: 'Database',
      version: '7',
      dependencies: [],
      platforms: {
        macos: { manager: 'brew', command: 'brew tap mongodb/brew && brew install mongodb-community', verify: 'mongod --version' },
        linux: { manager: 'apt', command: 'sudo apt-get install -y mongodb-org', verify: 'mongod --version' },
        windows: { manager: 'winget', command: 'winget install MongoDB.Server', verify: 'mongod --version' },
      },
      license: { type: 'open-source', spdx: 'SSPL-1.0' },
    },
  ];
}
