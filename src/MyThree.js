import * as t from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { Water } from 'three/examples/jsm/objects/Water';

export default t;
/***
 * 初始化渲染器
 * @dom  元素       Object
 * @color 刷新颜色  ?Array
 */
export function initRenderer(dom, color) {
    let renderer, obj, width, height;
    obj = dom.getBoundingClientRect();
    width = obj.width;
    height = obj.height;
    renderer = new t.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    dom.appendChild(renderer.domElement);
    color && renderer.setClearColor(color[0], 1.0);
    !color && renderer.setClearColor(0xFFFFFF, 1.0);
    return renderer;
}

/***
 * 初始化场景
 */
export function initScene() {
    return new t.Scene();
}

/***
 * 初始化相机
 * @para 相机参数 Object {type[String]:orthographic/perspective, data[Array]: []}
 * @data 相机位置等设置 ?Object {?pos[Array]: [x,y,z], ?up[Array]: [x,y,z], ?lookAt: [x,y,z]}
 */
export function initCamera(para, data) {
    let camera;
    camera = para.type === 'orthographic' ? new t.OrthographicCamera(...para.data) : new t.PerspectiveCamera(...para.data);
    let _data = data || {};
    camera.position.x = _data.pos ? data.pos[0] : 0;
    camera.position.y = _data.pos ? data.pos[1] : 0;
    camera.position.z = _data.pos ? data.pos[2] : 300;
    camera.up.x = _data.up ? _data.up[0] : 0;
    camera.up.y = _data.up ? _data.up[1] : 1;
    camera.up.z = _data.up ? _data.up[2] : 0;
    _data.lookAt && camera.lookAt({ x: _data.lookAt[0], y: _data.lookAt[1], z: _data.lookAt[2] });
    return camera;
}

/***
 * 初始化光源
 * @type 光源类型 ?String
 * @para 光源参数 ?Array
 * @pos  光源位置 ?Array
 * @scene 场景  
 */
export function initLight(type, para, pos, scene) {
    let light;
    switch (type) {
        case 'point':
            light = new t.PointLight(...para);
            break;
        case 'ambient':
        default:
            light = new t.AmbientLight(...para);
    }
    pos && light.position.set(...pos);
    !pos && light.position.set(0, 0, 200);
    scene && scene.add(light);
    return light;
}

/***
 * 初始化一个立方体
 * @geo 立方体属性 Array
 * @mar 材质属性   Array
 */
export function initCube(geo, mat, scene) {
    let geometry = new t.CubeGeometry(...geo);
    console.log(777777777, geometry.faceVertexUvs[0])
    let material = new t.MeshLambertMaterial(mat);
    // let uv = [new t.Vector2(0,0),new t.Vector2(1,0),new t.Vector2(1,1),new t.Vector2(0,1)];
    let new_material = new t.MeshPhongMaterial({ map: t.ImageUtils.loadTexture('/juminlou.jpg') });
    let materials = [new_material, new_material, material, material, new_material, new_material];
    let mesh = new t.Mesh(geometry, materials);
    scene && scene.add(mesh);
    return mesh;
}

/***
 * 生成一个立方体
 * @geo  立方体属性 Array            [10,10,10]
 * @face 面贴图     Array            ['/face.jpg' 前, '' 后, '/face.jpg' 上, '' 下,'/face.jpg' 左, '' 右]     坐标系x轴正方向为前
 * @pos  立方体位置 Array            [10,10,10] 立方体的位置是立方体中心的位置
 * @rotate 缩放     Array
 * @repeat 贴图重复 Array
 * @scene 场景
 */
export function createCube(geo, face, pos, rotate, repeat, scene) {
    let geometry = new t.CubeGeometry(1, 1, 1);
    let texture;
    let material = face.map(item => {
        if (item) {
            texture = new t.TextureLoader().load(item);
            texture.wrapS = t.RepeatWrapping;
            texture.wrapT = t.RepeatWrapping;
            texture.repeat.set(...repeat);
            return new t.MeshPhongMaterial({ map: texture });
        } else {
            return new t.MeshLambertMaterial({ color: 0x959595 });
        }
    });
    let mesh = new t.Mesh(geometry, material);
    mesh.scale.set(...geo)
    pos && mesh.position.set(...pos);
    !pos && mesh.position.set(geo[0] / 2, geo[1] / 2, geo[2] / 2);
    mesh.rotation.set(...rotate)
    scene && scene.add(mesh);
    return mesh;
}

/***
 * 初始化一个球体
 * @geo 球体属性 Array
 * @mat 材质属性 Array
 * @scene  场景
 */
export function initSphere(geo, mat, scene) {
    let geometry = new t.SphereGeometry(...geo);
    let material = new t.MeshBasicMaterial(mat);
    let mesh = new t.Mesh(geometry, material);
    scene && scene.add(mesh);
    return mesh;
}

/***
 * 渲染动画
 * @fn 渲染函数
 */
export function animation(fn) {
    fn();
    requestAnimationFrame(animation.bind(null, fn));
}

/***
 * 初始化坐标系
 * @scene 场景
 */
export function initHelper() {
    let axis = new t.AxesHelper(300);
    let grid = new t.GridHelper(400, 20, 0xFF00FF, 0x00FF00);
    return [axis, grid];
}

/***
 * 初始化天空盒
 * @scene 场景
 */
export function initSkyBox(scene) {
    scene.background = new t.CubeTextureLoader().load(['/px.jpg', '/nx.jpg', '/py.jpg', '/ny.jpg', '/pz.jpg', '/nz.jpg']);
}

/***
 * 初始化Water
 * @size  大小     [1000,1000]
 * @scene 场景
 * @light 灯光
 */
export function initWater(size, pos, rotate, light, scene) {
    let waterGeometry = new t.PlaneBufferGeometry(...size);
    let water = new Water(
        waterGeometry, {

            waterNormals: new t.TextureLoader().load('/water.jpg', function(texture) {

                texture.wrapS = texture.wrapT = t.RepeatWrapping;

            }),
            alpha: 1.0,
            sunDirection: light.position.clone().normalize(),
            sunColor: 0xffffff,
            waterColor: 0x5599FF,
            distortionScale: 5.7,
            flowDirection: new t.Vector2(-60, 0),
            textureWidth: 2048,
            textureHeight: 2048
        }
    );
    water.position.set(...pos);
    water.rotation.set(...rotate);
    scene.add(water);

    return water;
}
/***
 * 初始化控制器
 * @camera 相机
 * @r 渲染器
 * @render 渲染函数
 */
export function initControler(camera, renderer, render) {
    let controls = new OrbitControls(camera, renderer.domElement);
    render && controls.addEventListener('change', render);
}

/***
 * 加载模型
 */
export function loadModel(type, url, pos, scale, scene, fn) {
    let loader, model;
    // let color = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0x00ffff, 0xff00ff, 0x950023];
    console.log(99999, type, url, pos, scale)
    switch (type) {
        case 'gltf':
        default:
            loader = new GLTFLoader();
            loader.load(url, function(gltf) {
                model = gltf.scene;
                // let i = 0;
                gltf.scene.traverse(child => {
                    if (child instanceof t.Mesh && child.material instanceof t.Material) {
                        let new_material = child.material.clone();
                        new_material.side = t.DoubleSide;
                        child.material = new_material;
                        // child.material.color = new t.Color(0x002500);
                        // child.material.color = new t.Color(color[i]);
                        // i++;
                    }
                });
                // gltf.scene.traverse(child => {
                //     if (child instanceof t.Mesh && child.material instanceof t.Material) {
                //         console.log(333333333, child)
                //         let new_material = child.material.clone();
                //         // let new_material = new t.MeshPhongMaterial({
                //         //     map: t.ImageUtils.loadTexture('/lou.jpg')
                //         // });
                //         new_material.side = t.DoubleSide;
                //         child.material = new_material;
                //         child.material.color = new t.Color(0x959595);
                //         child.material.color = new t.Color(color[i]);
                //         if (i === 6) {
                //             new_material = new t.MeshPhongMaterial({
                //                 map: t.ImageUtils.loadTexture('/nv.jpg')
                //             });
                //             new_material.side = t.DoubleSide;
                //             child.material = new_material;
                //         }
                //         i++;
                //     }
                // });

                model.scale.set(...scale);
                model.position.set(...pos);
                scene.add(model);
                fn && fn(model);
            }, undefined, function(e) {
                console.error(e);
            });
    }
}

/***
 * 加载模型
 */

export function createTree(type, pos, scale, scene) {
    loadModel('gltf', `/${type}/scene.gltf`, pos, scale, scene);
}
/***
 * 点击事件
 */
export function initClick(camera, scene, width, height, left, top) {
    let e = window.event;
    let raycaster = new t.Raycaster();
    let mouse = new t.Vector2();
    //通过鼠标点击的位置计算出raycaster所需要的点的位置，以屏幕中心为原点，值的范围为-1到1.
    mouse.x = (e.clientX - left / width) * 2 - 1;
    mouse.y = -(e.clientY - top / height) * 2 + 1;

    // 通过鼠标点的位置和当前相机的矩阵计算出raycaster
    raycaster.setFromCamera(mouse, camera);
    console.log(camera, scene)

    // 获取raycaster直线和所有模型相交的数组集合
    var intersects = raycaster.intersectObjects(scene.children);

    console.log(intersects);

    //将所有的相交的模型的颜色设置为红色，如果只需要将第一个触发事件，那就数组的第一个模型改变颜色即可
    for (var i = 0; i < intersects.length; i++) {

        intersects[i].object.material.color.set(0xff00ff);

    }
}