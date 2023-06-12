const aoai_url = '';
const aoai_key = '';

const chat_text = '<li>'+
  '<div class="balloon">'+
  '<img class="img-circle" src="yui.jpg" alt="image" />' +
  '<p class="talk">こんにちは！</p>'+
  '</div>' +
  '</li>' +
  '<li>' +
  '<div class="balloon">' +
  '<img class="img-circle" src="yui.jpg" alt="image" />' +
  '<p class="talk">システムの導入を検討している業務分野に関する製品情報をご紹介します。<br>例：経理、財務</p>' +
  '</div>' +
  '</li>';

const body_text = 'あなたはITコンサルタントです。\nスタッフ組織が導入を検討している業務分野で、実在するアプリケーションを3個選び、以下の比較検討項目について評価した結果を、表形式で出力してください。\n・特徴\n・導入コストと運用コスト\n・処理性能\n・使いやすさ\nITスキルが低い人にもわかるような文章にしてください。';
const req_body = {
  "messages": [
    {
      "role": "system",
      "content": body_text
    }
  ],
  "temperature": 0.7,
  "top_p": 0.95,
  "frequency_penalty": 0,
  "presence_penalty": 0,
  "max_tokens": 800,
  "stop": null
};

function showUserMessage(message) {
  // ユーザーの入力を右側に配置
  const chatbox =
    '<li><div class="balloon balloon-r">' +
    '<p class="talk talk-r">' +
    message +
    '</p>' +
    '</div></li>';
  $('#chat-area').append(chatbox);
  // 最終メッセージに移動
  $(window).scrollTop($('#chat-area')[0].scrollHeight);
}

function showBotMessage(message) {
  // messageの改行を<br>に変換
  message = message.replace(/\n/g, '<br>');

  // ボットの返答を左側に配置
  const chatbox =
    '<li><div class="balloon">' +
    '<img class="img-circle" src="yui.jpg" alt="image" />' +
    '<p class="talk">' +
    message +
    '</p>' +
    '</div></li>';
  $('#chat-area').append(chatbox);
  // 最終メッセージに移動
  $(window).scrollTop($('#chat-area')[0].scrollHeight);
}

function postToAOAI(req_message) {
  // リクエストボディを作成
  req_body.messages.push({"role": "user", "content": req_message});
  req_body.messages.push({"role": "assistant", "content": ""});

  // リクエストボディの文字数が4000文字を超えた場合、role="system"を除く、最初のmessageを削除する
  if (JSON.stringify(req_body).length > 4000) {
    req_body.messages.splice(1, 1);
    console.log("4000文字を超えたため、最初のmessageを削除しました。");
  }

  // デバッグメッセージ
  console.log(req_body.messages);

  // Azure OpenAI APIにアクセスする
  fetch(aoai_url,{
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': aoai_key
    },
    body: JSON.stringify(req_body)
  })
  .then((res) => res.json())
  .then((json) => {

    // 取得内容を表示
    console.log(json);
    showBotMessage(json.choices[0].message.content);

    // リクエストボディの最後のmessage.contentを更新する
    req_body.messages[req_body.messages.length - 1].content = json.choices[0].message.content;
  })
  .catch((error) => {
    console.error('Error:', error.code + ': ' + error.message)
  })
}

function sendMessage() {
  // ユーザー入力を取得
  req_message = $('#msg-send').val();

  // ユーザー入力が空の場合は処理を終了する
  if (req_message === '') {
    return;
  }

  // ユーザー入力を表示
  showUserMessage(req_message);

  // Azure OpenAI APIにアクセスする
  postToAOAI(req_message);
    
  // ユーザー入力をクリア
  $('#msg-send').val('');
}

function init() {
  // 初期化処理
  $('#chat-area').append(chat_text);

  // リクエストボディを初期化
  req_body.messages = [
    {
      "role": "system",
      "content": body_text
    }
  ];
}

$(function () {
  $(window).keydown(function (e) {
    // 「Shift」+「Enter」でユーザー入力送信
    if (e.keyCode === 13 && e.shiftKey) {
      sendMessage();
    }
  });
});
