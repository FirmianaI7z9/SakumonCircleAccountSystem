function login() {
  const userIdField = document.getElementById("userId");
  const passwordField = document.getElementById("password");
  const submit = document.getElementById("submit-button");
  submit.disabled = true;
  sendGetAuth(userIdField.value, passwordField.value);
}

function authCheck(auth, token=null) {
  if (auth) {
    alert("ログインに成功しました。");
    document.cookie = `token=${token}; max-age=86400; path=/`;
    location.href = "register/index.html";
  }
  else {
    alert("ユーザーIDまたはパスワードが正しくありません。");
    const submit = document.getElementById("submit-button");
    submit.disabled = false;
  }
}