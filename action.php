<?php

require_once('../../config.php');
global $DB;

$id = optional_param('id', 0, PARAM_INT); 
$cid  = optional_param('cid', 1, PARAM_INT);
$oid  = optional_param('oid', 0, PARAM_INT);  
$sid  = optional_param('sid', 0, PARAM_INT);  
//$position = 
//$class = 
//$title = 
//$description = 

if(isset($_POST['description']))
    $description = $_POST['description'];
if(isset($_POST['title']))
    $title = $_POST['title'];
if(isset($_POST['position']))
    $position = $_POST['position'];
if(isset($_POST['class']))
    $class = $_POST['class'];
$step_id = $sid;

$uid = $USER->id;     //user's ID 

if($_POST['action'] == 'jump') {
        //write cid, sid into table: userguide_record;
        $record = new stdClass();
        $record->uid = $uid;
        $record->cid = $cid;
        $record->sid = $sid;
        $result = $DB->get_record('userguide_record', array('uid'=>$uid, 'cid'=>$cid), 'id');
        $record->id = $result->id;
        
        if($result->id) {  //update the record if exists, or create a new one
            $DB->update_record('userguide_record', $record);
        } else {
            $DB->insert_record('userguide_record', $record);
        }
        echo "TRUE";
}

if($_POST['action'] == 'check_step'){
	    $result = $DB->get_record("userguide_steps", array("id"=>$sid, "position"=>$position, "class"=>$class));
	    
	    $next = new stdClass();
	    $next->uid = $uid;
	    $next->cid = $cid;
	    $next->sid = $sid;
	    
        if($result) {
            if($position == 'ac_opt' || $position == 'res_opt' || $position == 'blk_opt' || $class == 'edit' || $class == 'roles'){
                $DB->update_record('userguide_record', $next);
            }
	        echo "TRUE";
	    } else {
	        echo "FALSE";
        }
}


if($_POST['action'] == 'add_steps') { 
    $contents = new stdClass();
    $step_id = $sid;
    
    $contents->title = $title;
	$contents->position = $position;
    $contents->description = $description;
    $contents->class = $class;
    $id = $DB->insert_record('userguide_steps', $contents);
	if($id)
        return $id;
	else
	    return FALSE;
}

if($_POST['action'] == 'modify_steps') { 
    $contents = new stdClass();
    $contents->title = $_POST['title'];
	$contents->position = $_POST['position'];
    $contents->description = $_POST['description'];
    $contents->class = $_POST['class'];
	$step_id = $_POST['step_id'];
        $id = $DB->update_record('userguide_steps', $contents);
	if($id)
            return $id;
	else
	    return FALSE;

}

if($_POST['action'] == 'delete_steps') {

    $result_steps = $DB->delete_records('userguide_steps', array('id'=>$step_id));
    $result_orders = $DB->delete_records('userguide_orders', array('cid'=>$class, 'sid'=>$step_id));
    if($result_step && $result_order)
        return TRUE;
    else
        return FALSE;
}

?>
