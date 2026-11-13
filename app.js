(function () {
  const bench = window.BENCH;
  const models = bench.models;

  function fmt(n) {
    if (n === null || n === undefined) return "—";
    return Number(n).toFixed(2);
  }

  function bestId(row) {
    let winner = null;
    let best = null;
    models.forEach(function (m) {
      const v = row.scores[m.id];
      if (v === null || v === undefined) return;
      if (best === null) {
        best = v;
        winner = m.id;
        return;
      }
      const better = row.better === "high" ? v > best : v < best;
      if (better) {
        best = v;
        winner = m.id;
      } else if (v === best) {
        winner = null;
      }
    });
    return winner;
  }

  const table = document.getElementById("table");
  const head = document.createElement("tr");
  head.innerHTML = "<th>Benchmark</th>" + models.map(function (m) {
    return "<th>" + m.short + "</th>";
  }).join("");
  const thead = document.createElement("thead");
  thead.appendChild(head);
  const tbody = document.createElement("tbody");
  bench.groups.forEach(function (group) {
    const label = document.createElement("tr");
    label.className = "group";
    const cell = document.createElement("td");
    cell.colSpan = 6;
    cell.textContent = group.title;
    label.appendChild(cell);
    tbody.appendChild(label);
    group.rows.forEach(function (row) {
      const tr = document.createElement("tr");
      const winner = bestId(row);
      const name = document.createElement("td");
      name.textContent = row.name;
      tr.appendChild(name);
      models.forEach(function (m) {
        const td = document.createElement("td");
        td.textContent = fmt(row.scores[m.id]);
        if (m.id === "sov") td.classList.add("sov");
        if (winner === m.id) td.classList.add("best");
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
  });
  table.appendChild(thead);
  table.appendChild(tbody);

  const select = document.getElementById("row-select");
  const chart = document.getElementById("chart");
  const chartNote = document.getElementById("chart-note");
  const options = [];
  bench.groups.forEach(function (group) {
    group.rows.forEach(function (row) {
      options.push({ group: group, row: row });
    });
  });
  options.forEach(function (item, i) {
    const opt = document.createElement("option");
    opt.value = String(i);
    opt.textContent = item.group.title + " — " + item.row.name;
    if (item.row.name === "AA-WER Index") opt.selected = true;
    select.appendChild(opt);
  });

  function draw() {
    const item = options[Number(select.value)];
    const row = item.row;
    const values = models.map(function (m) { return row.scores[m.id]; }).filter(function (v) {
      return v !== null && v !== undefined;
    });
    const max = Math.max.apply(null, values);
    const winner = bestId(row);
    chart.innerHTML = "";
    models.forEach(function (m) {
      const v = row.scores[m.id];
      const wrap = document.createElement("div");
      wrap.className = "bar-row";
      const label = document.createElement("span");
      label.textContent = m.name;
      const track = document.createElement("div");
      track.className = "track";
      const fill = document.createElement("div");
      fill.className = "fill" + (m.id === "sov" ? " sov" : "");
      fill.style.width = v === null || v === undefined || max === 0 ? "0%" : (v / max * 100) + "%";
      track.appendChild(fill);
      const num = document.createElement("b");
      num.textContent = v === null || v === undefined ? "—" : fmt(v);
      wrap.appendChild(label);
      wrap.appendChild(track);
      wrap.appendChild(num);
      chart.appendChild(wrap);
    });
    const dir = row.better === "high" ? "Higher is better." : "Lower is better.";
    const who = winner ? models.filter(function (m) { return m.id === winner; })[0].name + " leads this row." : "This row is a tie at the best score.";
    chartNote.textContent = dir + " " + who + " A dash means Salesforce left that cell empty. Bars share one scale, so a small gap stays small.";
  }
  select.addEventListener("change", draw);
  draw();

  const tabs = document.getElementById("prompt-tabs");
  const box = document.getElementById("prompt-box");
  const copy = document.getElementById("copy");
  let current = bench.prompts[0].text;
  bench.prompts.forEach(function (p, i) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "prompt-tab";
    b.textContent = p.goal;
    b.setAttribute("aria-selected", i === 0 ? "true" : "false");
    b.addEventListener("click", function () {
      current = p.text;
      box.textContent = p.text;
      Array.prototype.forEach.call(tabs.querySelectorAll("button"), function (el) {
        el.setAttribute("aria-selected", "false");
      });
      b.setAttribute("aria-selected", "true");
    });
    tabs.appendChild(b);
  });
  box.textContent = current;
  copy.addEventListener("click", function () {
    const done = function () {
      copy.textContent = "Copied";
      setTimeout(function () { copy.textContent = "Copy prompt"; }, 1200);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(current).then(done, function () {
        window.prompt("Copy this prompt", current);
      });
    } else {
      window.prompt("Copy this prompt", current);
    }
  });

  const form = document.getElementById("fit-form");
  const verdict = document.getElementById("verdict");
  function assess() {
    const data = new FormData(form);
    const reasons = [];
    if (data.get("timing") === "live") {
      reasons.push("You need words while someone is still talking. This model transcribes a file after the fact.");
    }
    if (data.get("lang") === "other") {
      reasons.push("The published language set is English, French, German, Spanish, Italian, Portuguese, and Dutch.");
    }
    if (data.get("speakers") === "yes") {
      reasons.push("The model card does not offer speaker labels. A diariser has to sit beside it.");
    }
    if (data.get("gpu") === "no") {
      reasons.push("The full 26.6B weights have to sit in memory. Salesforce measured serving on a 96 GB GPU.");
    }
    if (reasons.length === 0) {
      verdict.className = "verdict yes";
      verdict.textContent = "This is the job the model was built for: a recording in one of the seven languages, entities and wording you can steer, audio that stays on machines you run.";
    } else {
      verdict.className = "verdict no";
      verdict.textContent = reasons.join(" ");
    }
  }
  form.addEventListener("change", assess);
  assess();

  const lat = document.getElementById("latency");
  bench.latency.forEach(function (row) {
    const tr = document.createElement("tr");
    [row.band, row.plain.toFixed(2) + " s", row.draft.toFixed(2) + " s"].forEach(function (text, i) {
      const td = document.createElement("td");
      td.textContent = text;
      if (i === 2) td.classList.add("best");
      tr.appendChild(td);
    });
    lat.appendChild(tr);
  });
})();
