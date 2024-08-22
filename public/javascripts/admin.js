document.addEventListener("DOMContentLoaded", function () {
  function showSuccessMessage(message, reload = true) {
    const successAlert = document.getElementById("success-alert");
    const successMessage = document.getElementById("success-message");
    successMessage.textContent = message;
    successAlert.style.display = "block";
    setTimeout(() => {
      successAlert.style.display = "none";
      if (reload) {
        location.reload(); // Reload the page after displaying the message
      }
    }, 3000);
  }

  function showErrorMessage(message) {
    const errorAlert = document.getElementById("error-alert");
    const errorMessage = document.getElementById("error-message");
    errorMessage.textContent = message;
    errorAlert.style.display = "block";
    setTimeout(() => {
      errorAlert.style.display = "none";
    }, 5000);
  }

  function handleApiResponse(response) {
    return response.json().then((result) => {
      if (response.ok) {
        if (result.status === "success") {
          showSuccessMessage(result.data.result, true);
        } else {
          showErrorMessage(result.data.result);
        }
      } else {
        showErrorMessage(result.data.result);
      }
      return result;
    });
  }

  // Products Page Functionality
  if (document.getElementById("initial-products")) {
    const initialProductsScript = document.getElementById("initial-products");
    const initialProducts = JSON.parse(initialProductsScript.textContent);

    const addNewProductBtn = document.getElementById("add-new-product-btn");
    const addProductForm = document.getElementById("add-product-form");
    const searchForm = document.getElementById("search-form");
    const clearSearchBtn = document.getElementById("clear-search-btn");

    // Add New Product
    addNewProductBtn.addEventListener("click", function () {
      $("#addProductModal").modal("show");
    });

    if (!addProductForm.dataset.listenerAdded) {
      addProductForm.dataset.listenerAdded = true;
      addProductForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const formData = new FormData(this);
        const data = {};
        formData.forEach((value, key) => (data[key] = value));

        fetch("/admin/products", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        })
          .then(handleApiResponse)
          .catch((error) => {
            console.error("Fetch Error:", error);
            showErrorMessage("Error adding product: " + error.message);
          });
      });
    }

    // Search Products Form
    if (!searchForm.dataset.listenerAdded) {
      searchForm.dataset.listenerAdded = true;
      searchForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const query = document.getElementById("search-input").value;
        const filter = document.getElementById("search-filter").value;

        fetch("/admin/products/search", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ query, filter }),
        })
          .then((response) => response.json())
          .then((data) => {
            if (data.status === "success" && data.data.items) {
              updateProductsTable(data.data.items);
              showSuccessMessage("Search completed successfully", false); // Prevent reload for search success
            }
          })
          .catch((error) => {
            console.error("Fetch Error:", error);
            showErrorMessage("Error fetching products: " + error.message);
          });
      });
    }

    clearSearchBtn.addEventListener("click", function () {
      window.location.href = "/admin/products";
    });

    function updateProductsTable(products) {
      const tableContainer = document.getElementById(
        "products-table-container"
      );
      tableContainer.innerHTML = "";

      if (products.length === 0) {
        tableContainer.innerHTML = "<p>No products found</p>";
        return;
      }

      const tableElement = document.createElement("table");
      tableElement.classList.add("table");

      const thead = document.createElement("thead");
      thead.innerHTML = `
        <tr>
          <th>Name</th>
          <th>Description</th>
          <th>Price</th>
          <th>Quantity</th>
          <th>Category</th>
          <th>Brand</th>
          <th>Is Deleted</th>
          <th>Actions</th>
        </tr>
      `;
      tableElement.appendChild(thead);

      const tbody = document.createElement("tbody");
      products.forEach((product) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${product.name}</td>
          <td>${product.description}</td>
          <td>${product.price}</td>
          <td>${product.quantity}</td>
          <td>${product.Category.name}</td>
          <td>${product.Brand.name}</td>
          <td>${product.is_deleted ? "Yes" : "No"}</td>
          <td>
            ${
              product.is_deleted
                ? `
                <button class="btn btn-success btn-sm undelete-product-button" data-id="${product.id}"><i class="fas fa-undo"></i> Undelete</button>
              `
                : `
                <button class="btn btn-warning btn-sm edit-button" data-id="${product.id}" data-toggle="modal" data-target="#editProductModal"><i class="fas fa-edit"></i> Edit</button>
                <button class="btn btn-danger btn-sm delete-product-button" data-id="${product.id}"><i class="fas fa-trash"></i> Delete</button>
              `
            }
          </td>
        `;
        tbody.appendChild(tr);
      });
      tableElement.appendChild(tbody);
      tableContainer.appendChild(tableElement);

      // Add event listeners for edit buttons
      document.querySelectorAll(".edit-button").forEach((button) => {
        button.addEventListener("click", function () {
          const productId = this.dataset.id;

          fetch(`/admin/products/${productId}`)
            .then((response) => response.json())
            .then((product) => {
              const editProductId = document.getElementById("edit-product-id");
              const editName = document.getElementById("edit-name");
              const editDescription =
                document.getElementById("edit-description");
              const editPrice = document.getElementById("edit-price");
              const editQuantity = document.getElementById("edit-quantity");
              const editCategoryId =
                document.getElementById("edit-category_id");
              const editBrandId = document.getElementById("edit-brand_id");

              if (
                editProductId &&
                editName &&
                editDescription &&
                editPrice &&
                editQuantity &&
                editCategoryId &&
                editBrandId
              ) {
                editProductId.value = product.data.product.id;
                editName.value = product.data.product.name;
                editDescription.value = product.data.product.description;
                editPrice.value = product.data.product.price;
                editQuantity.value = product.data.product.quantity;
                editCategoryId.value = product.data.product.category_id;
                editBrandId.value = product.data.product.brand_id;
                $("#editProductModal").modal("show");
              } else {
                showErrorMessage(
                  "Error fetching product details: Some elements are missing"
                );
              }
            })
            .catch((error) => {
              console.error("Fetch Error:", error);
              showErrorMessage(
                "Error fetching product details: " + error.message
              );
            });
        });
      });

      // Add event listeners for delete product buttons
      document.querySelectorAll(".delete-product-button").forEach((button) => {
        button.addEventListener("click", function () {
          const productId = this.dataset.id;
          button.disabled = true; // Disable the button to prevent double click

          fetch(`/admin/products/${productId}`, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
          })
            .then(handleApiResponse)
            .catch((error) => {
              console.error("Fetch Error:", error);
              showErrorMessage("Error deleting product: " + error.message);
            })
            .finally(() => {
              button.disabled = false; // Re-enable the button
            });
        });
      });

      // Add event listeners for undelete product buttons
      document
        .querySelectorAll(".undelete-product-button")
        .forEach((button) => {
          button.addEventListener("click", function () {
            const productId = this.dataset.id;

            fetch(`/admin/products/${productId}/status`, {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ is_deleted: false }),
            })
              .then(handleApiResponse)
              .catch((error) => {
                console.error("Fetch Error:", error);
                showErrorMessage("Error undeleting product: " + error.message);
              });
          });
        });
    }

    // Initial call to add event listeners to existing edit buttons
    updateProductsTable(initialProducts);

    const editProductForm = document.getElementById("edit-product-form");
    if (!editProductForm.dataset.listenerAdded) {
      editProductForm.dataset.listenerAdded = true;
      editProductForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const formData = new FormData(this);
        const data = {};
        formData.forEach((value, key) => (data[key] = value));

        const productId = document.getElementById("edit-product-id").value;

        fetch(`/admin/products/${productId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        })
          .then(handleApiResponse)
          .catch((error) => {
            console.error("Fetch Error:", error);
            showErrorMessage("Error updating product: " + error.message);
          });
      });
    }
  }

  // Brands Page Functionality
  if (document.getElementById("initial-brands")) {
    const initialBrandsScript = document.getElementById("initial-brands");
    const initialBrands = JSON.parse(initialBrandsScript.textContent);

    const addNewBrandBtn = document.getElementById("add-new-brand-btn");
    const addBrandForm = document.getElementById("add-brand-form");

    // Add New Brand
    addNewBrandBtn.addEventListener("click", function () {
      $("#newBrandModal").modal("show");
    });

    if (!addBrandForm.dataset.listenerAdded) {
      addBrandForm.dataset.listenerAdded = true;
      addBrandForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const formData = new FormData(this);
        const data = {};
        formData.forEach((value, key) => (data[key] = value));

        fetch("/admin/brands", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        })
          .then(handleApiResponse)
          .catch((error) => {
            console.error("Fetch Error:", error);
            showErrorMessage("Error adding brand: " + error.message);
          });
      });
    }

    // Add event listeners for edit brand buttons
    document.querySelectorAll(".edit-button").forEach((button) => {
      button.addEventListener("click", function () {
        const brandId = this.dataset.id;

        fetch(`/admin/brands/${brandId}`)
          .then((response) => response.json())
          .then((brand) => {
            const editBrandId = document.getElementById("edit-brand-id");
            const editName = document.getElementById("edit-name");

            if (editBrandId && editName) {
              editBrandId.value = brand.data.brand.id;
              editName.value = brand.data.brand.name;
              $("#editBrandModal").modal("show");
            } else {
              showErrorMessage(
                "Error fetching brand details: Some elements are missing"
              );
            }
          })
          .catch((error) => {
            console.error("Fetch Error:", error);
            showErrorMessage("Error fetching brand details: " + error.message);
          });
      });
    });

    const editBrandForm = document.getElementById("edit-brand-form");
    if (!editBrandForm.dataset.listenerAdded) {
      editBrandForm.dataset.listenerAdded = true;
      editBrandForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const formData = new FormData(this);
        const data = {};
        formData.forEach((value, key) => (data[key] = value));

        const brandId = document.getElementById("edit-brand-id").value;

        fetch(`/admin/brands/${brandId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        })
          .then(handleApiResponse)
          .catch((error) => {
            console.error("Fetch Error:", error);
            showErrorMessage("Error updating brand: " + error.message);
          });
      });
    }

    // Add event listeners for delete brand buttons
    document.querySelectorAll(".delete-brand-button").forEach((button) => {
      button.addEventListener("click", function () {
        const brandId = this.dataset.id;

        button.disabled = true;

        fetch(`/admin/brands/${brandId}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        })
          .then(handleApiResponse)
          .catch((error) => {
            console.error("Fetch Error:", error);
            showErrorMessage("Error deleting brand: " + error.message);
          })
          .finally(() => {
            button.disabled = false;
          });
      });
    });
  }

  // Orders Page Functionality
  if (document.getElementById("initial-orders")) {
    const initialOrdersScript = document.getElementById("initial-orders");
    const initialOrders = JSON.parse(initialOrdersScript.textContent);

    const searchFormOrders = document.getElementById("search-form-orders");
    const clearSearchBtnOrders = document.getElementById("clear2-search-btn");
    const editOrderForm = document.getElementById("edit-order-form");

    // Search Orders Form
    if (!searchFormOrders.dataset.listenerAdded) {
      searchFormOrders.dataset.listenerAdded = true;
      searchFormOrders.addEventListener("submit", function (event) {
        event.preventDefault();

        const query = document.getElementById("search-input-orders").value;
        const filter = document.getElementById("search-filter-orders").value;

        fetch("/admin/orders/search", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ query, filter }),
        })
          .then((response) => response.json())
          .then((data) => {
            if (data.status === "success" && data.data.items) {
              updateOrdersTable(data.data.items);
              showSuccessMessage("Search completed successfully", false);
            }
          })
          .catch((error) => {
            console.error("Fetch Error:", error);
            showErrorMessage("Error fetching orders: " + error.message);
          });
      });
    }

    clearSearchBtnOrders.addEventListener("click", function () {
      window.location.href = "/admin/orders";
    });

    function updateOrdersTable(orders) {
      const tableContainer = document.getElementById("orders-table-container");
      tableContainer.innerHTML = "";

      if (orders.length === 0) {
        tableContainer.innerHTML = "<p>No orders found</p>";
        return;
      }

      const tableElement = document.createElement("table");
      tableElement.classList.add("table");

      const thead = document.createElement("thead");
      thead.innerHTML = `
        <tr>
          <th>Order ID</th>
          <th>User</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      `;
      tableElement.appendChild(thead);

      const tbody = document.createElement("tbody");
      orders.forEach((order) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${order.id}</td>
          <td>${order.User.username}</td>
          <td>${order.status}</td>
          <td>
            <button class="btn btn-warning btn-sm edit-order-button" data-id="${order.id}"><i class="fas fa-edit"></i> Edit</button>
          </td>
        `;
        tbody.appendChild(tr);
      });
      tableElement.appendChild(tbody);
      tableContainer.appendChild(tableElement);

      // Add event listeners for edit buttons
      document.querySelectorAll(".edit-order-button").forEach((button) => {
        button.addEventListener("click", function () {
          const orderId = this.dataset.id;

          fetch(`/admin/orders/${orderId}`)
            .then((response) => response.json())
            .then((order) => {
              const editOrderId = document.getElementById("edit-order-id");
              const editStatus = document.getElementById("edit-status");

              if (editOrderId && editStatus) {
                editOrderId.value = order.data.order.id;
                editStatus.value = order.data.order.status;
                $("#editOrderModal").modal("show");
              } else {
                showErrorMessage(
                  "Error fetching order details: Some elements are missing"
                );
              }
            })
            .catch((error) => {
              console.error("Fetch Error:", error);
              showErrorMessage(
                "Error fetching order details: " + error.message
              );
            });
        });
      });
    }

    // Initial call to add event listeners to existing edit buttons
    updateOrdersTable(initialOrders);

    if (!editOrderForm.dataset.listenerAdded) {
      editOrderForm.dataset.listenerAdded = true;
      editOrderForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const formData = new FormData(this);
        const data = {};
        formData.forEach((value, key) => (data[key] = value));

        const orderId = document.getElementById("edit-order-id").value;

        fetch(`/admin/orders/${orderId}/status`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        })
          .then(handleApiResponse)
          .catch((error) => {
            console.error("Fetch Error:", error);
            showErrorMessage("Error updating order status: " + error.message);
          });
      });
    }
  }

  // Users Page Functionality
  if (document.getElementById("initial-users")) {
    const initialUsersScript = document.getElementById("initial-users");
    const initialUsers = JSON.parse(initialUsersScript.textContent);

    // Add event listeners for edit buttons
    document.querySelectorAll(".edit-button").forEach((button) => {
      button.addEventListener("click", function () {
        const userId = this.dataset.id;

        fetch(`/admin/users/${userId}`)
          .then((response) => response.json())
          .then((user) => {
            const editUserId = document.getElementById("edit-user-id");
            const editUsername = document.getElementById("edit-username");
            const editEmail = document.getElementById("edit-email");
            const editFirstname = document.getElementById("edit-firstname");
            const editLastname = document.getElementById("edit-lastname");
            const editRoleId = document.getElementById("edit-role_id");
            const editAddress = document.getElementById("edit-address");
            const editTelephonenumber = document.getElementById(
              "edit-telephonenumber"
            );

            if (
              editUserId &&
              editUsername &&
              editEmail &&
              editFirstname &&
              editLastname &&
              editRoleId &&
              editAddress &&
              editTelephonenumber
            ) {
              editUserId.value = user.data.user.id;
              editUsername.value = user.data.user.username;
              editEmail.value = user.data.user.email;
              editFirstname.value = user.data.user.firstname;
              editLastname.value = user.data.user.lastname;
              editRoleId.value = user.data.user.role_id;
              editAddress.value = user.data.user.address;
              editTelephonenumber.value = user.data.user.telephonenumber;
              $("#editUserModal").modal("show");
            } else {
              showErrorMessage(
                "Error fetching user details: Some elements are missing"
              );
            }
          })
          .catch((error) => {
            console.error("Fetch Error:", error);
            showErrorMessage("Error fetching user details: " + error.message);
          });
      });
    });

    const editUserForm = document.getElementById("edit-user-form");
    if (!editUserForm.dataset.listenerAdded) {
      editUserForm.dataset.listenerAdded = true;
      editUserForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const formData = new FormData(this);
        const data = {};
        formData.forEach((value, key) => (data[key] = value));

        const userId = document.getElementById("edit-user-id").value;

        fetch(`/admin/users/${userId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        })
          .then(handleApiResponse)
          .catch((error) => {
            console.error("Fetch Error:", error);
            showErrorMessage("Error updating user: " + error.message);
          });
      });
    }
  }

  // Categories Page Functionality
  if (document.getElementById("initial-categories")) {
    const initialCategoriesScript =
      document.getElementById("initial-categories");
    const initialCategories = JSON.parse(initialCategoriesScript.textContent);

    const addNewCategoryBtn = document.getElementById("add-new-category-btn");
    const addCategoryForm = document.getElementById("add-category-form");

    // Add New Category
    addNewCategoryBtn.addEventListener("click", function () {
      $("#newCategoryModal").modal("show");
    });

    if (!addCategoryForm.dataset.listenerAdded) {
      addCategoryForm.dataset.listenerAdded = true;
      addCategoryForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const formData = new FormData(this);
        const data = {};
        formData.forEach((value, key) => (data[key] = value));

        fetch("/admin/categories", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        })
          .then(handleApiResponse)
          .catch((error) => {
            console.error("Fetch Error:", error);
            showErrorMessage("Error adding category: " + error.message);
          });
      });
    }

    // Add event listeners for edit category buttons
    document.querySelectorAll(".edit-button").forEach((button) => {
      button.addEventListener("click", function () {
        const categoryId = this.dataset.id;

        fetch(`/admin/categories/${categoryId}`)
          .then((response) => response.json())
          .then((category) => {
            const editCategoryId = document.getElementById("edit-category-id");
            const editName = document.getElementById("edit-name");

            if (editCategoryId && editName) {
              editCategoryId.value = category.data.category.id;
              editName.value = category.data.category.name;
              $("#editCategoryModal").modal("show");
            } else {
              showErrorMessage(
                "Error fetching category details: Some elements are missing"
              );
            }
          })
          .catch((error) => {
            console.error("Fetch Error:", error);
            showErrorMessage(
              "Error fetching category details: " + error.message
            );
          });
      });
    });

    const editCategoryForm = document.getElementById("edit-category-form");
    if (!editCategoryForm.dataset.listenerAdded) {
      editCategoryForm.dataset.listenerAdded = true;
      editCategoryForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const formData = new FormData(this);
        const data = {};
        formData.forEach((value, key) => (data[key] = value));

        const categoryId = document.getElementById("edit-category-id").value;

        fetch(`/admin/categories/${categoryId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        })
          .then(handleApiResponse)
          .catch((error) => {
            console.error("Fetch Error:", error);
            showErrorMessage("Error updating category: " + error.message);
          });
      });
    }

    // Add event listeners for delete category buttons
    document.querySelectorAll(".delete-category-button").forEach((button) => {
      button.addEventListener("click", function () {
        const categoryId = this.dataset.id;

        button.disabled = true;

        fetch(`/admin/categories/${categoryId}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        })
          .then(handleApiResponse)
          .catch((error) => {
            console.error("Fetch Error:", error);
            showErrorMessage("Error deleting category: " + error.message);
          })
          .finally(() => {
            button.disabled = false;
          });
      });
    });
  }

  // Function to show alerts
  function showAlert(message, type) {
    const alertContainer = document.getElementById("alert-container");
    alertContainer.classList.remove("d-none", "alert-success", "alert-danger");
    alertContainer.classList.add(`alert-${type}`);
    alertContainer.textContent = message;
  }

  // Handle login form submission
  const loginForm = document.getElementById("login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", function (event) {
      event.preventDefault();

      const formData = new FormData(this);
      const data = {};
      formData.forEach((value, key) => (data[key] = value));

      fetch("/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })
        .then((response) => response.json())
        .then((result) => {
          if (result.success) {
            showAlert(result.message, "success");
            setTimeout(() => {
              window.location.href = "/admin/products";
            }, 3000);
          } else {
            showAlert(result.message, "danger");
          }
        })
        .catch((error) => {
          console.error("Login Error:", error);
          showAlert("An error occurred. Please try again later.", "danger");
        });
    });
  }
});
