module.exports = {
    mongoDbUrl : '',
    PORT: process.env.PORT || 8003,
    globalVariables: (req, res, next) => {
        
        next();
    },
};