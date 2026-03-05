// app.js

document.addEventListener("DOMContentLoaded", () => {
  // ================================
  //  1. ESTADO GLOBAL
  // ================================
  let tasks = [];

  // ================================
  //  2. REFERENCIAS AL DOM
  // ================================
  const form = document.getElementById("task-form");
  const titleInput = document.getElementById("task-title");
  const tagsInput = document.getElementById("task-tags");
  const prioritySelect = document.getElementById("task-priority");
  const deadlineInput = document.getElementById("task-deadline");

  const taskList = document.getElementById("task-list");
  const searchInput = document.getElementById("search");
  
        // Delegación de eventos para eliminar tareas (funciona para tareas viejas y nuevas)
        taskList.addEventListener("click", (event) => {
          // ¿Se ha hecho clic sobre un botón de eliminar o dentro de él?
          const deleteButton = event.target.closest(".task-delete");
          if (!deleteButton) {
            return; // si el click no viene de un .task-delete, no hacemos nada
          }

          // Buscamos el <li class="task"> más cercano
          const li = deleteButton.closest(".task");
          if (!li) {
            return;
          }

          // Intentamos averiguar el id de la tarea (del checkbox)
          const checkbox = li.querySelector(".task-toggle");
          const taskId = checkbox ? checkbox.id : null;

          // Si tenemos taskId, lo usamos para actualizar el array tasks
          if (taskId) {
            tasks = tasks.filter((t) => t.id !== taskId);
            saveTasks();
          }

          // Borramos del DOM
          li.remove();
        });


  if (!form || !taskList) {
    console.warn("Falta el formulario o la lista de tareas en el HTML.");
    return;
  }

  // ================================
  //  3. PERSISTENCIA: LOCALSTORAGE
  // ================================
  const STORAGE_KEY = "tasks";

  function saveTasks() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }

  function loadTasks() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;

    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        tasks = parsed;
        tasks.forEach((task) => addTaskToList(task));
      }
    } catch (error) {
      console.error("Error al leer tareas de localStorage:", error);
      tasks = [];
    }
  }

  // ================================
  //  4. PINTAR TAREA EN EL DOM
  // ================================
  function addTaskToList(task) {
    const { id, title, tags, priority, deadline, completed } = task;

    // <li class="task">
    const li = document.createElement("li");
    li.classList.add("task");

    // <input type="checkbox" ...>
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.id = id;
    checkbox.classList.add("task-toggle");
    checkbox.checked = completed;

    // <label for="id" class="task-item">
    const label = document.createElement("label");
    label.classList.add("task-item");
    label.setAttribute("for", id);

    // ----- parte izquierda: título + deadline + tags -----
    const taskMain = document.createElement("div");
    taskMain.classList.add("task-main");

    const titleRow = document.createElement("div");
    titleRow.classList.add("task-title-row");

    const h3 = document.createElement("h3");
    h3.classList.add("task-title");
    h3.textContent = title;

    const deadlineSpan = document.createElement("span");
    deadlineSpan.classList.add("task-deadline");
    deadlineSpan.textContent = deadline || "";

    titleRow.appendChild(h3);
    titleRow.appendChild(deadlineSpan);

    const meta = document.createElement("div");
    meta.classList.add("task-meta");

    const tagsContainer = document.createElement("div");
    tagsContainer.classList.add("task-tags");

    const tagsArray = Array.isArray(tags) ? tags : [];
    tagsArray.forEach((t) => {
      const span = document.createElement("span");
      span.classList.add("task-tag");
      span.textContent = t;
      tagsContainer.appendChild(span);
    });

    meta.appendChild(tagsContainer);

    taskMain.appendChild(titleRow);
    taskMain.appendChild(meta);

    // ----- badge de prioridad -----
    const badge = document.createElement("span");
    badge.classList.add("task-badge");

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
    deleteButton.type = "button";
    deleteButton.textContent = "Eliminar";
    deleteButton.classList.add("task-delete");

    // ----- marcar completada -----
    checkbox.addEventListener("change", () => {
      const taskIndex = tasks.findIndex((t) => t.id === id);
      if (taskIndex !== -1) {
        tasks[taskIndex].completed = checkbox.checked;
        saveTasks();
      }
    });

    // montar la tarjeta
    label.appendChild(taskMain);
    label.appendChild(badge);
    label.appendChild(deleteButton);

    li.appendChild(checkbox);
    li.appendChild(label);

    taskList.appendChild(li);
  }

  // ================================
  //  5. AÑADIR TAREA DESDE FORM
  // ================================
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const title = titleInput.value.trim();
    const tagsRaw = tagsInput.value.trim();
    const priority = prioritySelect.value;
    const deadline = deadlineInput.value.trim();

    if (!title) {
      alert("Por favor, introduce un título para la tarea.");
      return;
    }

    const newTask = {
      id: "task-" + Date.now(),
      title,
      tags: tagsRaw
        ? tagsRaw
            .split(",")
            .map((t) => t.trim())
            .filter((t) => t.length > 0)
        : [],
      priority,
      deadline,
      completed: false,
    };

    // 1) añadir al array
    tasks.push(newTask);

    // 2) guardar en localStorage
    saveTasks();

    // 3) pintar en el DOM
    addTaskToList(newTask);

    // 4) limpiar formulario
    form.reset();
    titleInput.focus();
  });

  // ================================
  //  6. FILTRO DE BÚSQUEDA (BONUS)
  // ================================
  function applyFilter(query) {
    const normalizedQuery = query.toLowerCase();

    const allTasks = taskList.querySelectorAll(".task");
    allTasks.forEach((li) => {
      // texto de la tarjeta: título, tags, deadline, etc.
      const text = li.innerText.toLowerCase();

      if (text.includes(normalizedQuery)) {
        li.style.display = ""; // visible
      } else {
        li.style.display = "none"; // oculto
      }
    });
  }

  if (searchInput) {
    searchInput.addEventListener("input", (event) => {
      const query = event.target.value.trim();
      applyFilter(query);
    });
  }

  // ================================
  //  7. CARGA INICIAL DESDE LOCALSTORAGE
  // ================================
  loadTasks();
});