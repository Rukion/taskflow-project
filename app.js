// app.js — Lógica principal de Advenica Taskflow


document.addEventListener("DOMContentLoaded", () => {

  // ============================================================
  //  0. MODO OSCURO / LUZ
  //     - Lee la preferencia guardada o la del sistema operativo.
  //     - Aplica/quita la clase "dark" en <html>.
  //     - El toggle es ahora un óvalo visual (cambio 4);
  //       no necesita texto, el CSS gestiona la apariencia.
  // ============================================================

  const THEME_KEY = "theme"; // clave en localStorage

  /**
   * Aplica el tema elegido añadiendo o quitando la clase "dark" en <html>.
   * @param {string} theme - "dark" | "light"
   */
  function applyTheme(theme) {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }

  // Determinar el tema inicial: localStorage → preferencia del sistema → light
  const storedTheme   = localStorage.getItem(THEME_KEY);
  const prefersDark   = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const initialTheme  = storedTheme || (prefersDark ? "dark" : "light");

  applyTheme(initialTheme);

  // Listener del toggle de tema (el CSS gestiona la posición del círculo)
  const themeToggleButton = document.getElementById("theme-toggle");
  if (themeToggleButton) {
    themeToggleButton.addEventListener("click", () => {
      const isDark   = document.documentElement.classList.contains("dark");
      const newTheme = isDark ? "light" : "dark";
      applyTheme(newTheme);
      localStorage.setItem(THEME_KEY, newTheme);
    });
  }


  // ============================================================
  //  1. ESTADO GLOBAL
  // ============================================================

  /** @type {Array<Object>} Lista completa de tareas (activas + archivadas). */
  let tasks = [];

  /** @type {string} Filtro de prioridad activo: "" | "high" | "medium" | "low" */
  let activePriorityFilter = "";

  /** @type {string} Texto de búsqueda activo. */
  let activeSearchQuery = "";


  // ============================================================
  //  2. REFERENCIAS AL DOM
  // ============================================================

  // Formulario de nueva tarea
  const form          = document.getElementById("task-form");
  const titleInput    = document.getElementById("task-title");
  const tagsInput     = document.getElementById("task-tags");
  const prioritySelect = document.getElementById("task-priority");
  const deadlineInput = document.getElementById("task-deadline");

  // Lista de tareas activas
  const taskList = document.getElementById("task-list");

  // Tarjeta de nueva tarea (cambio 1) + su panel colapsable
  const newTaskCard       = document.getElementById("new-task-card");
  const newTaskFormPanel  = document.getElementById("new-task-form-panel");
  const newTaskExpandIcon = document.getElementById("new-task-expand-icon");

  // Barra lateral
  const searchInput   = document.getElementById("search");
  const categoryMenu  = document.getElementById("category-menu");
  const priorityMenu  = document.getElementById("priority-menu");

  // Estadísticas
  const statsTotal     = document.getElementById("stats-total");
  const statsCompleted = document.getElementById("stats-completed");
  const statsPending   = document.getElementById("stats-pending");

  // Acciones masivas
  const completeAllBtn    = document.getElementById("complete-all-tasks");
  const clearCompletedBtn = document.getElementById("clear-completed-tasks");

  // Modal de archivo
  const openArchiveBtn        = document.getElementById("open-archive-btn");
  const closeArchiveBtn       = document.getElementById("close-archive-btn");
  const archiveModal          = document.getElementById("archive-modal");
  const archiveList           = document.getElementById("archive-list");
  const archiveEmptyMsg       = document.getElementById("archive-empty-msg");
  const archiveCount          = document.getElementById("archive-count");         // cabecera
  const archiveModalCount     = document.getElementById("archive-modal-count");  // pie del modal

  // Controles masivos dentro del archivo (cambio 6)
  const archiveControls           = document.getElementById("archive-controls");
  const archiveSelectAll          = document.getElementById("archive-select-all");
  const archiveDeleteSelectedBtn  = document.getElementById("archive-delete-selected-btn");

  // Guardia: sin formulario ni lista no podemos funcionar
  if (!form || !taskList) {
    console.warn("Falta el formulario o la lista de tareas en el HTML.");
    return;
  }


  // ============================================================
  //  3. TARJETA "NUEVA TAREA" COLAPSABLE (cambio 1)
  //     La tarjeta placeholder siempre queda al final de la lista.
  //     Al hacer clic (o pulsar Enter/Espacio) despliega el formulario.
  // ============================================================

  if (newTaskCard && newTaskFormPanel) {

    /**
     * Abre o cierra el formulario de nueva tarea.
     */
    const toggleNewTaskPanel = () => {
      const isOpen = newTaskFormPanel.classList.contains("open");

      newTaskFormPanel.classList.toggle("open");
      newTaskCard.setAttribute("aria-expanded", String(!isOpen));

      // Rota el icono "+" 45° cuando está abierto (queda como "×")
      if (newTaskExpandIcon) {
        newTaskExpandIcon.style.transform = isOpen ? "" : "rotate(45deg)";
      }

      // Si se abre, foco automático en el campo título
      if (!isOpen) {
        setTimeout(() => titleInput && titleInput.focus(), 300);
      }
    };

    newTaskCard.addEventListener("click", toggleNewTaskPanel);

    // Accesibilidad: activar con teclado
    newTaskCard.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggleNewTaskPanel();
      }
    });
  }


  // ============================================================
  //  4. PERSISTENCIA: LOCALSTORAGE
  // ============================================================

  const STORAGE_KEY = "tasks";

  /** Serializa el array `tasks` en localStorage. */
  function saveTasks() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }

  /**
   * Lee las tareas guardadas, las parsea y renderiza.
   * Si el JSON está corrupto, inicializa tasks como array vacío.
   */
  function loadTasks() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;

    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        // Retrocompatibilidad: asegurar que todas las tareas tengan `archived`
        tasks = parsed.map(task => ({
          ...task,
          archived: task.archived || false,
        }));
        renderTasks();
        renderArchive();
      }
      updateCategoryMenu();
      updateStats();
    } catch (error) {
      console.error("Error al leer tareas de localStorage:", error);
      tasks = [];
    }
  }


  // ============================================================
  //  5. MENÚ DE CATEGORÍAS (sidebar)
  // ============================================================

  /**
   * Reconstruye las píldoras de categoría en la barra lateral
   * a partir de los tags de todas las tareas no archivadas.
   */
  function updateCategoryMenu() {
    if (!categoryMenu) return;

    // Reunir tags únicos, ordenados alfabéticamente
    const categorySet = new Set();
    tasks.forEach((task) => {
      if (Array.isArray(task.tags)) {
        task.tags.forEach((tag) => {
          const clean = tag.trim();
          if (clean) categorySet.add(clean);
        });
      }
    });

    const categories = Array.from(categorySet).sort((a, b) =>
      a.localeCompare(b, "es", { sensitivity: "base" })
    );

    categoryMenu.innerHTML = "";
    categories.forEach((cat) => {
      const pill = document.createElement("button");
      pill.type = "button";
      pill.className = [
        "px-4 py-1.5 bg-advenica-accent/5 text-[0.55rem] font-black",
        "text-advenica-accent rounded-sm border border-advenica-accent/10",
        "hover:bg-advenica-accent hover:text-white transition-all",
        "uppercase tracking-[0.2em] shadow-sm",
      ].join(" ");
      pill.textContent = cat;
      categoryMenu.appendChild(pill);
    });
  }


  // ============================================================
  //  6. ESTADÍSTICAS
  // ============================================================

  /**
   * Actualiza los contadores de la barra lateral y el badge del archivo.
   */
  function updateStats() {
    if (!statsTotal || !statsCompleted || !statsPending) return;

    const activeTasks   = tasks.filter(t => !t.archived);
    const total         = activeTasks.length;
    const completed     = activeTasks.filter(t => t.completed).length;
    const pending       = total - completed;
    const archivedTotal = tasks.filter(t => t.archived).length;

    statsTotal.textContent     = total;
    statsCompleted.textContent = completed;
    statsPending.textContent   = pending;

    // Badge de archivo en cabecera + contador del modal
    if (archiveCount)      archiveCount.textContent      = archivedTotal;
    if (archiveModalCount) archiveModalCount.textContent = archivedTotal;
  }


  // ============================================================
  //  7. EDICIÓN INLINE DEL TÍTULO
  // ============================================================

  /**
   * Habilita la edición inline del título de una tarea al hacer clic.
   * Reemplaza el botón por un input temporal; al confirmar (Enter / blur)
   * restaura el botón y persiste el cambio.
   *
   * @param {HTMLButtonElement} titleButton - Botón que muestra el título.
   * @param {string}            taskId      - ID de la tarea en el array.
   */
  function enableTitleButtonEditing(titleButton, taskId) {
    titleButton.addEventListener("click", (event) => {
      event.stopPropagation();
      event.preventDefault();

      const currentTitle = titleButton.textContent || "";

      // Crear input temporal con el valor actual
      const input = document.createElement("input");
      input.type = "text";
      input.classList.add("task-title-input");
      input.value = currentTitle;

      titleButton.replaceWith(input);
      input.focus();
      input.select();

      /**
       * Finaliza la edición: guarda o descarta según `saveChanges`.
       * @param {boolean} saveChanges - true para guardar, false para cancelar.
       */
      const finishEditing = (saveChanges) => {
        const newTitleRaw = input.value.trim();
        const finalTitle  = saveChanges && newTitleRaw ? newTitleRaw : currentTitle;

        // Recrear el botón con el título final
        const newButton = document.createElement("button");
        newButton.type = "button";
        newButton.classList.add("task-title-button");
        newButton.textContent = finalTitle;
        enableTitleButtonEditing(newButton, taskId); // reactivar edición
        input.replaceWith(newButton);

        // Persistir si hubo cambio real
        if (saveChanges && newTitleRaw) {
          const idx = tasks.findIndex(t => t.id === taskId);
          if (idx !== -1) {
            tasks[idx].title = finalTitle;
            saveTasks();
          }
        }
      };

      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter")  { e.preventDefault(); finishEditing(true);  }
        if (e.key === "Escape") { e.preventDefault(); finishEditing(false); }
      });
      input.addEventListener("blur", () => finishEditing(true));
    });
  }


  // ============================================================
  //  8. RENDERIZADO DE UNA TAREA EN EL DOM
  //     Cambio 6: el botón de acción en la lista activa es ARCHIVAR
  //              (no eliminar). En el archivo hay RESTAURAR + ELIMINAR.
  // ============================================================

  /**
   * Crea y añade un elemento <li> al DOM para representar una tarea.
   *
   * @param {Object}  task       - Objeto tarea con id, title, tags, priority, deadline, completed.
   * @param {boolean} isArchive  - true si se está pintando dentro del modal de archivo.
   */
  function addTaskToList(task, isArchive = false) {
    const { id, title, tags, priority, deadline, completed } = task;

    // — Contenedor principal de la tarea —
    const li = document.createElement("li");
    li.className = [
      "task group relative p-6 bg-advenica-navy/30 backdrop-blur-md",
      "border border-advenica-accent/5 rounded-sm shadow-xl",
      "hover:bg-advenica-accent/5 hover:border-advenica-accent/30",
      "transition-all flex items-center gap-6",
    ].join(" ");
    if (isArchive) li.classList.add("opacity-60");

    // — Checkbox de estado completado —
    const checkbox = document.createElement("input");
    checkbox.type      = "checkbox";
    checkbox.id        = id;
    checkbox.className = [
      "task-toggle w-6 h-6 rounded-sm border-2 border-advenica-accent/20",
      "bg-black/40 text-advenica-accent focus:ring-advenica-accent",
      "cursor-pointer transition-all flex-shrink-0",
    ].join(" ");
    checkbox.checked  = completed;
    checkbox.disabled = isArchive; // no se puede marcar desde el archivo

    // — Contenido textual (título + tags) —
    const taskContent = document.createElement("div");
    taskContent.className = "flex-1 min-w-0";

    const titleRow = document.createElement("div");
    titleRow.className = "flex items-center gap-4 mb-3";

    const titleButton = document.createElement("button");
    titleButton.type      = "button";
    titleButton.className = [
      "task-title-button text-lg font-black text-white truncate",
      "hover:text-advenica-accent transition-colors text-left",
      "uppercase tracking-tight",
    ].join(" ");
    if (completed) titleButton.classList.add("line-through", "opacity-30");
    titleButton.textContent = title;
    if (!isArchive) enableTitleButtonEditing(titleButton, id);

    const deadlineSpan = document.createElement("span");
    deadlineSpan.className = "task-deadline text-[0.6rem] font-bold text-advenica-accent/60 uppercase tracking-widest flex-shrink-0";
    deadlineSpan.textContent = deadline ? `[ ${deadline} ]` : "";

    titleRow.appendChild(titleButton);
    titleRow.appendChild(deadlineSpan);

    const meta = document.createElement("div");
    meta.className = "task-meta flex flex-wrap gap-3";

    const tagsArray = Array.isArray(tags) ? tags : [];
    tagsArray.forEach((t) => {
      const span = document.createElement("span");
      span.className = [
        "task-tag px-3 py-1 bg-black/40 text-advenica-accent/80",
        "text-[0.5rem] font-black uppercase rounded-sm border border-advenica-accent/10",
      ].join(" ");
      span.textContent = t;
      meta.appendChild(span);
    });

    taskContent.appendChild(titleRow);
    taskContent.appendChild(meta);

    // — Columna derecha: badge de prioridad + botones de acción —
    const taskSide = document.createElement("div");
    taskSide.className = "task-side flex items-center gap-3 flex-shrink-0";

    // Badge de prioridad
    const badge = document.createElement("span");
    badge.className = "task-badge text-[0.55rem] font-black uppercase px-3 py-1.5 rounded-sm border tracking-[0.2em]";
    switch (priority) {
      case "high":
        badge.classList.add("priority-high", "bg-red-500/10", "text-red-500", "border-red-500/20");
        badge.textContent = "CRITICAL";
        break;
      case "medium":
        badge.classList.add("priority-medium", "bg-amber-500/10", "text-amber-500", "border-amber-500/20");
        badge.textContent = "STANDARD";
        break;
      case "low":
      default:
        badge.classList.add("priority-low", "bg-blue-500/10", "text-blue-500", "border-blue-500/20");
        badge.textContent = "LOW";
        break;
    }
    taskSide.appendChild(badge);

    if (isArchive) {
      // ── Modo archivo: botón RESTAURAR + botón ELIMINAR definitivamente ──

      // Checkbox de selección para acciones masivas
      const selCheckbox = document.createElement("input");
      selCheckbox.type      = "checkbox";
      selCheckbox.className = "archive-item-checkbox w-5 h-5 cursor-pointer accent-sky-400 flex-shrink-0";
      selCheckbox.dataset.id = id;
      li.insertBefore(selCheckbox, li.firstChild); // va antes del checkbox de completado

      const restoreBtn = document.createElement("button");
      restoreBtn.type      = "button";
      restoreBtn.className = "task-recover advenica-btn-outline py-2 px-3 text-[0.55rem]";
      restoreBtn.textContent = "RESTAURAR";
      restoreBtn.onclick = () => unarchiveTask(id);

      const deleteBtn = document.createElement("button");
      deleteBtn.type      = "button";
      deleteBtn.className = [
        "text-[0.55rem] px-3 py-2 font-black uppercase tracking-widest",
        "bg-red-500/10 border border-red-500/20 text-red-500/70",
        "hover:bg-red-500 hover:text-white transition-all rounded-sm",
      ].join(" ");
      deleteBtn.textContent = "ELIMINAR";
      deleteBtn.title = "Eliminar definitivamente (no se puede deshacer)";
      deleteBtn.onclick = () => permanentlyDeleteTask(id);

      taskSide.appendChild(restoreBtn);
      taskSide.appendChild(deleteBtn);

    } else {
      // ── Modo lista activa (cambio 6): botón ARCHIVAR en lugar de eliminar ──
      const archiveBtn = document.createElement("button");
      archiveBtn.type      = "button";
      archiveBtn.className = [
        "task-archive-btn p-3 text-slate-600",
        "hover:text-advenica-accent hover:bg-advenica-accent/10",
        "rounded-sm transition-all opacity-0 group-hover:opacity-100",
      ].join(" ");
      archiveBtn.title = "Archivar tarea";
      archiveBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none"
             viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8l1 12a2 2 0 002 2h8
               a2 2 0 002-2L19 8M10 12h4" />
        </svg>`;
      archiveBtn.onclick = () => archiveTask(id);
      taskSide.appendChild(archiveBtn);
    }

    // — Listener de completado (solo en lista activa) —
    if (!isArchive) {
      checkbox.addEventListener("change", () => {
        const idx = tasks.findIndex(t => t.id === id);
        if (idx !== -1) {
          tasks[idx].completed = checkbox.checked;
          titleButton.classList.toggle("line-through", checkbox.checked);
          titleButton.classList.toggle("opacity-30",   checkbox.checked);
          saveTasks();
          updateStats();
        }
      });
    }

    // — Montar el li —
    li.appendChild(checkbox);
    li.appendChild(taskContent);
    li.appendChild(taskSide);

    // — Añadir a la lista correcta —
    if (isArchive) {
      archiveList.appendChild(li);
    } else {
      taskList.appendChild(li);
    }
  }


  // ============================================================
  //  9. OPERACIONES SOBRE EL ARCHIVO
  // ============================================================

  /**
   * Marca una tarea como archivada y actualiza la UI.
   * @param {string} id - ID de la tarea.
   */
  function archiveTask(id) {
    const idx = tasks.findIndex(t => t.id === id);
    if (idx === -1) return;
    tasks[idx].archived = true;
    saveTasks();
    renderTasks();
    renderArchive();
    updateStats();
    updateCategoryMenu();
  }

  /**
   * Saca una tarea del archivo y la devuelve a la lista activa.
   * @param {string} id - ID de la tarea.
   */
  function unarchiveTask(id) {
    const idx = tasks.findIndex(t => t.id === id);
    if (idx === -1) return;
    tasks[idx].archived = false;
    saveTasks();
    renderTasks();
    renderArchive();
    updateStats();
    updateCategoryMenu();
  }

  /**
   * Elimina una tarea del array de forma permanente (sin posibilidad de recuperación).
   * Muestra un confirm antes de actuar.
   * @param {string} id - ID de la tarea a eliminar.
   */
  function permanentlyDeleteTask(id) {
    const confirmed = window.confirm(
      "¿Eliminar esta tarea definitivamente?\nEsta acción no se puede deshacer."
    );
    if (!confirmed) return;

    tasks = tasks.filter(t => t.id !== id);
    saveTasks();
    renderArchive();
    updateStats();
  }


  // ============================================================
  //  10. RENDERIZADO DE LISTAS
  // ============================================================

  /** Repinta la lista de tareas activas y aplica los filtros vigentes. */
  function renderTasks() {
    taskList.innerHTML = "";
    tasks
      .filter(t => !t.archived)
      .forEach(t => addTaskToList(t, false));
    applyFilter();
  }

  /**
   * Repinta la lista del archivo.
   * Muestra u oculta los controles de selección masiva según si hay contenido.
   */
  function renderArchive() {
    archiveList.innerHTML = "";

    // Resetear el checkbox de "seleccionar todas"
    if (archiveSelectAll) archiveSelectAll.checked = false;

    const archived = tasks.filter(t => t.archived);

    if (archived.length === 0) {
      archiveEmptyMsg.classList.remove("hidden");
      if (archiveControls) archiveControls.classList.add("hidden");
    } else {
      archiveEmptyMsg.classList.add("hidden");
      // Mostrar controles masivos usando flex (hidden usa display:none)
      if (archiveControls) {
        archiveControls.classList.remove("hidden");
        archiveControls.style.display = "flex";
      }
      archived.forEach(t => addTaskToList(t, true));
    }

    // Actualizar contadores
    const count = archived.length;
    if (archiveModalCount) archiveModalCount.textContent = count;
    if (archiveCount)      archiveCount.textContent      = count;
  }


  // ============================================================
  //  11. FILTROS DE BÚSQUEDA Y PRIORIDAD
  // ============================================================

  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      activeSearchQuery = e.target.value.trim();
      applyFilter();
    });
  }

  if (priorityMenu) {
    priorityMenu.addEventListener("click", (e) => {
      const button = e.target.closest(".priority-filter");
      if (!button) return;

      activePriorityFilter = button.dataset.priority || "";

      // Actualizar el estado visual del botón activo
      priorityMenu.querySelectorAll(".priority-filter")
        .forEach(btn => btn.classList.remove("active"));
      button.classList.add("active");

      applyFilter();
    });
  }

  /**
   * Oculta o muestra cada tarea según el texto de búsqueda
   * y el filtro de prioridad activos.
   * Opera directamente sobre el DOM para mayor rendimiento.
   */
  function applyFilter() {
    const query = activeSearchQuery.toLowerCase();

    taskList.querySelectorAll(".task").forEach((li) => {
      const text = li.innerText.toLowerCase();
      const matchesText = text.includes(query);

      let matchesPriority = true;
      if (activePriorityFilter) {
        const badge = li.querySelector(".task-badge");
        if (!badge) {
          matchesPriority = false;
        } else {
          const cl = badge.classList;
          matchesPriority =
            (activePriorityFilter === "high"   && cl.contains("priority-high"))   ||
            (activePriorityFilter === "medium" && cl.contains("priority-medium")) ||
            (activePriorityFilter === "low"    && cl.contains("priority-low"));
        }
      }

      li.style.display = (matchesText && matchesPriority) ? "" : "none";
    });
  }


  // ============================================================
  //  12. ACCIONES MASIVAS EN LISTA ACTIVA
  // ============================================================

  if (completeAllBtn) {
    completeAllBtn.addEventListener("click", () => {
      tasks = tasks.map(task => ({ ...task, completed: true }));
      saveTasks();
      // Actualizar todos los checkboxes visibles
      taskList.querySelectorAll(".task-toggle").forEach(cb => (cb.checked = true));
      updateStats();
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
        `¿Enviar ${completedCount} tarea(s) completadas al archivo?`
      );
      if (!confirmed) return;

      tasks = tasks.map(task =>
        task.completed && !task.archived ? { ...task, archived: true } : task
      );

      saveTasks();
      renderTasks();
      renderArchive();
      updateCategoryMenu();
      updateStats();
    });
  }


  // ============================================================
  //  13. ACCIONES MASIVAS EN EL ARCHIVO (cambio 6)
  // ============================================================

  // Seleccionar / deseleccionar todas las tareas archivadas
  if (archiveSelectAll) {
    archiveSelectAll.addEventListener("change", () => {
      archiveList.querySelectorAll(".archive-item-checkbox")
        .forEach(cb => (cb.checked = archiveSelectAll.checked));
    });
  }

  // Eliminar las tareas archivadas seleccionadas
  if (archiveDeleteSelectedBtn) {
    archiveDeleteSelectedBtn.addEventListener("click", () => {
      const selected = archiveList.querySelectorAll(".archive-item-checkbox:checked");

      if (selected.length === 0) {
        alert("No hay tareas seleccionadas para eliminar.");
        return;
      }

      const confirmed = window.confirm(
        `¿Eliminar definitivamente ${selected.length} tarea(s)?\nEsta acción no se puede deshacer.`
      );
      if (!confirmed) return;

      const idsToDelete = new Set(Array.from(selected).map(cb => cb.dataset.id));
      tasks = tasks.filter(t => !idsToDelete.has(t.id));

      saveTasks();
      renderArchive();
      updateStats();
    });
  }


  // ============================================================
  //  14. MODAL DE ARCHIVO — ABRIR / CERRAR
  // ============================================================

  if (openArchiveBtn && archiveModal) {
    openArchiveBtn.addEventListener("click", () => {
      archiveModal.classList.remove("hidden");
      renderArchive(); // refrescar contenido al abrir
    });
  }

  if (closeArchiveBtn && archiveModal) {
    closeArchiveBtn.addEventListener("click", () => {
      archiveModal.classList.add("hidden");
    });
  }

  // Cerrar al hacer clic en el fondo oscuro
  window.addEventListener("click", (e) => {
    if (e.target === archiveModal) {
      archiveModal.classList.add("hidden");
    }
  });


  // ============================================================
  //  15. AÑADIR TAREA DESDE EL FORMULARIO
  // ============================================================

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const title    = titleInput.value.trim();
    const tagsRaw  = tagsInput.value.trim();
    const priority = prioritySelect.value;
    const deadline = deadlineInput.value.trim();

    if (!title) {
      alert("Por favor, introduce un título para la tarea.");
      return;
    }

    const newTask = {
      id:       "task-" + Date.now(),
      title,
      tags:     tagsRaw
        ? tagsRaw.split(",").map(t => t.trim()).filter(t => t.length > 0)
        : [],
      priority,
      deadline,
      completed: false,
      archived:  false,
    };

    tasks.push(newTask);
    saveTasks();
    renderTasks();
    updateCategoryMenu();
    updateStats();

    // Limpiar formulario y colapsar el panel de nueva tarea
    form.reset();
    if (newTaskFormPanel && newTaskFormPanel.classList.contains("open")) {
      newTaskFormPanel.classList.remove("open");
      if (newTaskCard) newTaskCard.setAttribute("aria-expanded", "false");
      if (newTaskExpandIcon) newTaskExpandIcon.style.transform = "";
    }
  });


  // ============================================================
  //  16. CARGA INICIAL
  // ============================================================

  loadTasks();

}); // fin DOMContentLoaded
