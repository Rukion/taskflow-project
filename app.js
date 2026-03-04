// app.js

// Esperamos a que el DOM esté listo
document.addEventListener("DOMContentLoaded", () => {
  // 1. Referencias a los elementos del formulario
  const form = document.getElementById("task-form");
  const titleInput = document.getElementById("task-title");
  const tagsInput = document.getElementById("task-tags");
  const prioritySelect = document.getElementById("task-priority");
  const deadlineInput = document.getElementById("task-deadline");

  // 2. Comprobamos que el formulario existe por si acaso
  if (!form) {
    console.warn("No se encontró el formulario con id 'task-form'.");
    return;
  }

  // 3. Enganchamos el evento submit del formulario
  form.addEventListener("submit", (event) => {
    // Evita que la página se recargue
    event.preventDefault();

    // Obtenemos los valores de los campos
    const title = titleInput.value.trim();
    const tags = tagsInput.value.trim();
    const priority = prioritySelect.value;
    const deadline = deadlineInput.value.trim();

    // Validación básica
    if (!title) {
      alert("Por favor, introduce un título para la tarea.");
      return;
    }

    // De momento, solo mostramos por consola (prueba de que funciona)
    console.log("Nueva tarea:");
    console.log("Título:", title);
    console.log("Categorías:", tags);
    console.log("Prioridad:", priority);
    console.log("Tiempo restante:", deadline);

    // Más adelante:
    // - Aquí crearemos el objeto tarea
    // - Lo guardaremos en localStorage
    // - Lo pintaremos en la lista de tareas

    // Reseteamos el formulario para dejarlo limpio
    form.reset();
  });
});
