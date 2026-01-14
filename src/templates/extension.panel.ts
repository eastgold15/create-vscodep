import dedent from "ts-dedent";
import type { Preferences } from "../utils";

export function getExtensionPanel(preferences: Preferences) {
  const { meta, framework } = preferences;

  const extension = framework === "react" ? ".tsx" : "";

  return dedent`
   import type { Disposable, ExtensionContext, WebviewPanel } from 'vscode';
import { ViewColumn, window } from 'vscode';
import { WebviewHelper } from './helper';

export class ${meta.viewName}Panel {
  public static currentPanel: ${meta.viewName}Panel | undefined;
  private readonly _panel: WebviewPanel;
  private _disposables: Disposable[] = [];

  private constructor(panel: WebviewPanel, context: ExtensionContext) {
    this._panel = panel;

    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
    this._panel.webview.html = WebviewHelper.setupHtml(this._panel.webview, context);

    WebviewHelper.setupWebviewHooks(this._panel.webview, this._disposables);
  }

  public static render(context: ExtensionContext) {
    if (MainPanel.currentPanel) {
      MainPanel.currentPanel._panel.reveal(ViewColumn.One);
    }
    else {
      const panel = window.createWebviewPanel('showHelloWorld', 'Hello World', ViewColumn.One, {
        enableScripts: true,
      });

      ${meta.viewName}Panel.currentPanel = new ${meta.viewName}Panel(panel, context);
    }
    ${meta.viewName}Panel.currentPanel._panel.webview.postMessage({ type: 'hello', data: 'Hello World!' });
  }

  /**
   * Cleans up and disposes of webview resources when the webview panel is closed.
   */
  public dispose() {
    ${meta.viewName}Panel.currentPanel = undefined;

    // Dispose of the current webview panel
    this._panel.dispose();

    // Dispose of all disposables (i.e. commands) for the current webview panel
    while (this._disposables.length) {
      const disposable = this._disposables.pop();
      if (disposable) {
        disposable.dispose();   
      }
    }
  }
}
  `;
}
