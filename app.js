(function () {
  const bench = window.BENCH;
  const models = bench.models;

  function fmt(n) {
    if (n === null || n === undefined) return "—";
    return Number(n).toFixed(2);
  }

  function bestIds(row) {
    let best = null;
    const ids = [];
    models.forEach(function (m) {
      const v = row.scores[m.id];
      if (v === null || v === undefined) return;
      const better = best !== null && (row.better === "high" ? v > best : v < best);
      if (best === null || better) {
        best = v;
        ids.length = 0;
        ids.push(m.id);
      } else if (v === best) {
        ids.push(m.id);
      }
    });
    return ids;
  }

  function modelName(id) {
    return models.filter(function (m) { return m.id === id; })[0].name;
  }

  function joinNames(ids) {
    const names = ids.map(modelName);
    if (names.length < 2) return names[0] || "";
    if (names.length === 2) return names[0] + " and " + names[1];
    return names.slice(0, -1).join(", ") + ", and " + names[names.length - 1];
  }

  function groupLabel(group) {
    if (group.unit && group.unit !== "mixed") return group.title + " · " + group.unit;
    if (group.unit === "mixed") return group.title + " · units differ by row";
    return group.title;
  }

  function rowLabel(row, group) {
    let label = row.name;
    if (group.unit === "mixed" && row.unit) label += " · " + row.unit;
    if (row.better === "high") label += " · higher is better";
    return label;
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
    cell.colSpan = models.length + 1;
    cell.textContent = groupLabel(group);
    label.appendChild(cell);
    tbody.appendChild(label);
    group.rows.forEach(function (row) {
      const tr = document.createElement("tr");
      const winners = bestIds(row);
      const name = document.createElement("td");
      name.textContent = rowLabel(row, group);
      tr.appendChild(name);
      models.forEach(function (m) {
        const td = document.createElement("td");
        td.textContent = fmt(row.scores[m.id]);
        if (m.id === "sov") td.classList.add("sov");
        if (winners.indexOf(m.id) !== -1) {
          td.classList.add("best");
          const mark = document.createElement("span");
          mark.className = "mark";
          mark.textContent = "best";
          td.appendChild(mark);
        }
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
    const winners = bestIds(row);
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
    const unit = row.unit || (item.group.unit && item.group.unit !== "mixed" ? item.group.unit : "");
    const dir = row.better === "high" ? "Higher is better." : "Lower is better.";
    let who = "No score is published in this row.";
    if (winners.length > 1) who = joinNames(winners) + " tie at the best score.";
    else if (winners.length === 1) who = joinNames(winners) + " leads this row.";
    const unitSentence = unit ? " Unit: " + unit + "." : "";
    chartNote.textContent = dir + " " + who + unitSentence + " A dash means Salesforce left that cell empty. Bars share one scale, so a small gap stays small.";
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
  function paragraph(text) {
    const p = document.createElement("p");
    p.textContent = text;
    return p;
  }
  function assess() {
    const data = new FormData(form);
    const blockers = [];
    if (data.get("timing") === "live") {
      blockers.push("You need words while someone is still talking. This model transcribes a file after the fact.");
    }
    if (data.get("lang") === "other") {
      blockers.push("The published language set is English, French, German, Spanish, Italian, Portuguese, and Dutch.");
    }
    if (data.get("speakers") === "yes") {
      blockers.push("The model card does not offer speaker labels. A diariser has to sit beside it.");
    }
    if (data.get("gpu") === "no") {
      blockers.push("The full 26.6B weights have to sit in memory. Salesforce measured serving on a 96 GB GPU.");
    }
    verdict.replaceChildren();
    if (blockers.length) {
      verdict.className = "verdict no";
      verdict.appendChild(paragraph("Not runnable for this job. " + blockers.join(" ")));
      return;
    }
    const warns = [];
    const leads = [];
    if (data.get("lang") === "six") {
      warns.push("It runs in French, German, Spanish, Italian, Portuguese, and Dutch. The multilingual mean is 4.88% word error, behind Voxtral Small at 3.39 and Nemotron at 3.87. Dutch is 7.67. That is a different result from the English index.");
    }
    if (data.get("job") === "context") {
      warns.push("On ContextASR with a fine list, SOV is at 3.67, Qwen at 1.53, and Nemotron at 1.71. The hint moves SOV from 7.03 to 3.67. The lead on that row stays with the other models.");
    } else if (data.get("job") === "entities") {
      leads.push("VoiceCodeBench is the matching row. SOV passes 76.33% of recordings and recovers 93.39% of entities. Nemotron, the other model filled in, sits at 62.67% and 89.34%. One wrong digit still fails the recording.");
    } else if (data.get("lang") === "en") {
      leads.push("On the English AA-WER index, the launch table puts SOV first among the open weights it lists, at 2.28.");
    }
    verdict.className = warns.length ? "verdict mix" : "verdict yes";
    verdict.appendChild(paragraph("Runnable. The job is a recording, in a language the card publishes, with speaker labels added elsewhere, on a GPU that can hold the full weights."));
    warns.concat(leads).forEach(function (text) {
      verdict.appendChild(paragraph(text));
    });
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
