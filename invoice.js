// بيانات الربط الخاصة بك (نفس التي وضعتها في صفحة المنتجات)
const firebaseConfig = {
  apiKey: "********",
  authDomain: "********",
  databaseURL: "********",
  projectId: "********",
  storageBucket: "********",
  messagingSenderId: "********",
  appId: "********"
};

// تشغيل Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.database();

let cloudProducts = {}; // لتخزين بيانات المخزن السحابي
let invoiceItems = []; // لتخزين عناصر الفاتورة الحالية

// 1. جلب المنتجات من السحاب وتحديث القائمة فوراً
db.ref("products").on("value", (snapshot) => {
    cloudProducts = snapshot.val() || {};
    updateDropdown();
});

function updateDropdown() {
    const select = document.getElementById("productSelect");
    if (!select) return;
    select.innerHTML = '<option value="">-- اختر منتج --</option>';
    
    Object.keys(cloudProducts).forEach(id => {
        let p = cloudProducts[id];
        // عرض الاسم مع الكمية المتوفرة
        select.innerHTML += `<option value="${id}">${p.name} (متوفر: ${p.stock}) - ${p.price} ج.م</option>`;
    });
}

// 2. إضافة منتج للفاتورة المؤقتة
function addToInvoice() {
    const productId = document.getElementById("productSelect").value;
    const qty = parseInt(document.getElementById("qty").value);

    if (!productId || qty <= 0) {
        alert("يرجى اختيار منتج وكمية صحيحة");
        return;
    }

    const product = cloudProducts[productId];

    // التأكد من توفر كمية في المخزن السحابي
    if (qty > product.stock) {
        alert(`عفواً! الكمية المطلوبة أكبر من المتوفر في المخزن (${product.stock})`);
        return;
    }

    invoiceItems.push({
        id: productId,
        name: product.name,
        price: product.price,
        qty: qty,
        total: product.price * qty
    });

    renderTable();
}

// 3. عرض جدول الفاتورة وحساب الإجمالي
function renderTable() {
    const tbody = document.querySelector("#invoiceTable tbody");
    const finalTotalDisp = document.getElementById("finalTotal");
    tbody.innerHTML = "";
    let total = 0;

    invoiceItems.forEach((item, index) => {
        total += item.total;
        tbody.innerHTML += `
            <tr>
                <td>${item.name}</td>
                <td>${item.price}</td>
                <td>${item.qty}</td>
                <td>${item.total}</td>
                <td class="no-print"><button onclick="removeItem(${index})" style="background:red; color:white; border:none; cursor:pointer;">X</button></td>
            </tr>
        `;
    });

    finalTotalDisp.innerText = total;
}

function removeItem(index) {
    invoiceItems.splice(index, 1);
    renderTable();
}

// 4. العملية الكبرى: خصم من السحاب + طباعة
async function processAndPrint() {
    if (invoiceItems.length === 0) {
        alert("الفاتورة فارغة!");
        return;
    }

    if (!confirm("هل تريد إتمام البيع؟ سيتم خصم الكميات من المخزن السحابي فوراً.")) return;

    try {
        // تنفيذ خصم الكميات لكل عنصر في الفاتورة
        for (let item of invoiceItems) {
            let currentStock = cloudProducts[item.id].stock;
            let newStock = currentStock - item.qty;

            // تحديث السحاب
            await db.ref("products/" + item.id).update({
                stock: newStock
            });
        }

        // حفظ الفاتورة في السجل (History) سحابياً أيضاً
        await db.ref("history").push({
            items: invoiceItems,
            total: document.getElementById("finalTotal").innerText,
            date: new Date().toLocaleString()
        });

        alert("تم تحديث المخزن وحفظ العملية بنجاح!");
        
        // الطباعة
        window.print();
        
        // تصفير الفاتورة لبدء واحدة جديدة
        invoiceItems = [];
        renderTable();

    } catch (error) {
        console.error(error);
        alert("حدث خطأ أثناء الاتصال بالسحاب!");
    }
}