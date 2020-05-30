<template>
  <div id="app">
    <div class="box" ref='box'></div>
    <div class="operate" :style='{width: showSide ? "30vw" : 0}'>
      <div class="control" @click='changeShowSide'>
        {{`${showSide ? '&gt;&gt;&gt;' : '&lt;&lt;&lt;'}`}}
      </div>
      <div class="title">自定义模型构建</div>
      <div class="homeTable">
        <div class="table-title">
          <span style='margin-right: 5vw;'>房屋列表</span>
          <el-button type="success" size="mini" @click='changeOperateState("create")' style='margin-right: 5vw;'>+ 添加房屋</el-button>
          <el-button type="primary" size="mini" @click='openHelper'>{{isShowHelper ? '关闭坐标系' : '打开坐标系'}}</el-button>
        </div>
        <div class="table-title-sub">注：贴图方向以x轴正方向为前!&nbsp;&nbsp;&nbsp;坐标系橙色为X轴,绿色为Y轴,蓝色为Z轴</div>
        <el-table :data="cubeData" height="238" border style="width: 100%;height: 100%;">
          <el-table-column prop="name" label="名称" width="80">
          </el-table-column>
          <el-table-column prop="size" label="大小(x,y,z)" width="120">
            <template v-slot='scoped'>{{ '[ ' + scoped.row.size.toString() + ' ]'}}</template>
          </el-table-column>
          <el-table-column prop="pos" label="位置(x,y,z)" width="120">
            <template v-slot='scoped'>{{ '[ ' + scoped.row.pos.toString() + ' ]'}}</template>
          </el-table-column>
          <el-table-column prop="face" label="贴图(前,后,上,下,左,右)" width="190">
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
              <el-button type="primary" size="mini" @click='configHomeData(scoped.row)'>修改</el-button>
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
        <div class="picList-title">
          <span style='margin-right: 5vw;'>贴图列表</span>
          <el-button type="success" size="mini" @click='changeImg'>{{isShowImg ? '取消贴图' : '一键贴图'}}</el-button>
        </div>
        <div class="picList-main" style='margin-top: 3vh;'>
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

      <!-- 以下是操作模块 -->
      <div :class="{'operate-data': true, 'operate-data-show': operateState !== 'show'}">
        <div class="returnBtn" @click='returnBtnEvent'>
          <svg t="1590760054907" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1226" width="30" height="30"><path d="M916.3 466.3H218.1l288.4-288.4c17.8-17.8 17.8-46.9 0-64.7-17.8-17.8-46.9-17.8-64.7 0L75.3 479.7c-17.8 17.8-17.8 46.9 0 64.7l366.5 366.5c17.8 17.8 46.9 17.8 64.7 0 17.8-17.8 17.8-46.9 0-64.7L218.1 557.7h698.2c25.2 0 45.7-20.6 45.7-45.7 0-25.2-20.6-45.7-45.7-45.7z" fill="" p-id="1227"></path></svg>
        </div>
        <el-form :model="homeForm" ref="homeForm" label-width="100px" class="demo-homeForm" size='small'>
          <div class="homeForm-title">{{operateState === 'create' ? '创建房屋' : '修改房屋'}}</div>
          <el-form-item label="房屋名称" prop="name">
            <el-input v-model="homeForm.name"></el-input>
          </el-form-item>
          <el-form-item label="房屋大小:" prop="sizeX">
            <div class='flexRow'>
              <div class='flexRow' style='margin-right: 1vh;'>宽:<el-input v-model="homeForm.sizeX" @keyup.native='limitNum("sizeX", $event)'></el-input></div> 
              <div class='flexRow' style='margin-right: 1vh;'>高:<el-input v-model="homeForm.sizeY" @keyup.native='limitNum("sizeY", $event)'></el-input></div> 
              <div class='flexRow'>深:<el-input v-model="homeForm.sizeZ" @keyup.native='limitNum("sizeZ", $event)'></el-input></div>
            </div>
            <p style="font-size: 1.5vh; color:red;">注: 请输入数字!</p>
          </el-form-item>
          <el-form-item label="房屋位置:" prop="posX">
            <div class='flexRow'>
              <div class='flexRow' style='margin-right: 1vh;'>X:<el-input v-model="homeForm.posX"  @keyup.native='limitNum("posX", $event)'></el-input></div> 
              <div class='flexRow' style='margin-right: 1vh;'>Y:<el-input v-model="homeForm.posY" @keyup.native='limitNum("posY", $event)'></el-input></div> 
              <div class='flexRow'>Z:<el-input v-model="homeForm.posZ"  @keyup.native='limitNum("posZ", $event)'></el-input></div>
            </div>
            <p style="font-size: 1.5vh; color:red;">注: 房屋位置为房屋中心点所在位置!</p>
          </el-form-item>
          <el-form-item label="房屋贴图:" prop="sizeX">
            <div class='flexRow' style='margin-bottom: 3vh;'>
              <div class='flexRow' style='margin-right: 1vh;'>
                前:<el-select v-model="homeForm.faceQ" placeholder="请选择">
                  <el-option  label="无" value=""></el-option>
                  <el-option v-for='(item,i) in picList' :label="`图${i + 1}`" :value="item" :key='i'></el-option>
                </el-select>
              </div>
              <div class='flexRow' style='margin-right: 1vh;'>
                左:<el-select v-model="homeForm.faceZ" placeholder="请选择">
                  <el-option  label="无" value=""></el-option>
                  <el-option v-for='(item,i) in picList' :label="`图${i + 1}`" :value="item" :key='i'></el-option>
                </el-select></div>
              <div class='flexRow'>
                上:<el-select v-model="homeForm.faceS" placeholder="请选择">
                  <el-option  label="无" value=""></el-option>
                  <el-option v-for='(item,i) in picList' :label="`图${i + 1}`" :value="item" :key='i'></el-option>
                </el-select></div>
            </div>
            <div class='flexRow'>
              <div class='flexRow' style='margin-right: 1vh;'>
                后:<el-select v-model="homeForm.faceH" placeholder="请选择">
                  <el-option  label="无" value=""></el-option>
                  <el-option v-for='(item,i) in picList' :label="`图${i + 1}`" :value="item" :key='i'></el-option>
                </el-select></div>
              <div class='flexRow' style='margin-right: 1vh;'>
                右:<el-select v-model="homeForm.faceY" placeholder="请选择">
                  <el-option  label="无" value=""></el-option>
                  <el-option v-for='(item,i) in picList' :label="`图${i + 1}`" :value="item" :key='i'></el-option>
                </el-select></div>
              <div class='flexRow'>
                下:<el-select v-model="homeForm.faceX" placeholder="请选择">
                  <el-option  label="无" value=""></el-option>
                  <el-option v-for='(item,i) in picList' :label="`图${i + 1}`" :value="item" :key='i'></el-option>
                </el-select></div>
            </div>
          </el-form-item>
          <el-form-item label="贴图repeat:" prop="repeatX">
            <div class='flexRow'>
              <div class='flexRow' style='margin-right: 5vh;'>X：<el-input v-model="homeForm.repeatX"  @keyup.native='limitNum("repeatX", $event)'></el-input></div> 
              <div class='flexRow'>Y：<el-input v-model="homeForm.repeatY"  @keyup.native='limitNum("repeatY", $event)'></el-input></div> 
            </div>
            <p style="font-size: 1.5vh; color:red;">注: 请输入数字!</p>
          </el-form-item>
          <el-form-item label="房屋旋转:" prop="rotateX">
            <div class='flexRow'>
              <div class='flexRow' style='margin-right: 1vh;'>X:<el-input v-model="homeForm.rotateX"  @keyup.native='limitNum("rotateX", $event)'></el-input></div> 
              <div class='flexRow' style='margin-right: 1vh;'>Y:<el-input v-model="homeForm.rotateY"  @keyup.native='limitNum("rotateY", $event)'></el-input></div> 
              <div class='flexRow'>Z:<el-input v-model="homeForm.rotateZ"   @keyup.native='limitNum("rotateZ", $event)'></el-input></div>
            </div>
            <p style="font-size: 1.5vh; color:red;">注: 请输入数字!</p>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="submitForm()" style='margin: 1vh 1vh 0 0; width:5vw;'>{{operateState === 'create' ? '立即创建' : '立即修改'}}</el-button>
            <el-button type="primary" @click="resetForm()" style='width: 5vw;margin-right: 1vh;'>重置</el-button>
            <el-button type="primary" @click='openHelper'>{{isShowHelper ? '关闭坐标系' : '打开坐标系'}}</el-button>
          </el-form-item>
        </el-form>
        <div class="picList">
          <div class="change-box" v-if='picList.length > 3'>
            <div class="change-left" @click='changeLeft2'>&lt;</div>
            <div class="change-right" @click='changeRight2'>&gt;</div>
          </div>
          <div class="picList-title">贴图列表</div>
          <div class="picList-main">
            <div class="picList-inner" ref='picList2'>
              <template v-for='(item, i) in picList'>
                <div :key='i' class='picList-sub'>
                  <div class="pic-index">图{{i+1}}</div>
                  <img :src="item" alt="">
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>
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
      pointLight: '',
      cube: '',
      helper: '',
      water: '',
      water2: '',
      showSide: false,          // 是否展示侧边栏
      picList: ['/juminlou.png', 'louback.png', 'louside.png', 'louding.png', 'juminlou1.png', 'juminlou2.png', 'juminlou3.png'],
      picListMove: 0,           // 图片列表的移动
      picListMove2: 0,           // 图片列表的移动
      showOpeateData: false,    // 是否展示添加、修改房屋侧边栏
      operateState: 'show',          // 操作页面状态,三种状态，show：数据，create: 生成房屋， config: 修改房屋
      needConfig: '',           // 需要修改的房屋
      isShowHelper: false,      // 展示坐标系;
      isShowImg: false,         // 是否展示贴图
      cubeData: [{
        id: 0,
        name: '#1',
        size: [84, 60, 40],
        face: ['/louside.png', '/louside.png', '/louding.png', '', '/juminlou.png', '/louback.png'],
        pos: [-23.5, 30, -82],
        rotate: [0, 0.07, 0],
        repeat: [1,1],
        show: true,
        cur: null
      }, {
        id: 1,
        name: '#2',
        size: [150, 60, 40],
        face: ['/louside.png', '/louside.png', '/louding.png', '', '/juminlou.png', '/louback.png'],
        pos: [27, 30, -20],
        rotate: [0, 0.06, 0],
        repeat: [2,1],
        show: true,
        cur: null
      }, {
        id: 2,
        name: '#3',
        size: [132, 60, 43],
        face: ['/louside.png', '/louside.png', '/louding.png', '', '/juminlou.png', '/louback.png'],
        pos: [30, 30, 55],
        rotate: [0, 0.07, 0],
        repeat: [2,1],
        show: true,
        cur: null
      }, {
        id: 3,
        name: '#4',
        size: [130, 60, 38],
        face: ['/louside.png', '/louside.png', '/louding.png', '', '/juminlou.png', '/louback.png'],
        pos: [35, 30, 118],
        rotate: [0, 0.07, 0],
        repeat: [2,1],
        show: true,
        cur: null
      }, {
        id: 4,
        name: '#5',
        size: [125, 60, 42],
        face: ['/louside.png', '/louside.png', '/louding.png', '', '/juminlou.png', '/louback.png'],
        pos: [180, 30, -7],
        rotate: [0, -0.08, 0],
        repeat: [2,1],
        show: true,
        cur: null
      }, {
        id: 5,
        name: '#6',
        size: [120, 60, 41],
        face: ['/louside.png', '/louside.png', '/louding.png', '', '/juminlou.png', '/louback.png'],
        pos: [193, 30, 103],
        rotate: [0, 0.07, 0],
        repeat: [2,1],
        show: true,
        cur: null
      }, {
        id: 6,
        name: '#7',
        size: [120, 60, 41],
        face: ['/louside.png', '/louside.png', '/louding.png', '', '/juminlou.png', '/louback.png'],
        pos: [-300, 30, 103],
        rotate: [0, 0, 0],
        repeat: [2,1],
        show: true,
        cur: null
      }, {
        id: 7,
        name: '#8',
        size: [120, 60, 41],
        face: ['/louside.png', '/louside.png', '/louding.png', '', '/juminlou.png', '/louback.png'],
        pos: [-300, 30, 103],
        rotate: [0, 0, 0],
        repeat: [2,1],
        show: true,
        cur: null
      }, {
        id: 8,
        name: '#9',
        size: [120, 60, 41],
        face: ['/louside.png', '/louside.png', '/louding.png', '', '/juminlou.png', '/louback.png'],
        pos: [-300, 30, 3],
        rotate: [0, 0, 0],
        repeat: [2,1],
        show: true,
        cur: null
      }, {
        id: 9,
        name: '#10',
        size: [120, 60, 41],
        face: ['/louside.png', '/louside.png', '/louding.png', '', '/juminlou.png', '/louback.png'],
        pos: [-300, 30, -103],
        rotate: [0, 0, 0],
        repeat: [2,1],
        show: true,
        cur: null
      }, {
        id: 10,
        name: '#11',
        size: [130, 60, 38],
        face: ['/louside.png', '/louside.png', '/louding.png', '', '/louback.png', '/juminlou.png'],
        pos: [35, 30, 200],
        rotate: [0, 0, 0],
        repeat: [2,1],
        show: true,
        cur: null
      }, {
        id: 11,
        name: '#12',
        size: [130, 60, 38],
        face: ['/louside.png', '/louside.png', '/louding.png', '', '/louback.png', '/juminlou.png'],
        pos: [195, 30, 200],
        rotate: [0, 0, 0],
        repeat: [2,1],
        show: true,
        cur: null
      }, {
        id: 12,
        name: '#13',
        size: [100, 60, 38],
        face: ['/louside.png', '/louside.png', '/louding.png', '', '/louback.png', '/juminlou.png'],
        pos: [335, 30, 200],
        rotate: [0, 0, 0],
        repeat: [2,1],
        show: true,
        cur: null
      }, {
        id: 13,
        name: '#14',
        size: [100, 60, 38],
        face: ['/louside.png', '/louside.png', '/louding.png', '', '/juminlou.png', '/louback.png'],
        pos: [335, 30, 110],
        rotate: [0, 0, 0],
        repeat: [2,1],
        show: true,
        cur: null
      }, {
        id: 14,
        name: '#15',
        size: [100, 60, 38],
        face: ['/louside.png', '/louside.png', '/louding.png', '', '/juminlou.png', '/louback.png'],
        pos: [335, 30, -20],
        rotate: [0, 0, 0],
        repeat: [2,1],
        show: true,
        cur: null
      }, {
        id: 15,
        name: '#16',
        size: [100, 60, 38],
        face: ['/louside.png', '/louside.png', '/louding.png', '', '/juminlou.png', '/louback.png'],
        pos: [335, 30, -100],
        rotate: [0, 0, 0],
        repeat: [2,1],
        show: true,
        cur: null
      }, {
        id: 16,
        name: '#17',
        size: [100, 60, 38],
        face: ['/louside.png', '/louside.png', '/louding.png', '', '/juminlou.png', '/louback.png'],
        pos: [335, 30, -190],
        rotate: [0, 0, 0],
        repeat: [2,1],
        show: true,
        cur: null
      }, {
        id: 17,
        name: '#18',
        size: [84, 60, 40],
        face: ['/louside.png', '/louside.png', '/louding.png', '', '/juminlou.png', '/louback.png'],
        pos: [-23.5, 30, -182],
        rotate: [0, 0.07, 0],
        repeat: [1,1],
        show: true,
        cur: null
      }, {
        id: 18,
        name: '#19',
        size: [100, 60, 38],
        face: ['/louside.png', '/louside.png', '/louding.png', '', '/juminlou.png', '/louback.png'],
        pos: [185, 30, -100],
        rotate: [0, 0, 0],
        repeat: [1,1],
        show: true,
        cur: null
      }, {
        id: 19,
        name: '#20',
        size: [100, 60, 38],
        face: ['/louside.png', '/louside.png', '/louding.png', '', '/juminlou.png', '/louback.png'],
        pos: [185, 30, -190],
        rotate: [0, 0, 0],
        repeat: [1,1],
        show: true,
        cur: null
      }],
      treeData: [ 
      //   {
      //   id: 0,
      //   type: 'songshu',
      //   pos: [-30, 3, 180],
      //   scale: [0.05,0.05,0.05]
      // }, {
      //   id: 1,
      //   type: 'songshu',
      //   pos: [-50, 3, 180],
      //   scale: [0.05,0.05,0.05]
      // }, 
      // {
      //   id: 2,
      //   type: 'songshu',
      //   pos: [245, 3, 51],
      //   scale: [0.05,0.05,0.05]
      // }, {
      //   id: 3,
      //   type: 'songshu',
      //   pos: [215, 3, 58],
      //   scale: [0.05,0.05,0.05]
      // }, {
      //   id: 4,
      //   type: 'songshu',
      //   pos: [195, 3, 61],
      //   scale: [0.05,0.05,0.05]
      // }, {
      //   id: 5,
      //   type: 'songshu',
      //   pos: [165, 3, 64],
      //   scale: [0.05,0.05,0.05]
      // }, {
      //   id: 6,
      //   type: 'songshu',
      //   pos: [135, 3, 67],
      //   scale: [0.05,0.05,0.05]
      // }, {
      //   id: 7,
      //   type: 'songshu',
      //   pos: [215, 3, 45],
      //   scale: [0.05,0.05,0.05]
      // }, {
      //   id: 8,
      //   type: 'songshu',
      //   pos: [195, 3, 42],
      //   scale: [0.05,0.05,0.05]
      // }, {
      //   id: 9,
      //   type: 'songshu',
      //   pos: [165, 3, 39],
      //   scale: [0.05,0.05,0.05]
      // }, {
      //   id: 10,
      //   type: 'songshu',
      //   pos: [135, 3, 36],
      //   scale: [0.05,0.05,0.05]
      // }, {
      //   id: 11,
      //   type: 'songshu',
      //   pos: [105, 3, 67],
      //   scale: [0.05,0.05,0.05]
      // }, {
      //   id: 12,
      //   type: 'songshu',
      //   pos: [105, 3, 36],
      //   scale: [0.05,0.05,0.05]
      // },
      // {
      //   id: 13,
      //   type: 'songshu',
      //   pos: [255, 3, 21],
      //   scale: [0.05,0.05,0.05]
      // }, {
      //   id: 14,
      //   type: 'songshu',
      //   pos: [270, 3, 0],
      //   scale: [0.05,0.05,0.05]
      // }, {
      //   id: 15,
      //   type: 'songshu',
      //   pos: [285, 3, -20],
      //   scale: [0.05,0.05,0.05]
      // }, {
      //   id: 16,
      //   type: 'songshu',
      //   pos: [300, 3, -40],
      //   scale: [0.05,0.05,0.05]
      // }, {
      //   id: 17,
      //   type: 'songshu',
      //   pos: [315, 3, -60],
      //   scale: [0.05,0.05,0.05]
      // }, {
      //   id: 18,
      //   type: 'songshu',
      //   pos: [300, 3, -60],
      //   scale: [0.05,0.05,0.05]
      // }, {
      //   id: 19,
      //   type: 'songshu',
      //   pos: [280, 3, -60],
      //   scale: [0.05,0.05,0.05]
      // },
      //  {
      //   id: 20,
      //   type: 'songshu',
      //   pos: [95, 3, 10],
      //   scale: [0.05,0.05,0.05]
      // }, {
      //   id: 21,
      //   type: 'songshu',
      //   pos: [55, 3, 11],
      //   scale: [0.05,0.05,0.05]
      // }, {
      //   id: 22,
      //   type: 'songshu',
      //   pos: [15, 3, 13],
      //   scale: [0.05,0.05,0.05]
      // }, {
      //   id: 23,
      //   type: 'songshu',
      //   pos: [-35, 3, 15],
      //   scale: [0.05,0.05,0.05]
      // }, 
      {
        id: 24,
        type: 'songshu',
        pos: [-75, 3, -155],
        scale: [0.05, 0.05, 0.05]
      }, {
        id: 25,
        type: 'songshu',
        pos: [-75, 3, -55],
        scale: [0.05, 0.05, 0.05]
      }, {
        id: 26,
        type: 'songshu',
        pos: [-75, 3, 55],
        scale: [0.05, 0.05, 0.05]
      }, {
        id: 26,
        type: 'songshu',
        pos: [-75, 3, 195],
        scale: [0.05, 0.05, 0.05]
      }, {
        id: 27,
        type: 'songshu',
        pos: [-135, 3, -155],
        scale: [0.05, 0.05, 0.05]
      }, {
        id: 28,
        type: 'songshu',
        pos: [-135, 3, -55],
        scale: [0.05, 0.05, 0.05]
      }, {
        id: 29,
        type: 'songshu',
        pos: [-135, 3, 55],
        scale: [0.05, 0.05, 0.05]
      }, {
        id: 31,
        type: 'songshu',
        pos: [-135, 3, 195],
        scale: [0.05, 0.05, 0.05]
      }],
      homeForm: {
        name: '',
        sizeX: '',
        sizeY: '',
        sizeZ: '',
        posX: '',
        posY: '',
        posZ: '',
        faceQ: '',
        faceH: '',
        faceZ: '',
        faceY: '',
        faceS: '',
        faceX: '',
        repeatX: '',
        repeatY: '',
        rotateX: '',
        rotateY: '',
        rotateZ: '',
      },
    }
  },
  mounted() {
    this.width = this.$refs.box.getBoundingClientRect().width;
    this.height = this.$refs.box.getBoundingClientRect().height;
    this.renderer = t.initRenderer(this.$refs.box);
    this.scene = t.initScene();
    //设置场景对象Scene的雾化属性.fog来模拟生活中雾化效果
    // this.scene.fog = new t.default.Fog(0xcccccc, 1, 1000);
    this.camera = t.initCamera({type: 'perspective', data: [45, this.width / this.height, 0.01, 100000]}, {pos: [-240, 120, 350], lookAt: [0,0,0]});
    this.light = t.initLight('ambient', [0xffffff], [0,0,300], this.scene);
    this.pointLight = t.initLight('point',[{color: 0xffffff,intensity: 0.2 }], [500,600,400], this.scene)
    this.helper = t.initHelper();
    this.water = t.initWater([55, 365], [-105, 2, -40], [-Math.PI / 2, 0, 0], this.pointLight, this.scene);
    this.water2 = t.initWater([55, 50], [-105, 2, 200], [-Math.PI / 2, 0, 0], this.pointLight, this.scene);
    t.initSkyBox(this.scene);
    // t.createCube([800, 1, 451], ['', '', '/map.jpg', '', '', ''], [0,-1,0], [0,0,0], [1,1], this.scene);
    t.createCube([800, 1, 451], ['', '', '', '', '', ''], [0,-1,0], [0,0,0], [1,1], this.scene);
    t.createCube([800, 1, 34], ['', '', '', '', '', ''], [0,0,158], [0,0,0], [1,1], this.scene,false, true);
    t.createCube([34, 1, 451], ['', '', '', '', '', ''], [-200,0,0], [0,0,0], [1,1], this.scene,false, true);
    this.cubeData.forEach(item => {
      item.cur = t.createCube(item.size, item.face, item.pos, item.rotate, item.repeat, this.scene, this.isShowImg);
    });
    this.treeData.forEach(item => {
      t.createTree(item.type, item.pos, item.scale, this.scene);
    });
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
      this.water.material.uniforms[ 'time' ].value += 1.0 / 60.0;
      this.water2.material.uniforms[ 'time' ].value += 1.0 / 60.0;
      this.renderer.render(this.scene, this.camera);
    }));
    // t.animation(() => {
    //   this.renderer.render(this.scene, this.camera);
    // })
    document.addEventListener('keydown', this.enterEvent);
  },
  beforeDestroy() {
    document.removeEventListener('keydown', this.enterEvent);
  },
  methods: {
    // enter按键
    enterEvent(e) {
      if (e.keyCode === 13 && this.operateState !== 'show') {
        console.log(9999)
        this.submitForm();
      }
    },
    // 控制贴图
    changeImg() {
      this.isShowImg = !this.isShowImg;
      this.cubeData.forEach(item => {
        this.scene.remove(item.cur);
        item.cur = t.createCube(item.size, item.face, item.pos, item.rotate, item.repeat, this.scene, this.isShowImg);
      });
    },
    // 打开坐标系
    openHelper() {
      this.isShowHelper = !this.isShowHelper;
      if (this.isShowHelper) {
        this.scene.add(this.helper[0]);
        this.scene.add(this.helper[1]);
      } else {
        this.scene.remove(this.helper[0]);
        this.scene.remove(this.helper[1]);
      }
    },
    // 限制输入数字
    limitNum(name,e) {
      let val = e.target.value.replace(/[^\d|^.^-]/g,'');
      e.target.value = val;
      this.$set(this.homeForm, name, val);
    },
    // 控制侧边栏显隐
    changeShowSide() {
      this.showSide = !this.showSide;
    },
    // 贴图列表左滑
    changeLeft() {
      this.picListMove -= 1;
      if (this.picListMove < 0) {
        this.picListMove = 0;
        return;
      }
      this.$refs.picList.style.left = -this.picListMove * 10 + 'vw';
    },
    // 贴图列表右滑
    changeRight() {
      this.picListMove += 1;
      if (this.picListMove > this.picList.length - 3) {
        this.picListMove = this.picList.length - 3;
        return;
      }
      this.$refs.picList.style.left = -this.picListMove * 10 + 'vw';
    },
    // 贴图列表2左滑
    changeLeft2() {
      this.picListMove2 -= 1;
      if (this.picListMove2 < 0) {
        this.picListMove2 = 0;
        return;
      }
      this.$refs.picList2.style.left = -this.picListMove2 * 10 + 'vw';
    },
    // 贴图列表2右滑
    changeRight2() {
      this.picListMove2 += 1;
      if (this.picListMove2 > this.picList.length - 3) {
        this.picListMove2 = this.picList.length - 3;
        return;
      }
      this.$refs.picList2.style.left = -this.picListMove2 * 10 + 'vw';
    },
    // 控制房屋显隐
    changeShowState(item) {
      item.show = !item.show
      // console.log(this.cubeData[2].show)
      if (item.show) {
        this.scene.add(item.cur);
      } else {
        this.scene.remove(item.cur);
      }
    },
    // 修改房屋数据
    configHomeData(item) {
      this.changeOperateState('config');
      this.needConfig = item;
      let {name,size,pos,face,repeat, rotate} = item;
      this.homeForm = {
        name: name,
        sizeX: size[0],
        sizeY: size[1],
        sizeZ: size[2],
        posX: pos[0],
        posY: pos[1],
        posZ: pos[2],
        faceQ: face[0],
        faceH: face[1],
        faceZ: face[4],
        faceY: face[5],
        faceS: face[2],
        faceX: face[3],
        repeatX: repeat[0],
        repeatY: repeat[1],
        rotateX: rotate[0],
        rotateY: rotate[1],
        rotateZ: rotate[2],
      }
      console.log(item)
    },
    // 删除房屋
    deleteCube(item) {
      this.scene.remove(item.cur);
      this.cubeData.splice(this.cubeData.indexOf(item), 1)
    },
    // 添加房屋
    changeOperateState(item) {
      this.operateState = item;
    },
    // 返回展示侧边栏
    returnBtnEvent() {
      this.homeForm = {
        name: '',
        sizeX: '',
        sizeY: '',
        sizeZ: '',
        posX: '',
        posY: '',
        posZ: '',
        faceQ: '',
        faceH: '',
        faceZ: '',
        faceY: '',
        faceS: '',
        faceX: '',
        repeatX: '',
        repeatY: '',
        rotateX: '',
        rotateY: '',
        rotateZ: '',
      }
      this.changeOperateState("show");
      this.needConfig = '';
    },
    submitForm() {
      let {name, sizeX, sizeY, sizeZ, posX, posY, posZ, faceQ, faceH, faceZ, faceY, faceS, faceX, rotateX, rotateY, rotateZ, repeatX, repeatY} = this.homeForm;
      !sizeX && (sizeX = 50);
      !sizeY && (sizeY = 60);
      !sizeZ && (sizeZ = 30);
      !posX && (posX = -80);
      !posY && (posY = 30);
      !posZ && (posZ = -30);
      !rotateX && (rotateX = 0);
      !rotateY && (rotateY = 0);
      !rotateZ && (rotateZ = 0);
      !repeatX && (repeatX = 1);
      !repeatY && (repeatY = 1);
      if (isNaN(sizeX) || isNaN(sizeY) || isNaN(sizeZ)) {
        this.$message.error('房屋大小数字格式错误，请重新填写!');
        return;
      }
      if (isNaN(posX) || isNaN(posY) || isNaN(posZ)) {
        this.$message.error('房屋位置数字格式错误，请重新填写!');
        return;
      }
      if (isNaN(repeatX) || isNaN(repeatY)) {
        this.$message.error('贴图repeat数字格式错误，请重新填写!');
        return;
      }
      if (isNaN(rotateX) || isNaN(rotateY) || isNaN(rotateZ)) {
        this.$message.error('房屋旋转数字格式错误，请重新填写!');
        return;
      }
      let _size = [+sizeX, +sizeY, +sizeZ];
      let _pos = [+posX, +posY, +posZ];
      let _face = [faceQ, faceH, faceS, faceX, faceZ, faceY];
      let _rotate = [+rotateX, +rotateY, +rotateZ];
      let _repeat = [+repeatX, +repeatY];
      if (this.operateState === 'create') {
        !name && (name = '#' + this.cubeData.length);
        let temp = {
          id: this.cubeData.length,
          name,
          size: _size,
          pos: _pos,
          face: _face,
          rotate: _rotate,
          repeat: _repeat,
          show: true,
          cur: null
        }
        temp.cur = t.createCube(temp.size, temp.face, temp.pos, temp.rotate, temp.repeat, this.scene);
        this.cubeData.push(temp);
        this.returnBtnEvent();
      } else if (this.operateState === 'config') {
        !name && (name = this.needConfig.name);
        let temp = {
          id: this.needConfig.id,
          name,
          size: _size,
          pos: _pos,
          face: _face,
          rotate: _rotate,
          repeat: _repeat,
          show: this.needConfig.show,
          cur: this.needConfig.cur
        }
        this.scene.remove(this.needConfig.cur);
        temp.cur = t.createCube(temp.size, temp.face, temp.pos, temp.rotate, temp.repeat, this.scene);
        this.$set(this.cubeData, this.needConfig.id, temp);
        this.needConfig = temp;
      }
    },
    resetForm() {
      this.homeForm = {
        name: '',
        sizeX: '',
        sizeY: '',
        sizeZ: '',
        posX: '',
        posY: '',
        posZ: '',
        faceQ: '',
        faceH: '',
        faceZ: '',
        faceY: '',
        faceS: '',
        faceX: '',
        repeatX: '',
        repeatY: '',
        rotateX: '',
        rotateY: '',
        rotateZ: '',
      }
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
      height: 8vh;
      text-align: center;
      line-height: 8vh;
      font-size: 3vh;
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
        font-size: 2.5vh;
        font-weight: bold;
        padding-left: 1vh;
        margin-bottom: 1vh;
        color: blue;
      }
      .table-title-sub {
        width: 100%;
        height: 2vh;
        font-size: 1.5vh;
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
        font-size: 2.5vh;
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
    .operate-data {
      width: 100%;
      height: 100%;
      position: absolute;
      left: 30vw;
      top: 0;
      background-color: #fff;
      z-index: 777;
      transition: all .3s ease 0s;
      &.operate-data-show {
        left: 0;
      }
      .returnBtn {
        width: 5vh;
        height: 5vh;
        margin-bottom: 3vh;
        box-sizing: border-box;
        padding-top: 1vh;
        padding-left: 1vh;
        display: flex;
        justify-content: center;
        align-content: center;
        cursor: pointer;
      }
      .demo-homeForm {
        width: 25vw;
        padding-right: 1.5vw;
        margin-left: 1.75vw;
        border: 1px solid #ccc;
        padding-top: 4vh;
        position: relative;
        margin-bottom: 2vh;
        .homeForm-title {
          width: 7vw;
          height: 5vh;
          font-size: 2.5vh;
          text-align: center;
          line-height: 5vh;
          background-color: #fff;
          position: absolute;
          left: 50%;
          top: -2.5vh;
          transform: translateX(-50%);
        }
      }
    }
  }
}
.flexRow {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}
.el-form-item {
  margin-bottom: 1vh !important;
}
</style>
