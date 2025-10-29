const http = require("http");
const port = 3000;
const server = http.createServer((req, res)=>{ res.send("CI/CD Pipeline Working Successfully ✅"); });
server.listen(port, ()=> console.log("Server running on port", port));
// test build
