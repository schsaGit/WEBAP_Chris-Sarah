<?php
if (isset($_COOKIE["user"])) {
    header('Location: index.php');
    exit;
} else {
    require_once '../backend/db.php';

    $username = $_POST['username'] ?? '';
    $error = '';
    $success = '';
    $hashedPassword = "";

    $form = "
    <style>
        body { background: #FA8112; }
        .auth-box { max-width: 360px; margin: 60px auto; background: #FAF3E1; border: 2px solid #F5E7C6; border-radius: 8px; padding: 40px; }
        .auth-box h2 { color: #FA8112; margin-bottom: 24px; }
        .auth-box label { display: block; margin-bottom: 4px; font-size: 14px; }
        .auth-box input[type='text'], .auth-box input[type='password'] { width: 100%; padding: 10px; border: 2px solid #F5E7C6; border-radius: 4px; font-size: 14px; margin-bottom: 16px; box-sizing: border-box; }
        .auth-box input[type='text']:focus, .auth-box input[type='password']:focus { outline: none; border-color: #FA8112; }
        .auth-box input[type='submit'] { width: 100%; background-color: #F5E7C6; color: #222; border: 1px solid #222; padding: 10px; border-radius: 4px; font-size: 14px; cursor: pointer; }
        .auth-box input[type='submit']:hover { background-color: #FA8112; color: #FAF3E1; border-color: #FA8112; }
        .auth-link { margin-top: 14px; font-size: 13px; }
        .auth-link a { color: #FA8112; }
    </style>
    <div class='auth-box'>
        <h2>Login</h2>
        <form method='post'>
            <label for='username'>Username</label>
            <input id='username' type='text' required value='$username' name='username'>
            <label for='password'>Password</label>
            <input id='password' type='password' required name='password'>
            <input type='submit' name='login' value='Log in'>
        </form>
        <p class='auth-link'>No account? <a href='index.php?page=register'>Register</a></p>
    </div>
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
                        header('Location: index.php');
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
        echo "<p style='color:#c0392b;margin-top:12px;font-size:14px;max-width:360px;margin-left:auto;margin-right:auto;'>$error</p>";
    }

    if ($success !== '') {
        echo "<p>$success</p>";
    }
}
