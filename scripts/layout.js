// /main.js

const wrapper = document.getElementById("wrapper");
const aspect_wrapper = document.getElementById("aspect-wrapper");

function aspect_wrapper_resize() {
  const WinW = window.innerWidth;
  const WinH = window.innerHeight;
  let h = WinH;
  let w = (WinH / 16) * 9;
  if (w > WinW) {
    w = WinW;
    h = (WinW / 9) * 16;
  }
  aspect_wrapper.style.width = w + "px";
  aspect_wrapper.style.height = h + "px";
}

window.addEventListener("resize", aspect_wrapper_resize);
aspect_wrapper_resize();
