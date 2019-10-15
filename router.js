const usercontroller = require('./controllers/usercontroller')

function routing(router) {


	router.get('/',async ctx=>{
		return await ctx.render('index')
	})

	router.post('/db', usercontroller.db)

	return router	
}


module.exports = routing