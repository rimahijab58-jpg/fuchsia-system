// db.js
if (!localStorage.getItem("products")) {
    localStorage.setItem("products", JSON.stringify([]));
}