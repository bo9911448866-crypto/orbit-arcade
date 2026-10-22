import {useEffect,useState,type ReactNode} from 'react';

/** A visual entrance screen, reset on each page load. */
export default function EntryGate({children}:{children:ReactNode}){
 const [open,setOpen]=useState(false);
 useEffect(()=>{
  if(open){document.title='ORBIT — Leave ordinary behind';document.querySelector<HTMLLinkElement>('link[rel="icon"]')?.setAttribute('href','/favicon.svg');return;}
  document.title='404 Not Found';
  const unlock=(event:KeyboardEvent)=>{
   if(event.key.toLowerCase()==='o'&&!event.ctrlKey&&!event.altKey&&!event.metaKey){
    event.preventDefault();setOpen(true);
   }
  };
  window.addEventListener('keydown',unlock);
  return()=>window.removeEventListener('keydown',unlock);
 },[open]);
 if(open)return children;
 return <div className="entry-error"><h1>404 Not Found</h1><hr/><p>nginx</p></div>;
}
