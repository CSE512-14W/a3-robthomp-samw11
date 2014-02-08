<?php

$songs = array();
$keys = array();

$success = file_get_contents_chunked("songs_full.csv",1024,function($chunk,&$handle,$iteration){
    /*
        * Do what you will with the {&chunk} here
        * {$handle} is passed in case you want to seek
        ** to different parts of the file
        * {$iteration} is the section fo the file that has been read so
        * ($i * 1024) is your current offset within the file.
    */
    
    global $songs, $keys;
    $arr = str_getcsv($chunk);
    
    if (strcmp($arr[2], $_GET["artist"]) == 0) {
		
		$songs[] = array_combine($keys, $arr);
	} else if ($iteration == 0) {
		$keys = $arr;
	}
});

if(!$success)
{
    print("fail");
} else {
	print(json_encode($songs));
}

function file_get_contents_chunked($file,$chunk_size,$callback)
{
    try
    {
        $handle = fopen($file, "r");
        $i = 0;
        while (!feof($handle))
        {
            call_user_func_array($callback,array(stream_get_line($handle, $chunk_size, '♣'),&$handle,$i));
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
