import {readFileSync,writeFileSync} from 'node:fs';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import * as icons from 'lucide-react';

const source=readFileSync('src/main.tsx','utf8');
const iconNames=source.match(/import \{([^}]+)\} from 'lucide-react'/)[1].split(',');
const iconDefinitions=iconNames.filter(n=>!['VolumeX','Volume2'].includes(n)).map(name=>{
 const markup=renderToStaticMarkup(createElement(icons[name],{size:24})).replace(/<svg[^>]*>/,'').replace('</svg>','');
 return 'const '+name+'=icon(<>'+markup+'</>);';
}).join('\n');
let app=source.slice(source.indexOf('type Game='),source.indexOf('createRoot(document.getElementById'));
app=app.replace(/^declare global.*\n/m,'').replace('function App(){','function Arcade({backend}:{backend:string}){')
 .replace("useState(()=>new URLSearchParams(location.search).get('view')==='proxy'?'Web proxy':'Discover')","useState('Discover')")
 .replace("fetch('/api/games')","fetch(backend+'/api/games',{credentials:'omit'})").replace("setGames((await r.json()).games);","const data=await r.json();if(!Array.isArray(data.games))throw Error();setGames(data.games);")
 .replace("return()=>window.removeEventListener('keydown',key);},[]);","return()=>window.removeEventListener('keydown',key);},[backend]);")
 .replace("[address,setAddress]=useState(''),[proxyBusy,setProxyBusy]=useState(false),[proxyError,setProxyError]=useState(''),[muted,setMuted]=useState(false),","")
 .replace("url:'/games/'","url:backend+'/games/'")
 .replace(/ async function proxy[\s\S]*?\n return <>/, ' return <div className="orbit-app"><SceneContext.Provider value={backend}>')
 .replace(/<form onSubmit=\{proxy\}[\s\S]*?<div className="proxy-info">/,'<a className="primary proxy-launch" href={backend+"/?view=proxy"} target="_blank" rel="noopener noreferrer">Open web proxy <ArrowUpRight size={18}/></a><div className="proxy-info">')
 .replace('Search with DuckDuckGo or open a website through your Ultraviolet connection.','Open the proxy in its own tab, then use DuckDuckGo or enter a website address.')
 .replace(/<button className="icon-button" aria-label=\{muted[\s\S]*?<\/button>/,'')
 .replace("{muted?'Mute applies to supported HTML audio and video. ':''}",'')
 .replace('<AudioControl muted={muted} frameKey={frameKey} loading={frameLoading}/>','')
 .replace(/function AudioControl[^\n]+\n/,'')
 .replace('</>;\n}', '</SceneContext.Provider></div>;\n}')
 .replace("src={game.cover}", "src={useContextCover+game.cover}")
 .replace(" const [failed,setFailed]", " const useContextCover=useContext(SceneContext);\n const [failed,setFailed]")
 .replace("if(e.key==='Escape')setActive(null);", "if(e.key==='Escape'){setActive(null);setMenu(false);setSettings(false);}")
 .replace("ref={searchRef} value={search}",'ref={searchRef} aria-label="Search games" value={search}')
 .replace('rel="noreferrer">MonkeyGG2', 'rel="noopener noreferrer">MonkeyGG2')
 .replace('title={active.name} src=', 'title={active.name} referrerPolicy="strict-origin-when-cross-origin" src=');
const css=readFileSync('src/style.css','utf8');
const line=css.indexOf('\n');
const scopedCss=css.slice(0,line)+'\n.orbit-shell{min-height:100dvh;font-family:DM Sans,system-ui,sans-serif;color:#eee;background:#111315;font-synthesis:none;--lime:#c9f887;--muted:#878d89;--border:#2a2e2b}\n@scope (.orbit-shell){\n'+css.slice(line+1).replace(/^:root\{[^}]+\}/,'').replace('body{margin:0}','')+'\n.proxy-launch{margin:20px 0}.scene[data-fallback=true] .scene-fallback{line-height:1}.scene.small[data-fallback=true] .scene-fallback{font-size:40px}.entry-touch{display:none}@media(pointer:coarse){.entry-touch{display:inline-block;font:16px system-ui;padding:10px 15px;border:1px solid #888;border-radius:5px}}\n}';
const prelude=`import React,{createContext,Suspense,useContext,useEffect,useRef,useState} from 'react';
import {addPropertyControls,ControlType,RenderTarget} from 'framer';
type IconProps={size?:number;fill?:string};
function icon(shape:React.ReactNode){return function Icon({size=24,fill='none'}:IconProps){return <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{shape}</svg>;};}
const SceneContext=createContext('https://orbit-arcade.onrender.com');
type SceneModule={mountOrbitScene:(el:HTMLDivElement)=>(()=>void)|undefined};
const scenes=new Map<string,Promise<SceneModule>>();
function Scene({small=false}:{small?:boolean}){
 const backend=useContext(SceneContext),host=useRef<HTMLDivElement>(null);
 useEffect(()=>{
  let disposed=false,cleanup:(()=>void)|undefined;
  const url=backend+'/arcade-assets/orbit-scene.mjs';
  let scene=scenes.get(url);
  if(!scene){scene=import(/* @vite-ignore */ url) as Promise<SceneModule>;scenes.set(url,scene);void scene.catch(()=>scenes.delete(url));}
  void scene.then(module=>{if(!disposed&&host.current)cleanup=module.mountOrbitScene(host.current);}).catch(()=>{});
  return()=>{disposed=true;cleanup?.();};
 },[backend]);
 return <div className={'scene '+(small?'small':'')} ref={host} data-fallback="true" aria-hidden="true"><div className="scene-fallback">◈</div></div>;
}
interface OrbitProps { backend?:string; style?:React.CSSProperties }
/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight auto
 */
export default function OrbitArcade({backend='https://orbit-arcade.onrender.com',style}:OrbitProps){
 const [open,setOpen]=useState(false);
 const canvas=RenderTarget.current()===RenderTarget.canvas;
 useEffect(()=>{
  if(open||canvas)return;
  const unlock=(e:KeyboardEvent)=>{if(e.key.toLowerCase()==='o'&&!e.ctrlKey&&!e.altKey&&!e.metaKey){e.preventDefault();setOpen(true);}};
  window.addEventListener('keydown',unlock);
  return()=>window.removeEventListener('keydown',unlock);
 },[open,canvas]);
 const root=backend.trim().replace(/\\/+$/,'')||'https://orbit-arcade.onrender.com';
 return <div className="orbit-shell" style={style}><style>{ORBIT_CSS}</style>{open||canvas?<Arcade backend={root}/>:<div className="entry-error"><h1>404 Not Found</h1><hr/><p>nginx</p><button className="entry-touch" aria-label="Open ORBIT Arcade" onClick={()=>setOpen(true)}>O</button></div>}</div>;
}
addPropertyControls(OrbitArcade,{backend:{type:ControlType.String,title:'Render URL',defaultValue:'https://orbit-arcade.onrender.com'}});
`;
writeFileSync('framer/OrbitArcade.tsx',prelude+'\n'+iconDefinitions+'\n'+app+'\nconst ORBIT_CSS='+JSON.stringify(scopedCss)+';\n');
