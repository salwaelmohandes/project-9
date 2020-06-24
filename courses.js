// const fs = require('fs');


// function save(data){
//     return new Promise((resolve, reject) => {
//         fs.writeFile('data.json', Json.stringify(data, null, 2), (err) => {
//             if (err) {
//                 reject(err);
//             }   else {
//                 resolve();
//             }    
//         });
//     });
// }

// function getCourses(){
//     return new Promise((resolve,reject) => {
//         fs.readFile('data.json', 'utf8', (err, data) => {
//             if (err) {
//                 reject(err);
//             }  else {
//                 const json = JSON.parse(data);
//                 resolve(json);
//             }  
//         });
//     });
// }

// function createCourse(){
//     return new Promise((resolve,reject) => {
//         fs.readFile('data.json', 'utf8', (err, data) => {
//             if (err) {
//                 reject(err);
//             }  else {
//                 const json = JSON.parse(data);
//                 resolve(json);
//             }  
//         });
//     });
// }

// async function getCourse(id){
// const courses = await getCourses();
//     return courses.find(course => course.id ==id);

// }