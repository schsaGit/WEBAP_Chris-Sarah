<?php
if (isset($_COOKIE["user"])) {
    header('Location: ../../frontend/index.html');
    exit;
} else {
    require_once '../db.php';

    $name = $_POST['name'] ?? '';
    $username = $_POST['username'] ?? '';
    $error = '';
    $success = '';

    $form = "
    <form method='post'>
        <label for='name'>name</label>
        <input id='name' type='text' required value='$name' name='name'>
        <br>
        <label for='username'>username</label>
        <input id='username' type='text' required value='$username' name='username'>
        <br>
        <label for='password'>password</label>
        <input id='password' type='password' required name='password'>
        <br>
        <input type='submit' name='register' value='register'>
    </form>
    ";

    # check if form is submitted
    if (isset($_POST['register'])) {
        # check if post values are set
        if (isset($_POST['name']) && isset($_POST['username']) && isset($_POST['password'])) {
            $name = trim($_POST['name']);
            $username = trim($_POST['username']);
            $hashedPassword = password_hash($_POST['password'], PASSWORD_DEFAULT);
            $defaultPfp = 'https://shorturl.at/jkuPe';

            # connect to database
            $conn = connectDB();

            # prepare query
            $role = 'user';
            $query = "INSERT INTO `Users` (`username`, `password`, `name`, `pfp`, `role`)
                  VALUES (?, ?, ?, ?, ?)";
            $stmt = mysqli_prepare($conn, $query);

            # prepared statement to avoid sql injections
            if ($stmt) {

                # bind variables
                mysqli_stmt_bind_param($stmt, 'sssss', $username, $hashedPassword, $name, $defaultPfp, $role);

                # execute query and check for failure
                if (mysqli_stmt_execute($stmt)) {
                    $pk_userId = mysqli_insert_id($conn);
                    setcookie('user', (string) $pk_userId, strtotime('+90 days'), '/');
                    mysqli_stmt_close($stmt);
                    mysqli_close($conn);
                    header('Location: ../../frontend/index.html');
                    exit;
                } else {
                    $error = 'Failed to register user.';
                }

                # close statement
                mysqli_stmt_close($stmt);
            } else {
                $error = 'Failed to prepare statement.';
            }

            #close db connection
            mysqli_close($conn);
        } else {
            $error = 'Please fill in all fields.';
        }
    }

    # check if form isn't submitted and no errors are set (first visit)
    if (!isset($_POST['register']) || $error !== '') {
        echo $form;
    }

    # check if error is present and display it
    if ($error !== '') {
        echo "<p>$error</p>";
    }

    if ($success !== '') {
        echo "<p>$success</p>";
    }
}
