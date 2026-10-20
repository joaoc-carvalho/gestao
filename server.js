import http from 'node:http';
import {DatabaseSync} from 'node:sqlite';
import {mkdirSync,readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {validate} from './import.js';
const root=fileURLToPath(new URL('.',import.meta.url));
mkdirSync(root+'data',{recursive:true});
const db=new DatabaseSync(process.env.DB_PATH||root+'data/gestao.sqlite');
db.exec('CREATE TABLE IF NOT EXISTS entries (id INTEGER PRIMARY KEY, date TEXT, description TEXT, amount REAL, type TEXT, owner TEXT, bank TEXT, category TEXT)');
const insert=db.prepare('INSERT INTO entries(date,description,amount,type,owner,bank,category) VALUES(?,?,?,?,?,?,?)');
const json=(res,status,value)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(value));};
const server=http.createServer(async(req,res)=>{
 try{
 if(req.method==='GET'&&req.url==='/api/entries')return json(res,200,db.prepare('SELECT * FROM entries ORDER BY date DESC,id DESC').all());
 if(req.method==='POST'&&req.url==='/api/entries'){
 if(req.headers.origin&&req.headers.origin!==`http://${req.headers.host}`&&req.headers.origin!==`https://${req.headers.host}`)return json(res,403,{error:'Origem inválida.'});
 if(!req.headers['content-type']?.startsWith('application/json'))return json(res,415,{error:'Use JSON.'});
 let body='';for await(const chunk of req){body+=chunk;if(body.length>2e6)return json(res,413,{error:'Arquivo muito grande.'});}
 const payload=JSON.parse(body);const rows=(Array.isArray(payload)?payload:[payload]).map(validate);
 if(!rows.length||rows.length>5000)throw Error('Envie entre 1 e 5000 lançamentos.');
 db.exec('BEGIN');try{for(const x of rows)insert.run(x.date,x.description,x.amount,x.type,x.owner,x.bank,x.category);db.exec('COMMIT');}catch(e){db.exec('ROLLBACK');throw e;}
 return json(res,201,{added:rows.length});
 }
 if(req.method==='DELETE'&&/^\/api\/entries\/\d+$/.test(req.url)){
 if(req.headers['x-requested-with']!=='gestao')return json(res,403,{error:'Requisição inválida.'});
 db.prepare('DELETE FROM entries WHERE id=?').run(Number(req.url.split('/').pop()));return json(res,200,{ok:true});}
 const files={'/':['public/index.html','text/html; charset=utf-8'],'/app.js':['public/app.js','text/javascript; charset=utf-8'],'/style.css':['public/style.css','text/css'],'/import.js':['import.js','text/javascript; charset=utf-8']};
 if(req.method==='GET'&&files[req.url]){const [file,type]=files[req.url];res.writeHead(200,{'Content-Type':type,'X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'self'; style-src 'self'; script-src 'self'; frame-ancestors 'none'"});return res.end(readFileSync(root+file));}
 json(res,404,{error:'Não encontrado.'});
 }catch(e){json(res,400,{error:e.message});}
});
server.listen(Number(process.env.PORT||3000),process.env.HOST||'127.0.0.1',()=>console.log('Gestão iniciado na porta '+(process.env.PORT||3000)));
