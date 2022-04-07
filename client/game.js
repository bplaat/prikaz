// Utils
function now() {
    return 'performance' in window ? performance.now() : Date.now();
}

// Math
function degrees(radians) {
    return radians * 180 / Math.PI;
}

function radians(degrees) {
    return degrees * Math.PI / 180;
}

class Matrix4 {
    constructor(elements) {
        this.elements = elements;
    }

    clone() {
        return new Matrix4(this.elements);
    }

    mul(matrix) {
        const b00 = matrix.elements[0 * 4 + 0];
        const b01 = matrix.elements[0 * 4 + 1];
        const b02 = matrix.elements[0 * 4 + 2];
        const b03 = matrix.elements[0 * 4 + 3];
        const b10 = matrix.elements[1 * 4 + 0];
        const b11 = matrix.elements[1 * 4 + 1];
        const b12 = matrix.elements[1 * 4 + 2];
        const b13 = matrix.elements[1 * 4 + 3];
        const b20 = matrix.elements[2 * 4 + 0];
        const b21 = matrix.elements[2 * 4 + 1];
        const b22 = matrix.elements[2 * 4 + 2];
        const b23 = matrix.elements[2 * 4 + 3];
        const b30 = matrix.elements[3 * 4 + 0];
        const b31 = matrix.elements[3 * 4 + 1];
        const b32 = matrix.elements[3 * 4 + 2];
        const b33 = matrix.elements[3 * 4 + 3];
        const a00 = this.elements[0 * 4 + 0];
        const a01 = this.elements[0 * 4 + 1];
        const a02 = this.elements[0 * 4 + 2];
        const a03 = this.elements[0 * 4 + 3];
        const a10 = this.elements[1 * 4 + 0];
        const a11 = this.elements[1 * 4 + 1];
        const a12 = this.elements[1 * 4 + 2];
        const a13 = this.elements[1 * 4 + 3];
        const a20 = this.elements[2 * 4 + 0];
        const a21 = this.elements[2 * 4 + 1];
        const a22 = this.elements[2 * 4 + 2];
        const a23 = this.elements[2 * 4 + 3];
        const a30 = this.elements[3 * 4 + 0];
        const a31 = this.elements[3 * 4 + 1];
        const a32 = this.elements[3 * 4 + 2];
        const a33 = this.elements[3 * 4 + 3];

        this.elements = [
            b00 * a00 + b01 * a10 + b02 * a20 + b03 * a30,
            b00 * a01 + b01 * a11 + b02 * a21 + b03 * a31,
            b00 * a02 + b01 * a12 + b02 * a22 + b03 * a32,
            b00 * a03 + b01 * a13 + b02 * a23 + b03 * a33,
            b10 * a00 + b11 * a10 + b12 * a20 + b13 * a30,
            b10 * a01 + b11 * a11 + b12 * a21 + b13 * a31,
            b10 * a02 + b11 * a12 + b12 * a22 + b13 * a32,
            b10 * a03 + b11 * a13 + b12 * a23 + b13 * a33,
            b20 * a00 + b21 * a10 + b22 * a20 + b23 * a30,
            b20 * a01 + b21 * a11 + b22 * a21 + b23 * a31,
            b20 * a02 + b21 * a12 + b22 * a22 + b23 * a32,
            b20 * a03 + b21 * a13 + b22 * a23 + b23 * a33,
            b30 * a00 + b31 * a10 + b32 * a20 + b33 * a30,
            b30 * a01 + b31 * a11 + b32 * a21 + b33 * a31,
            b30 * a02 + b31 * a12 + b32 * a22 + b33 * a32,
            b30 * a03 + b31 * a13 + b32 * a23 + b33 * a33,
        ];
        return this;
    }

    static identity() {
        return new Matrix4([
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ]);
    }

    static orthographic(left, right, bottom, top, near, far) {
        return new Matrix4([
            2 / (right - left), 0, 0, 0,
            0, 2 / (top - bottom), 0, 0,
            0, 0, 2 / (near - far), 0,
            (left + right) / (left - right),
            (bottom + top) / (bottom - top),
            (near + far) / (near - far),
            1
        ]);
    }

    static perspective(fov, aspect, near, far) {
        const f = Math.tan(Math.PI * 0.5 - 0.5 * fov);
        const r = 1.0 / (near - far);
        return new Matrix4([
            f / aspect, 0, 0, 0,
            0, f, 0, 0,
            0, 0, (near + far) * r, -1,
            0, 0, near * far * r * 2, 0
        ]);
    }

    static translate(x, y, z) {
        return new Matrix4([
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            x, y, z, 1
        ]);
    }

    static rotateX(x) {
        const c = Math.cos(x);
        const s = Math.sin(x);
        return new Matrix4([
            1, 0, 0, 0,
            0, c, s, 0,
            0, -s, c, 0,
            0, 0, 0, 1
        ]);
    }

    static rotateY(y) {
        const c = Math.cos(y);
        const s = Math.sin(y);
        return new Matrix4([
            c, 0, -s, 0,
            0, 1, 0, 0,
            s, 0, c, 0,
            0, 0, 0, 1
        ]);
    }

    static rotateZ(z) {
        const c = Math.cos(z);
        const s = Math.sin(z);
        return new Matrix4([
            c, s, 0, 0,
            -s, c, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ]);
    }

    static scale(x, y, z) {
        return new Matrix4([
            x, 0, 0, 0,
            0, y, 0, 0,
            0, 0, z, 0,
            0, 0, 0, 1
        ]);
    }
}


class Vector4 {
    constructor(x = 0, y = 0, z = 0, w = 1) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
    }

    clone() {
        return new Vector4(this.x, this.y, this.z, this.w);
    }

    set(x = 0, y = 0, z = 0, w = 1) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
    }

    add(vector) {
        this.x += vector.x;
        this.y += vector.y;
        this.z += vector.z;
        this.w += vector.w;
        return this;
    }

    sub(vector) {
        this.x -= vector.x;
        this.y -= vector.y;
        this.z -= vector.z;
        this.w -= vector.w;
        return this;
    }

    mul(rhs) {
        if (rhs instanceof Vector4) {
            this.x *= rhs.x;
            this.y *= rhs.y;
            this.z *= rhs.z;
            this.w *= rhs.w;
        }
        if (rhs instanceof Matrix4) {
            const x = rhs.elements[0 * 4 + 0] * this.x + rhs.elements[0 * 4 + 1] * this.y + rhs.elements[0 * 4 + 2] * this.z + rhs.elements[0 * 4 + 3] * this.w;
            const y = rhs.elements[1 * 4 + 0] * this.x + rhs.elements[1 * 4 + 1] * this.y + rhs.elements[1 * 4 + 2] * this.z + rhs.elements[1 * 4 + 3] * this.w;
            const z = rhs.elements[2 * 4 + 0] * this.x + rhs.elements[2 * 4 + 1] * this.y + rhs.elements[2 * 4 + 2] * this.z + rhs.elements[2 * 4 + 3] * this.w;
            const w = rhs.elements[3 * 4 + 0] * this.x + rhs.elements[3 * 4 + 1] * this.y + rhs.elements[3 * 4 + 2] * this.z + rhs.elements[3 * 4 + 3] * this.w;
            this.x = x;
            this.y = y;
            this.z = z;
            this.w = w;
        }
        return this;
    }

    div(vector) {
        this.x /= vector.x;
        this.y /= vector.y;
        this.z /= vector.z;
        this.w /= vector.w;
        return this;
    }

    dist(vector) {
        return Math.sqrt((this.x - vector.x) ** 2 + (this.y - vector.y) ** 2 + (this.z - vector.z) ** 2);
    }

    distFlat(vector) {
        return Math.sqrt((this.x - vector.x) ** 2 + (this.z - vector.z) ** 2);
    }
}

// 3D objects
class Object3D {
    constructor() {
        this.position = new Vector4();
        this.rotation = new Vector4();
        this.scale = new Vector4(1, 1, 1);
    }

    updateMatrix() {
        this.matrix = Matrix4.translate(this.position.x, this.position.y, this.position.z)
            .mul(Matrix4.rotateX(this.rotation.x))
            .mul(Matrix4.rotateY(this.rotation.y))
            .mul(Matrix4.rotateZ(this.rotation.z))
            .mul(Matrix4.scale(this.scale.x, this.scale.y, this.scale.z));
    }
}

class PerspectiveCamera extends Object3D {
    constructor(fov, aspect, near, far) {
        super();
        this.fov = fov;
        this.aspect = aspect;
        this.near = near;
        this.far = far;
    }

    updateMatrix() {
        this.matrix = Matrix4.perspective(this.fov, this.aspect, this.near, this.far)
            .mul(Matrix4.rotateX(this.rotation.x))
            .mul(Matrix4.rotateY(this.rotation.y))
            .mul(Matrix4.rotateZ(this.rotation.z))
            .mul(Matrix4.translate(-this.position.x, -this.position.y, -this.position.z));
    }
}

// WebGL stuff
class Shader {
    constructor(gl, vertexShaderSource, fragmentShaderSource) {
        this.gl = gl;
        const vertexShader = this.createShader(gl.VERTEX_SHADER, vertexShaderSource);
        const fragmentShader = this.createShader(gl.FRAGMENT_SHADER, fragmentShaderSource);
        this.program = this.createProgram(vertexShader, fragmentShader);
    }

    createShader(type, source) {
        const shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);
        const success = this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS);
        if (success) return shader;
        console.log(this.gl.getShaderInfoLog(shader));
        this.gl.deleteShader(shader);
    }

    createProgram(vertexShader, fragmentShader) {
        const program = this.gl.createProgram();
        this.gl.attachShader(program, vertexShader);
        this.gl.attachShader(program, fragmentShader);
        this.gl.linkProgram(program);
        const success = this.gl.getProgramParameter(program, this.gl.LINK_STATUS);
        if (success) return program;
        console.log(this.gl.getProgramInfoLog(program));
        this.gl.deleteProgram(program);
    }

    getAttribLocation(name) {
        return this.gl.getAttribLocation(this.program, name);
    }

    getUniformLocation(name) {
        return this.gl.getUniformLocation(this.program, name);
    }

    use() {
        this.gl.useProgram(this.program);
    }
}

// Game

// Constants
const RENDER_DIST = 300;
const CHUNK_SIZE = 16;
const INSTANCE_BUFFER_SIZE = 4096;
const CHUNK_FETCH_RANGE = RENDER_DIST / CHUNK_SIZE;
const CAMERA_SENSITIVITY = 0.004;

const MessageType = {
    WORLD_INFO: 1,
    WORLD_CHUNK: 2
};

const ObjectType = {
    SPRITE: 1,
    PLANE: 2
};

// World
let textures = [];
let textureLookup = {};

let objects = [];
let objectLookup = {};

const world = {
    chunks: [],
    requestChunks: [],
    instances: []
};

// Websocket connection
class Connection {
    constructor(gl, url) {
        this.gl = gl;
        this.ws = new WebSocket(url);
        this.ws.binaryType = 'arraybuffer';
        this.connected = false;
        this.ws.onopen = this.onOpen.bind(this);
        this.ws.onmessage = this.onMessage.bind(this);
    }

    onOpen() {
        this.connected = true;
        this.sendWorldInfoMessage();
    }

    onMessage(event) {
        const messageView = new DataView(event.data);

        let pos = 0;
        const type = messageView.getUint8(pos); pos += 1;

        // Parse world info response message
        if (type == MessageType.WORLD_INFO) {
            const texturesLength = messageView.getUint32(pos, true); pos += 4;
            textures = [];
            textureLookup = {};
            for (let i = 0; i < texturesLength; i++) {
                const texture = {};
                texture.id = messageView.getUint32(pos, true); pos += 4;
                texture.transparent = messageView.getUint8(pos); pos += 1;
                textures.push(texture);
                textureLookup[texture.id] = texture;

                const image = new Image();
                image.crossOrigin = '';
                image.src = 'http://localhost:8080/textures/' + texture.id;
                image.onload = () => {
                    const gl = this.gl;
                    texture.texture = gl.createTexture();
                    gl.bindTexture(gl.TEXTURE_2D, texture.texture);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
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
        }

        // Parse world info response message
        if (type == MessageType.WORLD_CHUNK) {
            const chunk = {};
            chunk.id = messageView.getUint32(pos, true); pos += 4;
            chunk.x = messageView.getInt32(pos, true); pos += 4;
            chunk.y = messageView.getInt32(pos, true); pos += 4;
            world.chunks.push(chunk);

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
                world.instances.push(instance);
            }
        }
    }

    sendWorldInfoMessage() {
        const message = new ArrayBuffer(1);
        const messageView = new DataView(message);
        messageView.setUint8(0, MessageType.WORLD_INFO);
        this.ws.send(message);
    }

    sendWorldChunkMessage(x, y) {
        const message = new ArrayBuffer(1 + 4 * 2);
        const messageView = new DataView(message);
        let pos = 0;
        messageView.setUint8(pos, MessageType.WORLD_CHUNK); pos += 1;
        messageView.setInt32(pos, x, true); pos += 4;
        messageView.setInt32(pos, y, true);
        this.ws.send(message);
    }
}

class Game {
    constructor() {
        this.canvas = document.getElementById('canvas');
        this.gl = this.canvas.getContext('webgl');
        this.vertexArrayExtension = this.gl.getExtension('OES_vertex_array_object');
        this.instancedArraysExtension = this.gl.getExtension('ANGLE_instanced_arrays');
        this.pixelRatio = document.pixelRatio || 1;
        window.addEventListener('resize', this.resize.bind(this));
        this.resize();
    }

    resize() {
        this.canvas.width = window.innerWidth * this.pixelRatio;
        this.canvas.height = window.innerHeight * this.pixelRatio;
        this.canvas.style.width = window.innerWidth + 'px';
        this.canvas.style.height = window.innerHeight + 'px';

        if (this.camera != undefined) {
            this.camera.aspect = this.canvas.width / this.canvas.height;
            this.camera.updateMatrix();
        }
    }

    init(gl) {
        // Connect to the server
        this.con = new Connection(gl, 'ws://localhost:8080/ws');

        // Create default instance drawing shader
        this.shader = new Shader(gl,
            `attribute vec4 a_position;
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
            }`,

            `precision mediump float;

            uniform sampler2D u_texture[8];

            varying float v_texture_index;
            varying vec2 v_texture_position;

            void main() {
                if (v_texture_index == 0.0) gl_FragColor = texture2D(u_texture[0], v_texture_position);
                else if (v_texture_index == 1.0) gl_FragColor = texture2D(u_texture[1], v_texture_position);
                else if (v_texture_index == 2.0) gl_FragColor = texture2D(u_texture[2], v_texture_position);
                else if (v_texture_index == 3.0) gl_FragColor = texture2D(u_texture[3], v_texture_position);
                else if (v_texture_index == 4.0) gl_FragColor = texture2D(u_texture[4], v_texture_position);
                else if (v_texture_index == 5.0) gl_FragColor = texture2D(u_texture[5], v_texture_position);
                else if (v_texture_index == 6.0) gl_FragColor = texture2D(u_texture[6], v_texture_position);
                else if (v_texture_index == 7.0) gl_FragColor = texture2D(u_texture[7], v_texture_position);
                else gl_FragColor = vec4(0, 0, 0, 1);
            }`
        );
        this.positionAttributeLocation = this.shader.getAttribLocation('a_position');
        this.texturePositionAttributeLocation = this.shader.getAttribLocation('a_texture_position');
        this.matrixAttributeLocation = this.shader.getAttribLocation('a_matrix');
        this.textureIndexAttributeLocation = this.shader.getAttribLocation('a_texture_index');
        this.textureRepeatAttributeLocation = this.shader.getAttribLocation('a_texture_repeat');
        this.cameraUniformLocation = this.shader.getUniformLocation('u_camera');
        this.textureUniformLocation = this.shader.getUniformLocation('u_texture');

        // Plane vao
        this.planeVertexArray = this.vertexArrayExtension.createVertexArrayOES();
        this.vertexArrayExtension.bindVertexArrayOES(this.planeVertexArray);

        // Plane buffer
        this.planeBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.planeBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            // Vertex position, Texture position
            -0.5, -0.5, -0.5,   0, 1,
             0.5, -0.5, -0.5,   1, 1,
             0.5,  0.5, -0.5,   1, 0,

            -0.5, -0.5, -0.5,   0, 1,
             0.5,  0.5, -0.5,   1, 0,
            -0.5,  0.5, -0.5,   0, 0
        ]), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(this.positionAttributeLocation);
        gl.vertexAttribPointer(this.positionAttributeLocation, 3, gl.FLOAT, false, 5 * 4, 0);
        gl.enableVertexAttribArray(this.texturePositionAttributeLocation);
        gl.vertexAttribPointer(this.texturePositionAttributeLocation, 2, gl.FLOAT, false, 5 * 4, 3 * 4);

        // Instance buffer
        this.instanceBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.instanceBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, INSTANCE_BUFFER_SIZE * 19 * 4, gl.DYNAMIC_DRAW);
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

        // Camera
        this.camera = new PerspectiveCamera(radians(75), this.canvas.width / this.canvas.height, 0.1, 10000);
        this.camera.position.y = 1.75;
        this.camera.position.z = 5;
        this.camera.updateMatrix();

        // Debug label
        this.debugLabel = document.getElementById('debug');

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
    }

    keydown(event) {
        this.keys[event.key.toLowerCase()] = true;
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
        this.debugLabel.textContent = `Camera: ${this.camera.position.x.toFixed(3)}x${this.camera.position.y.toFixed(3)}x${this.camera.position.z.toFixed(3)}
            ${this.camera.rotation.x.toFixed(3)}x${this.camera.rotation.y.toFixed(3)}x${this.camera.rotation.z.toFixed(3)} -
            Chunk: ${Math.floor(this.camera.position.x / CHUNK_SIZE)}x${Math.floor(this.camera.position.z / CHUNK_SIZE)} -
            Chunks: ${world.chunks.length} - Instances: ${world.instances.length} - Draws: ${this.itemCount} / ${this.drawCount}`;
    }

    update(delta) {
        const camera = this.camera;
        if (this.keys['w'] || this.keys['a'] || this.keys['d'] || this.keys['s'] || this.keys[' '] || this.keys['shift']) {
            const update = new Vector4();
            const moveSpeed = camera.position.y == 2 ? 20 : 75;
            if (this.keys['w']) update.z -= moveSpeed * delta;
            if (this.keys['s']) update.z += moveSpeed * delta;
            if (this.keys['a']) update.x -= moveSpeed * delta;
            if (this.keys['d']) update.x += moveSpeed * delta;
            if (this.keys[' ']) update.y += moveSpeed * delta;
            if (this.keys['shift']) update.y -= moveSpeed * delta;
            update.mul(Matrix4.rotateY(camera.rotation.y));
            camera.position.add(update);
            if (camera.position.y < 2) camera.position.y = 2;
            camera.updateMatrix();
        }

        if (this.con.connected) {
            const cx = Math.floor(camera.position.x / CHUNK_SIZE);
            const cy = Math.floor(camera.position.z / CHUNK_SIZE);
            for (let y = cy - CHUNK_FETCH_RANGE; y <= cy + CHUNK_FETCH_RANGE; y++) {
                for (let x = cx - CHUNK_FETCH_RANGE; x <= cx + CHUNK_FETCH_RANGE; x++) {
                    if (world.requestChunks.find(chunk => chunk.x == x && chunk.y == y) == null) {
                        world.requestChunks.push({ x, y });
                        this.con.sendWorldChunkMessage(x, y);
                    }
                }
            }
        }
    }

    render(gl) {
        this.itemCount = 0;
        this.drawCount = 0;

        gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        gl.clearColor(146 / 255, 226 / 255, 251 / 255, 1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // Use default shader and set camera matrix
        this.shader.use();
        gl.uniformMatrix4fv(this.cameraUniformLocation, false, this.camera.matrix.elements);
        gl.enable(gl.DEPTH_TEST);

        // Set textures to first 8 texture unit
        gl.uniform1iv(this.textureUniformLocation, [0, 1, 2, 3, 4, 5, 6, 7]);

        // Select plane vertex stuff
        this.vertexArrayExtension.bindVertexArrayOES(this.planeVertexArray);

        // Sort instances SLOW
        world.instances.sort((a, b) => {
            return this.camera.position.distFlat(new Vector4(b.position_x, b.position_y, b.position_z)) -
                this.camera.position.distFlat(new Vector4(a.position_x, a.position_y, a.position_z));
        });
        world.instances.sort((a, b) => {
            return a.position_y - b.position_y;
        });

        // Draw world instances
        let groupItems = 0, groupTextures = [];
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        for (const instance of world.instances) {
            if (this.camera.position.distFlat(new Vector4(instance.position_x, instance.position_y, instance.position_z)) > RENDER_DIST) {
                continue;
            }

            const object = objectLookup[instance.object_id];

            if (textureLookup[object.texture_id].texture == undefined) {
                continue;
            }

            const object3d = new Object3D();
            object3d.position.x = instance.position_x;
            object3d.position.y = instance.position_y + object.height / 2;
            object3d.position.z = instance.position_z;

            object3d.rotation.x = instance.rotation_x;
            if (object.type == ObjectType.SPRITE) {
                object3d.rotation.y = Math.atan2(this.camera.position.x - instance.position_x, this.camera.position.z - instance.position_z);
            } else {
                object3d.rotation.y = instance.rotation_y;
            }
            object3d.rotation.z = instance.rotation_z;

            object3d.scale.x = object.width * instance.scale_x;
            object3d.scale.y = object.height * instance.scale_y;
            object3d.scale.z = object.depth * instance.scale_z;

            object3d.updateMatrix();

            // Set matrix and texture repeat
            let groupTextureIndex = groupTextures.indexOf(object.texture_id);
            if (groupTextureIndex == -1) {
                groupTextures.push(object.texture_id);
                groupTextureIndex = groupTextures.length - 1;
            }

            gl.bindBuffer(gl.ARRAY_BUFFER, this.instanceBuffer);
            gl.bufferSubData(gl.ARRAY_BUFFER, groupItems * 19 * 4, new Float32Array(object3d.matrix.elements));
            gl.bufferSubData(gl.ARRAY_BUFFER, groupItems * 19 * 4 + 16 * 4, new Float32Array([ groupTextureIndex, object.texture_repeat_x, object.texture_repeat_y ]));
            groupItems++;
            this.itemCount++;

            // Draw when instance buffer is full
            if (groupItems == INSTANCE_BUFFER_SIZE - 1 || groupTextures.length == 8) {
                for (let i = 0; i < groupTextures.length; i++) {
                    gl.activeTexture(gl.TEXTURE0 + i);
                    gl.bindTexture(gl.TEXTURE_2D, textureLookup[groupTextures[i]].texture);
                }
                this.instancedArraysExtension.drawArraysInstancedANGLE(gl.TRIANGLES, 0, 6, groupItems);
                this.drawCount++;

                groupItems = 0;
                groupTextures = [];
            }
        }

        for (let i = 0; i < groupTextures.length; i++) {
            gl.activeTexture(gl.TEXTURE0 + i);
            gl.bindTexture(gl.TEXTURE_2D, textureLookup[groupTextures[i]].texture);
        }
        this.instancedArraysExtension.drawArraysInstancedANGLE(gl.TRIANGLES, 0, 6, groupItems);
        this.drawCount++;

        gl.disable(gl.BLEND);
    }

    loop() {
        window.requestAnimationFrame(this.loop.bind(this));
        this.stats.begin();
        const time = now();
        this.update((time - this.oldTime) / 1000);
        this.oldTime = time;
        this.render(this.gl);
        this.updateDebugLabel();
        this.stats.end();
    }

    start() {
        this.init(this.gl);
        this.oldTime = now();
        this.loop();
    }
}

const game = new Game();
game.start();
