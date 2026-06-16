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
          ctx.drawImage(img, 192, 0, 64, 64, j * 64, i * 64, 64, 64);
          break;

        case 2:
          ctx.drawImage(img, 64, 0, 64, 64, j * 64, i * 64, 64, 64);
          break;

        case 3:
          ctx.drawImage(img, 256, 0, 64, 64, j * 64, i * 64, 64, 64);
          break;

        case 4:
          ctx.drawImage(img, 128, 0, 64, 64, j * 64, i * 64, 64, 64);
          break;

        default:
          break;
      }
    }
  }

}

function highlight_clear() {
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (game_canvas[i][j] > 2) game_canvas[i][j] = 0;
    }
  }
}

let socket = null;
let myid = null;

let conect_room_number = 1;
let room_id = null;

let game_start_ok = false;

let game = false;

let pnumber = 0;
let replace = "no";

let win_draw = false;
let win = false;
let win_p = null;
let lose_p = null;

document.getElementById("start_btn").addEventListener("pointerdown", () => {

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
        game_title.textContent = "まるばつげーむ";
        myid = data.id;
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
        room_id = conect_room_number;
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
        pnumber = data.pnumber;
        replace = data.replace;
        if (replace == "ok") game_title.textContent = "あなたの手番です";
        if (replace == "no") {
          game_title.textContent = "相手の手番です";
          document.getElementById("enter_btn").textContent = "相手の手番です";
        }
        img.onload = () => {
          atlas_draw();
        };
        atlas_draw();
        break;
      
      case "change_replace":
        game_canvas = data.game_canvas;
        replace = "ok";
        document.getElementById("enter_btn").textContent = "決定";
        game_title.textContent = "あなたの手番です";
        atlas_draw();
        break;

      case "you_win":
        atlas_draw();
        game_title.textContent = "";
        document.getElementById("enter_btn").style.display = "none";
        document.getElementById("game-set-message").textContent = "勝利";
        document.getElementById("game-end").style.display = "block";
        break;
      
      case "you_lose":
        atlas_draw();
        game_title.textContent = "";
        document.getElementById("enter_btn").style.display = "none";
        document.getElementById("game-set-message").textContent = "敗北";
        document.getElementById("game-end").style.display = "block";
        break;

      case "game_set_draw":
        atlas_draw();
        game_title.textContent = "";
        document.getElementById("enter_btn").style.display = "none";
        document.getElementById("game-set-message").textContent = "引き分け";
        document.getElementById("game-end").style.display = "block";
        break;

      default:
        game_title.textContent = "不明なエラーが発生しました";
        break;
    }
  }

  /*---Button start ---*/
  document.getElementById("create-room").addEventListener("pointerdown", () => {
    document.getElementById("room-menu").style.display = "none";
    document.getElementById("create-room-menu").style.display = "block";

    game_title.textContent = "部屋を作成中...";
    socket.send(JSON.stringify({
      type: "create_room",
      id: myid
    }));

    document.getElementById("game-start").addEventListener("pointerdown", () => {
      if (game_start_ok === true) {
        socket.send(JSON.stringify({
          type: "game_start",
          room_number: room_id,
          id: myid
        }));
      }
    });
  });

  document.getElementById("conect-room").addEventListener("pointerdown", () => {
    const room_conect_view = document.getElementById("room-conect-view");

    game_title.textContent = "部屋番号を選択";
    document.getElementById("room-menu").style.display = "none";
    document.getElementById("create-room-conect").style.display = "block";

    document.getElementById("room-number-add").addEventListener("pointerdown", () => {
      if (conect_room_number < 9) conect_room_number += 1;
      room_conect_view.textContent = "部屋番号: " + conect_room_number;
    });
    document.getElementById("room-number-sub").addEventListener("pointerdown", () => {
      if (conect_room_number > 1) conect_room_number -= 1;
      room_conect_view.textContent = "部屋番号: " + conect_room_number;
    });

    document.getElementById("room-number-enter").addEventListener("pointerdown", () => {
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


  canvas.addEventListener("pointerdown", (e) => {
    const rect = canvas.getBoundingClientRect();

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    const cellW = canvas.width / 3;
    const cellH = canvas.height / 3;

    const cx = Math.floor(x / cellW);
    const cy = Math.floor(y / cellH);

    //game_title.textContent = "|x: " + cx + "|y: " + cy + "|";
    
    switch (replace) {
      case "ok":
        switch (pnumber) {
          case "1":
            highlight_clear();
            if (game_canvas[cy][cx] == 0) game_canvas[cy][cx] = 3;
            break;

          case "2":
            highlight_clear();
            if (game_canvas[cy][cx] == 0) game_canvas[cy][cx] = 4;
            break;
        }
        break;

      case "no":
        game_title.textContent = "相手の手番です";
        break;

      default:
        game_title.textContent = "エラー";
        break;
    }

    atlas_draw();
    document.getElementById("enter_btn").addEventListener("pointerdown", () => {
      switch (replace) {
        case "ok":
          if (game_canvas[cy][cx] > 2) {
            if (pnumber == "1") game_canvas[cy][cx] = 1;
            if (pnumber == "2") game_canvas[cy][cx] = 2;
            atlas_draw();

            for (let i = 0; i < 3; i++) {
              if (game_canvas[i][0] !== 0 && game_canvas[i][0] === game_canvas[i][1] && game_canvas[i][1] === game_canvas[i][2]) {
                if (game_canvas[i][0] == 1) {
                  win_p = "0";
                  lose_p = "1";
                }else if (game_canvas[i][0] == 2) {
                  win_p = "1";
                  lose_p = "0"
                }
                win = true;
              }
              if (game_canvas[0][i] !== 0 && game_canvas[0][i] === game_canvas[1][i] && game_canvas[1][i] === game_canvas[2][i]) {
                if (game_canvas[0][i] == 1) {
                  win_p = "0";
                  lose_p = "1";
                }else if (game_canvas[0][i] == 2) {
                  win_p = "1";
                  lose_p = "0";
                }
                win = true;
              }
            }
            if (game_canvas[0][0] !== 0 && game_canvas[0][0] === game_canvas[1][1] && game_canvas[1][1] === game_canvas[2][2]) {
              if (game_canvas[0][0] === 1) {
                win_p = "0";
                lose_p = "1";
              }else if (game_canvas[0][0] === 2) {
                win_p = "1";
                lose_p = "0";
              }
              win = true;
            }
            if (game_canvas[2][0] !== 0 && game_canvas[2][0] === game_canvas[1][1] && game_canvas[1][1] === game_canvas[0][2]) {
              if (game_canvas[2][0] === 1) {
                win_p = "0";
                lose_p = "1";
              }else if (game_canvas[2][0] === 2) {
                win_p = "1";
                lose_p = "0";
              }
              win = true;
            }
            if (win === false) {
              win_draw = true;
              for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                  if (game_canvas[i][j] == 0) win_draw = false;
                }
              }
            }

            if (win === false && win_draw === false) {
              socket.send(JSON.stringify({
                type: "game_replace",
                room: room_id,
                pnumber: pnumber,
                game_canvas: game_canvas
              }));
            }else if (win === true) {
              socket.send(JSON.stringify({
                type: "game_set",
                room: room_id,
                win_p: win_p,
                lose_p: lose_p
              }));
            }else if (win_draw === true) {
              socket.send(JSON.stringify({
                type: "win_draw",
                room: room_id
              }));
            }
            document.getElementById("enter_btn").textContent = "相手の手番です"
            game_title.textContent = "相手の手番です";
            replace = "no";
          }else {
            game_title.textContent = "その位置には置けません";
          }
          break;

        case "no":
          game_title.textContent = "相手の手番です";
          break;

        default:
          game_title.textContent = "エラー";
          break;
      }
    });
  });
  /*---Button end---*/

  
});