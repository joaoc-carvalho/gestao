export function parseImport(content, format) {
 if(format === 'ofx') {
 const blocks=content.match(/<STMTTRN>[\s\S]*?(?:<\/STMTTRN>|(?=<STMTTRN>)|$)/gi)||[];
 const tag=(s,t)=>(s.match(new RegExp('<'+t+'>([^<\\r\\n]+)','i'))?.[1]||'').trim();
 return blocks.map(b=>{const amount=Number(tag(b,'TRNAMT')); const d=tag(b,'DTPOSTED'); return {date:`${d.slice(0,4)}-${d.slice(4,6)}-${d.slice(6,8)}`,description:tag(b,'MEMO')||tag(b,'NAME')||'Importação OFX',amount:Math.abs(amount),type:amount<0?'despesa':'receita'};});
 }
 const lines=[];let row=[],cell='',quoted=false;
 const separator=content.split(/\r?\n/)[0].includes(';')?';':',';
 for(let i=0;i<content.length;i++){const c=content[i];if(c==='"'){if(quoted&&content[i+1]==='"'){cell+='"';i++;}else quoted=!quoted;}else if(c===separator&&!quoted){row.push(cell);cell='';}else if(c==='\n'&&!quoted){row.push(cell.replace(/\r$/,''));lines.push(row);row=[];cell='';}else cell+=c;}
 if(quoted)throw Error('Aspas não fechadas no CSV.');
 if(cell||row.length){row.push(cell.replace(/\r$/,''));lines.push(row);}
 const header=(lines.shift()||[]).map(x=>x.replace(/^\uFEFF/,'').trim().toLowerCase());
 for(const h of ['data','descricao','valor'])if(!header.includes(h))throw Error('CSV precisa das colunas data,descricao,valor.');
 return lines.filter(r=>r.some(Boolean)).map(r=>{const get=k=>(r[header.indexOf(k)]||'').trim();let v=get('valor');if(v.includes(','))v=v.replace(/\./g,'').replace(',','.'); const n=Number(v);let date=get('data');if(/^\d{2}\/\d{2}\/\d{4}$/.test(date))date=date.split('/').reverse().join('-');return {date,description:get('descricao'),amount:Math.abs(n),type:get('tipo')||(n<0?'despesa':'receita')};});
}
export function validate(x){
 if(!['despesa','receita','aporte','resgate'].includes(x.type))throw Error('Tipo inválido.');
 if(!/^\d{4}-\d{2}-\d{2}$/.test(x.date)||!Number.isFinite(Date.parse(x.date))||new Date(x.date).toISOString().slice(0,10)!==x.date)throw Error('Data inválida.');
 if(!Number.isFinite(x.amount)||x.amount<=0||x.amount>1e12)throw Error('Valor deve ser maior que zero.');
 if(!x.description?.trim()||x.description.length>300)throw Error('Informe uma descrição com até 300 caracteres.');
 if(!['Eu','Esposa','Compartilhado'].includes(x.owner))throw Error('Responsável inválido.');
 if(!['Itaú','Nubank','Banco do Brasil','Outra'].includes(x.bank))throw Error('Instituição inválida.');
 return {...x,description:x.description.trim(),category:String(x.category||'Outros').slice(0,80),amount:Math.round(x.amount*100)/100};
}
