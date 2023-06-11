const express = require("express");
const sqlite3 = require("sqlite3");
const sqlite = require("sqlite");
const fs = require("fs");
const ejs = require("ejs");

async function getDBConnection() {
    const db = await sqlite.open({
        filename : 'product.db',
        driver : sqlite3.Database
    });
    return db;
}

var app = express();
var port = process.env.PORT || 3000;

app.use(express.static("public"));
app.use(express.json()); 
app.use(express.urlencoded({ extended: false }));

app.set("view engine", "ejs");

app.get('/', async function(req, res){
    let db = await getDBConnection();
    let rows = await db.all('select * from products');
    await db.close();
    
    let mopt = {};
    mopt.pcg = ['selected', '', '', ''];
    mopt.psc = '';
    mopt.pst = ['selected', '', ''];

    res.render("main", {prod : rows, menu : mopt});
});

app.get('/product/:id', async function(req, res){
    let id = parseInt(req.params.id.substring(1));
    
    let db = await getDBConnection();
    let command = 'select * from products where product_id=' + id + ';';
    let row = await db.all(command);
    await db.close();
    
    const cjson = fs.readFileSync('comment.json', 'utf8');
    const cjsd = JSON.parse(cjson).comments;

    var jsond, found = false;
    
    for(let i = 0; i < cjsd.length; i++){
        if(cjsd[i].id == id) {jsond = cjsd[i];found = true;break;}
    }
    if(!found) {
        let newcom = {};
        newcom.id = id;
        newcom.comment = [];
        jsond = newcom;
        cjsd.push(newcom);
    }

    var wjson = {};
    wjson.comments = cjsd;

    fs.writeFileSync('comment.json', JSON.stringify(wjson));

    res.render("product", {prod : row[0], comt : jsond});
});

app.post('/product/:id', async function(req, res){
    let id = parseInt(req.params.id.substring(1));

    const cjson = fs.readFileSync('comment.json', 'utf8');
    const cjsd = JSON.parse(cjson).comments;

    var add = req.body.fdbadd;

    var jsond, found = false;

    for(let i = 0; i < cjsd.length; i++){
        if(cjsd[i].id == id) {if(add != ""){cjsd[i].comment.push(add);}jsond=cjsd[i];found = true;break;}
    }
    if(!found) {
        let newcom = {};
        newcom.id = id;
        newcom.comment = [];
        newcom.comment.push(add);
        jsond = newcom;
        cjsd.push(newcom);
    }
    
    var wjson = {};
    wjson.comments = cjsd;

    fs.writeFileSync('comment.json', JSON.stringify(wjson));

    let db = await getDBConnection();
    let command = 'select * from products where product_id=' + id + ';';
    let row = await db.all(command);
    await db.close();

    res.redirect("/product/:" + id);

});

app.post('/', async function(req, res){

    let db = await getDBConnection();
    var rows, command = '', wcount = false;
    var mopt = {};
    var mopt_pcg = ['', '', '', ''];
    var mopt_pst = ['', '', ''];

    if(req.body.pcg == "전체") {command += 'select * from products '; mopt_pcg[0] = 'selected';}
    else if(req.body.pcg == "single candy") {command += 'select * from products where product_category="single candy"';wcount = true; mopt_pcg[1] = 'selected';}
    else if(req.body.pcg == "homemade bundle") {command += 'select * from products where product_category="homemade bundle"';wcount = true; mopt_pcg[2] = 'selected';}
    else if(req.body.pcg == "madebundle") {command += 'select * from products where product_category="madebundle"';wcount = true; mopt_pcg[3] = 'selected';}
    
    if(req.body.psc) {
        if(wcount) command += 'and product_title like "%' + req.body.psc + '%" ';
        else command += 'where product_title like "%' + req.body.psc + '%" ';
    }

    if(req.body.pst == "name") {command += 'order by product_title asc;'; mopt_pst[1] = 'selected';}
    else if(req.body.pst == "price") {command += 'order by product_price asc;'; mopt_pst[2] = 'selected';}
    else {command += ';'; mopt_pst[0] = 'selected';}

    mopt.pcg = mopt_pcg;
    mopt.psc = req.body.psc || '';
    mopt.pst = mopt_pst;

    rows = await db.all(command);
    await db.close();
    res.render("main", {prod : rows, menu : mopt});
    
});

app.get('/login', async function(req, res){
    res.render("login");
});

app.get('/signup', async function(req, res){
    res.render("signup");
});

app.listen(port, function(){
    console.log(port + " 포트에서 서버 실행");
});