import { NotificationProvider } from './features/notifications/NotificationProvider'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { App } from './app/App'
import './styles.css'
import { AuthProvider } from './features/auth/AuthContext'
import { AppBoundary } from './app/AppBoundary'
import { PageAnnouncement } from './app/PageAnnouncement'

createRoot(document.getElementById('root')!).render(
  <StrictMode><AppBoundary><BrowserRouter><AuthProvider><NotificationProvider><PageAnnouncement/><App /></NotificationProvider></AuthProvider></BrowserRouter></AppBoundary></StrictMode>,
)
