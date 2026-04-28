<?php
    $items = [
        ['id' => 1, 'name' => 'Item 1', 'beschreibung' => "Dies ist ein Item"],
        ['id' => 2, 'name' => 'Item 2', 'beschreibung' => "Dies ist ein Item"],
        ['id' => 3, 'name' => 'Item 3', 'beschreibung' => "Dies ist ein Item"]
    ];

    if(isset($_GET['id'])) {
        $id = (int)$_GET['id'];
    } else {
        $id = 0;
    }

    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'Keine ID angegeben']);
        exit;
    }

    $found = false;
    foreach ($items as $key => $item) {
        if ($item['id'] === $id) {
            array_splice($items, $key, 1);
            $found = true;

            echo json_encode([
                'message' => "ID=$id wurde gelöscht"
            ]);
            break;
        }
    }

    if (!$found) {
        http_response_code(404);
        echo json_encode(['error' => 'Item nicht gefunden']);
    }
?>