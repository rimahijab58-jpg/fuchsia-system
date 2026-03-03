// products.js

function getProducts() {
return JSON.parse(localStorage.getItem("products")) || [];
}

function saveProducts(products) {
localStorage.setItem("products", JSON.stringify(products));
}

function addProduct() {
const pnameInput = document.getElementById("pname");
const ppriceInput = document.getElementById("pprice");
const pstockInput = document.getElementById("pstock");

}

// دالة استيراد الإكسيل المضافة للكود الأصلي
function importFromExcel() {
const fileInput = document.getElementById('excelFile');
if (!fileInput || fileInput.files.length === 0) {
alert("يرجى اختيار ملف إكسيل أولاً");
return;
}

}

function loadProducts() {
let products = getProducts();
let list = document.getElementById("plist");
if(!list) return;
list.innerHTML = "";

}

function editProduct(index) {
let products = getProducts();
let p = products[index];
document.getElementById("pname").value = p.name;
document.getElementById("pprice").value = p.price;
document.getElementById("pstock").value = p.stock;
document.getElementById("pname").setAttribute("data-edit-index", index);
document.querySelector("button[onclick='addProduct()']").innerText = "تحديث المنتج";
}

function deleteProduct(index) {
if (confirm("هل تريد حذف هذا المنتج؟")) {
let products = getProducts();
products.splice(index, 1);
saveProducts(products);
loadProducts();
}
}

window.onload = loadProducts;