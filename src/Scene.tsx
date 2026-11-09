import {useEffect,useRef} from 'react';
import {mountOrbitScene} from './orbit-scene';
export default function Scene({small=false}:{small?:boolean}){
 const host=useRef<HTMLDivElement>(null);
 useEffect(()=>mountOrbitScene(host.current!),[]);
 return <div className={'scene '+(small?'small':'')} ref={host} aria-label="Animated 3D orbital sculpture"><div className="scene-fallback">◈</div></div>;
}
