<?php
header('Content-Type: application/json');

try {
    // Parse input data
    parse_str(file_get_contents('php://input'), $data);

    // Database connection
    $pdo = new PDO('mysql:host=localhost;dbname=DCKAPPalliInventory', 'dckap', 'Dckap2023Ecommerce');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Determine action
    $action = $data['action'] ?? '';

    // Add product action
    if ($action === 'add_product') {
        $name = $data['name'] ?? '';
        $quantity = $data['quantity'] ?? 0;

        if ($name && $quantity > 0) {
            $stmt = $pdo->prepare('INSERT INTO products (name, quantity) VALUES (?, ?) ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)');
            $stmt->execute([$name, $quantity]);

            echo json_encode(['message' => 'Product added/updated successfully.']);
        } else {
            echo json_encode(['error' => 'Invalid product name or quantity.']);
        }

    // Update product action
    } elseif ($action === 'update_product') {
        $recipientName = $data['name'] ?? '';
        $productName = $data['product'] ?? '';
        $quantity = $data['quantity'] ?? 0;

        if ($recipientName && $productName && $quantity > 0) {
            $stmt = $pdo->prepare('SELECT id, quantity FROM products WHERE name = ?');
            $stmt->execute([$productName]);
            $product = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($product && $product['quantity'] >= $quantity) {
                $pdo->beginTransaction();
                $stmt = $pdo->prepare('UPDATE products SET quantity = quantity - ? WHERE id = ?');
                $stmt->execute([$quantity, $product['id']]);

                $stmt = $pdo->prepare('INSERT INTO recipients (name, product, quantity) VALUES (?, ?, ?)');
                $stmt->execute([$recipientName, $productName, $quantity]);

                $pdo->commit();

                echo json_encode(['message' => 'Inventory updated successfully.']);
            } else {
                echo json_encode(['error' => 'Insufficient quantity or product not found.']);
            }
        } else {
            echo json_encode(['error' => 'Invalid recipient name, product name, or quantity.']);
        }

    // Invalid action
    } else {
        echo json_encode(['error' => 'Invalid action']);
    }

} catch (PDOException $e) {
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
} catch (Exception $e) {
    echo json_encode(['error' => 'General error: ' . $e->getMessage()]);
}
?>
