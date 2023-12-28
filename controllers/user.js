const sequelize = require("../data/db");
const Role = require("../models/role");
const User = require("../models/user");
const csrf = require("../middlewares/csrf");
const { Op } = require("sequelize");


exports.index = async function(req, res) { //İndex Sayfası
    const roles = req.session.roles
    try {
        
        res.render("user/index", {
            title: "Popüler İçerikler", 
            roles: roles
        })
    }
    catch(err) {
        console.log(err);
    }
}

exports.get_roles = async function(req, res) { // Rol Sayfası
    try {
        const roles = await Role.findAll({
            attributes: [
                'id',            // Role modelinin kendi ID'si
                'rolename',      // Role modelinin rol adı
                [sequelize.fn('COUNT', sequelize.col('users.id')), 'user_count'] // Kullanıcı sayısını içeren bir sayım sütunu
            ],
            include: [
                { model: User, attributes: [] } // Kullanıcı modelinin sütunlarını buraya ekleyebilirsiniz
            ],
            group: ['Role.id'],
            raw: true,
            includeIgnoreAttributes: false
        });
        
        res.render("user/role-list", {
            title: "Role List",   //Role Sayfasına Yönlendirme
            roles: roles               
        });
    } catch (err) {
        console.log(err);
    }
};

exports.get_role_edit = async function(req, res){ //Role Edit Sayfası
    const roleid = req.params.roleid
    
    try {
        const role = await Role.findByPk(roleid);  //Tablolardan Veri Seçimi
        const users = await role.getUsers();
        if (role) {
            return res.render("user/role-edit",{
                title: role.rolename,
                role: role,                 //Role Edit Yönlendirme
                users: users,
                csrfToken: csrf
            })    
        }
        res.redirect("admin/roles");
    } catch (err) {
        console.log(err)
    }
}
exports.post_role_edit = async function(req, res){ //Post Role Edit
    const roleid = req.body.roleid              
    const rolename = req.body.rolename

    try {
        await Role.update({rolename: rolename}, {
            where: {                            
                id: roleid                  //Role Editte Editlenen Şeyleri Veritabanına Gönderir
            }
        });
        return res.redirect("/roles")
    } catch (err) {
        console.log(err)
    }
}
exports.roles_remove =  async function(req, res){ // Users Role Remove
    const roleid= req.body.roleid;
    const userid = req.body.userid;
    try {
        await sequelize.query(`delete from userRoles where userId=${userid} and roleId=${roleid}`); 
        return res.redirect("/roles/"+roleid)      //Kullanıcının Yetkisini Alır
    } catch (err) {
        console.log(err);
    }
}

exports.get_user = async function(req, res){ // Get User
    try {

        const users = await User.findAll({
            attributes: ["id","fullname","email"],
            include: {
                model: Role,                //User Sayfası için DB Sorgusu
                attributes: ["rolename"]
            }
        });

        res.render("user/user-list",{
            title: "User List",            //Gerekli Bilgilerle user-list'e Gider
            users: users
        });
        
    } catch (err) {
        console.log(err);
    }
}

exports.get_user_edit = async function(req, res){  //Get User Edit
    const userid = req.params.userid;
    try {
        const user = await User.findOne({       //User Sorgusu
            where: { id:userid},
            include: {model: Role, attributes: ["id"]}
        });

        const roles = await Role.findAll();
        
        res.render("user/user-edit",{
            title: "User Edit",
            user: user,                 //User Edit Sayfasına Gönderir
            roles: roles,
            csrfToken: csrf
        })

    } catch (err) {
        console.log(err);
    }
}

exports.post_user_edit = async function(req, res){ //Post User Edit
    const userid = req.params.userid;
    const fullname = req.body.fullname;
    const email = req.body.email;           
    const roleIds = req.body.roles;

    console.log(req.body);

    try {
        const user = await User.findOne({
            where: { id:userid},                             //User Editi Post Eder
            include: {model: Role, attributes: ["id"]}
        });
        if(user){
            user.fullname = fullname;
            user.email = email;

            if (roleIds == undefined) {
                await user.removeRoles(user.roles); 
            }else{
                await user.removeRoles(user.roles);
                const selectedRoles = await Role.findAll({
                    where: {
                        id: {
                            [Op.in]: roleIds
                        }
                    }
                });
                await user.addRoles(selectedRoles);
            }

            await user.save();
            return res.redirect("/users");
        }
        return res.redirect("/users");
    } catch (err) {
        console.log(err);
    }
}