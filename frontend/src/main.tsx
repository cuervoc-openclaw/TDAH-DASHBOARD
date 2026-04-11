import React from 'react'
import ReactDOM from 'react-dom/client'
import { Toaster } from 'sonner'
import App from './App.tsx'
import './styles/globals.css'

// PWA update handling
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(registration => {
      console.log('SW registered: ', registration)
      
      // Check for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New update available
              const updatePrompt = document.getElementById('pwa-update')
              const reloadBtn = document.getElementById('pwa-update-reload')
              const dismissBtn = document.getElementById('pwa-update-dismiss')
              
              if (updatePrompt && reloadBtn && dismissBtn) {
                updatePrompt.classList.remove('hidden')
                
                reloadBtn.addEventListener('click', () => {
                  newWorker.postMessage({ type: 'SKIP_WAITING' })
                  window.location.reload()
                })
                
                dismissBtn.addEventListener('click', () => {
                  updatePrompt.classList.add('hidden')
                })
              }
            }
          })
        }
      })
    }).catch(error => {
      console.log('SW registration failed: ', error)
    })
  })
}

// Reduced motion detection
const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
if (mediaQuery.matches) {
  const warning = document.getElementById('reduced-motion-warning')
  if (warning) {
    warning.classList.remove('hidden')
    setTimeout(() => {
      warning.classList.add('hidden')
    }, 5000)
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
    <Toaster 
      position="bottom-right"
      toastOptions={{
        className: 'dark:bg-neutral-800 dark:text-neutral-100 dark:border-neutral-700',
        duration: 4000,
      }}
    />
  </React.StrictMode>,
)