<?php
header('Content-type: text/html; charset=utf-8');
$tab = json_decode($_POST);
print_r($tab);
if (!preg_match("#^[a-z0-9._-]+@(hotmail|live|msn).[a-z]{2,4}$#", $tab['email']))
  $passage_ligne = "\r\n";
else
  $passage_ligne = "\n";
$subject = "Liste de courses".$passage_ligne;
$mail_notif = '<html>
<head>
<title>liste</title>
</head>
<body>
'.$tab["email"].'</body>
</html>';
$headers  = 'MIME-Version: 1.0' . $passage_ligne;
$headers .= 'Content-type: text/html; charset=utf-8' . $passage_ligne;
$headers .= 'From: "Shopping List" <no-reply@theochevalier.fr>' . $passage_ligne;
//mail("theo.chevalier11@gmail.com", '=?UTF-8?B?'.base64_encode($subject).'?=', $mail_notif, $headers);
?>
