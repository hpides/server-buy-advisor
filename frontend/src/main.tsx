import { BenchmarkProvider } from './utility/BenchmarkContext.tsx'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <BenchmarkProvider>
    <App />
  </BenchmarkProvider>
)
