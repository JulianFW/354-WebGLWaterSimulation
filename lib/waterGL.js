// import ShaderProgram from './webgl/shaders/shaderProgram';
import Renderer from "./webgl/renderer/renderer";
import ShaderProgram from "./webgl/shaders/shaderProgram";
import vertexShader from "./shaders/simple_vs";
import fragmentShader from "./shaders/simple_fs";

import waterVS from "./shaders/water_vs";
import waterFS from "./shaders/water_fs";

import Box from "./webgl/entities/box";
import Water from "./webgl/entities/water";
import Cube from "./webgl/entities/cube";

import Camera from "./webgl/entities/camera";
import Camera2 from "./webgl/entities/Camera2";

import { mat4, vec3 } from "gl-matrix";

export default class waterGL {
  /**
   * @param {WebGLRenderingContext} GL
   */
  constructor(GL) {
    this.GL = GL;
    this.GL.enable(this.GL.DEPTH_TEST);
    this.GL.enable(this.GL.BLEND);
    this.GL.blendFunc(this.GL.SRC_ALPHA, this.GL.ONE_MINUS_SRC_ALPHA);

    this.totalTime = 0;
    this.deltaTime = 0;
    this.lastUpdate = Date.now();

    this.projectionMatrix = mat4.create();
    this.createProjectionMatrix();

    this.camera = new Camera([0, 15, 50], [0, 0, 5], [0, 1, 0]);
    this.camera2 = new Camera2(
      [0, 15, 50],
      [0, 0, 5],
      [0, 1, 0],
      45,
      this.GL.canvas.width / this.GL.canvas.height,
      0.1,
      1000.0
    );

    this.cubeShader = new ShaderProgram(
      vertexShader,
      fragmentShader,
      ["color"],
      ["position", "normal"],
      GL
    );
    this.cubeRenderer = new Renderer(GL, this.cubeShader);
    let box = new Box(GL, this.cubeShader);
    let cube = new Cube(GL, this.cubeShader);

    this.cubeRenderer.addRenderObject(box);
    this.cubeRenderer.addRenderObject(cube);

    this.waterShader = new ShaderProgram(
      waterVS,
      waterFS,
      [
        "color",
        "time",
        "amplitude",
        "steepness",
        "wavelength",
        "frequency",
        "sampler",
        "sampler2",
      ],
      ["position", "texCoord"],
      GL
    );
    this.waterRenderer = new Renderer(GL, this.waterShader);
    this.waterRenderer.addRenderObject(new Water(GL, this.waterShader));
    window.addEventListener("resize", () => this.createProjectionMatrix());

    this.renderLoop();
  }

  prepare() {
    this.GL.clearColor(1, 1, 1, 1);
    this.GL.clear(this.GL.COLOR_BUFFER_BIT | this.GL.DEPTH_BUFFER_BIT);
  }

  renderLoop() {
    requestAnimationFrame(this.renderLoop.bind(this));
    this.camera.move();
    this.camera2.move();
    let viewMatrix = this.camera.getViewMatrix();
    this.updateTime();
    this.prepare();

    this.cubeShader.start();

    this.cubeRenderer.render(
      this.deltaTime,
      this.totalTime,
      viewMatrix,
      this.projectionMatrix
    );

    this.cubeShader.stop();

    this.waterShader.start();

    this.waterRenderer.render(
      this.deltaTime,
      this.totalTime,
      viewMatrix,
      this.projectionMatrix
    );

    this.waterShader.stop();
  }

  updateTime() {
    let newTime = Date.now();
    this.deltaTime = (newTime - this.lastUpdate) / 1000;
    this.lastUpdate = newTime;
    this.totalTime += this.deltaTime;
  }

  createProjectionMatrix() {
    this.GL.canvas.width = (window.innerWidth - 60) * 0.75;
    this.GL.canvas.height = window.innerHeight - 60;
    this.GL.viewport(0, 0, this.GL.canvas.width, this.GL.canvas.height);
    mat4.perspective(
      this.projectionMatrix,
      Math.PI / 4,
      this.GL.canvas.width / this.GL.canvas.height,
      1,
      500
    );
  }
}
