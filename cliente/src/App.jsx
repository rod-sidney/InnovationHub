// App.jsx
// Componente raíz del cliente

import { Routes, Route } from 'react-router';

import Encabezado from './componentes/layout/Encabezado.jsx';
import PiePagina from './componentes/layout/PiePagina.jsx';
import Inicio from './paginas/Inicio.jsx';
import Catalogo from './paginas/Catalogo.jsx';
import DetalleIniciativa from './paginas/DetalleIniciativa.jsx';
import NoEncontrada from './paginas/NoEncontrada.jsx';

function App() {
    return (
        <div className="d-flex flex-column min-vh-100 bg-light">
            <Encabezado />

            <main className="flex-grow-1">
                <Routes>
                    <Route path="/" element={<Inicio />} />
                    <Route path="/iniciativas" element={<Catalogo />} />
                    {/* :id es un parámetro: el detalle se arma con el valor que venga en la dirección */}
                    <Route path="/iniciativas/:id" element={<DetalleIniciativa />} />

                    {/* Cualquier otra dirección: página no encontrada */}
                    <Route path="*" element={<NoEncontrada />} />
                </Routes>
            </main>

            <PiePagina />
        </div>
    );
}

export default App;

