// Author: Igor Dimitrijević (@igorskyflyer)

import type { ExtensionContext } from 'vscode'

export interface IExtensionState {
  context: ExtensionContext
  isDirty: boolean
  lastEvent: 'change' | 'save' | 'init'
  lastCount: number
}
