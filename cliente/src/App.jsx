// App.jsx
// Componente raíz del cliente

import { Routes, Route } from 'react-router';

import { useSesion } from './contexto/SesionContexto.jsx';
import Encabezado from './componentes/layout/Encabezado.jsx';
import PiePagina from './componentes/layout/PiePagina.jsx';
import Cargando from './componentes/comunes/Cargando.jsx';
import RutaProtegida from './componentes/comunes/RutaProtegida.jsx';
import Inicio from './paginas/Inicio.jsx';
import Catalogo from './paginas/Catalogo.jsx';
import DetalleIniciativa from './paginas/DetalleIniciativa.jsx';
import NuevaIniciativa from './paginas/NuevaIniciativa.jsx';
import EditarIniciativa from './paginas/EditarIniciativa.jsx';
import IniciarSesion from './paginas/IniciarSesion.jsx';
import Registro from './paginas/Registro.jsx';
import NoEncontrada from './paginas/NoEncontrada.jsx';

function App() {
    const { comprobando } = useSesion();

    return (
        <div className="d-flex flex-column min-vh-100 bg-light">
            <Encabezado />

            <main className="flex-grow-1">
                {/* Mientras se comprueba el token guardado no se dibujan las páginas: así cada
                    página pide sus datos una sola vez y ya con la sesión correcta */}
                {comprobando ? (
                    <Cargando texto="Comprobando la sesión..." />
                ) : (
                    <Routes>
                        <Route path="/" element={<Inicio />} />
                        <Route path="/iniciativas" element={<Catalogo />} />
                        {/* :id es un parámetro: el detalle se arma con el valor que venga en la dirección */}
                        <Route path="/iniciativas/:id" element={<DetalleIniciativa />} />

                        {/* Páginas que requieren sesión: RutaProtegida lleva al inicio de sesión */}
                        <Route path="/iniciativas/nueva" element={<RutaProtegida><NuevaIniciativa /></RutaProtegida>} />
                        <Route path="/iniciativas/:id/editar" element={<RutaProtegida><EditarIniciativa /></RutaProtegida>} />

                        <Route path="/iniciar-sesion" element={<IniciarSesion />} />
                        <Route path="/registro" element={<Registro />} />

                        {/* Cualquier otra dirección: página no encontrada */}
                        <Route path="*" element={<NoEncontrada />} />
                    </Routes>
                )}
            </main>

            <PiePagina />
        </div>
    );
}

export default App;
