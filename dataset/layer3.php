<?php

$songs = array();
$keys = array("title", "release", "artist_name", "duration", "artist_familiarity", "artist_hotttnesss", "year");
$file = "./layer3/".$_GET["artist"].".csv";

$success = file_get_contents_chunked($file,1024,function($chunk,&$handle,$iteration){
    /*
        * Do what you will with the {&chunk} here
        * {$handle} is passed in case you want to seek
        ** to different parts of the file
        * {$iteration} is the section fo the file that has been read so
        * ($i * 1024) is your current offset within the file.
    */
    
    global $songs, $keys;
    $arr = str_getcsv($chunk);
	$songs[] = array_combine($keys, $arr);
});

if(!$success)
{
    print("fail");
} else {
    // the last element is [false], need to delete that
    unset($songs[count($songs)-1]);
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
