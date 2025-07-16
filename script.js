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
  for (const category in goals) {
    const section = document.createElement("div");
    section.className = "category";

    const title = document.createElement("h2");
    title.textContent = category;
    section.appendChild(title);

    const list = document.createElement("ul");

    goals[category].forEach((goal, i) => {
      const li = document.createElement("li");
      li.textContent = goal.text;
      const del = document.createElement("button");
      del.textContent = "🗑️";
      del.onclick = async () => {
        const updated = await loadGoals();
        updated[category].splice(i, 1);
        await saveGoals(updated);
        init();
      };
      li.appendChild(del);
      list.appendChild(li);
    });

    section.appendChild(list);
    container.appendChild(section);
  }
}

async function init() {
  const data = await loadGoals();
  render(data);
}

init();
