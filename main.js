//main.js

//game-menu
const game_menu = document.getElementById("game-menu");
const logdayo = document.getElementById("game-title-img");
const game_menu_main = document.getElementById("game-menu-main");
const game_menu_select = document.getElementById("game-menu-select");
const game_title = document.getElementById("game-title");
const start_btn = document.getElementById("start_btn"); 

const game_play = document.getElementById("game-play");

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let game_canvas = [
  [0, 0, 0],
  [0, 0, 0],
  [0, 0, 0]
];

const img = new Image();
img.src = "./images/atlas.webp";

function atlas_draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      switch (game_canvas[i][j]) {
        case 0:
          ctx.drawImage(img, 0, 0, 64, 64, j * 64, i * 64, 64, 64);
          break;

        case 1:
          break;

        case 2:
          break;

        default:
          break;
      }
    }
  }

}

let socket = null;
let myid = null;

let conect_room_number = 1;
let room_id = null;

let game_start_ok = false;

let game = false;


document.getElementById("start_btn").addEventListener("click", () => {

  document.getElementById("start_btn").textContent = "サーバーに接続中...(これには時間がかかる場合があります）";
  socket = new WebSocket("wss://server-game-sample-server.onrender.com");

  socket.onopen = () => {
    game_title.textContent = "接続成功！";
    game_menu_main.style.display = "none";
    game_menu_select.style.display = "block";
  }
  socket.onerror = (e) => {
    logdayo.textContent = "エラー: " + e;
    start_btn.textContent = "スタート";
  }
  socket.onclose = () => {
    logdayo.textContent = "接続が切断されました";
    start_btn.textContent = "スタート";
  }

  /*---server I/O ---*/
  socket.onmessage = (e) => {
    const data = JSON.parse(e.data);

    switch (data.type) {
      case "welcome":
        myid = data.id;
        game_title.textContent = "あなたのIDは: " + myid;
        break;

      case "next_room":
        myid = data.id;
        room_id = data.room_id;
        document.getElementById("room-id-view").textContent = "作成した部屋番号: " + room_id;
        game_title.textContent = "対戦相手の接続を待っています...";
        break;

      case "match_conect":
        game_title.textContent = "対戦相手が接続されました";
        document.getElementById("game-start").textContent = "ゲームを開始";
        game_start_ok = true;
        break;

      case "conect_ok":
        game_title.textContent = "接続しました！";
        document.getElementById("conect-message").style.display = "flex block";
        break;

      case "conect_error":
        game_title.textContent = "その部屋は満員です";
        document.getElementById("conect-room-view").style.display = "none";
        document.getElementById("create-room-conect").style.display = "block";
        break;

      case "conect_error_room_null":
        game_title.textContent = "その部屋はありません";
        document.getElementById("conect-room-view").style.display = "none";
        document.getElementById("create-room-conect").style.display = "block";
        break;

      case "game_start_found":
        document.getElementById("conect-room-view").style.display = "none";
        document.getElementById("create-room-menu").style.display = "none";
        game_play.style.display = "block";
        game = true;
        game_title.textContent = "手番順:" + data.pnumber;
        if (data.pnumber != "1") document.getElementById("enter_btn").textContent = "相手の手番です";
        img.onload = () => {
          atlas_draw();
        };
        atlas_draw();
        break

      default:
        game_title.textContent = "不明なエラーが発生しました";
        break;
    }
  }

  /*---Button start ---*/
  document.getElementById("create-room").addEventListener("click", () => {
    document.getElementById("room-menu").style.display = "none";
    document.getElementById("create-room-menu").style.display = "block";

    game_title.textContent = "部屋を作成中...";
    socket.send(JSON.stringify({
      type: "create_room",
      id: myid
    }));

    document.getElementById("game-start").addEventListener("click", () => {
      if (game_start_ok === true) {
        socket.send(JSON.stringify({
          type: "game_start",
          room_number: room_id,
          id: myid
        }));
      }
    });
  });

  document.getElementById("conect-room").addEventListener("click", () => {
    const room_conect_view = document.getElementById("room-conect-view");

    game_title.textContent = "部屋番号を選択";
    document.getElementById("room-menu").style.display = "none";
    document.getElementById("create-room-conect").style.display = "block";

    document.getElementById("room-number-add").addEventListener("click", () => {
      if (conect_room_number < 9) conect_room_number += 1;
      room_conect_view.textContent = "部屋番号: " + conect_room_number;
    });
    document.getElementById("room-number-sub").addEventListener("click", () => {
      if (conect_room_number > 1) conect_room_number -= 1;
      room_conect_view.textContent = "部屋番号: " + conect_room_number;
    });

    document.getElementById("room-number-enter").addEventListener("click", () => {
      document.getElementById("create-room-conect").style.display = "none";
      document.getElementById("conect-room-view").style.display = "block";
      game_title.textContent = "接続...";
      socket.send(JSON.stringify({
        type: "conect_room",
        conect_room_number: conect_room_number,
        id: myid
      }));
    });
  });

  document.getElementById("enter_btn").addEventListener("click", () => {
    
  });
  /*---Button end---*/

  
});