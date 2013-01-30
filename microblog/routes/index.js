
/*
 * GET home page.
 */

module.exports = function(app){
	app.get('/',function(req,res){
		res.render('index',{
			title:'首页'
		});
	});
	app.get('/reg',function(req,res){
		//res.render('reg',{
		//	title : '用户注册'
		//});
		//检验密码一致性
		if(req.body['password-repeat']!=req.body['password']){
			req.flash(''error'','两次输入的口令不一致');
			return res.rediret('/reg');
		}
		//生成口令的散列值
		var md5 = crypto.createHash('md5');
		var password = md5.update(req.body.password).digest('base64');
		
		var newUser = new User({
			name : req.body.username,
			password : password
		});
		
		User.get(newUser.name,function)
	});
};

exports.user = function(req,res){
	
};

exports.post = function(req,res){
	
};

exports.reg = function(req,res){
	
};

exports.doReg = function(req,res){
	
};

exports.login = function(req,res){
	
};

exports.doLogin = function(req,res){
	
};

exports.logout = function(req,res){
	
};