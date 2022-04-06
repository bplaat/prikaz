const http = require('http');
const fs = require('fs');
const { WebSocketServer } = require('ws');
const path = require('path');

// Config
const PORT = process.env.PORT || 8080;
const CHUNK_SIZE = 64;

// Utils
function rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Constants
const MessageType = {
    WORLD_INFO: 1,
    WORLD_CHUNK: 2
};

const ObjectType = {
    SPRITE: 1,
    PLANE: 2
};

// World generation
const textures = [
    { id: 1, name: 'Grass', image: 'grass.jpg', transparent: false },
    { id: 2, name: 'Tree 1', image: 'tree1.png', transparent: true },
    { id: 3, name: 'Tree 2', image: 'tree2.png', transparent: true },
    { id: 4, name: 'Tree 3', image: 'tree3.png', transparent: true },
    { id: 5, name: 'Bushes', image: 'bushes.png', transparent: true },
    { id: 6, name: 'Rose', image: 'rose.png', transparent: true },
    { id: 7, name: 'Sunflower', image: 'sunflower.png', transparent: true },
];

const objects = [
    { id: 1, type: ObjectType.PLANE, name: 'Ground', width: CHUNK_SIZE, height: CHUNK_SIZE, depth: 0, texture_id: 1, texture_repeat_x: CHUNK_SIZE, texture_repeat_y: CHUNK_SIZE },
    { id: 2, type: ObjectType.SPRITE, name: 'Tree 1', width: 9, height: 10, depth: 0, texture_id: 2, texture_repeat_x: 1, texture_repeat_y: 1 },
    { id: 3, type: ObjectType.SPRITE, name: 'Tree 2', width: 8, height: 8, depth: 0, texture_id: 3, texture_repeat_x: 1, texture_repeat_y: 1 },
    { id: 4, type: ObjectType.SPRITE, name: 'Tree 3', width: 11, height: 12, depth: 0, texture_id: 4, texture_repeat_x: 1, texture_repeat_y: 1 },
    { id: 5, type: ObjectType.SPRITE, name: 'Bushes', width: 3, height: 3, depth: 0, texture_id: 5, texture_repeat_x: 1, texture_repeat_y: 1 },
    { id: 6, type: ObjectType.SPRITE, name: 'Rose', width: 1, height: 1, depth: 0, texture_id: 6, texture_repeat_x: 1, texture_repeat_y: 1 },
    { id: 7, type: ObjectType.SPRITE, name: 'Sun flower', width: 1, height: 1, depth: 0, texture_id: 7, texture_repeat_x: 1, texture_repeat_y: 1 }
];

const world = {
    chunks: [],
    instances: []
};

function createChunk(x, y) {
    const chunk = { id: world.chunks.length + 1, x, y };
    world.chunks.push(chunk);

    world.instances.push({
        id: world.instances.length + 1,
        chunk_id: chunk.id,
        object_id: 1,
        position_x: x * CHUNK_SIZE + CHUNK_SIZE / 2,
        position_y: -CHUNK_SIZE / 2,
        position_z: y * CHUNK_SIZE + CHUNK_SIZE / 2,
        rotation_x: -Math.PI / 2,
        rotation_y: 0,
        rotation_z: 0,
        scale_x: 1,
        scale_y: 1,
        scale_z: 1
    });

    for (let i = 0; i < CHUNK_SIZE; i++) {
        world.instances.push({
            id: world.instances.length + 1,
            chunk_id: chunk.id,
            object_id: rand(2, 7),
            position_x: x * CHUNK_SIZE + rand(0, CHUNK_SIZE),
            position_y: 0,
            position_z: y * CHUNK_SIZE + rand(0, CHUNK_SIZE),
            rotation_x: 0,
            rotation_y: 0,
            rotation_z: 0,
            scale_x: 1,
            scale_y: 1,
            scale_z: 1
        });
    }

    return chunk;
}

// Websocket server
const wss = new WebSocketServer({ noServer: true });
let playerCounter = 1;
wss.on('connection', ws => {
    const playerID = playerCounter++;
    console.log(`[WS] #${playerID} Connected`);

    ws.on('message', data => {
        const message = new Uint8Array(data.byteLength);
        data.copy(message, 0, 0, data.byteLength);
        const messageView = new DataView(message.buffer);

        const type = messageView.getUint8(0);

        // World info response
        if (type == MessageType.WORLD_INFO) {
            console.log(`[WS] #${playerID} WORLD_INFO message`);

            // Send world info response response
            const response = new ArrayBuffer(1 +
                4 + textures.length * (4 + 1) +
                4 + objects.length * (4 + 1 + 4 * 3 + 4 + 2 * 2)
            );
            const responseView = new DataView(response);
            let pos = 0;
            responseView.setUint8(pos, MessageType.WORLD_INFO); pos += 1;

            // Send textures
            responseView.setUint32(pos, textures.length, true); pos += 4;
            for (const texture of textures) {
                responseView.setUint32(pos, texture.id, true); pos += 4;
                responseView.setUint8(pos, texture.transparent); pos += 1;
            }

            // Send objects
            responseView.setUint32(pos, objects.length, true); pos += 4;
            for (const object of objects) {
                responseView.setUint32(pos, object.id, true); pos += 4;
                responseView.setUint8(pos, object.type); pos += 1;
                responseView.setFloat32(pos, object.width, true); pos += 4;
                responseView.setFloat32(pos, object.height, true); pos += 4;
                responseView.setFloat32(pos, object.depth, true); pos += 4;
                responseView.setUint32(pos, object.texture_id, true); pos += 4;
                responseView.setUint16(pos, object.texture_repeat_x, true); pos += 2;
                responseView.setUint16(pos, object.texture_repeat_y, true); pos += 2;
            }
            ws.send(response);
        }

        // World chunk response
        if (type == MessageType.WORLD_CHUNK) {
            const chunkX = messageView.getInt32(1, true);
            const chunkY = messageView.getInt32(1 + 4, true);

            console.log(`[WS] #${playerID} WORLD_CHUNK message ${chunkX}x${chunkY}`);

            // Get or create chunk
            let chunk = world.chunks.find(chunk => chunk.x == chunkX && chunk.y == chunkY);
            if (chunk == null) {
                chunk = createChunk(chunkX, chunkY);
            }
            const instances = world.instances.filter(instance => instance.chunk_id == chunk.id);

            // Send world chunk response response
            const response = new ArrayBuffer(1 + 4 + 4 * 2 + 4 + instances.length * (4 + 4 + 4 * 3 * 3));
            const responseView = new DataView(response);
            let pos = 0;
            responseView.setUint8(pos, MessageType.WORLD_CHUNK); pos += 1;
            responseView.setUint32(pos, chunk.id, true); pos += 4;
            responseView.setInt32(pos, chunk.x, true); pos += 4;
            responseView.setInt32(pos, chunk.y, true); pos += 4;
            responseView.setUint32(pos, instances.length, true); pos += 4;
            for (const instance of instances) {
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
            ws.send(response);
        }
    });

    ws.on('close', () => {
        console.log(`[WS] #${playerID} Disconnected`);
    });
});

// HTTP server
const server = http.createServer((req, res) => {
    const { pathname } = new URL(req.url, `http://localhost:${PORT}/`);
    console.log(`[WEB] ${req.method} ${pathname}`);

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
            res.end(fs.readFileSync('textures/' + texture.image));
            return;
        }
    }

    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 Not Found');
});

server.on('upgrade', function upgrade(req, socket, head) {
    const { pathname } = new URL(req.url, `http://localhost:${PORT}/`);
    if (pathname === '/ws') {
        wss.handleUpgrade(req, socket, head, ws => {
            wss.emit('connection', ws, req);
        });
    } else {
        socket.destroy();
    }
});

server.listen(PORT, () => {
    console.log(`[WEB] Server is listening on http://localhost:${PORT}/`);
});
