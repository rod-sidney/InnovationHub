export function inicializarFormulario() {
    const form = document.getElementById('form-registro');
    const btnAgregar = document.getElementById('btn-agregar-competencia');
    const contenedorCompetencias = document.getElementById('contenedor-competencias');

    if (!form) return;

    if (btnAgregar && contenedorCompetencias) {
        btnAgregar.addEventListener('click', () => {
            const div = document.createElement('div');
            div.className = 'input-group mb-2 competencia-item';
            div.innerHTML = `
                <input type="text" class="form-control" placeholder="Ej. Programación Frontend" required>
                <button type="button" class="btn btn-danger btn-quitar">X</button>
            `;
            contenedorCompetencias.appendChild(div);
        });

        contenedorCompetencias.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-quitar')) {
                e.target.closest('.competencia-item').remove();
            }
        });
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const titulo = document.getElementById('titulo').value;

        if (titulo.length < 5) {
            alert("Error: El título debe tener al menos 5 caracteres.");
            return;
        }

        alert("¡Éxito! Iniciativa guardada correctamente en memoria local.");
        form.reset();
    });
}