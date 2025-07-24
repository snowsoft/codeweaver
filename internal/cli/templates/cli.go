package templates

func init() {
	// Go CLI Template
	RegisterTemplate("go-cli", Template{
		Name:        "go-cli",
		Description: "Go CLI application with Cobra",
		Category:    "CLI",
		Variables: []TemplateVariable{
			{Name: "PROJECT_NAME", Description: "Project name", Default: "mycli", Required: true},
			{Name: "MODULE_NAME", Description: "Go module name", Default: "github.com/user/mycli", Required: true},
		},
		Files: map[string]string{
			"go.mod": `module {{MODULE_NAME}}

go 1.21

require (
    github.com/spf13/cobra v1.8.0
    github.com/spf13/viper v1.18.2
    github.com/pterm/pterm v0.12.71
)`,
			"main.go": `package main

import (
    "fmt"
    "os"
    
    "{{MODULE_NAME}}/cmd"
)

func main() {
    if err := cmd.Execute(); err != nil {
        fmt.Fprintf(os.Stderr, "Error: %v\n", err)
        os.Exit(1)
    }
}`,
			"cmd/root.go": `package cmd

import (
    "fmt"
    "os"
    
    "github.com/spf13/cobra"
    "github.com/spf13/viper"
)

var cfgFile string

var rootCmd = &cobra.Command{
    Use:   "{{PROJECT_NAME}}",
    Short: "A brief description of your application",
    Long:  "A longer description of your application.",
}

func Execute() error {
    return rootCmd.Execute()
}

func init() {
    cobra.OnInitialize(initConfig)
    rootCmd.PersistentFlags().StringVar(&cfgFile, "config", "", "config file (default is $HOME/.{{PROJECT_NAME}}.yaml)")
}

func initConfig() {
    if cfgFile != "" {
        viper.SetConfigFile(cfgFile)
    } else {
        home, err := os.UserHomeDir()
        cobra.CheckErr(err)
        
        viper.AddConfigPath(home)
        viper.SetConfigType("yaml")
        viper.SetConfigName(".{{PROJECT_NAME}}")
    }
    
    viper.AutomaticEnv()
    
    if err := viper.ReadInConfig(); err == nil {
        fmt.Fprintln(os.Stderr, "Using config file:", viper.ConfigFileUsed())
    }
}`,
			"cmd/version.go": `package cmd

import (
    "fmt"
    
    "github.com/spf13/cobra"
)

var (
    Version   = "dev"
    BuildTime = "unknown"
    GitCommit = "unknown"
)

var versionCmd = &cobra.Command{
    Use:   "version",
    Short: "Print the version number",
    Long:  "Print the version number and build information of {{PROJECT_NAME}}",
    Run: func(cmd *cobra.Command, args []string) {
        fmt.Printf("{{PROJECT_NAME}} %s\n", Version)
        fmt.Printf("Build Time: %s\n", BuildTime)
        fmt.Printf("Git Commit: %s\n", GitCommit)
    },
}

func init() {
    rootCmd.AddCommand(versionCmd)
}`,
			"cmd/config.go": `package cmd

import (
    "fmt"
    
    "github.com/spf13/cobra"
    "github.com/spf13/viper"
)

var configCmd = &cobra.Command{
    Use:   "config",
    Short: "Manage configuration",
    Long:  "Manage {{PROJECT_NAME}} configuration settings",
}

var configGetCmd = &cobra.Command{
    Use:   "get [key]",
    Short: "Get a configuration value",
    Args:  cobra.ExactArgs(1),
    Run: func(cmd *cobra.Command, args []string) {
        key := args[0]
        value := viper.Get(key)
        fmt.Printf("%s: %v\n", key, value)
    },
}

var configSetCmd = &cobra.Command{
    Use:   "set [key] [value]",
    Short: "Set a configuration value",
    Args:  cobra.ExactArgs(2),
    Run: func(cmd *cobra.Command, args []string) {
        key := args[0]
        value := args[1]
        viper.Set(key, value)
        if err := viper.WriteConfig(); err != nil {
            fmt.Printf("Error saving config: %v\n", err)
            return
        }
        fmt.Printf("Set %s = %s\n", key, value)
    },
}

func init() {
    configCmd.AddCommand(configGetCmd)
    configCmd.AddCommand(configSetCmd)
    rootCmd.AddCommand(configCmd)
}`,
			"Makefile": `BINARY_NAME={{PROJECT_NAME}}
VERSION?=dev
BUILD_TIME=$(shell date -u '+%Y-%m-%d_%H:%M:%S')
GIT_COMMIT=$(shell git rev-parse --short HEAD 2>/dev/null || echo "unknown")
LDFLAGS=-ldflags "-X cmd.Version=${VERSION} -X cmd.BuildTime=${BUILD_TIME} -X cmd.GitCommit=${GIT_COMMIT}"

.PHONY: all build clean test install run

all: clean build

build:
	go build ${LDFLAGS} -o ${BINARY_NAME} main.go

clean:
	go clean
	rm -f ${BINARY_NAME}

test:
	go test -v ./...

install: build
	mv ${BINARY_NAME} ${GOPATH}/bin/${BINARY_NAME}

run: build
	./${BINARY_NAME}`,
			".gitignore": `# Binaries
{{PROJECT_NAME}}
*.exe
*.dll
*.so
*.dylib

# Test binary
*.test

# Output of go coverage
*.out

# Go workspace
go.work

# IDE
.idea/
.vscode/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db`,
			"README.md": `# {{PROJECT_NAME}}

A CLI tool built with Go and Cobra.

## Installation

\`\`\`bash
go install {{MODULE_NAME}}@latest
\`\`\`

Or build from source:

\`\`\`bash
git clone <repository>
cd {{PROJECT_NAME}}
make build
\`\`\`

## Usage

\`\`\`bash
{{PROJECT_NAME}} --help
\`\`\`

### Commands

- \`version\` - Show version information
- \`config\` - Manage configuration
  - \`get\` - Get a configuration value
  - \`set\` - Set a configuration value

## Development

### Building

\`\`\`bash
make build
\`\`\`

### Testing

\`\`\`bash
make test
\`\`\`

### Installing locally

\`\`\`bash
make install
\`\`\``,
		},
		Commands: []string{
			"go mod tidy",
			"make build",
		},
	})

	// Python CLI Template
	RegisterTemplate("python-cli", Template{
		Name:        "python-cli",
		Description: "Python CLI application with Click",
		Category:    "CLI",
		Variables: []TemplateVariable{
			{Name: "PROJECT_NAME", Description: "Project name", Default: "pycli", Required: true},
			{Name: "DESCRIPTION", Description: "Project description", Default: "A Python CLI application", Required: false},
		},
		Files: map[string]string{
			"setup.py": `from setuptools import setup, find_packages

with open("README.md", "r", encoding="utf-8") as fh:
    long_description = fh.read()

setup(
    name="{{PROJECT_NAME}}",
    version="0.1.0",
    author="Your Name",
    author_email="your.email@example.com",
    description="{{DESCRIPTION}}",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/yourusername/{{PROJECT_NAME}}",
    packages=find_packages(),
    classifiers=[
        "Development Status :: 3 - Alpha",
        "Intended Audience :: Developers",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
    ],
    python_requires=">=3.8",
    install_requires=[
        "click>=8.0",
        "rich>=13.0",
        "pyyaml>=6.0",
    ],
    entry_points={
        "console_scripts": [
            "{{PROJECT_NAME}}={{PROJECT_NAME}}.cli:cli",
        ],
    },
)`,
			"{{PROJECT_NAME}}/__init__.py": `"""{{DESCRIPTION}}"""

__version__ = "0.1.0"`,
			"{{PROJECT_NAME}}/cli.py": `import click
import yaml
from pathlib import Path
from rich.console import Console
from rich.table import Table
from {{PROJECT_NAME}}.config import Config
from {{PROJECT_NAME}}.commands import process, analyze

console = Console()
config = Config()

@click.group()
@click.version_option()
@click.option('--config', '-c', type=click.Path(), help='Config file path')
@click.pass_context
def cli(ctx, config):
    """{{DESCRIPTION}}"""
    ctx.ensure_object(dict)
    if config:
        config_path = Path(config)
        if config_path.exists():
            with open(config_path, 'r') as f:
                ctx.obj['config'] = yaml.safe_load(f)
    
@cli.command()
@click.argument('input_file', type=click.Path(exists=True))
@click.option('--output', '-o', type=click.Path(), help='Output file')
@click.option('--format', '-f', type=click.Choice(['json', 'yaml', 'csv']), default='json')
@click.pass_context
def process(ctx, input_file, output, format):
    """Process input file"""
    console.print(f"[green]Processing {input_file}...[/green]")
    
    # Process logic here
    result = process.process_file(input_file, format)
    
    if output:
        with open(output, 'w') as f:
            f.write(result)
        console.print(f"[blue]Output saved to {output}[/blue]")
    else:
        console.print(result)

@cli.command()
@click.argument('directory', type=click.Path(exists=True))
@click.option('--recursive', '-r', is_flag=True, help='Analyze recursively')
@click.option('--pattern', '-p', default='*', help='File pattern to match')
def analyze(ctx, directory, recursive, pattern):
    """Analyze directory contents"""
    console.print(f"[yellow]Analyzing {directory}...[/yellow]")
    
    # Analysis logic here
    results = analyze.analyze_directory(directory, recursive, pattern)
    
    # Display results in a table
    table = Table(title="Analysis Results")
    table.add_column("File", style="cyan")
    table.add_column("Size", style="magenta")
    table.add_column("Type", style="green")
    
    for result in results:
        table.add_row(result['file'], result['size'], result['type'])
    
    console.print(table)

@cli.command()
@click.option('--key', '-k', help='Configuration key')
@click.option('--value', '-v', help='Configuration value')
@click.option('--list', '-l', is_flag=True, help='List all configuration')
def config(key, value, list):
    """Manage configuration"""
    if list:
        config_data = config.get_all()
        table = Table(title="Configuration")
        table.add_column("Key", style="cyan")
        table.add_column("Value", style="green")
        
        for k, v in config_data.items():
            table.add_row(k, str(v))
        
        console.print(table)
    elif key and value:
        config.set(key, value)
        console.print(f"[green]Set {key} = {value}[/green]")
    elif key:
        value = config.get(key)
        if value:
            console.print(f"{key}: {value}")
        else:
            console.print(f"[red]Key '{key}' not found[/red]")
    else:
        console.print("[yellow]Use --list to show all config or provide --key[/yellow]")

if __name__ == '__main__':
    cli()`,
			"{{PROJECT_NAME}}/config.py": `import json
import os
from pathlib import Path

class Config:
    def __init__(self):
        self.config_dir = Path.home() / '.{{PROJECT_NAME}}'
        self.config_file = self.config_dir / 'config.json'
        self.config_dir.mkdir(exist_ok=True)
        self._load()
    
    def _load(self):
        if self.config_file.exists():
            with open(self.config_file, 'r') as f:
                self.data = json.load(f)
        else:
            self.data = {}
    
    def _save(self):
        with open(self.config_file, 'w') as f:
            json.dump(self.data, f, indent=2)
    
    def get(self, key, default=None):
        return self.data.get(key, default)
    
    def set(self, key, value):
        self.data[key] = value
        self._save()
    
    def get_all(self):
        return self.data.copy()`,
			"{{PROJECT_NAME}}/commands/__init__.py": "",
			"{{PROJECT_NAME}}/commands/process.py": `import json
import yaml
import csv
from pathlib import Path

def process_file(input_file, output_format):
    """Process input file and return formatted output"""
    input_path = Path(input_file)
    
    # Read input file
    with open(input_path, 'r') as f:
        content = f.read()
    
    # Process content (example: parse as JSON and reformat)
    try:
        data = json.loads(content)
    except json.JSONDecodeError:
        # If not JSON, treat as plain text
        data = {"content": content}
    
    # Format output
    if output_format == 'json':
        return json.dumps(data, indent=2)
    elif output_format == 'yaml':
        return yaml.dump(data, default_flow_style=False)
    elif output_format == 'csv':
        # Simple CSV conversion for dict
        output = []
        if isinstance(data, dict):
            output.append(','.join(data.keys()))
            output.append(','.join(str(v) for v in data.values()))
        return '\n'.join(output)
    
    return str(data)`,
			"{{PROJECT_NAME}}/commands/analyze.py": `import os
from pathlib import Path

def analyze_directory(directory, recursive, pattern):
    """Analyze directory and return file information"""
    results = []
    path = Path(directory)
    
    if recursive:
        files = path.rglob(pattern)
    else:
        files = path.glob(pattern)
    
    for file in files:
        if file.is_file():
            size = file.stat().st_size
            # Convert size to human readable format
            for unit in ['B', 'KB', 'MB', 'GB']:
                if size < 1024.0:
                    size_str = f"{size:.1f} {unit}"
                    break
                size /= 1024.0
            else:
                size_str = f"{size:.1f} TB"
            
            results.append({
                'file': file.name,
                'size': size_str,
                'type': file.suffix or 'no extension'
            })
    
    return results`,
			"tests/__init__.py": "",
			"tests/test_cli.py": `import pytest
from click.testing import CliRunner
from {{PROJECT_NAME}}.cli import cli

def test_version():
    runner = CliRunner()
    result = runner.invoke(cli, ['--version'])
    assert result.exit_code == 0
    assert '0.1.0' in result.output

def test_process_command():
    runner = CliRunner()
    with runner.isolated_filesystem():
        # Create test file
        with open('test.json', 'w') as f:
            f.write('{"test": "data"}')
        
        result = runner.invoke(cli, ['process', 'test.json'])
        assert result.exit_code == 0

def test_config_command():
    runner = CliRunner()
    result = runner.invoke(cli, ['config', '--list'])
    assert result.exit_code == 0`,
			"requirements.txt": `click>=8.0.0
rich>=13.0.0
pyyaml>=6.0
pytest>=7.0.0`,
			"requirements-dev.txt": `-r requirements.txt
pytest>=7.0.0
pytest-cov>=4.0.0
black>=23.0.0
flake8>=6.0.0
mypy>=1.0.0`,
			".gitignore": `# Byte-compiled / optimized / DLL files
__pycache__/
*.py[cod]
*$py.class

# C extensions
*.so

# Distribution / packaging
.Python
build/
develop-eggs/
dist/
downloads/
eggs/
.eggs/
lib/
lib64/
parts/
sdist/
var/
wheels/
pip-wheel-metadata/
share/python-wheels/
*.egg-info/
.installed.cfg
*.egg
MANIFEST

# PyInstaller
*.manifest
*.spec

# Unit test / coverage reports
htmlcov/
.tox/
.nox/
.coverage
.coverage.*
.cache
nosetests.xml
coverage.xml
*.cover
*.py,cover
.hypothesis/
.pytest_cache/

# Virtual environments
venv/
ENV/
env/
.venv

# IDEs
.idea/
.vscode/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db`,
			"README.md": `# {{PROJECT_NAME}}

{{DESCRIPTION}}

## Installation

### From source

\`\`\`bash
git clone <repository>
cd {{PROJECT_NAME}}
pip install -e .
\`\`\`

### From PyPI

\`\`\`bash
pip install {{PROJECT_NAME}}
\`\`\`

## Usage

### Basic Commands

\`\`\`bash
# Show help
{{PROJECT_NAME}} --help

# Process a file
{{PROJECT_NAME}} process input.json -o output.yaml -f yaml

# Analyze directory
{{PROJECT_NAME}} analyze /path/to/dir -r -p "*.py"

# Manage configuration
{{PROJECT_NAME}} config --list
{{PROJECT_NAME}} config -k api_key -v "your-key"
\`\`\`

## Development

### Setup development environment

\`\`\`bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\\Scripts\\activate
pip install -r requirements-dev.txt
\`\`\`

### Running tests

\`\`\`bash
pytest
pytest --cov={{PROJECT_NAME}}
\`\`\`

### Code formatting

\`\`\`bash
black {{PROJECT_NAME}}
flake8 {{PROJECT_NAME}}
mypy {{PROJECT_NAME}}
\`\`\``,
		},
		Commands: []string{
			"python -m venv venv",
			"source venv/bin/activate",
			"pip install -e .",
			"{{PROJECT_NAME}} --help",
		},
	})

	// Node.js CLI Template
	RegisterTemplate("node-cli", Template{
		Name:        "node-cli",
		Description: "Node.js CLI application with Commander.js",
		Category:    "CLI",
		Variables: []TemplateVariable{
			{Name: "PROJECT_NAME", Description: "Project name", Default: "node-cli", Required: true},
			{Name: "DESCRIPTION", Description: "Project description", Default: "A Node.js CLI application", Required: false},
		},
		Files: map[string]string{
			"package.json": `{
  "name": "{{PROJECT_NAME}}",
  "version": "1.0.0",
  "description": "{{DESCRIPTION}}",
  "main": "dist/index.js",
  "bin": {
    "{{PROJECT_NAME}}": "./dist/index.js"
  },
  "scripts": {
    "build": "tsc",
    "dev": "ts-node src/index.ts",
    "start": "node dist/index.js",
    "test": "jest",
    "lint": "eslint src --ext .ts"
  },
  "keywords": ["cli", "command-line"],
  "author": "",
  "license": "MIT",
  "dependencies": {
    "chalk": "^5.3.0",
    "commander": "^11.1.0",
    "inquirer": "^9.2.12",
    "ora": "^7.0.1",
    "conf": "^12.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.10.5",
    "@types/inquirer": "^9.0.7",
    "@typescript-eslint/eslint-plugin": "^6.15.0",
    "@typescript-eslint/parser": "^6.15.0",
    "eslint": "^8.56.0",
    "jest": "^29.7.0",
    "@types/jest": "^29.5.11",
    "ts-jest": "^29.1.1",
    "ts-node": "^10.9.2",
    "typescript": "^5.3.3"
  }
}`,
			"tsconfig.json": `{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}`,
			"src/index.ts": `#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { processCommand } from './commands/process';
import { configCommand } from './commands/config';
import { initCommand } from './commands/init';

const program = new Command();

program
  .name('{{PROJECT_NAME}}')
  .description('{{DESCRIPTION}}')
  .version('1.0.0');

program.addCommand(processCommand);
program.addCommand(configCommand);
program.addCommand(initCommand);

program.parse();`,
			"src/commands/process.ts": `import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs/promises';
import path from 'path';

export const processCommand = new Command('process')
  .description('Process files')
  .argument('<input>', 'input file path')
  .option('-o, --output <path>', 'output file path')
  .option('-f, --format <format>', 'output format', 'json')
  .action(async (input, options) => {
    const spinner = ora('Processing file...').start();
    
    try {
      // Read input file
      const content = await fs.readFile(input, 'utf-8');
      
      // Process content (example: parse and reformat)
      let data;
      try {
        data = JSON.parse(content);
      } catch {
        data = { content };
      }
      
      // Format output
      let output;
      switch (options.format) {
        case 'json':
          output = JSON.stringify(data, null, 2);
          break;
        case 'text':
          output = JSON.stringify(data);
          break;
        default:
          output = JSON.stringify(data, null, 2);
      }
      
      // Write or display output
      if (options.output) {
        await fs.writeFile(options.output, output);
        spinner.succeed(chalk.green(\`Output saved to \${options.output}\`));
      } else {
        spinner.stop();
        console.log(output);
      }
    } catch (error) {
      spinner.fail(chalk.red(\`Error: \${error.message}\`));
      process.exit(1);
    }
  });`,
			"src/commands/config.ts": `import { Command } from 'commander';
import chalk from 'chalk';
import { Config } from '../utils/config';

const config = new Config('{{PROJECT_NAME}}');

export const configCommand = new Command('config')
  .description('Manage configuration')
  .option('-l, --list', 'list all configuration')
  .option('-g, --get <key>', 'get configuration value')
  .option('-s, --set <key=value>', 'set configuration value')
  .action((options) => {
    if (options.list) {
      const allConfig = config.getAll();
      console.log(chalk.cyan('Configuration:'));
      Object.entries(allConfig).forEach(([key, value]) => {
        console.log(\`  \${chalk.gray(key)}: \${value}\`);
      });
    } else if (options.get) {
      const value = config.get(options.get);
      if (value !== undefined) {
        console.log(\`\${options.get}: \${value}\`);
      } else {
        console.log(chalk.red(\`Key '\${options.get}' not found\`));
      }
    } else if (options.set) {
      const [key, value] = options.set.split('=');
      if (key && value) {
        config.set(key, value);
        console.log(chalk.green(\`Set \${key} = \${value}\`));
      } else {
        console.log(chalk.red('Invalid format. Use: --set key=value'));
      }
    } else {
      console.log(chalk.yellow('Use --list, --get, or --set'));
    }
  });`,
			"src/commands/init.ts": `import { Command } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import fs from 'fs/promises';
import path from 'path';

export const initCommand = new Command('init')
  .description('Initialize a new project')
  .option('-n, --name <name>', 'project name')
  .option('-d, --dir <directory>', 'project directory', '.')
  .action(async (options) => {
    console.log(chalk.cyan('Initializing new project...'));
    
    // Prompt for project details
    const answers = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Project name:',
        default: options.name || path.basename(process.cwd()),
        when: !options.name
      },
      {
        type: 'input',
        name: 'description',
        message: 'Project description:',
        default: 'A new project'
      },
      {
        type: 'list',
        name: 'template',
        message: 'Choose a template:',
        choices: ['basic', 'advanced', 'minimal']
      }
    ]);
    
    const projectName = options.name || answers.name;
    const projectDir = path.join(options.dir, projectName);
    
    try {
      // Create project directory
      await fs.mkdir(projectDir, { recursive: true });
      
      // Create config file
      const config = {
        name: projectName,
        description: answers.description,
        template: answers.template,
        created: new Date().toISOString()
      };
      
      await fs.writeFile(
        path.join(projectDir, 'project.json'),
        JSON.stringify(config, null, 2)
      );
      
      // Create README
      const readme = \`# \${projectName}

\${answers.description}

Created with {{PROJECT_NAME}}
\`;
      
      await fs.writeFile(path.join(projectDir, 'README.md'), readme);
      
      console.log(chalk.green(\`✓ Project initialized at \${projectDir}\`));
    } catch (error) {
      console.log(chalk.red(\`Error: \${error.message}\`));
      process.exit(1);
    }
  });`,
			"src/utils/config.ts": `import Conf from 'conf';

export class Config {
  private conf: Conf;
  
  constructor(projectName: string) {
    this.conf = new Conf({ projectName });
  }
  
  get(key: string): any {
    return this.conf.get(key);
  }
  
  set(key: string, value: any): void {
    this.conf.set(key, value);
  }
  
  getAll(): Record<string, any> {
    return this.conf.store;
  }
  
  delete(key: string): void {
    this.conf.delete(key);
  }
  
  clear(): void {
    this.conf.clear();
  }
}`,
			"jest.config.js": `module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
  ],
};`,
			"tests/commands.test.ts": `import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

describe('CLI Commands', () => {
  const cli = 'ts-node src/index.ts';
  
  test('should display version', () => {
    const output = execSync(\`\${cli} --version\`).toString();
    expect(output).toContain('1.0.0');
  });
  
  test('should display help', () => {
    const output = execSync(\`\${cli} --help\`).toString();
    expect(output).toContain('{{PROJECT_NAME}}');
    expect(output).toContain('{{DESCRIPTION}}');
  });
  
  test('should process file', () => {
    const testFile = 'test-input.json';
    fs.writeFileSync(testFile, JSON.stringify({ test: 'data' }));
    
    try {
      const output = execSync(\`\${cli} process \${testFile}\`).toString();
      expect(output).toContain('test');
      expect(output).toContain('data');
    } finally {
      fs.unlinkSync(testFile);
    }
  });
});`,
			".gitignore": `node_modules/
dist/
*.log
.DS_Store
.env
.vscode/
.idea/
coverage/
*.tmp
*.temp`,
			"README.md": `# {{PROJECT_NAME}}

{{DESCRIPTION}}

## Installation

### Global installation

\`\`\`bash
npm install -g {{PROJECT_NAME}}
\`\`\`

### Local development

\`\`\`bash
git clone <repository>
cd {{PROJECT_NAME}}
npm install
npm run build
npm link
\`\`\`

## Usage

### Commands

#### Process files
\`\`\`bash
{{PROJECT_NAME}} process input.json -o output.json -f json
\`\`\`

#### Initialize project
\`\`\`bash
{{PROJECT_NAME}} init -n my-project
\`\`\`

#### Manage configuration
\`\`\`bash
{{PROJECT_NAME}} config --list
{{PROJECT_NAME}} config --get api_key
{{PROJECT_NAME}} config --set api_key=your-key
\`\`\`

## Development

### Build
\`\`\`bash
npm run build
\`\`\`

### Run in development
\`\`\`bash
npm run dev -- --help
\`\`\`

### Testing
\`\`\`bash
npm test
\`\`\`

### Linting
\`\`\`bash
npm run lint
\`\`\``,
		},
		Commands: []string{
			"npm install",
			"npm run build",
			"npm link",
			"{{PROJECT_NAME}} --help",
		},
	})
}