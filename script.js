let ordersList = [];

// Load orders from localStorage if any exist
const savedData = localStorage.getItem("laundryOrders");
if (savedData) {
  try {
    ordersList = JSON.parse(savedData);
  } catch (err) {
    ordersList = [];
  }
}

// Function to save orders into localStorage
function saveOrders() {
  localStorage.setItem("laundryOrders", JSON.stringify(ordersList));
}

// Rate Card pricing matching the price list table for different wash categories
const priceListByService = {
  "Wash & Fold": {
    "Shirt": 20,
    "T-Shirt": 20,
    "Jeans": 30,
    "Shorts": 15,
    "Jacket": 60,
    "Blazer": 60,
    "Saree": 40,
    "Frock": 40,
    "Scarf": 15,
    "Tunic": 40,
    "Top": 15,
    "Blanket": 80,
    "pyjama": 10,
    "Lab Coat": 60,
    "Towel": 20
  },
  "Steam Ironing": {
    "Shirt": 15,
    "T-Shirt": 15,
    "Jeans": 20,
    "Shorts": 10,
    "Jacket": 40,
    "Blazer": 40,
    "Saree": 25,
    "Frock": 25,
    "Scarf": 10,
    "Tunic": 25,
    "Top": 10,
    "Blanket": 40,
    "pyjama": 15,
    "Lab Coat": 80,
    "Towel": 30
  },
  "Dry Clean": {
    "Shirt": 30,
    "T-Shirt": 30,
    "Jeans": 50,
    "Shorts": 25,
    "Jacket": 80,
    "Blazer": 100,
    "Saree": 70,
    "Frock": 60,
    "Scarf": 25,
    "Tunic": 70,
    "Top": 25,
    "Blanket": 120,
    "pyjama": 30,
    "Lab Coat": 90,
    "Towel": 40
  },
  "Express Wash": {
    "Shirt": 45,
    "T-Shirt": 45,
    "Jeans": 70,
    "Shorts": 35,
    "Jacket": 120,
    "Blazer": 140,
    "Saree": 95,
    "Frock": 85,
    "Scarf": 35,
    "Tunic": 95,
    "Top": 35,
    "Blanket": 160,
    "pyjama": 45,
    "Lab Coat": 120,
    "Towel": 50
  }
};

// Function to sync and update prices
function syncService() {
  updatePrices();
}

// Function to update prices on all cards according to selected wash type
function updatePrices() {
  const serviceSelect = document.getElementById("serviceType");
  if (!serviceSelect) return;

  const selectedService = serviceSelect.value;
  const rates = priceListByService[selectedService] || priceListByService["Wash & Fold"];

  // Update each item card
  const allItemBoxes = document.querySelectorAll('.grid .item');
  allItemBoxes.forEach(function(itemBox) {
    const input = itemBox.querySelector('input[type="number"]');
    const priceText = itemBox.querySelector('p');

    if (input && priceText) {
      const itemName = input.getAttribute("data-name");
      const unit = itemName === "" ?"": " / piece";
      const newPrice = rates[itemName] !== undefined ? rates[itemName] : 30;

      // Update data-price attribute for bill calculation
      input.setAttribute("data-price", newPrice);

      // Update visible price text on card
      priceText.innerText = "₹" + newPrice + unit;
    }
  });

  calculateTotal();
}

// Helper functions for + and - buttons
function stepUp(id) {
  const input = document.getElementById(id);
  if (input) {
    input.stepUp();
    calculateTotal();
  }
}

function stepDown(id) {
  const input = document.getElementById(id);
  if (input && parseInt(input.value) > 0) {
    input.stepDown();
    calculateTotal();
  }
}

// Function to calculate total items and total price 
function calculateTotal() {
  const allInputs = document.querySelectorAll('.grid input[type="number"]');
  let totalCount = 0;
  let totalPrice = 0;

  allInputs.forEach(function(input) {
    const qty = parseInt(input.value) || 0;
    const price = parseInt(input.getAttribute("data-price")) || 0;
    if (qty > 0) {
      totalCount += qty;
      totalPrice += qty * price;
    }
  });

  const displayTotalItems = document.getElementById("displayTotalItems");
  if (displayTotalItems) {
    displayTotalItems.innerText = totalCount;
  }

  const displayTotalPrice = document.getElementById("displayTotalPrice");
  if (displayTotalPrice) {
    displayTotalPrice.innerText = "₹" + totalPrice;
  }

  const cartCount = document.getElementById("cartCount");
  if (cartCount) {
    cartCount.innerText = totalCount + " Items";
  }
}

// Function to generate a UNIQUE 5-digit code (between 10000 and 99999)
function generateOrderCode() {
  let uniqueCode = 0;
  let isUnique = false;

  while (!isUnique) {
    uniqueCode = Math.floor(10000 + Math.random() * 90000);
    const exists = ordersList.some(function(order) {
      return order.code === uniqueCode;
    });
    if (!exists) {
      isUnique = true;
    }
  }

  return uniqueCode;
}

var orderCode = generateOrderCode();
const displayElement = document.getElementById("display");
if (displayElement) {
  displayElement.innerText = orderCode;
}

// Function to place a new order
function placeOrder() {
  const allInputs = document.querySelectorAll('.grid input[type="number"]');
  const selectedItems = [];
  let totalCount = 0;
  let totalPrice = 0;

  allInputs.forEach(function(input) {
    const qty = parseInt(input.value) || 0;
    const price = parseInt(input.getAttribute("data-price")) || 0;
    const name = input.getAttribute("data-name");

    if (qty > 0) {
      selectedItems.push({
        name: name,
        qty: qty,
        price: price
      });
      totalCount += qty;
      totalPrice += qty * price;
    }
  });
  // Check if at least 1 item is chosen
  if (selectedItems.length === 0) {
    alert("Please select at least 1 cloth item to place your laundry order!");
    return;
  }

  const custNameInput = document.getElementById("custName");
  const custPhoneInput = document.getElementById("custPhone");
  const serviceInput = document.getElementById("serviceType");

  const customerName = custNameInput ? custNameInput.value.trim() : "";
  const customerPhone = custPhoneInput ? custPhoneInput.value.trim() : "";
  const serviceType = (serviceInput && serviceInput.value) || "Wash & Fold";

  // 1. Customer Name is compulsory
  if (!customerName) {
    alert("Customer Name is compulsory! Please enter your name.");
    if (custNameInput) custNameInput.focus();
    return;
  }

  // 2. Mobile Number is compulsory
  if (!customerPhone) {
    alert("Mobile Number is compulsory! Please enter your 10-digit number.");
    if (custPhoneInput) custPhoneInput.focus();
    return;
  }


  // Create order object
  const newOrder = {
    code: orderCode,
    customer: customerName,
    phone: customerPhone,
    service: serviceType,
    items: selectedItems,
    totalItems: totalCount,
    totalPrice: totalPrice,
    time: new Date().toLocaleString(),
    status: "Active"
  };

  // Add to order list and save
  ordersList.unshift(newOrder);
  saveOrders();

  // Reset inputs
  allInputs.forEach(function(input) {
    input.value = 0;
  });
  if (custNameInput) custNameInput.value = "";
  if (custPhoneInput) custPhoneInput.value = "";
  calculateTotal();

  // Refresh order code for new order creation and update display on home page
  orderCode = generateOrderCode();
  const display = document.getElementById("display");
  if (display) {
    display.innerText = orderCode;
  }

  // Re-render orders and switch to Active Orders tab
  renderOrders();
  showTab("active");
}

// Move an active order to completed status
function completeOrder(code) {
  for (let i = 0; i < ordersList.length; i++) {
    if (ordersList[i].code === code) {
      ordersList[i].status = "Completed";
      ordersList[i].time = new Date().toLocaleString();
      break;
    }
  }
  saveOrders();
  renderOrders();
}

// Delete an order using delete.png
function deleteOrder(code) {
  if (confirm("Are you sure you want to delete order #" + code + "?")) {
    ordersList = ordersList.filter(function(order) {
      return order.code !== code;
    });
    saveOrders();
    renderOrders();
  }
}

// Function to switch between navigation tabs
function showTab(tabName) {
  const secProducts = document.getElementById("sectionProducts");
  const secActive = document.getElementById("sectionActive");
  const secCompleted = document.getElementById("sectionCompleted");

  const btnProducts = document.getElementById("btnProducts");
  const btnActive = document.getElementById("btnActive");
  const btnCompleted = document.getElementById("btnCompleted");
  
  if (btnProducts) btnProducts.classList.remove("active");
  if (btnActive) btnActive.classList.remove("active");
  if (btnCompleted) btnCompleted.classList.remove("active");
  
  if (secProducts) secProducts.classList.add("hidden");
  if (secActive) secActive.classList.add("hidden");
  if (secCompleted) secCompleted.classList.add("hidden");

  if (tabName === "products") {
    if (secProducts) secProducts.classList.remove("hidden");
    if (btnProducts) btnProducts.classList.add("active");
  } else if (tabName === "active") {
    if (secActive) secActive.classList.remove("hidden");
    if (btnActive) btnActive.classList.add("active");
  } else if (tabName === "completed") {
    if (secCompleted) secCompleted.classList.remove("hidden");
    if (btnCompleted) btnCompleted.classList.add("active");
  }
}

// Function to render active and completed orders
function renderOrders() {
  const activeContainer = document.getElementById("activeOrdersList");
  const completedContainer = document.getElementById("completedOrdersList");

  if (!activeContainer || !completedContainer) return;

  let activeHTML = "";
  let completedHTML = "";
  let activeCount = 0;
  let completedCount = 0;

  ordersList.forEach(function(order) {
    let itemsHTML = "<ul class='order-items-list'>";
    order.items.forEach(function(item) {
      itemsHTML += "<li>" + item.qty + "x " + item.name + " (₹" + (item.qty * item.price) + ")</li>";
    });
    itemsHTML += "</ul>";

    if (order.status === "Active") {
      activeCount++;
      activeHTML += `
        <div class="box order-card">
          <div class="row order-card-header">
            <span class="badge order-code-text">Order #${order.code}</span>
            <span class="row order-status">
              <img src="Assets/clock.png" alt="Clock" class="mini-icon">
              In Wash (${order.time})
            </span>
          </div>

          <!-- Order details in 2-column grid view -->
          <div class="order-details-grid">
            <div><b>Customer:</b> ${order.customer}</div>
            <div><b>Phone:</b> ${order.phone}</div>
            <div><b>Category:</b> ${order.service}</div>
            <div><b>Items:</b> ${order.totalItems}</div>
          </div>

          <!-- Items list box -->
          <div class="order-items-box">
            <b>Clothes Ordered:</b>
            ${itemsHTML}
          </div>

          <!-- Total bill row -->
          <div class="row order-total-row">
            <b>Bill Total:</b>
            <span class="badge" style="font-size: 14px;">₹${order.totalPrice}</span>
          </div>

          <div class="row">
            <button type="button" class="btn" onclick="completeOrder(${order.code})">
              <img src="Assets/ready-stock.png" alt="Ready" class="mini-icon"> Mark as Ready
            </button>
            <button type="button" class="btn" onclick="deleteOrder(${order.code})">
              <img src="Assets/delete.png" alt="Delete" class="mini-icon"> Delete
            </button>
          </div>
        </div>
      `;
    } else if (order.status === "Completed") {
      completedCount++;
      completedHTML += `
        <div class="box order-card">
          <div class="row order-card-header">
            <span class="badge order-code-text">Order #${order.code}</span>
            <span class="row order-status">
              <img src="Assets/ready-stock.png" alt="Ready" class="mini-icon">
              Completed (${order.time})
              </span>
              </div>
              
              <!-- Order details in 2-column grid view -->
          <div class="order-details-grid">
            <div><b>Customer:</b> ${order.customer}</div>
            <div><b>Phone:</b> ${order.phone}</div>
            <div><b>Category:</b> ${order.service}</div>
            <div><b>Items:</b> ${order.totalItems}</div>
            </div>

          <!-- Items list box -->
          <div class="order-items-box">
            <b>Clothes Ordered:</b>
            ${itemsHTML}
          </div>

          <!-- Total bill row -->
          <div class="row order-total-row">
            <b>Bill Total:</b>
            <span class="badge" style="font-size: 14px;">₹${order.totalPrice}</span>
            </div>
            
          <div class="row">
            <button type="button" class="btn" onclick="deleteOrder(${order.code})">
              <img src="Assets/delete.png" alt="Delete" class="mini-icon"> Delete Record
            </button>
          </div>
        </div>
      `;
    }
  });

  // Empty state messages when no orders are present
  if (activeCount === 0) {
    activeHTML = "<div class='box empty-msg' ><p>No active orders right now.</p></div>";
  }
  
  if (completedCount === 0) {
    completedHTML = "<div class='box empty-msg'><p>No completed orders yet.</p></div>";
  }
  
  activeContainer.innerHTML = activeHTML;
  completedContainer.innerHTML = completedHTML;
  
  const activeCountBadge = document.getElementById("activeCount");
  if (activeCountBadge) {
    activeCountBadge.innerText = activeCount;
  }
  const completedCountBadge = document.getElementById("completedCount");
  if (completedCountBadge) {
    completedCountBadge.innerText = completedCount;
  }

}


// Run on page load
window.addEventListener("DOMContentLoaded", function() {
  updatePrices();
  calculateTotal();
  renderOrders();
});
