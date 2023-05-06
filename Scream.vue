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
              style="right: -80%;top:-2.5em; position: relative;"
              @click="login"
            >了解详情</el-button>
          </span>
        </div>

        <dv-decoration-10
          style="width: 33.33%; height: 10px; margin-top: 20px"
        />
        <div class="leftDecorate">
          <!-- <dv-decoration-3 style="width: 100%; height: 30px" /> -->
<!-- 
          <el-button type="text" @click="go_one">大屏1</el-button>
          <el-button type="text" @click="go_two">大屏2</el-button> -->
          <div class="btn-animate btn-animate__sweep-up" @click="go_one">
            大屏1
          </div>
          <div class="btn-animate btn-animate__sweep-up" @click="go_two">
            大屏2
          </div>
          <div class="btn-animate btn-animate__sweep-up" @click="go_three">
            大屏3
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
          /><span>世界银行贷款湖南株洲清水塘区域重</span>
          <span>金属污染环境治理工程</span>
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
            <dv-border-box-1 class="flex-vertical">
              <!-- 左上角两个charts -->
              <div></div>
              <div></div>
            </dv-border-box-1>
          </div>
          <div>
            <dv-border-box-8 style="width: 95%">
              <div class="map1" id="map1"></div>
            </dv-border-box-8>
          </div>
          <div>
            <dv-border-box-8 style="width: 105%; position: relative; left: -5%"
              ><div class="map2" id="map2"></div
            ></dv-border-box-8>
          </div>
          <div>
            <dv-border-box-1 class="flex-vertical">
              <div></div>
              <div></div>
            </dv-border-box-1>
          </div>
        </div>
        <div class="contentBottomBox">
          <div>
            <dv-border-box-12 class="bottomBox1">
              <div class="map3" id="map3"></div>
            </dv-border-box-12>
          </div>
          <div></div>
          <div><map_legend id="legend" ref="legend_ref"></map_legend></div>
          <div>
            <dv-border-box-12
              class="bottomBox2"
              style="position: relative; right: -1em; width: 95%"
            >
              <div class="map4" id="map4"></div>
            </dv-border-box-12>
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
      myradio: "1",
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
    go_one() {
      this.$router.push({ path: "/scream" });
    },
    go_two() {
      this.$router.push({ path: "/scream2" });
    },
        go_three() {
      this.$router.push({ path: "/scream3" });
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

      Tool.add_baselayers(this.map1);
      // Tool.add_baselayers(this.map2);
      // Tool.add_baselayers(this.map3);

      Tool.add_layers_by_ids_fids(
        this.map1,

        [2],
        [2, 72]
      ).then((data) => {
        Tool.change_visible(2, this.map1, true);
        Tool.change_visible(72, this.map1, true);
        Tool.change_visible(59, this.map1, false);
        Tool.change_visible(64, this.map1, false);

        Tool.add_features_by_ids_fids(this.map1, [2], [2, 72]).then(
          (response) => {
            this.$refs.legend_ref.getdatatable_map(this.map1);
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
        [1, 29, 99, 90, 91, 92, 93]
      ).then((data) => {
        Tool.change_visible(1, this.map2, true);
        Tool.change_visible(99, this.map2, true);
        Tool.change_visible(29, this.map2, false);
        Tool.change_visible(92, this.map2, true);
        Tool.change_visible(93, this.map2, true);

        Tool.add_features_by_ids_fids(this.map2, [1], [1, 29, 99, 92, 93]);
      });

      Tool.add_baselayers(this.map3);
      this.map3
        .getLayers()
        .getArray()[1]
        .getLayers()
        .getArray()[1]
        .setVisible(false);

      Tool.add_baselayers(this.map4);
    },
    login() {
      localStorage.setItem("access-user", JSON.stringify("success"));

      this.$router.push({ path: "/" });
    },
  },
  //     mounted: function () {
  //     // this.begin_map();
  //   },
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
      height: 60%;
      padding: 10px;
      display: grid;
      grid-template-columns: 3fr 6.5fr 6fr 3fr;
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
      height: 40%;
      padding: 10px;
      display: grid;
      grid-template-columns: 5fr 5fr 1fr 5fr;
      .bottomBox1,
      .bottomBox2 {
        padding: 10px;
        width: 100%;
        height: 100%;
      }
      .bottomBox1 {
        width: 95%;
        ::v-deep .border-box-content {
          display: grid;
          grid-template-columns: 5fr 3.5fr;
        }
      }
      .bottomBox2 {
        ::v-deep .border-box-content {
          display: grid;
          grid-template-columns: 3.5fr 5fr;
        }
      }
    }
  }
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
  height: 92%;
  top: 4%;
  left: 4%;
  position: relative;
}
.map2 {
  width: 92%;
  height: 92%;
  top: 4%;
  left: 4%;
  position: relative;
}

.map3 {
  width: 92%;
  height: 92%;
  top: 4%;
  left: 4%;
  position: relative;
}
.map4 {
  width: 92%;
  height: 92%;
  top: 4%;
  left: 4%;
  position: relative;
}
.btn-animate {
    position: relative;
    width: 80px;
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
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 0%;
    z-index: -1;
    border-radius: 5px;
    background-color: #90cf5b;
    transition: .3s ease;
  }

  &:hover {
    &::after {
      top: auto;
      bottom: 0;
      height: 100%;
    }
  }
}
</style>
