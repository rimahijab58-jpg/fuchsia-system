// نفس بيانات الربط اللي استعملناها في صفحة المنتجات
const firebaseConfig = {
  apiKey: "........",
  authDomain: "........",
  databaseURL: "........",
  projectId: "........",
  storageBucket: "........",
  messagingSenderId: "........",
  appId: "........"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.database();

let allProducts = {}; // هنا هنخزن المنتجات اللي جاية من السحاب

// جلب المنتجات من السحاب عشان الفاتورة تشوفها
db.ref("products").on("value", (snapshot) => {
    allProducts = snapshot.val() || {};
    console.log("المنتجات وصلت من السحاب:", allProducts);
    // لو عندك دالة بتملأ قائمة الاختيار (Dropdown) ناديها هنا
    updateProductSelect(); 
});

// مثال لدالة تحديث قائمة المنتجات في الفاتورة
function updateProductSelect() {
    const select = document.getElementById("productSelect"); // تأكد من ID القائمة عندك
    if(!select) return;
    select.innerHTML = '<option value="">اختر منتج...</option>';
    
    Object.keys(allProducts).forEach(id => {
        let p = allProducts[id];
        select.innerHTML += `<option value="${id}">${p.name} - ${p.price} ج.م</option>`;
    });
}

// دالة إتمام البيع وخصم الكمية من السحاب
function completeSale(productId, quantitySold) {
    if (allProducts[productId]) {
        let newStock = allProducts[productId].stock - quantitySold;
        if (newStock < 0) {
            alert("الكمية غير كافية في المخزن!");
            return;
        }
        // تحديث الكمية في السحاب فوراً
        db.ref("products/" + productId).update({
            stock: newStock
        });
        alert("تمت الفاتورة وخصم الكمية من السحاب!");
    }
}