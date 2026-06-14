//main.js

//game-menu
const game_menu = document.getElementById("game-menu");
const logdayo = document.getElementById("game-title-img");
const game_menu_main = document.getElementById("game-menu-main");
const game_menu_select = document.getElementById("game-menu-select");

const create_room = document.getElementById("create-room");

const game_play = document.getElementById("game-play");


let socket = null;
//let myid = null;

document.getElementById("start_btn").addEventListener("click", () => {

  document.getElementById("start_btn").textContent = "サーバーに接続中...(これには時間がかかる場合があります）";
  socket = new WebSocket("wss://server-game-sample-server.onrender.com");

  socket.onopen = () => {
    document.getElementById("game-title").textContent = "接続成功！";
    game_menu_main.style.display = "none";
    game_play.style.display = "block";
  }
  socket.onerror = (e) => {
    logdayo.textContent = "エラー: " + e;
    document.getElementById("start-btn").textContent = "スタート";
  }
  socket.onclose = () => {
    logdayo.textContent = "接続が切断されました";
    document.getElementById("start_btn").textContent = "スタート";
  }
  /*socket.onmessage = (e) => {
    const data = JSON.parse(e.data);

    if (data.type === "welcome") {
      myid = data.id;
      document.getElementById("game-title").textContent = "あなたのIDは: " + myid;
    }else if (data.type === "next_room") {
      myid = data.id;
      document.getElementById("game-title").textContent = "あなたのIDはこれです: " + myid;
    }
  }
  create_room.addEventListener("click", () => {
    socket.send(JSON.stringify({
      type: "next_room",
      id: myid
    }));
  });*/


});

