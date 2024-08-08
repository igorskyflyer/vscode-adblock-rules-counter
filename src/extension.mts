// Author: Igor Dimitrijević (@igorskyflyer)

import { countRules } from '@igor.dvlpr/adblock-filter-counter'
import {
  type ExtensionContext,
  StatusBarAlignment,
  type StatusBarItem,
  type TextDocument,
  type TextDocumentChangeEvent,
  window,
  workspace
} from 'vscode'
import type { IExtensionState } from './IExtensionState.mjs'
import type { IUiOptions } from './IUiOptions.mjs'
import type { MaybeEditor } from './MaybeEditor.mjs'

let state: IExtensionState
let statusBarItem: StatusBarItem | null = null

function updateUi(options: IUiOptions): void {
  const { rulesCount = -1, updateDirty = false, show = true } = options

  if (!statusBarItem) {
    statusBarItem = window.createStatusBarItem(StatusBarAlignment.Right, 100)
    state.context.subscriptions.push(statusBarItem)
  }

  if (show === false) {
    statusBarItem.hide()
    return
  }

  if (updateDirty && state.lastEvent === 'change' && state.isDirty) {
    if (statusBarItem.text.endsWith('(*)')) {
      return
    }

    statusBarItem.text += ' (*)'
    return
  }

  if (rulesCount > -1) {
    statusBarItem.tooltip = `Detected ${rulesCount} Adblock rule(s).`
    statusBarItem.text = `$(output) ${rulesCount} rule(s)`
  }

  statusBarItem.show()
}

function updateUiFromResource(resource: string | MaybeEditor): void {
  if (!resource) {
    return
  }

  let adblockFilter: string = ''

  if (typeof resource !== 'string') {
    if (!resource || resource.document.languageId !== 'adblock') {
      updateUi({ show: false })
      return
    }

    adblockFilter = resource.document.getText()
  } else {
    adblockFilter = resource
  }

  const rulesCount: number = countRules(adblockFilter)
  state.lastCount = rulesCount

  updateUi({ rulesCount })
}

export function activate(context: ExtensionContext) {
  state = {
    context: context,
    isDirty: false,
    lastEvent: 'init',
    lastCount: 0
  }

  const activeEditor: MaybeEditor = window.activeTextEditor

  if (activeEditor && activeEditor.document.languageId === 'adblock') {
    state.isDirty = activeEditor.document.isDirty

    updateUiFromResource(activeEditor)
  }

  context.subscriptions.push(
    window.onDidChangeActiveTextEditor((editor: MaybeEditor) => {
      if (editor) {
        updateUiFromResource(editor)
      }
    })
  )

  context.subscriptions.push(
    workspace.onDidChangeTextDocument((event: TextDocumentChangeEvent) => {
      if (state.isDirty !== event.document.isDirty) {
        state.isDirty = event.document.isDirty
        state.lastEvent = 'change'

        updateUi({ updateDirty: true })
      }
    })
  )

  context.subscriptions.push(
    workspace.onDidSaveTextDocument((document: TextDocument) => {
      state.isDirty = document.isDirty
      state.lastEvent = 'save'

      updateUiFromResource(document.getText())
    })
  )
}

export function deactivate() {}
