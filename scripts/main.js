// scripts/main.js

/* const DOM  */
const menu = document.getElementById("menu");

const menu_title_view = document.getElementById("menu-title-view");
const start_btn = document.getElementById("start-btn");
const start_btn_img = document.getElementById("start-btn-img");

const main_room = document.getElementById("main-room");

const main_room_connect_btn = document.getElementById("main-room-connect-btn");
const main_room_create_btn = document.getElementById("main-room-create-btn");

// id connect menu
const main_room_connect_menu = document.getElementById(
  "main-room-connect-menu",
);
const connect_room_minus_btn = document.getElementById(
  "connect-room-minus-btn",
);
const connect_room_id_view = document.getElementById("connect-room-id-view");
const connect_room_plus_btn = document.getElementById("connect-room-plus-btn");
const connect_room_btn = document.getElementById("connect-room-btn");

const connect_menu_stand = document.getElementById("connect-menu-stand");

const connect_error_menu = document.getElementById("connect-error-menu");
const back_connect_btn = document.getElementById("back-connect-btn");

const connect_menu_main = document.getElementById("connect-menu-main");

// id create room
const main_room_create_menu = document.getElementById("main-room-create-menu");
const create_room_btn = document.getElementById("create-room-btn");

const main_create_room = document.getElementById("main-create-room");
const main_create_room_stand = document.getElementById(
  "main-create-room-stand",
);
const main_create_room_main = document.getElementById("main-create-room-main");
const create_room_number_view = document.getElementById(
  "create-room-number-view",
);
const match_member_view = document.getElementById("match-member-view");
const marubatu_start_btn = document.getElementById("marubatu-start-btn");
const marubatu_start_img = document.getElementById("marubatu-start-img");

// id game
const game_main = document.getElementById("game");
const turn_view = document.getElementById("turn-view");
const turn_enter_btn = document.getElementById("turn-enter-btn");

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const game_set = document.getElementById("game-set");
const game_result = document.getElementById("game-result");

/* variables  */
let Socket = null;

let connect_room_number = 0;
connect_room_id_view.textContent = connect_room_number;

let marubatu_board = [
  [0, 0, 0],
  [0, 0, 0],
  [0, 0, 0],
];

const img = new Image();
img.src = "./images/atlas.svg";
img.onload = () => {
  atlas_draw();
};

let my_turn = false;
let my_host = false;

/* function   */
function atlas_draw() {
  ctx.clearRect(0, 0, canvas.clientWidth, canvas.height);

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      ctx.drawImage(
        img,
        marubatu_board[i][j] * 100,
        0,
        100,
        100,
        j * 100,
        i * 100,
        100,
        100,
      );
    }
  }
}
function turn_start(s) {
  canvas.addEventListener("pointerdown", (e) => {
    if (my_turn == false) return;
    const rect = canvas.getBoundingClientRect();

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    const cellW = canvas.width / 3;
    const cellH = canvas.width / 3;

    const cx = Math.floor(x / cellW);
    const cy = Math.floor(y / cellH);

    if (marubatu_board[cy][cx] > 0) return;
    if (my_host) marubatu_board[cy][cx] = 3;
    if (!my_host) marubatu_board[cy][cx] = 1;
    my_turn = false;
    atlas_draw();
    turn_view.src = "./images/you-not-turn.svg";
    sendToMessage(s, {
      type: "marubatu_next_turn",
      room_number: connect_room_number,
      board: marubatu_board,
    });
  });
}

function connect_server() {
  start_btn_img.src = "./images/connect-server.svg";
  Socket = new WebSocket("wss://server-game-sample-server.onrender.com");
  // Socket = new WebSocket("ws://localhost:3000");

  Socket.onopen = () => {
    console.log("接続成功！");
    switch_room("main_room");
  };
  Socket.onmessage = (e) => {
    const data = JSON.parse(e.data);
    switch (data.type) {
      case "enable_marubatu_create_room":
        switch_room("main_create_room_main");
        connect_room_number = data.room_number;
        create_room_number_view.textContent = "部屋番号は:" + data.room_number;
        console.log(data.type);
        console.log("room_number: ", data.room_number);
        break;
      case "marubatu_match_member":
        marubatu_start_img.src = "./images/start-game.svg";
        create_room_number_view.style.display = "none";
        match_member_view.style.display = "block";
        marubatu_start_btn.addEventListener("pointerdown", () => {
          sendToMessage(Socket, {
            type: "marubatu_game_start",
          });
        });
        console.log(data.type);
        break;
      case "enable_marubatu_connect_room":
        switch_room("connect_menu_main");
        console.log(data.type);
        break;
      case "enable_marubatu_game_start_host":
        turn_view.src = "./images/you-turn.svg";
        atlas_draw();
        my_host = true;
        switch_room("game");
        console.log(data.type);
        my_turn = true;
        turn_start(Socket);
        break;
      case "enable_marubatu_game_start":
        atlas_draw();
        turn_view.src = "./images/you-not-turn.svg";
        my_turn = false;
        my_host = false;
        switch_room("game");
        console.log(data.type);
        break;
      case "change_turn":
        my_turn = true;
        marubatu_board = data.board;
        atlas_draw();
        turn_view.src = "./images/you-turn.svg";
        console.log(data.type);
        turn_start(Socket);
        break;
      case "you_win":
        marubatu_board = data.board;
        atlas_draw();
        turn_view.src = "./images/game-set.svg";
        game_set.style.display = "flex";
        game_result.src = "./images/you-win.svg";
        console.log(data.type);
        break;
      case "you_lose":
        marubatu_board = data.board;
        atlas_draw();
        turn_view.src = "./images/game-set.svg";
        game_set.style.display = "flex";
        game_result.src = "./images/you-lose.svg";
        console.log(data.type);
        break;
      case "marubatu_game_draw":
        marubatu_board = data.board;
        atlas_draw();
        turn_view.src = "./images/game-set.svg";
        game_set.style.display = "flex";
        game_result.src = "./images/marubatu_game_draw.svg";
        console.log(data.type);
        break;
      case "error_connect":
        switch_room("connect_error_menu");
        console.log(data.type);
        break;
      case "error_room_full":
        switch_room("connect_error_menu");
        console.log(data.type);
        break;
      case "number_size_error":
        console.log(data.type);
        break;
      case "game_type_error":
        console.log(data.type);
        break;
      case "member_error":
        console.log(data.type);
        break;
      default:
        console.log("any_error");
        break;
    }
  };
  create_room_btn.addEventListener("pointerdown", () => {
    switch_room("main_create_room");
    sendToMessage(Socket, {
      type: "marubatu_create_room_request",
    });
  });
  connect_room_btn.addEventListener("pointerdown", () => {
    switch_room("connect_menu_stand");
    sendToMessage(Socket, {
      type: "marubatu_connect_room_request",
      connect_id: connect_room_number,
    });
  });
}

function sendToMessage(socket, data) {
  socket.send(JSON.stringify(data));
}

/* Button     */
start_btn.addEventListener("pointerdown", connect_server);

main_room_connect_btn.addEventListener("pointerdown", () => {
  switch_room("main_room_connect_menu");
});
connect_room_minus_btn.addEventListener("pointerdown", () => {
  if (connect_room_number > 0) {
    connect_room_number--;
    connect_room_id_view.textContent = connect_room_number;
  }
});
connect_room_plus_btn.addEventListener("pointerdown", () => {
  if (connect_room_number < 19) {
    connect_room_number++;
    connect_room_id_view.textContent = connect_room_number;
  }
});
back_connect_btn.addEventListener("pointerdown", () => {
  switch_room("main_room_connect_menu");
});
main_room_create_btn.addEventListener("pointerdown", () => {
  switch_room("main_room_create_menu");
});

/* UI function */
function switch_room(room_name) {
  switch (room_name) {
    case "menu_title_view":
      menu_title_view.style.display = "flex";
      main_create_room.style.display = "none";
      main_room.style.display = "none";
      break;
    case "main_room":
      menu_title_view.style.display = "none";
      main_create_room.style.display = "none";
      main_room.style.display = "flex";
      break;
    case "main_room_connect_menu":
      main_room.style.display = "flex";
      main_room_connect_menu.style.display = "flex";
      main_room_create_menu.style.display = "none";
      main_room_connect_btn.style.borderBottom = "3px solid #000000";
      main_room_create_btn.style.borderBottom = "none";
      connect_menu_stand.style.display = "none";
      connect_error_menu.style.display = "none";
      break;
    case "connect_menu_stand":
      connect_menu_stand.style.display = "flex";
      main_room.style.display = "none";
      break;
    case "connect_error_menu":
      connect_error_menu.style.display = "flex";
      connect_menu_stand.style.display = "none";
      connect_menu_main.style.display = "none";
      break;
    case "connect_menu_main":
      connect_menu_stand.style.display = "none";
      connect_menu_main.style.display = "flex";
      break;
    case "main_room_create_menu":
      main_room.style.display = "flex";
      main_room_create_menu.style.display = "flex";
      main_room_connect_menu.style.display = "none";
      main_room_create_btn.style.borderBottom = "3px solid #000000";
      main_room_connect_btn.style.borderBottom = "none";
      connect_menu_stand.style.display = "none";
      break;
    case "main_create_room":
      menu_title_view.style.display = "none";
      main_create_room.style.display = "flex";
      main_room.style.display = "none";
      break;
    case "main_create_room_stand":
      main_create_room_stand.style.display = "flex";
      main_create_room_main.style.display = "none";
      break;
    case "main_create_room_main":
      main_create_room_stand.style.display = "none";
      main_create_room_main.style.display = "flex";
      break;
    case "game":
      game_main.style.display = "flex";
      menu.style.display = "none";
      connect_menu_main.style.display = "none";
      main_create_room_main.style.display = "none";
      break;
  }
}
