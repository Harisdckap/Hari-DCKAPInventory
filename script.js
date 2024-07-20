"use strict";

document.addEventListener("DOMContentLoaded", async () => {
  // Initialize variables
  let products = [];
  let recipients = [];
  let inventoryChart = null;

  // Fetch data from the server
  async function fetchData() {
    try {
      // Fetch products data
      const productsResponse = await fetch("fetch_products.php");
      products = await productsResponse.json();

      // Fetch recipients data
      const recipientsResponse = await fetch("fetch_recipients.php");
      recipients = await recipientsResponse.json();

      // Update UI components
      updateTopProducts();
      updateRecipientTable();
      updateInventoryChart();
    } catch (error) {
      console.error("Error fetching data: ", error);
    }
  }

  // Update the top products section
  function updateTopProducts() {

    // Sort products by quantity and get top 3
    const topProducts = [...products]
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 3);

    // Get the container for top products
    const topProductsContainer = document.getElementById('top-products');

    // Update the container with top products
    topProductsContainer.innerHTML = topProducts
      .map((product) => `
        <div class="top-product">
          <div class="top-product-icon">📦</div>
          <div class="top-product-name">${product.name}</div>
          <div class="top-product-quantity">${product.quantity}</div>
        </div>
      `)
      .join("");
  }

  // Update the recipient table
  function updateRecipientTable() {
    // Get the table body element
    const recipientTableBody = document.getElementById("recipientTableBody");

    // Update the table with recipient data
    recipientTableBody.innerHTML = recipients
      .map(
        (recipient) => `
          <tr>
            <td>${recipient.product}</td>
            <td>${recipient.name}</td>
            <td>${recipient.quantity}</td>
          </tr>
        `
      )
      .join("");
  }

  // Update the inventory chart
  function updateInventoryChart() {
    // Define chart colors
    const colors = [
      "rgba(255, 99, 132, 0.2)",
      "rgba(54, 162, 235, 0.2)",
      "rgba(255, 206, 86, 0.2)",
      "rgba(75, 192, 192, 0.2)",
      "rgba(153, 102, 255, 0.2)",
      "rgba(255, 159, 64, 0.2)"
    ];

    const borderColors = [
      "rgba(255, 99, 132, 1)",
      "rgba(54, 162, 235, 1)",
      "rgba(255, 206, 86, 1)",
      "rgba(75, 192, 192, 1)",
      "rgba(153, 102, 255, 1)",
      "rgba(255, 159, 64, 1)"
    ];

    // Map colors to products
    const backgroundColors = products.map((_, index) => colors[index % colors.length]);
    const borderColorsMapped = products.map((_, index) => borderColors[index % borderColors.length]);

    // Prepare chart data
    const chartData = {
      labels: products.map((product) => product.name),
      datasets: [
        {
          label: "Quantity",
          data: products.map((product) => product.quantity),
          backgroundColor: backgroundColors,
          borderColor: borderColorsMapped,
          borderWidth: 1,
        },
      ],
    };

    // Create or update the chart
    if (inventoryChart) {
      inventoryChart.data = chartData;
      inventoryChart.update();
    } else {
      const ctx = document.getElementById("inventoryChart").getContext("2d");
      inventoryChart = new Chart(ctx, {
        type: "bar",
        data: chartData,
        options: {
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        },
      });
    }
  }

  // Fetch data when the page loads
  fetchData();

  // Modal elements and buttons
  const addProductModal = document.getElementById("addProductModal");
  const updateInventoryModal = document.getElementById("updateInventoryModal");
  const addProductBtn = document.getElementById("addProductBtn");
  const updateInventoryBtn = document.getElementById("updateInventoryBtn");
  const closeButtons = document.querySelectorAll(".close");

  // Show modals on button click
  addProductBtn.onclick = () => (addProductModal.style.display = "block");
  updateInventoryBtn.onclick = () => (updateInventoryModal.style.display = "block");

  // Close modals when clicking the close button
  closeButtons.forEach(
    (btn) =>
      (btn.onclick = () => {
        addProductModal.style.display = "none";
        updateInventoryModal.style.display = "none";
      })
  );

  // Close modals when clicking outside the modal
  window.onclick = (event) => {
    if (event.target == addProductModal) addProductModal.style.display = "none";
    if (event.target == updateInventoryModal) updateInventoryModal.style.display = "none";
  };

  // Add product form submission handler
  const addProductForm = document.getElementById("addProductForm");
  addProductForm.onsubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(addProductForm);
    const name = formData.get("productName");
    const quantity = parseInt(formData.get("productQuantity"), 10);

    try {
      // Send product data to the server
      const response = await fetch("add_product.php", {
        method: "POST",
        body: new URLSearchParams({
          action: "add_product",
          name,
          quantity,
        }),
      });

      const result = await response.json();

      // Handle server response
      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Product added successfully!',
          showConfirmButton: false,
          timer: 1500
        });
        await fetchData();
        addProductModal.style.display = "none";
        addProductForm.reset();
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: result.error || "Failed to add product.",
        });
      }
    } catch (error) {
      console.error("Error adding product: ", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'An error occurred while adding the product.',
      });
    }
  };

  // Update inventory form submission handler
  const updateInventoryForm = document.getElementById("updateInventoryForm");
  updateInventoryForm.onsubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(updateInventoryForm);
    const recipientName = formData.get("recipientName");
    const productName = formData.get("productReceived");
    const quantity = parseInt(formData.get("quantityReceived"), 10);

    try {
      // Send update data to the server
      const response = await fetch("update_product.php", {
        method: "POST",
        body: new URLSearchParams({
          action: "update_product",
          name: recipientName,
          product: productName,
          quantity,
        }),
      });

      const result = await response.json();

      // Handle server response
      if (result.error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: result.error,
        });
        return;
      }

      await fetchData();
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Inventory updated successfully!',
        showConfirmButton: false,
        timer: 1500
      });

      updateInventoryModal.style.display = "none";
      updateInventoryForm.reset();
    } catch (error) {
      console.error("Error updating inventory: ", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'An error occurred while updating the inventory.',
      });
    }
  };
});
