module.exports = {
    mongoDbUrl : 'mongodb+srv://fillform:%402Solution@cluster0.waezdxd.mongodb.net/',
    PORT: process.env.PORT || 8003,
    globalVariables: (req, res, next) => {
        
        next();
    },
};