// Author: Igor Dimitrijević (@igorskyflyer)

import * as vscode from 'vscode'

export function activate(context: vscode.ExtensionContext) {
  const disposable: vscode.Disposable = vscode.commands.registerCommand(
    'ext.sayHello',
    () => {
      vscode.window.showInformationMessage('Hello World')
    }
  )

  context.subscriptions.push(disposable)
}

export function deactivate() {}
