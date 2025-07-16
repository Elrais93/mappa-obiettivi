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
    list.className = "goal-list hidden";
    list.setAttribute("data-category", category);

    h2.onclick = () => {
      list.classList.toggle("hidden");
    };

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

      const condBtn = document.createElement("button");
      condBtn.textContent = "🧩";
      condBtn.onclick = () => {
        subtasksDiv.classList.toggle("hidden");
      };

      const subtasksDiv = document.createElement("div");
      subtasksDiv.className = "subtasks hidden";

      (item.subtasks || []).forEach((sub, idx) => {
        const subDiv = document.createElement("div");
        subDiv.className = "subtask";

        const subInput = document.createElement("input");
        subInput.type = "text";
        subInput.value = sub;
        subInput.onchange = async () => {
          item.subtasks[idx] = subInput.value;
          await saveGoals(goals);
        };

        const subDel = document.createElement("button");
        subDel.textContent = "🗑️";
        subDel.onclick = async () => {
          item.subtasks.splice(idx, 1);
          await saveGoals(goals);
          init();
        };

        subDiv.appendChild(subInput);
        subDiv.appendChild(subDel);
        subtasksDiv.appendChild(subDiv);
      });

      const addSub = document.createElement("input");
      addSub.type = "text";
      addSub.placeholder = "Aggiungi sottopunto...";
      const addBtn = document.createElement("button");
      addBtn.textContent = "+";
      addBtn.onclick = async () => {
        if (!addSub.value.trim()) return;
        item.subtasks = item.subtasks || [];
        item.subtasks.push(addSub.value.trim());
        await saveGoals(goals);
        init();
      };

      subtasksDiv.appendChild(addSub);
      subtasksDiv.appendChild(addBtn);

      div.appendChild(checkbox);
      div.appendChild(input);
      div.appendChild(condBtn);
      div.appendChild(del);
      div.appendChild(subtasksDiv);
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
