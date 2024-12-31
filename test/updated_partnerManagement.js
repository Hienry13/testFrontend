// script.js

document.addEventListener("DOMContentLoaded", function () {
  const typeInput = document.getElementById("type");
  const periodInput = document.getElementById("period");
  const yearInput = document.getElementById("year");
  const monthInput = document.getElementById("month");
  const monthLabel = document.getElementById("month-label");
  const fetchButton = document.getElementById("fetchData");
  const chartCanvas = document.getElementById("chart");
  let chartInstance = null;

  periodInput.addEventListener("change", function () {
      if (periodInput.value === "month" || periodInput.value === "week") {
          monthInput.style.display = "block";
          monthLabel.style.display = "block";
      } else {
          monthInput.style.display = "none";
          monthLabel.style.display = "none";
      }
  });

  function fetchStatistics() {
      const type = typeInput.value;
      const period = periodInput.value;
      const year = yearInput.value;
      const month = monthInput.value;

      if (!year) {
          alert("Vui lòng nhập năm.");
          return;
      }

      if ((period === "week" || period === "month") && !month) {
          alert("Vui lòng nhập tháng.");
          return;
      }

      let url = `http://160.191.50.248:8080/api/report/statistics-by-period?type=${type}&period=${period}&year=${year}`;
      if (period === "month" || period === "week") {
          url += `&month=${month}`;
      }

      fetch(url)
          .then((response) => {
              if (!response.ok) {
                  throw new Error(`HTTP error! Status: ${response.status}`);
              }
              return response.json();
          })
          .then((data) => {
              renderChart(data); // Gọi hàm vẽ biểu đồ với dữ liệu trả về
          })
          .catch((error) => {
              console.error("Error fetching statistics:", error);
              alert("Không thể tải dữ liệu. Vui lòng kiểm tra lại.");
          });
  }

  function renderChart(data) {
      if (chartInstance) {
          chartInstance.destroy(); // Hủy biểu đồ cũ nếu tồn tại
      }

      // Tạo labels và data cho biểu đồ
      let labels = [];
      let dataset = [];
      if (data.period === "week") {
          labels = data.data.map((item) => `Tuần ${item.week}`);
          dataset = data.data.map((item) => item.total);
      } else if (data.period === "month") {
          labels = data.data.map((item) => `Tháng ${item.month}`);
          dataset = data.data.map((item) => item.total);
      }

      // Cấu hình biểu đồ Chart.js
      chartInstance = new Chart(chartCanvas, {
          type: "bar",
          data: {
              labels: labels,
              datasets: [
                  {
                      label: `Thống kê (${data.type === "import" ? "Phiếu nhập" : "Phiếu xuất"})`,
                      data: dataset,
                      backgroundColor: "rgba(75, 192, 192, 0.6)",
                      borderColor: "rgba(75, 192, 192, 1)",
                      borderWidth: 1,
                  },
              ],
          },
          options: {
              responsive: true,
              plugins: {
                  legend: {
                      display: true,
                      position: "top",
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

  fetchButton.addEventListener("click", fetchStatistics);
});


// Điều hướng giữa các phần
function navigateTo(section) {
  const content = document.getElementById("content");

  if (section === "report-by-period") {
    content.innerHTML = `
      <h2>Thống kê lượng phiếu nhập/xuất theo tuần, tháng, năm</h2>
      <div>
        <label>Loại phiếu:</label>
        <select id="type" class="form-select mb-3">
          <option value="import">Phiếu nhập</option>
          <option value="export">Phiếu xuất</option>
        </select>
        <label>Khoảng thời gian:</label>
        <select id="period" class="form-select mb-3" onchange="toggleMonthInput()">
          <option value="week">Tuần</option>
          <option value="month">Tháng</option>
          <option value="year">Năm</option>
        </select>
        <label>Năm:</label>
        <input type="number" id="year" class="form-control mb-3" value="${new Date().getFullYear()}">
        <label>Tháng:</label>
        <input type="number" id="month" class="form-control mb-3" min="1" max="12" style="display:none;">
        <button class="btn btn-primary" onclick="showReport()">Xem báo cáo</button>
      </div>
      <canvas id="chart" class="mt-5" style="display:none;"></canvas>
    `;
  } else if (section === "report-by-product") {
    content.innerHTML = `
        <h2>Thống kê số lượng sản phẩm được nhập/xuất theo khoảng thời gian</h2>
        <div class="mb-3">
            <label for="statType">Loại thống kê:</label>
            <select id="statType" class="form-select">
                <option value="import">Số lượng nhập</option>
                <option value="export">Số lượng xuất</option>
            </select>
        </div>
        <div class="mb-3">
            <label for="productId">Sản phẩm:</label>
            <select id="productId" class="form-select">
                <!-- Sẽ được thêm động -->
            </select>
        </div>
        <div class="mb-3">
            <label for="period">Khoảng thời gian:</label>
            <select id="period" class="form-select">
                <option value="week">Tuần</option>
                <option value="month">Tháng</option>
                <option value="year">Năm</option>
            </select>
        </div>
        <div class="mb-3">
            <label for="year">Năm:</label>
            <input type="number" id="year" class="form-control" value="${new Date().getFullYear()}">
        </div>
        <div class="mb-3" id="monthContainer" style="display:none;">
            <label for="month">Tháng:</label>
            <input type="number" id="month" class="form-control" min="1" max="12">
        </div>
        <button class="btn btn-primary" onclick="fetchProductStatistics()">Xem báo cáo</button>
        <canvas id="productChart" class="mt-5" style="display:none;"></canvas>
    `;
  } else if (section === "filter-by-type") {
    content.innerHTML = `
      <h2>Lọc các loại phiếu (Import/Export)</h2>
      <div>
        <label>Loại phiếu:</label>
        <select id="type" class="form-select mb-3">
          <option value="import">Phiếu nhập</option>
          <option value="export">Phiếu xuất</option>
        </select>
        <label>Tiêu chí:</label>
        <select id="criteria" class="form-select mb-3">
          <option value="amount">Số lượng</option>
          <option value="value">Giá trị</option>
        </select>
        <button class="btn btn-primary" onclick="filterData()">Lọc dữ liệu</button>
      </div>
    `;
  }
}
// Tải danh sách sản phẩm vào dropdown
populateProductDropdown();

// Hiển thị/ẩn trường tháng khi người dùng chọn "Tuần" hoặc "Tháng"
function toggleMonthInput() {
  const period = document.getElementById("period").value;
  const monthInput = document.getElementById("month");
  monthInput.style.display = period === "week" || period === "month" ? "block" : "none";
}

// Hàm hiển thị báo cáo (test dữ liệu)
function showReport() {
  const type = document.getElementById("type").value;
  const period = document.getElementById("period").value;
  const year = document.getElementById("year").value;
  const month = document.getElementById("month").value;

  // Dữ liệu test
  const testData = {
    type: type,
    period: period,
    year: year,
    data: period === "week" ? [
      { week: 1, total: 10 },
      { week: 2, total: 15 },
      { week: 3, total: 8 },
      { week: 4, total: 20 }
    ] : [
      { month: 1, total: 30 },
      { month: 2, total: 25 },
      { month: 3, total: 40 }
    ]
  };

  // Hiển thị biểu đồ
  const chartContainer = document.getElementById("chart");
  chartContainer.style.display = "block";

  const labels = testData.data.map(item => period === "week" ? `Tuần ${item.week}` : `Tháng ${item.month}`);
  const dataset = testData.data.map(item => item.total);

  const ctx = chartContainer.getContext("2d");
  new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [{
        label: `Thống kê (${type === "import" ? "Phiếu nhập" : "Phiếu xuất"})`,
        data: dataset,
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: true,
          position: "top"
        }
      },
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}
// Tải danh sách sản phẩm (giả lập dữ liệu test)
document.addEventListener("DOMContentLoaded", () => {
  const productDropdown = document.getElementById("productId");
  const products = [
    { id: 1, name: "Sản phẩm A" },
    { id: 2, name: "Sản phẩm B" },
    { id: 3, name: "Sản phẩm C" }
  ];

  // Thêm sản phẩm vào dropdown
  products.forEach(product => {
    const option = document.createElement("option");
    option.value = product.id;
    option.textContent = `${product.name} (ID: ${product.id})`;
    productDropdown.appendChild(option);
  });
});

// Hiển thị/ẩn trường tháng
function toggleMonthInput() {
  const period = document.getElementById("period").value;
  const monthInput = document.getElementById("month");
  monthInput.style.display = period === "week" || period === "month" ? "block" : "none";
}

// Hiển thị báo cáo thống kê sản phẩm
function fetchProductStatistics() {
  const statType = document.getElementById("statType").value;
  const productId = document.getElementById("productId").value;
  const period = document.getElementById("period").value;
  const year = document.getElementById("year").value;
  const month = document.getElementById("month").value;

  // Dữ liệu test (thay thế bằng API thực tế)
  const testData = period === "week" ? {
    type: statType,
    productId: productId,
    period: period,
    year: year,
    month: month,
    data: [
      { week: 1, total: 10 },
      { week: 2, total: 15 },
      { week: 3, total: 8 },
      { week: 4, total: 20 }
    ]
  } : {
    type: statType,
    productId: productId,
    period: period,
    year: year,
    data: [
      { month: 1, total: 30 },
      { month: 2, total: 25 },
      { month: 3, total: 40 }
    ]
  };

  renderProductChart(testData);
}

// Vẽ biểu đồ thống kê sản phẩm
function renderProductChart(data) {
  const chartContainer = document.getElementById("productChart");
  chartContainer.style.display = "block";

  const labels = data.period === "week"
    ? data.data.map(item => `Tuần ${item.week}`)
    : data.data.map(item => `Tháng ${item.month}`);
  const totals = data.data.map(item => item.total);

  const ctx = chartContainer.getContext("2d");

  // Xóa biểu đồ cũ (nếu có)
  if (window.productChart) {
    window.productChart.destroy();
  }

  // Tạo biểu đồ cột
  window.productChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [{
        label: `Thống kê ${data.type === "import" ? "Số lượng nhập" : "Số lượng xuất"}`,
        data: totals,
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: true,
          position: "top"
        }
      },
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}


// Tải danh sách sản phẩm (có thể thay bằng API thật)
function populateProductDropdown() {
  const productDropdown = document.getElementById("productId");
  productDropdown.innerHTML = `<option value="" disabled selected>Đang tải danh sách sản phẩm...</option>`;

  // Fetch danh sách sản phẩm từ API
  fetch('/api/products')
      .then(response => {
          if (!response.ok) {
              throw new Error('Lỗi khi tải danh sách sản phẩm');
          }
          return response.json();
      })
      .then(products => {
          // Xóa thông báo đang tải
          productDropdown.innerHTML = `<option value="" disabled selected>Chọn sản phẩm</option>`;

          // Thêm các sản phẩm vào dropdown
          products.forEach(product => {
              const option = document.createElement("option");
              option.value = product.id;
              option.textContent = `${product.name} (ID: ${product.id})`;
              productDropdown.appendChild(option);
          });
      })
      .catch(error => {
          console.error(error);
          productDropdown.innerHTML = `<option value="" disabled selected>Lỗi khi tải danh sách</option>`;
      });
}

// Hiển thị hoặc ẩn trường Tháng
document.getElementById("period").addEventListener("change", () => {
  const period = document.getElementById("period").value;
  document.getElementById("monthContainer").style.display = (period === "week" || period === "month") ? "block" : "none";
});

// Lấy dữ liệu và vẽ biểu đồ
function fetchProductStatistics() {
  const statType = document.getElementById("statType").value;
  const productId = document.getElementById("productId").value;
  const period = document.getElementById("period").value;
  const year = document.getElementById("year").value;
  const month = document.getElementById("month").value;

  // Gọi API (dùng dữ liệu test ở đây)
  const testData = {
      type: statType,
      productId: productId,
      period: period,
      year: year,
      data: period === "week" ? [
          { week: 1, total: 10 },
          { week: 2, total: 15 },
          { week: 3, total: 8 },
          { week: 4, total: 20 }
      ] : [
          { month: 1, total: 30 },
          { month: 2, total: 25 },
          { month: 3, total: 40 }
      ]
  };

  renderProductChart(testData);
}

// Vẽ biểu đồ sản phẩm
function renderProductChart(data) {
  const chartContainer = document.getElementById("productChart");
  chartContainer.style.display = "block";

  const labels = data.period === "week"
      ? data.data.map(item => `Tuần ${item.week}`)
      : data.data.map(item => `Tháng ${item.month}`);
  const totals = data.data.map(item => item.total);

  const ctx = chartContainer.getContext("2d");

  // Xóa biểu đồ cũ nếu có
  if (window.productChart) {
      window.productChart.destroy();
  }

  // Tạo biểu đồ mới
  window.productChart = new Chart(ctx, {
      type: "bar",
      data: {
          labels: labels,
          datasets: [{
              label: `Thống kê ${data.type === "import" ? "Số lượng nhập" : "Số lượng xuất"}`,
              data: totals,
              backgroundColor: "rgba(75, 192, 192, 0.6)",
              borderColor: "rgba(75, 192, 192, 1)",
              borderWidth: 1
          }]
      },
      options: {
          responsive: true,
          plugins: {
              legend: {
                  display: true,
                  position: "top"
              }
          },
          scales: {
              y: {
                  beginAtZero: true
              }
          }
      }
  });
}

