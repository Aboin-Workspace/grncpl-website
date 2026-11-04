import { createContext, useContext } from 'react'

export interface AppState {
  /** True once the preloader has finished (or was skipped this session). */
  started: boolean
}
export const AppStateContext = createContext<AppState>({ started: true })
export const useAppState = () => useContext(AppStateContext)
