<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Max-Age: 1001');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-type: text/html; charset=utf-8');

$tab = json_decode($_POST["data"], true);
$strings = json_decode($_POST["strings"], true);

if (!preg_match("#^[a-z0-9._-]+@(hotmail|live|msn).[a-z]{2,4}$#", $tab['email']))
  $passage_ligne = "\r\n";
else
  $passage_ligne = "\n";

foreach ($tab as $key => $value) {
  if($key =="name") {
    $list.= $passage_ligne."<p>".$strings["email-title-begin"].$value.$strings["email-title-end"]." ".$strings["email-intro-end"]."</p>";
  }
  if($key =="items") {
    foreach ($value as $keyItems => $items) {
      if (isset($items["done"]) && $items["done"] == 1) {
        $list .= "<del>";
      }

      $list .= $passage_ligne."<p>- ".$items["name"];

      if (isset($items["nb"]) && $items["nb"] > 1) {
        $list .= " ×".$items["nb"];
      }

      if (isset($items["price"]) && $items["price"] != "0" && $items["price"] != "") {
        $list .= " (".$items["price"]." €)";
      }

      $list .= "</p>";

      if (isset($items["done"]) && $items["done"] == 1) {
        $list .= "</del>";
      }
    }
  }
}

$subject = $strings["email-title-begin"].$tab["name"].$strings["email-title-end"].$passage_ligne;
$mail_notif = '<html>
<head>
<title>'.$strings["email-title-begin"].$tab["name"].$strings["email-title-end"].'</title>
</head>
<body>'.$list.'</body>
</html>';
$headers  = 'MIME-Version: 1.0' . $passage_ligne;
$headers .= 'Content-type: text/html; charset=utf-8' . $passage_ligne;
$headers .= 'From: "'.$strings["app-name"].'" <no-reply@theochevalier.fr>' . $passage_ligne;
mail($_POST["email"], '=?UTF-8?B?'.base64_encode($subject).'?=', $mail_notif, $headers);
?>
