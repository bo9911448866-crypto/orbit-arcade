declare module '@mercuryworkshop/wisp-js/server' {
 import type {IncomingMessage} from 'node:http';import type {Duplex} from 'node:stream';
 export const server:{options:{allow_private_ips:boolean;allow_loopback_ips:boolean;allow_udp_streams:boolean;port_whitelist:number[];stream_limit_total:number};routeRequest:(req:IncomingMessage,socket:Duplex,head:Buffer)=>void};
}
declare module '@mercuryworkshop/epoxy-transport' {export const epoxyPath:string;}
