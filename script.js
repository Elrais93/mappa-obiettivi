const apiKey = "$2a$10$LfpSWnHyxka5Db1sdFyCZuIJvzxxSiFUNTWhFBGC0615h//REHCZy";
const binId = "687630a7bb9a9d26e899fdea";
const headers = {
  "Content-Type": "application/json",
  "X-Master-Key": apiKey
};

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
    const section = document.createElement("div");
    section.className = "category";

    const title = document.createElement("h2");
    title.innerHTML = `${category} <button onclick="deleteCategory('${category}')">🗑️</button>`;
    section.appendChild(title);

    const list = document.createElement("ul");

    items.forEach((goal, index) => {
      const li = document.createElement("li");
      li.textContent = goal.text;

      const del = document.createElement("button");
      del.textContent = "🗑️";
      del.onclick = async () => {
        const updated = await loadGoals();
        updated[category].splice(index, 1);
        await saveGoals(updated);
        init();
      };

      li.appendChild(del);
      list.appendChild(li);
    });

    const input = document.createElement("input");
    input.placeholder = "Aggiungi nuovo obiettivo";
    const btn = document.createElement("button");
    btn.textContent = "+";
    btn.onclick = async () => {
      if (!input.value.trim()) return;
      goals[category].push({ text: input.value.trim(), done: false });
      await saveGoals(goals);
      init();
    };

    section.appendChild(list);
    section.appendChild(input);
    section.appendChild(btn);
    container.appendChild(section);
  });
}

async function deleteCategory(category) {
  if (!confirm(`Vuoi eliminare la categoria "${category}"?`)) return;
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

async function init() {
  const data = await loadGoals();
  render(data);
}

init();
