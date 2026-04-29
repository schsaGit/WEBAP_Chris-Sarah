<?php
require_once __DIR__ . '/../db.php';

if (isset($_COOKIE["user"]) && !empty($_COOKIE["user"])) {
    $userId = (int) $_COOKIE["user"];
    $statusMessage = '';
    $statusType = '';

    if ($userId <= 0) {
        setcookie("user", "", time() - 3600, "/");
        header("Location: ../../frontend/");
        exit;
    }

    if (isset($_POST["BUTTON_signout"])) {
        if (session_status() === PHP_SESSION_ACTIVE) {
            session_destroy();
        }
        setcookie("user", "", time() - 3600, "/");
        header("Location: ../../frontend/");
        exit;
    }

    if (isset($_POST["BUTTON_change_password"])) {
        $currentPassword = $_POST["DATA_current_password"] ?? "";
        $newPassword = $_POST["DATA_new_password"] ?? "";
        $confirmPassword = $_POST["DATA_confirm_password"] ?? "";
        $hasSpecialChar = preg_match('/[^a-zA-Z0-9]/', $newPassword);
        $hasNumber = preg_match('/[0-9]/', $newPassword);

        // check if passwords match
        if ($newPassword !== $confirmPassword) {
            $error = "your passwords must match";
        }

        if (!$hasNumber) { // check if password conditions are false
            $error = "your password must include a number";
        }

        if (!$hasSpecialChar) { // check if password has special characters
            $error = "your password must include a special caracter";
        }

        // check if password is between 5 and 20 chars
        if (strlen($newPassword) < 5 || strlen($newPassword) > 20) {
            $error = "your password must be between 5 and 20 characters";
        }

        if (isset($error)) {
            $statusMessage = $error;
            $statusType = 'error';
        } else {
            $conn = connectDB();

            // prepare query to filter pks
            $query = "SELECT password
                      FROM Users
                      WHERE pk_userId = ?
                      LIMIT 1";

            // use prepared statements to prevent sql injections
            $stmt = mysqli_prepare($conn, $query);
            if (!$stmt) {
                // show error if it fails
                die("Prepare failed: " . mysqli_error($conn));
            }

            mysqli_stmt_bind_param(
                $stmt,
                "i",
                $userId
            );

            if (!mysqli_stmt_execute($stmt)) {
                die("Execute failed: " . mysqli_stmt_error($stmt));
            }

            $password = '';

            mysqli_stmt_bind_result(
                $stmt,
                $password
            );

            if (!mysqli_stmt_fetch($stmt)) {
                mysqli_stmt_close($stmt);
                mysqli_close($conn);
                setcookie("user", "", time() - 3600, "/");
                header("Location: ../../frontend/index.html");
                exit;
            }

            mysqli_stmt_close($stmt);


            if (password_verify($currentPassword, $password)) {
                $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);
                $query = "UPDATE Users SET password = ? WHERE pk_userId = ?";
                $stmt = mysqli_prepare($conn, $query);
                if (!$stmt) {
                    die("Prepare failed: " . mysqli_error($conn));
                }

                mysqli_stmt_bind_param($stmt, "si", $hashedPassword, $userId);

                if (!mysqli_stmt_execute($stmt)) {
                    die("Execute failed: " . mysqli_stmt_error($stmt));
                }

                mysqli_stmt_close($stmt);
                $statusMessage = "Your password has been updated.";
                $statusType = "success";
            } else {
                $statusMessage = "your current password is incorrect";
                $statusType = "error";
            }

            mysqli_close($conn);    // close database connection
        }
    }

    $conn = connectDB();

    $query = "SELECT pk_userId, username, name, pfp, created, role
              FROM Users
              WHERE pk_userId = ?
              LIMIT 1";

    $stmt = mysqli_prepare($conn, $query);
    if (!$stmt) {
        // show error if it fails
        die("Prepare failed: " . mysqli_error($conn));
    }

    mysqli_stmt_bind_param(
        $stmt,
        "i",
        $userId
    );

    if (!mysqli_stmt_execute($stmt)) {
        die("Execute failed: " . mysqli_stmt_error($stmt));
    }

    mysqli_stmt_bind_result(
        $stmt,
        $pk_userId,
        $username,
        $Name,
        $pfp,
        $created,
        $role
    );

    if (mysqli_stmt_fetch($stmt)) {
        render_settings_header();
        show_account_card($pk_userId, $username, $Name, $pfp, $created, $role, $statusMessage, $statusType);
        render_settings_footer();
    } else {
        setcookie("user", "", time() - 3600, "/");
        echo "<meta http-equiv='Refresh' content='0; ../../frontend/index.html'>";
    }

    mysqli_stmt_close($stmt);
    mysqli_close($conn);    // close database connection
} else {
    echo "<meta http-equiv='Refresh' content='0; ../../frontend/index.html'>"; // refresh to home page
}

function render_settings_header() {
    echo "<!DOCTYPE html>
<html lang='en'>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>Settings - Recipe Finder</title>
    <link rel='stylesheet' href='../../frontend/css/style.css'>
</head>
<body class='settings-body'>";
}

function render_settings_footer() {
    echo "<script>
const signoutBtn = document.getElementById('signoutBtn');
const signoutModal = document.getElementById('signoutModal');
const signoutCancel = document.getElementById('signoutCancel');
const signoutConfirm = document.getElementById('signoutConfirm');
const signoutForm = document.getElementById('signoutForm');
const signoutInput = document.getElementById('BUTTON_signout');
const changePwLink = document.getElementById('changePwLink');
const changePwModal = document.getElementById('changePwModal');
const changePwCancel = document.getElementById('changePwCancel');
const changePwConfirm = document.getElementById('changePwConfirm');
const changePwForm = document.getElementById('changePwForm');
const changePwInput = document.getElementById('BUTTON_change_password');

function openModal(modal) {
    if (modal) {
        modal.classList.add('is-open');
        modal.setAttribute('aria-hidden', 'false');
    }
}

function closeModal(modal) {
    if (modal) {
        modal.classList.remove('is-open');
        modal.setAttribute('aria-hidden', 'true');
    }
}

signoutBtn?.addEventListener('click', () => openModal(signoutModal));
signoutCancel?.addEventListener('click', () => closeModal(signoutModal));
signoutConfirm?.addEventListener('click', () => {
    signoutInput.value = '1';
    signoutForm.submit();
});

changePwLink?.addEventListener('click', (event) => {
    event.preventDefault();
    openModal(changePwModal);
});
changePwCancel?.addEventListener('click', () => closeModal(changePwModal));
changePwConfirm?.addEventListener('click', () => {
    changePwInput.value = '1';
    changePwForm.requestSubmit();
});

document.querySelectorAll('.modal-backdrop').forEach((modal) => {
    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeModal(modal);
        }
    });
});
</script>
</body>
</html>";
}

function show_account_card($pk_userId, $username, $Name, $pfp, $created, $role, $statusMessage = '', $statusType = '') {
    $pk_userId = htmlspecialchars((string) $pk_userId, ENT_QUOTES, 'UTF-8');
    $username = htmlspecialchars((string) $username, ENT_QUOTES, 'UTF-8');
    $Name = htmlspecialchars((string) $Name, ENT_QUOTES, 'UTF-8');
    $created = htmlspecialchars((string) $created, ENT_QUOTES, 'UTF-8');
    $role = htmlspecialchars((string) $role, ENT_QUOTES, 'UTF-8');
    $pfp = htmlspecialchars((string) $pfp, ENT_QUOTES, 'UTF-8');
    $pictureSrc = preg_match('/^https?:\/\//i', $pfp) ? $pfp : "assets/images/$pfp";
    $statusHtml = '';

    if ($statusMessage !== '') {
        $messageClass = $statusType === 'success' ? 'form-message--success' : 'form-message--error';
        $statusMessage = htmlspecialchars($statusMessage, ENT_QUOTES, 'UTF-8');
        $statusHtml = "<p class='form-message $messageClass'>$statusMessage</p>";
    }

echo "<main class='settings-page'>
    <section class='account-card' aria-label='Account settings'>
        <div class='account-card-inner'>

            <!-- LEFT: avatar + username -->
            <aside class='account-sidebar'>
                <button class='avatar-wrap' type='button' aria-label='Edit profile picture (coming soon)'>

                    <img class='avatar-img' src='$pictureSrc' alt='Profile picture' />

                    <div class='avatar-overlay' aria-hidden='true'>
                        <!-- Pen icon (SVG) -->
                        <svg class='pen-icon' viewBox='0 0 24 24' fill='none' aria-hidden='true'>
                            <path d='M12 20h9' stroke='currentColor' stroke-width='2' stroke-linecap='round'/>
                            <path d='M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4 11.5-11.5Z'
                                  stroke='currentColor' stroke-width='2' stroke-linejoin='round'/>
                        </svg>
                    </div>
                </button>

                <div class='username-block'>
                    <div class='username'>$username</div>
                    <div class='user-id'>User #$pk_userId</div>
                </div>
                <form id='signoutForm' method='POST'>
                    <input type='hidden' name='BUTTON_signout' id='BUTTON_signout' value=''>
                    <button type='button' class='signout-btn' id='signoutBtn'>
                        Sign out
                    </button>
                </form>

            </aside>

            <!-- RIGHT: account fields -->
            <section class='account-content'>
                <header class='account-header'>
                    <a class='back-link' href='../../frontend/index.html'>Back to recipes</a>
                    <h1 class='title'>$Name's Account settings</h1>
                    <p class='subtitle'>Manage your account details.</p>
                </header>
                $statusHtml

                <div class='grid'>
                    <div class='col'>
                        <div class='field'>
                            <div class='label'>Full name</div>
                            <div class='value'>$Name</div>
                        </div>

                        <div class='field'>
                            <div class='label'>Password</div>
                            <a class='link' href='#' data-action='noop' id='changePwLink'>
                                Change password
                                <span class='link-icon' aria-hidden='true'>✎</span>
                            </a>

                        </div>
                    </div>

                    <div class='col'>
                        <div class='field'>
                            <div class='label'>Role</div>
                            <div class='value'>$role</div>
                        </div>

                        <div class='field'>
                            <div class='label'>Member since</div>
                            <div class='value'>$created</div>
                        </div>
                    </div>
                </div>

            </section>

        </div>
    </section>
</main>
<div class='modal-backdrop' id='signoutModal' aria-hidden='true'>
  <div class='modal' role='dialog' aria-modal='true' aria-labelledby='signoutTitle' aria-describedby='signoutDesc'>
    <h2 class='modal-title' id='signoutTitle'>Sign out?</h2>
    <p class='modal-desc' id='signoutDesc'>Are you sure you want to sign out?</p>

    <div class='modal-actions'>
      <button type='button' class='modal-btn modal-btn--ghost' id='signoutCancel'>Cancel</button>
      <button type='button' class='modal-btn modal-btn--primary' id='signoutConfirm'>Yes, sign out</button>
    </div>
  </div>
</div>
<div class='modal-backdrop' id='changePwModal' aria-hidden='true'>
  <div class='modal' role='dialog' aria-modal='true' aria-labelledby='changePwTitle' aria-describedby='changePwDesc'>
    <h2 class='modal-title' id='changePwTitle'>Change password</h2>
    <p class='modal-desc' id='changePwDesc'>Enter your current password and choose a new one.</p>

    <form id='changePwForm' method='POST' action='' autocomplete='off'>
      <input type='hidden' name='BUTTON_change_password' id='BUTTON_change_password' value=''>

      <div class='modal-form'>
        <label class='modal-label' for='pwCurrent'>Current password</label>
        <input class='modal-input' id='pwCurrent' name='DATA_current_password' type='password' autocomplete='current-password' required>

        <label class='modal-label' for='pwNew'>New password</label>
        <input class='modal-input' id='pwNew' name='DATA_new_password' type='password' autocomplete='new-password' required>

        <label class='modal-label' for='pwConfirm'>Retype new password</label>
        <input class='modal-input' id='pwConfirm' name='DATA_confirm_password' type='password' autocomplete='new-password' required>

        <div class='modal-error' id='changePwError' aria-live='polite'></div>
      </div>

      <div class='modal-actions'>
        <button type='button' class='modal-btn modal-btn--ghost' id='changePwCancel'>Cancel</button>
        <button type='button' class='modal-btn modal-btn--primary' id='changePwConfirm'>Update password</button>
      </div>
    </form>
  </div>
</div>
";
}

?>
