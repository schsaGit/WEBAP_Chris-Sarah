<?php

    $items = [
        ['id' => 1, 'name' => 'Item 1', 'beschreibung' => "Dies ist ein Item"],
        ['id' => 2, 'name' => 'Item 2', 'beschreibung' => "Dies ist ein Item"],
        ['id' => 3, 'name' => 'Item 3', 'beschreibung' => "Dies ist ein Item"]
    ];


    if (isset($_GET['infotype'])) {
        $id = (int)$_GET['id'];
        $item = null;

        foreach ($items as $i) {
            if ($i['id'] === $id) {
                $item = $i;
                break;
            }
        }

        if ($item) {
            echo json_encode($item);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Item nicht gefunden']);
        }
    } else {
        echo json_encode($items);
    }
?>