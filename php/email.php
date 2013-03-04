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

foreach ($tab as $key => $value) {
  if($key =="name") {
    $list.= $passage_ligne."<p>Liste de courses « ".$value." » envoyée depuis <a href='http://theochevalier.github.com/FoxShop'>l’application FoxShop</a>.</p>";
  }
  if($key =="items") {
    foreach ($value as $keyItems => $items) {
      foreach ($items as $keyItem => $item) {
        if($keyItem =="name") {
          $list .= $passage_ligne."<br>- ".$item;
        }
        if ($keyItem == "nb" && $item > 1) {
          $list .= $passage_ligne." x".$item;
        }
        if ($keyItem == "done" && $item == "1") {
          $list .= $passage_ligne." (Acheté &#10003;)";
        }
      }
    }
  }
}

$subject = "Liste de courses « ".$tab["name"]." »".$passage_ligne;
$mail_notif = '<html>
<head>
<title>Liste de courses « '.$tab["name"].' »</title>
</head>
<body>'.$list.'</body>
</html>';
$headers  = 'MIME-Version: 1.0' . $passage_ligne;
$headers .= 'Content-type: text/html; charset=utf-8' . $passage_ligne;
$headers .= 'From: "FoxShop" <no-reply@theochevalier.fr>' . $passage_ligne;
mail($_POST["email"], '=?UTF-8?B?'.base64_encode($subject).'?=', $mail_notif, $headers);
?>
