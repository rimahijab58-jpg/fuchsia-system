// invoice.js

function getProducts() {
    return JSON.parse(localStorage.getItem("products")) || [];
}

// إضافة صف جديد للجدول (الشكل القديم)
function addRow() {
    let products = getProducts();
    if (products.length === 0) {
        alert("لا توجد منتجات متوفرة. أضف منتجات من صفحة Products أولاً.");
        return;
    }

    // إنشاء قائمة المقترحات للبحث
    if (!document.getElementById("productsList")) {
        let datalistHTML = `<datalist id="productsList">`;
        products.forEach((p) => { datalistHTML += `<option value="${p.name}">`; });
        datalistHTML += `</datalist>`;
        document.body.insertAdjacentHTML("beforeend", datalistHTML);
    }

    let tableBody = document.getElementById("items");
    let id = Date.now(); // معرف فريد لكل صف لضمان عدم التداخل
    let row = `
    <tr id="row-${id}">
        <td><input type="text" list="productsList" placeholder="ابحث عن منتج..." oninput="fillPriceFromSearch(this, ${id})"></td>
        <td><input type="number" id="price-${id}" value="0" oninput="calc()"></td>
        <td><input type="number" id="qty-${id}" value="1" min="1" oninput="calc()"></td>
        <td><input type="number" id="disc-${id}" value="0" oninput="calc()"></td>
        <td id="total-${id}" class="line-total" style="font-weight:bold;">0</td>
        <td class="no-print"><button onclick="document.getElementById('row-${id}').remove(); calc();" style="background:#ff4d4d; color:white; border:none; padding:5px 10px; border-radius:4px;">X</button></td>
    </tr>`;
    tableBody.insertAdjacentHTML("beforeend", row);
}

// تعبئة السعر تلقائياً عند البحث
function fillPriceFromSearch(input, id) {
    let products = getProducts();
    let product = products.find(p => p.name === input.value);
    if (product) {
        document.getElementById(`price-${id}`).value = product.price;
        calc();
    }
}

// حساب الإجماليات
function calc() {
    let grandTotal = 0;
    document.querySelectorAll("#items tr").forEach(tr => {
        let id = tr.id.split('-')[1];
        let price = Number(document.getElementById(`price-${id}`).value) || 0;
        let qty = Number(document.getElementById(`qty-${id}`).value) || 0;
        let disc = Number(document.getElementById(`disc-${id}`).value) || 0;
        let total = (price * qty) - disc;
        document.getElementById(`total-${id}`).innerText = total;
        grandTotal += total;
    });
    document.getElementById("grandTotal").innerText = "Total: " + grandTotal;
}

// دالة الحفظ والطباعة (تم إصلاحها بالكامل)
function saveAndPrint() {
    let rows = document.querySelectorAll("#items tr");
    if (rows.length === 0) {
        alert("الفاتورة فارغة! أضف صنفاً واحداً على الأقل.");
        return;
    }

    let products = getProducts();
    let printItems = document.getElementById("printItems");
    printItems.innerHTML = ""; 
    let finalGrandTotal = 0;
    let invoiceItems = [];

    rows.forEach(tr => {
        let id = tr.id.split('-')[1];
        let name = tr.querySelector("input[type='text']").value;
        let price = Number(document.getElementById(`price-${id}`).value);
        let qty = Number(document.getElementById(`qty-${id}`).value);
        let disc = Number(document.getElementById(`disc-${id}`).value);
        let total = (price * qty) - disc;

        if (name) {
            // تجهيز جدول الطباعة
            printItems.innerHTML += `<tr>
                <td style="text-align:right;">${name}</td>
                <td>${price}</td>
                <td>${qty}</td>
                <td>${total}</td>
            </tr>`;
            
            finalGrandTotal += total;
            invoiceItems.push({ name, price, qty, lineTotal: total });

            // خصم الكمية من المخزن (إصلاح الخطأ السابق)
            let pIndex = products.findIndex(p => p.name === name);
            if (pIndex !== -1) {
                products[pIndex].stock -= qty;
            }
        }
    });

    // تحديث بيانات الفاتورة المطبوعة
    document.getElementById("p-customer").innerText = document.getElementById("customer").value || "عميل نقدي";
    document.getElementById("p-date").innerText = new Date().toLocaleDateString('ar-EG');
    document.getElementById("p-grand-total").innerText = finalGrandTotal;
    document.getElementById("p-inv-id").innerText = Math.floor(Math.random() * 10000); // رقم عشوائي للفاتورة

    // حفظ في السجل (History)
    let history = JSON.parse(localStorage.getItem("invoiceHistory")) || [];
    history.push({
        customer: document.getElementById("customer").value || "عميل نقدي",
        total: finalGrandTotal,
        date: new Date().toLocaleString('ar-EG'),
        items: invoiceItems
    });

    // حفظ البيانات في الذاكرة
    localStorage.setItem("invoiceHistory", JSON.stringify(history));
    localStorage.setItem("products", JSON.stringify(products));

    // الطباعة
    window.print();
    
    // إعادة تحميل الصفحة لتجهيز فاتورة جديدة
    setTimeout(() => { location.reload(); }, 1000);
}