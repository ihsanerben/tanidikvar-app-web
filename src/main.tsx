import { NotificationProvider } from './features/notifications/NotificationProvider'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { App } from './app/App'
import './styles.css'
import { AuthProvider } from './features/auth/AuthContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode><BrowserRouter><AuthProvider><NotificationProvider><App /></NotificationProvider></AuthProvider></BrowserRouter></StrictMode>,
)
