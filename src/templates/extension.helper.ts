import dedent from 'ts-dedent';
import type { Preferences } from '../utils';

export function getExtensionHelper(preferences: Preferences) {
  return dedent`
    import * as vscode from 'vscode';

    export function getWebviewContent(webview: vscode.Webview, extensionUri: vscode.Uri): string {
      // Use Vite dev server in development
      const isDevelopment = process.env.NODE_ENV !== 'production';

      if (isDevelopment) {
        const devServerUrl = 'http://localhost:5173';
        return \`<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Hello World</title>
      </head>
      <body>
        <div id="root"></div>
        <script type="module" src="\${devServerUrl}/@vite/client"></script>
        <script type="module" src="\${devServerUrl}/src/main.${preferences.framework === 'react' ? 'tsx' : 'ts'}"></script>
      </body>
    </html>\`;
      }

      // Use built files in production
      const scriptUri = webview.asWebviewUri(
        vscode.Uri.joinPath(extensionUri, 'dist', 'assets', 'index.js'),
      );
      const styleUri = webview.asWebviewUri(
        vscode.Uri.joinPath(extensionUri, 'dist', 'assets', 'index.css'),
      );

      return \`<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Hello World</title>
        <link rel="stylesheet" href="\${styleUri}">
      </head>
      <body>
        <div id="root"></div>
        <script src="\${scriptUri}"></script>
      </body>
    </html>\`;
    }

    export function setupWebviewHooks(webview: vscode.Webview) {
      webview.onDidReceiveMessage(
        (message) => {
          console.log('Received message:', message);
          // Handle messages from webview
          switch (message.type) {
            case 'hello':
              vscode.window.showInformationMessage('Hello from webview!');
              break;
            default:
              break;
          }
        },
        undefined,
      );
    }
  `;
}
