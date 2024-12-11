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
    fetch('https://backend-ims-zuqh.onrender.com/api/suppliers/get-all')
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
    fetch('https://backend-ims-zuqh.onrender.com/api/suppliers', {
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
        const response = await fetch('https://backend-ims-zuqh.onrender.com/api/suppliers/get-all'); 
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

    fetch(`https://backend-ims-zuqh.onrender.com/api/suppliers/${supplierID}/products`)
        .then((response) => response.json())
        .then((products) => {
            modalProductTableBody.innerHTML = "";

            if (products && products.length > 0) {
                products.forEach((product) => {
                    const row = `
                        <tr>
                            <td>${product.productID}</td>
                            <td>${product.produName}</td>
                            <td>${product.price}</td>
                            <td>${product.quantity}</td>
                        </tr>`;
                    modalProductTableBody.innerHTML += row;
                });
            } else {
                modalProductTableBody.innerHTML = "<tr><td colspan='4'>No products found.</td></tr>";
            }
            modal.classList.add("show");
            setTimeout(() => {
                modalContent.classList.add("show");
            }, 100); 
        })
        .catch((error) => {
            console.error("Error fetching products:", error);
            modalProductTableBody.innerHTML = "<tr><td colspan='4'>Failed to fetch products.</td></tr>";
            modal.classList.add("show");
            setTimeout(() => {
                modalContent.classList.add("show");
            }, 100);
        });

}
document.getElementById("close-modal").onclick = function () {
    const modal = document.getElementById("product-modal");
    const modalContent = modal.querySelector(".modal-content");

    modalContent.classList.remove("show");
    setTimeout(() => {
        modal.classList.remove("show");
    }, 500); 
};



let isViewAll = false; 
let isSortedAscending = true; 
let sortedSuppliers = []; 
let originalSuppliers = []; 

function fetchAndRenderSuppliers() {
    const url = 'https://backend-ims-zuqh.onrender.com/api/suppliers/get-all';

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



// Lấy các phần tử DOM
const addProductToSupplierForm = document.getElementById("add-product-to-supplier-form");
const addProductToSupplierModal = document.getElementById("add-product-to-supplier-modal");
const closeAddProductToSupplierModal = document.getElementById("close-add-product-to-supplier-modal");

// Khi nhấn vào nút "Add Product" trong modal
addProductToSupplierForm.addEventListener("submit", (event) => {
    event.preventDefault(); // Ngăn chặn hành vi mặc định của form

    // Lấy Product ID từ trường input
    const productID = document.getElementById("modalProductID").value.trim();

    // Lấy Supplier ID từ phần tử modal hiển thị danh sách sản phẩm (có thể được hiển thị trong một span hoặc id)
    const supplierID = document.getElementById("supplier-id").textContent.trim();  // Ví dụ supplier-id là nơi chứa Supplier ID

    // Kiểm tra xem Product ID và Supplier ID đã được nhập chưa
    if (!productID || !supplierID) {
        alert("Please provide both Product ID and Supplier ID.");
        return;
    }

    // Gửi yêu cầu POST đến API để thêm sản phẩm cho nhà cung cấp
    fetch(`https://backend-ims-zuqh.onrender.com/api/suppliers/${supplierID}/products/${productID}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            productID,  // Product ID được nhập từ form
            supplierID, // Supplier ID lấy từ modal hiển thị danh sách sản phẩm
        }),
    })
        .then((response) => {
            if (!response.ok) {
                return response.json().then((error) => {
                    throw new Error(
                        `Failed to add product. Status: ${response.status}, Message: ${error.message}`
                    );
                });
            }
            return response.json();
        })
        .then((data) => {
            // Hiển thị thông báo thành công
            alert(`Product added successfully: ${JSON.stringify(data)}`);

            // Đóng modal
            addProductToSupplierModal.style.display = "none";
            addProductToSupplierForm.reset(); // Reset form
        })
        .catch((error) => {
            // Hiển thị thông báo lỗi
            alert(`Error: ${error.message}`);
        });
});

// Đóng modal khi nhấn nút "Close"
closeAddProductToSupplierModal.addEventListener("click", () => {
    addProductToSupplierModal.style.display = "none"; // Đóng modal
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
        supplierID: supplierId,
        productID: productId
    };

    // Fetch request to add product to supplier
    fetch('https://backend-ims-zuqh.onrender.com/api/suppliers/add-product', {
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
