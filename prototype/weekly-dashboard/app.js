const STORAGE_KEY = "nora-weekly-dashboard-v1";
const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const longDayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const defaultTasks = [
  { id: "task-steps", name: "10 minute walk", category: "Health", days: [0, 1, 2, 3, 4, 5, 6] },
  { id: "task-water", name: "Drink water with each meal", category: "Health", days: [0, 1, 2, 3, 4, 5, 6] },
  { id: "task-meals", name: "Prep or log meals", category: "Health", days: [0, 1, 2, 3, 4, 5, 6] },
  { id: "task-stretch", name: "Stretch or mobility", category: "Health", days: [0, 2, 4, 6] },
  { id: "task-plan", name: "Review daily priorities", category: "Work", days: [0, 1, 2, 3, 4] },
  { id: "task-inbox", name: "Clear important messages", category: "Work", days: [0, 2, 4] },
  { id: "task-tidy", name: "Reset one living area", category: "Home", days: [1, 3, 5] },
  { id: "task-learn", name: "Read or learn for 15 minutes", category: "Learning", days: [0, 1, 2, 3, 4] },
  { id: "task-reflect", name: "Evening reflection", category: "Personal", days: [0, 1, 2, 3, 4, 5, 6] }
];

let state = loadState();

const els = {
  weekStart: document.querySelector("#weekStart"),
  previousWeek: document.querySelector("#previousWeek"),
  nextWeek: document.querySelector("#nextWeek"),
  weeklyDonut: document.querySelector("#weeklyDonut"),
  weeklyPercent: document.querySelector("#weeklyPercent"),
  weeklyCount: document.querySelector("#weeklyCount"),
  tasksChart: document.querySelector("#tasksChart"),
  habitMatrix: document.querySelector("#habitMatrix"),
  dailyBars: document.querySelector("#dailyBars"),
  daysGrid: document.querySelector("#daysGrid"),
  taskForm: document.querySelector("#taskForm"),
  taskName: document.querySelector("#taskName"),
  taskCategory: document.querySelector("#taskCategory"),
  newTaskDays: document.querySelector("#newTaskDays"),
  mapperHead: document.querySelector("#mapperHead"),
  mapperBody: document.querySelector("#mapperBody"),
  taskTotal: document.querySelector("#taskTotal")
};

init();

function init() {
  renderDayPicker();
  bindEvents();
  normalizeWeekInput();
  render();
}

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      return {
        weekStart: parsed.weekStart || toDateInput(startOfWeek(new Date())),
        tasks: Array.isArray(parsed.tasks) ? parsed.tasks : defaultTasks,
        completions: parsed.completions && typeof parsed.completions === "object" ? parsed.completions : {}
      };
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  return {
    weekStart: toDateInput(startOfWeek(new Date())),
    tasks: defaultTasks,
    completions: {}
  };
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function bindEvents() {
  els.weekStart.addEventListener("change", () => {
    state.weekStart = toDateInput(startOfWeek(new Date(`${els.weekStart.value}T00:00:00`)));
    saveState();
    render();
  });

  els.previousWeek.addEventListener("click", () => moveWeek(-7));
  els.nextWeek.addEventListener("click", () => moveWeek(7));

  document.querySelectorAll(".tab-button").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".tab-button").forEach((tab) => tab.classList.remove("is-active"));
      document.querySelectorAll(".view").forEach((view) => view.classList.remove("is-active"));
      button.classList.add("is-active");
      document.querySelector(`#${button.dataset.view}View`).classList.add("is-active");
    });
  });

  els.taskForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = els.taskName.value.trim();
    if (!name) return;

    const days = [...els.newTaskDays.querySelectorAll("input:checked")].map((input) => Number(input.value));
    state.tasks.push({
      id: `task-${Date.now().toString(36)}`,
      name,
      category: els.taskCategory.value,
      days: days.length ? days : [0, 1, 2, 3, 4, 5, 6]
    });
    els.taskForm.reset();
    els.newTaskDays.querySelectorAll("input").forEach((input) => {
      input.checked = true;
    });
    saveState();
    render();
  });
}

function render() {
  normalizeWeekInput();
  const week = getWeekDays();
  const stats = getWeekStats(week);

  els.weeklyCount.textContent = `${stats.done}/${stats.total} completed`;
  els.weeklyPercent.textContent = `${stats.percent}%`;
  els.weeklyDonut.style.setProperty("--value", stats.percent);
  els.taskTotal.textContent = `${state.tasks.length} ${state.tasks.length === 1 ? "task" : "tasks"}`;

  renderTasksChart(week);
  renderDailyBars(week);
  renderHabitMatrix(week);
  renderDayCards(week);
  renderMapper();
}

function normalizeWeekInput() {
  state.weekStart = toDateInput(startOfWeek(new Date(`${state.weekStart}T00:00:00`)));
  els.weekStart.value = state.weekStart;
}

function renderDayPicker() {
  els.newTaskDays.innerHTML = dayNames.map((day, index) => `
    <label class="day-pill">
      <input type="checkbox" value="${index}" checked>
      <span>${day}</span>
    </label>
  `).join("");
}

function renderTasksChart(week) {
  els.tasksChart.innerHTML = week.map((day, index) => {
    const dayStats = getDayStats(day.key, index);
    return `
      <div class="bar">
        <div class="bar-stack" title="${dayStats.percent}% complete">
          <div class="bar-fill" style="height: ${dayStats.percent}%"></div>
        </div>
        <label>${dayNames[index]}</label>
      </div>
    `;
  }).join("");
}

function renderDailyBars(week) {
  els.dailyBars.innerHTML = week.map((day, index) => {
    const dayStats = getDayStats(day.key, index);
    return `
      <div class="daily-row">
        <span>${dayNames[index]}</span>
        <div class="daily-track">
          <div class="daily-fill" style="width: ${dayStats.percent}%"></div>
        </div>
        <span>${dayStats.percent}%</span>
      </div>
    `;
  }).join("");
}

function renderHabitMatrix(week) {
  const rows = state.tasks.slice(0, 8).map((task) => `
    <tr>
      <td class="matrix-label">${escapeHtml(task.name)}</td>
      ${week.map((day, index) => {
        const scheduled = task.days.includes(index);
        const done = scheduled && isComplete(day.key, task.id);
        return `<td><span class="checkmark ${done ? "is-on" : ""}">${done ? "✓" : ""}</span></td>`;
      }).join("")}
    </tr>
  `).join("");

  els.habitMatrix.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>Tasks</th>
          ${dayNames.map((day) => `<th>${day}</th>`).join("")}
        </tr>
      </thead>
      <tbody>${rows || `<tr><td colspan="8" class="empty-state">No tasks yet.</td></tr>`}</tbody>
    </table>
  `;
}

function renderDayCards(week) {
  const template = document.querySelector("#dayCardTemplate");
  els.daysGrid.innerHTML = "";

  week.forEach((day, index) => {
    const scheduledTasks = state.tasks.filter((task) => task.days.includes(index));
    const stats = getDayStats(day.key, index);
    const card = template.content.firstElementChild.cloneNode(true);

    card.querySelector(".day-name").textContent = longDayNames[index];
    card.querySelector(".day-date").textContent = formatShortDate(day.date);
    card.querySelector(".small-donut").style.setProperty("--value", stats.percent);
    card.querySelector(".small-donut span").textContent = `${stats.percent}%`;
    card.querySelector(".completion-copy").textContent = `${stats.done}/${stats.total} completed`;

    const checklist = card.querySelector(".checklist");
    if (!scheduledTasks.length) {
      checklist.innerHTML = `<li class="empty-state">No tasks mapped to this day.</li>`;
    } else {
      checklist.innerHTML = scheduledTasks.map((task) => `
        <li>
          <label>
            <input type="checkbox" data-day="${day.key}" data-task="${task.id}" ${isComplete(day.key, task.id) ? "checked" : ""}>
            <span>${escapeHtml(task.name)}</span>
          </label>
        </li>
      `).join("");
    }

    checklist.querySelectorAll("input[type='checkbox']").forEach((input) => {
      input.addEventListener("change", () => {
        setCompletion(input.dataset.day, input.dataset.task, input.checked);
        render();
      });
    });

    els.daysGrid.appendChild(card);
  });
}

function renderMapper() {
  els.mapperHead.innerHTML = `
    <tr>
      <th class="task-cell">Task</th>
      ${dayNames.map((day) => `<th>${day}</th>`).join("")}
      <th>Delete</th>
    </tr>
  `;

  els.mapperBody.innerHTML = state.tasks.map((task) => `
    <tr>
      <td class="task-cell">
        <span class="task-name">${escapeHtml(task.name)}</span>
        <span class="task-meta">${escapeHtml(task.category)}</span>
      </td>
      ${dayNames.map((day, index) => `
        <td>
          <input class="mapper-checkbox" type="checkbox" data-task="${task.id}" data-day-index="${index}" ${task.days.includes(index) ? "checked" : ""} aria-label="${escapeHtml(task.name)} on ${day}">
        </td>
      `).join("")}
      <td>
        <button class="delete-button" type="button" data-delete="${task.id}" title="Delete task" aria-label="Delete ${escapeHtml(task.name)}">×</button>
      </td>
    </tr>
  `).join("") || `<tr><td colspan="9" class="empty-state">Add a task definition to begin.</td></tr>`;

  els.mapperBody.querySelectorAll(".mapper-checkbox").forEach((input) => {
    input.addEventListener("change", () => {
      const task = state.tasks.find((item) => item.id === input.dataset.task);
      const dayIndex = Number(input.dataset.dayIndex);
      if (!task) return;
      if (input.checked && !task.days.includes(dayIndex)) {
        task.days.push(dayIndex);
        task.days.sort((a, b) => a - b);
      }
      if (!input.checked) {
        task.days = task.days.filter((day) => day !== dayIndex);
      }
      saveState();
      render();
    });
  });

  els.mapperBody.querySelectorAll("[data-delete]").forEach((button) => {
    button.addEventListener("click", () => {
      const taskId = button.dataset.delete;
      state.tasks = state.tasks.filter((task) => task.id !== taskId);
      Object.keys(state.completions).forEach((dayKey) => {
        delete state.completions[dayKey][taskId];
      });
      saveState();
      render();
    });
  });
}

function getWeekDays() {
  const start = new Date(`${state.weekStart}T00:00:00`);
  return dayNames.map((_, index) => {
    const date = addDays(start, index);
    return {
      date,
      key: toDateInput(date)
    };
  });
}

function getWeekStats(week) {
  return week.reduce((acc, day, index) => {
    const dayStats = getDayStats(day.key, index);
    acc.done += dayStats.done;
    acc.total += dayStats.total;
    acc.percent = percent(acc.done, acc.total);
    return acc;
  }, { done: 0, total: 0, percent: 0 });
}

function getDayStats(dayKey, dayIndex) {
  const tasks = state.tasks.filter((task) => task.days.includes(dayIndex));
  const done = tasks.filter((task) => isComplete(dayKey, task.id)).length;
  return {
    done,
    total: tasks.length,
    percent: percent(done, tasks.length)
  };
}

function setCompletion(dayKey, taskId, done) {
  state.completions[dayKey] = state.completions[dayKey] || {};
  if (done) {
    state.completions[dayKey][taskId] = true;
  } else {
    delete state.completions[dayKey][taskId];
  }
  saveState();
}

function isComplete(dayKey, taskId) {
  return Boolean(state.completions[dayKey] && state.completions[dayKey][taskId]);
}

function moveWeek(days) {
  state.weekStart = toDateInput(addDays(new Date(`${state.weekStart}T00:00:00`), days));
  saveState();
  render();
}

function startOfWeek(date) {
  const next = new Date(date);
  const day = next.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  next.setDate(next.getDate() + diff);
  next.setHours(0, 0, 0, 0);
  return next;
}

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function toDateInput(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatShortDate(date) {
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function percent(done, total) {
  return total ? Math.round((done / total) * 100) : 0;
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}
