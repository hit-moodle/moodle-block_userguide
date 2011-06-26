<?php
// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/**
 * User guide Block page.
 *
 * @package    block
 * @subpackage userguide
 * @copyright  2011 Glove 
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die();

/**
 * The user guide block class
 */
class block_userguide extends block_base {
//oid=> order in table:"userguide_order"
    function init() {
        $this->title = get_string('pluginname', 'block_userguide');
    }
    
    function insert_steps() {
        global $DB;
        $steps = array(
            0 => array('oid'=>0, 'sid'=>1, 'title'=>'了解什么是资源', 'description'=>'点击黄色的问号，查看Moodle附带的帮助信息，了解什么是资源。', 'position'=>'res_help', 'class'=>'res_help'),
            1 => array('oid'=>1, 'sid'=>2, 'title'=>'添加资源', 'description'=>'添加一个文件资源。点击“添加资源”，在下拉条中选择“文件”。', 'position'=>'res_opt', 'class'=>'resource'),
            2 => array('oid'=>2, 'sid'=>3, 'title'=>'移动资源位置', 'description'=>'页面上的所有项目都是可以移动的。尝试拖拽这个十字移动按钮，来移动一个资源。', 'position'=>'menu', 'class'=>'move_2d'),
            3 => array('oid'=>3, 'sid'=>4, 'title'=>'删除标签资源', 'description'=>'如果你按照向导执行了前面的步骤，页面上应该有一个标签资源。点击其上的X按钮，即可将其删除。试试看！', 'position'=>'menu', 'class'=>'delete'),
            4 => array('oid'=>4, 'sid'=>5, 'title'=>'了解什么是活动', 'description'=>'点击黄色的问号，查看Moodle附带的帮助信息，了解什么是活动。', 'position'=>'ac_help', 'class'=>'ac_help'),
            5 => array('oid'=>5, 'sid'=>6, 'title'=>'添加活动', 'description'=>'添加一个测验活动。点击“添加活动”，在下拉条中选择一个测验。', 'position'=>'ac_opt', 'class'=>'quiz'),
);
    $content_steps = new stdClass();
    $content_orders = new stdClass();
    for($i = 0; $i < count($steps); $i++) {
        $content_steps->title = $steps[$i]['title'];
        $content_steps->description = $steps[$i]['description'];
        $content_steps->position = $steps[$i]['position'];
        $content_steps->class = $steps[$i]['class'];
        
        $content_orders->sid = $steps[$i]['sid'];
        $content_orders->oid = $steps[$i]['oid'];
        $content_orders->ccid = 1;
        
        $res_steps = $DB->insert_record('userguide_steps', $content_steps);
        $res_orders = $DB->insert_record('userguide_orders', $content_orders);
    }    
        if($res_steps && $res_orders)
            return TRUE;
        else 
            return FAlSE;
  }
    
    function get_content() {
        global $CFG, $DB;
        // detect if guide enabled
        if ($this->content !== NULL) {
            return $this->content;
        }
        // require javascript and css
        $this->page->requires->js('/blocks/userguide/actions.js');
        $this->page->requires->css('/blocks/userguide/userguide.css');
        // Prep the content
        $this->content = new stdClass();
        $tips = get_string('thisisaguideforhelpingteachercreateacourse', 'block_userguide').'.';
        $this->content->text = $tips;
        
        $res = $DB->get_records('userguide_steps');
        if($res == NULL)
            $this->insert_steps();
        return $this->content;
    }
        
}
    

