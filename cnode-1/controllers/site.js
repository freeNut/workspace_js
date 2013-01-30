var DB = require("../models")
    ,Diary = DB.Table('Diary')
    ,User = DB.Table('User')
    ,lutil = require('../utils/util')
    ,config = require('../config').config
    ,EventProxy = require("eventproxy").EventProxy
    ,page = require('./page')
    ,fs = require('fs');

var ObjID = DB.ObjID;

exports.index = function(req, res, next){
    lutil.userinfo(req, function(uinfo){
        var method = req.method.toLowerCase(); 
	    if(method == "get"){
           var pageno = 1;
	       if(req.params.page){
	          pageno = parseInt(req.params.page);
	       }
	       var proxy = new EventProxy();
	       var total_page = 0;
		   
		   var hot_diarys = [];
		   var active_users = [];
		   var userinfo = uinfo;
	       
	   	   proxy.once("renderto",function(diarys){
	   	       if(total_page > config.INDEX_ITEM_SIZE){
	               total_page = config.INDEX_ITEM_SIZE;
	           }

               var pageData = page.createPage(pageno, total_page);
               
		       res.render('index', {
		           title       :config.name,
		    	   diarys      :diarys,
                   config      :config,
                   pageData    :pageData,
                   req_path    :req.path,
                   userinfo    :userinfo,
				   hot_diarys  :hot_diarys,
				   active_users:active_users
		       });
               DB.close();
	       });
	       
	       	proxy.once("get_active_users", function(diarys){
			   User.find({},{sort:[['score', -1]], limit:10}).toArray(function(err, users){
	           if(err) return next(err);
	               for(var i = 0 ; i < users.length;i++){

	               	   if(users[i].email == config.admin_email){continue;}
					   active_users[active_users.length ] = users[i];
	                }
	               
	                proxy.trigger('renderto',diarys);

                 });
			});

		    proxy.once("get_hot_diarys", function(diarys){
			   Diary.find({},{sort:[['view_num', -1]], limit:10}).toArray(function(err, s_diarys){
	           if(err) return next(err);
	               for(var i = 0 ; i < s_diarys.length;i++){
	               	    if(userinfo){
                           if(s_diarys[i].author != userinfo.email && s_diarys[i].type == config.diary_type.private){
                               continue;
                           }
               	        }else{
               	   	       if(s_diarys[i].type == config.diary_type.private){
               	   	   	       continue;
               	   	       }
               	        }
	                   s_diarys[i].create_date = lutil.dateFormat(s_diarys[i].create_date);
	                   s_diarys[i].edit_date = lutil.dateFormat(s_diarys[i].edit_date);
	                   s_diarys[i].content = s_diarys[i].summary;
					   hot_diarys[hot_diarys.length ] = s_diarys[i];
	                }
	               
	                proxy.trigger('get_active_users',diarys);

                 });
			});


	       
		   proxy.once("get_nickname",function(diarys){
			   if(!diarys || diarys.length <= 0){
				   proxy.trigger('get_hot_diarys');
			   }else{
				   var diarys_len = diarys.length;
			       proxy.assignAlways("get_sub_nickname",function(idx){
			           var diary = diarys[idx];
				       User.findOne({"email":diary.author}, function(err, user){
                          if(user){
                          	diary.author_nickname = user.nickname;
                          }
					      
					      idx++;
					      if(idx < diarys_len){
					          proxy.trigger('get_sub_nickname',idx);
					      }else{

					          proxy.trigger('get_hot_diarys',diarys);
					      }
					   });
			       });
			       
				   proxy.trigger('get_sub_nickname',0);
			   }
		       
		   });
	       
	       proxy.once("get_list",function(){
	           Diary.find({"type":"public"},{sort:[['create_date', -1]],skip: config.PAGE_SIZE * (pageno - 1), limit:config.PAGE_SIZE}).toArray(function(err, diarys){
	           if(err) return next(err);
	               for(var i = 0 ; i < diarys.length;i++){
	                   diarys[i].create_date = lutil.dateFormat(diarys[i].create_date);
	                   diarys[i].edit_date = lutil.dateFormat(diarys[i].edit_date);


	                   var up_img = diarys[i].up_img;
	                   /*
	                   if(up_img && up_img._bsontype && up_img._bsontype == 'Binary'){
	                   	   var tmp_file_name = lutil.genId('g');
	                       var tmp_img_url = process.cwd() + config.diary_img + tmp_file_name;
	                   	   fd = fs.openSync(tmp_img_url, 'w+');
	                   	   fs.writeSync(fd, up_img.buffer, 0, up_img.position, null);
	                   	   fs.closeSync(fd);
	                   	   diarys[i].up_img = config.diary_url + tmp_file_name;
	                   	   

	                   	   diarys[i].up_img = config.diary_url + tmp_file_name;
	                   	   
	                   }else{
	                   	   if(diarys[i].up_img && diarys[i].up_img != ""){
                                diarys[i].up_img = config.diary_url + diarys[i].up_img;
	                   	   }
	                   	   
	                   }

	                   
	                   
	                   if(diarys[i].up_img_thumb && diarys[i].up_img_thumb != ""){
	                       
	                       diarys[i].up_img_thumb = config.diary_url + diarys[i].up_img_thumb;
	                   }else{
	                   	   
                           diarys[i].up_img_thumb = diarys[i].up_img;
	                   }
	                   */
	                   	if(up_img && up_img._bsontype && up_img._bsontype == 'Binary'){
		                	var cache_imgs = lutil.create_cache_img(diarys[i]);
		                	if(cache_imgs && cache_imgs.length == 1){
		                		  diarys[i].up_img = cache_imgs[0];
				                  //diarys[i].up_img_thumb = cache_imgs[1];
				                  //diarys[i].up_img_thumb_big = cache_imgs[2];
		                	}

		                }
	                    diarys[i].content = diarys[i].summary;
	                }
	                
	              
	                
	               
	                proxy.trigger('get_nickname',diarys);

                 });
	        });
			
			

	   
	        proxy.once("get_total",function(){
	            Diary.find({"type":"public"}).toArray(function(err, diarys){
	            var total_items = 0;
	            if(diarys){
	            	total_items = diarys.length;
	            }
	            
	            total_page = Math.floor ( (total_items + config.PAGE_SIZE - 1) / config.PAGE_SIZE );
	            proxy.trigger('get_list');
	        });
	   });
	   
	   proxy.trigger('get_total');	   


	  }
    });
  

};

exports.p404 = function(req, res, next){
   lutil.userinfo(req, function(uinfo){
   	      res.render('404', {
		           title       :config.name,
                   config      :config,
                   req_path    :req.path,
                   userinfo    :uinfo,
		       });
               DB.close();
   });
};

