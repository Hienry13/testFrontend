const be_url = "https://160.191.50.248";
const userId = localStorage.getItem("userId") || "Guest";
const userName = localStorage.getItem("username") || "Unknown User";

// Hiển thị thông tin người dùng
document.querySelector(".ac-detail-name").innerText = userName;
document.querySelector(".ac-detail-id").innerText = `ID: ${userId}`;

// Xử lý đăng xuất
document.querySelector(".ac-detail-checkout").onclick = () => {
    localStorage.clear();
    window.location.href = "login.html";
};

// Hàm tạo biểu đồ chung
const createChart = (ctxId, type, labels, data, colors, label) => {
    const ctx = document.getElementById(ctxId).getContext("2d");
    return new Chart(ctx, {
        type,
        data: {
            labels,
            datasets: [
                {
                    label,
                    data,
                    backgroundColor: colors.bgColors,
                    borderColor: colors.borderColors,
                    borderWidth: 1,
                },
            ],
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: "top" },
            },
            scales: {
                y: { beginAtZero: true },
            },
        },
    });
};

// Hàm xử lý thông báo lỗi
const showError = (message) => {
    console.error(message);
    Toastify({
        text: message,
        duration: 3000,
        backgroundColor: "#ff0000",
    }).showToast();
};

// Hàm lấy dữ liệu API và xử lý
const fetchData = async (url) => {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }
        return await response.json();
    } catch (error) {
        showError("Có lỗi xảy ra khi lấy dữ liệu.");
        throw error;
    }
};
// Function để vẽ biểu đồ từ dữ liệu nhận được
function renderChart(data, period) {
    const labels = [];
    const totals = [];

    // Tạo mảng labels và totals từ dữ liệu nhận được
    if (period === "week") {
        data.forEach(item => {
            labels.push(`Tuần ${item.week}`);
            totals.push(item.total);
        });
    } else if (period === "month") {
        data.forEach(item => {
            labels.push(`Tháng ${item.month}`);
            totals.push(item.total);
        });
    }

    // Xóa biểu đồ cũ nếu có
    if (window.myChart) {
        window.myChart.destroy();
    }

    // Vẽ lại biểu đồ mới
    const ctx = document.getElementById('myChart').getContext('2d');
    window.myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: `Số lượng phiếu ${period === 'week' ? 'theo tuần' : 'theo tháng'}`,
                data: totals,
                backgroundColor: 'rgba(75, 192, 192, 0.5)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
            }],
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
            },
            scales: {
                y: {
                    beginAtZero: true,
                },
            },
        },
    });
}

// Function gọi API khi nhấn nút Thống kê
document.getElementById("submit-report").onclick = function () {
    const type = document.getElementById("type").value;
    const period = document.getElementById("period").value;
    const year = document.getElementById("year").value;
    const month = document.getElementById("month").value;

    // Xử lý Fetch API để lấy dữ liệu
    fetchStatistics(type, period, year, month);
};

// Function fetch dữ liệu từ API
function fetchStatistics(type, period, year, month) {
    // Set the default year if not provided
    const currentYear = new Date().getFullYear();
    year = year || currentYear;

    let url = `${be_url}/api/report/statistics?type=${type}&period=${period}&year=${year}`;
    if (period === "week" || period === "month") {
        url += `&month=${month}`;
    }

    fetch(url)
        .then((response) => {
            if (!response.ok) {
                return response.text().then((text) => {
                    throw new Error(`HTTP ${response.status}: ${text}`);
                });
            }
            return response.json();
        })
        .then((data) => {
            // Khi nhận được dữ liệu, gọi hàm renderChart để hiển thị biểu đồ
            renderChart(data.data, period);
        })
        .catch((error) => console.error("Error fetching report:", error));
}

// Cập nhật giao diện khi chọn "Thống kê số lượng phiếu nhập/xuất"
document.getElementById("report1").onclick = function () {
    // Hiển thị phần filters
    document.getElementById("report-filters-container").style.display = "block";
    // Thêm sự kiện thay đổi cho "Khoảng thời gian" (period)
    document.getElementById("period").onchange = function () {
        const period = document.getElementById("period").value;
        const monthLabel = document.getElementById("month-label");
        const monthDropdown = document.getElementById("month");

        // Hiển thị dropdown tháng nếu chọn Tuần hoặc Tháng
        if (period === "week" || period === "month") {
            monthLabel.style.display = "inline";
            monthDropdown.style.display = "inline";
        } else {
            monthLabel.style.display = "none";
            monthDropdown.style.display = "none";
        }
    };

    // Thực hiện fetch khi chọn xong các giá trị và ấn nút Thống kê
    document.getElementById("submit-report").onclick = function () {
        const type = document.getElementById("type").value;
        const period = document.getElementById("period").value;
        const year = document.getElementById("year").value;
        const month = document.getElementById("month").value;

        // Xử lý fetch API
        fetchStatistics(type, period, year, month);
    };
};

// Function để fetch dữ liệu từ API
function fetchStatistics(type, period, year, month) {
    // Set the default year if not provided
    const currentYear = new Date().getFullYear();
    year = year || currentYear;
    
    let url = `${be_url}/api/report/statistics?type=${type}&period=${period}&year=${year}`;
    if (period === "week" || period === "month") {
        url += `&month=${month}`;
    }

    fetch(url)
        .then((response) => {
            if (!response.ok) {
                return response.text().then((text) => {
                    throw new Error(`HTTP ${response.status}: ${text}`);
                });
            }
            return response.json();
        })
        .then((data) => {
            // Handle the data and render the report
            console.log(data);
        })
        .catch((error) => console.error("Error fetching report:", error));
}



// Hàm xóa các biểu đồ cũ
const destroyCharts = () => {
    if (window.myCountChart) window.myCountChart.destroy();
    if (window.myRateChart) window.myRateChart.destroy();
};

/// Report 1: Thống kê lượng phiếu nhập/xuất theo tuần, tháng, năm
const report1 = function () {
    removeBackground();
    const selectElement = document.getElementById("all-project");
    const selectedValue = selectElement.value;
    console.log("Selected value:", selectedValue);

    // Lấy giá trị loại phiếu (import hoặc export) và khoảng thời gian (week, month, year)
    const type = 'import';  // Ví dụ: nhập khẩu (import) hoặc xuất khẩu (export)
    const period = 'month'; // Ví dụ: tuần (week), tháng (month), năm (year)
    const year = new Date().getFullYear();  // Năm hiện tại (mặc định)
    const month = new Date().getMonth() + 1;  // Tháng hiện tại

    // Fetch dữ liệu từ API
    fetch(`${be_url}/api/report/statistics?type=${type}&period=${period}&year=${year}&month=${month}`)
        .then((response) => {
            if (!response.ok) {
                return response.text().then((text) => {
                    throw new Error(`HTTP ${response.status}: ${text}`);
                });
            }
            return response.json();
        })
        .then((data) => {
            const labels = data.map(item => item.name);
            const counts = data.map(item => item.count);

            // Xóa biểu đồ cũ nếu tồn tại
            if (window.myCountChart) {
                window.myCountChart.destroy();
            }

            // Tạo biểu đồ Count
            const countCtx = document.getElementById('myChart').getContext('2d');
            window.myCountChart = new Chart(countCtx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [
                        {
                            label: 'Count',
                            data: counts,
                            backgroundColor: 'rgba(75, 192, 192, 0.5)',
                            borderColor: 'rgba(75, 192, 192, 1)',
                            borderWidth: 1,
                        }
                    ],
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'top',
                        },
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                        },
                    },
                },
            });
        })
        .catch((error) => console.error("Error fetching report 1:", error));
};

// Report 2: Thống kê số lượng sản phẩm được nhập vào hoặc xuất ra theo các khoảng thời gian: tuần, tháng, hoặc năm
const report2 = function () {
    removeBackground();
    const selectElement = document.getElementById("all-project");
    const selectedValue = selectElement.value;
    console.log("Selected value:", selectedValue);

    // Lấy giá trị loại phiếu (import hoặc export), ID sản phẩm và khoảng thời gian (week, month, year)
    const type = 'import';  // Ví dụ: nhập khẩu (import) hoặc xuất khẩu (export)
    const productId = 123;  // ID sản phẩm cần thống kê (thay thế bằng giá trị thực tế)
    const period = 'month'; // Ví dụ: tuần (week), tháng (month), năm (year)
    const year = new Date().getFullYear();  // Năm hiện tại (mặc định)
    const month = new Date().getMonth() + 1;  // Tháng hiện tại

    // Fetch dữ liệu từ API
    fetch(`${be_url}/api/report/statistics-by-product?type=${type}&productId=${productId}&period=${period}&year=${year}&month=${month}`)
        .then((response) => {
            if (!response.ok) {
                return response.text().then((text) => {
                    throw new Error(`HTTP ${response.status}: ${text}`);
                });
            }
            return response.json();
        })
        .then((data) => {
            const labels = data.map(item => item.name);
            const counts = data.map(item => item.count);

            // Xóa biểu đồ cũ nếu tồn tại
            if (window.myCountChart) {
                window.myCountChart.destroy();
            }

            // Tạo biểu đồ Count
            const countCtx = document.getElementById('myChart').getContext('2d');
            window.myCountChart = new Chart(countCtx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [
                        {
                            label: 'Count',
                            data: counts,
                            backgroundColor: 'rgba(75, 192, 192, 0.5)',
                            borderColor: 'rgba(75, 192, 192, 1)',
                            borderWidth: 1,
                        }
                    ],
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'top',
                        },
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                        },
                    },
                },
            });
        })
        .catch((error) => console.error("Error fetching report 2:", error));
};


// Xử lý báo cáo 5: Xem các nhiệm vụ quá hạn
const report5 = async () => {
    removeBackground();
    const selectedValue = document.getElementById("all-project").value;
    try {
        const data = await fetchData(`${be_url}/api/projects/${selectedValue}/report/overdue-tasks`);
        const statusCounts = data.reduce((acc, task) => {
            acc[task.status] = (acc[task.status] || 0) + 1;
            return acc;
        }, {});

        const labels = Object.keys(statusCounts);
        const counts = Object.values(statusCounts);

        destroyCharts();

        // Tạo biểu đồ Pie cho trạng thái nhiệm vụ
        window.myCountChart = createChart('myChart', 'pie', labels, counts, {
            bgColors: [
                'rgba(255, 99, 132, 0.5)', // pending
                'rgba(54, 162, 235, 0.5)', // completed
                'rgba(255, 206, 86, 0.5)', // in-progress
                'rgba(75, 192, 192, 0.5)'  // other statuses
            ],
            borderColors: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)'
            ]
        }, 'Task Status');
    } catch (error) {
        showError("Có lỗi xảy ra khi tạo báo cáo 5.");
    }
};

// Hàm xóa background và cập nhật UI
const removeBackground = () => {
    const heroTask = document.querySelector(".hero-task");
    const heroSection = document.querySelector(".hero");
    const heroNav = document.querySelector(".hero-nav");

    heroNav.style.backgroundColor = "#fff";
    heroTask.classList.add("active");
    heroSection.classList.remove("home");
};

// Lắng nghe sự kiện thay đổi dự án
document.getElementById("all-project").onchange = () => {
    document.getElementById("report1").onclick = report1;
    document.getElementById("report2").onclick = report2;
    document.getElementById("report5").onclick = report5;
};

// Khởi tạo dự án khi DOM đã tải xong
document.addEventListener("DOMContentLoaded", () => {
    // Hiển thị phần thống kê khi chọn báo cáo
    const report2 = document.getElementById("report2");
    const reportFilters = document.getElementById("report-filters");
    
    report2.addEventListener("click", () => {
        reportFilters.style.display = "block";
        loadProducts(); // Tải danh sách sản phẩm khi hiển thị báo cáo
    });

    // Tải danh sách sản phẩm vào dropdown
    function loadProducts() {
        const productSelect = document.getElementById("product");
        const products = [
            { id: 1, name: "Sản phẩm A" },
            { id: 2, name: "Sản phẩm B" },
            { id: 3, name: "Sản phẩm C" },
        ];

        products.forEach(product => {
            const option = document.createElement("option");
            option.value = product.id;
            option.textContent = `${product.name} (ID: ${product.id})`;
            productSelect.appendChild(option);
        });
    }

    // Thay đổi các trường tháng/năm dựa trên khoảng thời gian
    const periodSelect = document.getElementById("period");
    const yearInput = document.getElementById("year");
    const monthSelect = document.getElementById("month");
    const monthLabel = document.getElementById("month-label");

    periodSelect.addEventListener("change", () => {
        const period = periodSelect.value;
        if (period === "week" || period === "month") {
            monthSelect.style.display = "block";
            monthLabel.style.display = "inline";
        } else {
            monthSelect.style.display = "none";
            monthLabel.style.display = "none";
        }
    });

    // Thực hiện thống kê khi bấm "Thống kê"
    const submitReportButton = document.getElementById("submit-report");
    submitReportButton.addEventListener("click", () => {
        const type = document.getElementById("type").value;
        const productId = document.getElementById("product").value;
        const period = periodSelect.value;
        const year = yearInput.value;
        const month = monthSelect.value;

        // Đây là nơi bạn thực hiện gọi API hoặc lấy dữ liệu từ cơ sở dữ liệu
        // Hiện tại tôi sẽ chỉ tạo một chart giả định.

        console.log(`Thống kê cho: ${type}, Sản phẩm ID: ${productId}, Thời gian: ${year}-${month || 'All'}, ${period}`);

       
    });
});
// Lắng nghe sự kiện thay đổi dự án
document.getElementById("all-project").onchange = () => {
    document.getElementById("report1").onclick = report1;
    document.getElementById("report2").onclick = report2;
    document.getElementById("report5").onclick = report5;
};