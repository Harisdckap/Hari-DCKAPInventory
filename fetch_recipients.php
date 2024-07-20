<?php
header('Content-Type: application/json');
$pdo = new PDO('mysql:host=localhost;dbname=DCKAPPalliInventory', 'dckap', 'Dckap2023Ecommerce');

$query = $pdo->query('SELECT * FROM recipients');
$recipients = $query->fetchAll(PDO::FETCH_ASSOC);

echo json_encode($recipients);
?>
