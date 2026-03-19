// app.js

document.addEventListener("DOMContentLoaded", () => {
  
  // 0. MODO OSCURO (tema)
    const THEME_KEY = "theme"; // clave en localStorage

  function applyTheme(theme) {
    const root = document.documentElement; // <html>
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }

  function updateThemeToggleText(button, theme) {
    if (!button) return;
    if (theme === "dark") {
      button.textContent = "☀️";
    } else {
      button.textContent = "🌙";
    }
  }

  // Leer preferencia guardada o media query del sistema
  const storedTheme = localStorage.getItem(THEME_KEY);
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const initialTheme = storedTheme || (prefersDark ? "dark" : "light");

  applyTheme(initialTheme);

  const themeToggleButton = document.getElementById("theme-toggle");
  updateThemeToggleText(themeToggleButton, initialTheme);

  if (themeToggleButton) {
    themeToggleButton.addEventListener("click", () => {
      const isDark = document.documentElement.classList.contains("dark");
      const newTheme = isDark ? "light" : "dark";
      applyTheme(newTheme);
      localStorage.setItem(THEME_KEY, newTheme);
      updateThemeToggleText(themeToggleButton, newTheme);
    });
  }

    //  1. ESTADO GLOBAL
    let tasks = [];  
  let activePriorityFilter = ""; // --- estado del filtro de prioridad y de búsqueda ---
  let activeSearchQuery = "";
  
  //  2. REFERENCIAS AL DOM
  const form = document.getElementById("task-form");
  const titleInput = document.getElementById("task-title");
  const tagsInput = document.getElementById("task-tags");
  const prioritySelect = document.getElementById("task-priority");
  const deadlineInput = document.getElementById("task-deadline");
  const taskList = document.getElementById("task-list");
  const searchInput = document.getElementById("search");
  const categoryMenu = document.getElementById("category-menu");
  const priorityMenu = document.getElementById("priority-menu");
  const statsTotal = document.getElementById("stats-total"); // 3 REFERENCIAS PARA ESTADÍSTICAS
  const statsCompleted = document.getElementById("stats-completed");
  const statsPending = document.getElementById("stats-pending");
  const collapsibleHeader = document.querySelector(".collapsible-header"); // "Nueva Tarea" COLAPSABLE
  const collapsibleContent = document.querySelector(".collapsible-content");  
  const completeAllBtn = document.getElementById("complete-all-tasks"); // Acciones masivas
  const clearCompletedBtn = document.getElementById("clear-completed-tasks");

  // REFERENCIAS ARCHIVO
  const openArchiveBtn = document.getElementById("open-archive-btn");
  const closeArchiveBtn = document.getElementById("close-archive-btn");
  const archiveModal = document.getElementById("archive-modal");
  const archiveList = document.getElementById("archive-list");
  const archiveEmptyMsg = document.getElementById("archive-empty-msg");
  const archiveCount = document.getElementById("archive-count");

  if (collapsibleHeader && collapsibleContent) {
    collapsibleHeader.addEventListener("click", () => {
      collapsibleContent.classList.toggle("open");
      
      if (collapsibleContent.classList.contains("open")) { // Cambiamos el icono ▾ / ▸
        collapsibleHeader.textContent = "Nueva tarea ▾";
      } else {
        collapsibleHeader.textContent = "Nueva tarea ▸";
      }
    });
  }

        taskList.addEventListener("click", (event) => { // Delegación de eventos para eliminar tareas (funciona para tareas viejas y nuevas)
          
          const deleteButton = event.target.closest(".task-delete"); // ¿Se ha hecho clic sobre un botón de eliminar?
          if (!deleteButton) {
            return; // si el click no viene de un .task-delete, no hacemos nada
          }

          // Buscamos el <li class="task"> más cercano
          const li = deleteButton.closest(".task");
          if (!li) {
            return;
          }

          const checkbox = li.querySelector(".task-toggle"); // Intentamos averiguar el id de la tarea (del checkbox)
          const taskId = checkbox ? checkbox.id : null;
          
          if (taskId) { // Si tenemos taskId, lo usamos para actualizar el array tasks
            tasks = tasks.filter((t) => t.id !== taskId);
            saveTasks();
          }
          
          li.remove(); // Borramos del DOM
          
          updateCategoryMenu(); // actualizar menú de categorías
          updateStats() // actualizar estadísticas 
        });

  if (!form || !taskList) {
    console.warn("Falta el formulario o la lista de tareas en el HTML.");
    return;
  }  
  
  const STORAGE_KEY = "tasks"; //  3. PERSISTENCIA: LOCALSTORAGE

  function saveTasks() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }

  function loadTasks() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;

    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        tasks = parsed.map(task => ({
          ...task,
          archived: task.archived || false // Asegurar que tengan la propiedad archived
        }));
        renderTasks();
        renderArchive();
      }    

      updateCategoryMenu(); // actualizar el menú de categorías al cargar las tareas
      updateStats();        // actualizar estadísticas al cargar
    
    } catch (error) {
      console.error("Error al leer tareas de localStorage:", error);
      tasks = [];
    }
  }

function updateCategoryMenu() { //  ACTUALIZAR MENÚ DE CATEGORÍAS
  if (!categoryMenu) return;

  // 1) Reunir todas las categorías (tags) en un Set para tener únicas
  const categorySet = new Set();

  tasks.forEach((task) => {
    if (Array.isArray(task.tags)) {
      task.tags.forEach((tag) => {
        const clean = tag.trim();
        if (clean) {
          categorySet.add(clean);
        }
      });
    }
  });

  // 2) Convertir a array y ordenar alfabéticamente
  const categories = Array.from(categorySet).sort((a, b) =>
    a.localeCompare(b, "es", { sensitivity: "base" }) // español españa
  );

  // 3) Limpiar el contenido actual del menú
  categoryMenu.innerHTML = "";

  // 4) Crear un botón/píldora por categoría
  categories.forEach((cat) => {
    const pill = document.createElement("button");
    pill.type = "button";
    pill.classList.add("category-pill");
    pill.textContent = cat;
    categoryMenu.appendChild(pill);
  });
}

  function updateStats() { // ACTUALIZAR ESTADÍSTICAS
    if (!statsTotal || !statsCompleted || !statsPending) return;

    const total = tasks.filter(t => !t.archived).length;
    const completed = tasks.filter((t) => t.completed && !t.archived).length;
    const pending = total - completed;
    const archivedTotal = tasks.filter(t => t.archived).length;

    statsTotal.textContent = total;
    statsCompleted.textContent = completed;
    statsPending.textContent = pending;
    
    if (archiveCount) {
      archiveCount.textContent = archivedTotal;
    }
  } 
        
  function enableTitleButtonEditing(titleButton, taskId) { // HABILITAR EDICIÓN DEL TÍTULO DESDE UN BOTÓN
    titleButton.addEventListener("click", (event) => {
      event.stopPropagation();
      event.preventDefault();
      const currentTitle = titleButton.textContent || "";

      const input = document.createElement("input"); // Crear input temporal
      input.type = "text";
      input.classList.add("task-title-input");
      input.value = currentTitle;
      
      titleButton.replaceWith(input); // Sustituir el botón por el input

      // Auto foco + selección → se ve en azul
      input.focus();
      input.select();

      // Función que termina la edición
      const finishEditing = (saveChanges) => {
        const newTitleRaw = input.value.trim();
        const finalTitle = saveChanges && newTitleRaw ? newTitleRaw : currentTitle;

        // Volver a crear el botón
        const newButton = document.createElement("button");
        newButton.type = "button";
        newButton.classList.add("task-title-button");
        newButton.textContent = finalTitle;

        // Reconectar la edición en el nuevo botón
        enableTitleButtonEditing(newButton, taskId);

        // Sustituir input por botón
        input.replaceWith(newButton);

        // Guardar cambios si aplica
        if (saveChanges && newTitleRaw) {
          const taskIndex = tasks.findIndex((t) => t.id === taskId);
          if (taskIndex !== -1) {
            tasks[taskIndex].title = finalTitle;
            saveTasks();
          }
        }
      };

      // Enter → guardar
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          finishEditing(true);
        } else if (e.key === "Escape") {
          // Esc → cancelar
          e.preventDefault();
          finishEditing(false);
        }
      });

      // blur → guardar (comportamiento típico)
      input.addEventListener("blur", () => {
        finishEditing(true);
      });
    });
  }

  function addTaskToList(task, isArchive = false) { //  4. PINTAR TAREA EN EL DOM
    const { id, title, tags, priority, deadline, completed } = task;

    const li = document.createElement("li");
    li.classList.add("task");
    if (isArchive) li.classList.add("archived-task-item");
    
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.id = id;
    checkbox.classList.add("task-toggle");
    checkbox.checked = completed;
    if (isArchive) checkbox.disabled = true; // No se puede cambiar en el archivo directamente

    const label = document.createElement("label");
    label.classList.add("task-item");
    label.setAttribute("for", id);
    
    const taskMain = document.createElement("div"); // parte izquierda: título + deadline + tags
    taskMain.classList.add("task-main");

    const titleRow = document.createElement("div");
    titleRow.classList.add("task-title-row");    
    
    const titleButton = document.createElement("button"); // Botón de título (en lugar de <h3>)
    titleButton.type = "button";
    titleButton.classList.add("task-title-button");
    titleButton.textContent = title;    
    if (!isArchive) {
      enableTitleButtonEditing(titleButton, id);
    }
    titleRow.appendChild(titleButton);

    const deadlineSpan = document.createElement("span");
    deadlineSpan.classList.add("task-deadline");
    deadlineSpan.textContent = deadline || "";

    titleRow.appendChild(titleButton);
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
        
    const taskSide = document.createElement("div"); // parte derecha: task-side (badge + eliminar)
    taskSide.classList.add("task-side");

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

    const actionButton = document.createElement("button");
    actionButton.type = "button";
    if (isArchive) {
      actionButton.textContent = "Recuperar";
      actionButton.classList.add("task-recover", "text-xs", "px-2", "py-1", "bg-sky-100", "text-sky-700", "rounded", "hover:bg-sky-200");
      actionButton.addEventListener("click", () => {
        unarchiveTask(id);
      });
    } else {
      actionButton.textContent = "Eliminar";
      actionButton.classList.add("task-delete");
    }

    taskSide.appendChild(badge);
    taskSide.appendChild(actionButton);
    
    if (!isArchive) {
      checkbox.addEventListener("change", () => { // evento para completar tarea
        const taskIndex = tasks.findIndex((t) => t.id === id);
        if (taskIndex !== -1) {
          tasks[taskIndex].completed = checkbox.checked;
          saveTasks();
          updateStats(); // si ya tienes esta función
        }
      });
    }

    // montar toda la tarjeta
    label.appendChild(taskMain);
    label.appendChild(taskSide);
    li.appendChild(checkbox);
    li.appendChild(label);
    
    if (isArchive) {
      archiveList.appendChild(li);
    } else {
      taskList.appendChild(li);
    }
  }

  function unarchiveTask(id) {
    const taskIndex = tasks.findIndex((t) => t.id === id);
    if (taskIndex !== -1) {
      tasks[taskIndex].archived = false;
      saveTasks();
      renderTasks();
      renderArchive();
      updateStats();
      updateCategoryMenu();
    }
  }

  function archiveTask(id) {
    const taskIndex = tasks.findIndex((t) => t.id === id);
    if (taskIndex !== -1) {
      tasks[taskIndex].archived = true;
      saveTasks();
      renderTasks();
      renderArchive();
      updateStats();
      updateCategoryMenu();
    }
  }

  function renderTasks() {
    taskList.innerHTML = "";
    tasks
      .filter((t) => !t.archived)
      .forEach((t) => addTaskToList(t, false));
    applyFilter();
  }

  function renderArchive() {
    archiveList.innerHTML = "";
    const archived = tasks.filter((t) => t.archived);
    
    if (archived.length === 0) {
      archiveEmptyMsg.classList.remove("hidden");
    } else {
      archiveEmptyMsg.classList.add("hidden");
      archived.forEach((t) => addTaskToList(t, true));
    }
    
    archiveCount.textContent = archived.length;
  }

  //  LISTENER PARA FILTRO DE BÚSQUEDA Y PRIORIDAD
  if (searchInput) {
    searchInput.addEventListener("input", (event) => {
      activeSearchQuery = event.target.value.trim();
      applyFilter(); // ahora usamos estado global
    });
  }
  if (priorityMenu) {
    priorityMenu.addEventListener("click", (event) => {
      const button = event.target.closest(".priority-filter");
      if (!button) return;

      // 1) Actualizar el estado del filtro de prioridad
      activePriorityFilter = button.dataset.priority || "";

      // 2) Marcar visualmente el botón activo
      const allButtons = priorityMenu.querySelectorAll(".priority-filter");
      allButtons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");

      // 3) Aplicar filtros combinados (texto + prioridad)
      applyFilter();
    });
  }
  
  // ACCIONES MASIVAS
  if (completeAllBtn) {
    completeAllBtn.addEventListener("click", () => {
      // 1) Actualizar todos los objetos en memoria
      tasks = tasks.map((task) => ({
        ...task,
        completed: true,
      }));

      // 2) Guardar en localStorage
      saveTasks();

      // 3) Actualizar todos los checkboxes del DOM
      const allCheckboxes = taskList.querySelectorAll(".task-toggle");
      allCheckboxes.forEach((checkbox) => {
        checkbox.checked = true;
      });

      // 4) Actualizar estadísticas
      if (typeof updateStats === "function") {
        updateStats();
      }
    });
  }
  
  if (clearCompletedBtn) {
    clearCompletedBtn.addEventListener("click", () => {
      const completedCount = tasks.filter(t => t.completed && !t.archived).length;
      if (completedCount === 0) {
        alert("No hay tareas completadas para archivar.");
        return;
      }

      const confirmed = window.confirm(
        `¿Seguro que quieres enviar ${completedCount} tareas completadas al archivo?`
      );
      if (!confirmed) return;

      // Marcar como archivadas todas las que estén completadas y no estén ya archivadas
      tasks = tasks.map(task => {
        if (task.completed && !task.archived) {
          return { ...task, archived: true };
        }
        return task;
      });

      saveTasks();
      renderTasks();
      renderArchive();
      updateCategoryMenu();
      updateStats();
    });
  }

  // LISTENERS MODAL ARCHIVO
  if (openArchiveBtn && archiveModal) {
    openArchiveBtn.addEventListener("click", () => {
      archiveModal.classList.remove("hidden");
      renderArchive();
    });
  }

  if (closeArchiveBtn && archiveModal) {
    closeArchiveBtn.addEventListener("click", () => {
      archiveModal.classList.add("hidden");
    });
  }

  // Cerrar modal al hacer click fuera
  window.addEventListener("click", (event) => {
    if (event.target === archiveModal) {
      archiveModal.classList.add("hidden");
    }
  });


  // AÑADIR TAREA DESDE FORM 
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
      archived: false,
    };
       
    // 1) añadir al array
    tasks.push(newTask);
    // 2) guardar en localStorage
    saveTasks();
    // 3) pintar en el DOM
    renderTasks();
    // 4) actualizar menú de categorías
    updateCategoryMenu();
    // 5) actualizar estadísticas
    updateStats();
    // 6) limpiar formulario
    form.reset();
    titleInput.focus();
  });

  function applyFilter() { //  6. FILTRO DE BÚSQUEDA Y PRIORIDAD
    const normalizedQuery = activeSearchQuery.toLowerCase();
    const allTasks = taskList.querySelectorAll(".task");

    allTasks.forEach((li) => {
      const text = li.innerText.toLowerCase();

      // 1) Coincidencia por texto
      const matchesText = text.includes(normalizedQuery);

      // 2) Coincidencia por prioridad
      let matchesPriority = true; // por defecto, si no hay filtro, pasa

      if (activePriorityFilter) {
        const badge = li.querySelector(".task-badge");
        if (!badge) {
          matchesPriority = false;
        } else {
          const classList = badge.classList;
          if (activePriorityFilter === "high") {
            matchesPriority = classList.contains("priority-high");
          } else if (activePriorityFilter === "medium") {
            matchesPriority = classList.contains("priority-medium");
          } else if (activePriorityFilter === "low") {
            matchesPriority = classList.contains("priority-low");
          }
        }
      }

    // 3) Mostrar solo si cumple ambos filtros
    if (matchesText && matchesPriority) {
      li.style.display = "";
    } else {
      li.style.display = "none";
    }
  });
}


  // ================================
  //  7. CARGA INICIAL DESDE LOCALSTORAGE
  // ================================
  loadTasks();
});