import { Object3D, PerspectiveCamera } from './object3d.js';
import { formatBytes, createShader, createProgram } from './utils.js';
import { radians, Matrix4, Vector4 } from './math.js';

// Constants
const VERSION = { MAJOR: undefined, MINOR: undefined, BUGFIX: undefined };
let CHUNK_SIZE;
let TICKS_PER_SECOND;
let TICKS_PER_DAY;
const INSTANCE_BUFFER_SIZE = 4096;
const CAMERA_SENSITIVITY = 0.004;
let CHUNK_RENDER_RANGE = 16;
let CHUNK_FETCH_RANGE = CHUNK_RENDER_RANGE + 2;

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

// World
let textures = [];
let textureLookup = {};

let objects = [];
let objectLookup = {};

const world = {
    chunks: [],
    requestedChunksLookup: {},
    instances: [],
    ticks: 0
};

// Websocket connection
class Connection {
    constructor(game, url) {
        this.game = game;
        this.ws = new WebSocket(url);
        this.ws.binaryType = 'arraybuffer';
        this.connected = false;
        this.sendCount = 0;
        this.sendBytes = 0;
        this.receiveCount = 0;
        this.receiveBytes = 0;
        this.sendQueue = [];
        this.ws.onopen = this.onOpen.bind(this);
        this.ws.onmessage = this.onMessage.bind(this);
    }

    onOpen() {
        this.connected = true;
        this.sendQueue.push({ type: MessageType.WORLD_INFO });
        this.flushSendQueue();
    }

    onMessage(event) {
        const gl = this.game.gl;
        const messageView = new DataView(event.data);

        let pos = 0;
        while (pos != messageView.byteLength) {
            const type = messageView.getUint8(pos); pos += 1;

            // Parse world info response message
            if (type == MessageType.WORLD_INFO) {
                VERSION.MAJOR = messageView.getUint8(pos); pos += 1;
                VERSION.MINOR = messageView.getUint8(pos); pos += 1;
                VERSION.BUGFIX = messageView.getUint8(pos); pos += 1;
                CHUNK_SIZE = messageView.getUint16(pos, true); pos += 2;
                TICKS_PER_SECOND = messageView.getUint16(pos, true); pos += 2;
                TICKS_PER_DAY = messageView.getUint16(pos, true); pos += 2;
                world.ticks = messageView.getUint32(pos, true); pos += 4;

                const texturesLength = messageView.getUint32(pos, true); pos += 4;
                textures = [];
                textureLookup = {};
                for (let i = 0; i < texturesLength; i++) {
                    const texture = {};
                    texture.id = messageView.getUint32(pos, true); pos += 4;
                    texture.pixelated = messageView.getUint8(pos); pos += 1;
                    texture.transparent = messageView.getUint8(pos); pos += 1;
                    textures.push(texture);
                    textureLookup[texture.id] = texture;

                    const image = new Image();
                    image.crossOrigin = '';
                    image.src = `http://localhost:8080/textures/${texture.id}`;
                    image.onload = () => {
                        texture.texture = gl.createTexture();
                        gl.bindTexture(gl.TEXTURE_2D, texture.texture);
                        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, texture.pixelated ? gl.NEAREST_MIPMAP_NEAREST : gl.LINEAR_MIPMAP_LINEAR);
                        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, texture.pixelated ? gl.NEAREST : gl.LINEAR);
                        if (texture.transparent) {
                            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                        }
                        gl.texImage2D(gl.TEXTURE_2D, 0, texture.transparent ? gl.RGBA : gl.RGB, texture.transparent ? gl.RGBA : gl.RGB, gl.UNSIGNED_BYTE, image);
                        gl.generateMipmap(gl.TEXTURE_2D);
                    };
                }
                const objectsLength = messageView.getUint32(pos, true); pos += 4;
                objects = [];
                objectLookup = {};
                for (let i = 0; i < objectsLength; i++) {
                    const object = {};
                    object.id = messageView.getUint32(pos, true); pos += 4;
                    object.type = messageView.getUint8(pos); pos += 1;
                    object.width = messageView.getFloat32(pos, true); pos += 4;
                    object.height = messageView.getFloat32(pos, true); pos += 4;
                    object.depth = messageView.getFloat32(pos, true); pos += 4;
                    object.texture_id = messageView.getUint32(pos, true); pos += 4;
                    object.texture_repeat_x = messageView.getUint16(pos, true); pos += 2;
                    object.texture_repeat_y = messageView.getUint16(pos, true); pos += 2;
                    objects.push(object);
                    objectLookup[object.id] = object;
                }

                this.game.handleChunkUpdate();
            }

            // Parse world info response message
            if (type == MessageType.WORLD_CHUNK) {
                const chunk = {};
                chunk.id = messageView.getUint32(pos, true); pos += 4;
                chunk.x = messageView.getInt32(pos, true); pos += 4;
                chunk.y = messageView.getInt32(pos, true); pos += 4;
                chunk.instances = [];
                chunk.opaqueInstances = [];
                chunk.transparentInstances = [];
                world.chunks.push(chunk);

                // Create chunk instances and sort by opaque or transparent texture
                // And create object3d / matrixes for all non sprite instances
                const instancesLength = messageView.getUint32(pos, true); pos += 4;
                for (let i = 0; i < instancesLength; i++) {
                    const instance = {};
                    instance.id = messageView.getUint32(pos, true); pos += 4;
                    instance.chunk_id = chunk.id;
                    instance.object_id = messageView.getUint32(pos, true); pos += 4;
                    instance.position_x = messageView.getFloat32(pos, true); pos += 4;
                    instance.position_y = messageView.getFloat32(pos, true); pos += 4;
                    instance.position_z = messageView.getFloat32(pos, true); pos += 4;
                    instance.rotation_x = messageView.getFloat32(pos, true); pos += 4;
                    instance.rotation_y = messageView.getFloat32(pos, true); pos += 4;
                    instance.rotation_z = messageView.getFloat32(pos, true); pos += 4;
                    instance.scale_x = messageView.getFloat32(pos, true); pos += 4;
                    instance.scale_y = messageView.getFloat32(pos, true); pos += 4;
                    instance.scale_z = messageView.getFloat32(pos, true); pos += 4;

                    const object = objectLookup[instance.object_id];
                    instance.object3d = new Object3D();
                    instance.object3d.position.x = instance.position_x;
                    instance.object3d.position.y = instance.position_y + object.height / 2;
                    instance.object3d.position.z = instance.position_z;

                    instance.object3d.rotation.x = instance.rotation_x;
                    if (object.type != ObjectType.SPRITE) {
                        instance.object3d.rotation.y = instance.rotation_y;
                    }
                    instance.object3d.rotation.z = instance.rotation_z;

                    instance.object3d.scale.x = object.width * instance.scale_x;
                    instance.object3d.scale.y = object.height * instance.scale_y;
                    instance.object3d.scale.z = object.depth * instance.scale_z;

                    if (object.type != ObjectType.SPRITE) {
                        instance.object3d.updateMatrix();
                    }

                    chunk.instances.push(instance);
                    if (textureLookup[object.texture_id].transparent) {
                        chunk.transparentInstances.push(instance);
                    } else {
                        chunk.opaqueInstances.push(instance);
                    }
                    world.instances.push(instance);
                }

                // Do chunk update when chunk is in render distance
                const chunkX = Math.floor(this.game.camera.position.x / CHUNK_SIZE);
                const chunkY = Math.floor(this.game.camera.position.z / CHUNK_SIZE);
                if (Math.sqrt((chunk.x - chunkX) ** 2 + (chunk.y - chunkY) ** 2) <= CHUNK_RENDER_RANGE) {
                    this.game.handleChunkUpdate();
                }
            }

            // Parse world tick message
            if (type == MessageType.WORLD_TICK) {
                world.ticks = messageView.getUint32(pos, true); pos += 4;
            }
        }

        this.receiveCount += 1;
        this.receiveBytes += pos;
    }

    // Send all items that are in the send queue
    flushSendQueue() {
        // Check if there is any message to send
        if (this.sendQueue.length == 0) return;

        // Calculate the total message size
        let messageSize = 0;
        for (const item of this.sendQueue) {
            if (item.type == MessageType.WORLD_INFO) messageSize += 1;
            if (item.type == MessageType.WORLD_CHUNK) messageSize += 1 + 4 + 4;
        }

        // Create the message buffer and fill it with data
        const message = new ArrayBuffer(messageSize);
        const messageView = new DataView(message);
        let pos = 0;
        for (const item of this.sendQueue) {
            if (item.type == MessageType.WORLD_INFO) {
                messageView.setUint8(0, MessageType.WORLD_INFO); pos += 1
            }

            if (item.type == MessageType.WORLD_CHUNK) {
                messageView.setUint8(pos, MessageType.WORLD_CHUNK); pos += 1;
                messageView.setInt32(pos, item.x, true); pos += 4;
                messageView.setInt32(pos, item.y, true); pos += 4;
            }
        }
        this.ws.send(message);
        this.sendCount += 1;
        this.sendBytes += pos;

        // At last clear the send queue
        this.sendQueue = [];
    }
}

export default class Game {
    constructor({ canvas, debugLabel }) {
        this.canvas = canvas;
        this.gl = this.canvas.getContext('webgl');
        this.vertexArrayExtension = this.gl.getExtension('OES_vertex_array_object');
        this.instancedArraysExtension = this.gl.getExtension('ANGLE_instanced_arrays');
        this.debugLabel = debugLabel;
        window.addEventListener('resize', this.resize.bind(this));
        this.resize();
    }

    resize() {
        this.pixelRatio = window.devicePixelRatio;
        this.width = window.innerWidth * this.pixelRatio;
        this.height = window.innerHeight * this.pixelRatio;

        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.canvas.style.width = `${window.innerWidth}px`;
        this.canvas.style.height = `${window.innerHeight}px`;

        if (this.camera != undefined) {
            this.camera.aspect = this.canvas.width / this.canvas.height;
            this.camera.updateMatrix();
        }
    }

    init(gl) {
        // Connect to the server
        this.con = new Connection(this, 'ws://localhost:8080/ws');

        // Camera
        this.camera = new PerspectiveCamera(radians(75), this.canvas.width / this.canvas.height, 0.1, 10000);
        this.camera.position.y = 1.75;
        this.camera.position.z = 5;
        this.camera.updateMatrix();

        // Get texture unit count
        this.maxTextureUnits = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);
        this.textureUnitIndexes = [];
        for (let i = 0; i < this.maxTextureUnits; i++) this.textureUnitIndexes.push(i);

        // Create default instance drawing shader
        const vertexShader = createShader(gl, gl.VERTEX_SHADER, `
            attribute vec4 a_position;
            attribute vec2 a_texture_position;
            attribute mat4 a_matrix;
            attribute float a_texture_index;
            attribute vec2 a_texture_repeat;

            uniform mat4 u_camera;

            varying float v_texture_index;
            varying vec2 v_texture_position;

            void main() {
                gl_Position = u_camera * a_matrix * a_position;
                v_texture_index = a_texture_index;
                v_texture_position = a_texture_position * a_texture_repeat;
            }
        `);

        const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, `
            precision mediump float;

            uniform sampler2D u_texture[${this.maxTextureUnits}];
            uniform float u_lightness;

            varying float v_texture_index;
            varying vec2 v_texture_position;

            void main() {
                for (int i = 0; i < ${this.maxTextureUnits}; i++) {
                    if (int(v_texture_index) == i) {
                        gl_FragColor = texture2D(u_texture[i], v_texture_position) *
                            vec4(u_lightness, u_lightness, u_lightness, 1);
                    }
                }
            }
        `);

        this.program = createProgram(gl, vertexShader, fragmentShader);

        // Get program locations
        this.positionAttributeLocation = gl.getAttribLocation(this.program, 'a_position');
        this.texturePositionAttributeLocation = gl.getAttribLocation(this.program, 'a_texture_position');
        this.matrixAttributeLocation = gl.getAttribLocation(this.program, 'a_matrix');
        this.textureIndexAttributeLocation = gl.getAttribLocation(this.program, 'a_texture_index');
        this.textureRepeatAttributeLocation = gl.getAttribLocation(this.program, 'a_texture_repeat');
        this.cameraUniformLocation = gl.getUniformLocation(this.program, 'u_camera');
        this.textureUniformLocation = gl.getUniformLocation(this.program, 'u_texture');
        this.lightnessUniformLocation = gl.getUniformLocation(this.program, 'u_lightness');

        // Instance buffer
        this.instanceBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.instanceBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, INSTANCE_BUFFER_SIZE * 19 * 4, gl.DYNAMIC_DRAW);

        // Plane vao
        this.planeVertexArray = this.vertexArrayExtension.createVertexArrayOES();
        this.vertexArrayExtension.bindVertexArrayOES(this.planeVertexArray);
        this.planeBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.planeBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            // Vertex position, Texture position
            -0.5, -0.5, 0,   0, 1,
             0.5, -0.5, 0,   1, 1,
             0.5,  0.5, 0,   1, 0,

            -0.5, -0.5, 0,   0, 1,
             0.5,  0.5, 0,   1, 0,
            -0.5,  0.5, 0,   0, 0
        ]), gl.STATIC_DRAW);
        this.bindAttributes(gl);

        // Box vao
        this.boxVertexArray = this.vertexArrayExtension.createVertexArrayOES();
        this.vertexArrayExtension.bindVertexArrayOES(this.boxVertexArray);
        this.boxBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.boxBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            // Vertex position, Texture position
            -0.5, -0.5, -0.5,   1, 1, // Front face
             0.5, -0.5, -0.5,   0, 1,
             0.5,  0.5, -0.5,   0, 0,
            -0.5, -0.5, -0.5,   1, 1,
            -0.5,  0.5, -0.5,   1, 0,
             0.5,  0.5, -0.5,   0, 0,

            -0.5, -0.5,  0.5,   0, 1, // Back face
             0.5, -0.5,  0.5,   1, 1,
             0.5,  0.5,  0.5,   1, 0,
            -0.5, -0.5,  0.5,   0, 1,
            -0.5,  0.5,  0.5,   0, 0,
             0.5,  0.5,  0.5,   1, 0,

            -0.5, -0.5, -0.5,   0, 1, // Left face
            -0.5, -0.5,  0.5,   1, 1,
            -0.5,  0.5,  0.5,   1, 0,
            -0.5, -0.5, -0.5,   0, 1,
            -0.5,  0.5, -0.5,   0, 0,
            -0.5,  0.5,  0.5,   1, 0,

             0.5, -0.5, -0.5,   1, 1, // Right face
             0.5, -0.5,  0.5,   0, 1,
             0.5,  0.5,  0.5,   0, 0,
             0.5, -0.5, -0.5,   1, 1,
             0.5,  0.5, -0.5,   1, 0,
             0.5,  0.5,  0.5,   0, 0,

            -0.5, -0.5, -0.5,   0, 1, // Bottom face
             0.5, -0.5, -0.5,   1, 1,
             0.5, -0.5,  0.5,   1, 0,
            -0.5, -0.5, -0.5,   0, 1,
            -0.5, -0.5,  0.5,   0, 0,
             0.5, -0.5,  0.5,   1, 0,

            -0.5,  0.5,  0.5,   1, 0, // Top face
             0.5,  0.5,  0.5,   0, 0,
             0.5,  0.5, -0.5,   0, 1,
            -0.5,  0.5,  0.5,   1, 0,
            -0.5,  0.5, -0.5,   1, 1,
             0.5,  0.5, -0.5,   0, 1
        ]), gl.STATIC_DRAW);
        this.bindAttributes(gl);

        // Stats
        this.stats = new Stats();
        this.stats.dom.style.top = '';
        this.stats.dom.style.left = '';
        this.stats.dom.style.right = '16px';
        this.stats.dom.style.bottom = '16px';
        document.body.appendChild(this.stats.dom);

        // Keyboard controls
        this.keys = {};
        window.addEventListener('keydown', this.keydown.bind(this));
        window.addEventListener('keyup', this.keyup.bind(this));

        // Mouse controls
        this.mouse = {
            pointerlock: false,
            yaw: 0,
            pitch: 0
        };
        window.addEventListener('mousedown', this.mousedown.bind(this));
        window.addEventListener('mousemove', this.mousemove.bind(this));
        document.addEventListener('pointerlockchange', this.pointerlockchange.bind(this));

        // Renderer
        this.opaqueRenderGroups = [];
        this.transparentRenderGroups = [];
        this.itemCount = 0;
        this.drawCount = 0;
    }

    bindAttributes(gl) {
        // Attributes for the vertex buffer
        gl.enableVertexAttribArray(this.positionAttributeLocation);
        gl.vertexAttribPointer(this.positionAttributeLocation, 3, gl.FLOAT, false, 5 * 4, 0);

        gl.enableVertexAttribArray(this.texturePositionAttributeLocation);
        gl.vertexAttribPointer(this.texturePositionAttributeLocation, 2, gl.FLOAT, false, 5 * 4, 3 * 4);

        // Attributes for the instance buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, this.instanceBuffer);
        for (let i = 0; i < 4; i++) {
            const location = this.matrixAttributeLocation + i;
            gl.enableVertexAttribArray(location);
            gl.vertexAttribPointer(location, 4, gl.FLOAT, false, 19 * 4, i * 4 * 4);
            this.instancedArraysExtension.vertexAttribDivisorANGLE(location, 1);
        }

        gl.enableVertexAttribArray(this.textureIndexAttributeLocation);
        gl.vertexAttribPointer(this.textureIndexAttributeLocation, 1, gl.FLOAT, false, 19 * 4, 16 * 4);
        this.instancedArraysExtension.vertexAttribDivisorANGLE(this.textureIndexAttributeLocation, 1);

        gl.enableVertexAttribArray(this.textureRepeatAttributeLocation);
        gl.vertexAttribPointer(this.textureRepeatAttributeLocation, 2, gl.FLOAT, false, 19 * 4, 17 * 4);
        this.instancedArraysExtension.vertexAttribDivisorANGLE(this.textureRepeatAttributeLocation, 1);
    }

    keydown(event) {
        this.keys[event.key.toLowerCase()] = true;
        if (this.keys['o'] && CHUNK_RENDER_RANGE > 4) {
            CHUNK_RENDER_RANGE--;
            CHUNK_FETCH_RANGE = CHUNK_RENDER_RANGE + 2;
            this.handleChunkUpdate();
        }
        if (this.keys['p']) {
            CHUNK_RENDER_RANGE++;
            CHUNK_FETCH_RANGE = CHUNK_RENDER_RANGE + 2;
            this.handleChunkUpdate();
        }
    }

    keyup(event) {
        this.keys[event.key.toLowerCase()] = false;
    }

    mousedown() {
        this.canvas.requestPointerLock();
    }

    mousemove(event) {
        if (this.mouse.pointerlock) {
            this.mouse.yaw -= event.movementX * CAMERA_SENSITIVITY;
            this.mouse.pitch -= event.movementY * CAMERA_SENSITIVITY;
            if (this.mouse.pitch > radians(90)) this.mouse.pitch = radians(90);
            if (this.mouse.pitch < -radians(90)) this.mouse.pitch = -radians(90);
            this.camera.rotation.x = -this.mouse.pitch;
            this.camera.rotation.y = -this.mouse.yaw;
            this.camera.updateMatrix();
        }
    }

    pointerlockchange() {
        this.mouse.pointerlock = document.pointerLockElement == this.canvas;
    }

    updateDebugLabel() {
        this.debugLabel.innerHTML = `
            v${VERSION.MAJOR}.${VERSION.MINOR}.${VERSION.BUGFIX} -
            ${this.width}x${this.height}@${this.pixelRatio} -
            Camera: ${this.camera.position.x.toFixed(3)}x${this.camera.position.y.toFixed(3)}x${this.camera.position.z.toFixed(3)}
            ${this.camera.rotation.x.toFixed(3)}x${this.camera.rotation.y.toFixed(3)}x${this.camera.rotation.z.toFixed(3)} -
            Chunk: ${Math.floor(this.camera.position.x / CHUNK_SIZE)}x${Math.floor(this.camera.position.z / CHUNK_SIZE)} -
            Chunks: ${world.chunks.length} -
            Instances: ${world.instances.length}<br />

            Ticks: ${world.ticks} -
            Lightness: ${this.lightness.toFixed(3)} -
            Dist: ${CHUNK_RENDER_RANGE} -
            Send: ${formatBytes(this.con.sendBytes)} / ${this.con.sendCount} -
            Received: ${formatBytes(this.con.receiveBytes)} / ${this.con.receiveCount} -
            Draws: ${this.itemCount} / ${this.drawCount}
        `;
    }

    update(delta) {
        const oldChunkX = Math.floor(this.camera.position.x / CHUNK_SIZE);
        const oldChunkY = Math.floor(this.camera.position.z / CHUNK_SIZE);
        if (this.keys['w'] || this.keys['a'] || this.keys['d'] || this.keys['s'] || this.keys[' '] || this.keys['shift']) {
            const update = new Vector4();
            const moveSpeed = this.camera.position.y == 2 ? 25 : (this.camera.position.y > 75 ? 150 : 75);
            if (this.keys['w']) update.z -= moveSpeed * delta;
            if (this.keys['s']) update.z += moveSpeed * delta;
            if (this.keys['a']) update.x -= moveSpeed * delta;
            if (this.keys['d']) update.x += moveSpeed * delta;
            if (this.keys[' ']) update.y += moveSpeed * delta;
            if (this.keys['shift']) update.y -= moveSpeed * delta;
            update.mul(Matrix4.rotateY(this.camera.rotation.y));
            this.camera.position.add(update);
            if (this.camera.position.y < 2) this.camera.position.y = 2;
            this.camera.updateMatrix();

            const chunkX = Math.floor(this.camera.position.x / CHUNK_SIZE);
            const chunkY = Math.floor(this.camera.position.z / CHUNK_SIZE);
            if (chunkX != oldChunkX || chunkY != oldChunkY) {
                this.handleChunkUpdate();
            } else {
                this.handlePositionUpdate();
            }
        }

        // Calculate global lightness from world ticks
        this.lightness = Math.min(Math.max((Math.cos(world.ticks / (TICKS_PER_DAY / 2)) + 1) / 1.5, 0.3), 1);
    }

    // Create render groups for instances
    createRenderGroups(renderGroups, instances) {
        let renderGroup = { type: undefined, instances: [], data: [], textures: [] };
        for (const instance of instances) {
            const object = objectLookup[instance.object_id];

            // Rotate instance when it is a sprite
            if (object.type == ObjectType.SPRITE) {
                instance.object3d.rotation.y = Math.atan2(this.camera.position.x - instance.position_x, this.camera.position.z - instance.position_z);
                instance.object3d.updateMatrix();
            }

            // Add texture id to render group textures
            let textureIndex = renderGroup.textures.indexOf(object.texture_id);
            if (textureIndex == -1) {
                // Go to next render group
                if (renderGroup.textures.length == this.maxTextureUnits) {
                    renderGroups.push(renderGroup);
                    renderGroup = { type: undefined, instances: [], data: [], textures: [] };
                }

                renderGroup.textures.push(object.texture_id);
                textureIndex = renderGroup.textures.length - 1;
            }

            // Go to next render group when full
            if (renderGroup.instances.length == INSTANCE_BUFFER_SIZE - 1) {
                renderGroups.push(renderGroup);
                renderGroup = { type: undefined, instances: [], data: [], textures: [] };
            }

            // Give render group its type when missing
            if (renderGroup.type == undefined) {
                renderGroup.type = object.type == ObjectType.SPRITE ? ObjectType.PLANE : object.type;
            }

            // If object type is different go to next render group
            if (
                renderGroup.type != object.type &&
                (
                    object.type != ObjectType.SPRITE ||
                    (object.type == ObjectType.SPRITE && renderGroup.type != ObjectType.PLANE)
                )
            ) {
                renderGroups.push(renderGroup);
                renderGroup = { type: object.type, instances: [], data: [], textures: [] };
            }

            // Add matrix and texture data to render group
            for (let i = 0; i < 16; i++) {
                renderGroup.data[renderGroup.instances.length * 19 + i] = instance.object3d.matrix.elements[i];
            }
            renderGroup.data[renderGroup.instances.length * 19 + 16] = textureIndex;
            renderGroup.data[renderGroup.instances.length * 19 + 17] = object.texture_repeat_x;
            renderGroup.data[renderGroup.instances.length * 19 + 18] = object.texture_repeat_y;
            renderGroup.instances.push(instance);
        }
        renderGroups.push(renderGroup);
    }

    // Handle camera position update
    handlePositionUpdate() {
        // Rotate all sprite instances in the opaque render groups
        for (const renderGroup of this.opaqueRenderGroups) {
            for (let i = 0; i < renderGroup.instances.length; i++) {
                const instance = renderGroup.instances[i];
                const object = objectLookup[instance.object_id];
                if (object.type == ObjectType.SPRITE) {
                    instance.object3d.rotation.y = Math.atan2(this.camera.position.x - instance.position_x, this.camera.position.z - instance.position_z);
                    instance.object3d.updateMatrix();
                    for (let j = 0; j < 16; j++) {
                        renderGroup.data[i * 19 + j] = instance.object3d.matrix.elements[j];
                    }
                }
            }
        }

        // Rotate all sprite instances in the transparent render groups except the last
        for (let i = 0; i < this.transparentRenderGroups.length; i++) {
            const renderGroup = this.transparentRenderGroups[i];
            for (let j = 0; j < renderGroup.instances.length; j++) {
                const instance = renderGroup.instances[j];
                const object = objectLookup[instance.object_id];
                if (object.type == ObjectType.SPRITE) {
                    instance.object3d.rotation.y = Math.atan2(this.camera.position.x - instance.position_x, this.camera.position.z - instance.position_z);
                    instance.object3d.updateMatrix();
                    if (i != this.transparentRenderGroups.length - 1) {
                        for (let k = 0; k < 16; k++) {
                            renderGroup.data[j * 19 + k] = instance.object3d.matrix.elements[k];
                        }
                    }
                }
            }
        }

        // Reorder the last transparent render group
        const renderGroup = this.transparentRenderGroups[this.transparentRenderGroups.length - 1];
        renderGroup.instances.sort((a, b) => {
            return Math.sqrt((this.camera.position.x - b.position_x) ** 2 + (this.camera.position.z - b.position_z) ** 2) -
                Math.sqrt((this.camera.position.x - a.position_x) ** 2 + (this.camera.position.z - a.position_z) ** 2);
        });

        // Refill the instance data of the last transparent render group
        for (let i = 0; i < renderGroup.instances.length; i++) {
            const instance = renderGroup.instances[i];
            const object = objectLookup[instance.object_id];
            for (let j = 0; j < 16; j++) {
                renderGroup.data[i * 19 + j] = instance.object3d.matrix.elements[j];
            }
            renderGroup.data[i * 19 + 16] = renderGroup.textures.indexOf(object.texture_id);
            renderGroup.data[i * 19 + 17] = object.texture_repeat_x;
            renderGroup.data[i * 19 + 18] = object.texture_repeat_y;
        }
    }

    // Handle chunk update
    handleChunkUpdate() {
        // Request chunks that are not loaded yet
        const chunkX = Math.floor(this.camera.position.x / CHUNK_SIZE);
        const chunkY = Math.floor(this.camera.position.z / CHUNK_SIZE);
        for (let y = chunkY - CHUNK_FETCH_RANGE; y < chunkY + CHUNK_FETCH_RANGE; y++) {
            for (let x = chunkX - CHUNK_FETCH_RANGE; x < chunkX + CHUNK_FETCH_RANGE; x++) {
                if (!world.requestedChunksLookup[`${x}x${y}`]) {
                    world.requestedChunksLookup[`${x}x${y}`] = true;
                    this.con.sendQueue.push({ type: MessageType.WORLD_CHUNK, x, y });
                }
            }
        }
        this.con.flushSendQueue();

        // Collect all instances that need to be rendered
        const opaqueInstances = [];
        const transparentInstances = [];
        for (const chunk of world.chunks) {
            if (Math.sqrt((chunk.x - chunkX) ** 2 + (chunk.y - chunkY) ** 2) <= CHUNK_RENDER_RANGE) {
                opaqueInstances.push(...chunk.opaqueInstances);
                transparentInstances.push(...chunk.transparentInstances);
            }
        }

        // Sort opaque instances byte type then create opaque render groups for the opaque instances
        opaqueInstances.sort((a, b) => {
            return objectLookup[b.object_id].type - objectLookup[a.object_id].type;
        });
        this.opaqueRenderGroups = [];
        this.createRenderGroups(this.opaqueRenderGroups, opaqueInstances);

        // Sort transparent instances by camera distance
        transparentInstances.sort((a, b) => {
            return Math.sqrt((this.camera.position.x - b.position_x) ** 2 + (this.camera.position.z - b.position_z) ** 2) -
                Math.sqrt((this.camera.position.x - a.position_x) ** 2 + (this.camera.position.z - a.position_z) ** 2);
        });

        // Create transparent render groups for the transparent instances
        this.transparentRenderGroups = [];
        this.createRenderGroups(this.transparentRenderGroups, transparentInstances);
    }

    render(gl) {
        this.itemCount = 0;
        this.drawCount = 0;

        // Clear canvas with background color
        gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        gl.clearColor(0.57 * this.lightness, 0.89 * this.lightness, 0.98 * this.lightness, 1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // Use default shader and set camera matrix
        gl.useProgram(this.program);
        gl.uniformMatrix4fv(this.cameraUniformLocation, false, this.camera.matrix.elements);
        gl.enable(gl.DEPTH_TEST);

        // Set global lightness value
        gl.uniform1f(this.lightnessUniformLocation, this.lightness);

        // Set textures to first texture unit indexs
        gl.uniform1iv(this.textureUniformLocation, this.textureUnitIndexes);

        // Draw opaque render groups
        for (const renderGroup of this.opaqueRenderGroups) {
            let vertexCount;
            if (renderGroup.type == ObjectType.PLANE) {
                this.vertexArrayExtension.bindVertexArrayOES(this.planeVertexArray);
                vertexCount = 6;
            }
            if (renderGroup.type == ObjectType.BOX) {
                this.vertexArrayExtension.bindVertexArrayOES(this.boxVertexArray);
                vertexCount = 36;
            }

            gl.bindBuffer(gl.ARRAY_BUFFER, this.instanceBuffer);
            gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(renderGroup.data));

            for (let i = 0; i < renderGroup.textures.length; i++) {
                gl.activeTexture(gl.TEXTURE0 + i);
                gl.bindTexture(gl.TEXTURE_2D, textureLookup[renderGroup.textures[i]].texture);
            }

            this.instancedArraysExtension.drawArraysInstancedANGLE(gl.TRIANGLES, 0, vertexCount, renderGroup.instances.length);
            this.itemCount += renderGroup.instances.length;
            this.drawCount++;
        }

        // Draw transparent render groups
        this.vertexArrayExtension.bindVertexArrayOES(this.planeVertexArray);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        for (const renderGroup of this.transparentRenderGroups) {
            gl.bindBuffer(gl.ARRAY_BUFFER, this.instanceBuffer);
            gl.bufferSubData(gl.ARRAY_BUFFER, 0, new Float32Array(renderGroup.data));

            for (let i = 0; i < renderGroup.textures.length; i++) {
                gl.activeTexture(gl.TEXTURE0 + i);
                gl.bindTexture(gl.TEXTURE_2D, textureLookup[renderGroup.textures[i]].texture);
            }

            this.instancedArraysExtension.drawArraysInstancedANGLE(gl.TRIANGLES, 0, 6, renderGroup.instances.length);
            this.itemCount += renderGroup.instances.length;
            this.drawCount++;
        }
        gl.disable(gl.BLEND);
    }

    loop() {
        window.requestAnimationFrame(this.loop.bind(this));
        this.stats.begin();
        const time = window.performance.now();
        this.update((time - this.oldTime) / 1000);
        this.oldTime = time;
        this.render(this.gl);
        this.updateDebugLabel();
        this.stats.end();
    }

    start() {
        this.init(this.gl);
        this.oldTime = window.performance.now();
        this.loop();
    }
}
