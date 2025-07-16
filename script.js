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
    const cat = document.createElement("div");
    cat.className = "category";
    const h2 = document.createElement("h2");
    h2.innerHTML = category + ' <button onclick="deleteCategory(\'' + category + '\')">🗑️</button>';
    cat.appendChild(h2);
    items.forEach((item, idx) => {
      const div = document.createElement("div");
      div.className = "goal";
      const check = document.createElement("input");
      check.type = "checkbox";
      check.checked = item.done;
      check.onchange = async () => {
        item.done = check.checked;
        await saveGoals(goals);
      };
      const label = document.createElement("span");
      label.textContent = item.text;
      div.appendChild(check);
      div.appendChild(label);
      cat.appendChild(div);
    });
    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = "Nuovo obiettivo...";
    const btn = document.createElement("button");
    btn.textContent = "+";
    btn.onclick = async () => {
      if (!input.value.trim()) return;
      goals[category].push({ text: input.value.trim(), done: false });
      await saveGoals(goals);
      init(); // reload
    };
    cat.appendChild(input);
    cat.appendChild(btn);
    container.appendChild(cat);
  });
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

async function init() {
  const data = await loadGoals();
  render(data);
}

init();
