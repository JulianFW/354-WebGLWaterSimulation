import { mat4 } from "gl-matrix/src/gl-matrix";
import { createModelMatrix } from "../utils/math";
import ShaderProgram from "../shaders/shaderProgram";
import waterFramebuffers from "../waterFramebuffers";

let fbos;

export default class Renderer {
  /**
   *
   * @param {WebGLRenderingContext} GL
   * @param {ShaderProgram} shaderProgram
   *
   */
  constructor(GL, shaderProgram) {
    this.GL = GL;
    this.shader = shaderProgram;
    this.renderObjects = [];
    fbos = new waterFramebuffers(GL);
  }

  addRenderObject(renderObject) {
    this.renderObjects.push(renderObject);
  }

  render(deltaTime, totalTime, viewMatrix, projectionMatrix) {
    this.GL.uniformMatrix4fv(this.shader.uniforms["view"], false, viewMatrix);
    this.GL.uniformMatrix4fv(
      this.shader.uniforms["projection"],
      false,
      projectionMatrix
    );

    fbos.bindReflectionFramebuffer();
    this.renderObjects.forEach((renderObject) => {
      renderObject.render(deltaTime, totalTime, viewMatrix, projectionMatrix);
    });
    fbos.unbindReflectionFramebuffer();
    this.renderObjects.forEach((renderObject) => {
      renderObject.render(deltaTime, totalTime, viewMatrix, projectionMatrix);
    });
  }

  // renderPrimitive( primitiveType, color, vertices ) {
  //   this.GL.enableVertexAttribArray(this.uposition);
  //   let buffer = this.GL.createBuffer();
  //   this.GL.bindBuffer(this.GL.ARRAY_BUFFER, buffer);
  //   this.GL.bufferData(this.GL.ARRAY_BUFFER, new Float32Array(vertices), this.GL.STREAM_DRAW);
  //   this.GL.uniform4fv(this.ucolor, color);
  //   this.GL.vertexAttribPointer(this.uposition, 3, this.GL.FLOAT, false, 0, 0);
  //   this.GL.drawArrays(primitiveType, 0, vertices.length/3);
  // }
}
