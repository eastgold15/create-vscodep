import dedent from 'ts-dedent';
import type { Preferences } from '../utils';
import { dependencies } from '../deps';

export function getPackageJson(preferences: Preferences) {
  const { projectName, framework, linter, packageManager } = preferences;

  const deps: Record<string, string> = {};
  const devDeps: Record<string, string> = {};

  // 核心依赖
  deps['@vscode/webview-ui-toolkit'] = dependencies['@vscode/webview-ui-toolkit'];

  if (framework === 'react') {
    deps.react = dependencies.react;
    deps['react-dom'] = dependencies['react-dom'];
    devDeps['@types/react'] = dependencies['@types/react'];
    devDeps['@types/react-dom'] = dependencies['@types/react-dom'];
  } else if (framework === 'vue') {
    deps.vue = dependencies.vue;
    devDeps['@vue/tsconfig'] = dependencies['@vue/tsconfig'];
  }

  // 核心开发依赖
  devDeps['@tomjs/tsconfig'] = dependencies['@tomjs/tsconfig'];
  devDeps['@tomjs/vite-plugin-vscode'] = dependencies['@tomjs/vite-plugin-vscode'];
  devDeps['@types/vscode'] = dependencies['@types/vscode'];
  devDeps['@types/vscode-webview'] = dependencies['@types/vscode-webview'];
  devDeps.vite = dependencies.vite;

  if (framework === 'react') {
    devDeps['@vitejs/plugin-react'] = dependencies['@vitejs/plugin-react'];
  } else if (framework === 'vue') {
    devDeps['@vitejs/plugin-vue'] = dependencies['@vitejs/plugin-vue'];
  }

  // Linter
  if (linter === 'ESLint') {
    devDeps.eslint = dependencies.eslint;
  } else if (linter === 'Biome') {
    devDeps['@biomejs/biome'] = dependencies['@biomejs/biome'];
  }

  const scripts: Record<string, string> = {
    dev: 'vite',
    build: 'tsc && vite build',
    preview: 'vite preview',
  };

  if (linter === 'ESLint') {
    scripts.lint = 'eslint .';
    scripts['lint:fix'] = 'eslint . --fix';
  } else if (linter === 'Biome') {
    scripts.lint = 'biome check .';
    scripts['lint:fix'] = 'biome check . --write';
  }

  return dedent`
    {
      "publisher": "your-publisher-name",
      "name": "${projectName}",
      "type": "commonjs",
      "version": "0.0.1",
      "private": true,
      "description": "VS Code extension built with ${framework}",
      "main": "dist/extension/index.js",
      "engines": {
        "node": ">=18",
        "vscode": "^1.75.0"
      },
      "activationEvents": [],
      "contributes": {
        "commands": [
          {
            "command": "${preferences.meta.commandName}.show${preferences.meta.viewName}",
            "title": "${preferences.meta.viewName}: Show"
          }
        ]
      },
      "scripts": ${JSON.stringify(scripts, null, 2).replace(/\n/g, '\n      ')},
      "dependencies": ${JSON.stringify(deps, null, 2).replace(/\n/g, '\n      ')},
      "devDependencies": ${JSON.stringify(devDeps, null, 2).replace(/\n/g, '\n      ')}
    }
  `;
}
