// App.jsx
// Componente raíz del cliente

import { Routes, Route } from 'react-router';

import Encabezado from './componentes/layout/Encabezado.jsx';
import PiePagina from './componentes/layout/PiePagina.jsx';
import Inicio from './paginas/Inicio.jsx';
import Catalogo from './paginas/Catalogo.jsx';
import NoEncontrada from './paginas/NoEncontrada.jsx';

function App() {
    return (
        <div className="d-flex flex-column min-vh-100 bg-light">
            <Encabezado />

            <main className="flex-grow-1">
                <Routes>
                    <Route path="/" element={<Inicio />} />
                    <Route path="/iniciativas" element={<Catalogo />} />

                    {/* Cualquier otra dirección: página no encontrada */}
                    <Route path="*" element={<NoEncontrada />} />
                </Routes>
            </main>

            <PiePagina />
        </div>
    );
}

export default App;
