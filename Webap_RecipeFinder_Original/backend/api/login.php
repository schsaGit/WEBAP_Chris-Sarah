<?php
if (isset($_COOKIE["user"])) {
    header('Location: ../../frontend/index.html');
    exit;
} else {
    require_once '../backend/db.php';

    $username = $_POST['username'] ?? '';
    $error = '';
    $success = '';
    $hashedPassword = "";

    $form = "
    <form method='post'>
        <label for='username'>username</label>
        <input id='username' type='text' required value='$username' name='username'>
        <br>
        <label for='password'>password</label>
        <input id='password' type='password' required name='password'>
        <br>
        <input type='submit' name='login' value='log in'>
    </form>
    ";

    # check if form is submitted
    if (isset($_POST['login'])) {
        # check if post values are set
        if (isset($_POST['username']) && isset($_POST['password'])) {
            $username = trim($_POST['username']);
            $password = $_POST['password'];

            # connect to database
            $conn = connectDB();

            # prepare query
            $query = "SELECT pk_userId, password FROM Users
                      WHERE username = ?;";
            $stmt = mysqli_prepare($conn, $query);

            # prepared statement to avoid sql injections
            if ($stmt) {

                # bind variables
                mysqli_stmt_bind_param($stmt, 's', $username);

                # execute query and check for failure
                if (mysqli_stmt_execute($stmt)) {
                    mysqli_stmt_bind_result($stmt, $pk_userId, $hashedPassword);

                    if (mysqli_stmt_fetch($stmt) && password_verify($password, $hashedPassword)) {
                        setcookie('user', (string) $pk_userId, strtotime('+90 days'), '/');
                        mysqli_stmt_close($stmt);
                        mysqli_close($conn);
                        header('Location: ../../frontend/index.html');
                        exit;
                    } else {
                        $error = 'Invalid username or password.';
                    }
                } else {
                    $error = 'Failed to log in user.';
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
    if (!isset($_POST['login']) || $error !== '') {
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
