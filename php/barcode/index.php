<?php
if($_SERVER['HTTP_ORIGIN'] == "http://theochevalier.github.io")
{
  header('Access-Control-Allow-Origin: http://theochevalier.github.io');
  header('Content-type: application/xml');

  $json = file_get_contents('https://api.scandit.com/v2/products/'.$_GET["barcode"].'?key=EOs4XiVxpvS0MBSSvbSDSb8McfprsW0x8NzOg_2FTVg&sources=all');
  $parsed = json_decode($json, true);
  $file = fopen("resource.xml", "w+") or die("can't open file");
  fwrite($file, '<?xml version="1.0" encoding="utf-8"?><code>'.$parsed["basic"]["name"].'</code>');
  readfile('resource.xml');
}
?>