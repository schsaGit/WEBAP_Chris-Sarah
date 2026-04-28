<?php
    $items = [
        ['id' => 1, 'name' => 'Item 1', 'beschreibung' => "Dies ist ein Item"],
        ['id' => 2, 'name' => 'Item 2', 'beschreibung' => "Dies ist ein Item"],
        ['id' => 3, 'name' => 'Item 3', 'beschreibung' => "Dies ist ein Item"]
    ];

    $Body = file_get_contents('php://input');
    $data = json_decode($Body, true);

    if (!$data) {
        parse_str($Body, $data);
    }

    if(isset($_GET['id'])) {
        $id = (int)$_GET['id'];
    } else {
        if(isset($data['id'])) {
            $id = $data['id'];
        } else {
            $id = 0;
        }
    }

    if(isset($data['name'])) {
        $name = $data['name'];
    } else {
        $name = '';
    }

    if(isset($data['beschreibung'])) {
        $beschreibung = $data['beschreibung'];
    } else {
        $beschreibung = '';
    }

    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'Keine ID angegeben']);
        exit;
    }

    $found = false;
    foreach ($items as $key => $item) {
        if ($item['id'] === $id) {

            $items[$key]['name'] = $name ?: $item['name'];
            $items[$key]['beschreibung'] = $beschreibung ?: $item['beschreibung'];
            $found = true;

            echo json_encode([
                'message' => "ID=$id wurde aktualisiert",
                'item' => $items[$key]
            ]);
            break;
        }
    }

    if (!$found) {
        http_response_code(404);
        echo json_encode(['error' => 'Item nicht gefunden']);
    }
?>