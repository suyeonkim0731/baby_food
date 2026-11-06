// A small, source-reviewed name dictionary; never a health-risk classifier.
(()=>{
const source='https://www.foodsafetykorea.go.kr/foodcode/pdf/2/2-5.pdf';
const entries=[
 {name:'구연산',aliases:[],purpose:'산도조절제',description:'식품의 산성·알칼리성 정도를 조절할 때 쓰이는 성분이에요.'},
 {name:'구연산칼륨',aliases:[],purpose:'산도조절제 · 영양강화제',description:'구연산의 칼륨염이에요. 산도를 조절하거나 영양성분을 보충하는 용도로 쓰일 수 있어요.'},
 {name:'구연산철암모늄',aliases:[],purpose:'영양강화제',description:'식품에 철 성분을 보충하는 데 쓰이는 성분이에요. 이 제품의 첨가량이나 철 함량은 현재 자료로 알 수 없어요.'},
 {name:'제삼인산나트륨',aliases:['인산삼나트륨'],purpose:'산도조절제',description:'인산염 계열 성분으로 식품의 산도를 조절하는 데 쓰일 수 있어요.'},
 {name:'폴리인산나트륨',aliases:[],purpose:'산도조절제 · 팽창제',description:'인산염 계열 성분이에요. 산도를 조절하거나 식품이 부풀도록 돕는 용도로 쓰일 수 있어요.'}
].map(e=>({...e,source,sourceTitle:'식약처 식품첨가물공전 · 품목별 사용기준',checkedAt:'2026-11-06'}));
// Reviewed simple ingredient names; compound and unreviewed names remain unresolved.
// Everything outside the reviewed lists stays unresolved, including compound foods.
const simple=new Set('정제수|아마씨앗유|원유|유기농원유|쌀|당근|호박|가리비|무|옥수수전분|연근|애호박|감자|소고기|아보카도열매|당근분말|냉동증숙고구마|닭가슴살|찹쌀|천일염|간마늘|건표고버섯|가지|둥근전복살|건미역|양송이버섯|쌀가루|증숙고구마|표고버섯|귀리|우유|이집트콩씨앗|흑미|배|고구마|양배추|닭안심살|고올레산해바라기유|다진마늘|후추분태|바질분태|백미후추분말|설탕|후추가루|시금치분말|자색고구마가루|서양호박분말|바나나분말|현미|멥쌀|멥쌀백미|딸기|사과'.split('|'));
const normalize=s=>String(s||'').normalize('NFKC').replace(/\s+/g,'').toLowerCase();
const find=name=>entries.find(e=>[e.name,...e.aliases].some(a=>normalize(a)===normalize(name)));
function analyze(items){
 const found=new Map(),unresolved=new Set();
 for(const raw of items||[]){const name=String(raw).trim();if(!name)continue;const entry=find(name);if(entry){found.set(entry.name,entry)}else if(!simple.has(normalize(name)))unresolved.add(name)}
 return {entries:[...found.values()],unresolved:[...unresolved],count:found.size};
}
// Delimit labels without substring matching: 구연산칼륨 must never count as 구연산.
function fromText(text){const tokens=String(text).replace(/원재료명(?:\s*및\s*함량)?\s*[:：]?/g,'').split(/[,，、;；\n()[\]{}]/).map(s=>s.trim()).filter(Boolean);return analyze(tokens)}
function product(p){const rows=p.candidates.map(c=>analyze(c.ingredients));const first=rows[0]||analyze([]);const unresolved=[...new Set(rows.flatMap(r=>r.unresolved))];if(rows.some(r=>r.entries.map(e=>e.name).sort().join('|')!==first.entries.map(e=>e.name).sort().join('|')))return {entries:[],unresolved,count:null,candidateDifference:true};return {...first,unresolved}}
const purposeNames={'영양강화제':'영양 보충용','산도조절제':'산도 조절용','팽창제':'부풀림용'};
const purposes=r=>[...new Set(r.entries.flatMap(e=>e.purpose.split(' · ').map(p=>purposeNames[p]||p)))];
const purposeLabel=e=>purposes({entries:[e]}).join(' · ');
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function badge(r){return `<span class="additive-summary"><span class="additive-count">${r.candidateDifference?'후보별 성분 확인':`사전 일치 ${r.count}종`}</span>${purposes(r).map(p=>`<span class="purpose-tag">${esc(p)}</span>`).join('')}</span>`}
function explanation(e){return `<div class="additive-explanation"><span class="additive-purpose">일반적인 역할 · ${esc(purposeLabel(e))}</span><span class="official-purpose">공식 용도명 · ${esc(e.purpose)}</span><p>${esc(e.description)}</p><small>이 제품의 실제 사용 목적·첨가량은 확인되지 않았어요.</small><a href="${e.source}" target="_blank" rel="noopener noreferrer">${e.sourceTitle} ↗</a><small>자료 대조 ${e.checkedAt} · 쉬운 설명은 공식 자료를 바탕으로 요약했어요.</small></div>`}
function panel(r,context='선택한 신고자료') {return `<section class="additive-panel"><div class="additive-panel-head"><div><span class="eyebrow small">ADDITIVE NOTE</span><h3>표시에서 찾은 첨가물</h3></div>${badge(r)}</div><p class="additive-context">${esc(context)} · 등록 사전 ${entries.length}종과 이름 대조</p>${r.entries.length?`<div class="additive-items">${r.entries.map(e=>`<details class="additive-item"><summary>${esc(e.name)} <span>${esc(purposeLabel(e))}</span></summary>${explanation(e)}</details>`).join('')}</div>`:'<p class="additive-empty">등록 사전과 일치하는 첨가물 이름이 없어요. 무첨가 또는 안전 판정을 뜻하지 않아요.</p>'}${r.unresolved.length?`<div class="unresolved-note"><strong>세부 구성·분류 확인 필요 ${r.unresolved.length}개</strong><p>${r.unresolved.map(esc).join(' · ')}</p><small>혼합제제와 복합원재료의 하위 성분, 사전에 없는 이름은 개수에 포함하지 않았어요.</small></div>`:''}<p class="purpose-note">용도는 해당 첨가물의 일반적인 역할이에요. 이 제품에서의 실제 사용 목적·첨가량은 확인되지 않았어요. 사전 일치 수는 확인된 이름의 종류 수이며, 전체 첨가물 수나 건강 등급을 뜻하지 않아요.${r.unresolved.length?' 세부 구성이 확인되지 않은 성분이 있어요.':''}</p></section>`}
window.AdditiveNote={entries,find,analyze,fromText,product,purposes,purposeLabel,badge,panel,explanation};
})();
