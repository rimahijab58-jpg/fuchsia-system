// products.js

function getProducts() {
    return JSON.parse(localStorage.getItem("products")) || [];
}

function saveProducts(products) {
    localStorage.setItem("products", JSON.stringify(products));
}

function addProduct() {
    // تعريف العناصر باستخدام ID لضمان عمل الزر
    const pnameInput = document.getElementById("pname");
    const ppriceInput = document.getElementById("pprice");
    const pstockInput = document.getElementById("pstock");

    let name = pnameInput.value.trim();
    let price = Number(ppriceInput.value);
    let stock = Number(pstockInput.value);
    let editIndex = pnameInput.getAttribute("data-edit-index");

    if (!name || price <= 0) {
        alert("يرجى إدخال اسم المنتج وسعره");
        return;
    }

    let products = getProducts();

    if (editIndex !== null) {
        // حالة التعديل
        products[editIndex] = { name, price, stock };
        pnameInput.removeAttribute("data-edit-index");
        document.querySelector("button[onclick='addProduct()']").innerText = "إضافة / تحديث المنتج";
    } else {
        // حالة الإضافة الجديدة
        let existing = products.find(p => p.name === name);
        if (existing) {
            existing.stock += stock;
            existing.price = price;
        } else {
            products.push({ name, price, stock });
        }
    }

    saveProducts(products);
    
    // مسح الحقول
    pnameInput.value = "";
    ppriceInput.value = "";
    pstockInput.value = "";
    
    loadProducts();
}

function loadProducts() {
    let products = getProducts();
    let list = document.getElementById("plist");
    if(!list) return;
    list.innerHTML = "";

    products.forEach((p, i) => {
        list.innerHTML += `
        <tr>
            <td>${p.name}</td>
            <td>${p.price}</td>
            <td>${p.stock}</td>
            <td>
                <button onclick="editProduct(${i})" style="width:auto; background:#ffc107; padding: 5px 10px;">✏️</button>
                <button onclick="deleteProduct(${i})" style="width:auto; background:#dc3545; color:white; padding: 5px 10px;">🗑️</button>
            </td>
        </tr>`;
    });
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