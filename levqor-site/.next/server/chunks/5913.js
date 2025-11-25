"use strict";exports.id=5913,exports.ids=[5913],exports.modules={50601:(e,t,r)=>{r.d(t,{default:()=>o});var a=r(10326),n=r(49937),s=r(15442),l=r(46066);function o({className:e}){let{state:t}=(0,s.useLevqorBrain)();return(0,a.jsxs)("div",{className:`relative ${e||""}`,children:[a.jsx(n.default,{brainState:t,className:"w-full h-full"}),(0,a.jsxs)("div",{className:"absolute bottom-2 left-2 text-xs text-white/70 bg-black/20 px-2 py-0.5 rounded",children:["Brain: ",t.charAt(0).toUpperCase()+t.slice(1)]}),a.jsx("div",{className:"absolute top-2 right-2",children:a.jsx(l.default,{})})]})}},52995:(e,t,r)=>{r.d(t,{default:()=>u});var a=r(10326),n=r(90434),s=r(17577),l=r(15442),o=r(36710);function u({primaryHref:e,primaryText:t,secondaryHref:r,secondaryText:u,className:c=""}){let i=(0,l.useLevqorBrainOptional)(),f=(0,s.useRef)(null),d=(0,s.useCallback)(()=>{if(i){let e=(0,o.L2)({currentState:i.state,uiEvent:"hover_primary_cta"});i.setState(e)}},[i]),m=(0,s.useCallback)(()=>{if(i){f.current&&clearTimeout(f.current);let e=(0,o.L2)({currentState:i.state,uiEvent:"idle"});i.setState(e)}},[i]),v=(0,s.useCallback)(()=>{if(i){f.current&&clearTimeout(f.current);let e=(0,o.L2)({currentState:i.state,uiEvent:"click_primary_cta"});i.setState(e);let t=(0,o.dS)(e);t>0&&(f.current=setTimeout(()=>{i.setOrganic()},t))}},[i]),h=(0,s.useCallback)(()=>{if(i){let e=(0,o.L2)({currentState:i.state,uiEvent:"hover_secondary_cta"});i.setState(e)}},[i]),g=(0,s.useCallback)(()=>{if(i){let e=(0,o.L2)({currentState:i.state,uiEvent:"idle"});i.setState(e)}},[i]);return(0,a.jsxs)("div",{className:`flex flex-col sm:flex-row gap-4 justify-center lg:justify-start ${c}`,children:[(0,a.jsxs)(n.default,{href:e,className:"group px-8 py-4 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-xl font-semibold hover:from-primary-700 hover:to-secondary-700 transition-all text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5",onMouseEnter:d,onMouseLeave:m,onClick:v,onFocus:d,onBlur:m,children:[t,a.jsx("svg",{className:"inline-block w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:a.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M13 7l5 5m0 0l-5 5m5-5H6"})})]}),a.jsx(n.default,{href:r,className:"group px-8 py-4 border-2 border-neutral-800 text-neutral-900 rounded-xl font-semibold hover:bg-neutral-800 hover:text-white transition-all text-lg",onMouseEnter:h,onMouseLeave:g,onFocus:h,onBlur:g,children:u})]})}},49937:(e,t,r)=>{r.d(t,{default:()=>f});var a=r(10326),n=r(17577),s=r(29930),l=r(85833);let o=`
  attribute vec2 a_position;
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`,u=`
  precision mediump float;
  uniform float u_time;
  uniform vec2 u_resolution;
  uniform vec3 u_color1;
  uniform vec3 u_color2;
  uniform vec3 u_color3;
  uniform float u_state;
  uniform float u_sound;

  float noise(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
  }

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution;
    float soundMod = 1.0 + u_sound * 0.3;
    float t = u_time * 0.5 * soundMod;
    
    // Base waves (shared across all states)
    float wave1 = sin(uv.x * 3.0 + t) * 0.5 + 0.5;
    float wave2 = sin(uv.y * 2.0 - t * 0.7) * 0.5 + 0.5;
    float wave3 = sin((uv.x + uv.y) * 4.0 + t * 1.3) * 0.5 + 0.5;
    float baseBlend = (wave1 + wave2 + wave3) / 3.0;
    
    // State-specific effects
    // u_state: 0=organic, 0.25=neural, 0.5=quantum, 0.75=success, 1.0=error
    
    float effectStrength = 0.0;
    float pulseEffect = 0.0;
    float noiseEffect = 0.0;
    float gridEffect = 0.0;
    float flashOverlay = 0.0;
    vec3 flashColor = vec3(0.0);
    
    // ORGANIC (u_state ~0): Soft breathing, slow motion
    if (u_state < 0.125) {
      float breathe = sin(t * 0.3) * 0.5 + 0.5;
      effectStrength = 0.3 + breathe * 0.1;
    }
    // NEURAL (u_state ~0.25): Pulse lines, node flickers
    else if (u_state < 0.375) {
      float pulse = sin(t * 2.0 + uv.y * 20.0) * 0.5 + 0.5;
      float grid = step(0.95, fract(uv.x * 10.0 + t * 0.5)) + step(0.95, fract(uv.y * 10.0 - t * 0.3));
      pulseEffect = pulse * 0.15;
      gridEffect = grid * 0.08;
      effectStrength = 0.5;
    }
    // QUANTUM (u_state ~0.5): Shimmer, noise distortion
    else if (u_state < 0.625) {
      float shimmer = noise(uv * 50.0 + t * 3.0) * 0.2;
      float interference = sin(uv.x * 40.0 + t * 5.0) * sin(uv.y * 40.0 - t * 3.0) * 0.1;
      noiseEffect = shimmer + interference;
      effectStrength = 0.6;
    }
    // SUCCESS (u_state ~0.75): Green tint pulse
    else if (u_state < 0.875) {
      float successPulse = sin(t * 4.0) * 0.5 + 0.5;
      flashOverlay = 0.2 * successPulse;
      flashColor = vec3(0.13, 0.77, 0.37);
      effectStrength = 0.5;
    }
    // ERROR (u_state ~1.0): Red warning flash
    else {
      float errorFlash = abs(sin(t * 6.0));
      flashOverlay = 0.25 * errorFlash;
      flashColor = vec3(0.94, 0.27, 0.27);
      effectStrength = 0.5;
    }
    
    // Apply base blend with effect strength
    float blend = baseBlend * effectStrength + (1.0 - effectStrength) * 0.5;
    blend += pulseEffect + noiseEffect + gridEffect;
    blend = clamp(blend, 0.0, 1.0);
    
    // Color mixing
    vec3 color = mix(u_color1, u_color2, blend);
    color = mix(color, u_color3, wave3 * 0.3 + u_sound * 0.1);
    
    // Apply flash overlay for success/error
    color = mix(color, flashColor, flashOverlay);
    
    // Gradient and sound modulation
    float gradient = 1.0 - uv.y * 0.3;
    color *= gradient;
    color = color * (1.0 + u_sound * 0.1);
    
    gl_FragColor = vec4(color, 1.0);
  }
`;function c({canvasRef:e,brainState:t,reducedMotion:r,soundIntensity:a=0}){(0,n.useRef)(null),(0,n.useRef)(null),(0,n.useRef)(0),(0,n.useRef)(Date.now()),(0,n.useRef)(a);let s=(0,n.useCallback)((e,t,r)=>{let a=e.createShader(t);return a?(e.shaderSource(a,r),e.compileShader(a),e.getShaderParameter(a,e.COMPILE_STATUS))?a:(console.warn("Shader compile error:",e.getShaderInfoLog(a)),e.deleteShader(a),null):null},[]);return(0,n.useCallback)(e=>{let t=s(e,e.VERTEX_SHADER,o),r=s(e,e.FRAGMENT_SHADER,u);if(!t||!r)return null;let a=e.createProgram();return a?(e.attachShader(a,t),e.attachShader(a,r),e.linkProgram(a),e.getProgramParameter(a,e.LINK_STATUS))?a:(console.warn("Program link error:",e.getProgramInfoLog(a)),e.deleteProgram(a),null):null},[s]),null}function i({canvasRef:e,brainState:t,reducedMotion:r}){return(0,n.useRef)(0),(0,n.useRef)(Date.now()),null}function f({brainState:e,className:t="",soundIntensity:r}){let o=(0,n.useRef)(null),[u,f]=(0,n.useState)(null),[d,m]=(0,n.useState)(!1),[v,h]=(0,n.useState)(()=>!0),g=(0,l.useSoundIntensity)();if(!v){let r=s.v[e];return a.jsx("div",{className:`bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center ${t}`,role:"img","aria-label":`Levqor Brain visualization placeholder - ${r.label} state`,children:(0,a.jsxs)("div",{className:"text-center text-neutral-500 p-4",children:[a.jsx("div",{className:"text-2xl mb-2",children:"\uD83E\uDDE0"}),a.jsx("p",{className:"text-sm font-medium",children:"Levqor Brain"}),(0,a.jsxs)("p",{className:"text-xs",children:[r.label," mode"]})]})})}if(null===u)return a.jsx("div",{className:`bg-gradient-to-br from-primary-100 to-secondary-100 animate-pulse ${t}`,role:"img","aria-label":"Loading Levqor Brain visualization"});let b=s.v[e];return(0,a.jsxs)("div",{className:`relative overflow-hidden ${t}`,role:"img","aria-label":`Levqor Brain visualization in ${b.label} state: ${b.description}`,children:[a.jsx("canvas",{ref:o,className:"w-full h-full",style:{display:"block"}}),u?a.jsx(c,{canvasRef:o,brainState:e,reducedMotion:d,soundIntensity:r??g}):a.jsx(i,{canvasRef:o,brainState:e,reducedMotion:d}),d&&a.jsx("div",{className:"absolute bottom-2 right-2 text-xs text-white/50 bg-black/20 px-2 py-1 rounded",children:"Motion reduced"})]})}},15442:(e,t,r)=>{r.d(t,{LevqorBrainProvider:()=>l,useLevqorBrain:()=>o,useLevqorBrainOptional:()=>u});var a=r(10326),n=r(17577);let s=(0,n.createContext)(null);function l({children:e,initialState:t="organic"}){let[r,l]=(0,n.useState)(t),o=(0,n.useCallback)(e=>{l(e)},[]),u=(0,n.useCallback)(()=>l("organic"),[]),c=(0,n.useCallback)(()=>l("neural"),[]),i=(0,n.useCallback)(()=>l("quantum"),[]),f=(0,n.useCallback)(()=>l("success"),[]),d=(0,n.useCallback)(()=>l("error"),[]),m=(0,n.useMemo)(()=>({state:r,setState:o,setOrganic:u,setNeural:c,setQuantum:i,setSuccess:f,setError:d}),[r,o,u,c,i,f,d]);return a.jsx(s.Provider,{value:m,children:e})}function o(){let e=(0,n.useContext)(s);if(!e)throw Error("useLevqorBrain must be used within a LevqorBrainProvider");return e}function u(){return(0,n.useContext)(s)}},46066:(e,t,r)=>{r.d(t,{default:()=>c});var a=r(10326),n=r(17577),s=r(15442),l=r(36710);let o=["organic","neural","quantum","success","error","organic"],u={organic:"Calm",neural:"Thinking",quantum:"Processing",success:"Success",error:"Error"};function c(){let e=(0,s.useLevqorBrainOptional)(),[t,r]=(0,n.useState)(0),[c,i]=(0,n.useState)(!1),f=(0,n.useRef)(null),d=(0,n.useCallback)(()=>{if(!e||c)return;i(!0);let t=0,a=()=>{if(t>=o.length){i(!1),r(0);return}let n=(0,l.L2)({currentState:e.state,uiEvent:"test_cycle"});e.setState(n),r(t),t++,f.current=setTimeout(a,800)};a()},[e,c]),m=(0,n.useCallback)(()=>{f.current&&(clearTimeout(f.current),f.current=null),i(!1),r(0),e&&e.setState((0,l.mg)())},[e]);return e?(0,a.jsxs)("div",{className:"inline-flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2",children:[a.jsx("span",{className:"text-xs text-yellow-700 font-medium",children:"Dev:"}),a.jsx("button",{onClick:c?m:d,disabled:!1,className:`text-xs px-3 py-1.5 rounded font-medium transition-colors ${c?"bg-yellow-500 text-white hover:bg-yellow-600":"bg-yellow-100 text-yellow-800 hover:bg-yellow-200"}`,children:c?`${u[o[t]]}...`:"Test Brain"}),c&&a.jsx("button",{onClick:m,className:"text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors",children:"Stop"})]}):null}},36710:(e,t,r)=>{r.d(t,{L2:()=>n,dS:()=>l,mg:()=>s});let a=["organic","neural","quantum","success","error"];function n(e){let{currentState:t,uiEvent:r,intensity:n=0}=e;switch(r){case"idle":return"organic";case"hover_primary_cta":case"dashboard_action_start":return"neural";case"click_primary_cta":case"dashboard_action_success":return"success";case"hover_secondary_cta":return"quantum";case"dashboard_action_error":return"error";case"test_cycle":{let e=(a.indexOf(t)+1)%a.length;return a[e]}default:if(n>.7&&"error"!==t&&"success"!==t)return"quantum";return t}}function s(){return"organic"}function l(e){return"success"===e?1500:"error"===e?2e3:0}},75913:(e,t,r)=>{r.d(t,{FU:()=>s.LevqorBrainProvider,Ub:()=>n.default,_b:()=>a.default,sD:()=>s.useLevqorBrain});var a=r(49937);r(50601);var n=r(52995);r(46066),r(87601),r(85833),r(29930);var s=r(15442)},29930:(e,t,r)=>{r.d(t,{v:()=>a});let a={organic:{state:"organic",label:"Organic",description:"Calm, breathing state - the Brain at rest",colors:{primary:"#3b82f6",secondary:"#60a5fa",accent:"#93c5fd"}},neural:{state:"neural",label:"Neural",description:"Reasoning state - the Brain is thinking",colors:{primary:"#9333ea",secondary:"#a855f7",accent:"#c084fc"}},quantum:{state:"quantum",label:"Quantum",description:"Creative state - the Brain is generating",colors:{primary:"#06b6d4",secondary:"#22d3ee",accent:"#67e8f9"}},success:{state:"success",label:"Success",description:"Completion state - the Brain succeeded",colors:{primary:"#22c55e",secondary:"#4ade80",accent:"#86efac"}},error:{state:"error",label:"Error",description:"Alert state - the Brain encountered an issue",colors:{primary:"#ef4444",secondary:"#f87171",accent:"#fca5a5"}}}},87601:(e,t,r)=>{r.d(t,{useBrainState:()=>s});var a=r(17577),n=r(29930);function s(e="organic"){let[t,r]=(0,a.useState)(e),s=(0,a.useCallback)(e=>{r(e)},[]),l=(0,a.useCallback)(()=>{r(e=>{switch(e){case"organic":return"neural";case"neural":return"quantum";case"quantum":return"success";case"success":return"error";default:return"organic"}})},[]);return{state:t,setState:s,config:n.v[t],cycleState:l}}},85833:(e,t,r)=>{r.d(t,{useSoundIntensity:()=>n});var a=r(17577);function n(){let[e,t]=(0,a.useState)(0),r=(0,a.useRef)(null),n=(0,a.useRef)(null),s=(0,a.useRef)(null),l=(0,a.useRef)(0),o=(0,a.useRef)(null),[u,c]=(0,a.useState)(!1),[i,f]=(0,a.useState)(!1),d=(0,a.useCallback)(e=>{let t=0;for(let r=0;r<e.length;r++){let a=(e[r]-128)/128;t+=a*a}return Math.min(1,2*Math.sqrt(t/e.length))},[]);return((0,a.useCallback)(()=>{if(!n.current||!o.current)return;let e=()=>{n.current&&o.current&&(n.current.getByteTimeDomainData(o.current),t(d(o.current)),l.current=requestAnimationFrame(e))};e()},[d]),(0,a.useCallback)(()=>{cancelAnimationFrame(l.current),s.current&&(s.current.getTracks().forEach(e=>e.stop()),s.current=null),r.current&&"closed"!==r.current.state&&(r.current.close(),r.current=null),n.current=null,o.current=null,t(0),f(!1)},[]),u&&i)?e:0}}};