//main.js

//game-menu
const game_menu = document.getElementById("game-menu");
const logdayo = document.getElementById("game-title-img");
const game_menu_main = document.getElementById("game-menu-main");
const game_menu_select = document.getElementById("game-menu-select");
const game_title = document.getElementById("game-title");
const start_btn = document.getElementById("start_btn"); 

const game_play = document.getElementById("game-play");

let socket = null;
let myid = null;

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
        game_title.textContent = "あなたのIDはこれです: " + myid;
        break;

      default:
        game_title.textContent = "不明なエラーが発生しました";
        break;
    }
  }

  document.getElementById("create-room").addEventListener("click", () => {
    socket.send(JSON.stringify({
      type: "next_room",
      id: myid
    }));
  });
});