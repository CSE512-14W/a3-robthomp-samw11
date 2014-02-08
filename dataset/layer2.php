<?php

$artists = array();
$out = array();
$file = "./layer2/".$_GET["year"]."_".$_GET["hotness"]."_".$_GET["familiar"].".csv";

$success = file_get_contents_chunked($file,1024,function($chunk,&$handle,$iteration){
    /*
        * Do what you will with the {&chunk} here
        * {$handle} is passed in case you want to seek
        ** to different parts of the file
        * {$iteration} is the section fo the file that has been read so
        * ($i * 1024) is your current offset within the file.
    */
    
    //go through once and get a flat list of artists that fit the search criteria
    //make sure each artist is represented only once
    global $artists;
    $arr = str_getcsv($chunk);
    if (strcmp($arr[2], "") != 0 && !array_key_exists($arr[2], $artists)) {
    	$artists[$arr[2]] = array(
    		"songs" => 0,
    		"totDur" => 0.0
    	);
    }
});

$success = file_get_contents_chunked($file,1024,function($chunk,&$handle,$iteration){
	
	//now go through full list and add up songs and total song length
	//for each artist already on the list
	global $artists;
    $arr = str_getcsv($chunk);
    if (isset($artists[$arr[2]])) {
    	$artists[$arr[2]]["songs"]++;
    	$artists[$arr[2]]["totDur"] += (float) $arr[3];
    }
});

//now turn the artist associative array into a numerical array (easier for D3)
foreach ($artists as $key=>$value) {
	$value["artist"] = $key;
	$out[] = $value;
}

if(!$success)
{
    print("fail");
} else {
	print(json_encode($out));
}

function file_get_contents_chunked($file,$chunk_size,$callback)
{
    try
    {
        $handle = fopen($file, "r");
        $i = 0;
        while (!feof($handle))
        {
            call_user_func_array($callback,array(stream_get_line($handle, $chunk_size, 'ø'),&$handle,$i));
            $i++;
        }

        fclose($handle);

    }
    catch(Exception $e)
    {
         trigger_error("file_get_contents_chunked::" . $e->getMessage(),E_USER_NOTICE);
         return false;
    }

    return true;
}

?>