<template>
  <div id="main">
    <div id="extraContent">
      <dv-loading v-if="false">Loading...</dv-loading>
      <div class="topTitleBox">
        <div class="dateTimeBox">
          <div class="dateTimeBox-after"></div>
          <span class="dateText">
            <dv-decoration-7 style="height: 30px"
              >{{ dateYear }} {{ dateWeek }} {{ dateDay }}</dv-decoration-7
            >
            <el-button
              type="primary"
              style="right: -80%; top: -2.5em; position: relative"
              @click="login"
              >了解详情</el-button
            >
          </span>
        </div>
        <dv-decoration-10
          style="width: 33.33%; height: 10px; margin-top: 20px"
        />
        <div class="leftDecorate">
          <!-- <div class="btn-animate btn-animate__sweep-up" @click="go_one">
            大屏1
          </div> -->
          <div class="btn-animate btn-animate__sweep-up" @click="go_two">
            治理前后对比
          </div>
          <div class="btn-animate btn-animate__sweep-up" @click="go_three" style="left:1em;position:relative">
            项目实施进程
          </div>
        </div>
        <dv-decoration-8
          :color="['#568aea', '#000000']"
          style="width: 10%; height: 50px; margin-top: 25px"
        />
        <div class="title">
          <dv-decoration-5
            :dur="2"
            :color="['#568aea', '#568aea']"
            style="width: 100%; height: 30px"
          />
          <span style="text-align: center"
            >世界银行贷款湖南株洲清水塘区域重金属污染环境治理工程</span
          >

          <!-- <span>金属污染环境治理工程</span> -->
          <dv-decoration-6
            class="title-bototm"
            :reverse="true"
            :color="['#50e3c2', '#67a1e5']"
            style="width: 250px; height: 10px"
          />
        </div>
        <dv-decoration-8
          :reverse="true"
          :color="['#568aea', '#000000']"
          style="width: 10%; height: 50px; margin-top: 20px"
        />
        <dv-decoration-10
          style="
            width: 33.33%;
            height: 10px;
            margin-top: 15px;
            transform: rotateY(180deg);
          "
        />
      </div>
      <div class="content">
        <div class="contentTopBox">
          <div>
            <dv-border-box-8 style="width: 95%">
              <div class="map1" id="map1">
                <div class="legend1"></div>
              </div>
              <h5>可研范围</h5>
            </dv-border-box-8>
          </div>
          <div>
            <dv-border-box-12
              style="width: 105%; position: relative; left: -5%"
            >
              <div class="map2" id="map2">
              
              </div>
              <h5>新旧规划图</h5>
            </dv-border-box-12>
          </div>
          <div>
            <dv-border-box-1 class="flex-vertical">
              <div class="map3" id="map3"></div>
              <h5>旧遥感影像</h5>
            </dv-border-box-1>
          </div>
        </div>
        <div class="contentBottomBox">
          <div>
            <dv-border-box-8 class="bottomBox1" style="width: 95%">
              <div class="map4" id="map4">
                <div class="legend2"></div>
              </div>
              <h5>治理范围</h5>
            </dv-border-box-8>
          </div>
          <div>
            <dv-border-box-12
              style="width: 105%; position: relative; left: -5%"
            >
              <div
                class="map5"
                id="map5"
                :style="{ backgroundImage: 'url(' + url + ')' }"
              >
                <!-- <el-image
                  style="width: 100%; height: 100%"
                  :src="url"
                  fit="contain"
                ></el-image> -->
                <!-- <img :src="url" alt="Paris"> -->
              </div>

              <h5>重金属含量超限比</h5>
            </dv-border-box-12>
          </div>
          <div>
            <dv-border-box-1>
              <div class="map6" id="map6"></div>
              <h5>新遥感影像</h5>
            </dv-border-box-1>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Tool from "./mapapi";
import axios from "axios";
let docx = require("docx-preview");
import { Map, View, Feature } from "ol";
import { fromLonLat, toLonLat, transform } from "ol/proj";
import popup from "./zujian/popup.vue";

import { controls } from "./service/controls";
import { OSM, XYZ } from "ol/source";
import { Tile as TileLayer, Vector as VectorLayer } from "ol/layer";
import map_legend from "./zujian/popup_inner/legend.vue";

export default {
  name: "Home",
  components: {
    popup,
    map_legend,
  },
  data() {
    return {
      dateDay: null, //时间
      dateYear: null,
      dateWeek: null,
      weekday: ["周日", "周一", "周二", "周三", "周四", "周五", "周六"],
      map1: null,
      map2: null,
      map3: null,
      map4: null,
      map5: null,
      map6: null,
      map_type: 1,
      url: "../../static/images/验收阶段镉含量超限比.png",
      bg: { backgroundImage: "url(" + this.url + ")" },
    };
  },
  created() {},
  mounted() {
    this.timeFn();
    this.begin_map();
  },
  methods: {
    timeFn() {
      //获取时间
      setInterval(() => {
        this.dateDay = this.formatTimes(new Date(), "HH: mm: ss");
        this.dateYear = this.formatTimes(new Date(), "yyyy-MM-dd");
        this.dateWeek = this.weekday[new Date().getDay()];
      }, 1000);
    },
    formatTimes(time, fmt) {
      if (!time) return "";
      else {
        const date = new Date(time);
        this.map_type = (parseInt(date.getSeconds() / 3) % 6) + 1;

        const o = {
          "M+": date.getMonth() + 1,
          "d+": date.getDate(),
          "H+": date.getHours(),
          "m+": date.getMinutes(),
          "s+": date.getSeconds(),
          "q+": Math.floor((date.getMonth() + 3) / 3),
          S: date.getMilliseconds(),
        };
        if (/(y+)/.test(fmt))
          fmt = fmt.replace(
            RegExp.$1,
            (date.getFullYear() + "").substr(4 - RegExp.$1.length)
          );
        for (const k in o) {
          if (new RegExp("(" + k + ")").test(fmt)) {
            fmt = fmt.replace(
              RegExp.$1,
              RegExp.$1.length === 1
                ? o[k]
                : ("00" + o[k]).substr(("" + o[k]).length)
            );
          }
        }
        return fmt;
      }
    },
    begin_map() {
      let view = new View({
        // center: getCenter(viewExtent),
        // center: [12585892, 3280000],
        center: fromLonLat([113.08, 27.8728]),

        // center:[113,30],
        zoom: 13,
        maxZoom: 18,
        minZoom: 13,
        // projection:'EPSG:4326'
        // minZoom: 10,
      });
      let drawlayer = new VectorLayer({
        title: "标绘",
        visible: true,
        layercode: 999,
      });
      this.map1 = new Map({
        //挂载元素
        target: "map1",
        //显示的地图
        layers: [drawlayer],
        //表层图层
        overlays: [],
        //在此设置地图控件
        controls: [],
        //开启交互时加载瓦片
        loadTilesWhileInteracting: true,
        //地图显示中心
        view: view,
      });
      // this.map1.addControl(controls.switcher);
      this.map2 = new Map({
        //挂载元素
        target: "map2",
        //显示的地图
        layers: [drawlayer],
        //表层图层
        overlays: [],
        //在此设置地图控件
        controls: [],
        //开启交互时加载瓦片
        loadTilesWhileInteracting: true,
        //地图显示中心
        view: view,
      });
      this.map3 = new Map({
        //挂载元素
        target: "map3",
        //显示的地图
        layers: [drawlayer],
        //表层图层
        overlays: [],
        //在此设置地图控件
        controls: [],
        //开启交互时加载瓦片
        loadTilesWhileInteracting: true,
        //地图显示中心
        view: view,
      });
      // this.map1.addControl(controls.switcher);
      this.map4 = new Map({
        //挂载元素
        target: "map4",
        //显示的地图
        layers: [drawlayer],
        //表层图层
        overlays: [],
        //在此设置地图控件
        controls: [],
        //开启交互时加载瓦片
        loadTilesWhileInteracting: true,
        //地图显示中心
        view: view,
      });
      this.map4.addControl(controls.switcher);
      // this.map5 = new Map({
      //   //挂载元素
      //   target: "map5",
      //   //显示的地图
      //   layers: [drawlayer],
      //   //表层图层
      //   overlays: [],
      //   //在此设置地图控件
      //   controls: [],
      //   //开启交互时加载瓦片
      //   loadTilesWhileInteracting: true,
      //   //地图显示中心
      //   view: view,
      // });
      this.map6 = new Map({
        //挂载元素
        target: "map6",
        //显示的地图
        layers: [drawlayer],
        //表层图层
        overlays: [],
        //在此设置地图控件
        controls: [],
        //开启交互时加载瓦片
        loadTilesWhileInteracting: true,
        //地图显示中心
        view: view,
      });

      Tool.add_baselayers(this.map1);
      // Tool.add_baselayers(this.map2);
      // Tool.add_baselayers(this.map3);

      Tool.add_layers_by_ids_fids(this.map1, [2], [2, 72]).then((data) => {
        Tool.change_visible(2, this.map1, true);
        Tool.change_visible(72, this.map1, true);
        Tool.change_visible(59, this.map1, false);
        Tool.change_visible(64, this.map1, false);

        Tool.add_features_by_ids_fids(this.map1, [2], [2, 72]).then(
          (response) => {
            // Tool.no_feature_locker(this.map1, true);
          }
        );
      });

      Tool.add_baselayers(this.map2);
      // Tool.add_baselayers(this.map2);
      // Tool.add_baselayers(this.map3);

      Tool.add_layers_by_ids_fids(
        this.map2,
        [1],
        [1, 29, 99, 90, 91, 92, 93, 90, 91]
      ).then((data) => {
        Tool.change_visible(1, this.map2, true);
        Tool.change_visible(99, this.map2, true);
        Tool.change_visible(29, this.map2, false);
        Tool.change_visible(92, this.map2, true);
        Tool.change_visible(93, this.map2, true);

        Tool.add_features_by_ids_fids(
          this.map2,
          [1],
          [1, 29, 99, 92, 93, 90, 91]
        );
      });

      Tool.add_baselayers(this.map3);
      this.map3
        .getLayers()
        .getArray()[1]
        .getLayers()
        .getArray()[2]
        .setVisible(true);

      Tool.add_baselayers(this.map4);

      Tool.add_layers_by_ids_fids(this.map4, [2], [2, 59, 64]).then((data) => {
        Tool.change_visible(2, this.map4, true);
        Tool.change_visible(59, this.map4, true);
        Tool.change_visible(64, this.map4, true);
        Tool.add_features_by_ids_fids(this.map4, [2], [2, 59, 64]);
      });

      // Tool.add_baselayers(this.map5);

      // Tool.add_layers_by_ids_fids(
      //   this.map5,
      //   [900],
      //   [900, 901, 902, 903, 904]
      // ).then((data) => {
      //   Tool.change_visible(900, this.map5, true);
      //   Tool.change_visible(901, this.map5, true);
      //   Tool.change_visible(902, this.map5, false);
      //   Tool.change_visible(903, this.map5, false);
      //   Tool.change_visible(904, this.map5, false);
      //   Tool.new_add_home_points(this.map5);
      // });
      Tool.add_baselayers(this.map6);
      this.map6
        .getLayers()
        .getArray()[1]
        .getLayers()
        .getArray()[1]
        .setVisible(false);
    },
    login() {
      localStorage.setItem("access-user", JSON.stringify("success"));
      this.$router.push({ path: "/" });
    },
    go_one() {
      this.$router.push({ path: "/scream" });
    },
    go_two() {
      this.$router.push({ path: "/scream2" });
    },
    go_three() {
      this.$router.push({ path: "/scream3" });
    },
  },
  //     mounted: function () {
  //     // this.begin_map();
  //   },
  watch: {
    map_type(oldvalue, newvalue) {
      if (newvalue === 1) {
        Tool.change_visible(1, this.map2, true);
        Tool.change_visible(99, this.map2, true);
        Tool.change_visible(29, this.map2, false);
        Tool.change_visible(92, this.map2, true);
        Tool.change_visible(93, this.map2, true);
        Tool.change_visible(90, this.map2, false);
        Tool.change_visible(91, this.map2, false);

        this.url = "../../static/images/设计阶段镉含量（相对于限值）.png";
      } else if (newvalue === 2) {
        this.url = "../../static/images/设计阶段铅含量（相对于限值）.png";
      } else if (newvalue === 3) {
        this.url = "../../static/images/设计阶段砷含量（相对于限值）.png";
      } else if (newvalue === 4) {
        Tool.change_visible(1, this.map2, true);
        Tool.change_visible(99, this.map2, false);
        Tool.change_visible(29, this.map2, true);
        Tool.change_visible(92, this.map2, false);
        Tool.change_visible(93, this.map2, false);
        Tool.change_visible(90, this.map2, true);
        Tool.change_visible(91, this.map2, true);
        this.url = "../../static/images/验收阶段镉含量超限比.png";
      } else if (newvalue === 5) {
        this.url = "../../static/images/验收阶段铅含量超限比.png";
      } else if (newvalue === 6) {
        this.url = "../../static/images/验收阶段砷含量超限比.png";
      }
    },
  },
};
</script>

<style scoped lang="scss">
#main {
  width: 100%;
  height: 100vh;
  //   min-width: 1850px;
  background: url("../assets/images/影像图.jpg") no-repeat;
  background-size: 100% 100%;
  overflow: hidden;

  ::v-deep .loading-tip {
    font-size: 23px !important;
    color: aqua;
    font-weight: bold;
  }

  .topTitleBox {
    width: 100%;
    height: 80px;
    display: flex;
    position: relative;

    .leftDecorate {
      position: absolute;
      left: 7%;
      top: 32px;
    }

    .dateTimeBox {
      position: absolute;
      right: 7%;
      top: 27px;
      color: #06f1ef;
      font-size: 20px;
      background-color: rgb(15, 19, 37);
      width: 20.33%;
      height: 50px;
      text-align: center;
      line-height: 50px;
      cursor: pointer;
      -webkit-transform: skewX(-45deg);
      transform: skewX(-45deg);

      .dateText {
        display: inline-block;
        transform: skewX(45deg);
      }

      .dateTimeBox-after {
        position: absolute;
        right: -25px;
        top: 0;
        height: 50px;
        width: 50px;
        background-color: rgb(15, 19, 37);
        -webkit-transform: skewX(45deg);
        transform: skewX(45deg);
      }
    }

    .title {
      width: 500px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: center;
      font-size: 25px;
      color: white;
    }
  }

  .content {
    width: 100%;
    height: calc(100vh - 150px);
    //   height: 45%;
    padding-top: 20px;

    .contentTopBox {
      height: 50%;
      padding: 10px;
      display: grid;
      grid-template-columns: 6.5fr 6.5fr 6.5fr;

      ::v-deep.flex-vertical .border-box-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-around;
        padding: 10px;

        // .map1 {
        //   width: 92%;
        //   height: 49%;
        //   position: relative;
        // }
        div {
          width: 92%;
          height: 49%;
          background-color: rgba(19, 25, 47, 0.6);
        }

        div:first-child {
          border-top-left-radius: 10px;
          border-top-right-radius: 10px;
        }

        div:last-child {
          border-bottom-left-radius: 10px;
          border-bottom-right-radius: 10px;
        }
      }
    }

    .contentBottomBox {
      height: 50%;
      padding: 10px;
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;

      //   .bottomBox1,
      //   .bottomBox2 {
      //     padding: 10px;
      //     width: 100%;
      //     height: 100%;
      //   }
      //   .bottomBox1 {
      //       width: 95%;
      //     ::v-deep .border-box-content {
      //       display: grid;
      //       grid-template-columns: 5fr 3.5fr;
      //     }
      //   }
      .bottomBox2 {
        ::v-deep .border-box-content {
          display: grid;
          grid-template-columns: 3.5fr 5fr;
        }
      }
    }
  }
}
h5 {
  color: #ffffff;
  position: absolute;
  z-index: 2;
  bottom: 2%;
  text-align: center;
  left: 40%;
  margin: 0 auto;
  font-size: 120%;
}

.el-carousel__item:nth-child(n) {
  background-color: #99a9bf;
}

#extraContent {
  float: left;
  width: 100%;
  // width: 800px;
  // margin-left: -300px;
  height: 100%;
  background: rgba(15, 19, 37, $alpha: 0.9);
}

.map1 {
  width: 92%;
  height: 85%;
  top: 4%;
  left: 4%;
  position: absolute;
}
.legend1 {
  width: 50%;
  float: left;
  height: 10%;
  top: 0%;
  left: 25%;
  position: absolute;

  // background: #ff0;
  background-image: url("../assets/images/图例1.png");
  background-repeat: no-repeat;
  background-size: 100%;
  z-index: 2;
  // border: 1px dashed rgb(0, 0, 0);
}

.map2 {
  width: 92%;
  height: 85%;
  top: 4%;
  left: 4%;
  position: relative;
}

.map3 {
  width: 92%;
  height: 85%;
  top: 4%;
  left: 4%;
  position: relative;
}

.map4 {
  width: 92%;
  height: 85%;
  top: 4%;
  left: 4%;
  position: relative;
}

.legend2 {
  width: 60%;
  float: left;
  height: 15%;
  left: 20%;
  top: 0%;
  position: absolute;

  // background: #ff0;
  background-image: url("../assets/images/图例2.png");
  background-repeat: no-repeat;
  background-size: 100%;
  z-index: 2;
  // border: 1px dashed rgb(0, 0, 0);
}

img {
  max-width: 100%;
  height: 100%;
}

.map5 {
  width: 68%;
  height: 85%;
  top: 4%;
  // left: 4%;
  position: relative;
  margin: 0 auto;

  // background-image: url(url);
  background-repeat: no-repeat;
  background-size: contain;
  vertical-align: middle;
}

.map6 {
  width: 92%;
  height: 85%;
  top: 4%;
  left: 4%;
  position: relative;
}

.btn-animate {
  position: relative;
  width: 100px;
  height: 40px;
  line-height: 40px;
  border: none;
  border-radius: 5px;
  // background: #027efb;
  color: rgb(246, 226, 6);
  text-align: center;
  float: left;
}

/**
 * 原理简述：增加一个::after，宽度100%，高度0，绝对定位放在底部 - hover时设置高度为100%，top为0（从顶部进入，底部出）
 *
 */
.btn-animate__sweep-up {
  z-index: 1;

  &::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 0%;
    z-index: -1;
    border-radius: 5px;
    background-color: #90cf5b;
    transition: 0.3s ease;
  }

  &:hover {
    &::after {
      top: auto;
      bottom: 0;
      height: 100%;
    }
  }
}

.timeline-content {
  color: rgba(255, 255, 255, 1);
  font-size: 18px;
  margin-top: 4px;
  .timeline-content__idea {
    color: rgba(255, 255, 255, 1);
  }
}
</style>
