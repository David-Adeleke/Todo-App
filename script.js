const form = document.getElementById("task-form");
const input = document.getElementById("task-input");
const list = document.getElementById("task-list");
const empty = document.getElementById("empty");
const summary = document.getElementById("summary");
const filterButtons = document.querySelectorAll(".filter");

const STORAGE_KEY = "todo-tasks";

let tasks = load();
let filter = "all";
let editingId = null;

function load() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch {
    /* storage unavailable; app still works for this session */
  }
}

function addTask(text) {
  tasks.unshift({ id: Date.now().toString(), text, done: false });
  save();
  render();
}

function toggleTask(id) {
  const task = tasks.find((t) => t.id === id);
  if (task) task.done = !task.done;
  save();
  render();
}

function deleteTask(id) {
  tasks = tasks.filter((t) => t.id !== id);
  save();
  render();
}

function updateTask(id, text) {
  const task = tasks.find((t) => t.id === id);
  if (task && text.trim()) task.text = text.trim();
  editingId = null;
  save();
  render();
}

function visibleTasks() {
  if (filter === "active") return tasks.filter((t) => !t.done);
  if (filter === "done") return tasks.filter((t) => t.done);
  return tasks;
}

function createTaskItem(task) {
  const li = document.createElement("li");
  li.className = "task" + (task.done ? " done" : "");

  const check = document.createElement("button");
  check.className = "check";
  check.type = "button";
  check.textContent = "✓";
  check.setAttribute("aria-label", task.done ? "Mark as not done" : "Mark as done");
  check.setAttribute("aria-pressed", task.done);
  check.addEventListener("click", () => toggleTask(task.id));
  li.appendChild(check);

  if (editingId === task.id) {
    const editInput = document.createElement("input");
    editInput.className = "edit-input";
    editInput.value = task.text;
    editInput.setAttribute("aria-label", "Edit task");
    editInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") updateTask(task.id, editInput.value);
      if (e.key === "Escape") { editingId = null; render(); }
    });
    li.appendChild(editInput);

    const actions = document.createElement("div");
    actions.className = "actions";
    actions.append(
      makeAction("Save", "save", () => updateTask(task.id, editInput.value)),
      makeAction("Cancel", "cancel", () => { editingId = null; render(); })
    );
    li.appendChild(actions);
    setTimeout(() => editInput.focus(), 0);
  } else {
    const text = document.createElement("span");
    text.className = "task-text";
    text.textContent = task.text;
    li.appendChild(text);

    const actions = document.createElement("div");
    actions.className = "actions";
    actions.append(
      makeAction("Edit", "edit", () => { editingId = task.id; render(); }),
      makeAction("Delete", "delete", () => deleteTask(task.id))
    );
    li.appendChild(actions);
  }

  return li;
}

function makeAction(label, type, handler) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "action " + type;
  btn.textContent = label;
  btn.addEventListener("click", handler);
  return btn;
}

function render() {
  list.innerHTML = "";
  const items = visibleTasks();
  items.forEach((task) => list.appendChild(createTaskItem(task)));

  empty.hidden = items.length > 0;
  if (tasks.length > 0 && items.length === 0) {
    empty.textContent = filter === "done" ? "No completed tasks yet." : "All caught up.";
  } else {
    empty.textContent = "Nothing here yet. Add your first task above.";
  }

  const doneCount = tasks.filter((t) => t.done).length;
  summary.textContent = tasks.length
    ? `${doneCount} of ${tasks.length} completed`
    : "No tasks yet";
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  addTask(text);
  input.value = "";
  input.focus();
});

filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    filter = btn.dataset.filter;
    filterButtons.forEach((b) => b.classList.toggle("active", b === btn));
    render();
  });
});

render();