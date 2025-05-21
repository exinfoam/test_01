function build_HTML_table(tbl, tableID, parentID, classID) {
  let cc = tbl.getColumnCount();
  let rc = tbl.getRowCount();

  let columnNames = tbl.columns;
  let imageColIndex = columnNames.indexOf("Images");
  let websiteColIndex = columnNames.indexOf("Website");

  // Define proportional widths
  const columnWidths = {
    "Name": "8%",
    "Images": "8%",
    "Brief description": "18%",
    "Notable features": "18%",
    "Website": "10%",
    "Design practices": "7%",
    "Further notes and links": "10%",
    "Dates active": "6%",
    "Location": "5%"
  };

  // Table header
  let hh = "<tr>";
  for (let c = 0; c < cc; c++) {
    let colName = columnNames[c];
    let width = columnWidths[colName] || "auto";
    hh += `<th style="width:${width};">${colName}</th>`;
  }
  hh += "</tr>";

  // Table body
  let rh = "";
  for (let r = 0; r < rc; r++) {
    rh += "<tr>";
    for (let c = 0; c < cc; c++) {
      let cell = tbl.get(r, c);
      let colName = columnNames[c];
      let websiteURL = websiteColIndex !== -1 ? tbl.get(r, websiteColIndex) : null;
      let cellContent = formatCellContent(cell, colName, websiteURL);
      let width = columnWidths[colName] || "auto";

      let style = `style="width:${width};`;
      if (colName === "Further notes and links") {
        style += " max-width:200px; word-wrap:break-word;";
      }
      style += `"`;

      rh += `<td ${style}>${cellContent}</td>`;
    }
    rh += "</tr>";
  }

  // Create and insert the HTML table element
  let t = createElement('table', hh + rh);
  t.addClass(classID);
  t.id(tableID);
  // t.parent(parentID); // Uncomment if needed
}
