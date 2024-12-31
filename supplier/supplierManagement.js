//ducanhdangancom
// Show/Hide Navbar Menu
const showMenu = (toggleId, navbarId, bodyId) => {
    const toggle = document.getElementById(toggleId),
          navbar = document.getElementById(navbarId),
          bodyPadding = document.getElementById(bodyId);
    if (toggle && navbar) {
        toggle.addEventListener('click', () => {
            navbar.classList.toggle('show');
            toggle.classList.toggle('rotate');
            bodyPadding.classList.toggle('expander');
        });
    }
};


showMenu('nav_toggle', 'navbar', 'body');

// Manage Add Supplier Form Visibility
const closeIcon = document.querySelector(".icon-close");
const addSupplierBtn = document.getElementById("add-supplier-btn");
const openAddSupplier = document.querySelector(".supplier-form");

addSupplierBtn.addEventListener("click", () => {
    openAddSupplier.classList.add("active");
    addSupplierBtn.classList.add("close");
});
closeIcon.addEventListener("click", () => {
    openAddSupplier.classList.remove("active");
    addSupplierBtn.classList.remove("close");
});

// Display Suppliers
function showListSuppliers() {
    fetch('http://160.191.50.248:8080/api/suppliers/get-all')
        .then(response => response.json())
        .then(data => {
            displaySuppliers(data.slice(0, 8)); 
        })
        .catch(error => {
            console.error("Error: ", error);
        });
}
showListSuppliers();

// Add Supplier
document.getElementById("save-supplier").addEventListener("click", (e) => {
    e.preventDefault();
    const newSupplier = {
        name: document.getElementById("supplier-name").value,
        contactNumber: document.getElementById("supplier-contactNumber").value,
        address: document.getElementById("supplier-address").value
    };
    fetch('http://160.191.50.248:8080/api/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSupplier)
    })
    .then(response => {
        if (!response.ok) throw new Error(`HTTP error! Status:${response.status}`);
        showListSuppliers();
        openAddSupplier.classList.remove("active");
        addSupplierBtn.classList.remove("close");
        showNotificationOk("Supplier added successfully!"); // Thông báo thành công
    })
    .catch(error => {
        console.error("Error:", error);
        showNotificationError("Failed to add supplier."); // Thông báo lỗi
    });
});



// Delete Supplier
function deleteSupplier(supplierId, event) {
    event.preventDefault();
    fetch(`http://localhost:3000/supplier/${supplierId}`, {
        method: "DELETE",
    })
        .then(response => response.json())
        .then(data => {
            console.log(data.message);

            const rowToDelete = document.getElementById(`supplier-row-${supplierId}`);
            if (rowToDelete) {
                rowToDelete.remove();
            }
            showListSuppliers();
            showNotificationOk("Supplier deleted successfully!"); // Thông báo thành công
        })
        .catch(error => {
            console.error("Error deleting supplier: ", error);
            showNotificationError("Failed to delete supplier."); // Thông báo lỗi
        });
}


// Edit Supplier
function toggleEditSupplier(supplierId, event) {
    event.preventDefault();

    const editButton = document.getElementById(`edit-button-${supplierId}`);
    const rowSupplier = document.getElementById(`supplier-row-${supplierId}`);

    // Check if elements exist
    if (!editButton || !rowSupplier) {
        console.error("Edit button or supplier row not found.");
        return;
    }

    const nameCell = document.getElementById(`supplier-name-${supplierId}`);
    const contactCell = document.getElementById(`supplier-contactNumber-${supplierId}`);
    const addressCell = document.getElementById(`supplier-address-${supplierId}`);

    if (!nameCell || !contactCell || !addressCell) {
        console.error("One or more editable cells not found.");
        return;
    }

    const isEditing = editButton.innerText === "Edit";

    if (isEditing) {
        // Enable editing
        rowSupplier.style.background = "white";
        rowSupplier.style.color = "black";
        nameCell.contentEditable = "true";
        contactCell.contentEditable = "true";
        addressCell.contentEditable = "true";
        editButton.innerText = "Save";
    } else {
        // Collect updated data and disable editing
        const updatedSupplier = {
            name: nameCell.innerText,
            contact: contactCell.innerText,
            address: addressCell.innerText
        };

        updateSupplier(supplierId, updatedSupplier);
        nameCell.contentEditable = "false";
        contactCell.contentEditable = "false";
        addressCell.contentEditable = "false";
        rowSupplier.style.background = "";
        rowSupplier.style.color = "";
        editButton.innerText = "Edit";
    }
}


// Update Supplier
function updateSupplier(supplierId, updatedSupplier) {
    fetch(`http://localhost:3000/supplier/${supplierId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedSupplier),
    })
        .then(response => response.json())
        .then(data => {
            console.log(data.message);
            showListSuppliers();
            showNotificationOk("Supplier Update Successfull");
        })
        .catch(error => {
            console.error("Error:", error);
            showNotificationError(error.message);
        });
}

// Render Suppliers in Table
function displaySuppliers(suppliers) {
    const tableBodySupplier = document.getElementById("supplier-table-body");

    if (!tableBodySupplier) {
        console.error("Supplier table body not found.");
        return;
    }

    tableBodySupplier.innerHTML = ""; // Clear the table body

    if (!suppliers || suppliers.length === 0) {
        tableBodySupplier.innerHTML = "<tr><td colspan='6'>No suppliers found.</td></tr>";
        return;
    }

    suppliers.forEach(supplier => {
        const row = `
            <tr id="supplier-row-${supplier.supplierID}">
                <td>${supplier.supplierID}</td>
                <td contenteditable="false" id="supplier-name-${supplier.supplierID}">${supplier.name}</td>
                <td contenteditable="false" id="supplier-contactNumber-${supplier.supplierID}">${supplier.contactNumber}</td>
                <td contenteditable="false" id="supplier-address-${supplier.supplierID}">${supplier.address}</td>
                <td>
                    <button id="edit-button-${supplier.supplierID}" onclick="toggleEditSupplier('${supplier.supplierID}', event)" class="edit-btn">Edit</button>
                    <button onclick="deleteSupplier('${supplier.supplierID}', event)" class="delete-btn">Delete</button>
                    <button onclick="addProductToSupplier('${supplier.supplierID}')" class="add-product-btn">Add Product</button>
                </td>
            </tr>`;
        tableBodySupplier.innerHTML += row;
    });
}



// Notifications
const showNotificationError = (message) => {
    const notification = document.getElementById("notification-error");
    if (notification) { // Check if the notification element exists
        notification.style.display = "flex";
        const contentError = document.getElementById("content-error");
        if (contentError) contentError.innerText = message;
        setTimeout(() => (notification.style.display = "none"), 4000);
    } else {
        console.error("Notification Error element not found.");
    }
};

const showNotificationOk = (message) => {
    const notification = document.getElementById("notification-ok");
    if (notification) { // Check if the notification element exists
        notification.style.display = "flex";
        const contentOk = document.getElementById("content-ok");
        if (contentOk) contentOk.innerText = message;
        setTimeout(() => (notification.style.display = "none"), 4000);
    } else {
        console.error("Notification OK element not found.");
    }
};


// Search in frontend
async function searchSuppliers() {
    try {
        const searchTerm = document.getElementById("search-text").value.toLowerCase();
        const response = await fetch('http://160.191.50.248:8080/api/suppliers/get-all'); 
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const allSuppliers = await response.json();
        const filteredSuppliers = allSuppliers.filter(supplier => {
            const id = supplier.supplierID ? supplier.supplierID.toString().toLowerCase() : ""; 
            const name = supplier.name ? supplier.name.toLowerCase() : ""; 
            const contactNumber = supplier.contactNumber ? supplier.contactNumber.toLowerCase() : ""; 
            const Address = supplier.Address ? supplier.Address.toLowerCase() : ""; 
 
            return (
                id.includes(searchTerm) ||
                name.includes(searchTerm) ||
                contactNumber.includes(searchTerm) ||
                Address.includes(searchTerm)
            );
        });
        displaySuppliers(filteredSuppliers);
    } catch (error) {
        console.error("Error:", error);
    }
}
 
 
 
// Event listeners for the search functionality
document.getElementById("search-button").addEventListener("click", searchSuppliers);
document.getElementById("search-text").addEventListener("input", searchSuppliers);
 
 
 
// Add event listener to toggle supplier view
document.getElementById("view-all-btn").addEventListener("click", (event) => {
    event.preventDefault();
    viewAllOrHideSuppliers()();
});


function displaySuppliers(suppliers) {
    const tableBodySupplier = document.getElementById("supplier-table-body");

    if (!tableBodySupplier) {
        console.error("Supplier table body not found.");
        return;
    }

    tableBodySupplier.innerHTML = ""; // Clear the table body

    if (!suppliers || suppliers.length === 0) {
        tableBodySupplier.innerHTML = "<tr><td colspan='6'>No suppliers found.</td></tr>";
        return;
    }

    suppliers.forEach(supplier => {
        const row = `
            <tr id="supplier-row-${supplier.supplierID}">
                <td>${supplier.supplierID}</td>
                <td contenteditable="false" id="supplier-name-${supplier.supplierID}">${supplier.name}</td>
                <td contenteditable="false" id="supplier-contactNumber-${supplier.supplierID}">${supplier.contactNumber}</td>
                <td contenteditable="false" id="supplier-address-${supplier.supplierID}">${supplier.address}</td>
                <td>
                    <button id="edit-button-${supplier.supplierID}" onclick="toggleEditSupplier('${supplier.supplierID}', event)" class="edit-btn">Edit</button>
                    <button onclick="deleteSupplier('${supplier.supplierID}', event)" class="delete-btn">Delete</button>
                    <button onclick="viewSupplierProducts('${supplier.supplierID}')" class="view-btn">View</button>
                </td>
            </tr>`;
        tableBodySupplier.innerHTML += row;
    });
}



// View Product
function viewSupplierProducts(supplierID) {
    const modal = document.getElementById("product-modal");
    const modalContent = modal.querySelector(".modal-content");
    const modalSupplierId = document.getElementById("modal-supplier-id");
    const modalProductTableBody = document.getElementById("modal-product-table").querySelector("tbody");

    if (!modal || !modalContent || !modalSupplierId || !modalProductTableBody) {
        console.error("Modal or related elements not found!");
        return;
    }

    modalSupplierId.textContent = supplierID;

    fetch(`http://160.191.50.248:8080/api/suppliers/${supplierID}/products`)
        .then((response) => response.json())
        .then((products) => {
            modalProductTableBody.innerHTML = ""; // Xóa nội dung cũ

            if (products && products.length > 0) {
                products.forEach((product) => {
                    const row = `
                        <tr>
                            <td>${product.productID}</td>
                            <td>${product.productName}</td>
                            <td>${product.price}</td>
                            <td>${product.quantity}</td>
                            <td>
                                <button 
                                    class="delete-product-btn" 
                                    onclick="deleteProduct('${supplierID}', '${product.productID}')"
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>`;
                    modalProductTableBody.innerHTML += row;
                });
            } else {
                modalProductTableBody.innerHTML = "<tr><td colspan='5'>No products found.</td></tr>";
            }

            modal.classList.add("show");
            setTimeout(() => {
                modalContent.classList.add("show");
            }, 100);
        })
        .catch((error) => {
            console.error("Error fetching products:", error);
            modalProductTableBody.innerHTML = "<tr><td colspan='5'>Failed to fetch products.</td></tr>";
            modal.classList.add("show");
            setTimeout(() => {
                modalContent.classList.add("show");
            }, 100);
        });
}

// Đóng modal khi nhấn nút X
document.getElementById("close-modal").addEventListener("click", () => {
    const modal = document.getElementById("product-modal");
    const modalContent = modal.querySelector(".modal-content");

    // Xóa lớp hiển thị modal
    modalContent.classList.remove("show");
    setTimeout(() => {
        modal.classList.remove("show");
    }, 300); // Thời gian delay cho hiệu ứng
});



let isViewAll = false; 
let isSortedAscending = true; 
let sortedSuppliers = []; 
let originalSuppliers = []; 

function fetchAndRenderSuppliers() {
    const url = 'http://160.191.50.248:8080/api/suppliers/get-all';

    fetch(url)
        .then(response => response.json())
        .then(data => {
            originalSuppliers = [...data]; 
            sortedSuppliers = [...data]; 
            renderSuppliers(isViewAll ? sortedSuppliers : sortedSuppliers.slice(0, 8)); 
        })
        .catch(error => {
            console.error("Error fetching suppliers:", error); 
            showNotificationError("Failed to fetch suppliers.");
        });
}

function renderSuppliers(suppliers) {
    const supplierTableBody = document.getElementById("supplier-table-body");
    supplierTableBody.innerHTML = ""; 

    suppliers.forEach(supplier => {
        const row = `
            <tr id="supplier-row-${supplier.supplierID}">
                <td>${supplier.supplierID}</td>
                <td>${supplier.name}</td>
                <td>${supplier.contactNumber}</td>
                <td>${supplier.address}</td>
                <td>
                    <button id="edit-button-${supplier.supplierID}" onclick="toggleEditSupplier('${supplier.supplierID}', event)" class="edit-btn">Edit</button>
                    <button onclick="deleteSupplier('${supplier.supplierID}', event)" class="delete-btn">Delete</button>
                    <button onclick="viewSupplierProducts('${supplier.supplierID}')" class="view-btn">View</button>
                </td>
            </tr>
        `;
        supplierTableBody.innerHTML += row;
    });
}

// Hàm sắp xếp theo tên nhà cung cấp
function sortSuppliers() {
    let sortedList;
    if (isSortedAscending) {
        // Sắp xếp từ A-Z
        sortedList = [...originalSuppliers].sort((a, b) => a.name.localeCompare(b.name));
    } else {
        // Sắp xếp từ Z-A
        sortedList = [...originalSuppliers].sort((a, b) => b.name.localeCompare(a.name));
    }

    // Cập nhật danh sách đã sắp xếp
    sortedSuppliers = sortedList;

    renderSuppliers(isViewAll ? sortedSuppliers : sortedSuppliers.slice(0, 8));

    isSortedAscending = !isSortedAscending;
}

document.getElementById("sort-name").addEventListener("click", () => {
    sortSuppliers(); 
});

const viewAllButton = document.getElementById("view-all-btn");
viewAllButton.addEventListener("click", () => {
    if (isViewAll) {
        renderSuppliers(sortedSuppliers.slice(0, 8)); 
        viewAllButton.textContent = "View All"; 
        isViewAll = false;
    } else {
        renderSuppliers(sortedSuppliers); 
        viewAllButton.textContent = "Hide"; 
        isViewAll = true;
    }
});

window.addEventListener('DOMContentLoaded', fetchAndRenderSuppliers);




// Đảm bảo sự kiện click cho nút "Add Product"
document.getElementById('add-product-btn').addEventListener('click', function () {
    const supplierID = document.getElementById('modal-supplier-id').textContent; // Lấy Supplier ID từ modal
    const productID = document.getElementById('input-product-id').value; // Lấy Product ID từ input

    if (!productID) {
        document.getElementById('product-message').textContent = "Please enter a Product ID!";
        return;
    }

    // Gửi dữ liệu lên server (hoặc xử lý tại chỗ nếu không có server)
    fetch(`http://160.191.50.248:8080/api/suppliers/${supplierID}/products/${productID}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
            }
            // Kiểm tra nếu phản hồi là JSON
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
                return response.json(); // Phản hồi là JSON
            } else {
                return response.text(); // Phản hồi là text
            }
        })
        .then(data => {
            if (typeof data === "string") {
                console.log("Response is plain text:", data);
                document.getElementById('product-message').textContent = data;
            } else {
                console.log("Response is JSON:", data);
                document.getElementById('product-message').textContent = data.message;
            }
        })
        .catch(error => {
            console.error('Error:', error);
            document.getElementById('product-message').textContent = "Failed to add product: " + error.message;
        });
});








// Manage Add Product to Supplier Form Visibility
const addProductSupplierBtn = document.getElementById("add-product-supplier-btn");
const closeProductSupplierForm = document.getElementById("close-product-supplier-form");
const productSupplierForm = document.getElementById("add-product-supplier-form");

addProductSupplierBtn.addEventListener("click", () => {
    productSupplierForm.classList.add("active");
    addProductSupplierBtn.classList.add("close");
});

closeProductSupplierForm.addEventListener("click", () => {
    productSupplierForm.classList.remove("active");
    addProductSupplierBtn.classList.remove("close");
});

// Add Product to Supplier
document.getElementById("save-product-supplier").addEventListener("click", (e) => {
    e.preventDefault();
    
    const supplierId = document.getElementById("product-supplier-id").value.trim();
    const productId = document.getElementById("product-id").value.trim();

    // Validate inputs
    if (!supplierId || !productId) {
        showNotificationError("Please enter both Supplier ID and Product ID");
        return;
    }

    // Prepare the payload
    const payload = {
        supplierId: supplierId,
        productId: productId
    };

    // Fetch request to add product to supplier
    fetch('http://160.191.50.248:8080/api/suppliers/add-product', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json' 
        },
        body: JSON.stringify(payload)
    })
    .then(response => {
        // Check if the response is successful
        if (!response.ok) {
            // If response is not OK, try to parse error message
            return response.json().then(errorData => {
                throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
            }).catch(() => {
                // Fallback error if JSON parsing fails
                throw new Error(`HTTP error! Status: ${response.status}`);
            });
        }
        return response.json();
    })
    .then(data => {
        // Success notification
        showNotificationOk("Product successfully added to supplier!");
        
        // Close the form
        productSupplierForm.classList.remove("active");
        addProductSupplierBtn.classList.remove("close");
        
        // Clear input fields
        document.getElementById("product-supplier-id").value = '';
        document.getElementById("product-id").value = '';
    })
    .catch(error => {
        // Error notification
        console.error("Error adding product to supplier:", error);
        showNotificationError(error.message || "Failed to add product to supplier.");
    });
});


async function deleteProduct(supplierID, productID) {
    // Hiển thị hộp thoại xác nhận
    const userConfirmed = confirm(`Are you sure you want to delete Product ID: ${productID}?`);
    if (!userConfirmed) {
        return; // Người dùng hủy hành động xóa
    }

    try {
        console.log(`Deleting Product ID: ${productID} from Supplier ID: ${supplierID}`);
        console.log(`Request URL: http://160.191.50.248:8080/api/suppliers/${supplierID}/products/${productID}`);

        // Gửi yêu cầu DELETE tới API
        const response = await fetch(`http://160.191.50.248:8080/api/suppliers/${supplierID}/products/${productID}`, {
            method: 'DELETE',
        });

        console.log("Response Status:", response.status); // Log mã trạng thái phản hồi

        // Kiểm tra phản hồi từ backend
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({})); // Parse JSON nếu có thể
            const errorMessage = errorData.message || `HTTP error! Status: ${response.status}`;
            throw new Error(errorMessage);
        }

        const data = await response.json();
        alert(`Product deleted successfully: ${data.message || ''}`);

        // Cập nhật lại danh sách sản phẩm sau khi xóa
        viewSupplierProducts(supplierID);
    } catch (error) {
        console.error("Error deleting product:", error); // Log chi tiết lỗi
        alert(`Failed to delete product: ${error.message}`);
    }
}


