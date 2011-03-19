<?php

header("Content-type: text/json");

$source_url = $_REQUEST["u"];

$handle = fopen($source_url,"r");

if ($handle) {
	while(!feof($handle)){
		echo fgets($handle, 4096);
	}
	fclose($handle);
}