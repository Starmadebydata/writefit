module.exports=[93695,(e,t,r)=>{t.exports=e.x("next/dist/shared/lib/no-fallback-error.external.js",()=>require("next/dist/shared/lib/no-fallback-error.external.js"))},18622,(e,t,r)=>{t.exports=e.x("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js",()=>require("next/dist/compiled/next-server/app-page-turbo.runtime.prod.js"))},56704,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/work-async-storage.external.js",()=>require("next/dist/server/app-render/work-async-storage.external.js"))},32319,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/work-unit-async-storage.external.js",()=>require("next/dist/server/app-render/work-unit-async-storage.external.js"))},24725,(e,t,r)=>{t.exports=e.x("next/dist/server/app-render/after-task-async-storage.external.js",()=>require("next/dist/server/app-render/after-task-async-storage.external.js"))},70406,(e,t,r)=>{t.exports=e.x("next/dist/compiled/@opentelemetry/api",()=>require("next/dist/compiled/@opentelemetry/api"))},20101,40689,42072,e=>{"use strict";async function t(e){let{config:t,systemPrompt:r,messages:n,temperature:i=t.temperature??.3,maxTokens:s=t.maxTokens??2e3,jsonMode:a=!1}=e;if(!t.apiKey)throw Error("缺少 API Key，请在设置中配置你的 AI 服务");if(!t.apiBaseUrl)throw Error("缺少 API 地址，请在设置中配置你的 AI 服务");let o=[];r&&o.push({role:"system",content:r}),o.push(...n);let l=t.apiBaseUrl.replace(/\/+$/,""),c=`${l}/chat/completions`,u=await fetch(c,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${t.apiKey}`},body:JSON.stringify({model:t.model,messages:o,temperature:i,max_tokens:s,...a?{response_format:{type:"json_object"}}:{}})});if(!u.ok){let e=await u.text();throw Error(`AI API 调用失败 (${u.status}): ${e.slice(0,300)}`)}let d=await u.json();return d.choices?.[0]?.message?.content??""}async function r(e){let r=await t({...e,jsonMode:!0});try{return JSON.parse(r)}catch{let e=r.match(/\{[\s\S]*\}/);if(e)return JSON.parse(e[0]);throw Error("AI 返回的内容不是合法的 JSON 格式")}}e.s(["callAIJson",0,r],20101);let n=`You are WriteFit, an AI writing coach.

Your job is to improve the user's writing ability, not to replace the user's writing.

Rules:
1. Do not write the full draft for the user unless explicitly asked inside Draft Lab.
2. Focus on diagnosis, revision tasks, and skill training.
3. Always quote specific text from the user's writing when giving feedback.
4. Avoid generic praise.
5. Give no more than 3 major issues at a time.
6. Prefer concrete revision tasks over abstract advice.
7. Detect generic, AI-like, over-polished, vague, or empty writing.
8. Help the user build their own voice.

When the user's text is in Chinese, respond in Chinese.
When the user's text is in English, respond in English.`,i=`You are a strict writing coach.

Analyze the user's text. Do not rewrite the full text.

Evaluate:
1. Clarity (清晰度)
2. Specificity (具体性)
3. Personal voice (个人声音)
4. Strength of claim (观点锋利度)
5. AI-like tone (AI 腔程度)
6. Empty phrases (废话密度)
7. Reader resistance (读者阻力)

Return JSON only:

{
  "top_issues": [
    {
      "issue": "问题名称",
      "evidence": "引用用户原文的具体句子",
      "why_it_matters": "为什么影响表达",
      "revision_task": "用户下一步该怎么改"
    }
  ],
  "best_sentence": "原文中最好的句子",
  "most_ai_like_sentence": "原文中最像 AI 的句子",
  "next_revision_goal": "下一轮修改目标",
  "scores": {
    "clarity": 0,
    "specificity": 0,
    "voice": 0,
    "ai_like": 0
  }
}

Constraints:
- Return exactly 3 top issues unless the text is too short.
- The evidence field must quote the user's text.
- Do not flatter the user.
- Do not rewrite the full passage.
- All scores are 0-100.`,s=`You are an anti-AI-writing editor.

Detect generic, template-like, over-smoothed, vague, or AI-like writing.

Look for:
1. Big claims without evidence (宏大但无证据的判断)
2. Sentences without a clear human subject (没有责任主体的句子)
3. Symmetrical clich\xe9 structures (过度对称结构)
4. Generic transition phrases (万能连接词)
5. Abstract noun stacks (抽象名词堆叠)
6. Conclusions without personal experience (没有个人经验的总结)
7. Smooth but empty paragraphs (过度平滑的结尾)
8. Overused AI phrasing (常见 AI 连接词)

Default banned phrases to check for:
值得注意的是, 从某种意义上说, 在当今时代, 深刻改变, 赋能, 生态, 闭环, 重塑, 这不仅体现了, 提供了新的可能性,
It is worth noting that, In today's world, It goes without saying, At the end of the day, When all is said and done, In the realm of, It's important to note, This represents a significant

Return JSON only:

{
  "ai_like_score": 0,
  "flagged_sentences": [
    {
      "sentence": "被标记的句子",
      "problem_type": "问题类型",
      "reason": "原因",
      "manual_revision_instruction": "用户修改任务"
    }
  ],
  "banned_phrases_found": [],
  "one_revision_priority": "本轮最重要修改方向"
}

Do not rewrite the full text. ai_like_score is 0-100, higher means more AI-like.`,a=`You are a revision coach.

Compare the user's original text and revised text.
Judge whether the revision improved the writing.

Return JSON only:

{
  "improved": true,
  "summary": "总体评价",
  "what_improved": ["改善的方面"],
  "what_got_worse": ["变差的方面"],
  "specificity_change": "具体性变化",
  "voice_change": "个人声音变化",
  "ai_like_change": "AI 腔变化",
  "next_revision_task": "下一步修改建议"
}`;e.s(["ANTI_AI_VOICE_PROMPT",0,s,"COMPARE_REVISION_PROMPT",0,a,"DIAGNOSE_PROMPT",0,i,"SYSTEM_RULES",0,n],40689),e.s(["mockAntiAIVoice",0,function(e){let t=["值得注意的是","从某种意义上说","在当今时代","深刻改变","赋能","生态","闭环","重塑","这不仅体现了","提供了新的可能性"].filter(t=>e.includes(t)),r=e.split(/[。.！!？?\n]+/).filter(e=>e.trim().length>5).filter(e=>e.length>40||/值得注意|不仅|从而|进而|总之|综上|综上|可以看到/.test(e)).slice(0,3).map(e=>({sentence:e.trim(),problem_type:e.length>50?"句子过长":"模板连接词",reason:e.length>50?"这个句子太长，读者需要反复阅读才能理解，可能是 AI 生成的典型特征。":"使用了常见的 AI 模板连接词，让表达变得空泛。",manual_revision_instruction:"把这句话拆短，用你自己的话说一遍。"}));return{ai_like_score:Math.min(85,35+15*t.length+Math.floor(e.length/20)),flagged_sentences:r,banned_phrases_found:t,one_revision_priority:t.length>0?`先删掉这些词：${t.join("、")}`:"把最长的句子拆成两个短句。"}},"mockCompareRevision",0,function(e,t){let r=e.length,n=t.length,i=n-r;return{improved:n!==r,summary:i<0?"你删减了内容，让表达更精炼了。":i>20?"你增加了内容，加入了更多细节。":"你调整了表达方式，但整体长度变化不大。",what_improved:["句子节奏","个人声音","具体性"].slice(0,i<0?2:3),what_got_worse:i>50?["可能加入了新的空泛内容"]:[],specificity_change:i>0?"提升":"基本不变",voice_change:"提升",ai_like_change:"降低",next_revision_task:"再读一遍修改稿，找出一个还可以更具体的句子，继续改。"}},"mockDiagnose",0,function(e){let t=e.split(/[。.！!？?\n]+/).filter(e=>e.trim().length>5),r=e.length,n=[...t].sort((e,t)=>t.length-e.length),i=n[0]?.trim()??e.slice(0,50),s=(t.find(e=>/\d|我|今天|昨天|上周|这次|这个/.test(e))??t[0]??e.slice(0,50)).trim();return{top_issues:[{issue:"表达过于抽象，缺少具体场景",evidence:i.slice(0,80),why_it_matters:"读者无法在你的文字中看到画面，无法产生代入感。抽象的表达让人读完就忘。",revision_task:"找一个你亲身经历的具体场景，用'我+动作+细节'的方式重写这段话。"},{issue:"缺少个人判断，读起来像通用观点",evidence:t[1]?.trim().slice(0,80)??e.slice(20,80),why_it_matters:"没有个人判断的文字，任何人都能写，也就没有人会想读你写的版本。",revision_task:"在这段话后面加一句'我认为...'，说出你自己的真实看法，哪怕不完美。"},{issue:"句子节奏单一，缺少长短变化",evidence:t[2]?.trim().slice(0,80)??e.slice(40,100),why_it_matters:"所有句子长度接近时，阅读节奏会变得催眠。短句能制造强调，长句能展开论证。",revision_task:"把其中一句长句拆成两个短句，或者把两个短句合成一个有呼吸感的长句。"}],best_sentence:s,most_ai_like_sentence:i.slice(0,100),next_revision_goal:"在修改稿中加入一个具体场景和个人判断，让文字只属于你。",scores:{clarity:Math.min(70,40+Math.floor(r/10)),specificity:Math.min(60,30+Math.floor(3*t.length)),voice:Math.min(55,25+Math.floor(2*t.length)),ai_like:Math.min(80,40+Math.floor(r/8))}}}],42072)},11709,e=>{"use strict";var t=e.i(47909),r=e.i(74017),n=e.i(96250),i=e.i(59756),s=e.i(61916),a=e.i(74677),o=e.i(69741),l=e.i(16795),c=e.i(87718),u=e.i(95169),d=e.i(47587),p=e.i(66012),h=e.i(70101),g=e.i(26937),m=e.i(10372),v=e.i(93695);e.i(52474);var _=e.i(220),f=e.i(89171),x=e.i(20101),w=e.i(40689),y=e.i(42072);async function R(e){try{let{text:t,language:r="zh",aiConfig:n}=await e.json();if(!t||"string"!=typeof t||t.trim().length<10)return f.NextResponse.json({error:"文本太短，至少需要 10 个字符才能诊断"},{status:400});if(!n||!n.apiKey){let e=(0,y.mockDiagnose)(t);return f.NextResponse.json({...e,_mock:!0})}let i=await (0,x.callAIJson)({config:n,systemPrompt:`${w.SYSTEM_RULES}

${w.DIAGNOSE_PROMPT}`,messages:[{role:"user",content:`请分析以下${"zh"===r?"中文":"英文"}写作：

${t}`}],temperature:.3,maxTokens:2e3,jsonMode:!0});return f.NextResponse.json(i)}catch(t){console.error("AI 诊断失败:",t);let e=t instanceof Error?t.message:"AI 诊断失败";return f.NextResponse.json({error:e},{status:500})}}e.s(["POST",0,R],5890);var A=e.i(5890);let E=new t.AppRouteRouteModule({definition:{kind:r.RouteKind.APP_ROUTE,page:"/api/ai/diagnose/route",pathname:"/api/ai/diagnose",filename:"route",bundlePath:""},distDir:".next",relativeProjectDir:"",resolvedPagePath:"[project]/app/api/ai/diagnose/route.ts",nextConfigOutput:"standalone",userland:A,...{}}),{workAsyncStorage:k,workUnitAsyncStorage:I,serverHooks:b}=E;async function C(e,t,n){n.requestMeta&&(0,i.setRequestMeta)(e,n.requestMeta),E.isDev&&(0,i.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let f="/api/ai/diagnose/route";f=f.replace(/\/index$/,"")||"/";let x=await E.prepare(e,t,{srcPage:f,multiZoneDraftMode:!1});if(!x)return t.statusCode=400,t.end("Bad Request"),null==n.waitUntil||n.waitUntil.call(n,Promise.resolve()),null;let{buildId:w,deploymentId:y,params:R,nextConfig:A,parsedUrl:k,isDraftMode:I,prerenderManifest:b,routerServerContext:C,isOnDemandRevalidate:S,revalidateOnlyGenerated:P,resolvedPathname:N,clientReferenceManifest:O,serverActionsManifest:T}=x,M=(0,o.normalizeAppPath)(f),j=!!(b.dynamicRoutes[M]||b.routes[N]),q=async()=>((null==C?void 0:C.render404)?await C.render404(e,t,k,!1):t.end("This page could not be found"),null);if(j&&!I){let e=!!b.routes[N],t=b.dynamicRoutes[M];if(t&&!1===t.fallback&&!e){if(A.adapterPath)return await q();throw new v.NoFallbackError}}let D=null;!j||E.isDev||I||(D="/index"===(D=N)?"/":D);let U=!0===E.isDev||!j,$=j&&!U;T&&O&&(0,a.setManifestsSingleton)({page:f,clientReferenceManifest:O,serverActionsManifest:T});let H=e.method||"GET",K=(0,s.getTracer)(),B=K.getActiveScopeSpan(),F=!!(null==C?void 0:C.isWrappedByNextServer),J=!!(0,i.getRequestMeta)(e,"minimalMode"),L=(0,i.getRequestMeta)(e,"incrementalCache")||await E.getIncrementalCache(e,A,b,J);null==L||L.resetRequestCache(),globalThis.__incrementalCache=L;let G={params:R,previewProps:b.preview,renderOpts:{experimental:{authInterrupts:!!A.experimental.authInterrupts},cacheComponents:!!A.cacheComponents,supportsDynamicResponse:U,incrementalCache:L,cacheLifeProfiles:A.cacheLife,waitUntil:n.waitUntil,onClose:e=>{t.on("close",e)},onAfterTaskError:void 0,onInstrumentationRequestError:(t,r,n,i)=>E.onRequestError(e,t,n,i,C)},sharedContext:{buildId:w,deploymentId:y}},W=new l.NodeNextRequest(e),Y=new l.NodeNextResponse(t),V=c.NextRequestAdapter.fromNodeNextRequest(W,(0,c.signalFromNodeResponse)(t));try{let i,a=async e=>E.handle(V,G).finally(()=>{if(!e)return;e.setAttributes({"http.status_code":t.statusCode,"next.rsc":!1});let r=K.getRootSpanAttributes();if(!r)return;if(r.get("next.span_type")!==u.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${r.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let n=r.get("next.route");if(n){let t=`${H} ${n}`;e.setAttributes({"next.route":n,"http.route":n,"next.span_name":t}),e.updateName(t),i&&i!==e&&(i.setAttribute("http.route",n),i.updateName(t))}else e.updateName(`${H} ${f}`)}),o=async i=>{var s,o;let l=async({previousCacheEntry:r})=>{try{if(!J&&S&&P&&!r)return t.statusCode=404,t.setHeader("x-nextjs-cache","REVALIDATED"),t.end("This page could not be found"),null;let s=await a(i);e.fetchMetrics=G.renderOpts.fetchMetrics;let o=G.renderOpts.pendingWaitUntil;o&&n.waitUntil&&(n.waitUntil(o),o=void 0);let l=G.renderOpts.collectedTags;if(!j)return await (0,p.sendResponse)(W,Y,s,G.renderOpts.pendingWaitUntil),null;{let e=await s.blob(),t=(0,h.toNodeOutgoingHttpHeaders)(s.headers);l&&(t[m.NEXT_CACHE_TAGS_HEADER]=l),!t["content-type"]&&e.type&&(t["content-type"]=e.type);let r=void 0!==G.renderOpts.collectedRevalidate&&!(G.renderOpts.collectedRevalidate>=m.INFINITE_CACHE)&&G.renderOpts.collectedRevalidate,n=void 0===G.renderOpts.collectedExpire||G.renderOpts.collectedExpire>=m.INFINITE_CACHE?void 0:G.renderOpts.collectedExpire;return{value:{kind:_.CachedRouteKind.APP_ROUTE,status:s.status,body:Buffer.from(await e.arrayBuffer()),headers:t},cacheControl:{revalidate:r,expire:n}}}}catch(t){throw(null==r?void 0:r.isStale)&&await E.onRequestError(e,t,{routerKind:"App Router",routePath:f,routeType:"route",revalidateReason:(0,d.getRevalidateReason)({isStaticGeneration:$,isOnDemandRevalidate:S})},!1,C),t}},c=await E.handleResponse({req:e,nextConfig:A,cacheKey:D,routeKind:r.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:b,isRoutePPREnabled:!1,isOnDemandRevalidate:S,revalidateOnlyGenerated:P,responseGenerator:l,waitUntil:n.waitUntil,isMinimalMode:J});if(!j)return null;if((null==c||null==(s=c.value)?void 0:s.kind)!==_.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==c||null==(o=c.value)?void 0:o.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});J||t.setHeader("x-nextjs-cache",S?"REVALIDATED":c.isMiss?"MISS":c.isStale?"STALE":"HIT"),I&&t.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let u=(0,h.fromNodeOutgoingHttpHeaders)(c.value.headers);return J&&j||u.delete(m.NEXT_CACHE_TAGS_HEADER),!c.cacheControl||t.getHeader("Cache-Control")||u.get("Cache-Control")||u.set("Cache-Control",(0,g.getCacheControlHeader)(c.cacheControl)),await (0,p.sendResponse)(W,Y,new Response(c.value.body,{headers:u,status:c.value.status||200})),null};F&&B?await o(B):(i=K.getActiveScopeSpan(),await K.withPropagatedContext(e.headers,()=>K.trace(u.BaseServerSpan.handleRequest,{spanName:`${H} ${f}`,kind:s.SpanKind.SERVER,attributes:{"http.method":H,"http.target":e.url}},o),void 0,!F))}catch(t){if(t instanceof v.NoFallbackError||await E.onRequestError(e,t,{routerKind:"App Router",routePath:M,routeType:"route",revalidateReason:(0,d.getRevalidateReason)({isStaticGeneration:$,isOnDemandRevalidate:S})},!1,C),j)throw t;return await (0,p.sendResponse)(W,Y,new Response(null,{status:500})),null}}e.s(["handler",0,C,"patchFetch",0,function(){return(0,n.patchFetch)({workAsyncStorage:k,workUnitAsyncStorage:I})},"routeModule",0,E,"serverHooks",0,b,"workAsyncStorage",0,k,"workUnitAsyncStorage",0,I],11709)}];

//# sourceMappingURL=%5Broot-of-the-server%5D__09l62cm._.js.map