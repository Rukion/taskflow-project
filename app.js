// app.js

document.addEventListener("DOMContentLoaded", () => {
  // 1. Referencias al formulario y a sus campos
  const form = document.getElementById("task-form");
  const titleInput = document.getElementById("task-title");
  const tagsInput = document.getElementById("task-tags");
  const prioritySelect = document.getElementById("task-priority");
  const deadlineInput = document.getElementById("task-deadline");

  // 2. Referencia a la lista de tareas donde añadiremos las nuevas
  const taskList = document.getElementById("task-list");

  if (!form || !taskList) {
    console.warn("Falta el formulario o la lista de tareas en el HTML.");
    return;
  }

  // 3. Función para crear y añadir una tarea al DOM
  function addTaskToList({ title, tags, priority, deadline }) {
    // crear <li class="task">
    const li = document.createElement("li");
    li.classList.add("task");

    // generar un id único para el checkbox
    const taskId = "task-" + Date.now();

    // crear <input type="checkbox" class="task-toggle" id="...">
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.id = taskId;
    checkbox.classList.add("task-toggle");

    // crear <label for="..." class="task-item">
    const label = document.createElement("label");
    label.classList.add("task-item");
    label.setAttribute("for", taskId);

    // ----- bloque principal: título + cuenta atrás -----
    const taskMain = document.createElement("div");
    taskMain.classList.add("task-main");

    const titleRow = document.createElement("div");
    titleRow.classList.add("task-title-row");

    const h3 = document.createElement("h3");
    h3.classList.add("task-title");
    h3.textContent = title;

    const deadlineSpan = document.createElement("span");
    deadlineSpan.classList.add("task-deadline");
    deadlineSpan.textContent = deadline || ""; // si no pones nada, queda vacío

    titleRow.appendChild(h3);
    titleRow.appendChild(deadlineSpan);

    // ----- categorías como globos -----
    const meta = document.createElement("div");
    meta.classList.add("task-meta");

    const tagsContainer = document.createElement("div");
    tagsContainer.classList.add("task-tags");

    // convertir "DAM, estudio, prácticas" en ["DAM","estudio","prácticas"]
    const tagsArray =
      tags
        ?.split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0) || [];

    tagsArray.forEach((tagText) => {
      const tagSpan = document.createElement("span");
      tagSpan.classList.add("task-tag");
      tagSpan.textContent = tagText;
      tagsContainer.appendChild(tagSpan);
    });

    meta.appendChild(tagsContainer);

    taskMain.appendChild(titleRow);
    taskMain.appendChild(meta);

    // ----- badge de prioridad -----
    const badge = document.createElement("span");
    badge.classList.add("task-badge");

    // prioridad determina la clase y el texto
    let priorityText = "";
    switch (priority) {
      case "high":
        badge.classList.add("priority-high");
        priorityText = "Alta";
        break;
      case "medium":
        badge.classList.add("priority-medium");
        priorityText = "Media";
        break;
      case "low":
      default:
        badge.classList.add("priority-low");
        priorityText = "Baja";
        break;
    }
    badge.textContent = priorityText;

    
    // ----- botón de eliminar -----
    const deleteButton = document.createElement("button");
    deleteButton.type = "button"; // para que no actúe como submit en el formulario
    deleteButton.textContent = "Eliminar";
    deleteButton.classList.add("task-delete");

    // Al hacer clic, eliminamos el <li> del DOM
    deleteButton.addEventListener("click", (event) => {
        // Evitamos que el click en el botón se considere click en el label
        event.stopPropagation();
        li.remove();
    });


    // montar la estructura del label
    label.appendChild(taskMain);
    label.appendChild(badge);
    label.appendChild(deleteButton); // añadimos el botón dentro de la tarea

    // añadir checkbox y label al <li>
    li.appendChild(checkbox);
    li.appendChild(label);

    // por último, añadir el <li> a la lista
    taskList.appendChild(li);
  }

  // 4. Manejar el envío del formulario
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const title = titleInput.value.trim();
    const tags = tagsInput.value.trim();
    const priority = prioritySelect.value;
    const deadline = deadlineInput.value.trim();

    if (!title) {
      alert("Por favor, introduce un título para la tarea.");
      return;
    }

    // Llamamos a la función que añade la tarea a la lista
    addTaskToList({
      title,
      tags,
      priority,
      deadline,
    });

    // Limpiar el formulario (punto clave del enunciado)
    form.reset();

    // Opcional: volver a enfocar el input del título
    titleInput.focus();
  });
});