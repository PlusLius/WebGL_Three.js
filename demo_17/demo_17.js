//TODO:鼠标框选
var renderer, camera, scene, gui, stats, ambientLight, directionalLight, control;

function initRender() {
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    //告诉渲染器需要阴影效果
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; // 默认的是，没有设置的这个清晰 THREE.PCFShadowMap
    document.body.appendChild(renderer.domElement);
}

function initCamera() {
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 100, 200);
    camera.lookAt(new THREE.Vector3(0, 0, 0));
}

function initScene() {
    scene = new THREE.Scene();
}

function initGui() {
    //声明一个保存需求修改的相关数据的对象
    gui = {
        createScene: function () {
            //首先先删除掉当前场景所含有的立方体
            deleteGroup("group");
            //创建一个新的模型组
            let group = new THREE.Group();
            group.name = "group";
            let geometry = new THREE.BoxGeometry(10, 10, 10);
            for (let i = 0; i < 300; i++) {
                let material = new THREE.MeshLambertMaterial({ color: randomColor() });
                let mesh = new THREE.Mesh(geometry, material);
                //随机位置
                mesh.position.set(THREE.Math.randFloatSpread(200), THREE.Math.randFloatSpread(200), THREE.Math.randFloatSpread(200));
                group.add(mesh);
            }
            scene.add(group);
        },
        exporterScene: function () {
            //首先将场景转成json对象
            let group = scene.getObjectByName("group");
            if (!group) return;
            let obj = group.toJSON();
            //将json对象转成json字符串并存储
            download("file.json", JSON.stringify(obj));
        },
        importerScene: function () {
            //创建一个input来获取json数据
            let input = document.createElement("input");
            input.type = "file";
            input.addEventListener("change", function () {
                let file = input.files[0];
                //判断是否是json格式的文件
                if (file.type.indexOf("json") >= 0) {
                    //首先先删除掉当前场景所含有的立方体
                    deleteGroup("group");

                    //读取文件内的内容
                    let reader = new FileReader();
                    reader.readAsText(file);
                    reader.onloadend = function () {
                        //使用three.js的JSONLoader将模型导入到场景
                        let loader = new THREE.ObjectLoader();
                        let group = loader.parse(JSON.parse(this.result));
                        scene.add(group);
                    }
                }
            });
            input.click();
        },
        loaderScene: function () {
            //首先先删除掉当前场景所含有的立方体
            deleteGroup("group");

            //使用JSONLoader加载json格式文件
            let loader = new THREE.ObjectLoader();

            loader.load("../js/models/json/file.json", function (group) {
                console.log(group);
                scene.add(group);
            });
        }
    };

    //var datGui = new dat.GUI();
    //将设置属性添加到gui当中，gui.add(对象，属性，最小值，最大值）
    /*datGui.add(gui, "createScene").name("添加模型");
    datGui.add(gui, "exporterScene").name("导出模型");
    datGui.add(gui, "importerScene").name("导入模型");
    datGui.add(gui, "loaderScene").name("加载模型");*/

    gui.createScene();
}

//随机颜色
function randomColor() {
    var arrHex = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f"],
        strHex = "#",
        index;

    for (var i = 0; i < 6; i++) {
        index = Math.round(Math.random() * 15);
        strHex += arrHex[index];
    }

    return strHex;
}

//保存文件
function download(filename, text) {
    var pom = document.createElement('a');
    pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    pom.setAttribute('download', filename);
    if (document.createEvent) {
        var event = document.createEvent('MouseEvents');
        event.initEvent('click', true, true);
        pom.dispatchEvent(event);
    } else {
        pom.click();
    }
}

//删除group
function deleteGroup(name) {
    let group = scene.getObjectByName(name);
    if (!group) return;
    //删除掉所有的模型组内的mesh
    group.traverse(function (item) {
        if (item instanceof THREE.Mesh) {
            item.geometry.dispose(); //删除几何体
            item.material.dispose(); //删除材质
        }
    });

    scene.remove(group);
}

function initLight() {
    ambientLight = new THREE.AmbientLight("#111111");
    scene.add(ambientLight);

    directionalLight = new THREE.DirectionalLight("#ffffff");
    directionalLight.position.set(40, 60, 10);

    directionalLight.shadow.camera.near = 1; //产生阴影的最近距离
    directionalLight.shadow.camera.far = 400; //产生阴影的最远距离
    directionalLight.shadow.camera.left = -50; //产生阴影距离位置的最左边位置
    directionalLight.shadow.camera.right = 50; //最右边
    directionalLight.shadow.camera.top = 50; //最上边
    directionalLight.shadow.camera.bottom = -50; //最下面

    //这两个值决定生成阴影密度 默认512
    directionalLight.shadow.mapSize.height = 1024;
    directionalLight.shadow.mapSize.width = 1024;

    //告诉平行光需要开启阴影投射
    directionalLight.castShadow = true;

    scene.add(directionalLight);
}

function initStats() {
    stats = new Stats();
    document.body.appendChild(stats.dom);
}

function initControl() {
    control = new THREE.OrbitControls(camera, renderer.domElement);
    control.enabled = false;
}

function render() {

    control.update();

    renderer.render(scene, camera);
}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);

}

function animate() {
    //更新控制器
    render();

    //更新性能插件
    stats.update();

    requestAnimationFrame(animate);
}

function addTouch() {

    //获取显示区域一半的大小
    var half = {};

    //获取一下当前的dom的距离左上角的偏移量
    var domClient = {};

    //鼠标按下距离左上角的距离
    var down = {};
    var move = {};

    var max = {};
    var min = {};

    var modelsList = [];

    var group;

    var material = new THREE.MeshPhongMaterial({ color: 0xffffff });

    //声明一个显示的拖拽框的div
    var div = document.createElement("div");
    div.style.cssText = "position:fixed; box-sizing:border-box; border:1px solid #ccc;";

    renderer.domElement.addEventListener("mousedown", function (e) {
        if (e.button !== 0) {
            return;
        }

        group = scene.getObjectByName("group");

        half.height = renderer.domElement.offsetHeight / 2;
        half.width = renderer.domElement.offsetWidth / 2;

        domClient.x = renderer.domElement.getBoundingClientRect().left;
        domClient.y = renderer.domElement.getBoundingClientRect().top;

        down.x = e.clientX - domClient.x;
        down.y = e.clientY - domClient.y;

        for (let i = 0; i < group.children.length; i++) {
            let box = new THREE.Box3();
            box.expandByObject(group.children[i]);

            //获取到平面的坐标
            let vec3 = new THREE.Vector3();
            box.getCenter(vec3);
            let vec = vec3.project(camera);

            modelsList.push(
                {
                    component: group.children[i],
                    position: {
                        x: vec.x * half.width + half.width,
                        y: -vec.y * half.height + half.height
                    },
                    normalMaterial: group.children[i].material
                }
            )
        }

        //重置样式
        div.style.left = 0;
        div.style.top = 0;
        div.style.width = 0;
        div.style.height = 0;
        document.body.appendChild(div);

        //绑定鼠标按下移动事件和抬起事件
        document.addEventListener("mousemove", movefun, false);
        document.addEventListener("mouseup", upfun, false);

    }, false);

    function movefun(e) {

        move.x = e.clientX - domClient.x;
        move.y = e.clientY - domClient.y;

        //计算出来大小来设置拖拽框
        min.x = Math.min(move.x, down.x);
        min.y = Math.min(move.y, down.y);
        max.x = Math.max(move.x, down.x);
        max.y = Math.max(move.y, down.y);

        //设置div框
        div.style.left = min.x + "px";
        div.style.top = min.y + "px";
        div.style.width = max.x - min.x + "px";
        div.style.height = max.y - min.y + "px";

        //判断修改哪些构件
        for (let i = 0; i < modelsList.length; i++) {
            let position = modelsList[i].position;
            if (position.x > min.x && position.x < max.x && position.y > min.y && position.y < max.y) {
                modelsList[i].component.material = material;
            }
            else {
                modelsList[i].component.material = modelsList[i].normalMaterial;
            }
        }
    }

    function upfun(e) {

        //清除事件
        document.body.removeChild(div);
        document.removeEventListener("mousemove", movefun, false);
        document.removeEventListener("mouseup", upfun, false);

        //将所有的模型修改为当前默认的模型
        for (let i = 0; i < modelsList.length; i++) {
            modelsList[i].component.material = modelsList[i].normalMaterial;
        }
    }
}

function draw() {
    initRender();
    initScene();
    initCamera();
    initLight();
    initStats();
    initGui();

    initControl();

    addTouch();

    animate();
    window.onresize = onWindowResize;
}