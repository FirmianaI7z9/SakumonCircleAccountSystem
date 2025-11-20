class Account {
  constructor(id, date, totalPrice, discount, result, totalCount, productList, charge) {
    this.id = id;
    this.date = date;
    this.totalPrice = totalPrice;
    this.discount = discount;
    this.result = result;
    this.totalCount = totalCount;
    this.productList = productList;
    this.charge = charge;
  }
};

class Item {
  constructor(id, name, type, isNewRelease, price) {
    this.id = id;
    this.name = name;
    this.type = type;
    this.isNewRelease = isNewRelease;
    this.price = price;
  }
};

class ItemSales {
  constructor(id, accountId, date, itemId, number) {
    this.id = id;
    this.accountId = accountId;
    this.date = date;
    this.itemId = itemId;
    this.number = number;
  }
};

class Discount {
  constructor(id, name, type, price, targetList) {
    this.id = id;
    this.name = name;
    this.type = type;
    this.price = price;
    this.targetList = targetList;
  }
};

class Target {
  constructor(ids, mincount) {
    this.ids = ids;
    this.mincount = mincount;
  }
};

window.addEventListener("load", function(){
  const accountBox = document.getElementById("accountBox");
  const accountDetailBox = document.getElementById("accountDetailBox");
  accountBox.innerHTML = '<p class="p-text-white" style="text-align: center;">Now Loading...</p>';
  accountDetailBox.innerHTML = '<p class="p-text-white" style="text-align: center;">Now Loading...</p>';
  getList();
});

var itemData = {};
var discountType = [];
var itemSalesList = [];
var accountList = [];

function listData(data) {
  const productTable = data.product;
  const discountTable = data.discount;
  const itemSalesTable = data.itemSales;
  const accountSalesTable = data.userSales;
  const accountBox = document.getElementById("accountBox");
  const accountDetailBox = document.getElementById("accountDetailBox");
  const totalSalesText = document.getElementById("totalSalesText");
  const totalItemCountText = document.getElementById("totalItemCountText");
  const dailySalesText = document.getElementById("dailySalesText");
  const hourlySalesText = document.getElementById("hourlySalesText");
  accountBox.innerHTML = '<p class="p-text-white" style="text-align: center;">処理中です</p>';
  accountDetailBox.innerHTML = '<p class="p-text-white" style="text-align: center;">確認する会計を選んでください</p>';
  productTable.map(product => {
    itemData[product[0]] = new Item(product[0], product[1], product[2], product[3], product[5]);
  });
  discountType = discountTable.map(discount => {
    let targets = [];
    for (let i = 4; i < discount.length; i += 2) {
      if (discount[i] == "" || discount[i + 1] == "") break;
      targets.push(new Target(discount[i].split(","), discount[i + 1]));
    }
    return new Discount(discount[0], discount[1], discount[2], discount[3], targets);
  });
  itemSalesList = itemSalesTable.map(account => {
    return new ItemSales(account[0], account[1], account[2], account[3], account[4]);
  });
  accountList = accountSalesTable.map(account => {
    const accountItemList = itemSalesList.filter(item => (item.accountId === account[0]));
    var itemCount = 0;
    accountItemList.map(item => { itemCount += item.number; });
    return new Account(account[0], account[1], account[3], account[4], account[2], itemCount, accountItemList, account[5]);
  });
  accountList.reverse();
  var accountText = "";
  var totalSales = 0, totalItemCount = 0, dailySales = 0, hourlySales = 0;
  var hourList = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  const now = new Date();
  for (let account in accountList) {
    let i = accountList[account];
    let date = new Date(i.date);
    totalSales += i.result;
    totalItemCount += i.totalCount;
    if (now.toDateString() === date.toDateString()) {
      dailySales += i.result;
      hourList[date.getHours()] += i.result;
    }
    if ((now - date) <= 3600000) {
      hourlySales += i.result;
    }
    let itemHTML = 
      `<div class="account-item">
        <div class="account-item-id">#${('0000' + i.id).slice(-4)}</div>
        <div class="account-item-right">
          <div class="account-item-topright">
            <div class="account-item-text1" style="width: 70%;">確定日時：${date.getFullYear()}年${date.getMonth()}月${date.getDate()}日 ${date.getHours()}時${('00' + date.getMinutes()).slice(-2)}分${('00' + date.getSeconds()).slice(-2)}秒${('000' + date.getMilliseconds()).slice(-3)}</div>
            <div class="account-item-text1" style="width: 30%;">担当：${i.charge}</div>
          </div>
          <div class="account-item-bottomright">
            <div class="account-item-text2">小計</div>
            <div class="account-item-number">${i.totalPrice.toLocaleString()}</div>
            <div class="account-item-text2">円 － 割引</div>
            <div class="account-item-number">${i.discount.toLocaleString()}</div>
            <div class="account-item-text2">円 ＝ 総計</div>
            <div class="account-item-number">${i.result.toLocaleString()}</div>
            <div class="account-item-text2">円</div>
          </div>
        </div>
        <a href="javascript: selectAccount(${i.id});"></a>
      </div>`;
    accountText += itemHTML;
  }
  accountList.reverse();
  accountBox.innerHTML = accountText;
  countupText(totalSalesText, 0, totalSales, 50, true);
  countupText(totalItemCountText, 0, totalItemCount, 50, true);
  countupText(dailySalesText, 0, dailySales, 50, true);
  countupText(hourlySalesText, 0, hourlySales, 50, true);

  const chart1 = document.getElementById("chart-hour");
  var hourlyResult = new Chart(chart1, {
    type: 'bar',
    data: {
      labels: ['8:00', '9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'],
      datasets: [{
        label: '1時間合計推移',
        data: hourList.slice(8, 19),
        backgroundColor: '#ff9933'
      }]
    },
    options: {
      plugins: {
        legend: {
          display: false
        }
      },
      animation: {
        duration: 500,
        easing: 'easeOutQuart',
        delay: 200
      }
    }
  });
}

function selectAccount(id) {
  const account = accountList[id - 1];
  const accountDetailBox = document.getElementById("accountDetailBox");
  accountDetailBox.innerHTML = '';
  for (let item in account.productList) {
    let i = account.productList[item];
    let j = itemData[i.itemId];
    let color = ((j.type).startsWith("H") ? "blue" : ((j.type).startsWith("K") ? "orange" : "black"));
    let itemHTML = 
      `<div class="item border-${color}-1">
        <div class="item-category">${j.type}</div>
        <div class="item-name2">${j.name}</div>
        <div class="item-number2" id="text-${i.id}">${i.number} 点</div>
        <div class="item-number3" id="text-${i.id}">${(i.number * j.price).toLocaleString()} 円</div>
      </div>`;
    accountDetailBox.innerHTML += itemHTML;
  }
}

async function countupText(text, begin, end, step, toLocale=false) {
  let currentStep = 0;
  let interval = setInterval(() => {
    let number = Math.trunc(end - (end - begin) * Math.pow(1 - currentStep / step, 4));
    text.innerText = toLocale ? number.toLocaleString() : number;
    currentStep++;
    if (currentStep === step) {
      clearInterval(interval);
      text.innerText = toLocale ? end.toLocaleString() : end;
    }
  }, 10);
}