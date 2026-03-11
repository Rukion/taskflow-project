// app.js
document.addEventListener("DOMContentLoaded", () => {
  // ================================
  // 1. ESTADO GLOBAL
  // ================================
  /** @type {Array<{id:string,title:string,tags:string[],priority:"high"|"medium"|"low",deadline:string,completed:boolean}>} */
  let tasks = [];
  let activePriorityFilter = "";
  let activeSearchQuery = "";

  const STORAGE_KEY = "tasks_v2";

  // ================================
  // 2. REFERENCIAS AL DOM
  // ================================
  const taskList = document.getElementById("task-list");
  const searchInput = document.getElementById("search");
  const priorityMenu = document.querySelector(".priority-menu");
  const categoryMenu = document.getElementById("category-menu");

  const addQuickBtn = document.getElementById("btn-add-quick"); // botón "+" top bar
  const addBottomBtn = document.getElementById("btn-add"); // botón "+ ADD TASK" footer

  const statusToggleBtn = document.getElementById("status-toggle");
  const statusViewProgress = document.getElementById("status-view-progress");
  const statusViewFilters = document.getElementById("status-view-filters");
  const progressText = statusViewProgress?.querySelector(".progress-text");
  const importantPill = statusViewProgress?.querySelector(".important-pill");

  if (!taskList) {
    console.warn("No se ha encontrado #task-list en el HTML.");
    return;
  }

  // ================================
  // 3. FORMULARIO (CREADO DINÁMICAMENTE)
  // ================================
  let form;
  let formOverlay;
  let titleInput;
  let tagsInput;
  let prioritySelect;
  let deadlineInput;

  /**
   * Crea (si hace falta) y referencia el formulario de nueva tarea
   * para que se muestre como un "modal" al pulsar los botones "+".
   */
  function initTaskForm() {
    // ¿El formulario ya existe en el HTML?
    form = document.getElementById("task-form");
    formOverlay = document.getElementById("task-form-overlay");

    if (!form) {
      // Crear overlay + modal + form
      formOverlay = document.createElement("div");
      formOverlay.id = "task-form-overlay";
      formOverlay.className = "task-form-overlay hidden";
      formOverlay.innerHTML = `
        <div class="task-form-modal">
          <h2>Nueva tarea</h2>
          <form id="task-form">
            <div class="task-form-field">
              <label for="task-title">Título</label>
              <input type="text" id="task-title" name="title" required />
            </div>

            <div class="task-form-field">
              <label for="task-tags">Categorías (separadas por comas)</label>
              <input type="text" id="task-tags" name="tags" placeholder="salud, casa, trabajo..." />
            </div>

            <div class="task-form-field">
              <label for="task-priority">Prioridad</label>
              <select id="task-priority" name="priority">
                <option value="high">Alta</option>
                <option value="medium" selected>Media</option>
                <option value="low">Baja</option>
              </select>
            </div>

            <div class="task-form-field">
              <label for="task-deadline">Deadline</label>
              <input type="text" id="task-deadline" name="deadline" placeholder="15/03, 14:15, mañana..." />
            </div>

            <div class="task-form-actions">
              <button type="submit" class="btn-form-primary">Guardar</button>
              <button type="button" id="task-form-cancel" class="btn-form-secondary">Cancelar</button>
            </div>
          </form>
        </div>
      `;
      document.body.appendChild(formOverlay);
      form = formOverlay.querySelector("#task-form");
    }

    titleInput = form.querySelector("#task-title");
    tagsInput = form.querySelector("#task-tags");
    prioritySelect = form.querySelector("#task-priority");
    deadlineInput = form.querySelector("#task-deadline");

    // Eventos del formulario
    form.addEventListener("submit", handleFormSubmit);
    const cancelBtn = form.querySelector("#task-form-cancel");
    if (cancelBtn) {
      cancelBtn.addEventListener("click", () => {
        hideTaskForm();
      });
    }
  }

  function showTaskForm() {
    if (!formOverlay || !form) return;
    form.reset();
    formOverlay.classList.remove("hidden");
    if (titleInput) {
      titleInput.focus();
    }
  }

  function hideTaskForm() {
    if (!formOverlay) return;
    formOverlay.classList.add("hidden");
  }

  // ================================
  // 4. PERSISTENCIA: LOCALSTORAGE
  // ================================
  function saveTasks() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (error) {
      console.error("Error guardando tareas en localStorage:", error);
    }
  }

  function loadTasks() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          tasks = parsed;
          return;
        }
      }

      // Si no hay nada guardado, inicializamos con las tareas demo del HTML
      tasks = getInitialDemoTasks();
      saveTasks();
    } catch (error) {
      console.error("Error leyendo tareas de localStorage:", error);
      tasks = getInitialDemoTasks();
    }
  }

  function getInitialDemoTasks() {
    return [
      {
        id: "task-" + Date.now() + "-1",
        title: "Comer",
        tags: ["salud", "Dieta", "500kcal"],
        priority: "high",
        deadline: "14:15",
        completed: false,
      },
      {
        id: "task-" + Date.now() + "-2",
        title: "Comprar hilo coser",
        tags: ["casa"],
        priority: "medium",
        deadline: "sin prisa",
        completed: false,
      },
      {
        id: "task-" + Date.now() + "-3",
        title: "2º Entrega TFG",
        tags: [],
        priority: "high",
        deadline: "15/03",
        completed: false,
      },
    ];
  }

  // ================================
  // 5. PINTAR TAREAS EN EL DOM
  // ================================
  function renderAllTasks() {
    taskList.innerHTML = "";
    tasks.forEach((task) => renderTask(task));
    applyFilter(); // por si hay búsqueda/filtrado activos
  }

  function renderTask(task) {
    const { id, title, tags, priority, deadline } = task;

    const li = document.createElement("li");
    li.classList.add("task");
    li.dataset.id = id;

    // Clases para el fondo degradado por prioridad (CSS: .task-high, .task-medium, .task-low)
    if (priority === "high") {
      li.classList.add("task-high");
    } else if (priority === "medium") {
      li.classList.add("task-medium");
    } else {
      li.classList.add("task-low");
    }

    // Barra lateral de prioridad
    const priorityBar = document.createElement("div");
    priorityBar.classList.add("priority-bar");
    if (priority === "high") {
      priorityBar.classList.add("high");
    } else if (priority === "medium") {
      priorityBar.classList.add("medium");
    } else {
      priorityBar.classList.add("low");
    }

    // Tarjeta interior
    const label = document.createElement("label");
    label.classList.add("task-card");

    const content = document.createElement("div");
    content.classList.add("task-content");

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

    const tagsContainer = document.createElement("div");
    tagsContainer.classList.add("task-tags");

    const tagsArray = Array.isArray(tags) ? tags : [];
    tagsArray.forEach((t) => {
      const span = document.createElement("span");
      span.classList.add("tag");
      span.textContent = t;
      tagsContainer.appendChild(span);
    });

    content.appendChild(titleRow);
    content.appendChild(tagsContainer);

    // Botón de "Store" (vamos a usarlo para archivar/eliminar la tarea)
    const storeBtn = document.createElement("button");
    storeBtn.type = "button";
    storeBtn.classList.add("store-btn");
    storeBtn.textContent = "Store";

    label.appendChild(content);
    label.appendChild(storeBtn);

    li.appendChild(priorityBar);
    li.appendChild(label);

    taskList.appendChild(li);
  }

  // ================================
  // 6. MENÚ DE CATEGORÍAS
  // ================================
  function updateCategoryMenu() {
    if (!categoryMenu) return;

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
      pill.classList.add("category-pill");
      pill.textContent = cat;
      categoryMenu.appendChild(pill);
    });

    // (Opcional) Aquí podrías añadir un listener para filtrar por categoría
    // TODO: filtrar también por categoría si lo necesitas.
  }

  // ================================
  // 7. VISTA PROGRESS
  // ================================
  function updateProgressView() {
    if (!progressText || !importantPill) return;

    const total = tasks.length;
    // Por ahora consideramos "IMPORTANT" las tareas de prioridad alta
    const importantCount = tasks.filter((t) => t.priority === "high").length;

    progressText.textContent = `Progress: ${importantCount}/${total}`;
    importantPill.textContent = `${importantCount} IMPORTANT`;
  }

  let showingProgress = true;
  function toggleStatusView() {
    if (!statusViewProgress || !statusViewFilters || !statusToggleBtn) return;

    showingProgress = !showingProgress;

    if (showingProgress) {
      statusViewProgress.classList.remove("hidden");
      statusViewFilters.classList.add("hidden");
      statusToggleBtn.textContent = "Filter"; // el botón vuelve a "Filter"
    } else {
      statusViewProgress.classList.add("hidden");
      statusViewFilters.classList.remove("hidden");
      statusToggleBtn.textContent = "Progress"; // ahora el botón dice "Progress"
    }
  }

  // ================================
  // 8. FILTROS (BUSCADOR + PRIORIDAD)
  // ================================
  function applyFilter() {
    const normalizedQuery = activeSearchQuery.toLowerCase();
    const items = taskList.querySelectorAll(".task");

    items.forEach((li) => {
      const text = li.innerText.toLowerCase();
      const matchesText =
        !normalizedQuery || text.includes(normalizedQuery);

      let matchesPriority = true;
      if (activePriorityFilter) {
        if (activePriorityFilter === "high") {
          matchesPriority = li.classList.contains("task-high");
        } else if (activePriorityFilter === "medium") {
          matchesPriority = li.classList.contains("task-medium");
        } else if (activePriorityFilter === "low") {
          matchesPriority = li.classList.contains("task-low");
        }
      }

      li.style.display = matchesText && matchesPriority ? "" : "none";
    });
  }

  // ================================
  // 9. GESTIÓN FORMULARIO: AÑADIR NUEVA TAREA
  // ================================
  function handleFormSubmit(event) {
    event.preventDefault();
    if (!titleInput || !tagsInput || !prioritySelect || !deadlineInput) return;

    const title = titleInput.value.trim();
    const tagsRaw = tagsInput.value.trim();
    const priority = prioritySelect.value || "medium";
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

    tasks.push(newTask);
    saveTasks();
    renderAllTasks();
    updateCategoryMenu();
    updateProgressView();
    hideTaskForm();
  }

  // ================================
  // 10. EVENTOS
  // ================================
  initTaskForm(); // crea/referencia el formulario y añade sus listeners

  // Botones para añadir tarea: hacen LO MISMO
  if (addQuickBtn) {
    addQuickBtn.addEventListener("click", () => {
      showTaskForm();
    });
  }
  if (addBottomBtn) {
    addBottomBtn.addEventListener("click", () => {
      showTaskForm();
    });
  }

  // Buscador
  if (searchInput) {
    searchInput.addEventListener("input", (event) => {
      activeSearchQuery = event.target.value.trim();
      applyFilter();
    });
  }

  // Filtro de prioridad (en la vista Filter)
  if (priorityMenu) {
    priorityMenu.addEventListener("click", (event) => {
      const button = event.target.closest(".priority-filter");
      if (!button) return;

      activePriorityFilter = button.dataset.priority || "";

      // Marcar botón activo
      const allButtons = priorityMenu.querySelectorAll(".priority-filter");
      allButtons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");

      applyFilter();
    });
  }

  // Botón que alterna entre Progress y Filter
  if (statusToggleBtn && statusViewProgress && statusViewFilters) {
    statusToggleBtn.addEventListener("click", () => {
      toggleStatusView();
    });
  }

  // Delegación para el botón "Store" (archivar/eliminar tarea)
  taskList.addEventListener("click", (event) => {
    const storeButton = event.target.closest(".store-btn");
    if (!storeButton) return;

    const li = storeButton.closest(".task");
    if (!li) return;

    const taskId = li.dataset.id;
    if (!taskId) {
      li.remove();
      return;
    }

    tasks = tasks.filter((t) => t.id !== taskId);
    saveTasks();
    li.remove();
    updateCategoryMenu();
    updateProgressView();
  });

  // ================================
  // 11. INICIALIZACIÓN
  // ================================
  loadTasks();
  renderAllTasks();
  updateCategoryMenu();
  updateProgressView();
});