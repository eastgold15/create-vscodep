#!/usr/bin/env node
import { exec } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { defineCommand, runMain } from "citty";

import { consola } from "consola";
import { render } from "./templates";
import type { PackageManager, Preferences } from "./utils";
import { createPrompt, detectPackageManager } from "./utils";

const execAsync = promisify(exec);

const main = defineCommand({
  meta: {
    name: "create-vscodep",
    version: "1.0.0",
    description: "Create VS Code extensions with modern tooling",
  },
  args: {
    _: {
      type: "positional",
      description: "Project name",
      required: true,
    },
    pm: {
      type: "string",
      description: "Package manager to use (default: auto-detect)",
    },
    framework: {
      type: "string",
      description: "Frontend framework (default: react)",
    },
    linter: {
      type: "string",
      description: "Linter to use (default: None)",
    },
    git: {
      type: "boolean",
      description: "Initialize a Git repository (default: true)",
    },
    vscode: {
      type: "boolean",
      description: "Generate VSCode configuration files (default: true)",
    },
    install: {
      type: "boolean",
      description: "Install dependencies (default: true)",
    },
    defaults: {
      type: "boolean",
      description: "Use all default values (non-interactive)",
    },
  },
  async run({ args }) {
    const packageManager: PackageManager =
      (args.pm as PackageManager) || detectPackageManager();
    const projectName = args._ as string;

    const projectDir = path.resolve(projectName);

    try {
      await fs.access(projectDir);
      const filesInTargetDirectory = await fs.readdir(projectDir);
      if (filesInTargetDirectory.length > 0) {
        const response = await createPrompt([
          {
            type: "confirm",
            name: "overwrite",
            message:
              "Target directory is not empty. Remove existing files and continue?",
            initial: false,
          },
        ]);
        if (!response.overwrite) {
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
      framework: "react",
      linter: "ultracite",
      runtime: packageManager === "bun" ? "Bun" : "Node.js",
      git: true,
      vscode: true,
      noInstall: args.install === undefined ? false : !args.install,
      meta: {
        commandName: "hello-world",
        viewName: "HelloWorld",
      },
    };

    // 使用默认值或交互式问答
    if (args.defaults || args.framework || args.linter) {
      // 使用命令行参数
      if (args.framework) {
        preferences.framework = args.framework as "react" | "vue";
      }
      if (args.linter) {
        preferences.linter = args.linter as
          | "ESLint"
          | "Biome"
          | "None"
          | "ultracite";
      }
      if (args.git === false) {
        preferences.git = false;
      }
      if (args.vscode === false) {
        preferences.vscode = false;
      }
      if (args.defaults) {
        console.log("Using default options...");
        preferences.git = false;
        preferences.vscode = false;
        preferences.noInstall = true;
      }
    } else {
      // 交互式问答
      const answers = await createPrompt([
        {
          type: "select",
          name: "framework",
          message: "Select a framework",
          choices: [
            { title: "react", value: "react" },
            { title: "vue", value: "vue" },
          ],
          initial: 0,
        },
        {
          type: "select",
          name: "linter",
          message: "Select a linter",
          choices: [
            { title: "ESLint", value: "ESLint" },
            { title: "Biome", value: "Biome" },
            { title: "None", value: "None" },
            { title: "ultracite(biome 预设)", value: "ultracite" },
          ],
          initial: 2,
        },
        {
          type: "confirm",
          name: "git",
          message: "Initialize Git repository?",
          initial: true,
        },
        {
          type: "confirm",
          name: "vscode",
          message: "Generate VSCode configuration?",
          initial: true,
        },
        {
          type: "confirm",
          name: "install",
          message: "Install dependencies?",
          initial: true,
        },
      ]);

      preferences.framework = answers.framework as "react" | "vue";
      preferences.linter = answers.linter as
        | "ESLint"
        | "Biome"
        | "None"
        | "ultracite";
      preferences.git = answers.git;
      preferences.vscode = answers.vscode;
      preferences.noInstall = !answers.install;
    }

    console.log("Generating project...");
    await render(preferences);
    console.log("✅ Project generated!");

    if (!preferences.noInstall) {
      console.log("Installing dependencies...");
      const commands = getInstallCommands(preferences);
      for (const cmd of commands) {
        console.log(`  $ ${cmd}`);
        await execAsync(cmd, { cwd: projectDir });
      }
      console.log("✅ Dependencies installed!");

      if (preferences.linter === "ultracite") {
        // 新增：ultracite 专属提醒（醒目样式）
        consola.warn(
          "\n⚠️  Important: Ultracite needs manual initialization! " +
            "Please run the following command in your project directory:\n" +
            `  ${preferences.packageManager} x ultracite init` +
            "\nThis will set up Ultracite configuration for your project."
        );
        // 可选：添加更醒目的分隔线 + 代码块
        consola.fatal(
          `\n📝 Manual command to run (copy & paste):
          ${"```bash"}
          cd ${preferences.projectName}
          ${preferences.packageManager} x ultracite init
          ${"```"}`
        );
      }
    }

    console.log(`\n✅ Project created at: ${projectDir}`);
    console.log("\nNext steps:");
    console.log(`  cd ${projectName}`);
    console.log(
      `  ${preferences.packageManager === "bun" ? "bun dev" : "npm run dev"}`
    );
  },
});

function getInstallCommands(preferences: Preferences): string[] {
  const commands: string[] = [];

  if (preferences.git) {
    commands.push("git init");
  }

  const installCmd = `${preferences.packageManager} install`;
  commands.push(installCmd);

  if (preferences.linter === "Biome") {
    commands.push(`${preferences.packageManager} exec biome init`);
  }
  if (preferences.linter === "ultracite") {
    // commands.push(`${preferences.packageManager} x ultracite init`);
    return commands;
  }

  if (preferences.linter === "ESLint") {
    commands.push(`${preferences.packageManager} run lint:fix`);
  }

  return commands;
}

runMain(main);
