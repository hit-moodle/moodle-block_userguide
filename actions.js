
function handle_res_ac_blk(){
    var send = send_operation;
    var jump = jump_next;
    var open = UserGuide.open;
    YUI().use('node', function(Y){
        res_ac_list = Y.all(".menujump");
        blk_list = Y.all(".menubui_addblock option");

        function set_res_ac_listener(){
            for(i = 0; i < res_ac_list.size(); i++){
                if(i % 2){
                    res_ac_list.item(i).all("option").on('click', function(e){
                        var opt_value = e.currentTarget.get('value').split('=')[4];
                        //alert("activity:"+opt_value);
                        send("ac_opt", opt_value);
                    });
                } else {
                    res_ac_list.item(i).all("option").on('click', function(e){
                        var opt_value = e.currentTarget.get('value').split('=')[4];
                        //alert("resource:"+opt_value);
                        send("res_opt", opt_value);
                    });
                }
            }
        }

        help_link = Y.all(".helplink a");
        resource_help = help_link.even();
        activity_help = help_link.odd();

        resource_help.on('click', function(e){
            if(send("res_help", "res_help") && open)
                jump();
        });
        activity_help.on('click', function(e){
            if(send("ac_help", "ac_help") && open)
                jump();
        });
        
        blk_list.on('click', function(e){
            var opt_value = e.currentTarget.get('value');
            send("blk_opt", opt_value);
        });

        set_res_ac_listener();
    });
}

function handle_menus(){
    var send = send_operation;
    var jumpNext = jump_next;
    var open = UserGuide.open;
    YUI().use('node-event-simulate', function(Y){
        var menus;
        
        function get_menus(){
            command_menu = Y.all(".commands");
            menus = new Array(command_menu.size());
            for(i = 0; i < menus.length; i++){
                menus[i] = command_menu.item(i).all("a");
            }
            return menus;
        }

        var menus_action = function(e){
            menus = get_menus();
            var node = e.currentTarget;
            var type = node.one("img").get("src").split("%2F")[1].split("&")[0];
            var jumpNextStep = send("menu", type);
            if((type != "edit" || type != "roles") && jumpNextStep && open){
                jumpNext();
            }
            remove_menus_listener(menus);
            set_menus_listener(get_menus());
        }

        function remove_menus_listener(menus){
            for(i = 0; i < menus.length; i++){
                menus[i].detach('click', menus_action);
                menus[i].item(0).detach('mousedown', menus_action);
            }
        }

        function set_menus_listener(menus){
            for(i = 0; i < menus.length; i++){
                menus[i].on('click', menus_action);
                menus[i].item(0).detach('click', menus_action).on('mousedown', menus_action);
            }
        }

        set_menus_listener(get_menus());
    });
}

function get_status(){
    var edit;
    var index = 3; // The 4th <input>
    var navbutton = Array(2);
    YUI().use('node', function(Y){
        var EditButton = Y.all(".navbutton .singlebutton form div input");
        var Input = EditButton.item(index);
        if(Input.get('value') == 'on'){
            edit = false;
        } else {
            edit = true;
        }
        navbutton[0] = edit;
        navbutton[1] = EditButton.item(0);
    });
    return navbutton;
}

function get_start(){
    var node = edit_button;
    add_overlay(node.getXY(), start_edit);
    return node;
}

function send_operation(position, cls){
    var oid = UserGuide.currentOid;
    var sid = UserGuide.list[oid].sid;
    var feedback = false;
    var open = UserGuide.open;
    var config = M.cfg;
    var next = jump;

    if(open){
        YUI().use('io', 'node', function(Y){
            var sUrl = config.wwwroot+"/blocks/userguide/action.php";
            var cfg = {
                method: "POST",
                data: "action=check_step&oid="+oid+"&sid="+sid+"&position="+position+"&class="+cls,
            };
            var request = Y.io(sUrl, cfg);
            var handleSuccess = function(ioId, o){
                var result = o.responseText;
                if(result == "TRUE"){
                    feedback = true;
                    next(oid + 1);
                } else {
                    feedback = false;
                }
            }
            var handleFailure = function(ioId, o){
                //alert("Netword failed!");
            }
            Y.on('io:success', handleSuccess);
            Y.on('io:failure', handleFailure);
        });
        return feedback;
    } else {
        return false;
    }
}

function send_jump_signal(oid){
    var sid = UserGuide.list[oid].sid;
    var jump = false;
    var open = UserGuide.open;
    var config = M.cfg;
    var guide = show_guide;

    if(open){
        YUI().use('io','node', function(Y){
            var sUrl = config.wwwroot+"/blocks/userguide/action.php";
            var cfg = {
                method: "POST",
                data: "action=jump&oid="+oid+"&sid="+sid,
            };
            var request = Y.io(sUrl, cfg);

            var handleSuccess = function(ioId, o){
                var result = o.responseText;
                if(result == "TRUE"){
                    guide(oid);
                }
            }
            
            var handleFailure = function(ioId, o){
                //alert("Netword failed!");
            }

            Y.on('io:success', handleSuccess);
            Y.on('io:failure', handleFailure);
        });
    } else {
        return false;
    }
}

function show_guide(oid){
    var step = UserGuide.list[oid];
    var set_step_nav = create_nav;
    var step_nav_content = UserGuide.nav;
    var position = get_node_position;
    var overlay = get_overlay();
    YUI().use('node', 'overlay', function(Y){
        Y.one("#userguide-hd").setContent(step.title);
        Y.one("#userguide-content").setContent(step.content);
        
        navbar = Y.one("#userguide-nav");
        if(!navbar){
            set_step_nav(step_nav_content, oid);
        } else {
            Y.one("#userguide-jump_next").set("href", "#"+oid);
        }

        var p = position(step.position, step.cls);
        overlay.move([p[0] - 290, p[1] - 40]);
    });
    return true;
}

function show_directory(overlay){
    var create = create_overlay_frame;
    var jump_to_step = jump;
    var guide_list = UserGuide.list;
    var list = '<ol id="userguide-list">';
    for(i = 0; i < guide_list.length; i++){
        var step = guide_list[i];
        list += '<li><a href="#'+step.oid+'" class="userguide-step">'+ step.title + '</a></li>';
    }
    list += '</ol>';

    YUI().use('node', 'overlay', function(Y){
        Y.one("#userguide-hd").setContent("向导目录");
        Y.one("#userguide-content").setContent(list);
        Y.one("#userguide-nav").remove();
        //overlay.move([200, 200]);

        steps = Y.all(".userguide-step");

        links_action = function(e){
            e.preventDefault();
            node = e.currentTarget;
            oid = node.get("href").split("#")[1];
            jump_to_step(oid);
        }

        steps.on('click', links_action);

    });
    return true;
}

function jump(oid){
    oid = parseInt(oid);
    overlay = get_overlay();
    list = UserGuide.list;

    if(list[oid] == null)
        return false;

    UserGuide.currentOid = oid;
    // Send jump signal
    if(UserGuide.open && send_jump_signal(oid)){
        //show_guide(oid, overlay);
    }
}

function jump_next(){
    oid = UserGuide.currentOid;
    jump(oid + 1);
}

function get_buttons(){
    var menu; // Menu buttons
    var help = new Array(); // 0 resource, 1 activity
    var select = new Array(); // 0 resource, 1 activity, 2 block
    YUI().use('node', function(Y){
        var command_menu = Y.all(".commands");
        menu = command_menu.item(0).all("a");

        var help_link = Y.all(".helplink a");
        help.push(help_link.even().item(0));
        help.push(help_link.odd().item(0));

        var selects = Y.all(".menujump");
        select.push(selects.even().item(0));
        select.push(selects.odd().item(0));
        select.push(Y.one(".menubui_addblock"));
    });
    UserGuide.pNodes.menu = menu;
    UserGuide.pNodes.help = help;
    UserGuide.pNodes.select = select;
    return UserGuide.pNodes;
}

function get_node_position(type, cls){
    UserGuide.pNodes = get_buttons();
    var help = UserGuide.pNodes.help;
    var select = UserGuide.pNodes.select;
    var menu = UserGuide.pNodes.menu;
    switch(type){
        case "res_help":
            return help[0].getXY();
        case "ac_help":
            return help[1].getXY();
        case "res_opt":
            return select[0].getXY();
        case "ac_opt":
            return select[1].getXY();
        case "blk_opt":
            return select[2].getXY();
        default:
            for(i = 0; i < menu.size(); i++){
                if(cls == menu.item(i).one("img").get("src").split("%2F")[1].split("&")[0]){
                    return menu.item(i).getXY();
                }
            }
    }
}

function set_overlay(overlay){
    UserGuide.overlay = overlay;
    return overlay;
}

function get_overlay(){
    return UserGuide.overlay;
}

function create_overlay_frame(title, content){
    var cfg = M.cfg;
    YUI().use('node', 'overlay', function(Y){
        node = Y.one("body");

        close_button = cfg.wwwroot+'\/theme\/image.php?theme='+cfg.theme+'&amp;image=t%2Fdelete&amp;rev='+cfg.themerev;

        overlay_html = 
        '<div id="userguide-overlay" class="yui3-overlay-loading">'+
            '<div class="yui3-widget-hd">'+
                '<div class="header">'+
                    '<div id="userguide-control"><a href="#"><img src="'+close_button+'"></a></div>'+
                    '<h2 id="userguide-hd" class="headingblock">'+title+'</h2>'+
                '</div>'+
            '</div>'+
            '<div class="yui3-widget-bd">'+
                '<div id="userguide-content">'+content+'</div>'+
            '</div>'+
        '</div>';
        node.append(overlay_html);
    });
}

function create_nav(nav, oid){
    var directory = show_directory;
    var jump_next = jump;
    var overlay = get_overlay();
    YUI().use('node', 'overlay', function(Y){
        if(nav != null){
            nav_html = 
            '<div id="userguide-nav">'+
                '<a id="userguide-show_directory" href="'+nav[0].href+'">'+nav[0].name+'</a>'+
                '<a id="userguide-jump_next" href="#'+oid+'">'+nav[1].name+'</a>'+
            '</div>';
            Y.one("#userguide-overlay .yui3-widget-bd").append(nav_html);

            Y.on('click', function(e){
                e.preventDefault();
                directory(overlay);
            }, "#userguide-show_directory");

            Y.on('click', function(e){
                e.preventDefault();
                jump_oid = parseInt(e.currentTarget.get("href").split("#")[1]);
                jump_next(jump_oid + 1);
            }, "#userguide-jump_next");
        }
    });
}

function add_overlay(xy, step, nav){
    var create = create_overlay_frame;
    var overlay;
    var step_nav = create_nav;
    var set = set_overlay;
    var close = close_guide;
    YUI().use('node', 'overlay', function(Y){

        create(step.title, step.content);
        position = xy;

        overlay = new Y.Overlay({
            srcNode: "#userguide-overlay",
            width: "280px",
            height: "160px",
            xy: [position[0]-290, position[1]-50]
        });

        set(overlay);
        create_nav(nav, step.oid);
        overlay.render();

        Y.on('click',
            function(e){
                e.preventDefault();
                overlay.destroy();
                close();
            },"#userguide-control");
    });
    return overlay;
}

function close_guide(){
    UserGuide.open = false;
}


editButton = get_status();
edit_status = editButton[0];
edit_button = editButton[1];
UserGuide = {};
UserGuide.list = [
    {"oid":0, "sid":1, "title":"了解什么是资源", "content":"点击黄色的问号，查看Moodle附带的帮助信息，了解什么是资源。", "position":"res_help", "cls":"res_help"}, 
    {"oid":1, "sid":2, "title":"添加资源", "content":"添加一个文件资源。点击“添加资源”，在下拉条中选择“文件”。", "position":"res_opt", "cls":"resource"},
    {"oid":2, "sid":3, "title":"移动资源位置", "content":"页面上的所有项目都是可以移动的。尝试拖拽这个十字移动按钮，来移动一个资源。", "position":"menu", "cls":"move_2d"},
    {"oid":3, "sid":4, "title":"删除标签资源", "content":"如果你按照向导执行了前面的步骤，页面上应该有一个标签资源。点击其上的X按钮，即可将其删除。试试看！", "position":"menu", "cls":"delete"},
    {"oid":4, "sid":5, "title":"了解什么是活动", "content":"点击黄色的问号，查看Moodle附带的帮助信息，了解什么是活动。", "position":"ac_help", "cls":"ac_help"},
    {"oid":5, "sid":6, "title":"添加活动", "content":"添加一个测验活动。点击“添加活动”，在下拉条中选择一个测验。", "position":"ac_opt", "cls":"quiz"},
];
UserGuide.currentOid = 0;
UserGuide.open = true;
UserGuide.pNodes = {};
UserGuide.nav = [{"href":"#", "name":"向导目录"}, {"href":"#", "name":"跳过此步"}]; // For test
start_edit = {"title":'向导', "content":'点击此按钮，打开课程编辑模式。打开编辑功能后，您可以向课程中添加内容，跟随此向导一步步构建课程。'};

if(edit_status && UserGuide.open){
    var oid = UserGuide.currentOid;
    handle_menus();
    handle_res_ac_blk();
    add_overlay(get_node_position(UserGuide.list[oid].position, UserGuide.list[oid].cls), UserGuide.list[oid], UserGuide.nav);
} else if(UserGuide.open) {
    get_start();
}

