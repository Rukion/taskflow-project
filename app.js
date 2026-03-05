// app.js

document.addEventListener("DOMContentLoaded", () => {

  // ================================
  // 1. ESTADO GLOBAL (array de tareas)
  // ================================
  // --- NUEVO ---
  let tasks = [];
  
    // 2. CARGAR LOCALSTORAGE (PUNTO 5) -------------
  const saved = localStorage.getItem("tasks");

  if (saved) {
    try {
      tasks = JSON.parse(saved);

      tasks.forEach((task) => {
        addTaskToList(task);
      });

    } catch (error) {
      console.error("Error al cargar las tareas:", error);
      tasks = [];
    }
  }

  // 2. Referencias al formulario y a sus campos
  const form = document.getElementById("task-form");
  const titleInput = document.getElementById("task-title");
  const tagsInput = document.getElementById("task-tags");
  const prioritySelect = document.getElementById("task-priority");
  const deadlineInput = document.getElementById("task-deadline");

  // 3. Lista UL donde van las tareas
  const taskList = document.getElementById("task-list");

  if (!form || !taskList) {
    console.warn("Falta el formulario o la lista de tareas.");
    return;
  }

  // ================================
  // 4. Función para guardar tareas
  // ================================
  // --- NUEVO ---
  function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }

  // ================================
  // 5. Función para añadir tareas al DOM
  // ================================
  function addTaskToList(task) {

    const { id, title, tags, priority, deadline, completed } = task;

    const li = document.createElement("li");
    li.classList.add("task");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.id = id;
    checkbox.classList.add("task-toggle");
    checkbox.checked = completed;

    const label = document.createElement("label");
    label.classList.add("task-item");
    label.setAttribute("for", id);

    const taskMain = document.createElement("div");
    taskMain.classList.add("task-main");

    const titleRow = document.createElement("div");
    titleRow.classList.add("task-title-row");

    const h3 = document.createElement("h3");
    h3.classList.add("task-title");
    h3.textContent = title;

    const deadlineSpan = document.createElement("span");
    deadlineSpan.classList.add("task-deadline");
    deadlineSpan.textContent = deadline;

    titleRow.appendChild(h3);
    titleRow.appendChild(deadlineSpan);

    const meta = document.createElement("div");
    meta.classList.add("task-meta");

    const tagsContainer = document.createElement("div");
    tagsContainer.classList.add("task-tags");

    const tagsArray = tags || [];
    tagsArray.forEach((t) => {
      const span = document.createElement("span");
      span.classList.add("task-tag");
      span.textContent = t;
      tagsContainer.appendChild(span);
    });

    meta.appendChild(tagsContainer);
    taskMain.appendChild(titleRow);
    taskMain.appendChild(meta);

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
        badge.classList.add("priority-low");
        priorityText = "Baja";
        break;
    }
    badge.textContent = priorityText;

    // ================================
    // 6. Botón de eliminar
    // ================================
    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.textContent = "Eliminar";
    deleteButton.classList.add("task-delete");

    deleteButton.addEventListener("click", (event) => {
      event.stopPropagation();

      // --- NUEVO ---
      // 1. Eliminar del array
      tasks = tasks.filter((t) => t.id !== id);

      // 2. Guardar
      saveTasks();

      // 3. Borrar del DOM
      li.remove();
    });

    label.appendChild(taskMain);
    label.appendChild(badge);
    label.appendChild(deleteButton);

    li.appendChild(checkbox);
    li.appendChild(label);

    taskList.appendChild(li);
  }

  // ================================
  // 7. SUBMIT DEL FORMULARIO
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

    // --- NUEVO ---
    const newTask = {
      id: "task-" + Date.now(),
      title,
      tags: tagsRaw
        ? tagsRaw.split(",").map((t) => t.trim()).filter((t) => t)
        : [],
      priority,
      deadline,
      completed: false,
    };

    // Añadir al array
    tasks.push(newTask);

    // Guardar
    saveTasks();

    // Pintar en el DOM
    addTaskToList(newTask);

    // Limpiar el formulario
    form.reset();
    titleInput.focus();
  });

});
``