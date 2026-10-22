import {useEffect,useRef} from 'react';
import * as THREE from 'three';
export default function Scene({small=false}:{small?:boolean}){
 const host=useRef<HTMLDivElement>(null);
 useEffect(()=>{
 const el=host.current!;let renderer:THREE.WebGLRenderer;
 try{renderer=new THREE.WebGLRenderer({alpha:true,antialias:true});}catch{el.dataset.fallback='true';return;}
 renderer.setPixelRatio(Math.min(devicePixelRatio,2));el.appendChild(renderer.domElement);
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(38,1,.1,100);camera.position.set(0,0,9);
 scene.add(new THREE.AmbientLight('#bde2d8',2));const light=new THREE.PointLight('#c7ff6c',45);light.position.set(3,4,4);scene.add(light);
 const rim=new THREE.PointLight('#618bff',30);rim.position.set(-4,-2,2);scene.add(rim);
 const group=new THREE.Group();scene.add(group);
 const core=new THREE.Mesh(new THREE.IcosahedronGeometry(1.42,1),new THREE.MeshStandardMaterial({color:'#bedf91',metalness:.65,roughness:.24,flatShading:true}));group.add(core);
 for(let i=0;i<3;i++){const ring=new THREE.Mesh(new THREE.TorusGeometry(2.05+i*.25,.025,12,160),new THREE.MeshStandardMaterial({color:i===1?'#c7ff6c':'#90a8a0',emissive:i===1?'#5c8b1f':'#102421',emissiveIntensity:.5,metalness:.6,roughness:.2}));ring.rotation.set(.65+i*.6,.3+i*.8,.3);group.add(ring);}
 const satellites=new THREE.Group();group.add(satellites);
 for(let i=0;i<16;i++){const dot=new THREE.Mesh(new THREE.OctahedronGeometry(i%3===0?.11:.035),new THREE.MeshStandardMaterial({color:'#d1ff99',emissive:'#3a6b26'}));const angle=i/16*Math.PI*2;dot.position.set(Math.cos(angle)*3,Math.sin(angle)*2.2,Math.sin(i)*.8);satellites.add(dot);}
 let pointer={x:0,y:0};const move=(e:PointerEvent)=>{const r=el.getBoundingClientRect();pointer={x:(e.clientX-r.left)/r.width-.5,y:(e.clientY-r.top)/r.height-.5};};el.addEventListener('pointermove',move);
 const resize=new ResizeObserver(()=>{const {width,height}=el.getBoundingClientRect();renderer.setSize(width,height);camera.aspect=width/height;camera.updateProjectionMatrix();});resize.observe(el);
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;let frame=0;const clock=new THREE.Clock();
 function draw(){const t=clock.getElapsedTime();if(!reduced){core.rotation.set(t*.12,t*.21,.2);group.rotation.y=pointer.x*.5;group.rotation.x=pointer.y*.3;group.position.y=Math.sin(t*.6)*.12;satellites.rotation.z=t*.04;}renderer.render(scene,camera);frame=requestAnimationFrame(draw);}draw();
 return()=>{cancelAnimationFrame(frame);resize.disconnect();el.removeEventListener('pointermove',move);scene.traverse(o=>{if(o instanceof THREE.Mesh){o.geometry.dispose();(o.material as THREE.Material).dispose();}});renderer.dispose();renderer.domElement.remove();};
 },[]);
 return <div className={'scene '+(small?'small':'')} ref={host} aria-label="Animated 3D orbital sculpture"><div className="scene-fallback">◈</div></div>;
}
