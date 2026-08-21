// scripts/layout/js

const aspect_wrapper = document.getElementById("aspect-wrapper");
const connect_room_id_view_font = document.getElementById(
  "connect-room-id-view",
);
const create_room_number_view_font = document.getElementById(
  "create-room-number-view",
);

function aspect_wrapper_resize() {
  const WinW = window.innerWidth;
  const WinH = window.innerHeight;

  let w = (WinH / 16) * 9;
  let h = WinH;
  if (w > WinW) {
    w = WinW;
    h = (WinW / 9) * 16;
  }
  aspect_wrapper.style.width = w + "px";
  aspect_wrapper.style.height = h + "px";

  // font_resize
  connect_room_id_view_font.style.fontSize = h * 0.1 + "px";
  create_room_number_view_font.style.fontSize = h * 0.07 + "px";
}

window.addEventListener("resize", aspect_wrapper_resize);
aspect_wrapper_resize();
