import dedent from "ts-dedent";
import type { Preferences } from "../utils";

export function getTSConfigRoot() {
  return dedent`
    {
      "files": [],
      "references": [
        { "path": "./tsconfig.app.json" },
        { "path": "./tsconfig.node.json" }
      ]
    }
  `;
}

export function getTSConfigApp(preferences: Preferences) {
  const { framework } = preferences;

  let extendsPath = "";
  let includes = "";

  if (framework === "react") {
    extendsPath = "@tomjs/tsconfig/react-dom.json";
    includes = '"src/**/*.ts", "src/**/*.tsx", "src/**/*.d.ts"';
  } else if (framework === "vue") {
    extendsPath = "@vue/tsconfig/tsconfig.dom.json";
    includes = '"src/**/*.ts", "src/**/*.tsx", "src/**/*.vue"';
  }

  return dedent`
    {
      "extends": "${extendsPath}",
      "compilerOptions": {
        "composite": true,
        "lib": ["ES2020", "DOM", "DOM.Iterable"],
        "jsx": "react-jsx"
      },
      "include": [${includes}]
    }
  `;
}

export function getTSConfigNode() {
  return dedent`
    {
      "extends": "@tomjs/tsconfig/node.json",
      "compilerOptions": {
        "composite": true
      },
      "include": ["extension", "*.config.ts"]
    }
  `;
}
