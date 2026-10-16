'use strict';
(() => {
const $=id=>document.getElementById(id), canvas=$('game');
const gl=canvas.getContext('webgl',{antialias:true,alpha:false});
if(!gl){$('error').textContent='WebGL is unavailable. Open this game in a desktop browser with hardware acceleration enabled.';return;}
const V=(x=0,y=0,z=0)=>[x,y,z],add=(a,b)=>a.map((v,i)=>v+b[i]),sub=(a,b)=>a.map((v,i)=>v-b[i]),mul=(a,s)=>a.map(v=>v*s),dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0),len=a=>Math.hypot(...a),norm=a=>mul(a,1/(len(a)||1)),cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),lerp=(a,b,t)=>a+(b-a)*t,rand=(a,b)=>a+Math.random()*(b-a);
const I=()=>[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1];
function mm(a,b){const o=Array(16).fill(0);for(let c=0;c<4;c++)for(let r=0;r<4;r++)for(let k=0;k<4;k++)o[c*4+r]+=a[k*4+r]*b[c*4+k];return o;}
function model(p,s,r=0){let c=Math.cos(r),q=Math.sin(r);return[c*s[0],0,-q*s[0],0,0,s[1],0,0,q*s[2],0,c*s[2],0,...p,1];}
function perspective(fov,aspect){let f=1/Math.tan(fov/2),near=.045,far=150;return[f/aspect,0,0,0,0,f,0,0,0,0,(far+near)/(near-far),-1,0,0,2*far*near/(near-far),0];}
function look(eye,target){let z=norm(sub(eye,target)),x=norm(cross([0,1,0],z)),y=cross(z,x);return[x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,-dot(x,eye),-dot(y,eye),-dot(z,eye),1];}
function shader(type,src){let s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;}
const prog=gl.createProgram();
gl.attachShader(prog,shader(gl.VERTEX_SHADER,`attribute vec3 aP,aN,aC;uniform mat4 uM,uVP,uLightVP;varying vec3 vP,vN,vC,vLocal;varying vec4 vShadow;void main(){vec4 p=uM*vec4(aP,1.);vP=p.xyz;vN=normalize(mat3(cross(uM[1].xyz,uM[2].xyz),cross(uM[2].xyz,uM[0].xyz),cross(uM[0].xyz,uM[1].xyz))*aN);vLocal=aP;vC=aC;vShadow=uLightVP*p;gl_Position=uVP*p;}`));
gl.attachShader(prog,shader(gl.FRAGMENT_SHADER,`precision highp float;
varying vec3 vP,vN,vC,vLocal;varying vec4 vShadow;
uniform vec3 uTint,uEye,uFlashPos;uniform float uFog,uDepthPass,uShadowOn,uFlash,uMaterial,uOpacity,uSurface;uniform sampler2D uShadowMap;
vec4 packDepth(float d){vec4 c=fract(d*vec4(16777216.,65536.,256.,1.));return c-c.xxyz*vec4(0.,1./256.,1./256.,1./256.);}
float unpackDepth(vec4 c){return dot(c,vec4(1./16777216.,1./65536.,1./256.,1.));}
float hash(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}
float grain(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);}
vec3 film(vec3 x){return clamp((x*(2.51*x+.03))/(x*(2.43*x+.59)+.14),0.,1.);}
void main(){if(uDepthPass>.5){gl_FragColor=packDepth(gl_FragCoord.z);return;}
 vec3 n=normalize(vN),sun=normalize(vec3(-.65,1.,.4)),view=normalize(uEye-vP),halfway=normalize(sun+view),base=vC*uTint;
 float surface=uSurface,metal=0.,rough=.86,detail=hash(floor(vLocal*180.));
 if(surface>.5&&surface<1.5){metal=.86;rough=.29;base*=.91+.13*detail;float brushed=sin(vLocal.y*2400.+sin(vLocal.z*310.)*.5)*.5+.5;rough+=brushed*.08;}
 else if(surface>1.5&&surface<2.5){rough=.97;float weave=sin(vLocal.x*780.)*sin(vLocal.y*780.);base*=.93+.065*weave;}
 else if(surface>2.5&&surface<3.5){rough=.85;base*=.91+.12*detail;}
 else if(surface>3.5&&surface<4.5){rough=.63;base*=.94+.08*detail;}
 else if(surface>4.5&&surface<5.5){metal=.55;rough=.1;}
 else if(surface>6.5&&surface<7.5){rough=.55;float wood=sin(vLocal.y*240.+grain(vLocal*18.)*12.);base*=.82+.18*wood;}
 else if(surface>7.5){metal=.32;rough=.48;base*=.94+.08*detail;}
 else {float weather=grain(vLocal*2.1);base*=.86+.18*weather;rough=.82;if(vP.y<.07&&n.y>.8&&uFog>.5){float fine=hash(floor(vP*110.));base*=.88+.22*fine;vec2 joint=abs(fract(vP.xz*.25)-.5);float seam=max(step(.495,joint.x),step(.495,joint.y));base*=1.-seam*.27;float damp=smoothstep(.61,.76,grain(vec3(vP.x*.7,0.,vP.z*.7)));rough=mix(.91,.35,damp);base*=1.-damp*.18;}}
 float nl=max(0.,dot(n,sun)),nv=max(.001,dot(n,view)),nh=max(0.,dot(n,halfway)),vh=max(0.,dot(view,halfway)),shade=1.;vec3 sc=vShadow.xyz/vShadow.w*.5+.5;
 if(uShadowOn>.5&&uFog>.5&&sc.x>0.&&sc.x<1.&&sc.y>0.&&sc.y<1.&&sc.z<1.){shade=0.;float bias=max(.00055,.0016*(1.-nl));for(int x=-1;x<=1;x++)for(int y=-1;y<=1;y++){float depth=unpackDepth(texture2D(uShadowMap,sc.xy+vec2(float(x),float(y))/1536.));shade+=(sc.z-bias<=depth?1.:.16)/9.;}}
 float a=rough*rough,a2=a*a,den=nh*nh*(a2-1.)+1.,D=a2/(3.14159*den*den+.0001),k=(rough+1.)*(rough+1.)/8.,G=(nv/(nv*(1.-k)+k))*(nl/(nl*(1.-k)+k));
 vec3 f0=mix(vec3(.04),base,metal),F=f0+(1.-f0)*pow(1.-vh,5.),spec=D*G*F/(4.*nv*max(nl,.001)+.001);
 vec3 diffuse=base*(1.-metal)*(1.-F),ambient=mix(vec3(.12,.15,.19),vec3(.42,.50,.59),n.y*.5+.5);
 vec3 color=diffuse*ambient+(diffuse+spec)*vec3(1.9,1.65,1.25)*nl*shade;
 vec3 reflection=reflect(-view,n),environment=mix(vec3(.18,.20,.19),vec3(.53,.68,.82),clamp(reflection.y*.5+.5,0.,1.));
 color+=environment*(f0+(1.-f0)*pow(1.-nv,5.))*(1.-rough*.65)*.48;
 color+=base*vec3(.20,.29,.37)*pow(max(0.,dot(n,normalize(vec3(.6,.2,-1.)))),2.);
 color+=base*vec3(1.,.48,.12)*uFlash*max(0.,dot(n,normalize(uFlashPos-vP)))/(1.+dot(uFlashPos-vP,uFlashPos-vP)*.5);
 if(surface>5.5&&surface<6.5)color=base*2.2;
 float fog=(1.-exp(-length(vP-uEye)*.009))*uFog;vec3 sky=mix(vec3(.43,.53,.62),vec3(.68,.62,.49),pow(max(0.,dot(normalize(vP-uEye),sun)),8.));color=mix(color,sky,fog);
 gl_FragColor=vec4(pow(film(color),vec3(1./2.2)),uOpacity);
}
`));
gl.linkProgram(prog);if(!gl.getProgramParameter(prog,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(prog));gl.useProgram(prog);
const U={};for(let n of ['M','VP','Tint','Eye','Fog','LightVP','DepthPass','ShadowOn','ShadowMap','FlashPos','Flash','Material','Opacity','Surface'])U[n]=gl.getUniformLocation(prog,'u'+n);

const attrs=['aP','aN','aC'].map(n=>gl.getAttribLocation(prog,n));attrs.forEach(n=>gl.enableVertexAttribArray(n));
const faces=[[[1,0,0],[[.5,-.5,-.5],[.5,.5,-.5],[.5,.5,.5],[.5,-.5,.5]]],[[-1,0,0],[[-.5,-.5,.5],[-.5,.5,.5],[-.5,.5,-.5],[-.5,-.5,-.5]]],[[0,1,0],[[-.5,.5,-.5],[-.5,.5,.5],[.5,.5,.5],[.5,.5,-.5]]],[[0,-1,0],[[-.5,-.5,.5],[-.5,-.5,-.5],[.5,-.5,-.5],[.5,-.5,.5]]],[[0,0,1],[[.5,-.5,.5],[.5,.5,.5],[-.5,.5,.5],[-.5,-.5,.5]]],[[0,0,-1],[[-.5,-.5,-.5],[-.5,.5,-.5],[.5,.5,-.5],[.5,-.5,-.5]]]];
function cubeData(p,s,col,out,r=0){let c=Math.cos(r),q=Math.sin(r);for(let[n,vs]of faces)for(let i of[0,1,2,0,2,3]){let v=vs[i],x=v[0]*s[0],z=v[2]*s[2];out.push(p[0]+c*x+q*z,p[1]+v[1]*s[1],p[2]-q*x+c*z,c*n[0]+q*n[2],n[1],-q*n[0]+c*n[2],...col);}}
function buffer(data){let b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(data),gl.STATIC_DRAW);return{b,count:data.length/9};}
let base=[];cubeData(V(),[1,1,1],[1,1,1],base);const cube=buffer(base);
function bind(b){gl.bindBuffer(gl.ARRAY_BUFFER,b.b);attrs.forEach((a,i)=>gl.vertexAttribPointer(a,3,gl.FLOAT,false,36,i*12));}
function draw(p,s,col,r=0){gl.uniformMatrix4fv(U.M,false,model(p,s,r));gl.uniform3fv(U.Tint,col);gl.drawArrays(gl.TRIANGLES,0,36);}
function bone(a,b,w,col){let y=norm(sub(b,a)),x=norm(cross(Math.abs(y[1])>.95?[1,0,0]:[0,1,0],y)),z=cross(x,y),p=mul(add(a,b),.5),l=len(sub(a,b));gl.uniformMatrix4fv(U.M,false,[...mul(x,w),0,...mul(y,l),0,...mul(z,w),0,...p,1]);gl.uniform3fv(U.Tint,col);gl.drawArrays(gl.TRIANGLES,0,36);}
function roundData(kind){const a=[],rings=kind==='sphere'?10:1,segments=16;function vertex(t,v){if(kind==='sphere')return[Math.sin(v)*Math.cos(t)*.5,Math.cos(v)*.5,Math.sin(v)*Math.sin(t)*.5];return[Math.cos(t)*.5,v-.5,Math.sin(t)*.5];}for(let j=0;j<rings;j++)for(let i=0;i<segments;i++){let t=i/segments*Math.PI*2,t2=(i+1)/segments*Math.PI*2,v=j/rings*(kind==='sphere'?Math.PI:1),v2=(j+1)/rings*(kind==='sphere'?Math.PI:1),vs=[vertex(t,v),vertex(t2,v),vertex(t2,v2),vertex(t,v2)];for(let k of[0,1,2,0,2,3]){let p=vs[k],n=kind==='sphere'?norm(p):norm([p[0],0,p[2]]);a.push(...p,...n,1,1,1);}if(kind!=='sphere')for(let side of[-1,1])for(let p of[[0,side*.5,0],[Math.cos(t)*.5,side*.5,Math.sin(t)*.5],[Math.cos(t2)*.5,side*.5,Math.sin(t2)*.5]])a.push(...p,0,side,0,1,1,1);}return buffer(a);}
const sphere=roundData('sphere'),cylinder=roundData('cylinder');
function shape(mesh,p,s,col,r=0){bind(mesh);gl.uniformMatrix4fv(U.M,false,model(p,s,r));gl.uniform3fv(U.Tint,col);gl.drawArrays(gl.TRIANGLES,0,mesh.count);bind(cube);}
function tube(a,b,w,col){let y=norm(sub(b,a)),x=norm(cross(Math.abs(y[1])>.95?[1,0,0]:[0,1,0],y)),z=cross(x,y),p=mul(add(a,b),.5);bind(cylinder);gl.uniformMatrix4fv(U.M,false,[...mul(x,w),0,...mul(y,len(sub(a,b))),0,...mul(z,w),0,...p,1]);gl.uniform3fv(U.Tint,col);gl.drawArrays(gl.TRIANGLES,0,cylinder.count);bind(cube);}
// Cached, original geometry. A model is batched by material and moving component.
const surfaces={stone:0,metal:1,fabric:2,rubber:3,skin:4,glass:5,light:6,wood:7,paint:8};
const finish={steel:[.38,.44,.49],edge:[.72,.78,.81],black:[.055,.071,.08],olive:[.18,.23,.17],tan:[.36,.29,.20],copper:[.62,.32,.12],glass:[.08,.32,.38]};
function transformPoint(m,p){return [m[0]*p[0]+m[4]*p[1]+m[8]*p[2]+m[12],m[1]*p[0]+m[5]*p[1]+m[9]*p[2]+m[13],m[2]*p[0]+m[6]*p[1]+m[10]*p[2]+m[14]];}
function poseMatrix(p=[0,0,0],rotation=[0,0,0],scale=[1,1,1]){let [x,y,z]=rotation,cx=Math.cos(x),sx=Math.sin(x),cy=Math.cos(y),sy=Math.sin(y),cz=Math.cos(z),sz=Math.sin(z);const rx=[1,0,0,0,0,cx,sx,0,0,-sx,cx,0,0,0,0,1],ry=[cy,0,-sy,0,0,1,0,0,sy,0,cy,0,0,0,0,1],rz=[cz,sz,0,0,-sz,cz,0,0,0,0,1,0,0,0,0,1];return mm(model(p,scale),mm(rz,mm(ry,rx)));}
class DetailBuilder {
 constructor(){this.groups=new Map();this.vertices=0;}
 add(p,n,col,mat,group='body'){const key=group+':'+mat;if(!this.groups.has(key))this.groups.set(key,[]);this.groups.get(key).push(...p,...n,...col);this.vertices++;}
 tri(a,b,c,na,nb,nc,col,mat,group){this.add(a,na,col,mat,group);this.add(b,nb,col,mat,group);this.add(c,nc,col,mat,group);}
 box(p,size,col,mat=1,bevel=.008,group='body',rot=[0,0,0]){const m=poseMatrix(p,rot),half=size.map(v=>v/2),b=Math.min(bevel,...half.map(v=>v*.48)),core=half.map(v=>v-b),values=half.map((h,i)=>[-h,-core[i],core[i],h]);
 for(let axis=0;axis<3;axis++)for(let sign of[-1,1]){let u=(axis+1)%3,v=(axis+2)%3;for(let i=0;i<3;i++)for(let j=0;j<3;j++){const points=[],normals=[];for(let [a,c]of[[i,j],[i+1,j],[i+1,j+1],[i,j+1]]){let q=[0,0,0];q[axis]=sign*half[axis];q[u]=values[u][a];q[v]=values[v][c];let inside=q.map((x,k)=>clamp(x,-core[k],core[k])),n=norm(sub(q,inside)),pt=add(inside,mul(n,b));points.push(transformPoint(m,pt));normals.push(norm(sub(transformPoint(m,n),p)));}for(let k of[0,1]){let ids=k?[0,2,3]:[0,1,2];this.tri(...ids.map(n=>points[n]),...ids.map(n=>normals[n]),col,mat,group);}}}}
 tube(a,b,r,col,mat=1,group='body',segments=20,r2=r){const up=norm(sub(b,a)),right=norm(cross(Math.abs(up[1])>.95?[1,0,0]:[0,1,0],up)),front=cross(right,up);for(let i=0;i<segments;i++){let t=i/segments*Math.PI*2,q=(i+1)/segments*Math.PI*2,n1=add(mul(right,Math.cos(t)),mul(front,Math.sin(t))),n2=add(mul(right,Math.cos(q)),mul(front,Math.sin(q))),p1=add(a,mul(n1,r)),p2=add(a,mul(n2,r)),p3=add(b,mul(n2,r2)),p4=add(b,mul(n1,r2));this.tri(p1,p2,p3,n1,n2,n2,col,mat,group);this.tri(p1,p3,p4,n1,n2,n1,col,mat,group);this.tri(a,p2,p1,mul(up,-1),mul(up,-1),mul(up,-1),col,mat,group);this.tri(b,p4,p3,up,up,up,col,mat,group);}}
 ring(p,r,t,col,mat=1,group='body',rot=[0,0,0]){const m=poseMatrix(p,rot);for(let i=0;i<32;i++)for(let j=0;j<8;j++){const points=[],normals=[];for(let[a,b]of[[i,j],[i+1,j],[i+1,j+1],[i,j+1]]){let u=a/32*Math.PI*2,v=b/8*Math.PI*2,n=[Math.cos(u)*Math.cos(v),Math.sin(u)*Math.cos(v),Math.sin(v)],q=[Math.cos(u)*(r+t*Math.cos(v)),Math.sin(u)*(r+t*Math.cos(v)),t*Math.sin(v)];points.push(transformPoint(m,q));normals.push(norm(sub(transformPoint(m,n),p)));}for(let ids of[[0,1,2],[0,2,3]])this.tri(...ids.map(n=>points[n]),...ids.map(n=>normals[n]),col,mat,group);}}
 blade(points,widths,col=finish.steel,group='body'){for(let i=0;i<points.length-1;i++){let a=points[i],b=points[i+1],d=norm(sub(b,a)),n=[-d[1],d[0],0],left1=add(a,mul(n,widths[i]/2)),right1=sub(a,mul(n,widths[i]/2)),left2=add(b,mul(n,widths[i+1]/2)),right2=sub(b,mul(n,widths[i+1]/2));for(let sign of[-1,1]){const lift=[0,0,sign*.008],mid1=add(a,lift),mid2=add(b,lift);for(let edge of[[left1,left2],[right1,right2]]){const normal=norm(cross(sub(edge[0],mid1),sub(mid2,mid1)));this.tri(mid1,edge[0],edge[1],normal,normal,normal,col,1,group);this.tri(mid1,edge[1],mid2,normal,normal,normal,col,1,group);}}this.tube(left1,left2,.0015,finish.edge,1,group,5);}}
 finish(){return {groups:[...this.groups].map(([key,data])=>{let[group,mat]=key.split(':');return {group,mat:+mat,mesh:buffer(data)};}),vertices:this.vertices};}
}
function drawDetail(asset,m,transforms={},tint=[1,1,1]){for(let g of asset.groups){const matrix=transforms[g.group]?mm(m,transforms[g.group]):m;gl.uniformMatrix4fv(U.M,false,matrix);gl.uniform1f(U.Surface,g.mat);gl.uniform3fv(U.Tint,tint);bind(g.mesh);gl.drawArrays(gl.TRIANGLES,0,g.mesh.count);}gl.uniform1f(U.Surface,0);bind(cube);}
function buildItemModel(id){const b=new DetailBuilder(),M=finish,box=(p,s,c=M.black,mat=1,bev=.006,g='body',rot)=>b.box(p,s,c,mat,bev,g,rot),tube=(a,z,r,c=M.steel,mat=1,g='body',r2=r)=>b.tube(a,z,r,c,mat,g,24,r2),ring=(p,r,t,c=M.steel,g='body',rot)=>b.ring(p,r,t,c,1,g,rot);
 const screws=(y,z)=>{for(let side of[-1,1]){tube([side*.065,y,z],[side*.07,y,z],.008,M.steel);box([side*.071,y,z],[.002,.002,.009],M.black);}};
 const rails=(z,n=10)=>{for(let i=0;i<n;i++)box([0,.099,z-i*.035],[.10,.016,.016],M.black,1,.002);};
 const muzzle=(z,r=.028)=>{tube([0,.025,z+.08],[0,.025,z],r,M.steel);ring([0,.025,z-.001],r*.76,.004,M.edge);tube([0,.025,z-.002],[0,.025,z+.01],r*.60,[.008,.01,.012]);};
 const sight=(z)=>{box([0,.13,z],[.06,.06,.045]);box([0,.165,z],[.01,.012,.012],[.25,.65,.42],6,.002);};
 if(id==='karambit'){
  ring([0,0,0],.030,.0085,M.steel);ring([0,0,.004],.030,.002,[.78,.61,.28]);box([0,-.102,0],[.055,.15,.031],M.black,3,.012);
  for(let i=0;i<6;i++){box([.001,-.047-i*.022,.018],[.045,.007,.006],[.21,.24,.23],3,.002);box([-.027,-.06-i*.019,0],[.008,.011,.035],M.black,3,.003);}
  for(let y of[-.055,-.145])tube([0,y,-.020],[0,y,.020],.006,M.edge);
  const p=[],w=[];for(let i=0;i<=24;i++){let a=Math.PI+i/24*1.82;p.push([.17+Math.cos(a)*.19,-.19+Math.sin(a)*.19,0]);w.push(.070*Math.pow(1-i/24,.55)+.001);}b.blade(p,w);
  for(let i=0;i<5;i++)box([-.024,-.18-i*.013,0],[.018,.004,.013],M.black,1,.001);
 }else if(id==='machete'){
  box([0,-.08,0],[.058,.19,.045],M.black,3,.01);for(let y=-.15;y<0;y+=.026)box([0,y,.024],[.05,.006,.004],M.olive,2,.002);tube([0,-.14,-.026],[0,-.14,.026],.007,M.steel);box([0,.025,0],[.095,.018,.052],M.steel);
  b.blade([[0,.03,0],[.008,.14,0],[.015,.29,0],[.03,.42,0],[.01,.47,0]],[.065,.075,.085,.09,.001]);
 }else if(['frag','flash','smoke','boogie','bandage'].includes(id)){
  if(id==='bandage'){tube([0,-.13,0],[0,.11,0],.083,[.75,.73,.62],2);for(let y=-.12;y<.11;y+=.013)ring([0,y,0],.084,.002,[.52,.52,.46],'body',[Math.PI/2,0,0]);box([0,-.01,.083],[.13,.11,.012],[.77,.77,.66],2);box([0,-.01,.092],[.077,.024,.008],[.61,.055,.035],8);box([0,-.01,.093],[.024,.077,.008],[.61,.055,.035],8);}
  else if(id==='boogie'){b.ring([0,0,0],.083,.035,[.30,.14,.46],1);tube([0,-.09,0],[0,.09,0],.075,[.22,.12,.32],1);for(let i=0;i<12;i++){let a=i*Math.PI/6;box([Math.cos(a)*.085,Math.sin(a)*.085,.035],[.027,.027,.023],i%2?[.12,.7,.8]:[.64,.22,.85],6,.002);}}
  else{const col=id==='frag'?M.olive:id==='smoke'?[.24,.32,.29]:[.32,.37,.4];tube([0,-.12,0],[0,.10,0],id==='frag'?.085:.065,col,8,'body',id==='frag'?.07:.065);for(let y=-.10;y<.10;y+=.038)ring([0,y,0],id==='frag'?.084:.066,.003,M.black,'body',[Math.PI/2,0,0]);if(id==='flash')for(let y=-.08;y<=.08;y+=.045)for(let x of[-.035,.035])box([x,y,.064],[.015,.02,.005],[.018,.022,.023],3,.004);box([0,-.01,.068],[.07,.038,.007],id==='smoke'?[.62,.68,.61]:[.75,.60,.19],8,.002);}
  if(id!=='bandage'){tube([0,.10,0],[0,.14,0],.025,M.steel);box([.052,.04,0],[.015,.2,.024],M.steel,1,.003,'lever',[0,0,-.18]);ring([-.036,.13,0],.025,.003,M.edge,'pin');}
 }else if(id==='pistol'||id==='revolver'){
  box([0,-.105,.035],[.085,.19,.10],id==='revolver'?[.25,.12,.06]:M.black,id==='revolver'?7:3,.012,'body',[.15,0,0]);box([0,-.01,-.04],[.105,.08,.20],M.black);ring([0,-.055,-.075],.038,.008,M.black,'body',[0,Math.PI/2,0]);
  if(id==='pistol'){box([0,.045,-.10],[.106,.10,.30],M.steel,1,.009,'slide');box([0,.097,-.13],[.055,.006,.10],M.black,1,.001,'slide');for(let side of[-1,1])for(let i=0;i<8;i++)box([side*.054,.046,.02-i*.011],[.004,.062,.004],M.black,1,.001,'slide');muzzle(-.26,.022);sight(-.24);box([0,-.205,.05],[.086,.022,.105],M.black,3,.003,'mag');}
  else{tube([0,.025,.04],[0,.025,-.11],.063,M.steel,1,'cylinder');for(let i=0;i<6;i++){let a=i*Math.PI/3;tube([Math.cos(a)*.046,.025+Math.sin(a)*.046,-.112],[Math.cos(a)*.046,.025+Math.sin(a)*.046,-.10],.012,M.black,1,'cylinder');}tube([0,.065,-.1],[0,.065,-.34],.026,M.steel);box([0,.088,-.22],[.045,.024,.28],M.steel);muzzle(-.36,.026);sight(-.31);box([0,.08,.082],[.022,.046,.028],M.steel,1,.003,'hammer');}
  for(let y of[-.06,-.14])screws(y,.05);
 }else if(id==='rpg'){
  tube([0,0,.35],[0,0,-.59],.068,M.olive,8);for(let z of[.29,.18,-.1,-.4])ring([0,0,z],.07,.007,M.steel);tube([0,0,.36],[0,0,.43],.10,M.steel);box([0,-.13,.08],[.065,.18,.085],M.black,3,.01);box([0,-.10,-.30],[.055,.15,.09],M.black,3,.008);tube([0,0,-.56],[0,0,-.74],.105,[.38,.43,.22],8,'rocket',.04);tube([0,0,-.74],[0,0,-.91],.04,M.steel,1,'rocket',.002);box([-.10,.10,-.08],[.06,.16,.12],M.black);box([-.10,.19,-.08],[.04,.05,.03],M.glass,5);
 }else if(id==='double'){
  box([0,-.035,.18],[.125,.18,.32],[.29,.13,.055],7,.025);box([0,0,-.06],[.14,.13,.2],M.steel,1,.008);for(let x of[-.043,.043]){tube([x,.025,-.13],[x,.025,-.63],.037,M.steel,1,'barrels');ring([x,.025,-.633],.031,.004,M.edge,'barrels');tube([x,.025,-.635],[x,.025,-.62],.025,[.008,.009,.01],3,'barrels');tube([x,.025,-.08],[x,.025,-.16],.027,[.58,.11,.07],8,'shells');}box([0,-.045,-.34],[.13,.09,.24],[.31,.14,.06],7,.016,'barrels');ring([0,-.10,.035],.04,.007,M.steel,'body',[0,Math.PI/2,0]);box([0,.09,0],[.025,.025,.09],M.steel);screws(0,-.04);
 }else{
  const sniper=id==='sniper',smg=id==='smg',burst=id==='burst',paint=sniper?M.tan:burst?[.23,.29,.29]:M.black,end=sniper?-.82:smg?-.48:-.66;
  box([0,.012,0],[.116,.155,sniper?.48:.34],paint,8,.014);box([0,-.095,.10],[.071,.17,.094],M.black,3,.012,'body',[.12,0,0]);box([0,-.02,.27],[.09,.10,.21],M.black,3,.014);box([0,-.055,.37],[.13,.20,.055],M.black,3,.012);box([0,-.03,-.25],[.112,.115,.25],paint,8,.009);tube([0,.025,-.34],[0,.025,end],.021,M.steel);muzzle(end-.025);rails(.08,sniper?13:9);screws(.025,.10);screws(.025,-.10);
  box([0,-.17,-.02],[.072,smg?.25:sniper?.12:.20,.11],M.black,1,.008,'mag',[smg?-.08:-.18,0,0]);for(let side of[-1,1]){for(let i=0;i<7;i++)box([side*.058,.02,-.16-i*.026],[.004,.033,.015],M.black,3,.004);for(let i=0;i<4;i++)box([side*.037,-.10-i*.033,-.02],[.004,.012,.085],M.steel,1,.002,'mag');}box([.065,.015,.045],[.025,.028,.06],M.steel,1,.004,'bolt');ring([0,-.08,.052],.04,.006,M.black,'body',[0,Math.PI/2,0]);
  if(sniper){tube([0,.17,.03],[0,.17,-.32],.041,M.black);tube([0,.17,-.31],[0,.17,-.38],.055,M.black);ring([0,.17,.035],.042,.006,M.steel);tube([0,.17,.038],[0,.17,.041],.034,M.glass,5);tube([0,.17,-.385],[0,.17,-.38],.047,M.glass,5);for(let z of[-.04,-.22]){box([0,.11,z],[.065,.10,.05],M.black);ring([0,.17,z],.046,.005,M.steel);}box([.06,.17,-.12],[.045,.035,.045],M.black);tube([-.07,-.04,-.45],[-.11,-.19,-.62],.012,M.steel);tube([.07,-.04,-.45],[.11,-.19,-.62],.012,M.steel);}
  else{sight(end+.05);box([0,.14,.045],[.09,.08,.045],M.black);box([0,.15,.07],[.06,.04,.005],M.glass,5,.002);box([0,.15,.075],[.004,.004,.003],[.7,.11,.04],6,.001);}
 }
 return b.finish();
}
const itemModels=Object.fromEntries(['rifle','pistol','frag','sniper','burst','double','smg','rpg','revolver','machete','karambit','bandage','flash','boogie','smoke'].map(id=>[id,buildItemModel(id)]));
function buildGlove(){const b=new DetailBuilder();b.box([0,0,0],[.103,.12,.064],[.12,.15,.13],2,.018);b.box([0,-.09,.01],[.11,.08,.075],[.20,.25,.20],2,.016);b.box([0,-.13,.015],[.119,.028,.086],[.055,.07,.06],3,.007);for(let i=0;i<4;i++){let x=-.039+i*.026;b.box([x,.067,-.005],[.023,.047,.033],[.20,.23,.19],2,.008);b.box([x,.08,-.032],[.023,.030,.041],[.10,.13,.105],3,.009);b.box([x,.035,.036],[.022,.028,.016],[.055,.065,.06],3,.007);}b.box([.065,.005,0],[.035,.075,.04],[.15,.18,.14],2,.012,'body',[0,0,.45]);for(let x of[-.04,.04])b.box([x,-.07,.049],[.004,.08,.003],[.37,.38,.30],2,.001);return b.finish();}
const gloveModel=buildGlove();
function buildDroneDetail(){const b=new DetailBuilder();b.box([0,0,0],[.76,.19,.46],[.13,.17,.19],8,.045);b.box([0,.11,0],[.49,.09,.33],[.24,.28,.28],1,.018);for(let side of[-1,1]){for(let z of[-.55,.55]){b.tube([side*.28,0,z*.3],[side*.70,0,z],.035,finish.black,1);b.tube([side*.70,-.05,z],[side*.70,.07,z],.075,finish.steel,1);b.ring([side*.70,.04,z],.32,.012,finish.black,1,'body',[Math.PI/2,0,0]);}b.tube([side*.29,-.1,-.22],[side*.34,-.32,-.22],.022,finish.steel);b.tube([side*.34,-.32,-.35],[side*.34,-.32,.32],.022,finish.steel);for(let i=0;i<5;i++)b.box([side*.385,.01,-.12+i*.055],[.008,.07,.02],finish.black,3,.002);}b.tube([0,-.1,0],[0,-.23,0],.06,finish.steel);b.box([0,-.25,0],[.18,.13,.20],finish.black,1,.025);b.tube([0,-.25,-.11],[0,-.25,-.12],.052,finish.glass,5);b.ring([0,-.25,-.122],.054,.006,finish.steel);return b.finish();}
function buildMineDetail(){const b=new DetailBuilder();b.tube([0,0,0],[0,.10,0],.24,[.32,.29,.17],8,'body',28,.21);b.ring([0,.04,0],.231,.009,finish.steel,1,'body',[Math.PI/2,0,0]);b.tube([0,.10,0],[0,.13,0],.14,finish.black,3);for(let i=0;i<6;i++){let a=i*Math.PI/3;b.tube([Math.cos(a)*.18,.10,Math.sin(a)*.18],[Math.cos(a)*.18,.112,Math.sin(a)*.18],.012,finish.steel);}b.box([0,.137,0],[.14,.008,.025],[.85,.60,.12],8,.002);return b.finish();}
const droneModel=buildDroneDetail(),mineModel=buildMineDetail();

const colors={concrete:[.48,.51,.49],dark:[.095,.13,.14],teal:[.12,.31,.32],orange:[.64,.29,.12],crate:[.38,.30,.20],lime:[.7,.8,.25],red:[.48,.018,.024],skin:[.52,.40,.30],enemy:[.22,.28,.25]};
let world=[],walls=[];
function box(p,s,c,solid=true){cubeData(p,s,c,world);if(solid)walls.push({min:p.map((v,i)=>v-s[i]/2),max:p.map((v,i)=>v+s[i]/2)});}
box([0,-.3,0],[42,.6,50],[.32,.36,.35]);
box([-21,2.7,0],[.6,5.4,50],colors.concrete);box([21,2.7,0],[.6,5.4,50],colors.concrete);box([0,2.7,-25],[42,5.4,.6],colors.concrete);box([0,2.7,25],[42,5.4,.6],colors.concrete);
for(let x=-17;x<=17;x+=4){for(let z of[-21.62,21.62]){box([x,2.7,z],[.22,5.4,.16],[.35,.40,.39],false);box([x,5.6,z],[.12,1.2,.12],colors.dark,false);}}
for(let z=-20;z<=20;z+=4)for(let x of[-17.62,17.62])box([x,2.7,z],[.16,5.4,.22],[.35,.40,.39],false);
for(let x=-16;x<=16;x+=4)box([x,.013,0],[.05,.025,42],[.40,.43,.40],false);
for(let z=-20;z<=20;z+=4)box([0,.014,z],[34,.024,.045],[.40,.43,.40],false);
function container(x,z,w,d,c){box([x,1.65,z],[w,3.3,d],c);box([x,3.35,z],[w+.12,.12,d+.12],[.25,.33,.32],false);for(let i=-w/2+.25;i<w/2;i+=.45){box([x+i,1.7,z+d/2+.025],[.075,3.05,.09],mul(c,1.25),false);box([x+i,1.7,z-d/2-.025],[.075,3.05,.09],mul(c,1.25),false);}for(let k of[-1,1]){box([x+k*w/2,1.6,z],[.08,3,d-.2],mul(c,.85),false);box([x+k*w/2,1.55,z],[.10,.06,d-.2],[.5,.53,.46],false);} }
container(-10,-8,5,10,colors.teal);container(10,7,5,10,colors.orange);container(10,-14,6,4,colors.teal);container(-10,14,6,4,colors.teal);
box([0,1.1,-1],[7,2.2,.65],colors.concrete);box([-3.2,1.1,-3],[.65,2.2,4],colors.concrete);box([3.2,1.1,1],[.65,2.2,4],colors.concrete);
for(let[x,z]of[[-2,-12],[3,12],[-13,3],[13,-5],[-4,17],[4,-18]]){box([x,.62,z],[2.5,1.24,1.25],colors.concrete);box([x,.68,z+.64],[2.25,.22,.025],[.63,.59,.28],false);for(let i=-1;i<=1;i++)box([x+i*.7,.68,z+.66],[.22,.23,.03],colors.dark,false);}
for(let[x,z]of[[-14,-17],[14,17],[-4,7],[5,-8],[-14,6]]){box([x,.65,z],[1.35,1.3,1.35],colors.crate);for(let y of[.18,1.15])box([x,y,z],[1.4,.09,1.4],[.22,.22,.18],false);}
for(let x of[-16,16])for(let z of[-18,0,18]){box([x,3.7,z],[.12,7.4,.12],colors.dark,false);box([x,7.35,z],[1.5,.15,.5],[.85,.8,.55],false);}
for(let z=9;z<21;z+=1.5)box([0,.02,z],[.16,.025,.8],colors.lime,false);
// Buildings outside the playable yard give the compact arena a larger skyline.
for(let i=0;i<15;i++){let x=-36+i*5,h=5+(i*7%9);box([x,h/2,-30-(i%3)*3],[4.5,h,6],[.25,.30,.31],false);for(let y=2;y<h;y+=2)box([x,y,-26.95-(i%3)*3],[3,.45,.03],[.39,.45,.43],false);}
// Container door hardware, panel seams, industrial trim and ground markings.
for(let [x,z,w,d] of [[-10,-8,5,10],[10,7,5,10],[10,-14,6,4],[-10,14,6,4]]){
 for(let side of[-1,1]){for(let k=-d/2+.25;k<d/2;k+=.38)box([x+side*(w/2+.035),1.65,z+k],[.09,3.13,.065],[.23,.35,.34],false);for(let y of[.12,3.22])box([x+side*w/2,y,z],[.16,.13,d+.12],colors.dark,false);}
 for(let a of[-.28,.28]){box([x+a*w,1.6,z+d/2+.1],[.065,2.9,.065],[.48,.49,.42],false);box([x+a*w+.12,1.2,z+d/2+.14],[.26,.06,.06],colors.dark,false);}
 box([x,2.5,z+d/2+.1],[1.45,.35,.045],[.75,.73,.59],false);for(let i=0;i<7;i++)box([x-.58+i*.19,2.5,z+d/2+.13],[.055,.20,.015],colors.dark,false);
}
for(let x=-16;x<=16;x+=2){box([x,.024,-19],[.8,.025,.10],[.64,.57,.31],false);box([x,.024,20],[.8,.025,.10],[.64,.57,.31],false);}
for(let z=-20;z<22;z+=2)for(let x of[-17,17]){box([x,.026,z],[.5,.025,.8],[.24,.28,.27],false);for(let k=0;k<5;k++)box([x,.042,z-.3+k*.15],[.44,.015,.035],[.09,.12,.12],false);}
for(let [x,z] of [[-14,-17],[14,17],[-4,7],[5,-8],[-14,6]]){for(let j=0;j<6;j++)box([x-.56+j*.22,.67,z+.682],[.02,1.1,.025],[.21,.18,.13],false);for(let side of[-1,1])box([x+side*.55,.66,z+.70],[.1,1.24,.04],[.54,.43,.28],false);}
for(let x of[-17.5,17.5])for(let y of[5.7,6,6.3])box([x,y,0],[.028,.028,43],colors.dark,false);
for(let z of[-21.6,21.6])for(let y of[5.7,6,6.3])box([0,y,z],[35,.028,.028],colors.dark,false);
// Outer circulation routes retain at least 2.4 m of clear passage.
for(let [x,z] of [[-18,-12],[18,10],[-17,21],[16,-21],[-5,-22],[6,22]]){
 box([x,.5,z],[2.4,1,1.2],[.34,.40,.40]);box([x,.99,z],[2.5,.08,1.3],[.63,.63,.54],false);
 for(let a of[-.8,0,.8])box([x+a,.55,z+.61],[.22,.25,.03],colors.lime,false);
}
// A crawl-through inspection canopy exercises headroom without blocking routes.
box([-18,1.43,5],[2.2,.18,3.5],[.25,.34,.34]);
for(let x of[-19.05,-16.95])box([x,.65,5],[.12,1.3,3.5],colors.dark);
for(let z of[-24.5,24.5])for(let x=-20;x<21;x+=5)box([x,2.8,z],[.15,5.6,.18],[.23,.28,.28],false);
const worldBuffer=buffer(world);world=null;
// Baked environmental detail is decorative: collision and navigation remain intact.
const yardDetail=new DetailBuilder();
for(let side of[-1,1]){
 for(let z=-22;z<=22;z+=4){yardDetail.box([side*20.64,2.5,z],[.055,4.8,.025],[.20,.24,.24],0,.006);yardDetail.box([side*20.57,.18,z],[.10,.35,3.7],[.27,.30,.28],0,.015);}
 for(let z of[-20,-4,12]){yardDetail.tube([side*20.48,.2,z],[side*20.48,4.8,z],.055,[.21,.25,.25],1);for(let y of[.7,2.1,3.8])yardDetail.box([side*20.46,y,z],[.10,.08,.19],[.37,.4,.39],1,.01);}
 for(let x=-18;x<=18;x+=4){yardDetail.box([x,2.7,side*24.65],[3.85,5.0,.035],[.35,.39,.37],0,.01);yardDetail.box([x,.4,side*24.57],[3.85,.04,.06],[.16,.2,.19],0,.005);}
}
for(let [x,z]of[[-10,-8],[10,7],[10,-14],[-10,14]]){
 for(let y of[.3,3.1])for(let dx of[-1.8,1.8])yardDetail.box([x+dx,y,z+2.1],[.20,.15,.09],[.48,.51,.48],1,.012);
 // Labels, latch plates and inset hazard striping.
 const front=z+(z===-8||z===7?5:2)+.16;
 yardDetail.box([x-1,1.1,front],[.44,.36,.03],[.71,.66,.48],8,.002);
 for(let i=0;i<5;i++)yardDetail.box([x-1.16+i*.074,1.1,front+.019],[.028,.23,.008],[.12,.14,.13],8,.001);
 yardDetail.box([x+1.3,.7,front],[.35,.09,.025],[.12,.15,.15],1,.006);
}
// Drain covers, floor markings and scattered grit, all non-colliding.
for(let [x,z]of[[-6,4],[6,-5],[15,15],[-15,-13]]){yardDetail.box([x,.027,z],[1.2,.035,.8],[.12,.15,.15],1,.015);for(let i=0;i<11;i++)yardDetail.box([x-.5+i*.10,.049,z],[.023,.014,.70],[.31,.34,.33],1,.004);}
for(let i=0;i<130;i++){const x=Math.sin(i*31.73)*19.7,z=Math.sin(i*12.91)*23.5;if(walls.some(w=>w.max[1]>.1&&x>w.min[0]-.3&&x<w.max[0]+.3&&z>w.min[2]-.3&&z<w.max[2]+.3))continue;yardDetail.box([x,.018,z],[.025+(i%4)*.012,.025,.045],[.34,.34,.30],0,.004,'body',[0,i*1.7,0]);}
for(let [x,z]of[[-16,0],[16,18],[-16,-18],[16,-18]]){yardDetail.box([x,7.3,z],[1.42,.045,.44],[.9,.78,.52],6,.005);yardDetail.box([x,7.43,z],[1.55,.13,.55],[.16,.2,.21],1,.015);}
const yardDetailModel=yardDetail.finish();
function buildTorso(){const b=new DetailBuilder();b.box([0,1.25,0],[.50,.58,.30],[.31,.36,.32],2,.065);b.box([0,1.24,.16],[.43,.46,.09],[.16,.20,.18],3,.03);b.box([0,1.25,-.20],[.40,.46,.16],[.25,.29,.24],2,.04);for(let x of[-.16,0,.16]){b.box([x,1.13,.23],[.13,.20,.065],[.32,.36,.27],2,.014);b.box([x,1.19,.27],[.105,.035,.018],[.16,.20,.16],3,.003);}for(let side of[-1,1]){b.box([side*.19,1.46,.035],[.07,.08,.34],[.19,.23,.20],2,.01);b.box([side*.235,1.20,.08],[.025,.16,.08],[.35,.40,.34],2,.003);b.box([side*.20,.95,.08],[.10,.20,.11],[.21,.25,.20],2,.012);}for(let y of[1.31,1.37,1.43])b.box([0,y,.215],[.35,.016,.012],[.24,.28,.24],2,.003);b.box([0,.94,0],[.50,.065,.33],[.07,.09,.08],3,.012);b.box([0,.94,.177],[.08,.055,.018],[.40,.44,.42],1,.004);b.box([-.14,1.40,.228],[.09,.055,.015],[.65,.62,.48],2,.002);return b.finish();}
const torsoModel=buildTorso();
function buildHelmet(){const b=new DetailBuilder();b.box([0,1.9,-.01],[.35,.18,.32],[.18,.22,.20],3,.07);b.box([0,1.80,.17],[.32,.10,.04],[.055,.08,.085],3,.015);for(let x of[-.08,.08])b.box([x,1.81,.198],[.135,.063,.012],[.15,.35,.38],5,.012);for(let side of[-1,1]){b.box([side*.18,1.78,0],[.05,.13,.11],[.09,.12,.11],3,.018);b.box([side*.14,1.91,.115],[.035,.055,.055],[.32,.37,.34],1,.003);}b.box([0,1.96,.1],[.065,.05,.065],[.09,.11,.10],1,.004);b.tube([.19,1.74,.04],[.10,1.65,.24],.012,[.08,.10,.09],3);return b.finish();}
const helmetModel=buildHelmet();
function soldier(e){if(drawSpecialEnemy(e))return;const p=e.p,r=e.rot||0,c=Math.cos(r),s=Math.sin(r),duck=(e.crouch||0)*.55,walk=Math.min(1,(e.walk||0)/3),phase=e.gait||0,step=Math.sin(phase)*.26*walk,breath=Math.sin(time*2+(e.id||0))*.006;
 const loc=(x,y,z)=>[p[0]+x*c+z*s,p[1]+y-duck,p[2]-x*s+z*c],cloth=e.def?.color||[.24,.29,.27],tint=cloth.map(v=>clamp(v/.30,.50,1.6)),m=poseMatrix(add(p,[0,-duck+breath,0]),[0,r,0]);
 drawDetail(torsoModel,m,{},tint);gl.uniform1f(U.Surface,4);shape(sphere,loc(0,1.75,0),[.31,.39,.30],colors.skin,r);shape(sphere,loc(0,1.73,.155),[.055,.07,.07],colors.skin,r);
 const civilian=e.def&&['bat','cheapPistol','thugSmg','cartelSmg','cartelMachete'].includes(e.def.id);if(!civilian)drawDetail(helmetModel,m);else{gl.uniform1f(U.Surface,2);shape(sphere,loc(0,1.92,-.01),[.35,.16,.33],cloth,r);draw(loc(0,1.88,.16),[.31,.025,.18],cloth,r);for(let side of[-1,1]){gl.uniform1f(U.Surface,4);shape(sphere,loc(side*.165,1.77,0),[.055,.09,.05],colors.skin);gl.uniform1f(U.Surface,3);draw(loc(side*.069,1.80,.152),[.045,.02,.014],[.08,.065,.05],r);}}
 for(let side of[-1,1]){let hip=loc(side*.17,.91,0),knee=loc(side*.19,.48+duck*.55,side*step+.1*(e.crouch||0)),foot=loc(side*.19,.11+duck,-side*step*.72);gl.uniform1f(U.Surface,2);tube(hip,knee,.22,cloth);tube(knee,foot,.175,cloth);gl.uniform1f(U.Surface,3);shape(sphere,add(knee,[s*.09,0,c*.09]),[.21,.25,.13],[.10,.13,.12],r);draw(add(foot,[s*.065,0,c*.065]),[.23,.17,.35],[.065,.08,.075],r);draw(add(foot,[0,-.07,0]),[.24,.035,.36],[.045,.055,.05],r);
 let attack=e.windup?Math.sin(time*9)*.10:0,shoulder=loc(side*.31,1.44,0),elbow=loc(side*.35,1.14+attack,.16),hand=loc(side*.12,1.28,.43);gl.uniform1f(U.Surface,2);shape(sphere,shoulder,[.25,.26,.25],cloth,r);tube(shoulder,elbow,.18,cloth);tube(elbow,hand,.15,cloth);gl.uniform1f(U.Surface,3);shape(sphere,elbow,[.17,.16,.16],[.12,.15,.13]);if(len(sub(p,cam))<12)drawDetail(gloveModel,poseMatrix(hand,[0,r,0],[1.0,.9,1.0]));else shape(sphere,hand,[.15,.15,.18],[.08,.1,.08]);}
 gl.uniform1f(U.Surface,0);drawEnemyWeapon(e,loc,r);
}
function projectileModel(g){const kind=g.kind||'frag';if(kind==='rpg'){const d=norm(g.v),angle=Math.atan2(-d[0],-d[2]);gl.uniform1f(U.Surface,1);tube(sub(g.p,mul(d,.25)),add(g.p,mul(d,.2)),.09,[.33,.40,.2]);shape(sphere,add(g.p,mul(d,.18)),[.12,.12,.2],[.5,.52,.36],angle);gl.uniform1f(U.Surface,6);shape(sphere,sub(g.p,mul(d,.31)),[.09,.09,.17],[1,.48,.08],angle);gl.uniform1f(U.Surface,0);return;}if(itemModels[kind])drawDetail(itemModels[kind],poseMatrix(g.p,[time*3,time*2,0],[.8,.8,.8]));}

const skyProgram=gl.createProgram();gl.attachShader(skyProgram,shader(gl.VERTEX_SHADER,`attribute vec2 aPosition;varying vec2 vUV;void main(){vUV=aPosition;gl_Position=vec4(aPosition,1.,1.);}`));
gl.attachShader(skyProgram,shader(gl.FRAGMENT_SHADER,`precision mediump float;varying vec2 vUV;uniform vec3 uForward,uRight,uUp;uniform float uAspect,uLens;float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1.,0.)),f.x),mix(h(i+vec2(0.,1.)),h(i+vec2(1.,1.)),f.x),f.y);}void main(){vec3 ray=normalize(uForward+uRight*vUV.x*uAspect*uLens+uUp*vUV.y*uLens),sun=normalize(vec3(-.65,1.,.4));float altitude=max(ray.y,0.);vec3 c=mix(vec3(.62,.66,.65),vec3(.25,.39,.49),pow(altitude,.55));float glow=pow(max(0.,dot(ray,sun)),14.);c+=vec3(.30,.21,.1)*glow;vec2 p=ray.xz/max(.12,ray.y+.2)*2.5;float cloud=noise(p)*.55+noise(p*2.1)*.3+noise(p*4.3)*.15;c=mix(c,vec3(.75,.77,.74),smoothstep(.5,.77,cloud)*smoothstep(.0,.25,ray.y)*.6);c+=vec3(.38,.3,.18)*pow(max(0.,dot(ray,sun)),180.);gl_FragColor=vec4(c,1.);}`));
gl.bindAttribLocation(skyProgram,0,'aPosition');gl.linkProgram(skyProgram);if(!gl.getProgramParameter(skyProgram,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(skyProgram));const skyVertices=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,skyVertices);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);const skyU={};for(let n of ['Forward','Right','Up','Aspect','Lens'])skyU[n]=gl.getUniformLocation(skyProgram,'u'+n);gl.useProgram(prog);
function renderSky(target,fov,aspect){gl.useProgram(skyProgram);gl.disable(gl.DEPTH_TEST);for(let a of attrs)gl.disableVertexAttribArray(a);gl.enableVertexAttribArray(0);gl.bindBuffer(gl.ARRAY_BUFFER,skyVertices);gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);let f=norm(sub(target,cam)),r=norm(cross(f,[0,1,0]));gl.uniform3fv(skyU.Forward,f);gl.uniform3fv(skyU.Right,r);gl.uniform3fv(skyU.Up,cross(r,f));gl.uniform1f(skyU.Aspect,aspect);gl.uniform1f(skyU.Lens,Math.tan(fov*Math.PI/360));gl.drawArrays(gl.TRIANGLES,0,3);gl.useProgram(prog);for(let a of attrs)gl.enableVertexAttribArray(a);gl.enable(gl.DEPTH_TEST);}

// Cached directional shadow map; no network textures or rendering libraries required.
const lightVP=mm([1/39,0,0,0,0,1/39,0,0,0,0,-2/120,0,0,0,-1,1],look([-35,54,22],[0,0,0]));
let shadowReady=false;
function buildShadows(){const tex=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,tex);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,1536,1536,0,gl.RGBA,gl.UNSIGNED_BYTE,null);for(let p of[gl.TEXTURE_MIN_FILTER,gl.TEXTURE_MAG_FILTER])gl.texParameteri(gl.TEXTURE_2D,p,gl.NEAREST);for(let p of[gl.TEXTURE_WRAP_S,gl.TEXTURE_WRAP_T])gl.texParameteri(gl.TEXTURE_2D,p,gl.CLAMP_TO_EDGE);const fb=gl.createFramebuffer(),depth=gl.createRenderbuffer();gl.bindFramebuffer(gl.FRAMEBUFFER,fb);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,tex,0);gl.bindRenderbuffer(gl.RENDERBUFFER,depth);gl.renderbufferStorage(gl.RENDERBUFFER,gl.DEPTH_COMPONENT16,1536,1536);gl.framebufferRenderbuffer(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.RENDERBUFFER,depth);shadowReady=gl.checkFramebufferStatus(gl.FRAMEBUFFER)===gl.FRAMEBUFFER_COMPLETE;
if(shadowReady){gl.bindTexture(gl.TEXTURE_2D,null);gl.viewport(0,0,1536,1536);gl.clearColor(1,1,1,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.enable(gl.DEPTH_TEST);gl.uniform1f(U.DepthPass,1);gl.uniformMatrix4fv(U.VP,false,lightVP);gl.uniformMatrix4fv(U.LightVP,false,lightVP);gl.uniformMatrix4fv(U.M,false,I());bind(worldBuffer);gl.drawArrays(gl.TRIANGLES,0,worldBuffer.count);drawDetail(yardDetailModel,I());}
gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.uniform1f(U.DepthPass,0);gl.uniform1f(U.ShadowOn,shadowReady?1:0);gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,tex);gl.uniform1i(U.ShadowMap,0);gl.deleteFramebuffer(fb);gl.deleteRenderbuffer(depth);}
buildShadows();gl.uniform1f(U.Opacity,1);
let state='menu',time=0,last=performance.now(),keys={},mouse=false,ads=false,yaw=0,pitch=0,eye=[0,1.7,17],cam=[0,1.7,17],kick=0,recoil=0,bob=0,hitTime=0,damageFlash=0,noticeTime=0,shotCount=0;
let player, enemies=[],ragdolls=[],particles=[],tracers=[],grenades=[],marks=[],wave=1,kills=0,points=0,waveWait=0,weapon=0,fireTimer=0,reload=0,switchTime=0,stamina=100,slide=0,slideCD=0,slideDir=[0,0,0],deadTime=0,difficulty='regular',sens=1;
// Catalog weights are integer hundredths of one percent and total exactly 10,000.
const categories=['Primary','Secondary','Equipment'];
const catalog=[
 {id:'rifle',name:'AR-4 assault rifle',category:'Primary',rarity:'Common',weight:1400,cap:30,reserveBase:90,rate:.13,damage:28,reload:1.9,spread:.012,range:24,auto:true},
 {id:'pistol',name:'Glock 19',category:'Secondary',rarity:'Common',weight:1600,cap:15,reserveBase:30,rate:.24,damage:30,reload:1.4,spread:.010,range:18},
 {id:'frag',name:'M67 fragmentation grenade',category:'Equipment',rarity:'Uncommon',weight:900,cap:2,rate:1,damage:180},
 {id:'sniper',name:'Longshot sniper rifle',category:'Primary',rarity:'Epic',weight:300,cap:5,reserveBase:15,rate:1.25,damage:115,reload:2.8,spread:.003,range:60},
 {id:'burst',name:'BR-3 burst assault rifle',category:'Primary',rarity:'Rare',weight:600,cap:24,reserveBase:72,rate:.48,damage:31,reload:2.1,spread:.009,range:30,burst:3},
 {id:'double',name:'Double-barrel shotgun',category:'Primary',rarity:'Rare',weight:500,cap:2,reserveBase:22,rate:.33,damage:18,pellets:9,reload:2.3,spread:.085,range:7},
 {id:'smg',name:'Viper submachine gun',category:'Primary',rarity:'Uncommon',weight:900,cap:32,reserveBase:128,rate:.075,damage:19,reload:1.65,spread:.025,range:13,auto:true},
 {id:'rpg',name:'RPG-7',category:'Primary',rarity:'Mythic',weight:10,cap:1,reserveBase:1,rate:1.5,damage:260,reload:4.2,spread:.01,range:60},
 {id:'revolver',name:'Iron six revolver',category:'Secondary',rarity:'Rare',weight:500,cap:6,reserveBase:24,rate:.46,damage:64,reload:2.5,spread:.009,range:27},
 {id:'machete',name:'Machete',category:'Secondary',rarity:'Uncommon',weight:850,cap:0,rate:.7,damage:65,reach:2.35,melee:true},
 {id:'karambit',name:'Karambit',category:'Secondary',rarity:'Rare',weight:500,cap:0,rate:.34,damage:34,reach:1.65,melee:true},
 {id:'bandage',name:'Field bandage',category:'Equipment',rarity:'Common',weight:1000,cap:2,rate:2.4,heal:35},
 {id:'flash',name:'Flashbang',category:'Equipment',rarity:'Rare',weight:400,cap:2,rate:1.2},
 {id:'boogie',name:'Boogie bomb',category:'Equipment',rarity:'Epic',weight:200,cap:1,rate:1.5},
 {id:'smoke',name:'Smoke bomb',category:'Equipment',rarity:'Uncommon',weight:340,cap:2,rate:1.2}
];
const starter=['rifle','pistol','frag'],saveKey='breach.collection.v1';
let saveBlocked=false,profile=loadProfile();
function loadProfile(){let old={};try{old=JSON.parse(localStorage.getItem(saveKey)||'{}');if(!old||typeof old!=='object'||Array.isArray(old))old={};}catch{}const owned=[...new Set([...starter,...(Array.isArray(old.owned)?old.owned.filter(id=>typeof id==='string'):[])])];return {...old,version:1,credits:Number.isFinite(old.credits)?Math.max(0,Math.floor(old.credits)):600,owned,bestWave:Math.max(0,Number(old.bestWave)||0),loadout:categories.map((cat,i)=>{let id=old.loadout?.[i];return owned.includes(id)&&catalog.some(d=>d.id===id&&d.category===cat)?id:starter[i];})};}
function saveProfile(){try{localStorage.setItem(saveKey,JSON.stringify(profile));saveBlocked=false;return true;}catch{saveBlocked=true;if($('storageWarning'))$('storageWarning').textContent='Saving unavailable. Progress lasts for this session only.';return false;}}
let pools=Object.fromEntries(catalog.map(d=>[d.id,{...d,ammo:d.cap,reserve:d.reserveBase||0}]));
let weapons=profile.loadout.map(id=>pools[id]),crouching=false,equipmentCooldown=0,useAction=null,burstLeft=0,burstTimer=0,burstItem=null,attackUntil=0,meleePending=null;
let smokes=[],mines=[],playerSlow=0,flashUntil=0,cameraFov=78,currentSpeed=0,waveRewarded=0,panelOpen=false,panelReturn='menu',roll=null;
const rarityColors={Common:'#c8d4d9',Uncommon:'#91da9b',Rare:'#7ab7ff',Epic:'#c79aff',Mythic:'#ffc36b'};
function syncLoadout(){weapons=profile.loadout.map(id=>pools[id]);}
function equipItem(id,slot){const d=catalog.find(x=>x.id===id);if(!d||!profile.owned.includes(id)||categories[slot]!==d.category||state==='playing')return false;profile.loadout[slot]=id;if(state==='menu'||state==='dead')syncLoadout();saveProfile();return true;}
function humanCount(w){return w<=20?7+Math.floor((w-1)*3/19):Math.min(25,10+Math.floor((w-20)/2));}
function resupply(){syncLoadout();const factor=humanCount(wave)/8*(wave>=15?1.25:wave>=10?1.12:1);for(let d of catalog){let p=pools[d.id];p.ammo=d.cap;p.reserve=d.melee||d.category==='Equipment'?0:d.id==='rpg'?(wave>=36?2:1):Math.ceil(d.reserveBase*Math.max(1,factor)/d.cap)*d.cap;}equipmentCooldown=0;useAction=null;burstLeft=0;meleePending=null;reload=0;fireTimer=0;player.hp=Math.min(player.maxHp,player.hp+35);}
function chooseReward(r=Math.random()){let ticket=Math.floor(clamp(r,0,.999999999)*10000);for(let d of catalog){ticket-=d.weight;if(ticket<0)return d;}return catalog[0];}
function awardCrate(){if(roll||profile.credits<300||state==='playing')return false;let reward=chooseReward(),duplicate=profile.owned.includes(reward.id);profile.credits-=300;if(duplicate)profile.credits+=120;else profile.owned.push(reward.id);profile.lastReward={id:reward.id,duplicate};saveProfile();roll={reward,duplicate,start:performance.now(),tick:-1};$('openCrate').disabled=true;$('closeArmory').disabled=true;return true;}
function updateRoll(now){if(!roll)return;const elapsed=(now-roll.start)/1000;let t=Math.floor(36*(1-Math.pow(1-clamp(elapsed/3,0,1),3)));if(t!==roll.tick){roll.tick=t;const item=elapsed>=3?roll.reward:catalog[t%catalog.length];$('rollCard').textContent=item.name;$('rollCard').style.borderColor=rarityColors[item.rarity];sound('roll');}if(elapsed>=3){$('rollCard').textContent=roll.reward.name+' · '+roll.reward.rarity;$('rollResult').textContent=roll.duplicate?'Already owned: +120 credits refunded. Your item stays in your collection.':'Added to your collection. Choose its category to equip it.';roll=null;$('openCrate').disabled=false;$('closeArmory').disabled=false;renderArmory();}}
function openArmory(){if(roll)return;panelReturn=state==='playing'?'paused':state;if(state==='playing')pause();panelOpen=true;mouse=false;ads=false;keys={};document.exitPointerLock?.();$('armory').classList.remove('hidden');renderArmory();}
function closeArmory(){if(roll)return;panelOpen=false;$('armory').classList.add('hidden');if(panelReturn==='paused')$('pause').classList.remove('hidden');}
function itemIcon(id){const paths={rifle:'M10 22h42v7H37v14h-7V30H19v5H8V22m28-7h31v7H36m27 4h16',pistol:'M21 17h43v11H44l-5 20H26l4-20H21z',sniper:'M7 25h61v6H37v11h-8V31H7m26-16h20v7H33m34 10h17',burst:'M8 23h56v9H44l-3 13H30l3-13H8m27-15h21v5H35m28 5h17',smg:'M17 20h45v12H44v17H34V32H17m6-19h25v5H23m38 8h12',double:'M8 30l24-10 47-1v5L34 28 15 40z M34 25h45',revolver:'M20 21h17v-4h16v6h23v7H46l-5 18H28l5-18H20z',rpg:'M7 24h51l13-7 16 11-16 11-13-8H7z M30 31v13 M45 31v10',machete:'M24 44l8-11L62 9l9 1-2 9-30 23-7 11z',karambit:'M28 16a8 8 0 1 0 0 .1 M29 25l5 11c2 13 19 16 31 5-14 2-15-7-16-14l-9-9',bandage:'M29 10h28v41H29z M35 29h16 M43 21v16',flash:'M31 18h24v33H31z M36 9h15v9 M35 26h4 M47 26h4 M35 36h4 M47 36h4',frag:'M31 17h24l6 25-5 10H29l-4-10z M37 9h12v8',smoke:'M31 18h26v32H31z M38 10h12v8 M32 33h24',boogie:'M43 15a18 18 0 1 0 0 36a18 18 0 1 0 0-36 M25 33h36 M43 15v36 M35 18v30 M51 18v30'};return '<svg class="item-icon" viewBox="0 0 90 60" aria-hidden="true"><path d="'+paths[id]+'"/></svg>';}
function renderArmory(){ $('credits').textContent=profile.credits+' CREDITS';$('loadoutNote').textContent=state==='menu'||state==='dead'?'Choose one item per category. Your other items remain owned.':'Changes take effect next wave. Current ammunition and equipment are preserved.';
 $('inventory').innerHTML=categories.map((cat,slot)=>'<section><h3>'+cat+'</h3>'+catalog.filter(d=>d.category===cat&&profile.owned.includes(d.id)).map(d=>'<button class="item '+(profile.loadout[slot]===d.id?'equipped':'')+'" data-item="'+d.id+'" data-slot="'+slot+'">'+itemIcon(d.id)+'<span style="color:'+rarityColors[d.rarity]+'">'+d.rarity+'</span><b>'+d.name+'</b><small>'+(profile.loadout[slot]===d.id?'EQUIPPED':'EQUIP')+'</small></button>').join('')+'</section>').join('');
 $('rewardTable').innerHTML=catalog.map(d=>'<tr><td>'+d.name+'</td><td>'+d.category+'</td><td style="color:'+rarityColors[d.rarity]+'">'+d.rarity+'</td><td>'+(d.weight/100).toFixed(2)+'%</td></tr>').join('');
}
function initializeUI(){ $('graphics').value=graphicsQuality;$('graphics').onchange=e=>{if(graphicsProfiles[e.target.value]){graphicsQuality=e.target.value;try{localStorage.setItem('breach.graphics.v1',graphicsQuality);}catch{}}}; $('shop').onclick=openArmory;$('pauseArmory').onclick=openArmory;$('closeArmory').onclick=closeArmory;$('info').onclick=()=>{$('odds').classList.toggle('hidden');};$('openCrate').onclick=awardCrate;$('inventory').addEventListener('click',e=>{const b=e.target.closest('[data-item]');if(b&&equipItem(b.dataset.item,Number(b.dataset.slot)))renderArmory();});$('saveExport').onclick=()=>{const b=new Blob([JSON.stringify(profile,null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='breach-collection.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);};$('saveImport').onchange=async e=>{try{const file=e.target.files[0];if(!file||file.size>100000)throw Error();const data=JSON.parse(await file.text());if(data.version!==1||!Array.isArray(data.owned)||!Array.isArray(data.loadout)||!Number.isFinite(data.credits))throw Error();profile.owned=[...new Set([...profile.owned,...data.owned.filter(id=>catalog.some(d=>d.id===id))])];profile.credits=Math.max(profile.credits,Math.floor(data.credits));profile.bestWave=Math.max(profile.bestWave,Number(data.bestWave)||0);for(let i=0;i<3;i++)if(catalog.some(d=>d.id===data.loadout[i]&&d.category===categories[i])&&profile.owned.includes(data.loadout[i]))profile.loadout[i]=data.loadout[i];saveProfile();if(state==='menu')syncLoadout();renderArmory();$('storageWarning').textContent='Collection merged successfully.';}catch{$('storageWarning').textContent='Could not read this collection backup.';}e.target.value='';};
 if(profile.lastReward){const d=catalog.find(x=>x.id===profile.lastReward.id);if(d)$('rollResult').textContent='Last saved reward: '+d.name+(profile.lastReward.duplicate?' (duplicate: 120 credits refunded)':'');}renderArmory();}

let audio=null,muted=false;
let aimBlend=0,gunPitch=0,gunVelocity=0,gunRoll=0,recoilYaw=0,swayX=0,swayY=0,shotHeat=0,muzzleTime=0,playerVelocity=[0,0,0];
const soundTimes={};
function sound(type,pos){if(muted)return;const now=time||0;if(pos&&len(sub(pos,cam))>40)return;if((type==='enemy'||type==='hurt'||type==='drone')&&now-(soundTimes[type]??-10)<.12)return;soundTimes[type]=now;
try{audio??=new(window.AudioContext||window.webkitAudioContext)();if(audio.state==='suspended')audio.resume();const t=audio.currentTime,g=audio.createGain(),distance=pos?1/(1+len(sub(pos,cam))*.08):1;g.connect(audio.destination);
const tones={rifle:[1900,.16,.13],pistol:[2500,.12,.11],sniper:[1100,.3,.2],burst:[2100,.13,.12],double:[750,.28,.22],smg:[3100,.09,.09],revolver:[1400,.23,.17],rpg:[420,.4,.18],suppressed:[650,.07,.05],enemy:[2200,.10,.045],boom:[380,.6,.23],machete:[900,.2,.09],karambit:[1800,.12,.07],smoke:[600,.5,.08],flash:[5000,.14,.11],boogie:[700,.18,.07],bandage:[3300,.45,.04],frag:[1800,.16,.05],throw:[2000,.15,.04],hurt:[190,.2,.045]};
if(tones[type]){let [freq,dur,vol]=tones[type],n=audio.createBuffer(1,Math.ceil(audio.sampleRate*dur),audio.sampleRate),data=n.getChannelData(0);for(let i=0;i<data.length;i++){const x=i/audio.sampleRate;data[i]=((Math.random()*2-1)*.75+Math.sin(x*(type==='hurt'?110:freq)*Math.PI*2)*.25)*Math.exp(-x/(dur*.24));}const source=audio.createBufferSource(),filter=audio.createBiquadFilter();source.buffer=n;filter.type='lowpass';filter.frequency.value=freq;source.connect(filter);filter.connect(g);g.gain.setValueAtTime(vol*distance,t);source.start(t);source.onended=()=>{source.disconnect();filter.disconnect();g.disconnect();};}
else{const o=audio.createOscillator(),warn=type==='warning'||type==='droneWarning',freq=type==='drone'?90:warn?880:type==='taser'?1500:type==='hit'?950:type==='kill'?1400:type==='roll'?480:type.startsWith('reload')?160+(catalog.findIndex(d=>type.endsWith(d.id))+1)*23:200;o.type=type==='drone'?'sawtooth':warn?'sine':'triangle';o.frequency.setValueAtTime(freq,t);o.frequency.exponentialRampToValueAtTime(type==='drone'?110:freq*.65,t+.12);o.connect(g);g.gain.setValueAtTime((warn?.055:type==='drone'?.025:.035)*distance,t);g.gain.exponentialRampToValueAtTime(.001,t+.16);o.start(t);o.stop(t+.18);o.onended=()=>{o.disconnect();g.disconnect();};}}
catch{}}

function collide(p,r=.3,height=1.85){if(!p.every(Number.isFinite)||Math.abs(p[0])>20.7-r||Math.abs(p[2])>24.7-r)return true;return walls.some(b=>b.max[1]>p[1]+.05&&p[1]+height>b.min[1]&&p[0]>b.min[0]-r&&p[0]<b.max[0]+r&&p[2]>b.min[2]-r&&p[2]<b.max[2]+r);}
function move(p,dx,dz,r=.3,height=1.85){const steps=Math.max(1,Math.ceil(Math.hypot(dx,dz)/.2));for(let i=0;i<steps;i++){let q=[p[0]+dx/steps,p[1],p[2]];if(!collide(q,r,height))p[0]=q[0];q=[p[0],p[1],p[2]+dz/steps];if(!collide(q,r,height))p[2]=q[2];}}
function validatePlayer(){if(!player.p.every(Number.isFinite)||player.p[1]<-.1||player.p[1]>6||collide(player.p,.29,bodyHeight())){player.p=player.safe&& !collide(player.safe,.3,bodyHeight())?[...player.safe]:[0,0,18];player.vy=0;}else player.safe=[...player.p];}
function bodyHeight(){return crouching||slide>0?1.05:1.85;}
function toggleCrouch(){if(state!=='playing')return;const moving=keys.KeyW||keys.KeyA||keys.KeyS||keys.KeyD;if(!crouching&&moving&&(keys.ShiftLeft||keys.ShiftRight)&&slideCD<=0&&stamina>22&&player.p[1]<.01){let f=(keys.KeyW?1:0)-(keys.KeyS?1:0),v=(keys.KeyD?1:0)-(keys.KeyA?1:0);slideDir=norm([Math.sin(yaw)*f+Math.cos(yaw)*v,0,-Math.cos(yaw)*f+Math.sin(yaw)*v]);slide=.75;slideCD=1.3;stamina-=22;ads=false;return;}if(slide>0)return;if(crouching&&collide(player.p,.3,1.85)){message('NOT ENOUGH HEADROOM');return;}crouching=!crouching;}
function rayBox(o,d,b,max=100){let lo=0,hi=max;for(let i=0;i<3;i++){if(Math.abs(d[i])<1e-7){if(o[i]<b.min[i]||o[i]>b.max[i])return Infinity;continue;}let a=(b.min[i]-o[i])/d[i],c=(b.max[i]-o[i])/d[i];if(a>c)[a,c]=[c,a];lo=Math.max(lo,a);hi=Math.min(hi,c);if(lo>hi)return Infinity;}return lo;}
function wallRay(o,d,max=100){let t=max;for(let b of walls)t=Math.min(t,rayBox(o,d,b,max));return t;}
function visible(a,b){let delta=sub(b,a),l=len(delta);return wallRay(a,norm(delta),l)>=l-.08;}
function direction(){return[Math.sin(yaw+recoilYaw)*Math.cos(pitch+recoil),Math.sin(pitch+recoil),-Math.cos(yaw+recoilYaw)*Math.cos(pitch+recoil)];}
function message(s,t=1.4){$('notice').textContent=s;noticeTime=t;}
function burst(p,col,n=15,power=3){for(let i=0;i<n;i++)particles.push({p:[...p],v:[rand(-power,power),rand(.5,power),rand(-power,power)],life:rand(.2,.6),max:.6,s:rand(.03,.12),col});if(particles.length>350)particles.splice(0,particles.length-350);}
function makeRagdoll(p,rot,force=[0,0,0],isPlayer=false){let c=Math.cos(rot),s=Math.sin(rot),local=(x,y,z)=>[p[0]+x*c+z*s,p[1]+y,p[2]-x*s+z*c];let pos=[local(0,1.76,0),local(0,1.4,0),local(0,.88,0),local(-.38,1.4,0),local(-.55,1.04,-.18),local(.38,1.4,0),local(.55,1.04,-.18),local(-.19,.46,0),local(-.19,.12,0),local(.19,.46,0),local(.19,.12,0)];let nodes=pos.map(v=>({p:v,old:sub(v,add(mul(force,.016),[rand(-.035,.035),.018,rand(-.035,.035)]))}));let links=[[0,1,.29],[1,2,.44],[1,3,.2],[3,4,.17],[1,5,.2],[5,6,.17],[2,7,.23],[7,8,.20],[2,9,.23],[9,10,.20],[3,5,0],[7,9,0]].map(([a,b,w])=>({a,b,w,l:len(sub(pos[a],pos[b]))}));let r={nodes,links,life:16,isPlayer};ragdolls.push(r);if(ragdolls.length>14)ragdolls.shift();return r;}
function kill(e,force,head=false){if(e.hp<=0&&e.dead)return;e.dead=true;e.hp=0;if(e.kind==='human')makeRagdoll(e.p,e.rot,force);else burst(e.p,e.kind==='drone'?[.7,.6,.3]:colors.enemy,18,3);kills++;points+=head?150:100;$('feed').innerHTML=`${head?'HEADSHOT':'HOSTILE ELIMINATED'} <b>+${head?150:100}</b>`;hitTime=.22;$('hitmarker').style.color='#d7ef72';sound('kill');}
function damageEnemy(e,damage,p,force,head=false){if(e.dead)return;if(e.def?.armor&&!head)damage*=1-e.def.armor;
 if(e.def?.shield&&!head){const toward=norm(sub(player.p,e.p)),f=[Math.sin(e.rot),0,Math.cos(e.rot)];if(dot(toward,f)>.45&&p[1]>e.p[1]+.65&&p[1]<e.p[1]+1.65)damage*=.18;}
 e.hp-=damage;e.hurtUntil=time+.2;if(time>(e.voiceAt||0)){sound('hurt',e.p);e.voiceAt=time+.7;}burst(p,colors.red,head?23:13,2.3);hitTime=.13;$('hitmarker').style.color='#ffffff';sound('hit');e.alert=5;e.suppressed=2;e.lastKnown=[...player.p];e.memory=6;e.decision=0;if(e.hp<=0)kill(e,force,head);}
function hurt(amount){if(state!=='playing')return;player.hp-=amount;damageFlash=.75;player.hurt=time;if(player.hp<=0){player.hp=0;state='dead';deadTime=0;mouse=false;ads=false;makeRagdoll(player.p,yaw,[Math.sin(yaw)*-4,2,-Math.cos(yaw)*-4],true);document.exitPointerLock?.();$('summary').textContent=`${kills} eliminations · Wave ${wave} · ${points.toLocaleString()} points`;}}
// A navigation grid lets enemies route around containers and the central partitions.
const gridW=41,gridH=49,grid=[];for(let z=0;z<gridH;z++)for(let x=0;x<gridW;x++)grid.push(!collide([x-20,0,z-24],.47));
function cell(p){return[clamp(Math.round(p[0]+20),0,gridW-1),clamp(Math.round(p[2]+24),0,gridH-1)];}
function pathTo(a,b){let[x,z]=cell(a),[gx,gz]=cell(b),start=z*gridW+x,target=gz*gridW+gx; if(!grid[start]){let best=Infinity;for(let i=0;i<grid.length;i++)if(grid[i]){let d=(i%gridW-x)**2+(Math.floor(i/gridW)-z)**2;if(d<best){best=d;start=i;}}}let q=[start],prev=new Int32Array(grid.length).fill(-1);prev[start]=start;let found=false;for(let k=0;k<q.length;k++){let cur=q[k];if(cur===target){found=true;break;}let cx=cur%gridW,cz=Math.floor(cur/gridW);for(let[nx,nz]of[[cx-1,cz],[cx+1,cz],[cx,cz-1],[cx,cz+1]]){if(nx<0||nx>=gridW||nz<0||nz>=gridH)continue;let n=nz*gridW+nx;if(grid[n]&&prev[n]===-1){prev[n]=cur;q.push(n);}}}if(!found){let best=start,score=Infinity;for(let n of q){let d=(n%gridW-gx)**2+(Math.floor(n/gridW)-gz)**2;if(d<score){best=n;score=d;}}target=best;}let route=[],c=target;while(c!==start){route.push([c%gridW-20,0,Math.floor(c/gridW)-24]);c=prev[c];}return route.reverse();}
const spawns=[[-14,0,-19],[0,0,-19],[15,0,-10],[-15,0,0],[14,0,19],[-14,0,19],[0,0,7],[13,0,-19]];
// Base weights; capped specialists are removed and remaining weights renormalized.
const factions=[
 {name:'Street Thugs',variants:[
 {id:'bat',label:'Bat thug',weight:55,hp:65,melee:true,damage:12,speed:.9,rate:1.3,color:[.39,.24,.17]},
 {id:'cheapPistol',label:'Pistol thug',weight:35,hp:65,damage:6,speed:.8,rate:1.6,spread:1.8,color:[.37,.30,.20]},
 {id:'thugSmg',label:'SMG thug',weight:10,hp:75,damage:5,speed:.95,rate:1.7,spread:1.65,burst:3,strong:true,color:[.46,.18,.14]}]},
 {name:'Police Officers',variants:[
 {id:'officer',label:'Pistol officer',weight:65,hp:85,damage:7,speed:.95,rate:1.25,spread:1.25,color:[.12,.23,.43]},
 {id:'pump',label:'Pump shotgun officer',weight:25,hp:90,damage:20,speed:.85,rate:1.8,spread:1.6,range:12,strong:true,color:[.16,.26,.39]},
 {id:'taser',label:'Taser officer',weight:10,hp:80,damage:0,speed:1,rate:3,spread:2,range:0,special:'taser',strong:true,color:[.18,.31,.52]}]},
 {name:'Cartel',variants:[
 {id:'cartelSmg',label:'Aggressive SMG',weight:60,hp:95,damage:7,speed:1.2,rate:1.3,spread:1.1,burst:3,color:[.42,.30,.15]},
 {id:'cartelMachete',label:'Machete runner',weight:30,hp:80,damage:23,speed:1.5,rate:1,melee:true,color:[.49,.21,.16]},
 {id:'grenadier',label:'Armored grenadier',weight:10,hp:110,armor:.18,damage:7,speed:.85,rate:1.7,spread:1.3,special:'frag',strong:true,color:[.36,.38,.17]}]},
 {name:'Mercenaries',variants:[
 {id:'silencedPistol',label:'Suppressed pistol / smoke',weight:60,hp:100,damage:8,speed:1.12,rate:1.3,spread:.95,suppressed:true,special:'smoke',color:[.32,.34,.30]},
 {id:'silencedSmg',label:'Suppressed SMG',weight:30,hp:105,armor:.1,damage:7,speed:1.18,rate:1.2,spread:1,burst:3,suppressed:true,color:[.25,.32,.29]},
 {id:'miner',label:'Mine planter',weight:10,hp:100,damage:6,speed:1,rate:1.8,spread:1.4,special:'mine',strong:true,color:[.48,.38,.18]}]},
 {name:'SWAT Team',variants:[
 {id:'swat',label:'Assault operator',weight:62,hp:110,armor:.15,damage:8,speed:1.05,rate:1.3,spread:.85,burst:3,color:[.15,.23,.29]},
 {id:'flasher',label:'Flash specialist',weight:14,hp:105,armor:.1,damage:7,speed:1,rate:1.5,spread:.95,special:'flash',strong:true,color:[.20,.29,.35]},
 {id:'shield',label:'Riot shield / Desert Eagle',weight:11,hp:115,shield:true,damage:16,speed:.66,rate:2,spread:1.2,strong:true,color:[.13,.18,.23]},
 {id:'marksman',label:'Precision marksman',weight:9,hp:95,damage:0,speed:.62,rate:3,spread:.6,special:'precision',strong:true,color:[.24,.28,.29]},
 {id:'heavy',label:'Armored LMG heavy',weight:4,hp:165,armor:.35,damage:8,speed:.55,rate:1.8,spread:1.35,burst:5,strong:true,color:[.12,.16,.19]}]}
];
function factionFor(w){return factions[w<5?0:w<10?1:w<15?2:w<20?3:4];}
function planWave(w,rng=Math.random){const f=factionFor(w),total=humanCount(w),dogs=w>=5&&w<=9&&rng()<.1?3:0,drone=w>=15&&rng()<.1;const n=total-dogs-(w<=20&&drone?1:0),roster=[],counts={};let strong=0;for(let i=0;i<n;i++){let eligible=f.variants.filter(d=>(!d.strong||strong<Math.max(1,Math.floor(n*.3)))&&(d.id!=='heavy'||(counts.heavy||0)<(n>=20?2:1))&&(d.id!=='miner'||(counts.miner||0)<2)&&(d.id!=='shield'||(counts.shield||0)<Math.max(1,Math.floor(n/8))));let sum=eligible.reduce((a,d)=>a+d.weight,0),v=rng()*sum,choice=eligible[eligible.length-1];for(let d of eligible){v-=d.weight;if(v<0){choice=d;break;}}roster.push(choice);counts[choice.id]=(counts[choice.id]||0)+1;if(choice.strong)strong++;}return {faction:f.name,roster,dogs,drone,total:n+dogs+(drone?1:0)};}
function spawnWave(){mines=[];smokes=[];grenades=[];enemies=[];resupply();const plan=planWave(wave),available=grid.map((ok,i)=>ok?[i%gridW-20,0,Math.floor(i/gridW)-24]:null).filter(p=>p&&len(sub(p,player.p))>12);const occupied=[];function spawnPoint(){let best=null,score=-Infinity;for(let j=0;j<80;j++){let p=available[Math.floor(Math.random()*available.length)]||[0,0,-20],d=occupied.length?Math.min(...occupied.map(q=>len(sub(q,p)))):20;if(d>score){best=p;score=d;}if(d>2.5)break;}occupied.push(best);return best;}
 for(let d of plan.roster)enemies.push(makeEnemy(spawnPoint(),enemies.length,d));
 for(let i=0;i<plan.dogs;i++)enemies.push(makeEnemy(spawnPoint(),enemies.length,{id:'k9',label:'Police K9',hp:55,damage:14,speed:1.45,rate:1,melee:true,color:[.32,.22,.14]},'dog'));
 if(plan.drone)enemies.push(makeEnemy([0,5,-17],enemies.length,{id:'drone',label:'Strike drone',hp:65},'drone'));
 profile.bestWave=Math.max(profile.bestWave,wave);saveProfile();message('WAVE '+wave+' / '+plan.faction.toUpperCase()+' / '+plan.total+' HOSTILES',3);
}
function makeEnemy(p,id=0,def=factionFor(wave).variants[0],kind='human'){return {p:[...p],hp:def.hp,def,kind,rot:0,dead:false,shoot:rand(.8,1.8),path:[],repath:0,phase:rand(0,6),alert:0,id,role:def.melee?'assault':id%3===0?'flanker':id%3===1?'assault':'support',mode:'search',decision:0,goal:null,lastKnown:[0,0,18],memory:3,suppressed:0,crouch:0,burst:0,mag:18,reloading:0,strafe:id%2?1:-1,stuck:0,walk:0,gait:0,flash:0,seen:0,stunUntil:0,danceUntil:0,blindUntil:0,specialAt:time+rand(5,9),windup:null,born:time,struck:false,nextBeep:time};}
function canSee(e,a,b){return time>=e.blindUntil&&!smokeBlocks(a,b)&&visible(a,b);}
function updateMeleeEnemy(e,dt){if(e.windup){e.walk=0;if(time>=e.windup.at){if(len(sub(e.p,player.p))<(e.kind==='dog'?1.6:2.1)&&visible(add(e.p,[0,.7,0]),add(player.p,[0,.6,0])))hurt(e.def.damage);e.windup=null;e.shoot=e.def.rate;}return;}e.shoot-=dt;e.repath-=dt;let d=sub(player.p,e.p),dist=len(d);e.rot=Math.atan2(d[0],d[2]);if(dist<(e.kind==='dog'?1.4:1.8)&&e.shoot<=0&&canSee(e,add(e.p,[0,.7,0]),cam)){e.windup={kind:'melee',at:time+.55};sound('meleeWarning',e.p);return;}if(e.repath<=0){e.path=pathTo(e.p,player.p);e.repath=.65;}let before=[...e.p];while(e.path.length&&len(sub(e.path[0],e.p))<.3)e.path.shift();if(e.path.length){let v=norm(sub(e.path[0],e.p));move(e.p,v[0]*dt*2.8*e.def.speed,v[2]*dt*2.8*e.def.speed,.35,e.kind==='dog'?.8:1.85);}for(let a of enemies){if(a===e||a.dead||a.kind==='drone')continue;let v=sub(e.p,a.p),l=len(v);if(l<.8&&l>.001)move(e.p,v[0]/l*dt,v[2]/l*dt,.35);}e.walk=len(sub(e.p,before))/Math.max(dt,.001);e.gait+=e.walk*dt*5;}
function updateSpecial(e,dt){if(!e.def.special)return;const kind=e.def.special,top=add(e.p,[0,1.4,0]),dist=len(sub(e.p,player.p));if(e.windup){if(time<e.windup.at)return;const target=e.windup.target;e.windup=null;e.specialAt=time+(kind==='mine'?8:kind==='precision'?4:12);if(kind==='mine'){if(mines.length<6&&dist>3)mines.push({p:add(e.p,[0,.12,0]),armedAt:time+1.5,dead:false,hp:15});return;}if(kind==='taser'||kind==='precision'){if(canSee(e,top,cam)&&len(sub(cam,target))<(kind==='taser'?1.4:.9)){hurt(kind==='taser'?7:22);if(kind==='taser')playerSlow=Math.max(playerSlow,time+1.5);}tracers.push({a:top,b:target,life:.15,col:kind==='taser'?[.3,.7,1]:[1,.2,.1]});sound(kind==='taser'?'taser':'sniper',e.p);return;}
 const travel=.9,delta=sub(target,top);grenades.push({p:top,v:[delta[0]/travel,delta[1]/travel+6*travel,delta[2]/travel],life:1.6,kind,owner:'enemy'});sound('throw',e.p);return;}
 if(time<e.specialAt||time<e.blindUntil)return;if(kind==='mine'){if(mines.length>=6||dist<4||mines.some(m=>len(sub(m.p,e.p))<3)){e.specialAt=time+1;return;}e.windup={kind,at:time+1,target:[...e.p]};}else if(dist<(kind==='taser'?7:kind==='precision'?36:20)&&canSee(e,top,cam)){e.windup={kind,at:time+(kind==='precision'?1.3:1),target:[...cam]};sound('warning',e.p);if(dist<18)message(kind==='taser'?'TASER CHARGING — BREAK SIGHT':kind==='precision'?'MARKSMAN AIMING — MOVE':'HOSTILE '+kind.toUpperCase()+' — MOVE',1);}}
function updateDrone(e,dt){if(e.dead)return;const age=time-e.born;if(time<e.stunUntil||time<e.danceUntil)return;e.p=[Math.sin(age*.65+e.phase)*12,5+Math.sin(age*1.7)*.5,Math.cos(age*.65+e.phase)*14];if(time>=e.nextBeep){sound(age>=7?'droneWarning':'drone',e.p);e.nextBeep=time+(age>=7?.5:1);if(age>=7)message('DRONE STRIKE IN '+Math.max(1,Math.ceil(10-age))+' — SHOOT IT DOWN',.6);}if(age>=10&&time>=e.blindUntil&&!e.struck){e.struck=true;e.dead=true;e.hp=0;hurt(player.maxHp*.5);sound('boom');burst(add(player.p,[0,1,0]),[1,.5,.1],35,4);}}

function reset(){drawStarted=-10;inspectStarted=-10;attackStarted=-10;crouching=false;cameraFov=78;currentSpeed=0;attackUntil=0;meleePending=null;$('smokeVeil').style.opacity=0;$('flashVeil').style.opacity=0;smokes=[];mines=[];equipmentCooldown=0;useAction=null;burstLeft=0;burstTimer=0;playerSlow=0;flashUntil=0;waveRewarded=0;syncLoadout();player={p:[0,0,18],safe:[0,0,18],hp:100,maxHp:100,vy:0,hurt:-10};yaw=0;pitch=0;weapon=0;kills=0;points=0;wave=1;waveWait=0;ragdolls=[];grenades=[];particles=[];tracers=[];marks=[];stamina=100;slide=0;slideCD=0;reload=0;fireTimer=0;kick=0;recoil=0;damageFlash=0;keys={};mouse=false;ads=false;time=0;aimBlend=0;gunPitch=0;gunVelocity=0;gunRoll=0;recoilYaw=0;shotHeat=0;muzzleTime=0;switchTime=0;shotCount=0;cam=[0,1.68,18];eye=[...cam];spawnWave();}
function capture(){try{let request=canvas.requestPointerLock?.();request?.catch(()=>{pause();$('pause').querySelector('p').textContent='Mouse capture was denied. Click Resume, or open BREACH.html in a desktop browser.';});}catch{pause();}}
function start(){difficulty=$('difficulty').value;sens=+$('sensitivity').value;reset();state='playing';$('menu').classList.add('hidden');$('death').classList.add('hidden');$('pause').classList.add('hidden');$('hud').classList.remove('hidden');sound('click');capture();}
function resume(){if(panelOpen)return;state='playing';last=performance.now();$('pause').classList.add('hidden');capture();}
function pause(){if(state!=='playing')return;state='paused';keys={};mouse=false;ads=false;$('pause').classList.remove('hidden');}
function selectWeapon(n){if(state!=='playing'||!Number.isInteger(n)||n<0||n>2||n===weapon)return false;weapon=n;reload=0;burstLeft=0;useAction=null;meleePending=null;startDrawAnimation();switchTime=weapons[weapon].id==='karambit'?.72:.25;attackStarted=-10;mouse=false;ads=false;sound('switch');return true;}
function doReload(){if(state!=='playing')return;let w=weapons[weapon];if(w.category==='Equipment'||w.melee||reload||useAction||w.ammo===w.cap||w.reserve<=0)return;reload=w.reload;burstLeft=0;sound('reload_'+w.id);message('RELOADING',w.reload);}
function throwGrenade(){if(state!=='playing'||equipmentCooldown>0||useAction||reload||switchTime>0)return false;let w=weapons[2];if(w.ammo<=0){message('EQUIPMENT EMPTY');return false;}if(w.id==='bandage'){if(player.hp>=player.maxHp){message('HEALTH FULL');return false;}w.ammo--;equipmentCooldown=2.4;useAction={id:w.id,finish:time+2.4,heal:w.heal};sound('bandage');message('BANDAGING / 2.4 SECONDS',2.4);return true;}
 w.ammo--;equipmentCooldown=w.rate;attackUntil=time+.35;let d=direction();grenades.push({p:add(cam,mul(d,.45)),v:add(mul(d,12),[0,3.1,0]),life:w.id==='frag'?2:1.1,kind:w.id,owner:'player'});sound(w.id);return true;}
function shoot(){if(state!=='playing'||reload||fireTimer>0||switchTime>0||useAction||burstLeft>0)return;if(weapon===2){throwGrenade();return;}let w=weapons[weapon];if(w.melee){inspectStarted=-10;attackStarted=time;fireTimer=w.rate;attackUntil=time+w.rate;meleePending={id:w.id,at:time+(w.id==='machete'?.23:.12)};sound(w.id);return;}if(w.ammo<=0){doReload();fireTimer=.2;return;}if(w.burst){burstLeft=Math.min(w.burst,w.ammo);burstItem=w.id;burstTimer=0;fireTimer=w.rate+.18;return;}fireRound(w);fireTimer=w.rate;}
function enemyBounds(e){if(e.kind==='drone')return {min:add(e.p,[-.85,-.35,-.85]),max:add(e.p,[.85,.35,.85])};if(e.kind==='dog')return {min:add(e.p,[-.38,.12,-.6]),max:add(e.p,[.38,.85,.6])};if(time<e.stunUntil)return {min:add(e.p,[-.45,.05,-.8]),max:add(e.p,[.45,.55,.8])};const duck=(e.crouch||0)*.55+(e.stunUntil>0&&time>=e.stunUntil?Math.max(0,1-(time-e.stunUntil)/.4)*.65:0),scale=e.def.id==='heavy'?1.15:1;return {min:add(e.p,[-.32*scale,.1,-.32*scale]),max:add(e.p,[.32*scale,(1.97-duck)*scale,.32*scale])};}
function fireRound(w){if(w.ammo<=0)return;w.ammo--;shotCount++;kick=w.id==='sniper'||w.id==='double'?.15:.075;recoil=Math.min(.13,recoil+(ads?.008:.018)*(w.id==='smg'?1.3:1));recoilYaw+=Math.sin(shotCount*2.4)*(ads?.002:.005);gunVelocity+=w.id==='double'?3.2:1.7;gunRoll+=Math.sin(shotCount*1.7)*.012;shotHeat=Math.min(1,shotHeat+.15);muzzleTime=.045;sound(w.id);
 if(w.id==='rpg'){grenades.push({p:add(cam,mul(direction(),.6)),v:mul(direction(),30),life:2.5,kind:'rpg',owner:'player'});return;}
 let spread=w.spread*(ads?.25:slide>0?2:1)*(1+shotHeat*.8);for(let k=0;k<(w.pellets||1);k++){const dir=norm(add(direction(),[rand(-spread,spread),rand(-spread,spread),rand(-spread,spread)]));let nearest=wallRay(cam,dir),target=null,mine=null,head=false;
 for(let e of enemies){if(e.dead)continue;let t=rayBox(cam,dir,enemyBounds(e));if(t<nearest){nearest=t;target=e;head=e.kind==='human'&&time>=e.stunUntil&&cam[1]+dir[1]*t>e.p[1]+1.55-(e.crouch||0)*.55;}}
 for(let m of mines){if(m.dead)continue;let t=rayBox(cam,dir,{min:add(m.p,[-.28,-.13,-.28]),max:add(m.p,[.28,.18,.28])});if(t<nearest){nearest=t;mine=m;target=null;}}
 let impact=add(cam,mul(dir,nearest));tracers.push({a:add(cam,mul(dir,.6)),b:impact,life:.045,col:[1,.85,.4]});if(mine){mine.hp-=w.damage;if(mine.hp<=0)detonateMine(mine);}else if(target){let falloff=nearest<=w.range?1:Math.max(w.id==='double'?.12:.35,1-(nearest-w.range)/(w.range*1.5));damageEnemy(target,w.damage*falloff*(head?2.4:1),impact,mul(dir,5),head);}else if(nearest<99){burst(impact,[.72,.66,.45],3,1.2);marks.push({p:impact,life:12});if(marks.length>60)marks.shift();}}
 for(let e of enemies)if(!e.dead&&len(sub(e.p,player.p))<24){e.lastKnown=[...player.p];e.memory=5;if(e.mode==='search')e.decision=0;}let right=[Math.cos(yaw),0,Math.sin(yaw)];particles.push({p:add(cam,add(mul(direction(),.5),mul(right,.2))),v:add(mul(right,2),[0,1.5,0]),life:.9,max:1,s:.035,col:[.75,.58,.22]});}
function resolveMelee(){const w=pools[meleePending.id],dir=direction();let best=null,dist=w.reach;for(let e of enemies){if(e.dead)continue;let center=mul(add(enemyBounds(e).min,enemyBounds(e).max),.5),delta=sub(center,cam),d=len(delta);if(d<dist&&dot(norm(delta),dir)>.62&&visible(cam,center)){best=e;dist=d;}}if(best)damageEnemy(best,w.damage,add(best.p,[0,.9,0]),mul(dir,4));meleePending=null;}

function segmentSphere(a,b,p,r){const d=sub(b,a),l=dot(d,d);const t=l?clamp(dot(sub(p,a),d)/l,0,1):0;return len(sub(add(a,mul(d,t)),p))<r;}
function smokeBlocks(a,b){return smokes.some(s=>time<s.end&&segmentSphere(a,b,s.p,s.radius));}
function makeSmoke(p,owner='player'){if(smokes.length>=12)return false;const cloud={p:[p[0],Math.max(1.8,p[1]),p[2]],radius:5.5,end:time+10,owner,affected:new Set()};smokes.push(cloud);sound('smoke',p);affectSmoke(cloud);}
function affectSmoke(s){for(let e of enemies)if(!e.dead&&!s.affected.has(e.id)&&len(sub(add(e.p,[0,1,0]),s.p))<s.radius){s.affected.add(e.id);e.blindUntil=Math.max(e.blindUntil,time+5);e.windup=null;}}
function applyEffect(kind,p){for(let e of enemies){if(e.dead||len(sub(add(e.p,[0,1,0]),p))>7||!visible(p,add(e.p,[0,1,0])))continue;const field=kind==='flash'?'stunUntil':'danceUntil';e[field]=Math.max(e[field],time+5);e.windup=null;e.burst=0;e.flash=0;}sound(kind,p);burst(p,kind==='flash'?[1,1,.8]:[.6,.2,1],32,4);}
function explode(g){if(g.exploded)return;g.exploded=true;const kind=g.kind||'frag';if(kind==='smoke'){makeSmoke(g.p,g.owner);return;}if(kind==='flash'||kind==='boogie'){applyEffect(kind,g.p);if(kind==='flash'&&len(sub(cam,g.p))<7&&visible(cam,g.p)){flashUntil=Math.max(flashUntil,time+(g.owner==='enemy'?2:1));}return;}
 sound('boom',g.p);burst(g.p,[1,.48,.08],45,7);burst(g.p,[.23,.25,.23],24,4);const radius=kind==='rpg'?8:kind==='mine'?4.5:7,damage=kind==='rpg'?260:kind==='mine'?85:180;
 for(let e of enemies){if(e.dead)continue;let pos=add(e.p,[0,e.kind==='drone'?0:1,0]),d=len(sub(pos,g.p));if(d<radius&&visible(add(g.p,[0,.2,0]),pos))damageEnemy(e,damage*(1-d/radius),pos,mul(norm(sub(pos,g.p)),10));}
 const pos=add(player.p,[0,.7,0]),d=len(sub(pos,g.p));if(d<radius&&visible(add(g.p,[0,.2,0]),pos))hurt((kind==='mine'?45:kind==='rpg'?120:85)*(1-d/radius));
 for(let m of mines)if(!m.dead&&len(sub(m.p,g.p))<radius&&visible(g.p,add(m.p,[0,.15,0])))detonateMine(m);}
function detonateMine(m){if(m.dead)return;m.dead=true;explode({p:[...m.p],kind:'mine'});}
function insideRocket(g,prior){const delta=sub(g.p,prior),length=len(delta),dir=norm(delta);return wallRay(prior,dir,length)<length||enemies.some(e=>!e.dead&&rayBox(prior,dir,enemyBounds(e),length)<length);}
function updateEffects(dt){equipmentCooldown=Math.max(0,equipmentCooldown-dt);if(useAction&&time>=useAction.finish){player.hp=Math.min(player.maxHp,player.hp+useAction.heal);useAction=null;sound('heal');}if(meleePending&&time>=meleePending.at)resolveMelee();if(burstLeft>0){burstTimer-=dt;if(burstTimer<=0){if(weapons[weapon].id!==burstItem||reload||weapons[weapon].ammo<=0)burstLeft=0;else{fireRound(weapons[weapon]);burstLeft--;burstTimer=.09;}}}smokes=smokes.filter(s=>time<s.end);for(let s of smokes)affectSmoke(s);for(let m of mines)if(!m.dead&&time>=m.armedAt&&Math.hypot(m.p[0]-player.p[0],m.p[2]-player.p[2])<1.1)detonateMine(m);mines=mines.filter(m=>!m.dead);
 let density=0;for(let s of smokes){let d=len(sub(cam,s.p));density=Math.max(density,clamp((s.radius-d)/1.5,0,1)*clamp(s.end-time,0,1)*.96);}$('smokeVeil').style.opacity=density;$('flashVeil').style.opacity=clamp(flashUntil-time,0,1)*.9;
}

$('start').onclick=start;$('resume').onclick=resume;$('restart').onclick=start;$('restartPause').onclick=start;$('sound').onclick=()=>{muted=!muted;$('sound').textContent=muted?'AUDIO OFF':'AUDIO ON';};
document.addEventListener('pointerlockchange',()=>{if(document.pointerLockElement!==canvas)pause();});
document.addEventListener('pointerlockerror',()=>{$('error').textContent='Click the game to capture your mouse. If embedded, open the game link in a desktop browser.';});
canvas.addEventListener('click',()=>{if(state==='playing'&&document.pointerLockElement!==canvas)capture();});
let ignoreMouseUntil=0;
document.addEventListener('pointerlockchange',()=>{ignoreMouseUntil=performance.now()+120;});
document.addEventListener('mousemove',e=>{if(state!=='playing'||document.pointerLockElement!==canvas||performance.now()<ignoreMouseUntil)return;const x=e.movementX,y=e.movementY;if(!Number.isFinite(x)||!Number.isFinite(y)||Math.abs(x)>180||Math.abs(y)>180)return;yaw=(yaw+x*.0021*sens)%(Math.PI*2);pitch=clamp(pitch-y*.0021*sens,-1.35,1.35);swayX=clamp(swayX-x*.00025,-.035,.035);swayY=clamp(swayY+y*.00025,-.025,.025);});
document.addEventListener('mousedown',e=>{if(state!=='playing'||document.pointerLockElement!==canvas||panelOpen)return;if(e.button===0){mouse=true;shoot();}if(e.button===2&&weapons[weapon].category!=='Equipment'&&!weapons[weapon].melee)ads=true;});
document.addEventListener('mouseup',e=>{if(e.button===0)mouse=false;if(e.button===2)ads=false;});document.addEventListener('contextmenu',e=>e.preventDefault());
document.addEventListener('wheel',e=>{if(state==='playing'&&!panelOpen&&document.pointerLockElement===canvas){e.preventDefault();selectWeapon((weapon+(e.deltaY>0?1:2))%3);}},{passive:false});
document.addEventListener('keydown',e=>{if(['Space','KeyW','KeyA','KeyS','KeyD','Tab'].includes(e.code)&&state==='playing')e.preventDefault();if(e.repeat)return;if(e.code==='Escape'&&panelOpen){closeArmory();return;}if(e.code==='KeyI'&&(state==='playing'||state==='paused'||state==='menu')){if(panelOpen)closeArmory();else openArmory();return;}keys[e.code]=true;if(state!=='playing'||panelOpen)return;if(e.code==='KeyF'&&weapons[weapon].id==='karambit'&&switchTime<=0&&fireTimer<=0){inspectStarted=time;sound('switch');}if(e.code==='KeyR')doReload();if(e.code==='Digit1')selectWeapon(0);if(e.code==='Digit2')selectWeapon(1);if(e.code==='Digit3')selectWeapon(2);if(e.code==='KeyG')throwGrenade();if(e.code==='KeyC')toggleCrouch();if(e.code==='Escape'){pause();document.exitPointerLock?.();}if(e.code==='Space'&&player.p[1]<=.001&&slide<=0&&!crouching&&!collide(add(player.p,[0,.6,0]),.3,1.85)){player.vy=5.2;sound('step');}});
document.addEventListener('keyup',e=>keys[e.code]=false);window.addEventListener('blur',()=>{pause();if(document.pointerLockElement)document.exitPointerLock();});

function updatePhysics(dt){for(let r of ragdolls){r.life-=dt;const step=Math.min(dt,.025);for(let n of r.nodes){let v=mul(sub(n.p,n.old),.985);n.old=[...n.p];let next=add(n.p,add(v,[0,-20*step*step,0]));if(collide([next[0],next[1]-.05,next[2]],.08)&&next[1]>.15){next[0]=n.p[0];next[2]=n.p[2];}n.p=next;if(n.p[1]<.12){n.p[1]=.12;n.old[0]=lerp(n.old[0],n.p[0],.25);n.old[2]=lerp(n.old[2],n.p[2],.25);}}for(let j=0;j<7;j++)for(let l of r.links){let a=r.nodes[l.a].p,b=r.nodes[l.b].p,delta=sub(b,a),dist=len(delta),cor=mul(delta,(dist-l.l)/(dist||1)*.5);r.nodes[l.a].p=add(a,cor);r.nodes[l.b].p=sub(b,cor);r.nodes[l.a].p[1]=Math.max(.12,r.nodes[l.a].p[1]);r.nodes[l.b].p[1]=Math.max(.12,r.nodes[l.b].p[1]);}}ragdolls=ragdolls.filter(r=>r.life>0);
for(let p of particles){p.life-=dt;p.v[1]-=13*dt;p.p=add(p.p,mul(p.v,dt));if(p.p[1]<.025){p.p[1]=.025;p.v=mul(p.v,.65);p.v[1]=Math.abs(p.v[1])*.25;}}particles=particles.filter(p=>p.life>0);for(let t of tracers)t.life-=dt;tracers=tracers.filter(t=>t.life>0);for(let m of marks)m.life-=dt;marks=marks.filter(m=>m.life>0);
for(let g of grenades){const previous=[...g.p];g.life-=dt;if(g.kind!=='rpg')g.v[1]-=12*dt;for(let axis=0;axis<3;axis++){let p=[...g.p];p[axis]+=g.v[axis]*dt;let inside=walls.some(b=>p.every((v,i)=>v>b.min[i]-.09&&v<b.max[i]+.09));if(inside){if(g.kind==='rpg')g.life=0;g.v[axis]*=-.52;if(axis===1){g.v[0]*=.8;g.v[2]*=.8;}}else g.p=p;}if(g.p[1]<.12){g.p[1]=.12;g.v[1]=Math.abs(g.v[1])*.45;g.v[0]*=.9;g.v[2]*=.9;}if(g.kind==='rpg'&&insideRocket(g,previous))g.life=0;if(g.life<=0)explode(g);}grenades=grenades.filter(g=>g.life>0);}
function nearestOpen(p){let best=null,score=Infinity;for(let z=Math.max(0,Math.floor(p[2]+24)-6);z<=Math.min(gridH-1,Math.ceil(p[2]+24)+6);z++)for(let x=Math.max(0,Math.floor(p[0]+20)-6);x<=Math.min(gridW-1,Math.ceil(p[0]+20)+6);x++){if(!grid[z*gridW+x])continue;let q=[x-20,0,z-24],d=len(sub(q,p));if(d<score){best=q;score=d;}}return best;}
function chooseCover(e,threat){let best=null,score=Infinity;for(let b of walls){if(b.max[1]<.6||b.max[1]>4)continue;let cx=(b.min[0]+b.max[0])/2,cz=(b.min[2]+b.max[2])/2;for(let q of[[b.min[0]-.8,0,cz],[b.max[0]+.8,0,cz],[cx,0,b.min[2]-.8],[cx,0,b.max[2]+.8]]){if(collide(q,.45)||len(sub(q,e.p))>12||visible(add(q,[0,.85,0]),threat))continue;let crowd=enemies.filter(other=>other!==e&&!other.dead&&other.goal&&len(sub(other.goal,q))<2).length;let value=len(sub(q,e.p))+Math.abs(len(sub(q,threat))-10)*.25+crowd*8;if(value<score){best=q;score=value;}}}return best;}
function decideEnemy(e,los,dist,threat){
 const danger=grenades.find(g=>g.life<1.8&&len(sub(g.p,e.p))<6&&visible(add(e.p,[0,1,0]),g.p));
 if(danger){let away=norm(sub(e.p,danger.p)),best=null,score=-Infinity;for(let a of[0,.65,-.65,1.3,-1.3]){let q=nearestOpen(add(e.p,[ (away[0]*Math.cos(a)-away[2]*Math.sin(a))*7,0,(away[0]*Math.sin(a)+away[2]*Math.cos(a))*7]));if(q){let value=len(sub(q,danger.p))-len(sub(q,e.p))*.1;if(value>score){best=q;score=value;}}}e.mode='evade';e.goal=best;e.decision=.22;return;}
 if(e.mode==='cover'&&e.goal&&len(sub(e.goal,e.p))<1&&e.reloading<=0){let side=[Math.cos(e.rot)*e.strafe,0,-Math.sin(e.rot)*e.strafe];e.goal=nearestOpen(add(e.p,mul(side,2.8)));e.mode='peek';e.decision=1.4;return;}
 if((e.suppressed>.3||e.reloading>0||e.hp<40)&&e.mode!=='peek'){let cover=chooseCover(e,threat);if(cover){e.goal=cover;e.mode='cover';e.decision=rand(.9,1.5);return;}}
 
 if(e.role==='flanker'&&dist>6&&e.memory>0){let delta=norm(sub(e.p,e.lastKnown)),side=[delta[2]*e.strafe,0,-delta[0]*e.strafe];e.goal=nearestOpen(add(e.lastKnown,add(mul(delta,6),mul(side,7))));e.mode='flank';e.decision=2.2;return;}
 if(los&&dist<21){e.mode='engage';let delta=norm(sub(e.p,e.lastKnown)),range=e.role==='support'?13:8;let goal=add(e.lastKnown,add(mul(delta,range),[delta[2]*e.strafe*3,0,-delta[0]*e.strafe*3]));e.goal=nearestOpen(goal);e.strafe*=-1;e.decision=rand(.9,1.6);}
 else{e.mode='search';e.goal=nearestOpen(e.lastKnown);if(e.goal&&len(sub(e.goal,e.p))<1)e.goal=nearestOpen(add(e.lastKnown,[rand(-6,6),0,rand(-6,6)]));e.decision=1.4;}
}
function updateEnemy(e,dt,sprint){
 if(e.dead)return;if(e.kind==='drone'){updateDrone(e,dt);return;}
 if(time<e.stunUntil||time<e.danceUntil){e.walk=0;e.flash=0;return;}
 if(e.kind==='dog'||e.def.melee){updateMeleeEnemy(e,dt);return;}
 updateSpecial(e,dt);if(e.windup?.kind==='mine'){e.crouch=lerp(e.crouch,.85,1-Math.exp(-dt*12));e.walk=0;return;}
 e.suppressed=Math.max(0,e.suppressed-dt);e.memory=Math.max(0,e.memory-dt);e.flash=Math.max(0,e.flash-dt);e.reloading=Math.max(0,e.reloading-dt);e.shoot-=dt;e.decision-=dt;e.repath-=dt;
 let top=add(e.p,[0,1.58-e.crouch*.55,0]),delta=sub(cam,top),dist=len(delta),los=dist<32&&canSee(e,top,cam);
 if(los){e.lastKnown=[...player.p];e.memory=6;e.seen+=dt;e.unseen=0;}else{e.seen=0;e.unseen=(e.unseen||0)+dt;if(e.unseen>10){e.lastKnown=[...player.p];e.memory=3;e.decision=0;e.unseen=0;}} 
 let facing=sub(e.lastKnown,e.p),desired=Math.atan2(facing[0],facing[2]);e.rot+=Math.atan2(Math.sin(desired-e.rot),Math.cos(desired-e.rot))*Math.min(1,dt*9);
 e.dangerCheck=(e.dangerCheck||0)-dt;if(e.dangerCheck<=0){e.dangerCheck=.15;if(e.mode!=='evade'&&grenades.some(g=>g.life<1.8&&len(sub(g.p,e.p))<6&&visible(top,g.p)))e.decision=0;}
 if(e.decision<=0)decideEnemy(e,los,dist,add(e.lastKnown,[0,1.65,0]));
 if(e.repath<=0&&e.goal){e.path=pathTo(e.p,e.goal);e.repath=rand(.65,1.05);}
 let before=[...e.p],arrived=e.goal&&len(sub(e.goal,e.p))<.7;e.crouch=lerp(e.crouch,e.mode==='cover'&&arrived?1:0,Math.min(1,dt*10));
 if(e.path.length&&!arrived){while(e.path.length&&Math.hypot(e.path[0][0]-e.p[0],e.path[0][2]-e.p[2])<.32)e.path.shift();if(e.path.length){let d=norm(sub(e.path[0],e.p)),speed=(e.mode==='evade'?4.8:e.mode==='flank'||!los?3.3:2.25)*e.def.speed;move(e.p,d[0]*dt*speed,d[2]*dt*speed,.4);}}
 for(let other of enemies){if(other===e||other.dead)continue;let d=sub(e.p,other.p),l=Math.hypot(d[0],d[2]);if(l<.95&&l>.001)move(e.p,d[0]/l*dt*1.8,d[2]/l*dt*1.8,.4);}
 let moved=len(sub(e.p,before));e.walk=lerp(e.walk,moved/dt,Math.min(1,dt*10));e.gait+=moved*4;e.stuck=moved<.002&&!arrived?e.stuck+dt:0;if(e.stuck>.7){e.decision=0;e.repath=0;e.strafe*=-1;e.stuck=0;}
 top=add(e.p,[0,1.48-e.crouch*.55,0]);los=canSee(e,top,cam);let allyBlocked=enemies.some(a=>{if(a===e||a.dead)return false;let ray=norm(sub(cam,top));return rayBox(top,ray,{min:[a.p[0]-.4,.1,a.p[2]-.4],max:[a.p[0]+.4,1.95,a.p[2]+.4]},dist)<dist;});
 if(e.mag===0&&e.reloading===0){e.mag=18;e.reloading=2.1;e.decision=0;}
 if(e.def.damage>0&&los&&dist<(e.def.range||27)&&!e.windup&&!allyBlocked&&e.seen>(difficulty==='recruit'?.6:.35)&&e.shoot<=0&&e.reloading<=0&&e.mode!=='evade'&&e.crouch<.7){
 if(e.burst<=0)e.burst=e.def.burst||1;e.burst--;e.mag--;e.shoot=e.burst>0?.16:e.def.rate;e.flash=.07;
 let lead=mul(playerVelocity,difficulty==='veteran'?.1:.045),spread=(difficulty==='recruit'?.9:difficulty==='veteran'?.40:.65)*e.def.spread*(1+dist*.025)*(e.walk>1?1.25:1)*(slide>0?1.6:1);let aim=add(cam,add(lead,[rand(-spread,spread),rand(-spread*.65,spread*.65),rand(-spread,spread)])),dir=norm(sub(aim,top)),end=wallRay(top,dir,dist+2);
 tracers.push({a:top,b:add(top,mul(dir,end)),life:.065,col:[1,.65,.25]});sound(e.def.suppressed?'suppressed':'enemy',e.p);let hit=rayBox(top,dir,{min:[player.p[0]-.3,player.p[1]+.1,player.p[2]-.3],max:[player.p[0]+.3,player.p[1]+(slide>0?.9:1.85),player.p[2]+.3]},end);if(hit<end)hurt(e.def.damage*(difficulty==='veteran'?1.2:difficulty==='recruit'?.75:1));
 }
}
function update(dt){if(state!=='playing'&&state!=='dead')return;dt=clamp(dt,0,.033);time+=dt;aimBlend=lerp(aimBlend,ads?1:0,1-Math.exp(-dt*14));
// Analytic critically damped spring: stable across frame rates and pauses.
let omega=13,decay=Math.exp(-omega*dt),j=gunVelocity+omega*gunPitch;gunPitch=(gunPitch+j*dt)*decay;gunVelocity=(gunVelocity-omega*j*dt)*decay;
gunRoll*=Math.exp(-dt*12);recoilYaw*=Math.exp(-dt*9);swayX*=Math.exp(-dt*8);swayY*=Math.exp(-dt*8);shotHeat=Math.max(0,shotHeat-dt*.6);muzzleTime=Math.max(0,muzzleTime-dt);fireTimer=Math.max(0,fireTimer-dt);switchTime=Math.max(0,switchTime-dt);kick=Math.max(0,kick-dt*.6);recoil*=Math.exp(-dt*13);hitTime=Math.max(0,hitTime-dt);damageFlash=Math.max(0,damageFlash-dt*.7);noticeTime-=dt;if(noticeTime<=0)$('notice').textContent='';slideCD=Math.max(0,slideCD-dt);
if(state==='playing'){
 validatePlayer();if(reload>0){reload-=dt;if(reload<=0){let w=weapons[weapon],n=Math.min(w.cap-w.ammo,w.reserve);w.ammo+=n;w.reserve-=n;reload=0;sound('reloadEnd');}}
 updateEffects(dt);if(mouse&&weapons[weapon].auto)shoot();let f=(keys.KeyW?1:0)-(keys.KeyS?1:0),s=(keys.KeyD?1:0)-(keys.KeyA?1:0),moving=!!(f||s),sprint=(keys.ShiftLeft||keys.ShiftRight)&&moving&&!ads&&!crouching&&!useAction&&stamina>0&&slide<=0;
 const previousPosition=[...player.p];let speed=(useAction?1.4:crouching?2:ads?2.1:sprint?7.4:4.5)*(time<playerSlow?.4:1);currentSpeed=lerp(currentSpeed,moving?speed:0,1-Math.exp(-dt*15));if(sprint)stamina=Math.max(0,stamina-dt*22);else if(slide<=0)stamina=Math.min(100,stamina+dt*18);let d=norm([Math.sin(yaw)*f+Math.cos(yaw)*s,0,-Math.cos(yaw)*f+Math.sin(yaw)*s]);
 if(slide>0){slide=Math.max(0,slide-dt);move(player.p,slideDir[0]*(5+slide*8)*dt,slideDir[2]*(5+slide*8)*dt,.3,1.05);moving=true;if(slide===0&&collide(player.p,.3,1.85))crouching=true;}else move(player.p,d[0]*currentSpeed*dt,d[2]*currentSpeed*dt,.3,bodyHeight());
 player.vy-=15*dt;let newY=Math.max(0,player.p[1]+player.vy*dt);if(player.vy>0&&collide([player.p[0],newY,player.p[2]],.3,bodyHeight())){player.vy=0;newY=player.p[1];}if(newY===0)player.vy=0;player.p[1]=newY;validatePlayer();
 const actualMove=Math.hypot(player.p[0]-previousPosition[0],player.p[2]-previousPosition[2]);bob+=actualMove*(sprint?2:2.3);let h=slide>0?.78:crouching?.94:1.68;eye[1]=lerp(eye[1],player.p[1]+h+Math.sin(bob)*(actualMove>.0001?.018:0)*(1-aimBlend*.7),1-Math.exp(-dt*16));eye[0]=player.p[0];eye[2]=player.p[2];cam=[...eye];playerVelocity=mul(sub(player.p,previousPosition),1/Math.max(dt,.001));cameraFov=lerp(cameraFov,lerp(slide>0?84:sprint?83:78,weapons[weapon].id==='sniper'?28:49,aimBlend),1-Math.exp(-dt*10));
 if(time-player.hurt>8&&player.hp<50)player.hp=Math.min(50,player.hp+dt*3);
 for(let e of enemies)if(!e.dead){updateEnemy(e,dt,sprint);if(state!=='playing')break;}
 let live=enemies.filter(e=>!e.dead).length;
 if(!live&&state==='playing'){const previousWait=waveWait;waveWait+=dt;if(previousWait<=.8&&waveWait>.8&&waveRewarded!==wave){waveRewarded=wave;profile.credits+=150;saveProfile();message('SECTOR CLEAR / +150 CREDITS / RESUPPLY NEXT WAVE',3);}if(waveWait>4){wave++;waveWait=0;spawnWave();}}
 $('movement').textContent=useAction?'BANDAGING':slide>0?'SLIDING':crouching?'CROUCHING':sprint?'SPRINTING':ads?'AIMING':'COMBAT READY';$('wave').innerHTML='WAVE '+String(wave).padStart(2,'0')+'<small>'+factionFor(wave).name+' · '+(live?live+' HOSTILES REMAINING':'SECTOR SECURED')+'</small>';
}else{deadTime+=dt;cam=[player.p[0]+Math.sin(yaw+1)*4,3.1,player.p[2]+Math.cos(yaw+1)*4];if(deadTime>1.8)$('death').classList.remove('hidden');}
updatePhysics(dt);let w=weapons[weapon];$('healthText').textContent=Math.ceil(player.hp);$('health').style.width=player.hp+'%';$('health').style.background=player.hp<30?'#ee6752':'#d7ef72';$('stamina').style.width=stamina+'%';$('ammo').textContent=w.melee?'—':String(w.ammo).padStart(2,'0');$('reserve').textContent=w.melee?' MELEE':w.category==='Equipment'?' USES':' / '+w.reserve;$('weaponName').textContent=w.category.toUpperCase()+' / '+w.name;$('grenades').textContent='G / '+weapons[2].name+' × '+weapons[2].ammo;$('kills').textContent=String(kills).padStart(2,'0');$('damage').style.opacity=damageFlash;$('hitmarker').style.opacity=hitTime>0?1:0;$('crosshair').style.opacity=ads?.3:1;$('crosshair').style.transform='scale('+(1+kick*8)+')';$('slotHud').innerHTML=weapons.map((a,i)=>'<span class="'+(i===weapon?'selected':'')+'">'+(i+1)+' · '+a.category+'<b>'+a.name+'</b></span>').join('');
}

let drawStarted=-10,drawDuration=.32,inspectStarted=-10,attackStarted=-10;
function startDrawAnimation(){drawStarted=time;drawDuration=weapons[weapon].id==='karambit'?.72:.32;inspectStarted=-10;}
const smooth=t=>{t=clamp(t,0,1);return t*t*(3-2*t);};
function itemPose(w,t=time){const draw=clamp((t-drawStarted)/drawDuration,0,1),attack=attackStarted<0?1:clamp((t-attackStarted)/(w.rate||.5),0,1),inspect=clamp((t-inspectStarted)/1.2,0,1);let pose={position:[0,-.20*(1-smooth(draw)),.09*(1-draw)],rotation:[.22*(1-draw),0,0],spin:0,draw,attack,inspect};
 if(w.id==='karambit'){pose.spin=Math.PI*2*smooth(draw);if(inspect<1)pose.spin+=Math.PI*4*smooth(inspect);const cut=attack<1?Math.sin(attack*Math.PI):0;pose.position[0]-=cut*.24;pose.position[1]+=cut*.07;pose.position[2]-=cut*.11;pose.rotation[2]-=cut*1.05;pose.rotation[1]=cut*.32;}
 else if(w.melee){const cut=attack<1?Math.sin(attack*Math.PI):0;pose.rotation[2]=-.95*cut;pose.rotation[0]=-.55*cut;pose.position[0]-=.20*cut;pose.position[2]-=.15*cut;}
 return pose;
}
function renderWeapon(){const w=weapons[weapon],anim=itemPose(w),progress=reload?clamp(1-reload/w.reload,0,1):0,rx=reload?Math.sin(progress*Math.PI):0,moveAmount=Math.min(1,currentSpeed/7.4),breath=Math.sin(time*1.7)*.002;
 gl.clear(gl.DEPTH_BUFFER_BIT);gl.uniformMatrix4fv(U.VP,false,perspective(62*Math.PI/180,canvas.width/canvas.height));gl.uniform3fv(U.Eye,[0,0,0]);gl.uniform1f(U.Fog,0);gl.uniform1f(U.Material,.85);gl.uniform1f(U.Opacity,1);
 let side=w.melee?.25:.26,vertical=w.id==='karambit'?-.13:w.melee?-.29:-.26;
 const root=poseMatrix([lerp(side,0,aimBlend)+swayX+Math.sin(bob)*.007*moveAmount+anim.position[0],lerp(vertical,w.id==='sniper'?-.17:-.13,aimBlend)+swayY+breath-rx*.15+anim.position[1],-.64+kick*.60+anim.position[2]],[gunPitch+rx*.3+anim.rotation[0],-rx*.28+anim.rotation[1],gunRoll+rx*.42+anim.rotation[2]]);
 let transforms={};const magDip=reload?Math.sin(Math.PI*clamp((progress-.12)/.7,0,1))*.27:0;
 transforms.mag=poseMatrix([rx*.035,-magDip,rx*.035],[rx*.12,0,-rx*.12]);transforms.slide=poseMatrix([0,0,muzzleTime>0?.05:0]);transforms.bolt=poseMatrix([0,0,muzzleTime>0?.07:rx*.04]);
 transforms.cylinder=poseMatrix([-rx*.10,0,0],[0,0,shotCount*Math.PI/3+rx*2]);transforms.hammer=poseMatrix([0,0,muzzleTime>0?.012:0]);transforms.barrels=poseMatrix([0,0,0],[rx*.55,0,0]);transforms.shells=poseMatrix([0,rx*.03,rx*.16]);transforms.pin=poseMatrix([-Math.max(0,attackUntil-time)*.2,0,0]);transforms.lever=poseMatrix([0,0,0],[0,0,Math.max(0,attackUntil-time)]);
 transforms.rocket=poseMatrix([0,0,rx*.8]);
 if(w.id==='karambit'){const knife=mm(root,poseMatrix([0,0,0],[0,0,anim.spin]));drawDetail(itemModels.karambit,knife);drawDetail(gloveModel,mm(root,poseMatrix([.055,-.04,.018],[.15,.2,-.22],[.9,.9,.9])));}
 else{drawDetail(itemModels[w.id],root,transforms);const hand=w.melee?[.01,-.08,.034]:w.category==='Equipment'?[.025,-.11,.05]:[.025,-.12,.11];drawDetail(gloveModel,mm(root,poseMatrix(hand,[0,.18,-.1])));if(!w.melee){const support=w.category==='Equipment'?[-.055,-.14,.02]:[-.045,-.075-magDip*.7,-.25+rx*.1];drawDetail(gloveModel,mm(root,poseMatrix(support,[.35,-.4,.8],[.93,.93,.93])));}}
 // Sleeves, cuffs and a small wrist display remain attached to the hands.
 const armEnd=transformPoint(root,[.13,-.32,.24]),wrist=transformPoint(root,[.045,w.melee?-.16:-.23,.10]);gl.uniform1f(U.Surface,2);tube(armEnd,wrist,.14,[.18,.23,.19]);gl.uniform1f(U.Surface,3);shape(sphere,wrist,[.14,.07,.12],[.045,.055,.05]);gl.uniform1f(U.Surface,5);draw(add(wrist,[0,.035,0]),[.07,.01,.055],[.12,.32,.32]);gl.uniform1f(U.Surface,0);
 if(muzzleTime>0&&!w.melee&&w.category!=='Equipment'&&reload<=0){const z={rifle:-.71,pistol:-.28,sniper:-.87,burst:-.71,double:-.66,smg:-.53,revolver:-.38,rpg:-.95}[w.id];const tip=transformPoint(root,[0,.025,z]);gl.uniform1f(U.Surface,6);shape(sphere,tip,[.06,.06,.12],[1,.58,.17]);gl.uniform1f(U.Surface,0);}
 gl.uniform1f(U.Material,0);gl.uniform1f(U.Surface,0);
}
const graphicsProfiles={low:{scale:.8,maxPixels:1400000},balanced:{scale:1,maxPixels:2600000},high:{scale:1.25,maxPixels:4200000},ultra:{scale:1.5,maxPixels:6200000}};
let graphicsQuality='high';try{const saved=localStorage.getItem('breach.graphics.v1');if(graphicsProfiles[saved])graphicsQuality=saved;}catch{}
function renderSize(width,height,dpr){const p=graphicsProfiles[graphicsQuality],scale=Math.min(Math.min(dpr,2)*p.scale,Math.sqrt(p.maxPixels/(width*height)));return [Math.max(1,Math.round(width*scale)),Math.max(1,Math.round(height*scale))];}

function render(){let [w,h]=renderSize(innerWidth,innerHeight,devicePixelRatio);if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}gl.viewport(0,0,w,h);gl.clearColor(.46,.55,.59,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.enable(gl.DEPTH_TEST);gl.disable(gl.CULL_FACE);let target,fov=78;if(state==='menu'){cam=[14+Math.sin(performance.now()*.00008)*2,9,20];target=[-1,1,-4];fov=63;}else if(state==='dead'){target=add(player.p,[0,.65,0]);}else{target=add(cam,[Math.sin(yaw+recoilYaw)*Math.cos(pitch+recoil),Math.sin(pitch+recoil),-Math.cos(yaw+recoilYaw)*Math.cos(pitch+recoil)]);fov=cameraFov;}
renderSky(target,fov,w/h);let vp=mm(perspective(fov*Math.PI/180,w/h),look(cam,target));gl.uniformMatrix4fv(U.VP,false,vp);gl.uniform3fv(U.Eye,cam);gl.uniform1f(U.Fog,1);gl.uniform1f(U.Flash,muzzleTime>0?2.8:0);gl.uniform3fv(U.FlashPos,cam);gl.uniformMatrix4fv(U.M,false,I());gl.uniform3fv(U.Tint,[1,1,1]);bind(worldBuffer);gl.drawArrays(gl.TRIANGLES,0,worldBuffer.count);drawDetail(yardDetailModel,I());bind(cube);
if(state==='menu'){for(let e of[{p:[-2,0,4],rot:.4,phase:0},{p:[6,0,-7],rot:1,phase:1},{p:[-12,0,4],rot:0,phase:2}])soldier(e);}else for(let e of enemies)if(!e.dead){shape(sphere,[e.p[0],.015,e.p[2]],[.85,.018,.65],[.17,.21,.22]);soldier(e);}
for(let r of ragdolls){for(let l of r.links){if(!l.w)continue;tube(r.nodes[l.a].p,r.nodes[l.b].p,l.w,l.a===0?colors.skin:colors.enemy);}shape(sphere,r.nodes[0].p,[.37,.36,.37],[.15,.20,.17]);shape(sphere,r.nodes[1].p,[.51,.48,.35],colors.enemy);draw(r.nodes[1].p,[.49,.32,.37],[.12,.16,.15]);for(let i of[8,10])shape(sphere,r.nodes[i].p,[.24,.18,.36],colors.dark);}
for(let p of particles)draw(p.p,[p.s,p.s,p.s],p.col);for(let t of tracers)bone(t.a,t.b,.012,t.col);for(let g of grenades)projectileModel(g);for(let m of marks)draw(m.p,[.06,.06,.06],[.10,.12,.11]);
renderEffects();if(state==='playing'||state==='paused')renderWeapon();}
function drawSpecialEnemy(e){if(!e.def)return false;const p=e.p,r=e.rot,c=Math.cos(r),s=Math.sin(r),loc=(x,y,z)=>[p[0]+x*c+z*s,p[1]+y,p[2]-x*s+z*c],cloth=e.def.color||colors.dark;
 if(e.kind==='drone'){drawDetail(droneModel,poseMatrix(p));for(let x of[-.7,.7])for(let z of[-.55,.55]){gl.uniform1f(U.Surface,1);draw(add(p,[x,.085,z]),[.55,.018,.055],[.43,.49,.50],time*55);draw(add(p,[x,.085,z]),[.55,.018,.055],[.43,.49,.50],time*55+Math.PI/2);gl.uniform1f(U.Surface,6);shape(sphere,add(p,[x,-.08,z]),[.09,.06,.09],time-e.born>7?[1,.1,.05]:[1,.65,.1]);}gl.uniform1f(U.Surface,0);return true;}
 if(e.kind==='dog'){const down=time<e.stunUntil,hop=time<e.danceUntil?Math.abs(Math.sin(time*9))*.2:0;shape(sphere,loc(0,(down?.28:.5)+hop,0),[.42,.43,.9],cloth,r);shape(sphere,loc(0,(down?.28:.75)+hop,.52),[.34,.34,.38],cloth,r);draw(loc(0,.68+hop,.72),[.24,.18,.26],colors.dark,r);for(let x of[-.17,.17])for(let z of[-.3,.3])tube(loc(x,.45,z),loc(x,.10,z+(down?.25:Math.sin(e.gait+(x*z>0?0:Math.PI))*.12)),.1,cloth);tube(loc(0,.6,-.45),loc(0,.8,-.8),.08,cloth);draw(loc(0,.55,0),[.45,.18,.45],[.12,.22,.40],r);return true;}
 if(time<e.stunUntil){shape(sphere,loc(0,.27,0),[.6,.42,1.1],cloth,r);shape(sphere,loc(0,.28,.68),[.34,.34,.34],colors.skin);for(let side of[-1,1]){tube(loc(side*.18,.2,-.45),loc(side*.3,.12,-.95),.2,cloth);tube(loc(side*.3,.28,.28),loc(side*.6,.1,.55),.16,cloth);}return true;}
 if(time<e.danceUntil){
 // Original procedural horse-riding choreography: crossed reins, alternating
 // double hops and a raised lasso arm. Runs on simulation time for all 5 seconds.
 const beat=(time-(e.danceUntil-5))*Math.PI*4,hop=Math.abs(Math.sin(beat))*.16,side=Math.sin(beat*.5),lasso=Math.floor((time-(e.danceUntil-5))/1.25)%2===1;
 shape(sphere,loc(0,1.18+hop,0),[.58,.7,.4],cloth,r);shape(sphere,loc(0,1.77+hop,0),[.34,.39,.34],colors.skin,r);draw(loc(0,1.81+hop,.17),[.31,.08,.04],colors.dark,r);
 for(let k of[-1,1]){let hip=loc(k*.2,.9+hop,0),knee=loc(k*(.30+.08*side),.48+hop,Math.max(0,k*side)*.22),foot=loc(k*.27,.1+Math.max(0,k*side)*.2,-.1);tube(hip,knee,.23,cloth);tube(knee,foot,.19,cloth);draw(foot,[.25,.18,.36],colors.dark,r);const sh=loc(k*.34,1.45+hop,0),el=loc(k*.37,1.18+hop,.25),hand=loc(-k*.12,1.23+hop+Math.sin(beat)*.06,.5);if(lasso&&k===1){tube(sh,loc(.48,1.9+hop,0),.18,cloth);tube(loc(.48,1.9+hop,0),loc(.30+Math.cos(beat)*.18,2.15+hop,Math.sin(beat)*.18),.15,cloth);}else{tube(sh,el,.18,cloth);tube(el,hand,.15,cloth);shape(sphere,hand,[.17,.17,.17],colors.skin);}}return true;}
 if(e.def.shield){draw(loc(0,1.08,.55),[.85,1.2,.09],[.11,.17,.20],r);draw(loc(0,1.46,.61),[.55,.14,.025],[.37,.53,.58],r);draw(loc(.49,1.33,.48),[.12,.16,.35],[.42,.45,.45],r);}
 if(e.def.id==='heavy'){shape(sphere,loc(0,1.25,0),[.86,.9,.58],cloth,r);draw(loc(0,1.35,.31),[.66,.6,.13],colors.dark,r);draw(loc(.15,1.15,.75),[.35,.3,.35],[.26,.29,.22],r);tube(loc(.08,1.32,.8),loc(.08,1.32,1.45),.1,colors.dark);}
 if(e.def.id==='marksman')tube(loc(.08,1.32,.8),loc(.08,1.32,1.5),.055,colors.dark);
 if(e.def.suppressed)tube(loc(.08,1.32,1),loc(.08,1.32,1.3),.11,colors.dark);
 
 if(e.def.special==='mine'){draw(loc(0,1.25,-.35),[.48,.58,.2],[.49,.38,.15],r);if(e.windup){shape(cylinder,loc(.3,.3,.4),[.45,.12,.45],[.5,.31,.1]);}}
 if(e.windup&&e.def.special!=='mine'){shape(sphere,loc(.2,1.55,.7),[.14,.14,.14],e.def.special==='taser'?[.1,.7,1]:[1,.2,.08]);if(e.def.special==='precision')bone(loc(.08,1.4,1.1),e.windup.target,.012,[1,.15,.1]);}
 if(e.def.id==='taser')draw(loc(.12,1.3,.7),[.14,.14,.22],[.85,.68,.13],r);
 if(time<(e.hurtUntil||0))shape(sphere,loc(0,1.3,.27),[.14,.14,.05],[1,.3,.2]);
 return false;
}

function drawEnemyWeapon(e,loc,r){const id=e.def?.id||'swat',dark=colors.dark,metal=[.33,.37,.38];
 // Reuse the detailed inventory models nearby; inexpensive silhouettes at distance.
 const detailId={cheapPistol:'pistol',officer:'pistol',silencedPistol:'pistol',shield:'pistol',thugSmg:'smg',cartelSmg:'smg',silencedSmg:'smg',marksman:'sniper',swat:'rifle',flasher:'rifle',grenadier:'rifle',miner:'smg',heavy:'rifle'}[id];
 if(detailId&&len(sub(e.p,cam))<12){drawDetail(itemModels[detailId],poseMatrix(loc(.08,1.3,.54),[0,r+Math.PI,0],[.82,.82,.82]));if(e.flash>0){gl.uniform1f(U.Surface,6);shape(sphere,loc(.08,1.32,1.1),[.13,.13,.25],[1,.77,.28]);gl.uniform1f(U.Surface,0);}return;}
 if(e.def?.melee){const swing=e.windup?Math.sin(time*16)*.35:0;const a=loc(.3,1.1,.4),b=loc(.35,1.7+swing,.8);tube(a,b,id==='bat'?.12:.065,id==='bat'?[.45,.31,.17]:metal);return;}
 if(['cheapPistol','officer','silencedPistol','shield','taser'].includes(id)){draw(loc(.1,1.3,.55),[.12,.13,.30],id==='taser'?[.85,.69,.13]:metal,r);draw(loc(.1,1.21,.48),[.10,.17,.1],dark,r);}
 else{draw(loc(.08,1.29,.55),[.13,.16,.6],dark,r);draw(loc(.08,1.16,.55),[.09,.25,.13],metal,r);tube(loc(.08,1.32,.78),loc(.08,1.32,id==='pump'?1.2:1.03),id==='pump'?.09:.065,metal);draw(loc(.08,1.40,.54),[.08,.09,.12],dark,r);if(id==='pump')draw(loc(.08,1.25,.9),[.16,.13,.24],[.34,.24,.13],r);}
 if(e.flash>0)shape(sphere,loc(.08,1.32,1.1),[.13,.13,.25],[1,.77,.28]);
}
function renderEffects(){for(let m of mines){drawDetail(mineModel,poseMatrix(m.p));gl.uniform1f(U.Surface,6);draw(add(m.p,[0,.15,0]),[.04,.018,.04],time<m.armedAt?[1,.65,.1]:Math.sin(time*6)>0?[1,.15,.05]:[.25,.04,.02]);gl.uniform1f(U.Surface,0);}
 for(let e of enemies)if(!e.dead&&e.kind==='human'&&time<e.danceUntil){shape(sphere,add(e.p,[0,2.4,0]),[.16,.16,.16],[.7,.3,1]);}
 // Translucent nested spherical shells, plus a dense camera veil inside clouds.
 gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.depthMask(false);
 for(let s of [...smokes].sort((a,b)=>len(sub(b.p,cam))-len(sub(a.p,cam)))){const fade=clamp(s.end-time,0,1);for(let i=0;i<4;i++){gl.uniform1f(U.Opacity,.19*fade);let radius=s.radius*(1-i*.16);shape(sphere,s.p,[radius*2,radius*2,radius*2],[.55,.59,.58]);}}gl.uniform1f(U.Opacity,1);gl.depthMask(true);gl.disable(gl.BLEND);
}

function frame(now){let dt=Math.max(0,Math.min((now-last)/1000,.033));last=now;updateRoll(now);if(state==='playing'||state==='dead')update(dt);render();requestAnimationFrame(frame);}initializeUI();requestAnimationFrame(frame);
})();

