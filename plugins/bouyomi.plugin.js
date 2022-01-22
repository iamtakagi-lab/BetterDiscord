//META{"name": "BouyomiPlugin", "source": "https://gist.github.com/EvilDaimyo/e1a6b4b24ad4b825331ac96c7ae16801", "twitter": "https://twitter.com/dripnyan", "author": "dripnyan"}*//

/* BD Functions */
class BouyomiPlugin {
  getName() {
    return "Bouyomi Plugin";
  }

  getDescription() {
    return "Bouyomi Chan! Read this kudasai!";
  }

  getVersion() {
    return "1.0.0";
  }

  getAuthor() {
    return "DripNyan";
  }

  start() {
  }

  load() {
  }

  unload() {
  }

  stop() {
  }

  onSwitch() {
    switched = true;
    setTimeout(function() { switched = false; }, 500);
  }

  observer(changes) {
    if (switched) return;
    let target = changes.nextSibling;
    if (target == null || target.className == null || !(typeof target.className == "string")) return;
    if (!target.className.includes("da-scrollerSpacer")) return;
    let author = $(".da-contents .da-username").last().text(), text = $(".da-contents .da-messageContent").last().text();
    if (!text) return; // is empty (image only)
    if (last == text && last_author == author) return;

    let message = (name ? last_author = author : "") + "  " + (last = text);
    sendBouyomiChan(message);
  }
}

var last = "", last_author = "", name = true, switched = false;

// https://github.com/chocoa/BouyomiChan-WebSocket-Plugin
function sendBouyomiChanWebSocketPlugin(text) {
  let callee = sendBouyomiChanWebSocketPlugin, host = "ws://localhost:50002/";
  try {
    let socket = new WebSocket(host);
    socket.onopen = function() {
      // console.log("Server open.");
      
      let delim  = "<bouyomi>";
      let speed  = -1; // 速度50-200。-1を指定すると本体設定
      let pitch  = -1; // ピッチ50-200。-1を指定すると本体設定
      let volume = -1; // ボリューム0-100。-1を指定すると本体設定
      let type   =  0; // 声質(0.本体設定/1.女性1/2.女性2/3.男性1/4.男性2/5.中性/6.ロボット/7.機械1/8.機械2)
      socket.send("" + speed + delim + pitch + delim + volume + delim + type + delim + text);
    };
    socket.onmessage = function(e) {
      // console.log("Server message: "+e.data);
    };
    socket.onerror = function(e) {
      if (callee.error !== true) {
        callee.error = true;
        console.log("Server error: " + e);
      }
    };
    socket.onclose = function() {
      // console.log("Server close.");
    };
  } catch (exception) {
    console.log("Error: " + exception);
  }
}

// 棒読みちゃんへ文字列を送信する
function sendBouyomiChan(text) {
  sendBouyomiChanWebSocketPlugin.error = false;
  
  // 一定文字数をこえると、プラグインがインデックス範囲外でハングするため、複数回送信する
  // 「。」を区切りとして複数回送信する。
  // (文字数だけで区切ると単語の途中で送信してしまう可能性があるため)
  // (単語の途中で送信してしまうと、棒読みちゃんの発音が意図しないものとなる可能性が高い)
  let len = 200;  // 一回の最大送信文字数
  let idx = 0;
  let next, prev = 0;
  while (true) {
    next = text.indexOf("。", prev);
    // console.log(next+" "+prev+" "+idx);
    if (next == -1) { break; }
    
    while (next-idx > len) {
      if (prev == idx) {
        prev = idx + len;
      }
      // console.log(text.substr(idx, prev-idx));
      sendBouyomiChanWebSocketPlugin(text.substr(idx, prev-idx));
      idx = prev;
    }
    prev = next + 1;
  }
  // console.log(text.substr(idx, text.length-idx));
  sendBouyomiChanWebSocketPlugin(text.substr(idx, text.length-idx));
  // 一定の文字列を超えた場合、それ以降朗読しなくなる問題がある
}