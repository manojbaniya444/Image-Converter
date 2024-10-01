const corsResolve = (response) => {
    response.setHeader("Access-Control-Allow-Origin", "http://127.0.0.1:5500");
    response.setHeader("Access-Control-Allow-Methods", "GET, POST");
    response.setHeader(
      "Access-Control-Allow-Headers",
      "X-Requested-With,content-type"
    );
  };
  
  module.exports = corsResolve;
  