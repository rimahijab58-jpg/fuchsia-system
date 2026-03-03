// بيانات الربط الخاصة بمشروع Fuchsia-Web
const firebaseConfig = {
  apiKey: "AIzaSyB" + "..." , // سيتم استكماله تلقائيا من المتصفح
  authDomain: "fuchsia-web-e1ffe.firebaseapp.com",
  databaseURL: "https://fuchsia-web-e1ffe-default-rtdb.firebaseio.com",
  projectId: "fuchsia-web-e1ffe",
  storageBucket: "fuchsia-web-e1ffe.appspot.com",
  messagingSenderId: "1036149958008",
  appId: "1:1036149958008:web:673873d603b7fcbb29148d"
};

// بدء تشغيل Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.database();

// دالة جلب المنتجات وعرضها من السحاب
function loadProducts() {
    db.ref("products").on("value", (snapshot) => {
        let products = snapshot.val() || {};
        let list = document.getElementById("plist");
        if(!list) return;
        list.innerHTML = "";

        Object.keys(products).forEach((id) => {
            let p = products[id];
            list.innerHTML += `
            <tr>
                <td>${p.name}</td>
                <td>${p.price}</td>
                <td>${p.stock}</td>
                <td>
                    <button onclick="editProduct('${id}')" style="background:#ffc107; border:none; padding:5px; cursor:pointer; border-radius:4px;">✏️</button>
                    <button onclick="deleteProduct('${id}')" style="background:#dc3545; color:white; border:none; padding:5px; cursor:pointer; border-radius:4px;">🗑️</button>
                </td>
            </tr>`;
        });
    });
}

// إضافة منتج جديد للسحاب
function addProduct() {
    const nameInput = document.getElementById("pname");
    const priceInput = document.getElementById("pprice");
    const stockInput = document.getElementById("pstock");
    
    const name = nameInput.value.trim();
    const price = Number(priceInput.value);
    const stock = Number(stockInput.value) || 0;
    const editId = nameInput.getAttribute("data-edit-id");

    if (!name || price <= 0) return alert("أدخل اسم وسعر صحيح");

    if (editId) {
        db.ref("products/" + editId).update({ name, price, stock });
        nameInput.removeAttribute("data-edit-id");
    } else {
        db.ref("products").push({ name, price, stock });
    }

    nameInput.value = ""; priceInput.value = ""; stockInput.value = "";
}

// دالة الاستيراد من الإكسيل للسحاب
function importFromExcel() {
    const fileInput = document.getElementById('excelFile');
    if (!fileInput.files.length) return alert("اختار ملف أولاً");

    const reader = new FileReader();
    reader.onload = function(e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
        
        jsonData.forEach(row => {
            let name = row["الاسم"] || row["name"];
            let price = Number(row["السعر"] || row["price"]);
            let stock = Number(row["الكمية"] || row["stock"]) || 0;
            if (name && price) db.ref("products").push({ name, price, stock });
        });
        alert("تم رفع البيانات للسحاب بنجاح!");
    };
    reader.readAsArrayBuffer(fileInput.files[0]);
}

function deleteProduct(id) {
    if (confirm("هل تريد الحذف من السحاب؟")) db.ref("products/" + id).remove();
}

function editProduct(id) {
    db.ref("products/" + id).once("value").then((s) => {
        let p = s.val();
        document.getElementById("pname").value = p.name;
        document.getElementById("pprice").value = p.price;
        document.getElementById("pstock").value = p.stock;
        document.getElementById("pname").setAttribute("data-edit-id", id);
    });
}

window.onload = loadProducts;