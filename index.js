const koa = require('koa')
const koaRouter = require('koa-router')
const render = require('koa-ejs')
const path = require('path')
const koaBody = require('koa-body')





const router = require('./router.js')(new koaRouter())

const app = new koa()




render(app, {
  root:  path.join(__dirname,'view'),
  layout: false,
  viewExt: 'html',
  cache: false,
  debug: true
})


app.use(koaBody())
app.use(router.routes())
app.use(router.allowedMethods())


app.listen(3000,()=>{
	console.log('server started...')
})