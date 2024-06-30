// Function to prompt the user for the main ingredient
async function takeOrder() {
  let ingredient = prompt("Enter the main ingredient for the meal:")
    .toLowerCase()
    .replace(/\s+/g, "_");
  let meal = await getMealByIngredient(ingredient);

  if (!meal) {
    alert("No meals found with that ingredient. Please try again.");
    return takeOrder();
  }

  let order = createOrder(meal);
  saveOrder(order);
  alert(`Order placed: ${order.description} (Order No: ${order.orderNumber})`);
}

// Function to get meals by ingredient using The Meal DB API
async function getMealByIngredient(ingredient) {
  try {
    let response = await fetch(
      `https://www.themealdb.com/api/json/v1/1/filter.php?i=${ingredient}`
    );
    let data = await response.json();
    if (!data.meals) return null;
    return data.meals[Math.floor(Math.random() * data.meals.length)].strMeal;
  } catch (error) {
    console.error("Error fetching the meal data: ", error);
    return null;
  }
}

// Function to create an order
function createOrder(mealDescription) {
  let orderNumber = getLastOrderNumber() + 1;
  return {
    orderNumber,
    description: mealDescription,
    status: "incomplete",
  };
}

// Function to save the order to sessionStorage
function saveOrder(order) {
  let orders = JSON.parse(sessionStorage.getItem("orders")) || [];
  orders.push(order);
  sessionStorage.setItem("orders", JSON.stringify(orders));
  sessionStorage.setItem("lastOrderNumber", order.orderNumber);
}

// Function to get the last order number from sessionStorage
function getLastOrderNumber() {
  return parseInt(sessionStorage.getItem("lastOrderNumber")) || 0;
}

// Function to display and complete orders
function completeOrder() {
  let orders = JSON.parse(sessionStorage.getItem("orders")) || [];
  let incompleteOrders = orders.filter(
    (order) => order.status === "incomplete"
  );

  if (incompleteOrders.length === 0) {
    alert("No incomplete orders found.");
    return;
  }

  let orderDescriptions = incompleteOrders
    .map(
      (order) =>
        `Order No: ${order.orderNumber}, Description: ${order.description}`
    )
    .join("\n");
  let orderNumber = prompt(
    `Incomplete orders:\n${orderDescriptions}\n\nEnter the order number to mark as complete, or 0 to cancel:`
  );

  if (orderNumber === "0") return;

  let order = orders.find((order) => order.orderNumber == orderNumber);

  if (!order) {
    alert("Order number not found.");
    return completeOrder();
  }

  order.status = "complete";
  sessionStorage.setItem("orders", JSON.stringify(orders));
  alert(`Order No: ${orderNumber} marked as complete.`);
}

// Start the order process when the page loads
window.onload = function () {
  takeOrder();
  completeOrder();
};
