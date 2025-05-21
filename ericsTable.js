let tbl2;

function preload() {
  // my table is comma separated value "csv"
  // and has a header specifying the columns labels
  tbl2 = loadTable(
    'https://docs.google.com/spreadsheets/d/e/2PACX-1vSwfmixeG6WSFgvk66e0CZM0m6X3OqXfkwslm6QczrbfeqDo9lWNi7_YFi3iYwmEYMmMRB6qoWsC-4F/pub?gid=0&single=true&output=csv',
    'header',
    'csv'
  );
}

function setup() {
  noCanvas();

  // Add custom CSS to control link styles
  const styleTag = createElement('style', `
    a.img-link {
      background-color: transparent !important;
      padding: 0;
      display: inline-block;
    }
    a.img-link:hover {
      background-color: transparent !important;
    }
  `);
  styleTag.parent(document.head || document.body);

  // calling the function to display the p5.Table object as an HTML table
  build_HTML_table(tbl2, "tblabc", "myTable2", "w3-table-all");
}

function draw() {
  // drawing something on the canvas so you can see it relative to the HTML table
}

function setValue(idTag, x) {
  select(idTag).value(x);
}

function buildTable(columnHeader) {
  // return an empty P5 table with headers but no data
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

  // setup the table header HTML string
  let hh = "<tr>";
  for (let c = 0; c < cc; c++) {
    hh += "<th>" + columnNames[c] + "</th>";
  }
  hh += "</tr>";

  // setup the table row HTML string
  let rh = "";
  for (let r = 0; r < rc; r++) {
    rh += "<tr>";
    for (let c = 0; c < cc; c++) {
      let cell = tbl.get(r, c);
      let colName = columnNames[c];
      let websiteURL = websiteColIndex !== -1 ? tbl.get(r, websiteColIndex) : null;
      let cellContent = formatCellContent(cell, colName, websiteURL);

      // Apply special styling for "Further notes and links"
      let cellStyle = "";
      if (colName === "Further notes and links") {
        cellStyle = ' style="max-width: 200px; word-wrap: break-word;"';
      }

      rh += "<td" + cellStyle + ">" + cellContent + "</td>";
    }
    rh += "</tr>";
  }

  // create and insert the HTML table element
  let t = createElement('table', hh + rh);
  t.addClass(classID);
  t.id(tableID);
  // t.parent(parentID); // Optional
}

function formatCellContent(text, columnName, websiteURL) {
  if (!text) return "";

  // If it's an image URL
  if (text.match(/^https?:\/\/.*\.(jpeg|jpg|gif|png|svg|webp)(\?.*)?$/i)) {
    let imgTag = '<img src="' + text + '" style="max-height: 100px; width: auto; height: auto;">';

    // If in "Images" column and website exists, wrap image in link
    if (columnName === "Images" && websiteURL && websiteURL.startsWith("http")) {
      return '<a href="' + websiteURL + '" target="_blank" class="img-link">' + imgTag + '</a>';
    } else {
      return imgTag;
    }
  }

  // If it's a regular URL, make it clickable
  let urlRegex = /(\bhttps?:\/\/[^\s<>"]+[^\s<>.,;!"')\]])/g;
  return text.replace(urlRegex, function (url) {
    return '<a href="' + url + '" target="_blank">' + url + '</a>';
  });
}
