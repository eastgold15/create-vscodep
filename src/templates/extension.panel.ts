import dedent from 'ts-dedent';
import type { Preferences } from '../utils';

export function getExtensionPanel(preferences: Preferences) {
  const { meta, framework } = preferences;

  const extension = framework === 'react' ? '.tsx' : '';

  return dedent`
    import * as vscode from 'vscode';
    import { getWebviewContent, setupWebviewHooks } from './helper';
    import { ${meta.viewName}Panel } from './panel';

    export class ${meta.viewName}Panel {
      public static currentPanel: ${meta.viewName}Panel | undefined;
      public static readonly viewType = '${meta.viewName}.view';

      private readonly _panel: vscode.WebviewPanel;
      private _disposables: vscode.Disposable[] = [];

      public static createOrShow(extensionUri: vscode.Uri) {
        const column = vscode.window.activeTextEditor
          ? vscode.window.activeTextEditor.viewColumn
          : undefined;

        if (${meta.viewName}Panel.currentPanel) {
          ${meta.viewName}Panel.currentPanel._panel.reveal(column);
          return;
        }

        const panel = vscode.window.createWebviewPanel(
          ${meta.viewName}Panel.viewType,
          '${meta.viewName}',
          column || vscode.ViewColumn.One,
          {
            enableScripts: true,
            retainContextWhenHidden: true,
            localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'dist')],
          },
        );

        ${meta.viewName}Panel.currentPanel = new ${meta.viewName}Panel(panel, extensionUri);
      }

      private constructor(panel: vscode.WebviewPanel, private readonly _extensionUri: vscode.Uri) {
        this._panel = panel;

        this._panel.webview.html = getWebviewContent(
          this._panel.webview,
          this._extensionUri,
        );

        setupWebviewHooks(this._panel.webview);

        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
      }

      public dispose() {
        ${meta.viewName}Panel.currentPanel = undefined;
        this._panel.dispose();

        while (this._disposables.length) {
          const disposable = this._disposables.pop();
          if (disposable) {
            disposable.dispose();
          }
        }
      }

      public static async render(context: vscode.ExtensionContext) {
        ${meta.viewName}Panel.createOrShow(context.extensionUri);
      }
    }
  `;
}
