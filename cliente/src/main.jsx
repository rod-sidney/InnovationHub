// main.jsx
// Punto de entrada del cliente

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router'; // lee la dirección del navegador para que React Router sepa qué página mostrar

import './styles/main.scss';

import App from './App.jsx';
import { ProveedorSesion } from './contexto/SesionContexto.jsx'; // comparte la sesión con todos los componentes que están dentro de él

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ProveedorSesion>
        <App />
      </ProveedorSesion>
    </BrowserRouter>
  </StrictMode>
);
