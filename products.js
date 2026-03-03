function getProducts() { return JSON.parse(localStorage.getItem("products")) || []; }
function saveProducts(p) { localStorage.setItem("products", JSON.stringify(p)); }

function addProduct() {
const n = document.getElementById("pname");
const p = document.getElementById("pprice");
const s = document.getElementById("pstock");
let products = getProducts();
products.push({ name: n.value, price: Number(p.value), stock: Number(s.value) });
saveProducts(products);
n.value=""; p.value=""; s.value="";
loadProducts();
}

function importFromExcel() {
const fileInput = document.getElementById('excelFile');
if (fileInput.files.length === 0) return alert("اختار ملف أولاً");
const reader = new FileReader();
reader.onload = function(e) {
const data = new Uint8Array(e.target.result);
const workbook = XLSX.read(data, {type: 'array'});
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const json = XLSX.utils.sheet_to_json(sheet);
let products = getProducts();
json.forEach(row => {
let name = row["الاسم"] || row["name"];
let price = row["السعر"] || row["price"];
let stock = row["الكمية"] || row["stock"] || 0;
if(name && price) products.push({name, price: Number(price), stock: Number(stock)});
});
saveProducts(products);
loadProducts();
alert("تم الاستيراد بنجاح");
};
reader.readAsArrayBuffer(fileInput.files[0]);
}

function loadProducts() {
let products = getProducts();
let list = document.getElementById("plist");
list.innerHTML = "";
products.forEach((p, i) => {
list.innerHTML += <tr><td>${p.name}</td><td>${p.price}</td><td>${p.stock}</td><td><button onclick="deleteProduct(${i})">🗑️</button></td></tr>;
});
}

function deleteProduct(i) {
let p = getProducts();
p.splice(i, 1);
saveProducts(p);
loadProducts();
}

window.onload = loadProducts;