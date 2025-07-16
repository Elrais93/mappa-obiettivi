alert("✅ Script aggiornato");

let currentFilter = "all";

async function loadGoals() {
  const res = await fetch("/api/goals");
  const data = await res.json();
  return data || {};
}

async function saveGoals(goals) {
  await fetch("/api/goals", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
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

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (currentFilter === "done" && !item.done) continue;
      if (currentFilter === "todo" && item.done) continue;

      const div = document.createElement("div");
      div.className = "goal";

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = item.done;
      checkbox.onchange = async () => {
        item.done = checkbox.checked;
        await saveGoals(goals);
      };

      const input = document.createElement("input");
      input.type = "text";
      input.value = item.text;
      input.onchange = async () => {
        item.text = input.value;
        await saveGoals(goals);
      };

      const del = document.createElement("button");
      del.textContent = "🗑️";
      del.onclick = async () => {
        goals[category].splice(i, 1);
        await saveGoals(goals);
        init();
      };

      div.appendChild(checkbox);
      div.appendChild(input);
      div.appendChild(del);
      list.appendChild(div);
    }

    const addInput = document.createElement("input");
    addInput.type = "text";
    addInput.placeholder = "Nuovo obiettivo...";
    const addBtn = document.createElement("button");
    addBtn.textContent = "+";
    addBtn.onclick = async () => {
      if (!addInput.value.trim()) return;
      goals[category].push({ text: addInput.value.trim(), done: false });
      await saveGoals(goals);
      init();
    };

    cat.appendChild(list);
    cat.appendChild(addInput);
    cat.appendChild(addBtn);
    container.appendChild(cat);
  });
}

async function renameCategory(category) {
  const newName = prompt("Nuovo nome categoria:", category);
  if (!newName || newName === category) return;
  const goals = await loadGoals();
  goals[newName] = goals[category];
  delete goals[category];
  await saveGoals(goals);
  init();
}

async function deleteCategory(category) {
  if (!confirm("Eliminare la categoria?")) return;
  const goals = await loadGoals();
  delete goals[category];
  await saveGoals(goals);
  init();
}

document.getElementById("add-category").onclick = async () => {
  const name = prompt("Nome nuova categoria:");
  if (!name) return;
  const goals = await loadGoals();
  if (goals[name]) return alert("Esiste già.");
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
