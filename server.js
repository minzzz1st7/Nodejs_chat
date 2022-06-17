var app = require("express")();
var http = require("http").Server(app);
var io = require("socket.io")(http);

// client가 최초 접속 시 보여지는 화면
app.get("/", function (req, res) {
  res.sendFile(__dirname + "/index.html");
});

// 서버 실행
http.listen(3000, function () {
  console.log("server listening on port : 3000");
});

var userList = [];

io.on("connection", function (socket) {
  var joinedUser = false;
  var nickname;

  // 유저 입장
    socket.on("join", function (data) {
    // 이미 입장했다면 중단
    if (joinedUser) {
      return false;
    }

    nickname = data;
    userList.push(nickname);
    socket.broadcast.emit("join", {
      nickname: nickname,
      userList: userList,
    });

    socket.emit("welcome", {
      nickname: nickname,
      userList: userList,
    });

    joinedUser = true;
  });

  // 메시지 전달
  socket.on("msg", function (data) {
    console.log("msg: " + data);
    io.emit("msg", {
      nickname: nickname,
      msg: data,
    });
  });

  // 접속 종료
  socket.on("disconnect", function () {
    // 입장하지 않았다면 중단
    if (!joinedUser) {
      console.log("--- not joinedUser left");
      return false;
    }
    // 접속자 목록에서 제거
    var i = userList.indexOf(nickname);
    userList.splice(i, 1);

    socket.broadcast.emit("left", {
      nickname: nickname,
      userList: userList,
    });
  });
});
