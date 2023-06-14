const onWebPage = document.body !== undefined;

//if (!onWebPage) return;

const linkElems = document.querySelectorAll(
  "a, button, input, select, textarea, summary, [role='button'], [tabindex='0']"
);
const container = null;

const overview = document.createElement("div");
overview.style = [
  "position: fixed",
  "top: 0px",
  "left: 0px",
  "background-color: white",
  "border-bottom: 2px solid black",
  "border-right: 2px solid black",
  "color: black",
  "font: 12px sans-serif",
  "padding: 3px",
  "height: 15px",
  "line-height: 15px",
  "z-index: 2147483647",
  "box-sizing: content-box",
  "",
].join(" !important;");

document.addEventListener("keydown", (e) => {
  if (e.code === "KeyH") {
    blobList.loadBlobs();
    blobList.blobsVisible(true);
  }
});

const config = {
  characters: ";asdfjklri",
};

function createKey(index) {
  let keyString = "";
  let base = config.characters.length; // TODO: make this not static
  if (index === 0) return config.characters[0];
  while (index > 0) {
    keyString += config.characters[index % base]; // Explain what this does in a comment
    index = Math.floor(index / base);
  }
  return keyString;
}

function getElementPosition(element) {
  let currentTop = 0;
  let currentLeft = 0;

  do {
    currentTop += element.offsetTop;
    currentLeft += element.offsetLeft;
  } while (element = element.offsetParent);
  return { top: currentTop, left: currentLeft };
}

const blobList = {
  blobs: {},
  container: null,
  visible: false,
  init: function () {
    console.log("initialized");
    blobList.createContainer();
  },
  createContainer: function () {
    const container = document.createElement("div");
    container.style = [
      "pointer-events: none",
      "display: none",
      "position: absolute",
      "top: 0px",
      "left: 0px",
      "z-index: 100",
      "box-sizing: content-box",
      "",
    ].join(" !important;");
    document.body.appendChild(container);
    blobList.container = container;
  },
  loadBlobs: function () {
    const linkElements = document.querySelectorAll(
      "a, button, input, select, textarea, summary, [role='button'], [tabindex='0']"
    );

    // clear container content
    this.container.innerText = "";

    this.blobs = {};

    let blobIterator = 0;
    function addBlob(linkElement) {
      if (
        linkElement === undefined ||
        linkElement.style.display === "none" ||
        linkElement.style.visibility === "hidden"
      )
        return;

      const position = getElementPosition(linkElement);

      if (position.top === 0 || position.left === 0) return; // elements that probably aren't visible aren't needed
      if (position.top < (window.scrollY - 100)) return; // elements above scroll position aren't needed
      if (position.top - 100 > (window.scrollY + window.innerHeight)) return; // elements below scroll position aren't needed

      let key = createKey(blobIterator);
      blobIterator++;

      const singleBlob = document.createElement("div");
      singleBlob.innerText = key.toUpperCase();

      singleBlob.style = [
        "position: absolute",
        "background-color: white",
        "border: 1px solid black",
        "border-radius: 10px",
        "padding-left: 5px",
        "padding-right: 5px",
        "color: black",
        "font: 12px sans-serif",
        "top: "+position.top+"px",
        "left: "+position.left+"px",
        "line-height: 15px",
        "font-size: 12px",
        "font-weight: bold",
        "",
      ].join(" !important;");
      console.log(key + ": " + linkElement);
      blobList.container.appendChild(singleBlob);
    }
    linkElements.forEach((linkElement) => addBlob(linkElement));
  },
  blobsVisible: function (status) {
    blobList.visible = status;
    if (status) {
      blobList.container.style.display = "block";
    } else {
      blobList.container.style.display = "none";
    }
  },
};
blobList.init();

blobList.loadBlobs();

console.log("Mouseless is running!");
