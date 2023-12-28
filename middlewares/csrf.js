module.exports = (req, res, next) => {
    res.locals.csrftoken = req.csrfToken; //CSRF koruması için oluşturulmuş middleware
    next();
}