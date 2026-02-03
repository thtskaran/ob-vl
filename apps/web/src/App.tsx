import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Creator } from './pages/Creator'
import { Viewer } from './pages/Viewer'
import { FloatingHearts } from './components/decorations/FloatingHearts'
import { ErrorBoundary } from './components/ErrorBoundary'

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <div className="min-h-screen relative overflow-hidden">
          <FloatingHearts />
          <main className="relative z-10">
            <Routes>
              <Route
                path="/"
                element={
                  <ErrorBoundary>
                    <Creator />
                  </ErrorBoundary>
                }
              />
              <Route
                path="/:slug"
                element={
                  <ErrorBoundary>
                    <Viewer />
                  </ErrorBoundary>
                }
              />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App
