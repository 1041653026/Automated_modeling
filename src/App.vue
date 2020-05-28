<template>
  <div id="app">
    <div class="box" ref='box'></div>
    <div class="operate" :style='{width: showSide ? "30vw" : 0}'>
      <div class="control" @click='changeShowSide'>
        {{`${showSide ? '&gt;&gt;&gt;' : '&lt;&lt;&lt;'}`}}
      </div>
      <div class="title">自定义模型构建</div>
      <div class="homeTable"></div>
      <div class="treeTable"></div>
    </div>
  </div>
</template>

<script>
import * as t from './MyThree'
export default {
  name: 'App',
  data() {
    return {
      renderer: '',
      scene: '',
      camera: '',
      width: 1000,
      height: 1000,
      light: '',
      cube: '',
      showSide: false,
      cubeData: [{
        size: [10,20,10],
        face: ['/nv.jpg', '/nv.jpg', '', '', '/nv.jpg', '/nv.jpg'],
        pos: [40, 10, 10]
      }, {
        size: [10,20,10],
        face: ['/nv.jpg', '/nv.jpg', '', '', '/nv.jpg', '/nv.jpg'],
        pos: [-40, 10, 10]
      }, {
        size: [10,20,20],
        face: ['/nv.jpg', '/nv.jpg', '', '', '/nv.jpg', '/nv.jpg'],
        pos: [-40, -50, 10]
      }, {
        size: [10,40,10],
        face: ['/loufang.png', '/loufang.png', '', '', '/loufang.png', '/loufang.png'],
        pos: [-40, 50, 10]
      }]
    }
  },
  mounted() {
    this.width = this.$refs.box.getBoundingClientRect().width;
    this.height = this.$refs.box.getBoundingClientRect().height;
    this.renderer = t.initRenderer(this.$refs.box);
    this.scene = t.initScene();
    this.camera = t.initCamera({type: 'perspective', data: [45, this.width / this.height, 0.01, 100000]}, {pos: [-50, 50, 0], lookAt: [0,0,0]});
    this.light = t.initLight('ambient', [0xffffff], [0,0,300], this.scene);
    this.helper = t.initHelper(this.scene);
    this.cube = t.initCube([20,40,20,], {color: 0x00ffff}, this.scene);
    this.cube.position.set(0, 40, 0);
    // t.createCube([10,20,10], ['/nv.jpg', '/nv.jpg', '', '', '/nv.jpg', '/nv.jpg'], [40, 10, 10], this.scene);
    this.cubeData.forEach(item => {
      t.createCube(item.size, item.face, item.pos, this.scene);
    })

    t.loadModel('gltf', '/box.glb', this.scene, model => {
      this.model = model;
      this.renderer.domElement.addEventListener('click', (e) => {
        let x = (e.offsetX / this.width) * 2 - 1;
        let y = (e.offsetY / this.height) * 2 + 1;
        let mouse = new t.default.Vector2(x, y);

        let raycaster = new t.default.Raycaster();
        raycaster.setFromCamera(mouse, this.camera);
        let intersects = raycaster.intersectObjects(model.children)
        console.log(intersects)
      })
    });
    this.control = t.initControler(this.camera, this.renderer, t.animation(() => {
      this.renderer.render(this.scene, this.camera);
    }));
    // t.animation(() => {
    //   this.renderer.render(this.scene, this.camera);
    // })
  },
  methods: {
    changeShowSide() {
      this.showSide = !this.showSide;
    }
  }
}
</script>

<style lang='scss' scoped>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
  .box {
    width: 100vw;
    height: 100vh;
    position: absolute;
    left: 0;
    top: 0;
  }
  .operate {
    width: 30vw;
    height: 100vh;
    position: absolute;
    right: 0;
    top: 0;
    background: #fff;
    z-index: 666;
    transition: all .5s linear 0s;
    .control {
      width: 2vw;
      height: 8vh;
      position: absolute;
      left: -2vw;
      top: 50%;
      transform: translateY(-50%);
      cursor: pointer;
      text-align: center;
      line-height: 8vh;
      font-size: 1vw;
      color: rgba(0,0,0,.5);
      background-color: #eee;
    }
    .title {
      width: 100%;
      height: 5vh;
      text-align: center;
      line-height: 5vh;
      font-size: 2vh;
      font-weight: bold;
      color: rgb(88, 99, 96);
    }
    .homeTable {
      width: 100%;
      height: 30vh;
      background-color: red;
    }
  }
}
</style>
