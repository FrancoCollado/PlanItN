import { StrictMode } from 'react' //importamos StrictMode para identificar problemas en la app
import { createRoot } from 'react-dom/client' 
import './index.scss' //estilos globales de la app
import App from './App.tsx'

//punto de entrada de la aplicacion react

//renderizamos la app en el elemento con id root del index.html
createRoot(document.getElementById('root')!).render( 
  <StrictMode>
    <App />
  </StrictMode>,
)
