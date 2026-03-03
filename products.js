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

    let name = pnameInput.value.trim();
    let price = Number(ppriceInput.value);
    let stock = Number(pstockInput.value) || 0;
    let editIndex = pnameInput.getAttribute("data-edit-index");

    if (!name || price <= 0) {
        alert("يرجى إدخال اسم المنتج وسعره");
        return;
    }

    let products = getProducts();

    if (editIndex !== null) {
        products[editIndex] = { name, price, stock };
        pnameInput.removeAttribute("data-edit-index");
    } else {
        let existing = products.find(p => p.name === name);
        if (existing) {
            existing.stock += stock;
            existing.price = price;
        } else {
            products.push({ name, price, stock });
        }
    }

    saveProducts(products);
    pnameInput.value = "";
    ppriceInput.value = "";
    pstockInput.value = "";
    loadProducts();
}

function importFromExcel() {
    const fileInput = document.getElementById('excelFile');
    if (!fileInput || fileInput.files.length === 0) {
        alert("يرجى اختيار ملف إكسيل أولاً");
        return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = function(e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(sheet);
            
            let products = getProducts();
            let count = 0;

            jsonData.forEach(row => {
                let name = row["الاسم"] || row["name"];
                let price = Number(row["السعر"] || row["price"]);
                let stock = Number(row["الكمية"] || row["stock"]) || 0;

                if (name && price) {
                    let existingIndex = products.findIndex(p => p.name === name);
                    if (existingIndex !== -1) {
                        products[existingIndex].price = price;
                        products[existingIndex].stock += stock;
                    } else {
                        products.push({ name, price, stock });
                    }
                    count++;
                }
            });

            saveProducts(products);
            loadProducts();
            alert("تم استيراد " + count + " صنف بنجاح!");
            fileInput.value = "";
        } catch (err) {
            alert("خطأ في قراءة الملف. تأكد أن الملف يحتوي على أعمدة (الاسم، السعر، الكمية)");
        }
    };
    reader.readAsArrayBuffer(file);
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
                <button onclick="editProduct(${i})" style="background:#ffc107; border:none; padding:5px; cursor:pointer; border-radius:4px;">✏️</button>
                <button onclick="deleteProduct(${i})" style="background:#dc3545; color:white; border:none; padding:5px; cursor:pointer; border-radius:4px;">🗑️</button>
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