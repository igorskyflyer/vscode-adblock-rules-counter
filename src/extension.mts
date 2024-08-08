// Author: Igor Dimitrijević (@igorskyflyer)

import { countRules } from '@igor.dvlpr/adblock-filter-counter'
import * as vscode from 'vscode'
import type { IExtensionState } from './IExtensionState.mjs'
import type { MaybeEditor } from './MaybeEditor.mjs'

const state: IExtensionState = {
  isDirty: false,
  lastEvent: 'init',
  lastCount: 0
}

let statusBarItem: vscode.StatusBarItem | null = null

function getContents(resource: string | MaybeEditor): string {
  if (typeof resource === 'string') {
    return resource
  }

  if (!resource || resource.document.languageId !== 'adblock') {
    return ''
  }

  return resource.document.getText()
}

function updateStatusBar(
  context: vscode.ExtensionContext,
  rulesCount: number
): void {
  if (!statusBarItem) {
    statusBarItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Right,
      100
    )
    statusBarItem.show()
    context.subscriptions.push(statusBarItem)
  }

  if (state.lastEvent === 'change' && state.isDirty) {
    if (statusBarItem.text.endsWith('(*)')) {
      return
    }

    statusBarItem.text += ' (*)'
    return
  }

  statusBarItem.tooltip = `Detected ${rulesCount} Adblock rule(s).`
  statusBarItem.text = `$(output) ${rulesCount} rule(s)`
}

function updateUi(context: vscode.ExtensionContext, contents: string): void
function updateUi(context: vscode.ExtensionContext, editor: MaybeEditor): void
function updateUi(context: vscode.ExtensionContext, rulesCount: number): void
function updateUi(
  context: vscode.ExtensionContext,
  resource: string | number | MaybeEditor
): void {
  if (!resource) {
    return
  }

  let rulesCount: number

  if (typeof resource === 'number') {
    rulesCount = resource
  } else {
    if (typeof resource !== 'string') {
      state.isDirty = resource.document.isDirty
    }

    const adblockFilter: string = getContents(resource)
    rulesCount = countRules(adblockFilter)
    state.lastCount = rulesCount
  }

  updateStatusBar(context, rulesCount)
}

export function activate(context: vscode.ExtensionContext) {
  const activeEditor: MaybeEditor = vscode.window.activeTextEditor

  if (activeEditor && activeEditor.document.languageId === 'adblock') {
    state.isDirty = activeEditor.document.isDirty
    updateUi(context, activeEditor)
  }

  vscode.window.onDidChangeActiveTextEditor((editor: MaybeEditor) => {
    updateUi(context, editor)
  })

  vscode.workspace.onDidChangeTextDocument(
    (event: vscode.TextDocumentChangeEvent) => {
      state.isDirty = event.document.isDirty
      state.lastEvent = 'change'
      updateUi(context, state.lastCount)
    }
  )

  vscode.workspace.onDidSaveTextDocument((document: vscode.TextDocument) => {
    state.isDirty = document.isDirty
    state.lastEvent = 'save'
    updateUi(context, document.getText())
  })
}

export function deactivate() {
  statusBarItem?.dispose()
}
