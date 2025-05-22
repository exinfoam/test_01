let tbl2;

function preload() {
  tbl2 = loadTable(
    'https://docs.google.com/spreadsheets/d/e/2PACX-1vSwfmixeG6WSFgvk66e0CZM0m6X3OqXfkwslm6QczrbfeqDo9lWNi7_YFi3iYwmEYMmMRB6qoWsC-4F/pub?gid=0&single=true&output=csv',
    'header',
    'csv'
  );
}

function setup() {
  noCanvas();

  // Add custom CSS for styling
  const styleTag = createElement('style', `
    a.img-link {
      background-color: transparent !important;
      padding: 0;
      display: inline-block;
    }
    a.img-link:hover {
      background-color: transparent !important;
    }
    .tag {
      background-color: #d1e8ff;
      color: #004080;
      padding: 4px 8px;
      margin: 3px;
      border-radius: 4px;
      font-size: 0.85em;
      cursor: pointer;
      display: inline-block;
      transition: background-color 0.2s;
    }
    .tag:hover {
      background-color: #a8cfff;
    }
    #tagCloud {
      margin-bottom: 20px;
    }
  `);
  styleTag.parent(document.head || document.body);

  // Container for tag cloud and table
  let container = createDiv();
  container.id('myTable2');

  displayTagCloud(tbl2); // new
  build_HTML_table(tbl2, "tblabc", "myTable2", "w3-table-all");
}

function draw() {}

function setValue(idTag, x) {
  select(idTag).value(x);
}

function buildTable(columnHeader) {
  let t = new p5.Table();
  for (let c = 0; c < columnHeader.length; c++) {
    t.addColumn(columnHeader[c]);
  }
  return t;
}

function build_HTML_table(tbl, tableID, parentID, classID) {
  let cc = tbl.getColumnCount();
  let rc = tbl.getRowCount();

  let columnNames = tbl.columns;
  let imageColIndex = columnNames.indexOf("Images");
  let websiteColIndex = columnNames.indexOf("Website");

  let hh = "<tr>";
  for (let c = 0; c < cc; c++) {
    hh += "<th>" + columnNames[c] + "</th>";
  }
  hh += "</tr>";

  let rh = "";
  for (let r = 0; r < rc; r++) {
    rh += "<tr>";
    for (let c = 0; c < cc; c++) {
      let cell = tbl.get(r, c);
      let colName = columnNames[c];
      let websiteURL = websiteColIndex !== -1 ? tbl.get(r, websiteColIndex) : null;
      let cellContent = formatCellContent(cell, colName, websiteURL);

      let cellStyle = "";
      if (colName === "Further notes and links") {
        cellStyle = ' style="max-width: 200px; word-wrap: break-word;"';
      }

      rh += "<td" + cellStyle + ">" + cellContent + "</td>";
    }
    rh += "</tr>";
  }

  let t = createElement('table', hh + rh);
  t.addClass(classID);
  t.id(tableID);
  if (parentID) {
    select('#' + parentID)?.child(t);
  }
}

function formatCellContent(text, columnName, websiteURL) {
  if (!text) return "";

  // Handle image URLs
  if (text.match(/^https?:\/\/.*\.(jpeg|jpg|gif|png|svg|webp)(\?.*)?$/i)) {
    let imgTag = '<div style="text-align: center;"><img src="' + text + '" style="max-height: 100px; width: auto; height: auto; display: inline-block;"></div>';
    if (columnName === "Images" && websiteURL && websiteURL.startsWith("http")) {
      return '<a href="' + websiteURL + '" target="_blank" class="img-link">' + imgTag + '</a>';
    } else {
      return imgTag;
    }
  }

  // Special behavior for "Design practices" column – clickable tags
  if (columnName === "Design practices") {
    return text.split(',').map(tag => {
      let cleanTag = tag.trim();
      return `<span class="tag" onclick="filterByTag('${cleanTag}')">${cleanTag}</span>`;
    }).join(" ");
  }

  // Convert line breaks (\n) to <br>
  let safeText = text.replace(/\n/g, "<br>");

  // Make URLs clickable
  let urlRegex = /(\bhttps?:\/\/[^\s<>"]+[^\s<>.,;!"')\]])/g;
  safeText = safeText.replace(urlRegex, function (url) {
    return '<a href="' + url + '" target="_blank">' + url + '</a>';
  });

  return safeText;
}

function filterByTag(tag) {
  let filteredTable = new p5.Table();
  let cc = tbl2.getColumnCount();
  let rc = tbl2.getRowCount();

  for (let c = 0; c < cc; c++) {
    filteredTable.addColumn(tbl2.columns[c]);
  }

  let designIndex = tbl2.columns.indexOf("Design practices");

  for (let r = 0; r < rc; r++) {
    let cell = tbl2.get(r, designIndex);
    if (cell && cell.includes(tag)) {
      let newRow = filteredTable.addRow();
      for (let c = 0; c < cc; c++) {
        newRow.setString(c, tbl2.get(r, c));
      }
    }
  }

  select('#tblabc').remove();
  build_HTML_table(filteredTable, "tblabc", "myTable2", "w3-table-all");

  let existingReset = select('#resetButton');
  if (existingReset) existingReset.remove();

  let resetBtn = createButton('Reset Filter');
  resetBtn.id('resetButton');
  resetBtn.parent('myTable2');
  resetBtn.mousePressed(() => {
    select('#tblabc').remove();
    resetBtn.remove();
    build_HTML_table(tbl2, "tblabc", "myTable2", "w3-table-all");
  });
}

function displayTagCloud(tbl) {
  let tagSet = new Set();
  let colIndex = tbl.columns.indexOf("Design practices");

  for (let r = 0; r < tbl.getRowCount(); r++) {
    let cell = tbl.get(r, colIndex);
    if (cell) {
      let tags = cell.split(',').map(t => t.trim());
      tags.forEach(tag => tagSet.add(tag));
    }
  }

  let sortedTags = Array.from(tagSet).sort((a, b) => a.localeCompare(b));
  let tagCloud = createDiv('');
  tagCloud.id('tagCloud');
  tagCloud.parent('myTable2');

  sortedTags.forEach(tag => {
    let tagEl = createSpan(tag);
    tagEl.class('tag');
    tagEl.mousePressed(() => filterByTag(tag));
    tagCloud.child(tagEl);
  });
}
