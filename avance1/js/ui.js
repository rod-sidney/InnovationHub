export function mostrarCarga(contenedor) {
    contenedor.innerHTML = '<div class="text-center my-5"><div class="spinner-border text-primary" role="status"></div><p>Cargando iniciativas...</p></div>';
}

export function mostrarError(contenedor, mensaje) {
    contenedor.innerHTML = `<div class="alert alert-danger" role="alert">${mensaje}</div>`;
}

export function renderizarCatalogo(iniciativas, contenedor) {
    if (iniciativas.length === 0) {
        contenedor.innerHTML = '<div class="col-12"><div class="alert alert-warning">No se encontraron iniciativas. Intenta ajustar tus filtros de búsqueda.</div></div>';
        return;
    }

    contenedor.innerHTML = iniciativas.map(ini => {
        let claseEstado = "bg-secondary";
        if (ini.estado?.toLowerCase().includes('abiert')) claseEstado = 'estado-abierta';
        else if (ini.estado?.toLowerCase().includes('progres')) claseEstado = 'estado-progreso';
        else if (ini.estado?.toLowerCase().includes('revis')) claseEstado = 'estado-revision';

        const comps = ini.competencias || [];

        return `
        <div class="col-12 col-md-6 col-lg-4">
            <article class="card h-100 shadow-sm border-0 d-flex flex-column">
                <div class="card-body d-flex flex-column">
                    <span class="badge bg-secondary text-dark align-self-start mb-2">${ini.tipo} · ${ini.categoria}</span>
                    <h3 class="card-title h5 fw-bold">${ini.titulo}</h3>
                    <p class="card-text text-muted small">${ini.resumen}</p>
                    <p class="small text-muted mb-3">Publicado por <strong>${ini.propietario}</strong></p>

                    <div class="mt-auto">
                        <h4 class="h6 fw-bold mb-1">Competencias:</h4>
                        <ul class="small text-muted mb-3 list-unstyled">
                            ${comps.map(c => `<li>· ${c}</li>`).join('')}
                        </ul>
                        <div class="d-flex justify-content-between align-items-center border-top pt-3">
                            <span class="${claseEstado}"><span aria-hidden="true">●</span> ${ini.estado || 'Indefinido'}</span>
                        </div>
                    </div>
                </div>
                <div class="card-footer bg-white border-0 pb-3 text-center d-flex gap-2">
                    <a href="detalle-de-iniciativa.html?id=${ini.id}" class="btn btn-outline-primary w-100">Ver iniciativa</a>
                    <a href="modificacion-y-eliminacion.html?id=${ini.id}" class="btn btn-outline-secondary w-100">Editar</a>
                </div>
            </article>
        </div>
        `;
    }).join('');
}

export function renderizarDetalle(iniciativa, contenedor) {
    let claseEstado = "bg-secondary";
    if (iniciativa.estado?.toLowerCase().includes('abiert')) claseEstado = 'estado-abierta';
    else if (iniciativa.estado?.toLowerCase().includes('progres')) claseEstado = 'estado-progreso';
    else if (iniciativa.estado?.toLowerCase().includes('revis')) claseEstado = 'estado-revision';

    const comps = iniciativa.competencias_requeridas || iniciativa.competencias || [];
    const autor = iniciativa.propietario || iniciativa.propietario || 'Anónimo';
    

    contenedor.innerHTML = `
        <h1 class="fw-bold text-dark mb-4">${iniciativa.titulo}</h1>
        <section aria-labelledby="informacion-iniciativa">
            <h2 id="informacion-iniciativa" class="visually-hidden">Detalles de la iniciativa</h2>
            
            <div class="d-flex flex-wrap gap-3 mb-5">
                <div class="meta-box-flex shadow-sm">
                    <div class="meta-title">Tipo</div>
                    <div class="meta-content">${iniciativa.tipo}</div>
                </div>
                <div class="meta-box-flex shadow-sm">
                    <div class="meta-title">Categoría</div>
                    <div class="meta-content">${iniciativa.categoria}</div>
                </div>
                <div class="meta-box-flex shadow-sm">
                    <div class="meta-title">Propietario</div>
                    <div class="meta-content">${iniciativa.autor}</div>
                </div>
                <div class="meta-box-flex shadow-sm">
                    <div class="meta-title">Estado</div>
                    <div class="meta-content">
                        <span class="${claseEstado}"><span aria-hidden="true">●</span> ${iniciativa.estado}</span>
                    </div>
                </div>
            </div>

            <div class="row g-4">
                <div class="col-12 col-lg-8">
                    <section class="card border-0 shadow-sm p-4 h-100">
                        <h2 class="h4 fw-bold text-primary mb-3">Descripción</h2>
                        <p class="text-dark leading-relaxed">${iniciativa.descripcion || iniciativa.resumen}</p>
                    </section>
                </div>
                <div class="col-12 col-lg-4 d-flex flex-column gap-4">
                    <section class="card border-0 shadow-sm p-4">
                        <h2 class="h5 fw-bold text-primary mb-3">Competencias requeridas</h2>
                        <ul class="list-group list-group-flush">
                            ${comps.length > 0 ? comps.map(c => `<li class="list-group-item border-0 px-0 py-1 text-dark bg-transparent">· ${c}</li>`).join('') : '<p class="text-muted small mb-0">No se especificaron competencias.</p>'}
                        </ul>
                    </section>
                </div>
            </div>

            <div class="mt-5 pt-3 text-center text-md-end">
                <a href="modificacion-y-eliminacion.html?id=${iniciativa.id}" class="btn btn-warning btn-lg fw-bold px-4 shadow me-2 mb-2">Editar Iniciativa</a>
                <a href="solicitud-de-participacion.html?id=${iniciativa.id}" class="btn btn-primary btn-lg fw-bold px-4 shadow mb-2">Solicitar unirme a la iniciativa</a>
            </div>
        </section>
    `;
}