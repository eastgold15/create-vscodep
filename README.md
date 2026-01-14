# Create VSCodeP

> Create VS Code extensions with modern tooling

## Features

- 🚀 **Fast Development**: Vite + HMR
- ⚛️ **React Support**: React 19 with TypeScript
- 🎨 **Vue Support**: Vue 3 with TypeScript
- 🔧 **Linting**: ESLint or Biome
- 📦 **Modern Stack**: Bun or Node.js
- 🛠️ **VSCode Integration**: Full VSCode extension support

## Usage

### Interactive Mode

\`\`\`bash
bunx create-vscodep my-extension
\`\`\`

### Using Bun

\`\`\`bash
bun create vscodep my-extension
\`\`\`

### Using npm

\`\`\`bash
npx create-vscodep my-extension
\`\`\`

### Using pnpm

\`\`\`bash
pnpm create vscodep my-extension
\`\`\`

### Using Yarn

\`\`\`bash
yarn create vscodep my-extension
\`\`\`

## Command-Line Options

You can use command-line flags to skip interactive prompts:

\`\`\`bash
create-vscodep my-extension [options]
\`\`\`

### Options

- `--pm <bun|npm|pnpm|yarn>` - Package manager to use (default: auto-detect)
- `--framework <react|vue>` - Frontend framework (default: react)
- `--linter <ESLint|Biome|None>` - Linter to use (default: None)
- `--git` - Initialize a Git repository (default: true)
- `--vscode` - Generate VSCode configuration files (default: true)
- `--install` - Install dependencies (default: true)
- `--no-install` - Skip dependency installation
- `--defaults` - Use all default values (non-interactive)

### Examples

#### Create a React project with ESLint

\`\`\`bash
create-vscodep my-extension --framework=react --linter=ESLint
\`\`\`

#### Create a Vue project with Biome

\`\`\`bash
create-vscodep my-extension --framework=vue --linter=Biome
\`\`\`

#### Quick start with all defaults

\`\`\`bash
create-vscodep my-extension --defaults
\`\`\`

#### Skip dependency installation

\`\`\`bash
create-vscodep my-extension --no-install
\`\`\`

#### Use specific package manager

\`\`\`bash
create-vscodep my-extension --pm=pnpm
\`\`\`

## Project Structure

\`\`\`
my-extension/
├── extension/          # Extension backend (Node.js)
│   ├── index.ts        # Extension entry point
│   └── views/          # Webview management
│       ├── panel.ts   # WebviewPanel management
│       └── helper.ts  # Webview utilities
├── src/               # Frontend (React/Vue)
│   ├── main.tsx/ts   # Entry point
│   ├── App.tsx/vue   # Main component
│   ├── utils/         # Utilities
│   │   └── vscode.ts # VSCode API wrapper
│   └── vite-env.d.ts # Vite type declarations
├── .vscode/           # VSCode config (optional)
│   ├── settings.json
│   ├── extensions.json
│   ├── launch.json
│   └── tasks.json
├── .gitignore
├── package.json       # Project manifest
├── tsconfig.json      # TypeScript config
├── tsconfig.app.json  # Frontend TypeScript config
├── tsconfig.node.json # Backend TypeScript config
├── vite.config.ts     # Vite configuration
├── eslint.config.mjs  # ESLint config (optional)
├── biome.json         # Biome config (optional)
└── README.md
\`\`\`

## Getting Started

\`\`\`bash
cd my-extension
bun run dev
\`\`\`

Then press \`F5\` in VS Code to launch the extension in a new window.

## Development

### Build

\`\`\`bash
bun run build
\`\`\`

### Preview

\`\`\`bash
bun run preview
\`\`\`

## License

MIT
