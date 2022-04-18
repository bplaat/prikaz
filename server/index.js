import http  from 'http';
import fs  from 'fs';
import { WebSocketServer } from 'ws';

// Noise.js
let noise = {};
!function(t){function o(t,o,r){this.x=t,this.y=o,this.z=r}t=t.noise={},o.prototype.dot2=function(t,o){return this.x*t+this.y*o},o.prototype.dot3=function(t,o,r){return this.x*t+this.y*o+this.z*r};var n=[new o(1,1,0),new o(-1,1,0),new o(1,-1,0),new o(-1,-1,0),new o(1,0,1),new o(-1,0,1),new o(1,0,-1),new o(-1,0,-1),new o(0,1,1),new o(0,-1,1),new o(0,1,-1),new o(0,-1,-1)],e=[151,160,137,91,90,15,131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,190,6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,88,237,149,56,87,174,20,125,136,171,168,68,175,74,165,71,134,139,48,27,166,77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,102,143,54,65,25,63,161,1,216,80,73,209,76,132,187,208,89,18,169,200,196,135,130,116,188,159,86,164,100,109,198,173,186,3,64,52,217,226,250,124,123,5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,223,183,170,213,119,248,152,2,44,154,163,70,221,153,101,155,167,43,172,9,129,22,39,253,19,98,108,110,79,113,224,232,178,185,112,104,218,246,97,228,251,34,242,193,238,210,144,12,191,179,162,241,81,51,145,235,249,14,239,107,49,192,214,31,181,199,106,157,184,84,204,176,115,121,50,45,127,4,150,254,138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180],z=new Array(512),A=new Array(512);t.seed=function(t){0<t&&t<1&&(t*=65536),(t=Math.floor(t))<256&&(t|=t<<8);for(var o=0;o<256;o++){var r=1&o?e[o]^255&t:e[o]^t>>8&255;z[o]=z[o+256]=r,A[o]=A[o+256]=n[r%12]}},t.seed(0);var l=.5*(Math.sqrt(3)-1),w=(3-Math.sqrt(3))/6,b=1/6;function M(t){return t*t*t*(t*(6*t-15)+10)}function c(t,o,r){return(1-r)*t+r*o}t.simplex2=function(t,o){var r=(t+o)*l,n=Math.floor(t+r),e=Math.floor(o+r),a=(n+e)*w,i=t-n+a,d=o-e+a,f=d<i?(s=1,0):(s=0,1),h=i-s+w,u=d-f+w,r=i-1+2*w,t=d-1+2*w,o=A[(n&=255)+z[e&=255]],a=A[n+s+z[e+f]],s=A[1+n+z[1+e]],f=.5-i*i-d*d,n=.5-h*h-u*u,e=.5-r*r-t*t;return 70*((f<0?0:(f*=f)*f*o.dot2(i,d))+(n<0?0:(n*=n)*n*a.dot2(h,u))+(e<0?0:(e*=e)*e*s.dot2(r,t)))},t.simplex3=function(t,o,r){var n,e,a=(t+o+r)*(1/3),i=Math.floor(t+a),d=Math.floor(o+a),f=Math.floor(r+a),h=(i+d+f)*b,u=t-i+h,s=o-d+h,l=r-f+h,w=s<=u?l<=s?(q=m=n=1,x=e=0):m=l<=u?(q=x=e=0,n=1):(q=e=n=0,x=1):s<l?(m=e=n=0,q=x=1):u<l?(m=x=n=0,q=e=1):(q=m=e=1,x=n=0),M=u-n+b,c=s-e+b,v=l-x+b,p=u-m+2*b,y=s-q+2*b,a=l-w+2*b,t=u-1+.5,o=s-1+.5,r=l-1+.5,h=A[(i&=255)+z[(d&=255)+z[f&=255]]],x=A[i+n+z[d+e+z[f+x]]],m=A[i+m+z[d+q+z[f+w]]],q=A[1+i+z[1+d+z[1+f]]],w=.6-u*u-s*s-l*l,i=.6-M*M-c*c-v*v,d=.6-p*p-y*y-a*a,f=.6-t*t-o*o-r*r;return 32*((w<0?0:(w*=w)*w*h.dot3(u,s,l))+(i<0?0:(i*=i)*i*x.dot3(M,c,v))+(d<0?0:(d*=d)*d*m.dot3(p,y,a))+(f<0?0:(f*=f)*f*q.dot3(t,o,r)))},t.perlin2=function(t,o){var r=Math.floor(t),n=Math.floor(o);t-=r,o-=n;var e=A[(r&=255)+z[n&=255]].dot2(t,o),a=A[r+z[1+n]].dot2(t,o-1),i=A[1+r+z[n]].dot2(t-1,o),n=A[1+r+z[1+n]].dot2(t-1,o-1),t=M(t);return c(c(e,i,t),c(a,n,t),M(o))},t.perlin3=function(t,o,r){var n=Math.floor(t),e=Math.floor(o),a=Math.floor(r);t-=n,o-=e,r-=a;var i=A[(n&=255)+z[(e&=255)+z[a&=255]]].dot3(t,o,r),d=A[n+z[e+z[1+a]]].dot3(t,o,r-1),f=A[n+z[1+e+z[a]]].dot3(t,o-1,r),h=A[n+z[1+e+z[1+a]]].dot3(t,o-1,r-1),u=A[1+n+z[e+z[a]]].dot3(t-1,o,r),s=A[1+n+z[e+z[1+a]]].dot3(t-1,o,r-1),l=A[1+n+z[1+e+z[a]]].dot3(t-1,o-1,r),a=A[1+n+z[1+e+z[1+a]]].dot3(t-1,o-1,r-1),t=M(t),o=M(o),r=M(r);return c(c(c(i,u,t),c(d,s,t),r),c(c(f,l,t),c(h,a,t),r),o)}}(noise);

// Utils
function rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Parse game version
const packageJson = JSON.parse(fs.readFileSync('package.json'));
const versionParts = packageJson.version.split('.');
const VERSION = {
    MAJOR: parseInt(versionParts[0]),
    MINOR: parseInt(versionParts[1]),
    BUGFIX: parseInt(versionParts[2])
};

// Constants
const SERVER_PORT = process.env.PORT || 8080;
const CHUNK_SIZE = 32;
const TICKS_PER_SECOND = 5;
const TICKS_PER_DAY = TICKS_PER_SECOND * 10 * 60;

const MessageType = {
    WORLD_INFO: 1,
    WORLD_CHUNK: 2,
    WORLD_TICK: 3
};

const ObjectType = {
    PLANE: 1,
    SPRITE: 2,
    BOX: 3
};

// Texture and objects
const textures = [
    { id: 1, name: 'Water', image: 'water.jpg', pixelated: false, transparent: false },
    { id: 2, name: 'Sand', image: 'sand.jpg', pixelated: false, transparent: false },
    { id: 3, name: 'Grass', image: 'grass.jpg', pixelated: false, transparent: false },
    { id: 4, name: 'Tree 1', image: 'tree1.png', pixelated: false, transparent: true },
    { id: 5, name: 'Tree 2', image: 'tree2.png', pixelated: false, transparent: true },
    { id: 6, name: 'Tree 3', image: 'tree3.png', pixelated: false, transparent: true },
    { id: 7, name: 'Bushes', image: 'bushes.png', pixelated: false, transparent: true },
    { id: 8, name: 'Rose', image: 'rose.png', pixelated: false, transparent: true },
    { id: 9, name: 'Sunflower', image: 'sunflower.png', pixelated: false, transparent: true },
    { id: 10, name: 'Sandcastle', image: 'sandcastle.png', pixelated: false, transparent: true },
    { id: 11, name: 'Campfire', image: 'campfire.png', pixelated: false, transparent: true },
    { id: 12, name: 'Statue', image: 'statue.png', pixelated: true, transparent: true },
    { id: 13, name: 'Streetlight', image: 'streetlight.png', pixelated: false, transparent: true },
    { id: 14, name: 'Crate', image: 'crate.jpg', pixelated: false, transparent: false },
    { id: 15, name: 'Stone', image: 'stone.jpg', pixelated: false, transparent: false },
    { id: 16, name: 'Road', image: 'road.jpg', pixelated: false, transparent: false }
];

const objects = [
    { id: 1, type: ObjectType.PLANE, name: 'Water ground', width: CHUNK_SIZE, height: CHUNK_SIZE, depth: 0, texture_id: 1, texture_repeat_x: CHUNK_SIZE, texture_repeat_y: CHUNK_SIZE },
    { id: 2, type: ObjectType.PLANE, name: 'Sand ground', width: CHUNK_SIZE, height: CHUNK_SIZE, depth: 0, texture_id: 2, texture_repeat_x: CHUNK_SIZE, texture_repeat_y: CHUNK_SIZE },
    { id: 3, type: ObjectType.PLANE, name: 'Grass ground', width: CHUNK_SIZE, height: CHUNK_SIZE, depth: 0, texture_id: 3, texture_repeat_x: CHUNK_SIZE, texture_repeat_y: CHUNK_SIZE },
    { id: 4, type: ObjectType.SPRITE, name: 'Tree 1', width: 9, height: 10, depth: 0, texture_id: 4, texture_repeat_x: 1, texture_repeat_y: 1 },
    { id: 5, type: ObjectType.SPRITE, name: 'Tree 2', width: 8, height: 8, depth: 0, texture_id: 5, texture_repeat_x: 1, texture_repeat_y: 1 },
    { id: 6, type: ObjectType.SPRITE, name: 'Tree 3', width: 11, height: 12, depth: 0, texture_id: 6, texture_repeat_x: 1, texture_repeat_y: 1 },
    { id: 7, type: ObjectType.SPRITE, name: 'Bushes', width: 3, height: 3, depth: 0, texture_id: 7, texture_repeat_x: 1, texture_repeat_y: 1 },
    { id: 8, type: ObjectType.SPRITE, name: 'Rose', width: 1, height: 1, depth: 0, texture_id: 8, texture_repeat_x: 1, texture_repeat_y: 1 },
    { id: 9, type: ObjectType.SPRITE, name: 'Sun flower', width: 1, height: 1, depth: 0, texture_id: 9, texture_repeat_x: 1, texture_repeat_y: 1 },
    { id: 10, type: ObjectType.SPRITE, name: 'Sandcastle', width: 1.5, height: 1.5, depth: 0, texture_id: 10, texture_repeat_x: 1, texture_repeat_y: 1 },
    { id: 11, type: ObjectType.SPRITE, name: 'Campfire', width: 2, height: 2, depth: 0, texture_id: 11, texture_repeat_x: 1, texture_repeat_y: 1 },
    { id: 12, type: ObjectType.SPRITE, name: 'Statue', width: 4, height: 4, depth: 0, texture_id: 12, texture_repeat_x: 1, texture_repeat_y: 1 },
    { id: 13, type: ObjectType.SPRITE, name: 'Streetlight', width: 6, height: 6, depth: 0, texture_id: 13, texture_repeat_x: 1, texture_repeat_y: 1 },
    { id: 14, type: ObjectType.BOX, name: 'Crate', width: 1.5, height: 1.5, depth: 1.5, texture_id: 14, texture_repeat_x: 1, texture_repeat_y: 1 },
    { id: 15, type: ObjectType.BOX, name: 'Stone Block', width: 2, height: 6, depth: 2, texture_id: 15, texture_repeat_x: 2, texture_repeat_y: 6 },
    { id: 16, type: ObjectType.PLANE, name: 'Road ground', width: CHUNK_SIZE, height: CHUNK_SIZE, depth: 0, texture_id: 16, texture_repeat_x: CHUNK_SIZE, texture_repeat_y: CHUNK_SIZE }
];

// Convert textures and objects string to bytes
const encoder = new TextEncoder();
for (const texture of textures) {
    texture.nameBytes = encoder.encode(texture.name);
}
for (const object of objects) {
    object.nameBytes = encoder.encode(object.name);
}

// World generation
const world = {
    chunks: [],
    instances: [],
    ticks: 0
};

noise.noise.seed(Math.random());
function createChunk(x, y) {
    const chunk = { id: world.chunks.length + 1, x, y };
    world.chunks.push(chunk);

    const n = noise.noise.simplex2(x / 50, y / 50);
    let terrain;
    if (n > 0.35) terrain = rand(1, 25) == 1 ? 16 : 3;
    else if (n > 0.15) terrain = 3;
    else if (n > 0) terrain = 2;
    else terrain = 1;

    world.instances.push({
        id: world.instances.length + 1,
        chunk_id: chunk.id,
        object_id: terrain,
        position_x: x * CHUNK_SIZE + CHUNK_SIZE / 2,
        position_y: -CHUNK_SIZE / 2 - 0.001,
        position_z: y * CHUNK_SIZE + CHUNK_SIZE / 2,
        rotation_x: -Math.PI / 2, rotation_y: 0,  rotation_z: 0,
        scale_x: 1, scale_y: 1, scale_z: 1
    });

    if (terrain == 2) {
        for (let i = 0; i < CHUNK_SIZE / 16; i++) {
            world.instances.push({
                id: world.instances.length + 1,
                chunk_id: chunk.id,
                object_id: 10,
                position_x: x * CHUNK_SIZE + rand(0, CHUNK_SIZE),
                position_y: 0,
                position_z: y * CHUNK_SIZE + rand(0, CHUNK_SIZE),
                rotation_x: 0, rotation_y: 0,  rotation_z: 0,
                scale_x: 1, scale_y: 1, scale_z: 1
            });
        }
    }

    if (terrain == 3) {
        for (let i = 0; i < CHUNK_SIZE / 4; i++) {
            world.instances.push({
                id: world.instances.length + 1,
                chunk_id: chunk.id,
                object_id: rand(n > 0.6 ? 4 : 7, rand(9, 15)),
                position_x: x * CHUNK_SIZE + rand(0, CHUNK_SIZE),
                position_y: 0,
                position_z: y * CHUNK_SIZE + rand(0, CHUNK_SIZE),
                rotation_x: 0, rotation_y: 0,  rotation_z: 0,
                scale_x: 1, scale_y: 1, scale_z: 1
            });
        }
    }

    return chunk;
}

// Websocket server
const wss = new WebSocketServer({ noServer: true });
let clients = [];

// Ticks counter
setInterval(() => {
    world.ticks++;
    for (const client of clients) {
        const response = new ArrayBuffer(1 + 4);
        const responseView = new DataView(response);
        let pos = 0;
        responseView.setUint8(pos, MessageType.WORLD_TICK); pos += 1;
        responseView.setUint32(pos, world.ticks, true); pos += 4;
        client.ws.send(response);
    }
}, 1000 / TICKS_PER_SECOND);

// Websocket connect handler
let playerCounter = 1;
wss.on('connection', ws => {
    const playerID = playerCounter++;
    clients.push({ id: playerID, ws });
    console.log(`[WS] #${playerID} Connected`);

    ws.on('message', data => {
        // Copy data from Node.js buffer to the nice DataView
        const message = new Uint8Array(data.byteLength);
        data.copy(message, 0, 0, data.byteLength);
        const messageView = new DataView(message.buffer);

        // Read all incoming messages and generate response objects
        const responses = [];
        let pos = 0;
        while (pos != messageView.byteLength) {
            const type = messageView.getUint8(pos); pos += 1;

            // World info response
            if (type == MessageType.WORLD_INFO) {
                responses.push({
                    type: MessageType.WORLD_INFO
                });
            }

            // World chunk response
            if (type == MessageType.WORLD_CHUNK) {
                const chunkX = messageView.getInt32(pos, true); pos += 4
                const chunkY = messageView.getInt32(pos, true); pos += 4;

                // Get or create chunk use that in the response
                let chunk = world.chunks.find(chunk => chunk.x == chunkX && chunk.y == chunkY);
                if (chunk == null) {
                    chunk = createChunk(chunkX, chunkY);
                }
                responses.push({
                    type: MessageType.WORLD_CHUNK,
                    chunk: chunk,
                    instances: world.instances.filter(instance => instance.chunk_id == chunk.id)
                });
            }
        }

        // Calculate total response size
        let responseSize = 0;
        for (const item of responses) {
            if (item.type == MessageType.WORLD_INFO) {
                responseSize += 1 + 3 + 2 * 3 + 4 + 4 + 4;
                for (const texture of textures) {
                    responseSize += 4 + 2 + texture.nameBytes.length + 1 + 1;
                }
                for (const object of objects) {
                    responseSize += 4 + 1 + 2 + object.nameBytes.length + 4 * 3 + 4 + 2 * 2;
                }
            }

            if (item.type == MessageType.WORLD_CHUNK) {
                responseSize += 1 + 4 + 4 * 2 + 4 + item.instances.length * (4 + 4 + 4 * 3 * 3);
            }
        }

        // Write response message data to response buffer and send
        const response = new ArrayBuffer(responseSize);
        const responseView = new DataView(response);
        pos = 0;
        for (const item of responses) {
            // Send world info response response
            if (item.type == MessageType.WORLD_INFO) {
                responseView.setUint8(pos, MessageType.WORLD_INFO); pos += 1;
                responseView.setUint8(pos, VERSION.MAJOR); pos += 1;
                responseView.setUint8(pos, VERSION.MINOR); pos += 1;
                responseView.setUint8(pos, VERSION.BUGFIX); pos += 1;
                responseView.setUint16(pos, CHUNK_SIZE, true); pos += 2;
                responseView.setUint16(pos, TICKS_PER_SECOND, true); pos += 2;
                responseView.setUint16(pos, TICKS_PER_DAY, true); pos += 2;
                responseView.setUint32(pos, world.ticks, true); pos += 4;

                // Send textures
                responseView.setUint32(pos, textures.length, true); pos += 4;
                for (const texture of textures) {
                    responseView.setUint32(pos, texture.id, true); pos += 4;
                    responseView.setUint16(pos, texture.nameBytes.length, true); pos += 2;
                    for (let i = 0; i < texture.nameBytes.length; i++) {
                        responseView.setUint8(pos, texture.nameBytes[i]); pos += 1;
                    }
                    responseView.setUint8(pos, texture.pixelated); pos += 1;
                    responseView.setUint8(pos, texture.transparent); pos += 1;
                }

                // Send objects
                responseView.setUint32(pos, objects.length, true); pos += 4;
                for (const object of objects) {
                    responseView.setUint32(pos, object.id, true); pos += 4;
                    responseView.setUint8(pos, object.type); pos += 1;
                    responseView.setUint16(pos, object.nameBytes.length, true); pos += 2;
                    for (let i = 0; i < object.nameBytes.length; i++) {
                        responseView.setUint8(pos, object.nameBytes[i]); pos += 1;
                    }
                    responseView.setFloat32(pos, object.width, true); pos += 4;
                    responseView.setFloat32(pos, object.height, true); pos += 4;
                    responseView.setFloat32(pos, object.depth, true); pos += 4;
                    responseView.setUint32(pos, object.texture_id, true); pos += 4;
                    responseView.setUint16(pos, object.texture_repeat_x, true); pos += 2;
                    responseView.setUint16(pos, object.texture_repeat_y, true); pos += 2;
                }
            }

            // Send world chunk response response
            if (item.type == MessageType.WORLD_CHUNK) {
                responseView.setUint8(pos, MessageType.WORLD_CHUNK); pos += 1;
                responseView.setUint32(pos, item.chunk.id, true); pos += 4;
                responseView.setInt32(pos, item.chunk.x, true); pos += 4;
                responseView.setInt32(pos, item.chunk.y, true); pos += 4;
                responseView.setUint32(pos, item.instances.length, true); pos += 4;
                for (const instance of item.instances) {
                    responseView.setUint32(pos, instance.id, true); pos += 4;
                    responseView.setUint32(pos, instance.object_id, true); pos += 4;
                    responseView.setFloat32(pos, instance.position_x, true); pos += 4;
                    responseView.setFloat32(pos, instance.position_y, true); pos += 4;
                    responseView.setFloat32(pos, instance.position_z, true); pos += 4;
                    responseView.setFloat32(pos, instance.rotation_x, true); pos += 4;
                    responseView.setFloat32(pos, instance.rotation_y, true); pos += 4;
                    responseView.setFloat32(pos, instance.rotation_z, true); pos += 4;
                    responseView.setFloat32(pos, instance.scale_x, true); pos += 4;
                    responseView.setFloat32(pos, instance.scale_y, true); pos += 4;
                    responseView.setFloat32(pos, instance.scale_z, true); pos += 4;
                }
            }
        }
        ws.send(response);
    });

    ws.on('close', () => {
        console.log(`[WS] #${playerID} Disconnected`);
        clients = clients.filter(client => client.id != playerID);
    });
});

// HTTP server
const server = http.createServer((req, res) => {
    const { pathname } = new URL(req.url, `http://localhost:${SERVER_PORT}/`);
    console.log(`[HTTP] ${req.method} ${pathname}`);

    if (pathname == '/') {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('Prikaz Server');
        return;
    }

    if (pathname.startsWith('/textures/')) {
        const textureID = parseInt(pathname.substring('/textures/'.length));
        const texture = textures.find(texture => texture.id == textureID);
        if (texture != null) {
            res.writeHead(200, {
                'Content-Type': texture.image.endsWith('.png') ? 'image/png' : 'image/jpeg',
                'Access-Control-Allow-Origin': '*'
            });
            res.end(fs.readFileSync(`textures/${texture.image}`));
            return;
        }
    }

    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 Not Found');
});

server.on('upgrade', (req, socket, head) => {
    const { pathname } = new URL(req.url, `http://localhost:${SERVER_PORT}/`);
    console.log(`[HTTP] ${req.method} UPGRADE ${pathname}`);

    if (pathname === '/ws') {
        wss.handleUpgrade(req, socket, head, ws => {
            wss.emit('connection', ws, req);
        });
        return;
    }

    socket.destroy();
});

server.listen(SERVER_PORT, () => {
    console.log(`[HTTP] Server is listening on http://localhost:${SERVER_PORT}/`);
});
