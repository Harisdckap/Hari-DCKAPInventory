<?php
header('Content-Type: application/json');

$pdo = new PDO('mysql:host=localhost;dbname=DCKAPPalliInventory', 'dckap', 'Dckap2023Ecommerce');

// Check if the request method is POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    parse_str(file_get_contents('php://input'), $data);

    // Get data from the POST request
    $name = $data['name'] ?? '';
    $quantity = $data['quantity'] ?? 0;

    if (!empty($name) && is_numeric($quantity)) {
        try {
            // Check if the product already exists
            $stmt = $pdo->prepare('SELECT COUNT(*) FROM products WHERE name = ?');
            $stmt->execute([$name]);
            $exists = $stmt->fetchColumn();

            if ($exists) {
                // Respond with error if product already exists
                echo json_encode(['error' => 'Product already exists. Please enter another name.']);
            } else {
                // Insert the new product if it does not exist
                $stmt = $pdo->prepare('INSERT INTO products (name, quantity) VALUES (?, ?)');
                $stmt->execute([$name, $quantity]);

                // Respond with success
                echo json_encode(['message' => 'Product added successfully.']);
            }
        } catch (PDOException $e) {
            // Respond with error
            echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        }
    } else {
        // Respond with validation error
        echo json_encode(['error' => 'Invalid input.']);
    }
} else {
    // Respond with method not allowed
    echo json_encode(['error' => 'Invalid request method.']);
}
?>
