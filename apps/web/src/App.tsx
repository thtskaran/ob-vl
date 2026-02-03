import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Creator } from './pages/Creator'
import { Viewer } from './pages/Viewer'
import { FloatingHearts } from './components/decorations/FloatingHearts'

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen relative overflow-hidden">
        <FloatingHearts />
        <main className="relative z-10">
          <Routes>
            <Route path="/" element={<Creator />} />
            <Route path="/:slug" element={<Viewer />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
