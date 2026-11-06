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
// Only these simple ingredient names qualify for the limited zero-match display.
// Everything outside the reviewed lists stays unresolved, including compound foods.
const simple=new Set('정제수|아마씨앗유|원유|유기농원유|쌀|당근|호박|가리비|무|옥수수전분|연근|애호박|감자|소고기|아보카도열매|당근분말|냉동증숙고구마|닭가슴살|찹쌀|천일염|간마늘|건표고버섯|가지|둥근전복살|건미역|양송이버섯|쌀가루|증숙고구마|표고버섯|귀리|우유|이집트콩씨앗|흑미|배|고구마|양배추|닭안심살|고올레산해바라기유|다진마늘|후추분태|바질분태|백미후추분말|설탕|후추가루|시금치분말|자색고구마가루|서양호박분말|바나나분말|현미|멥쌀|멥쌀백미|딸기|사과'.split('|'));
const normalize=s=>String(s||'').normalize('NFKC').replace(/\s+/g,'').toLowerCase();
const find=name=>entries.find(e=>[e.name,...e.aliases].some(a=>normalize(a)===normalize(name)));
function analyze(items){
 const found=new Map(),unresolved=new Set();
 for(const raw of items||[]){const name=String(raw).trim();if(!name)continue;const entry=find(name);if(entry){found.set(entry.name,entry)}else if(!simple.has(normalize(name)))unresolved.add(name)}
 const count=found.size,level=count>=3?'red':count>0?'yellow':unresolved.size||!items?.length?'unknown':'blue';
 return {entries:[...found.values()],unresolved:[...unresolved],count,level};
}
// Delimit labels without substring matching: 구연산칼륨 must never count as 구연산.
function fromText(text){const tokens=String(text).replace(/원재료명(?:\s*및\s*함량)?\s*[:：]?/g,'').split(/[,，、;；\n()[\]{}]/).map(s=>s.trim()).filter(Boolean);return analyze(tokens)}
function product(p){const rows=p.candidates.map(c=>analyze(c.ingredients));const first=rows[0]||analyze([]);if(rows.some(r=>r.level!==first.level||r.entries.map(e=>e.name).sort().join('|')!==first.entries.map(e=>e.name).sort().join('|')))return {...first,level:'unknown',candidateDifference:true};return first}
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const label=r=>r.candidateDifference?'후보별 결과 다름':r.level==='unknown'?'확인 필요':`사전 일치 ${r.count}종`;
function badge(r){return `<span class="additive-signal signal-${r.level}"><span class="signal-dot" aria-hidden="true"></span>${label(r)}</span>`}
function explanation(e){return `<div class="additive-explanation"><span class="additive-purpose">일반적인 용도 · ${esc(e.purpose)}</span><p>${esc(e.description)}</p><small>이 제품의 실제 사용 목적·첨가량은 확인되지 않았어요.</small><a href="${e.source}" target="_blank" rel="noopener noreferrer">${e.sourceTitle} ↗</a><small>자료 대조 ${e.checkedAt} · 쉬운 설명은 공식 자료를 바탕으로 요약했어요.</small></div>`}
function panel(r,context='선택한 신고자료') {return `<section class="additive-panel"><div class="additive-panel-head"><div><span class="eyebrow small">ADDITIVE NOTE</span><h3>표시에서 찾은 첨가물</h3></div>${badge(r)}</div><p class="additive-context">${esc(context)} · 등록 사전 ${entries.length}종과 이름 대조</p>${r.entries.length?`<div class="additive-items">${r.entries.map(e=>`<details class="additive-item"><summary>${esc(e.name)} <span>${esc(e.purpose)}</span></summary>${explanation(e)}</details>`).join('')}</div>`:'<p class="additive-empty">등록 사전과 일치하는 첨가물 이름이 없어요. 무첨가 또는 안전 판정을 뜻하지 않아요.</p>'}${r.unresolved.length?`<div class="unresolved-note"><strong>세부 구성·분류 확인 필요 ${r.unresolved.length}개</strong><p>${r.unresolved.map(esc).join(' · ')}</p><small>혼합제제와 복합원재료의 하위 성분, 사전에 없는 이름은 개수에 포함하지 않았어요.</small></div>`:''}<p class="signal-disclaimer">색은 사전과 일치한 첨가물 종류 수예요. 파랑 0종 · 노랑 1~2종 · 빨강 3종 이상 · 회색 확인 필요. 건강 위해성·월령별 섭취 적합성을 판정하지 않아요.${r.unresolved.length?' 표시된 개수 외에 확인되지 않은 성분이 있을 수 있어요.':''}</p></section>`}
window.AdditiveNote={entries,find,analyze,fromText,product,badge,panel,explanation};
})();
