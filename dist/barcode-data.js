(()=>{
const normalize=raw=>String(raw||'').trim().replace(/[\s-]/g,'');
function valid(raw){const code=normalize(raw);if(!/^(?:\d{8}|\d{12}|\d{13}|\d{14})$/.test(code))return false;let sum=0;for(let i=code.length-2,weight=3;i>=0;i--,weight=weight===3?1:3)sum+=Number(code[i])*weight;return (10-sum%10)%10===Number(code.at(-1))}
function imageURL(raw){try{const u=new URL(raw);return u.protocol==='https:'&&u.hostname==='images.openfoodfacts.org'&&!u.username&&!u.password?u.href:''}catch{return ''}}
function unpack(data,code){const p=data?.product;if(!p||data.status===0||data.status==='failure')return null;if(p.code&&String(p.code).padStart(14,'0')!==code.padStart(14,'0'))return null;const text=v=>typeof v==='string'?v.slice(0,20000):'';
 const nutrients=[['energy-kcal_100g','열량','kcal'],['sugars_100g','당류','g'],['salt_100g','소금','g'],['proteins_100g','단백질','g']].map(([key,label,unit])=>({label,unit,value:typeof p.nutriments?.[key]==='number'&&Number.isFinite(p.nutriments[key])&&p.nutriments[key]>=0?p.nutriments[key]:null}));
 return {code,name:text(p.product_name_ko)||text(p.product_name)||'제품명 미등록',brand:text(p.brands),image:imageURL(p.image_front_small_url),ingredients:text(p.ingredients_text_ko)||text(p.ingredients_text),korean:!!text(p.ingredients_text_ko),additives:Array.isArray(p.additives_tags)?p.additives_tags.filter(x=>typeof x==='string').slice(0,100):[],allergens:Array.isArray(p.allergens_tags)?p.allergens_tags.filter(x=>typeof x==='string').slice(0,100):[],nutrients,modified:typeof p.last_modified_t==='number'?p.last_modified_t:null};
}
function url(code){const u=new URL('https://world.openfoodfacts.org/api/v3/product/'+code+'.json');u.searchParams.set('fields','code,product_name,product_name_ko,brands,image_front_small_url,ingredients_text,ingredients_text_ko,nutriments,additives_tags,allergens_tags,last_modified_t');u.searchParams.set('User-Agent','AdditiveNote/0.6 (https://github.com/suyeonkim0731/baby_food)');u.searchParams.set('app_name','AdditiveNote');u.searchParams.set('app_version','0.6');return u.href}
window.BarcodeData={normalize,valid,imageURL,unpack,url};
})();
