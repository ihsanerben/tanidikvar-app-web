import { render as testingRender } from '@testing-library/react'
import type { ReactNode } from 'react'
import { NotificationProvider } from '../features/notifications/NotificationProvider'
export function render(ui:ReactNode){return testingRender(<NotificationProvider>{ui}</NotificationProvider>)}
