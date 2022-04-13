import { Matrix4, Vector4 } from "./math.js";

export class Object3D {
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

export class PerspectiveCamera extends Object3D {
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
