const Constants = {
  GASUrl: "https://script.google.com/macros/s/AKfycbxkED2yFqvbkhCmynUszZpZMq4sIQJAsA3nIn2016kNgG7EgmPSgUdSea6VrNqxPvzCQA/exec",
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
    body: JSON.stringify({ method: "all", token: localStorage.getItem("token") }),
  };
  fetchData(options, "registerSetup");
}

function sendPost(data) {
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "text/plain",
    },
    body: JSON.stringify(data),
  };
  fetchData(options);
}

async function fetchData(options, type="login") {
  try {
    var data = await fetch(Constants.GASUrl, options).then(response => response.text());
    console.log(data);
    data = JSON.parse(data);

    switch (type) {
      case "login":
        authCheck(data.auth);
        break;
      case "registerSetup":
        initialSetup(data);
        break;
      case "getList":
        getResult(data);
        break;
    }
  }
  catch (error) {
    console.error("InternalError:", error);
  }
}