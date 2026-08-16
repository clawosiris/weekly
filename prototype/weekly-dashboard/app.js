const STORAGE_KEY = "nora-weekly-dashboard-v1";
const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const longDayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const weeklyAnimals = [
  { id: "whooping-crane", name: "Whooping Crane", emoji: "🪿", status: "Endangered", population: "~830", detail: "About 830 across wild and managed populations", fact: "One of North America's rarest birds, the whooping crane has made a remarkable recovery from only 21 birds in 1941.", accent: "#d94f4f", soft: "#ffe9e7", bg: "#fff8f3" },
  { id: "african-wild-dog", name: "African Wild Dog", emoji: "🐕", status: "Endangered", population: "3,000–5,500", detail: "Estimated mature and adult animals remaining", fact: "Wild dogs live in close-knit packs and use teamwork to care for pups, hunt, and protect one another.", accent: "#b66b2c", soft: "#fff0cf", bg: "#fff9ed" },
  { id: "white-rhino", name: "White Rhino", emoji: "🦏", status: "Near Threatened", population: "15,752", detail: "Estimated population at the end of 2024", fact: "White rhinos are grazers. Their wide, square lips are perfectly shaped for clipping short grass.", accent: "#54745d", soft: "#e3f0e4", bg: "#f4faf4" },
  { id: "whale-shark", name: "Whale Shark", emoji: "🦈", status: "Endangered", population: "120,000–240,000", detail: "Estimated adult whale sharks remaining worldwide", fact: "The world's largest fish is a gentle filter feeder, recognizable by a spot pattern unique to each individual.", accent: "#287aa2", soft: "#dff3fb", bg: "#f1fbff" },
  { id: "woylie", name: "Woylie", emoji: "🦘", status: "Critically Endangered", population: "<15,000", detail: "Estimated animals remaining", fact: "This small Australian marsupial turns over soil while foraging, helping forests recycle nutrients and spread fungi.", accent: "#8f5f37", soft: "#f4e6d8", bg: "#fff9f3" }
];

const defaultTasks = [
  { id: "task-steps", name: "10 minute walk", category: "Health", days: [0, 1, 2, 3, 4, 5, 6], reminder: "16:00", reminderEnabled: false },
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
const currentMascot = getWeeklyMascot();
const sentReminders = new Set();

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
  taskTotal: document.querySelector("#taskTotal"),
  taskReminder: document.querySelector("#taskReminder"),
  reminderList: document.querySelector("#reminderList"),
  enableNotifications: document.querySelector("#enableNotifications"),
  notificationStatus: document.querySelector("#notificationStatus"),
  confirmReminders: document.querySelector("#confirmReminders"),
  reminderConfirmStatus: document.querySelector("#reminderConfirmStatus"),
  mascotSplash: document.querySelector("#mascotSplash"),
  skipSplash: document.querySelector("#skipSplash"),
  mascotChip: document.querySelector("#mascotChip"),
  mascotToast: document.querySelector("#mascotToast")
};

init();

function init() {
  applyMascot();
  renderDayPicker();
  bindEvents();
  normalizeWeekInput();
  render();
  registerServiceWorker();
  window.setInterval(checkReminders, 30000);
  checkReminders();
  window.setTimeout(closeSplash, 4800);
}

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      return {
        weekStart: parsed.weekStart || toDateInput(startOfWeek(new Date())),
        tasks: Array.isArray(parsed.tasks) ? parsed.tasks.map(normalizeTask) : defaultTasks.map(normalizeTask),
        completions: parsed.completions && typeof parsed.completions === "object" ? parsed.completions : {}
      };
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  return {
    weekStart: toDateInput(startOfWeek(new Date())),
    tasks: defaultTasks.map(normalizeTask),
    completions: {}
  };
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function bindEvents() {
  els.skipSplash.addEventListener("click", closeSplash);
  els.mascotChip.addEventListener("click", openSplash);
  els.enableNotifications.addEventListener("click", enableNotifications);
  els.confirmReminders.addEventListener("click", confirmReminders);
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
      days: days.length ? days : [0, 1, 2, 3, 4, 5, 6],
      reminder: els.taskReminder.value || "",
      reminderEnabled: Boolean(els.taskReminder.value)
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
  renderReminders();
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

function renderReminders() {
  if (!state.tasks.length) {
    els.reminderList.innerHTML = `<p class="empty-state">Add a task first, then choose its reminder time.</p>`;
    return;
  }

  els.reminderList.innerHTML = state.tasks.map((task) => `
    <div class="reminder-row">
      <label class="reminder-toggle">
        <input type="checkbox" data-reminder-enabled="${task.id}" ${task.reminderEnabled ? "checked" : ""}>
        <span><strong>${escapeHtml(task.name)}</strong><small>${escapeHtml(task.category)}</small></span>
      </label>
      <input type="time" data-reminder-time="${task.id}" value="${escapeHtml(task.reminder || "")}" aria-label="Reminder time for ${escapeHtml(task.name)}">
    </div>
  `).join("");

  els.reminderList.querySelectorAll("[data-reminder-enabled]").forEach((input) => {
    input.addEventListener("change", () => {
      const task = state.tasks.find((item) => item.id === input.dataset.reminderEnabled);
      if (!task) return;
      task.reminderEnabled = input.checked;
      if (input.checked && !task.reminder) task.reminder = "09:00";
      saveState();
      renderReminders();
    });
  });

  els.reminderList.querySelectorAll("[data-reminder-time]").forEach((input) => {
    input.addEventListener("change", () => {
      const task = state.tasks.find((item) => item.id === input.dataset.reminderTime);
      if (!task) return;
      task.reminder = input.value;
      task.reminderEnabled = Boolean(input.value);
      saveState();
      renderReminders();
    });
  });
}

function normalizeTask(task) {
  return {
    ...task,
    days: Array.isArray(task.days) ? task.days : [],
    reminder: typeof task.reminder === "string" ? task.reminder : "",
    reminderEnabled: Boolean(task.reminderEnabled)
  };
}

function getWeeklyMascot() {
  const monday = startOfWeek(new Date());
  const weekNumber = Math.floor(monday.getTime() / 604800000);
  return weeklyAnimals[((weekNumber % weeklyAnimals.length) + weeklyAnimals.length) % weeklyAnimals.length];
}

function applyMascot() {
  const isWhaleShark = currentMascot.id === "whale-shark";
  const isAfricanWildDog = currentMascot.id === "african-wild-dog";
  const icon = isWhaleShark
    ? "icons/whale-shark-app-icon.png"
    : isAfricanWildDog
      ? "icons/african-wild-dog-mascot.png"
      : `icons/${currentMascot.id}.svg`;
  document.documentElement.style.setProperty("--mascot-accent", currentMascot.accent);
  document.documentElement.style.setProperty("--mascot-soft", currentMascot.soft);
  document.documentElement.style.setProperty("--mascot-bg", currentMascot.bg);
  document.querySelector('meta[name="theme-color"]').content = currentMascot.accent;
  document.querySelector("#appIcon").href = icon;

  setText("splashName", currentMascot.name);
  setText("splashStatus", currentMascot.status);
  setText("splashPopulation", currentMascot.detail);
  setText("splashFact", currentMascot.fact);
  const walkingAnimal = document.querySelector("#walkingAnimal");
  walkingAnimal.classList.toggle("is-swimming", isWhaleShark);
  walkingAnimal.classList.toggle("is-walking-dog", isAfricanWildDog);
  walkingAnimal.innerHTML = isWhaleShark
    ? `<img src="icons/whale-shark-mascot.png" alt="Whale Shark swimming">`
    : isAfricanWildDog
      ? `<img src="icons/african-wild-dog-mascot.png" alt="African Wild Dog walking">`
      : `<span aria-hidden="true">${currentMascot.emoji}</span>`;
  setText("mascotChipName", currentMascot.name);
  setText("mascotBannerName", currentMascot.name);
  setText("mascotBannerFact", currentMascot.fact);
  setText("mascotBannerStatus", currentMascot.status);
  setText("mascotBannerPopulation", currentMascot.population);

  ["mascotChipIcon", "mascotBannerIcon", "notificationMascot", "toastIcon"].forEach((id) => {
    const image = document.querySelector(`#${id}`);
    image.src = icon;
    image.alt = currentMascot.name;
  });

  if ("Notification" in window) {
    els.notificationStatus.textContent = notificationPermissionLabel();
  } else {
    els.notificationStatus.textContent = "Notifications are not supported in this browser";
    els.enableNotifications.disabled = true;
  }
}

function setText(id, value) {
  document.querySelector(`#${id}`).textContent = value;
}

function closeSplash() {
  els.mascotSplash.classList.add("is-hidden");
}

function openSplash() {
  els.mascotSplash.classList.remove("is-hidden");
  const walker = document.querySelector("#walkingAnimal");
  walker.style.animation = "none";
  window.requestAnimationFrame(() => { walker.style.animation = ""; });
}

async function enableNotifications() {
  if (!("Notification" in window)) return;
  const permission = await Notification.requestPermission();
  els.notificationStatus.textContent = notificationPermissionLabel();
  if (permission === "granted") {
    showMascotToast("Notifications are on", `${currentMascot.name} will remind you at the times you choose.`);
    await sendBrowserNotification("Weekly notifications are on", `${currentMascot.name} is ready to remind you.` , "weekly-permission-test");
  }
}

async function confirmReminders() {
  const rows = [...els.reminderList.querySelectorAll(".reminder-row")];
  rows.forEach((row) => {
    const enabledInput = row.querySelector("[data-reminder-enabled]");
    const timeInput = row.querySelector("[data-reminder-time]");
    const task = state.tasks.find((item) => item.id === timeInput?.dataset.reminderTime);
    if (!task) return;
    task.reminder = timeInput.value;
    task.reminderEnabled = Boolean(enabledInput.checked && timeInput.value);
  });
  saveState();
  renderReminders();

  if (!("Notification" in window)) {
    setReminderStatus("This browser does not support notifications.", true);
    return;
  }

  let permission = Notification.permission;
  if (permission === "default") permission = await Notification.requestPermission();
  els.notificationStatus.textContent = notificationPermissionLabel();

  if (permission !== "granted") {
    setReminderStatus("Notifications are blocked. Open Chrome settings → Site settings → Notifications → allow Weekly.", true);
    return;
  }

  const enabledCount = state.tasks.filter((task) => task.reminderEnabled && task.reminder).length;
  if (!enabledCount) {
    setReminderStatus("Saved, but no reminders are switched on with a time selected.", true);
    return;
  }

  const worked = await sendBrowserNotification(
    `${currentMascot.emoji} Reminders confirmed`,
    `${currentMascot.name} will watch ${enabledCount} ${enabledCount === 1 ? "reminder" : "reminders"}. Keep Weekly open for scheduled web reminders.`,
    `weekly-confirm-${Date.now()}`
  );
  setReminderStatus(worked ? `Saved ${enabledCount} ${enabledCount === 1 ? "reminder" : "reminders"}. A test notification was sent.` : "Saved, but Android did not accept the test notification. Check Weekly's notification permission.", !worked);
}

function setReminderStatus(message, isError = false) {
  els.reminderConfirmStatus.textContent = message;
  els.reminderConfirmStatus.classList.toggle("is-error", isError);
}

function notificationPermissionLabel() {
  if (Notification.permission === "granted") return "Notifications enabled";
  if (Notification.permission === "denied") return "Notifications blocked in browser settings";
  return "Permission not requested";
}

async function checkReminders() {
  if (!("Notification" in window) || Notification.permission !== "granted") return;
  const now = new Date();
  const dayIndex = now.getDay() === 0 ? 6 : now.getDay() - 1;
  const time = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  const dayKey = toDateInput(now);

  state.tasks
    .filter((task) => task.reminderEnabled && task.reminder === time && task.days.includes(dayIndex) && !isComplete(dayKey, task.id))
    .forEach((task) => {
      const key = `${dayKey}-${time}-${task.id}`;
      if (sentReminders.has(key)) return;
      sentReminders.add(key);
      const icon = currentMascot.id === "whale-shark"
        ? "icons/whale-shark-app-icon.png"
        : currentMascot.id === "african-wild-dog"
          ? "icons/african-wild-dog-mascot.png"
          : `icons/${currentMascot.id}.svg`;
      const body = `${currentMascot.name} says: time for ${task.name}. ${currentMascot.status} · ${currentMascot.population} estimated.`;
      sendBrowserNotification(`${currentMascot.emoji} Weekly reminder`, body, key, icon);
      showMascotToast("Task reminder", body);
    });
}

async function sendBrowserNotification(title, body, tag, customIcon = null) {
  if (!("Notification" in window) || Notification.permission !== "granted") return false;
  const defaultIcon = currentMascot.id === "whale-shark"
    ? "icons/whale-shark-app-icon.png"
    : currentMascot.id === "african-wild-dog"
      ? "icons/african-wild-dog-mascot.png"
      : `icons/${currentMascot.id}.svg`;
  const icon = customIcon || defaultIcon;
  try {
    if ("serviceWorker" in navigator) {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification(title, { body, icon, badge: icon, tag });
    } else {
      new Notification(title, { body, icon, tag });
    }
    return true;
  } catch {
    return false;
  }
}

function showMascotToast(title, body) {
  setText("toastTitle", title);
  setText("toastBody", body);
  els.mascotToast.classList.add("is-visible");
  window.setTimeout(() => els.mascotToast.classList.remove("is-visible"), 5000);
}

function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("service-worker.js").catch(() => {});
  }
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
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}
