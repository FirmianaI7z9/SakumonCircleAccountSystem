const Constants = {
  GASUrl: "https://script.google.com/macros/s/AKfycbzyLBz7h2pJ5eAhAFhytsS7jBui1UkYXh-7xoirefJV-13HLF-2rI6eYBjpGzzAFuuSEw/exec",
};

function sendGetAuth(userId, password) {
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "text/plain",
    },
    body: JSON.stringify({ method: "auth", userid: userId, password: password }),
  };
  fetchData(options);
}

function sendGetAll() {
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "text/plain",
    },
    body: JSON.stringify({ method: "all", token: getCookie("token") }),
  };
  fetchData(options, "registerSetup");
}

function sendPost(totalData, accountData) {
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "text/plain",
    },
    body: JSON.stringify({ method: "submit", token: getCookie("token"), totalData: totalData, accountData: accountData}),
  };
  fetchData(options, "getList");
}

async function fetchData(options, type="login") {
  try {
    var data = await fetch(Constants.GASUrl, options).then(response => response.text());
    data = JSON.parse(data);

    switch (type) {
      case "login":
        authCheck(data.auth, data.token);
        break;
      case "registerSetup":
        if (data.auth) {
          document.cookie = `token=${data.token}; max-age=86400; path=/`;
          initialSetup(data);
        }
        else {
          alert("権限がない、またはセッション終了済みです。再度ログインしてください。");
          location.href = "../index.html";
        }
        break;
      case "getList":
        if (data.auth) {
          document.cookie = `token=${data.token}; max-age=86400; path=/`;
          if (data.result) {
            alert("正常に処理されました。画面を更新します。");
            location.href = "../register/index.html";
          }
          else {
            alert("送信に失敗しました。他レジとの競合により在庫数データが最新でない、または過去の会計情報を正しく登録していない可能性があります。");
            alert("今回の会計の内容はレジ付近にある記録用紙に書き、すぐに担当者(祖父江)に連絡してください。");
            const submit = document.getElementById("submit-button");
            submit.disabled = false;
          }
        }
        else {
          alert("権限がない、またはセッション終了済みです。再度ログインしてください。");
          location.href = "../index.html";
        }
        break;
    }
  }
  catch (error) {
    console.error("InternalError:", error);
  }
}