let filename = "";
let data = null;

function handleFile(e) {
  $("#loader-indicator").show();
  var files = e.target.files;
  var f = files[0];
  {
    var reader = new FileReader();
    filename = f.name.replace(/\.pdf/, ".csv");
    reader.onload = function (e) {
      var data = e.target.result;
      parse_content(data); //btoa(arr));
    };
    reader.readAsArrayBuffer(f);
  }
}

$("#pdf-file").on("change", handleFile);

const cleanNewLine = (str) => str.replace(/(\r\n|\n|\r)/gm, "");

const parse_content = function (content) {
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    "//cdnjs.cloudflare.com/ajax/libs/pdf.js/2.4.456/pdf.worker.min.js";
  pdfjsLib.cMapUrl = "//mozilla.github.io/pdf.js/web/cmaps/";
  pdfjsLib.cMapPacked = true;

  let loadingTask = pdfjsLib.getDocument(content);

  loadingTask.promise.then(pdf_table_extractor).then((result) => {
    const newPages = result.pageTables.map((page) =>
      page.tables
        .map((row) => row.join(","))
        .filter((row) => !/,{3,}/.test(row))
        .map(cleanNewLine)
        .join("\n")
    );
    data = newPages;
    $("#loader-indicator").hide();
    $("#download-button").show();
  });
};

const saveFile = function () {
  const blob = new Blob([data], { type: "text/csv" });
  if (window.navigator.msSaveOrOpenBlob) {
    window.navigator.msSaveBlob(blob, filename);
  } else {
    var elem = window.document.createElement("a");
    elem.href = window.URL.createObjectURL(blob);
    elem.download = filename;
    document.body.appendChild(elem);
    elem.click();
    document.body.removeChild(elem);
  }
};
