import { createContext, useContext } from 'react'
import type { Location } from 'react-router-dom'

export const DisplayLocationContext = createContext<Location | null>(null)
/** The location currently rendered (lags the router location during the page wipe). */
export const useDisplayLocation = () => useContext(DisplayLocationContext)
