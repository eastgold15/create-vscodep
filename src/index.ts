#!/usr/bin/env node
import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import fs from 'node:fs/promises';
import path from 'node:path';
import minimist from 'minimist';
import { createPrompt, detectPackageManager, PreferencesClass } from './utils';
import type { PackageManager, Preferences } from './utils';
import { render } from './templates';

const execAsync = promisify(exec);

interface Args {
  _: string[];
  pm?: string;
  install?: boolean;
  defaults?: boolean;
  framework?: string;
  linter?: string;
  git?: string;
  vscode?: string;
  [key: string]: any;
}

const args = minimist(process.argv.slice(2)) as Args;

async function main() {
  const packageManager: PackageManager =
    (args.pm as PackageManager) || detectPackageManager();
  const projectName = args._[0];

  if (!projectName) {
    console.error('Usage: create-vscodep <project-name>');
    process.exit(1);
  }

  const projectDir = path.resolve(projectName);

  try {
    await fs.access(projectDir);
    const filesInTargetDirectory = await fs.readdir(projectDir);
    if (filesInTargetDirectory.length > 0) {
      const { overwrite } = await createPrompt([
        {
          type: 'confirm',
          name: 'overwrite',
          message:
            'Target directory is not empty. Remove existing files and continue?',
          initial: false,
        },
      ]);
      if (!overwrite) {
        process.exit(0);
      }
      await fs.rm(projectDir, { recursive: true, force: true });
    }
  } catch {
    // Directory doesn't exist, continue
  }

  await fs.mkdir(projectDir, { recursive: true });

  const preferences: Preferences = {
    projectName: path.basename(projectDir),
    dir: projectDir,
    packageManager,
    framework: 'react',
    linter: 'None',
    runtime: packageManager === 'bun' ? 'Bun' : 'Node.js',
    git: true,
    vscode: true,
    noInstall: args.install === undefined ? false : !args.install,
    meta: {
      commandName: 'hello-world',
      viewName: 'HelloWorld',
    },
  };

  // 使用默认值或交互式问答
  if (args.defaults || args.framework || args.linter) {
    // 使用命令行参数
    if (args.framework) {
      preferences.framework = args.framework as 'react' | 'vue';
    }
    if (args.linter) {
      preferences.linter = args.linter as 'ESLint' | 'Biome' | 'None';
    }
    if (args.git === 'false' || args.git === 'false') {
      preferences.git = false;
    }
    if (args.vscode === 'false' || !args.vscode) {
      preferences.vscode = false;
    }
    if (args.defaults) {
      console.log('Using default options...');
      preferences.git = false;
      preferences.vscode = false;
      preferences.noInstall = true;
    }
  } else {
    // 交互式问答
    const answers = await createPrompt([
      {
        type: 'select',
        name: 'framework',
        message: 'Select a framework',
        choices: ['react', 'vue'],
        initial: 0,
      },
      {
        type: 'select',
        name: 'linter',
        message: 'Select a linter',
        choices: ['ESLint', 'Biome', 'None'],
        initial: 2,
      },
      {
        type: 'confirm',
        name: 'git',
        message: 'Initialize Git repository?',
        initial: true,
      },
      {
        type: 'confirm',
        name: 'vscode',
        message: 'Generate VSCode configuration?',
        initial: true,
      },
      {
        type: 'confirm',
        name: 'install',
        message: 'Install dependencies?',
        initial: true,
      },
    ]);

    preferences.framework = answers.framework as 'react' | 'vue';
    preferences.linter = answers.linter as 'ESLint' | 'Biome' | 'None';
    preferences.git = answers.git;
    preferences.vscode = answers.vscode;
    preferences.noInstall = !answers.install;
  }

  console.log('Generating project...');
  await render(preferences);
  console.log('✅ Project generated!');

  if (!preferences.noInstall) {
    console.log('Installing dependencies...');
    const commands = getInstallCommands(preferences);
    for (const cmd of commands) {
      console.log(`  $ ${cmd}`);
      await execAsync(cmd, { cwd: projectDir });
    }
    console.log('✅ Dependencies installed!');
  }

  console.log(`\n✅ Project created at: ${projectDir}`);
  console.log(`\nNext steps:`);
  console.log(`  cd ${projectName}`);
  console.log(`  ${preferences.packageManager === 'bun' ? 'bun dev' : 'npm run dev'}`);
}

function getInstallCommands(preferences: Preferences): string[] {
  const commands: string[] = [];

  if (preferences.git) {
    commands.push('git init');
  }

  const installCmd = `${preferences.packageManager} install`;
  commands.push(installCmd);

  if (preferences.linter === 'Biome') {
    commands.push(`${preferences.packageManager} exec biome init`);
  }

  if (preferences.linter === 'ESLint') {
    commands.push(`${preferences.packageManager} run lint:fix`);
  }

  return commands;
}

main().catch(console.error);
