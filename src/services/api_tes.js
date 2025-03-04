const Axios = require("axios");


let apiClient = Axios.create({
    baseURL: "https://6t2qxf4x45.execute-api.ap-south-1.amazonaws.com/v1/api",
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
// axios.get("https://6t2qxf4x45.execute-api.ap-south-1.amazonaws.com/v1/api/admin/login", {
//     data: {
        
//     }
// })