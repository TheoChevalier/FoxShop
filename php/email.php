<?php
header('Content-type: text/html; charset=utf-8');
header("Access-Control-Allow-Origin: *");
$tab = json_decode($_POST["data"], true);
$items = json_decode($tab["items"], true);
print_r($tab);
print_r($items);
if (!preg_match("#^[a-z0-9._-]+@(hotmail|live|msn).[a-z]{2,4}$#", $tab['email']))
  $passage_ligne = "\r\n";
else
  $passage_ligne = "\n";
$subject = "Liste de courses « ".$tab["name"]." » envoyée depuis l’application Shopping List".$passage_ligne;
$mail_notif = '<html>
<head>
<title>Liste de courses « '.$tab["name"].' »</title>
</head>
<body>'.$tab["items"].$items["name"].'</body>
</html>';
$headers  = 'MIME-Version: 1.0' . $passage_ligne;
$headers .= 'Content-type: text/html; charset=utf-8' . $passage_ligne;
$headers .= 'From: "Shopping List" <no-reply@theochevalier.fr>' . $passage_ligne;
mail($_POST["email"], '=?UTF-8?B?'.base64_encode($subject).'?=', $mail_notif, $headers);
?>