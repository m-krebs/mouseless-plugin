const onWebPage = document.body !== undefined;

if (!onWebPage) return;

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
container.appendChild(overview);
overview = overview;


document.onkeypress = (e) => {
  const currentDiv = document.getElementById("root");
  e.code === "KeyH" ? console.log("Gack") : console.log(e.key);
  if (e.code === "KeyH") {
    console.log("Why not?");
    let newDiv = document.createElement("div");
    newDiv.style.backgroundColor = "red";
    const newContent = document.createTextNode("Hi there and greetings!");
    newDiv.appendChild(newContent);
    document.body.insertBefore(newDiv, currentDiv);
  }
};
