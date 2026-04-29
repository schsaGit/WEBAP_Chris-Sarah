<?php
    $items = [
        ['id' => 1, 'name' => 'Item 1', 'beschreibung' => "Dies ist ein Item"],
        ['id' => 2, 'name' => 'Item 2', 'beschreibung' => "Dies ist ein Item"],
        ['id' => 3, 'name' => 'Item 3', 'beschreibung' => "Dies ist ein Item"]
    ];


    if(isset($_POST['name'])) {
        $name = $_POST['name'];
    } else {
        $name = '';
    }

    if(isset($_POST['beschreibung'])) {
        $description = $_POST['beschreibung'];
    } else {
        $description = '';
    }

    $newId = count($items) + 1;

    $newItem = [
        'id' => $newId,
        'name' => $name,
        'beschreibung' => $description
    ];

    $items[] = $newItem;

    echo json_encode([
        'message' => 'Neuer Datensatz angelegt',
        'item' => $newItem
    ]);
?>