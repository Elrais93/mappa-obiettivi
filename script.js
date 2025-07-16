// script.js
const apiKey = "$2a$10$LfpSWnHyxka5Db1sdFyCZuIJvzxxSiFUNTWhFBGC0615h//REHCZy";
const binId = "687630a7bb9a9d26e899fdea";
const headers = {
  "Content-Type": "application/json",
  "X-Master-Key": apiKey
};

let currentFilter = "all";

async function loadGoals() {
  const res = await fetch(`https://api.jsonbin.io/v3/b/${binId}/latest`, { headers });
  const data = await res.json();
  return data.record || {};
}

async function saveGoals(goals) {
  await fetch(`https://api.jsonbin.io/v3/b/${binId}`, {
    method: "PUT",
    headers,
    body: JSON.stringify(goals)
  });
}

function render(goals) {
  const container = document.getElementById("goal-list");
  container.innerHTML = "";
  Object.entries(goals).forEach(([category, items]) => {
    const cat = document.createElement("div");
    cat.className = "category";
    const h2 = document.createElement("h2");
    h2.innerHTML = `<span>${category}</span> <button onclick="renameCategory('${category}')">✏️</button> <button onclick="deleteCategory('${category}')">🗑️</button>`;
    cat.appendChild(h2);

    const list = document.createElement("div");
    list.className = "goal-list";
    list.setAttribute("data-category", category);
    list.ondrop = (e) => handleDrop(e, goals);
    list.ondragover = (e) => e.preventDefault();

    items.forEach((item, idx) => {
      if (currentFilter === "done" && !item.done) return;
      if (currentFilter === "todo" && item.done) return;

      const div = document.createElement("div");
      div.className = "goal";
      div.setAttribute("draggable", true);
      div.setAttribute("data-idx", idx);

      div.ondragstart = (e) => {
        e.dataTransfer.setData("text/plain", JSON.stringify({ category, idx }));
      };

      const check = document.createElement("input");
      check.type = "checkbox";
      check.checked = item.done;
      check.onchange = async () => {
        item.done = check.checked;
        await saveGoals(goals);
      };

      const label = document.createElement("input");
      label.type = "text";
      label.value = item.text;
      label.onchange = async () => {
        item.text = label.value;
        await saveGoals(goals);
      };

      const delBtn = document.createElement("button");
      delBtn.textContent = "🗑️";
      delBtn.onclick = async () => {
        if (!confirm("Vuoi eliminare questo obiettivo?")) return;
        goals[category].splice(idx, 1);
        await saveGoals(goals);
        init();
      };

      div.appendChild(check);
      div.appendChild(label);
      div.appendChild(delBtn);
      list.appendChild(div);
    });

    cat.appendChild(list);

    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = "Nuovo obiettivo...";
    input.onkeypress = async (e) => {
      if (e.key === "Enter" && input.value.trim()) {
        goals[category].push({ text: input.value.trim(), done: false });
        await saveGoals(goals);
        init();
      }
    };

    const btn = document.createElement("button");
    btn.textContent = "+";
    btn.onclick = async () => {
      if (!input.value.trim()) return;
      goals[category].push({ text: input.value.trim(), done: false });
      await saveGoals(goals);
      init();
    };
    cat.appendChild(input);
    cat.appendChild(btn);
    container.appendChild(cat);
  });
}

function handleDrop(e, goals) {
  e.preventDefault();
  const { category, idx } = JSON.parse(e.dataTransfer.getData("text/plain"));
  const dropCategory = e.currentTarget.getAttribute("data-category");
  const dropIdx = [...e.currentTarget.children].indexOf(document.elementFromPoint(e.clientX, e.clientY).closest(".goal"));
  if (category === dropCategory && dropIdx >= 0) {
    const item = goals[category].splice(idx, 1)[0];
    goals[category].splice(dropIdx, 0, item);
    saveGoals(goals);
    init();
  }
}

async function renameCategory(category) {
  const newName = prompt("Nuovo nome per la categoria:", category);
  if (!newName || newName === category) return;
  const goals = await loadGoals();
  goals[newName] = goals[category];
  delete goals[category];
  await saveGoals(goals);
  init();
}

async function deleteCategory(category) {
  if (!confirm("Sei sicuro di voler eliminare questa categoria?")) return;
  const goals = await loadGoals();
  delete goals[category];
  await saveGoals(goals);
  init();
}

document.getElementById("add-category").onclick = async () => {
  const name = prompt("Nome nuova categoria:");
  if (!name) return;
  const goals = await loadGoals();
  if (goals[name]) return alert("Categoria già esistente.");
  goals[name] = [];
  await saveGoals(goals);
  init();
};

document.getElementById("filter-all").onclick = () => { currentFilter = "all"; init(); };
document.getElementById("filter-todo").onclick = () => { currentFilter = "todo"; init(); };
document.getElementById("filter-done").onclick = () => { currentFilter = "done"; init(); };

async function init() {
  const data = await loadGoals();
  render(data);
}

init();
