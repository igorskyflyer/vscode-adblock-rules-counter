// Author: Igor Dimitrijević (@igorskyflyer)

export interface IExtensionState {
  isDirty: boolean
  lastEvent: 'change' | 'save' | 'init'
  lastCount: number
}
