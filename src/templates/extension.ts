import dedent from 'ts-dedent';
import type { Preferences } from '../utils';

export function getExtensionIndex(preferences: Preferences) {
  const { meta } = preferences;

  return dedent`
    import type { ExtensionContext } from 'vscode';
    import { commands } from 'vscode';
    import { ${meta.viewName}Panel } from './views/panel';

    export function activate(context: ExtensionContext) {
      context.subscriptions.push(
        commands.registerCommand('${meta.commandName}.show${meta.viewName}', async () => {
          await ${meta.viewName}Panel.render(context);
        }),
      );
    }

    export function deactivate() {}
  `;
}
