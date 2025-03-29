const Axios = require("axios");


let apiClient = Axios.create({
    baseURL: "http://localhost:3000/api",
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 10000,
})

async function demo() {
    let response  = await apiClient.request({
        method: "GET",
        url: "/admin/login",
        data: {
            username: "admin",
            password: "admin",
        },
        headers : {
            "Content-Type": "application/json"
        }
    })
    console.log(response)
}


demo();
// axios.get("http://localhost:3000/api/admin/login", {
//     data: {
        
//     }
// })