const apigClient = apigClientFactory.newClient({
    apiKey: 'YOUR_API_KEY', // Replace with your API Gateway API key (if you're using one)
    region: 'YOUR_AWS_REGION', // Replace with your AWS region
});

function showOrders() {
    const params = {}; // Add any necessary parameters
    const body = {}; // Add any necessary request body

    // Call the API Gateway endpoint to get orders ready to deliver
    apigClient.ordersGet(params, body)
        .then(function(result) {
            displayOrders(result.data);
        })
        .catch(function(err) {
            console.error('Error fetching orders:', err);
        });
}


function displayOrders(orders) {
    const ordersList = document.getElementById('ordersList');
    ordersList.innerHTML = '';

    orders.forEach(function(order) {
        const orderDiv = document.createElement('div');
        orderDiv.innerHTML = `<p>Order ID: ${order.orderId}</p>
                              <p>Details: ${order.details}</p>
                              <button onclick="startDelivery('${order.orderId}')">Start Delivery</button>
                              <button onclick="completeDelivery('${order.orderId}')">Complete Delivery</button>`;
        ordersList.appendChild(orderDiv);
    });
}

function startDelivery(orderId) {
    // Start collecting user's location every 15 seconds and send it to API Gateway
    const intervalId = setInterval(function() {
        // Get user's location using geolocation API
        navigator.geolocation.getCurrentPosition(function(position) {
            const location = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
            };

            // Send location to API Gateway
            sendLocation(orderId, location);
        });
    }, 15000);

    // Save intervalId to stop location tracking later
    // (You'll need a mechanism to associate each orderId with its corresponding intervalId)
    // For demonstration purposes, we'll just store it in a global variable
    window.intervalIds = window.intervalIds || {};
    window.intervalIds[orderId] = intervalId;
}

function sendLocation(orderId, location) {
    const params = {}; // Add any necessary parameters
    const body = { orderId: orderId, location: location }; // Body containing order ID and location

    // Call API Gateway endpoint to send the location
    apigClient.locationPost(params, body)
        .then(function(result) {
            console.log('Location sent successfully:', result.data);
        })
        .catch(function(err) {
            console.error('Error sending location:', err);
        });
}

function completeDelivery(orderId) {
    // Stop tracking location for the specific orderId
    clearInterval(window.intervalIds[orderId]);

    // Call API Gateway to update that the order is delivered
    const params = {}; // Add any necessary parameters
    const body = { orderId: orderId }; // Body containing order ID

    // Call API Gateway endpoint to mark delivery as complete
    apigClient.completeDeliveryPost(params, body)
        .then(function(result) {
            console.log('Delivery completed:', result.data);
        })
        .catch(function(err) {
            console.error('Error completing delivery:', err);
        });
}
