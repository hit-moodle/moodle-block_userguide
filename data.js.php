<?php

require_once('../../config.php');
global $DB;

$query = 'select `oid`, `sid`, `title`, `description`, `position`, `class` from `mdl_userguide_orders` as uo, `mdl_userguide_steps` as us where uo.sid=us.id order by `oid`;';

$DB->execute('SET NAMES gbk');

$result= $DB->get_records_sql($query);		
foreach($result as $key => $value){
	$title = $result[$key]->title;
	$sid = $result[$key]->sid;
	$description = $result[$key]->description;
	$oid = $result[$key]->oid;
	$position = $result[$key]->position;
	$class = $result[$key]->class;
	echo "{"."\"oid\"".':'.$oid.','."\"sid\"".':'.$sid.','."\"title\"".':'."\"$title\"".','."\"content\"".':'."\"$description\"".','."\"position\"".':'."\"$position\"".','."\"cls\"".':'."\"$class\""."},","\n";
}

?>
