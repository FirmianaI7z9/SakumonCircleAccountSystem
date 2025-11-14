class Item {
  constructor(id, name, type, isNewRelease, currentStock, price) {
    this.id = id;
    this.name = name;
    this.type = type;
    this.isNewRelease = isNewRelease;
    this.currentStock = currentStock;
    this.price = price;
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
}

var itemData = {};
var discountType = [];
var selectNumbers = {};

window.addEventListener("load", function(){
  console.log(localStorage.getItem("token"));
  sendGetAll();
})

function initialSetup(data) {
  const productTable = data.product;
  const discountTable = data.discount;
  const itemSalesTable = data.itemSales;
  const newReleaseBox = document.getElementById("newRelease");
  const backIssueBox = document.getElementById("backIssue");
  newReleaseBox.innerHTML = '<p class="p-text-white" style="text-align: center;">Now Loading...</p>';
  backIssueBox.innerHTML = '<p class="p-text-white" style="text-align: center;">Now Loading...</p>';
  productTable.map(product => {
    itemData[product[0]] = new Item(product[0], product[1], product[2], product[3], product[4], product[5]);
    selectNumbers[product[0]] = 0;
  });
  discountType = discountTable.map(discount => {
    let targets = [];
    for (let i = 4; i < discount.length; i += 2) {
      if (discount[i] == "" || discount[i + 1] == "") break;
      targets.push(new Target(discount[i].split(","), discount[i + 1]));
    }
    return new Discount(discount[0], discount[1], discount[2], discount[3], targets);
  });
  for (let i = 0; i < itemSalesTable.length; i++) {
    itemData[itemSalesTable[i][3]] -= itemSalesTable[i][4];
  }
  for (let item in itemData) {
    let color = (item.type.startsWith("H") ? "blue" : (item.type.startsWith("K") ? "orange" : "black"));
    let itemHTML = 
      `<div class="item border-${color}-1">
        <div class="item-category">${item.type}</div>
        <div class="item-name">${item.name}</div>
        <div id="dbutton-${item.id}" class="item-button-container"><button>－1</button></div>
        <div class="item-number"><b id="text-${item.id}">0</b><span> / ${item.currentStock}</span></div>
        <div id="ibutton-${item.id}" class="item-button-container"><button>＋1</button></div>
      </div>`;
    if (item.isNewRelease) {
      newReleaseBox.innerHTML += itemHTML;
    }
    else {
      backIssueBox.innerHTML += itemHTML;
    }
  }
}

function incrementItem(itemId) {
  if (itemData[itemId].currentStock >= selectNumbers[itemId] + 1) {
    selectNumbers[itemId]++;
    updateItem(itemId);
  }
  else {
    console.error("Error: The number of items selected must not exceed the available inventory.");
  }
}

function decrementItem(itemId) {
  if (selectNumbers[itemId] - 1 >= 0) {
    selectNumbers[itemId]--;
    updateItem(itemId);
  }
  else {
    console.error("Error: The number of items selected must be non-negative.");
  }
}

function updateItem(itemId) {
  const numberText = document.getElementById("text-" + itemId);
  const decrementButton = document.getElementById("dbutton-" + itemId);
  const incrementButton = document.getElementById("ibutton-" + itemId);
  numberText.innerText = String(selectNumbers[itemId]);
  decrementButton.disabled = (selectNumbers[itemId] <= 0);
  incrementButton.disabled = (selectNumbers[itemId] >= itemData[itemId].currentStock);
  updateState();
}

function updateState() {
  const resultCell = document.getElementById("resultCell");
  resultCell.innerText = "Updating...";
  var totalPrice = updateSelectList();
  var totalDiscount = updateDiscountList();
  resultCell.innerText = (Math.max(0, totalPrice - totalDiscount)).toLocaleString();
}

function updateSelectList() {
  const selectTable = document.getElementById("selectTable"); // 注：これは<tbody>要素 //
  const priceCell = document.getElementById("priceCell");
  selectTable.innerHTML = '<tr><td style="color: #ff9933; font-weight: 600;" colspan="4">Updating...</td></tr>';
  priceCell.innerText = "Updating...";
  var newHTML = [];
  var totalPrice = 0;
  for (const key in selectNumbers) {
    var item = itemData[key];
    var number = selectNumbers[key];
    if (number >= 1) {
      totalPrice += item.price * number;
      newHTML.push(`<tr><td>${item.name}</td><td>${item.price.toLocaleString()}</td><td>${number.toLocaleString()}</td><td>${(item.price * number).toLocaleString()}</td></tr>`);
    }
  }
  priceCell.innerText = totalPrice.toLocaleString();
  selectTable.innerHTML = newHTML.join("");
  return totalPrice;
}

function calculatePrice() {

}

function updateDiscountList() {
  const discountTable = document.getElementById("discountTable"); // 注：これは<tbody>要素 //
  const discountCell = document.getElementById("discountCell");
  discountTable.innerHTML = '<tr><td style="color: #ff9933; font-weight: 600;" colspan="4">Updating...</td></tr>';
  discountCell.innerText = "Updating...";
  var newHTML = [];
  var totalDiscount = 0;
  var setRemainNumbers = JSON.parse(JSON.stringify(selectNumbers)); // deepcopy //
  for (let i = 0; i < discountType.length; i++) {
    let discount = discountType[i];
    let sets = 10000;
    let target = null;
    let totalRemainNumber = 0;
    let totalSelectNumber = 0;
    switch (discount.type) {
      case "s": // セット割引 //
        for (let j = 0; j < discount.targetList.length; j++) {
          target = discount.targetList[j];
          for (let k = 0; k < target.ids.length; k++) {
            totalRemainNumber += setRemainNumbers[target.ids[k]];
          }
          sets = Math.min(sets, Math.trunc(totalRemainNumber / target.mincount));
        }
        if (sets > 0) {
          for (let j = 0; j < discount.targetList.length; j++) {
            target = discount.targetList[j];
            for (let k = 0; k < target.ids.length; k++) {
              setRemainNumbers[target.ids[k]] -= target.mincount * sets;
            }
          }
        }
        break;
      case "d": // 複数購入(単価から割引) //
        target = discount.targetList[0];
        for (let j = 0; j < target.ids.length; j++) {
          totalSelectNumber += selectNumbers[target.ids[k]];
        }
        if (totalSelectNumber >= target.mincount) {
          sets = totalSelectNumber;
        }
        else {
          sets = 0;
        }
        break;
      case "m": // 複数購入(一定個数以上で一定額割引) //
        target = discount.targetList[0];
        for (let j = 0; j < target.ids.length; j++) {
          totalSelectNumber += selectNumbers[target.ids[k]];
        }
        if (totalSelectNumber >= target.mincount) {
          sets = 1;
        }
        else {
          sets = 0;
        }
        break;
      default:
        sets = 0;
        break;
    }
    totalDiscount += discount.price * sets;
    newHTML.push(
      `<tr><td>${discount.name}</td><td>－${discount.price.toLocaleString()}</td><td>${sets.toLocaleString()}</td><td>－${(discount.price * sets).toLocaleString()}</td></tr>`
    );
  }
  discountCell.innerText = "－" + totalDiscount.toLocaleString();
  discountTable.innerHTML = newHTML.join("");
  return totalDiscount;
}

function calculateDiscount() {

}

function submitAccount() {

}

function getResult(data) {

}