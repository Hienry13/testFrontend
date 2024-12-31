

// Hàm gọi API và cập nhật danh sách tồn kho
function fetchInventory(type, limit = 5) {
    const url = `http://160.191.50.248:8080/api/overview/top-inventory?type=${type}&limit=${limit}`;
    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        console.log(data); // Kiểm tra dữ liệu JSON trả về từ API
        displayInventory(data); // Gọi hàm hiển thị dữ liệu tồn kho
      })
      .catch((error) => {
        console.error("Error fetching inventory data:", error);
      });
  }
  
  // Hàm hiển thị dữ liệu tồn kho
  function displayInventory(data) {
    const inventoryContainer = document.querySelector(".sales-boxes .recent-sales .sales-details");
    if (!inventoryContainer) return;
  
    // Kiểm tra nếu data là mảng
    if (Array.isArray(data)) {
      inventoryContainer.innerHTML = `
        <ul class="details">
          <li class="topic">Product ID</li>
          ${data.map((item) => `<li>${item.productId}</li>`).join("")}
        </ul>
        <ul class="details">
          <li class="topic">Product Name</li>
          ${data.map((item) => `<li>${item.name}</li>`).join("")}
        </ul>
        <ul class="details">
          <li class="topic">Stock Quantity</li>
          ${data.map((item) => `<li>${item.inventoryQuantity}</li>`).join("")}
        </ul>
      `;
    } else {
      // Nếu data không phải là mảng, hiển thị thông báo lỗi
      inventoryContainer.innerHTML = `<p>No inventory data available.</p>`;
      console.error("Expected an array for 'data', but got:", data);
    }
  }
  
// Gắn sự kiện cho các nút để gọi API với loại "most" hoặc "least"
document.getElementById("btn-most").addEventListener("click", () => {
    console.log("Fetching data...");
  fetchInventory("most");
  
});

document.getElementById("btn-least").addEventListener("click", () => {
    console.log("Fetching data...");

  fetchInventory("least");
});

// Hàm gọi API và cập nhật danh sách nhà cung cấp
function fetchTopSuppliers(endpoint, containerId, title, key) {
  const url = `${endpoint}?limit=5`;
  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      displaySuppliers(data, containerId, title, key);
    })
    .catch((error) => {
      console.error(`Error fetching from ${endpoint}:`, error);
    });
}

// Hàm hiển thị danh sách nhà cung cấp
function displaySuppliers(data, containerId, title, key) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = `
    <div class="title">${title}</div>
    <ul class="top-sales-details">
      <li>
        <span class="product">Supplier ID</span>
        <span class="product">Supplier Name</span>
        <span class="price">${key === "totalProducts" ? "Total Products" : "Total Imports"}</span>
      </li>
      ${data.map((supplier) => `
        <li>
          <span class="product">${supplier.supplierId}</span>
          <span class="product">${supplier.supplierName}</span>
          <span class="price">${supplier[key]}</span>
        </li>
      `).join("")}
    </ul>
  `;
}

// Khi trang tải xong, tự động gọi các API
document.addEventListener("DOMContentLoaded", () => {
  // Gọi API cho top nhà cung cấp theo số lượng sản phẩm
  fetchTopSuppliers(
    "http://160.191.50.248:8080/api/overview/top-suppliers-by-products",
    "top-suppliers-products",
    "Top nhà cung cấp theo số lượng sản phẩm",
    "totalProducts"
  );

  // Gọi API cho top nhà cung cấp theo số lượng phiếu nhập
  fetchTopSuppliers(
    "http://160.191.50.248:8080/api/overview/top-suppliers-by-imports",
    "top-suppliers-imports",
    "Top nhà cung cấp theo số lượng phiếu nhập",
    "totalImports"
  );
});
