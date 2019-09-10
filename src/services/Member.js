const db = require('../configdb/configDB');
const moment = require('moment');
const successMessage = require('../lib/successMessage');
const errorMessage = require('../lib/errorMessage');
const helper = require('../lib/Helper');
const Responce = require('../lib/Reposnce');

function responceSuccess (res, message, datas, tokens){
    res.send({
        code: 200,
        msg: message,
        data: datas,
        token: tokens
    });
}

function responceError (res, message, datas){
    res.send({
        code: 500,
        msg: message,
        data: datas
    });
}

function responceErrReq (res, message, datas){
    res.send({
        code: 400,
        msg: message,
        data: datas
    });
}

// Promise Actino
// async function memberAction (userid) {
//     const sql = '';
//     return new Promise ((resolve, reject) => {
//         const { rows } = await db.query();
//     })
// }

async function registerMember (req, res, next) {
    const { customerfirstname, customerlastname, sex, birthday, address, subdistrict, district, province, zipcode, phonenumber, email , picture, password} = req.body;
    if (!customerfirstname || !customerlastname || !sex || !email) {
        return responceErrReq(res, errorMessage.paramsNotMatch);
    }
    const date = moment(Date.now()).format('YYYY-MM-DD HH:mm:ss');
    const active = true;
    const hashPassword = helper.Helper.hashPassword(password);
    const sql = `INSERT INTO member (createdate, active, datemodify, firstname, lastname, gender, brithday, addressuser, subdistrict, disstrict, province, zipcode, photo, email, phone, passworduser) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`
    // const val = `{${req.files.map((item) => item.filename).join()}}`
    // const picture = []
    // picture.push(val)

    const values = [date, active, date, customerfirstname, customerlastname, sex, birthday, address, subdistrict, district, province, zipcode, picture, email, phonenumber, hashPassword];
    
    try {
        const { rows } = await db.query(sql, values);
        return responceSuccess(res, successMessage.success, rows);
    } catch (error) {
        return responceError(res, errorMessage.saveError);
    } finally {
        
    }
}

async function getProfileMember (req, res, next) {
    const { headers } = req;
    const subtoken = headers.authorization.split(' ');
    const token = subtoken[1];
    const decode = helper.Helper.verifyToken(token);
    const sql = `select firstname, lastname, gender, brithday, addressuser, subdistrict, disstrict, province, zipcode, photo, email, phone from member where userid = $1`
    const value = [decode.data.id];
    //JWT
    // console.log(decode.data);
    // console.log(req);
    try {
        const { rows } = await db.query(sql, value);
        const tranfom = {
            customerfirstname: rows[0].firstname,
            customerlastname: rows[0].lastname,
            sex: rows[0].gender,
            birthday: rows[0].brithday,
            address: rows[0].addressuser,
            subdistrict: rows[0].subdistrict,
            district: rows[0].disstrict,
            province: rows[0].province,
            zipcode: rows[0].zipcode,
            phonenumber: rows[0].phone,
            email: rows[0].email,
            picture: rows[0].photo,
        }
        return responceSuccess(res, successMessage.save, tranfom);
    } catch (error) {
        return responceError(res, errorMessage.saveError);
    } finally {
        res.end();
    }
}

// UPDATE table_name  
// SET column1 = value1, column2 = value2...., columnN = valueN  
// WHERE [condition];  


// userid|createdate | active |  datemodify |firstname |lastname | gender |brithday | addressuser 
// | subdistrict | disstrict | province | zipcode|photo|email|phone|passworduser 
async function updateMember (req, res, next) {
    const {customerfirstname, customerlastname, sex, birthday, address, subdistrict, district, province, zipcode, phonenumber, email, password} = req.body
    const { headers } = req;
    const subtoken = headers.authorization.split(' ');
    const token = subtoken[1];
    const decode = helper.Helper.verifyToken(token);

    console.log(req);

    const val = `{${req.files.map((item) => item.filename).join()}}`
    const picture = []
    picture.push(val)

    const hashPassword = helper.Helper.hashPassword(password);

    const sql = `update member set firstname = $1, lastname = $2, gender = $3, brithday = $4, addressuser = $5,
    subdistrict = $6, disstrict = $7, province = $8, zipcode = $9, phone = $10, email = $11, photo = $12, passworduser = $13 where userid = $14`
    const value = [customerfirstname, customerlastname, sex, birthday, address, subdistrict, district, province, zipcode, phonenumber, email, picture,hashPassword,decode.data.id];
    try {
        await db.query(sql, value);
        return Responce.resSuccess(res, successMessage.upload);
    } catch (error){
        throw error
        // return Responce.resError(res, errorMessage.saveError);
    } finally {
        res.end();
    }

}

async function logInMember (req, res, next) {
    const { email, password } = req.body;  
    if (!email || !password) {
        return responceErrReq(res, errorMessage.paramsNotMatch);
    }
    // if (helper.Helper.isValidEmail(email)) {
    //     return responceError(res, errorMessage.saveError);
    // }
    const sql = 'SELECT * FROM member WHERE email = $1';

    try {
        const { rows } = await db.query(sql, [req.body.email]);
        if (!rows[0]) {
            return responceError(res, errorMessage.saveError);
        }
        if (!helper.Helper.comparePassword(rows[0].passworduser, req.body.password)) {
            return responceErrReq(res, errorMessage.paramsNotMatch);
        } 
        const tranfrom = {
            id: rows[0].userid,
            firstname: rows[0].firstname,
            lastname: rows[0].lastname,
        }
        const mergedata = {
            firstname: rows[0].firstname,
            lastname: rows[0].lastname,
        }
        const token = helper.Helper.generateToken(tranfrom);
        return responceSuccess(res, successMessage.success, mergedata, token);
    }  catch (error) {
        return responceError(res, errorMessage.saveError);
    } finally {
        res.end();
    }
}

module.exports = {
    registerMember,
    getProfileMember,
    logInMember,
    updateMember,
}