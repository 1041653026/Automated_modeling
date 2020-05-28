<template>
  <div id="app">
    <div class="box" ref='box'></div>
    <div class="operate" :style='{width: showSide ? "30vw" : 0}'>
      <div class="control" @click='changeShowSide'>
        {{`${showSide ? '&gt;&gt;&gt;' : '&lt;&lt;&lt;'}`}}
      </div>
      <div class="title">自定义模型构建</div>
      <div class="homeTable">
        <div class="table-title">房屋列表</div>
        <div class="table-title-sub">注：贴图方向以x轴正方向为前</div>
        <el-table :data="cubeData" height="238" border style="width: 100%;height: 100%;">
          <el-table-column prop="name" label="名称" width="80">
          </el-table-column>
          <el-table-column prop="size" label="大小(x,y,z)" width="120">
            <template v-slot='scoped'>{{ '[ ' + scoped.row.size.toString() + ' ]'}}</template>
          </el-table-column>
          <el-table-column prop="pos" label="位置(x,y,z)" width="120">
            <template v-slot='scoped'>{{ '[ ' + scoped.row.size.toString() + ' ]'}}</template>
          </el-table-column>
          <el-table-column prop="face" label="贴图(前,后,上,下,左,右)" width="180">
            <template v-slot='scoped'>
              {{ '[ ' + scoped.row.face.map(item => picList.indexOf(item) > -1 ? '图' + (picList.indexOf(item) + 1) : '无').toString() + ' ]'}}
            </template>
          </el-table-column>
          <el-table-column prop="repeat" label="贴图repeat(x,y)" width="120">
            <template v-slot='scoped'>{{ '[ ' + scoped.row.repeat.toString() + ' ]'}}</template>
          </el-table-column>
          <el-table-column prop="rotate" label="旋转(x,y,z)" width="100">
            <template v-slot='scoped'>{{ '[ ' + scoped.row.rotate.toString() + ' ]'}}</template>
          </el-table-column>
          <el-table-column prop="show" label="显示" align='center' width="60">
            <template v-slot='scoped'><input type="checkbox" :checked='scoped.row.show' @change='changeShowState(scoped.row)'></template>
          </el-table-column>
          <el-table-column prop="show" label="操作" align='center' width="160">
            <template v-slot='scoped'>
              <el-button type="primary" size="mini">修改</el-button>
              <el-button type="danger" size="mini" @click='deleteCube(scoped.row)'>删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div class="picList">
        <div class="change-box" v-if='picList.length > 3'>
          <div class="change-left" @click='changeLeft'>&lt;</div>
          <div class="change-right" @click='changeRight'>&gt;</div>
        </div>
        <div class="picList-title">贴图列表</div>
        <div class="picList-main">
          <div class="picList-inner" ref='picList'>
            <template v-for='(item, i) in picList'>
              <div :key='i' class='picList-sub'>
                <div class="pic-index">图{{i+1}}</div>
                <img :src="item" alt="">
              </div>
            </template>
          </div>
        </div>
      </div>
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
      showSide: false,          // 是否展示侧边栏
      picList: ['/juminlou.jpg', 'nv.jpg', 'lou.jpg', 'loufang.png', 'map.jpg'],
      picListMove: 0,           // 图片列表的移动
      cubeData: [{
        size: [50, 60, 38],
        face: ['/juminlou.jpg', '/juminlou.jpg', '', '', '/juminlou.jpg', '/juminlou.jpg'],
        pos: [-15, 30, -87],
        rotate: [0, 0.15, 0],
        repeat: [1,1],
        show: true,
        cur: null,
        name: '左一'
      }, {
        size: [92, 60, 38],
        face: ['/juminlou.jpg', '/juminlou.jpg', '', '', '/juminlou.jpg', '/juminlou.jpg'],
        pos: [15, 30, -20],
        rotate: [0, 0.1, 0],
        repeat: [2,1],
        show: true,
        cur: null,
        name: '左二'
      }, {
        size: [83, 60, 38],
        face: ['/juminlou.jpg', '/juminlou.jpg', '', '', '/juminlou.jpg', '/juminlou.jpg'],
        pos: [16, 30, 55],
        rotate: [0, 0.1, 0],
        repeat: [1,1],
        show: true,
        cur: null,
        name: '左三'
      }, {
        size: [92, 60, 38],
        face: ['/juminlou.jpg', '/juminlou.jpg', '', '', '/juminlou.jpg', '/juminlou.jpg'],
        pos: [22, 30, 125],
        rotate: [0, 0.1, 0],
        repeat: [1,1],
        show: true,
        cur: null,
        name: '左四'
      }]
    }
  },
  mounted() {
    this.width = this.$refs.box.getBoundingClientRect().width;
    this.height = this.$refs.box.getBoundingClientRect().height;
    this.renderer = t.initRenderer(this.$refs.box);
    this.scene = t.initScene();
    this.camera = t.initCamera({type: 'perspective', data: [45, this.width / this.height, 0.01, 100000]}, {pos: [300, 200, 100], lookAt: [0,0,0]});
    this.light = t.initLight('ambient', [0xffffff], [0,0,300], this.scene);
    // this.helper = t.initHelper(this.scene);
    t.createCube([800, 1, 451], ['', '', '/map.jpg', '', '', ''], [0,-1,0], [0,0,0], [1,1], this.scene);
    this.cubeData.forEach(item => {
      item.cur = t.createCube(item.size, item.face, item.pos, item.rotate, item.repeat, this.scene);
    })
    console.log(this.cubeData)
    // t.loadModel('gltf', '/box.glb', this.scene, model => {
    //   this.model = model;
    //   this.renderer.domElement.addEventListener('click', (e) => {
    //     let x = (e.offsetX / this.width) * 2 - 1;
    //     let y = (e.offsetY / this.height) * 2 + 1;
    //     let mouse = new t.default.Vector2(x, y);

    //     let raycaster = new t.default.Raycaster();
    //     raycaster.setFromCamera(mouse, this.camera);
    //     let intersects = raycaster.intersectObjects(model.children)
    //     console.log(intersects)
    //   })
    // });
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
    },
    changeLeft() {
      this.picListMove -= 1;
      if (this.picListMove < 0) {
        this.picListMove = 0;
        return;
      }
      this.$refs.picList.style.left = -this.picListMove * 10 + 'vw';
    },
    changeRight() {
      this.picListMove += 1;
      if (this.picListMove > this.picList.length - 3) {
        this.picListMove = this.picList.length - 3;
        return;
      }
      console.log(this.picListMove)
      this.$refs.picList.style.left = -this.picListMove * 10 + 'vw';
    },
    changeShowState(item) {
      item.show = !item.show
      // console.log(this.cubeData[2].show)
      if (item.show) {
        this.scene.add(item.cur);
      } else {
        this.scene.remove(item.cur);
      }
    },
    deleteCube(item) {
      this.scene.remove(item.cur);
      this.cubeData.splice(this.cubeData.indexOf(item), 1)
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
      margin-bottom: 2vh;
    }
    .homeTable {
      width: 100%;
      height: 37vh;
      margin-bottom: 6vh;
      .table-title {
        width: 100%;
        height: 3vh;
        line-height: 3vh;
        font-size: 2vh;
        font-weight: bold;
        padding-left: 1vh;
        margin-bottom: 1vh;
        color: blue;
      }
      .table-title-sub {
        width: 100%;
        height: 2vh;
        font-size: 1.3vh;
        line-height: 2vh;
        padding-left: 1vh;
        margin-bottom: 1vh;
        color:red;
      }
    }
    .picList {
      width: 100%;
      height: 24vh;
      position: relative;
      .change-box {
        width: 100%;
        height: 8vh;
        opacity: 0;
        position: absolute;
        left: 0;
        top: 10vh;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        transition: all .5s linear 0s;
        z-index: 222;
        .change-left,.change-right {
          width: 3vh;
          height: 100%;
          font-size: 5vh;
          text-align: center;
          line-height: 8vh;
          color: #fff;
          background-color: rgba(0,0,0,.5);
          cursor: pointer;
          &:hover {
            background-color: rgba(0,0,0,.4);
          }
        }
      }
      &:hover {
        .change-box {
          opacity: 1;
        }
      }
      .picList-title {
        width: 100%;
        height: 3vh;
        line-height: 3vh;
        font-size: 2vh;
        font-weight: bold;
        padding-left: 1vh;
        margin-bottom: 1vh;
        color: blue;
      }
      .picList-main {
        width: 100%;
        height: 20vh;
        border: 1px solid rgb(210, 210, 210);
        overflow: hidden;
        position: relative;
        .picList-inner {
          width: 100vw;
          display: flex;
          flex-direction: row;
          cursor: pointer;
          transition: all .5s linear 0s;
          position: absolute;
          left: 0;
          top: 0;
          .picList-sub {
            width: 10vw;
            height: 100%;
            .pic-index {
              width: 100%;
              height: 3vh;
              text-align: center;
              // border: 1px solid rgb(210, 210, 210);
            }
            img {
              width: 100%;
              height: 17vh;
            }
          }
        }
      }
    }
  }
}
</style>
