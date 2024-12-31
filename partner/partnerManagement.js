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

// Manage Add partners Form Visibility
const closeIcon = document.querySelector(".icon-close");
const addpartnersBtn = document.getElementById("add-partners-btn");
const openAddpartners = document.querySelector(".partners-form");

addpartnersBtn.addEventListener("click", () => {
    openAddpartners.classList.add("active");
    addpartnersBtn.classList.add("close");
});
closeIcon.addEventListener("click", () => {
    openAddpartners.classList.remove("active");
    addpartnersBtn.classList.remove("close");
});

// Display partners
function showListpartners() {
    fetch('http://160.191.50.248:8080/api/partners/get-all')
        .then(response => response.json())
        .then(data => {
            displaypartners(data.slice(0, 8)); 
        })
        .catch(error => {
            console.error("Error: ", error);
        });
}
showListpartners();

// Add partners
document.getElementById("save-partners").addEventListener("click", (e) => {
    e.preventDefault();
    const newpartners = {
        name: document.getElementById("partners-name").value,
        contactNumber: document.getElementById("partners-contactNumber").value,
        address: document.getElementById("partners-address").value
    };
    fetch('http://160.191.50.248:8080/api/partners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newpartners)
    })
    .then(response => {
        if (!response.ok) throw new Error(`HTTP error! Status:${response.status}`);
        showListpartners();
        openAddpartners.classList.remove("active");
        addpartnersBtn.classList.remove("close");
        showNotificationOk("partners added successfully!"); // Thông báo thành công
    })
    .catch(error => {
        console.error("Error:", error);
        showNotificationError("Failed to add partners."); // Thông báo lỗi
    });
});



// Delete partners
function deletepartners(partnersId, event) {
    event.preventDefault();
    fetch(`/partners/${partnersId}`, {
        method: "DELETE",
    })
        .then(response => response.json())
        .then(data => {
            console.log(data.message);

            const rowToDelete = document.getElementById(`partners-row-${partnersId}`);
            if (rowToDelete) {
                rowToDelete.remove();
            }
            showListpartners();
            showNotificationOk("partners deleted successfully!"); // Thông báo thành công
        })
        .catch(error => {
            console.error("Error deleting partners: ", error);
            showNotificationError("Failed to delete partners."); // Thông báo lỗi
        });
}


// Edit partners
function toggleEditpartners(partnersId, event) {
    event.preventDefault();

    const editButton = document.getElementById(`edit-button-${partnersId}`);
    const rowpartners = document.getElementById(`partners-row-${partnersId}`);

    // Check if elements exist
    if (!editButton || !rowpartners) {
        console.error("Edit button or partners row not found.");
        return;
    }

    const nameCell = document.getElementById(`partners-name-${partnersId}`);
    const contactCell = document.getElementById(`partners-contactNumber-${partnersId}`);
    const addressCell = document.getElementById(`partners-address-${partnersId}`);

    if (!nameCell || !contactCell || !addressCell) {
        console.error("One or more editable cells not found.");
        return;
    }

    const isEditing = editButton.innerText === "Edit";

    if (isEditing) {
        // Enable editing
        rowpartners.style.background = "white";
        rowpartners.style.color = "black";
        nameCell.contentEditable = "true";
        contactCell.contentEditable = "true";
        addressCell.contentEditable = "true";
        editButton.innerText = "Save";
    } else {
        // Collect updated data and disable editing
        const updatedpartners = {
            name: nameCell.innerText,
            contact: contactCell.innerText,
            address: addressCell.innerText
        };

        updatepartners(partnersId, updatedpartners);
        nameCell.contentEditable = "false";
        contactCell.contentEditable = "false";
        addressCell.contentEditable = "false";
        rowpartners.style.background = "";
        rowpartners.style.color = "";
        editButton.innerText = "Edit";
    }
}


// Update partners
function updatepartners(partnersId, updatedpartners) {
    fetch(`http://localhost:3000/partners/${partnersId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedpartners),
    })
        .then(response => response.json())
        .then(data => {
            console.log(data.message);
            showListpartners();
            showNotificationOk("partners Update Successfull");
        })
        .catch(error => {
            console.error("Error:", error);
            showNotificationError(error.message);
        });
}

// Render partners in Table
function displaypartners(partners) {
    const tableBodypartners = document.getElementById("partners-table-body");

    if (!tableBodypartners) {
        console.error("partners table body not found.");
        return;
    }

    tableBodypartners.innerHTML = ""; // Clear the table body

    if (!partners || partners.length === 0) {
        tableBodypartners.innerHTML = "<tr><td colspan='6'>No partners found.</td></tr>";
        return;
    }

    partners.forEach(partners => {
        const row = `
            <tr id="partners-row-${partners.partnerID}">
                <td>${partners.partnerID}</td>
                <td contenteditable="false" id="partners-name-${partners.partnerID}">${partners.name}</td>
                <td contenteditable="false" id="partners-contactNumber-${partners.partnerID}">${partners.contactNumber}</td>
                <td contenteditable="false" id="partners-address-${partners.partnerID}">${partners.address}</td>
                <td>
                    <button id="edit-button-${partners.partnerID}" onclick="toggleEditpartners('${partners.partnerID}', event)" class="edit-btn">Edit</button>
                    <button onclick="deletepartners('${partners.partnerID}', event)" class="delete-btn">Delete</button>
                </td>
            </tr>`;
        tableBodypartners.innerHTML += row;
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
async function searchpartners() {
    try {
        const searchTerm = document.getElementById("search-text").value.toLowerCase();
        const response = await fetch('http://160.191.50.248:8080/api/partners/get-all'); 
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const allpartners = await response.json();
        const filteredpartners = allpartners.filter(partners => {
            const id = partners.partnersID ? partners.partnersID.toString().toLowerCase() : ""; 
            const name = partners.name ? partners.name.toLowerCase() : ""; 
            const contactNumber = partners.contactNumber ? partners.contactNumber.toLowerCase() : ""; 
            const Address = partners.Address ? partners.Address.toLowerCase() : ""; 
 
            return (
                id.includes(searchTerm) ||
                name.includes(searchTerm) ||
                contactNumber.includes(searchTerm) ||
                Address.includes(searchTerm)
            );
        });
        displaypartners(filteredpartners);
    } catch (error) {
        console.error("Error:", error);
    }
}
 
 
 
// Event listeners for the search functionality
document.getElementById("search-button").addEventListener("click", searchpartners);
document.getElementById("search-text").addEventListener("input", searchpartners);
 
 
 
// Add event listener to toggle partners view
document.getElementById("view-all-btn").addEventListener("click", (event) => {
    event.preventDefault();
    viewAllOrHidepartners()();
});


function displaypartners(partners) {
    const tableBodypartners = document.getElementById("partners-table-body");

    if (!tableBodypartners) {
        console.error("partners table body not found.");
        return;
    }

    tableBodypartners.innerHTML = ""; // Clear the table body

    if (!partners || partners.length === 0) {
        tableBodypartners.innerHTML = "<tr><td colspan='6'>No partners found.</td></tr>";
        return;
    }

    partners.forEach(partners => {
        const row = `
            <tr id="partners-row-${partners.partnerID}">
                <td>${partners.partnerID}</td>
                <td contenteditable="false" id="partners-name-${partners.partnerID}">${partners.name}</td>
                <td contenteditable="false" id="partners-contactNumber-${partners.partnerID}">${partners.contactNumber}</td>
                <td contenteditable="false" id="partners-address-${partners.partnerID}">${partners.address}</td>
                <td>
                    <button id="edit-button-${partners.partnerID}" onclick="toggleEditpartners('${partners.partnerID}', event)" class="edit-btn">Edit</button>
                    <button onclick="deletepartners('${partners.partnerID}', event)" class="delete-btn">Delete</button>
                </td>
            </tr>`;
        tableBodypartners.innerHTML += row;
    });
}

let isViewAll = false; 
let isSortedAscending = true; 
let sortedpartners = []; 
let originalpartners = []; 

function fetchAndRenderpartners() {
    const url = 'http://160.191.50.248:8080/api/partners/get-all';

    fetch(url)
        .then(response => response.json())
        .then(data => {
            originalpartners = [...data]; 
            sortedpartners = [...data]; 
            renderpartners(isViewAll ? sortedpartners : sortedpartners.slice(0, 8)); 
        })
        .catch(error => {
            console.error("Error fetching partners:", error); 
            showNotificationError("Failed to fetch partners.");
        });
}

function renderpartners(partners) {
    const partnersTableBody = document.getElementById("partners-table-body");
    partnersTableBody.innerHTML = ""; 

    partners.forEach(partners => {
        const row = `
            <tr id="partners-row-${partners.partnersID}">
                <td>${partners.partnersID}</td>
                <td>${partners.name}</td>
                <td>${partners.contactNumber}</td>
                <td>${partners.address}</td>
                <td>
                    <button id="edit-button-${partners.partnersID}" onclick="toggleEditpartners('${partners.partnersID}', event)" class="edit-btn">Edit</button>
                    <button onclick="deletepartners('${partners.partnersID}', event)" class="delete-btn">Delete</button>
                </td>
            </tr>
        `;
        partnersTableBody.innerHTML += row;
    });
}

// Hàm sắp xếp theo tên nhà cung cấp
function sortpartners() {
    let sortedList;
    if (isSortedAscending) {
        // Sắp xếp từ A-Z
        sortedList = [...originalpartners].sort((a, b) => a.name.localeCompare(b.name));
    } else {
        // Sắp xếp từ Z-A
        sortedList = [...originalpartners].sort((a, b) => b.name.localeCompare(a.name));
    }

    // Cập nhật danh sách đã sắp xếp
    sortedpartners = sortedList;

    renderpartners(isViewAll ? sortedpartners : sortedpartners.slice(0, 8));

    isSortedAscending = !isSortedAscending;
}

document.getElementById("sort-name").addEventListener("click", () => {
    sortpartners(); 
});

const viewAllButton = document.getElementById("view-all-btn");
viewAllButton.addEventListener("click", () => {
    if (isViewAll) {
        renderpartners(sortedpartners.slice(0, 8)); 
        viewAllButton.textContent = "View All"; 
        isViewAll = false;
    } else {
        renderpartners(sortedpartners); 
        viewAllButton.textContent = "Hide"; 
        isViewAll = true;
    }
});

window.addEventListener('DOMContentLoaded', fetchAndRenderpartners);





