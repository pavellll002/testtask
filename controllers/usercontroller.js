//set database
const knex	=	require('knex')({
  client: 'pg',
  connection: {
    host : 'localhost',
    user : 'postgres',
    password : 'helloworld',
    database : 'test',
  }
})

let usercontroller = {}

usercontroller.db = async ctx=>{

	//get data from ajax form
	let temp = ctx.request.body

	let dateFrom = temp.dateFrom
  	let dateTo = temp.dateTo
	let  status = temp.status
	let teachers = temp.teachers.split(',')
	let	studentsCountfrom = temp.studentsCountfrom
  	let studentsCountTo = temp.studentsCountTo
  	let page = temp.page
  	let lessonsPerPage = temp.lessonsPerPage//will add 1 for pagination in limit

  	if(page == ''){
  		page = 0
  	}
  	else page--  

  	//find lessons
  	let lessons = await knex('lessons').where({
  		status:status,
  	}).whereBetween('dateoflessons',[
  	dateFrom,dateTo
  	]).limit(++lessonsPerPage).offset(lessonsPerPage*page)

  	let idLessons = lessons.map(el=>{
  		return el.id
  	}) 

  			//find teachers for lessons
	let teachersarr = await	knex('lessonteachers').whereIn('idlesson',idLessons).innerJoin('teachers','teachers.id','lessonteachers.idteacher').select('idteacher as id','name','idlesson').whereIn('idteacher',teachers).orderBy('idlesson')
  
  if(teachersarr.length == 0) return ctx.body = '[]'

	let students = await knex('lessonstudents').whereIn(
								'idlesson',idLessons
								).innerJoin(
  						 			'students','students.id','lessonstudents.idstudent'
  						 		).select('idstudent as id','name','visited','idlesson').orderBy('idlesson')
	
  if(students.length == 0) return  ctx.body = '[]'
    
let newLessons = []
//add teachers 
for(key in lessons){
  lessons[key].teachers = []
    for(index in teachersarr){
        if(lessons[key].id == teachersarr[index].idlesson){
          delete teachersarr[index].idlesson
            lessons[key].teachers.push(teachersarr[index])
          teachersarr.splice(index,1)
        }
    }
    if(lessons[key].teachers.length !=0)newLessons.push(lessons[key]) 

}
lessons = newLessons
//add students
  	for(key in lessons){

  			lessons[key].students = []//set teachers here
  			lessons[key].visited = 0 
  			let visited = 0
		for(index in students){

  			if(lessons[key].id == students[index].idlesson){
  				students[index].visited?visited++:visited
  				delete students[index].idlesson
  				lessons[key].students.push(students[index])
  				students.splice(index,1)
  			}
  		}
      if(visited >=studentsCountfrom && visited <= studentsCountTo)	lessons[key].visited = visited
        else lessons.splice(key,1)
  	}
  	
  			ctx.body = JSON.stringify(lessons)
}

module.exports = usercontroller