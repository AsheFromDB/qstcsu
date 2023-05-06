<template>
  <el-row class="warp">
    <!-- <div id="container">
      <div id="extraContent"> -->
    <div id="map">
      <img class="north" src="../../static/images/指北针.png" />

      <el-progress
        class="progress"
        type="circle"
        :percentage="progress_data"
        color="green"
        size="mini"
        :width="50"
        :status="progress_status"
        v-show="progress_show"
      ></el-progress>

      <el-button-group
        class="group"
        v-if="this.$store.getters.getDemoValue == 1"
      >
        <el-button
          type="primary"
          @click="show_all"
          v-if="this.$store.getters.getDemoValue == 1"
          :disabled="!inside_mode"
          >显示全部点位</el-button
        >
        <el-button
          type="primary"
          @click="point_select"
          v-if="this.$store.getters.getDemoValue == 1"
          :disabled="!inside_mode"
          >查看超标点</el-button
        >

        <el-dropdown @command="mouthtype">
          <el-button type="primary">
            {{ mouthtype_name }}<i class="el-icon-arrow-up el-icon--right"></i>
          </el-button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="a">平移</el-dropdown-item>
            <el-dropdown-item command="b">点选</el-dropdown-item>
            <el-dropdown-item command="c">显示信息</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </el-button-group>

      <div class="legend_panel" id="legend_panel" v-drag>
        <map_legend id="legend" ref="legend_ref"></map_legend>
      </div>

      <!-- <el-button type="primary" class="post" @click="polygon_post"
        >post</el-button
      > -->
      <popup id="popup" ref="popup_ref"></popup>

      <!-- <el-button
        class="tuli_button"
        type="success"
        slot="reference"
        @click="legend_show = true"
        >图例</el-button
      >
      <el-drawer
        :visible.sync="legend_show"
        :withHeader="false"
        direction="rtl"
        size="22%"
        :modal="false"
        @opened="legend"
      >
        <map_legend id="legend" ref="legend_ref"></map_legend>
      </el-drawer> -->
    </div>

    <el-dialog
      title="清水塘补充监测第一次分析结果汇总"
      :visible.sync="dialogVisible"
    >
      <el-scrollbar style="height: 600px">
        <div ref="file"></div>
      </el-scrollbar>
    </el-dialog>
  </el-row>
</template>
<style scoped>
.group {
  bottom: 0.5em;
  right: 8em;
  position: absolute;

  z-index: 2;
}

.tuli_button {
  bottom: 0.5em;
  right: 1em;
  position: absolute;
  z-index: 2;
}

/* .point_select {
  top: 2.5em;
  right: 16em;
  position: absolute;
  z-index: 2;
}
.circle_select {
  top: 2.5em;
  right: 8em;
  position: absolute;
  z-index: 2;
} */
.show_info {
  top: 2.5em;
  right: 26em;
  position: absolute;
  z-index: 2;
}

.post {
  bottom: 2.5em;
  right: 8em;
  position: absolute;
  z-index: 2;
}

/* .show_all {
  top: 2.5em;
  right: 34em;
  position: absolute;
  z-index: 2;
} */
.legend {
  bottom: 0.5em;
  right: 2em;
  position: absolute;
  z-index: 2;
}

.legend_panel {
  width: 11em;

  bottom: 3em;
  left: 1em;
  position: absolute;
  z-index: 2;

  cursor: move;
}

.north {
  top: 1em;
  right: 5em;
  position: absolute;
  z-index: 2;
}

.progress {
  top: 2.5em;
  right: 3em;
  position: absolute;
  z-index: 2;
  background: #fff;
}

#map {
  height: 92%;
  width: 100%;
  position: fixed;
}
</style>


<script>
import echarts from "echarts";
import Tool from "./mapapi";
import axios from "axios";


import popup from "./zujian/popup.vue";
import map_legend from "./zujian/popup_inner/legend.vue";
import { Feature } from "ol";

import { Point, Polygon, Circle } from "ol/geom";
import { Listbyname } from "./api/map_api/project";
import { createEmpty, extend, getWidth } from "ol/extent";
import {
  multiaddFeatures,
  FeaturesList,
  addFeatures,
} from "./api/map_api/featrues";
import {
  multiaddborders,
  CSXBorderselectListbylayercode,
} from "./api/map_api/CSXBorder";
import { fromLonLat, toLonLat } from "ol/proj";
import { ImageStatic } from "ol/source";

import {
  Group as LayerGroup,
  Tile as TileLayer,
  Vector as VectorLayer,
  VectorTile,
  Image,
} from "ol/layer";
import { GetTable, TablesList } from "./api/map_api/tables";

export default {
  data() {
    return {
      map: null,
      dialogVisible: false,
      show_table: false,
      show_word: false,
      tableData: [
        {
          id: "1 ",
          Cd: "0.000504 ",
          Pb: "0.00354",
          Zn: "0.124",
          Sb: "0.00308",
          As: "0.00295",
        },
      ],
      key1: null, //监听鼠标点击要素事件
      key2: null, //鼠标变化事件
      map_mode: 0, //地图状态。0：无状态，1：移动鼠标显示项目名称
      choose_project_title: null, //选择的面要素
      choose_feature_list: null,
      inside_mode: false, //地图是否处于片区管理状态
      options: [
        {
          type: "li", // type为li是普通按钮
          text: "复制(C)", // 按钮的名称
          callback: () => alert("点击了复制"), // 回调函数
        },
      ],
      show_button: false,
      uid: this.$route.params.id,
      legend_show: false,
      mouthtype_name: "平移",
      mapWidth: "100%",
      menutype: 2,
      progress_data: 0,
      progress_status: null,
      progress_show: true,
      No_overweights: [],
      ROOT: 2,
    };
  },
  components: {
    popup,
    map_legend,
  },

  directives: {
    drag: {
      // 指令的定义
      bind: function (el) {
        let oDiv = el; // 获取当前元素
        oDiv.onmousedown = (e) => {
          // 算出鼠标相对元素的位置
          let disX = e.clientX - oDiv.offsetLeft;
          let disY = e.clientY - oDiv.offsetTop;

          document.onmousemove = (e) => {
            // 用鼠标的位置减去鼠标相对元素的位置，得到元素的位置
            let left = e.clientX - disX;
            let top = e.clientY - disY;

            oDiv.style.left = left + "px";
            oDiv.style.top = top + "px";
          };

          document.onmouseup = (e) => {
            document.onmousemove = null;
            document.onmouseup = null;
          };
        };
      },
    },
  },

  computed: {
    login() {
      return this.$store.getters.getDemoValue;
    },
  },
  methods: {
    measure_line() {
      Tool.measure_line(this.map);
    },
    select() {
      let box;
      Tool.set_map_operation_mode(this.map, 2, box).then((data) => {
        if (
          data["feature_property"]["layercode"] == 2 &&
          data["feature_property"]["featureid"] == "ada"
        ) {
          this.show_word = true;
        } else if (data["feature_property"]["layercode"] == 6) {
          this.show_table = true;
        }
      });
    },
    get_docx() {
      // word_read().then(({ data }) => {
      //   docx.renderAsync(data, this.$refs.file); // 渲染到页面预览
      // });
      axios({
        method: "get",
        responseType: "blob", // 设置响应文件格式
        url: "http://47.107.43.71:5000/api/WordFile",
      }).then(({ data }) => {
        docx.renderAsync(data, this.$refs.file); // 渲染到页面预览
      });
    },
    load_file() {
      this.dialogVisible = true;
      this.get_docx();
    },
    circle_select() {
      Tool.draw_search(1, this.map, []).then((data) => {
        this.show_table = true;
        let tabledata = [];
        for (let i = 0; i < data.length; i++) {
          let row = {};
          row["id"] = data[i].featureid;
          row["Cd"] = "0.000504";
          row["Pb"] = "0.00354";
          row["Zn"] = "0.124";
          row["Sb"] = "0.00308";
          row["As"] = "0.00295";
          tabledata.push(row);
        }
        this.tableData = tabledata;
      });
    },
    choose() {
      let mode = [];

      function clone(Obj) {
        var buf;
        if (Obj instanceof Array) {
          buf = []; // 创建一个空的数组
          var i = Obj.length;
          while (i--) {
            buf[i] = clone(Obj[i]);
          }
          return buf;
        } else if (Obj instanceof Object) {
          buf = {}; // 创建一个空对象
          for (var k in Obj) {
            // 为这个对象添加新的属性
            buf[k] = clone(Obj[k]);
          }
          return buf;
        } else {
          return Obj;
        }
      }

      Tool.set_map_operation_mode(this.map, 2, mode).then((data) => {
        if (!this.inside_mode) this.$refs.popup_ref.pop_mode = 1;
        else this.$refs.popup_ref.pop_mode = 2;
        this.$refs.popup_ref.show = true;

        if (data["features_list"].length > 1 && this.inside_mode) {
          // this.choose_feature_list = data["features_list"][0].get("features")

          let clone_features = clone(data["features_list"][0].get("features"));
          if (!this.root) {
            let temp = data["features_list"][0].get("features");
            for (
              let i = 0;
              i < data["features_list"][0].get("features").length;
              i++
            ) {
              if (temp[i].get("over") === 0)
                this.change_another_feature(temp[i]).then((response) => {
                  temp[i] = response;
                });
            }
            setTimeout(() => {
              console.log(temp);
              this.choose_feature_list = temp;
            }, 200);
          }

          this.$refs.popup_ref.pop_mode = 3;
          const clusterMembers = data["features_list"][0].get("features");
          if (clusterMembers.length > 1) {
            // Calculate the extent of the cluster members.
            const extent = createEmpty();
            clusterMembers.forEach((feature) =>
              extend(extent, feature.getGeometry().getExtent())
            );
            const view = this.map.getView();
            const resolution = this.map.getView().getResolution();
            if (
              view.getZoom() === view.getMaxZoom() ||
              (getWidth(extent) < resolution && getWidth(extent) < resolution)
            ) {
              // Show an expanded view of the cluster members.
              // clickFeature = features[0];
              // clickResolution = resolution;
              // clusterCircles.setStyle(clusterCircleStyle);
            } else {
              // Zoom to the extent of the cluster members.
              view.fit(extent, { duration: 500, padding: [50, 50, 50, 50] });
              this.$refs.popup_ref.show = false;
            }
          }
          setTimeout(() => {
            this.$refs.popup_ref.update_point_info();
          }, 500);
        } else {
          this.choose_project_title = data["property"]["label"];
          // this.$refs.popup_ref.pop_mode = 1;
          let that = this;
          let json = {};
          json["name"] = data["property"]["label"];
          Listbyname(json).then((data) => {
            let json = {};
            json["name"] = data.data.data[0]["name"];
            json["data"] = JSON.parse(data.data.data[0]["data"]);
            this.$refs.popup_ref.choose_project = json;
          });
          this.map_mode = 1;
        }
        this.$refs.popup_ref.overlay.setPosition(data["position"]);
        if (this.map_mode == 1) {
          this.choose();
        }
      });
    },
    go_inside() {
      let map = this.map;
      let that = this;
      function add_pianqu(array1, array2) {
        Tool.add_layers_by_ids_fids(map, array1, array2).then((data) => {
          Tool.change_visible(array1[0], map, true);

          Tool.change_visible(array1[1], map, true);
          for (let i = 2; i < array2.length; i++) {
            Tool.change_visible(array2[i], map, false);
          }
          Tool.add_features_by_ids_fids(map, array1, array2).then(
            (response) => {
              that.progress_data = 100;
              that.progress_status = "success";

              setTimeout(() => {
                that.progress_show = false;

                Tool.no_feature_locker(map, true);
              }, 1000);

              // Tool.zoom_listener(this.map);
            }
          );
        });
      }
      this.progress_show = true;
      this.progress_data = 0;
      this.progress_status = null;
      var timestamp = Date.parse(new Date()) / 1000;
      this.time_go(timestamp, 5);

      this.inside_mode = true;
      Tool.no_feature_locker(this.map, false);
      that.close_project();
      let feature = this.map
        .getLayers()
        .getArray()[1]
        .getLayers()
        .getArray()[3]
        .getSource()
        .getFeatures()[0];

      this.map.removeLayer(this.map.getLayers().getArray()[2]);
      this.map.removeLayer(this.map.getLayers().getArray()[2]);
      this.map.removeLayer(this.map.getLayers().getArray()[2]);
      this.map.removeLayer(this.map.getLayers().getArray()[2]);

      let extent = feature.getGeometry().getExtent();
      if (
        feature.get("label") === "映峰" ||
        feature.get("label") === "株洲市宏基锌业" ||
        feature.get("label") === "湖南海利化工"
      ) {
        let extent1 = feature.getGeometry().getExtent();
        let extent2 = this.map
          .getLayers()
          .getArray()[1]
          .getLayers()
          .getArray()[3]
          .getSource()
          .getFeatures()[1]
          .getGeometry()
          .getExtent();
        extent[0] = Math.min(extent1[0], extent2[0]);
        extent[1] = Math.min(extent1[1], extent2[1]);
        extent[2] = Math.max(extent1[2], extent2[2]);
        extent[3] = Math.max(extent1[3], extent2[3]);
      }
      this.map.getView().fit(extent, this.map.getSize());
      console.log(this.map.getView().getCenter());
      console.log(this.map.getView().getZoom());
      this.$refs.popup_ref.pop_mode = 2;
      if (feature.get("label") === "清石") {
        Tool.add_layers_by_ids_fids(
          this.map,
          [5, 4, 18],
          [5, 4, 18, 6, 7, 8, 9, 20, 19]
        ).then((data) => {
          Tool.change_visible(18, this.map, true);

          Tool.change_visible(5, this.map, true);
          Tool.change_visible(6, this.map, false);
          Tool.change_visible(7, this.map, false);
          Tool.change_visible(8, this.map, false);
          Tool.change_visible(9, this.map, false);
          Tool.change_visible(19, this.map, false);
          Tool.change_visible(20, this.map, false);
          Tool.add_features_by_ids_fids(
            this.map,
            [5, 4, 18],
            [5, 4, 18, 6, 7, 8, 9, 20, 19]
          ).then((response) => {
            this.progress_data = 100;
            this.progress_status = "success";

            setTimeout(() => {
              this.progress_show = false;
              Tool.no_feature_locker(that.map, true);
            }, 1000);

            // Tool.zoom_listener(this.map);
          });
        });
      } else if (feature.get("label") === "响石岭") {
        Tool.add_layers_by_ids_fids(
          this.map,
          [135, 150, 156],
          [135, 136, 137, 138, 139, 150, 151, 152, 156]
        ).then((data) => {
          Tool.change_visible(135, this.map, true);

          Tool.change_visible(150, this.map, true);
          Tool.change_visible(136, this.map, false);
          Tool.change_visible(137, this.map, false);
          Tool.change_visible(138, this.map, false);
          Tool.change_visible(139, this.map, false);
          Tool.change_visible(151, this.map, false);
          Tool.change_visible(152, this.map, false);

          Tool.add_features_by_ids_fids(
            this.map,
            [135, 150, 156],
            [135, 136, 137, 138, 139, 150, 151, 152, 156]
          ).then((response) => {
            this.progress_data = 100;
            this.progress_status = "success";

            setTimeout(() => {
              this.progress_show = false;
              Tool.no_feature_locker(that.map, true);
            }, 1000);

            // Tool.zoom_listener(this.map);
          });
        });
      } else if (feature.get("label") === "铜塘湾") {
        Tool.add_layers_by_ids_fids(
          this.map,
          [159, 174, 183],
          [159, 174, 183, 160, 161, 162, 163, 175, 176]
        ).then((data) => {
          Tool.change_visible(159, this.map, true);

          Tool.change_visible(174, this.map, true);
          Tool.change_visible(160, this.map, false);
          Tool.change_visible(161, this.map, false);
          Tool.change_visible(162, this.map, false);
          Tool.change_visible(163, this.map, false);
          Tool.change_visible(175, this.map, false);
          Tool.change_visible(176, this.map, false);
          Tool.add_features_by_ids_fids(
            this.map,
            [159, 174, 183],
            [159, 174, 183, 160, 161, 162, 163, 175, 176]
          ).then((response) => {
            this.progress_data = 100;
            this.progress_status = "success";

            setTimeout(() => {
              this.progress_show = false;
              Tool.no_feature_locker(that.map, true);
            }, 1000);
            Tool.zoom_listener(this.map);
          });
        });
      } else if (feature.get("label") === "清水湖") {
        Tool.add_layers_by_ids_fids(
          this.map,
          [187, 203, 207],
          [187, 188, 189, 190, 191, 203, 207, 208, 209]
        ).then((data) => {
          Tool.change_visible(187, this.map, true);
          Tool.change_visible(207, this.map, true);
          Tool.change_visible(188, this.map, false);
          Tool.change_visible(189, this.map, false);
          Tool.change_visible(190, this.map, false);
          Tool.change_visible(191, this.map, false);
          Tool.change_visible(208, this.map, false);
          Tool.change_visible(209, this.map, false);
          Tool.add_features_by_ids_fids(
            this.map,
            [187, 203, 207],
            [187, 188, 189, 190, 191, 203, 207, 208, 209]
          ).then((response) => {
            this.progress_data = 100;
            this.progress_status = "success";

            setTimeout(() => {
              this.progress_show = false;
              Tool.no_feature_locker(that.map, true);
            }, 1000);

            // Tool.zoom_listener(this.map);
          });
        });
      } else if (feature.get("label") === "映峰") {
        add_pianqu(
          [214, 229, 241],
          [214, 229, 215, 216, 217, 218, 230, 231, 240]
        );
      } else if (feature.get("label") === "铜霞") {
        add_pianqu([283, 298, 302], [283, 298, 284, 285, 286, 287, 305, 302]);
      } else if (feature.get("label") === "清水") {
        add_pianqu([250, 265, 280], [250, 265, 251, 252, 253, 254, 266, 280]);
      } else if (feature.get("label") === "湖南海利化工") {
        add_pianqu([306, 318], [306, 318, 307, 308, 309, 347, 348, 349, 539]);
      } else if (feature.get("label") === "株洲市鑫达冶化") {
        add_pianqu([365, 377], [365, 377, 366, 367, 368]);
        Tool.change_visible(378, this.map, false);
        Tool.change_visible(379, this.map, false);
      } else if (feature.get("label") === "株洲市天源纺织") {
        add_pianqu([380, 392], [380, 392, 381, 382, 383, 420, 421, 422]);
      } else if (feature.get("label") === "康力冶炼厂") {
        add_pianqu([350, 362], [350, 362, 351, 352, 353]);
        Tool.change_visible(363, this.map, false);
        Tool.change_visible(364, this.map, false);
      } else if (feature.get("label") === "株洲市宏基锌业") {
        add_pianqu([423, 435], [423, 435, 424, 425, 426, 540]);
        Tool.change_visible(436, this.map, false);
        Tool.change_visible(437, this.map, false);
      } else if (feature.get("label") === "清水冶化") {
        add_pianqu(
          [444, 456],
          [444, 456, 445, 446, 447, 488, 489, 490, 491, 492]
        );
      } else if (feature.get("label") === "湖南盈德气体") {
        add_pianqu([498, 510], [498, 510, 499, 500, 501, 511, 512]);
      } else if (feature.get("label") === "荷花水泥厂") {
        add_pianqu([524, 536], [524, 536, 525, 526, 527]);
        setTimeout(() => {
          Tool.change_visible(537, map, false);
          Tool.change_visible(538, map, false);
        }, 200);
      } else if (feature.get("label") === "清水片区废渣") {
        Tool.add_layers_by_ids_fids(map, [541], [541, 547, 542]).then(
          (data) => {
            Tool.change_visible(541, map, true);

            Tool.add_features_by_ids_fids(map, [541], [541, 547, 542]).then(
              (response) => {
                that.progress_data = 100;
                that.progress_status = "success";

                setTimeout(() => {
                  that.progress_show = false;

                  // Tool.no_feature_locker(map, true);
                }, 1000);

                // Tool.zoom_listener(this.map);
              }
            );
          }
        );
      } else if (feature.get("label") === "铜霞片区废渣") {
        Tool.add_layers_by_ids_fids(map, [551], [551, 566, 567]).then(
          (data) => {
            Tool.change_visible(551, map, true);

            Tool.add_features_by_ids_fids(map, [551], [551, 566, 567]).then(
              (response) => {
                that.progress_data = 100;
                that.progress_status = "success";

                setTimeout(() => {
                  that.progress_show = false;

                  // Tool.no_feature_locker(map, true);
                }, 1000);

                // Tool.zoom_listener(this.map);
              }
            );
          }
        );
      } else if (feature.get("label") === "袁家冲废渣") {
        Tool.add_layers_by_ids_fids(map, [552], [552, 573, 574]).then(
          (data) => {
            Tool.change_visible(552, map, true);

            Tool.add_features_by_ids_fids(map, [552], [552, 573, 574]).then(
              (response) => {
                that.progress_data = 100;
                that.progress_status = "success";
                console.log(
                  map.getLayers().getArray()[2].getSource().getFeatures()
                );
                setTimeout(() => {
                  that.progress_show = false;

                  // Tool.no_feature_locker(map, true);
                }, 1000);

                // Tool.zoom_listener(this.map);
              }
            );
          }
        );
      } else if (feature.get("label") === "清石片区历史堆存废渣") {
        Tool.add_layers_by_ids_fids(map, [553], [553, 560, 561]).then(
          (data) => {
            Tool.change_visible(553, map, true);
            Tool.change_visible(560, map, false);
            Tool.change_visible(561, map, false);

            Tool.add_features_by_ids_fids(map, [553], [553, 560, 561]).then(
              (response) => {
                that.progress_data = 100;
                that.progress_status = "success";

                setTimeout(() => {
                  that.progress_show = false;

                  // Tool.no_feature_locker(map, true);
                }, 1000);

                // Tool.zoom_listener(this.map);
              }
            );
          }
        );
      }
    },
    go_out() {
      this.progress_show = true;
      this.progress_data = 0;
      this.progress_status = null;
      var timestamp = Date.parse(new Date()) / 1000;
      this.time_go(timestamp, 5);
      this.inside_mode = false;
      Tool.no_feature_locker(this.map, false);
      this.open_project();
      this.map.removeLayer(this.map.getLayers().getArray()[2]);
      this.map.removeLayer(this.map.getLayers().getArray()[2]);
      this.map.removeLayer(this.map.getLayers().getArray()[2]);
      let viewExtent = [
        12583044.389379106, 3228285.547003637, 12592971.648427643,
        3235088.442521018,
      ];
      let count = 0;
      this.map.getView().fit(viewExtent, this.map.getSize());
      this.$refs.popup_ref.pop_mode = 1;
      // setTimeout(() => {
      //   sessionStorage.removeItem("home_polygon");
      // }, 200);

      setTimeout(() => {
        Tool.add_layers_by_ids_fids(
          this.map,
          [2, 1, 900],
          [2, 1, 72, 29, 59, 99, 90, 91, 92, 93, 900, 901, 902, 903, 904]
        ).then((data) => {
          Tool.new_add_home_points(this.map).then((response) => {
            count++;
            if (count === 2) {
              this.progress_data = 100;
              this.progress_status = "success";
              setTimeout(() => {
                this.progress_show = false;
                Tool.no_feature_locker(this.map, true);
              }, 1000);
            }
          });
          Tool.add_features_by_ids_fids(
            this.map,
            [2, 1],
            [2, 1, 72, 29, 59, 99, 90, 91, 92, 93]
          ).then((response) => {
            count++;
            if (count === 2) {
              this.progress_data = 100;
              this.progress_status = "success";
              setTimeout(() => {
                this.progress_show = false;
                Tool.no_feature_locker(this.map, true);
              }, 1000);
            }
          });
          // Tool.add_features_by_ids_fids(this.map, [133,134], []);
          Tool.change_visible(2, this.map, true);
          Tool.change_visible(72, this.map, false);
          Tool.change_visible(1, this.map, true);
          Tool.change_visible(29, this.map, false);
          Tool.change_visible(59, this.map, false);
          Tool.change_visible(99, this.map, false);
          Tool.change_visible(64, this.map, false);
          Tool.change_visible(900, this.map, true);
          Tool.change_visible(901, this.map, false);
          Tool.change_visible(902, this.map, false);
          Tool.change_visible(903, this.map, false);
          Tool.change_visible(904, this.map, false);
        });
      }, 200);
    },
    find_layer(title) {
      let map = this.map;
      let layer;

      for (let i = 0; i < map.getLayers().getArray().length; i++) {
        if (map.getLayers().getArray()[i].get("title") === "区域范围") {
          let group = map.getLayers().getArray()[i];
          if (map.getLayers().getArray()[i].get("title") === title)
            layer = group;
          else {
            for (let j = 0; j < group.getLayers().getArray().length; j++) {
              if (group.getLayers().getArray()[j].get("title") === title)
                layer = group.getLayers().getArray()[j];
            }
          }
        }
      }
      return layer;
    },

    close_project() {
      let source = this.map
        .getLayers()
        .getArray()[1]
        .getLayers()
        .getArray()[3]
        .getSource();
      for (let i = source.getFeatures().length - 1; i >= 0; i--) {
        if (source.getFeatures()[i].get("label") != this.choose_project_title) {
          source.removeFeature(source.getFeatures()[i]);
        }
      }
    },
    open_project() {
      let map = this.map;
      Tool.add_border(this.map);
    },
    post() {
      let data = [];
      for (let i = 0; i < input.length; i++) {
        let one = {};
        one["latitude"] = input[i][1];
        one["longitude"] = input[i][0];
        one["layercode"] = 83;
        one["featureid"] = i.toString();
        one["show_label"] = i;
        one["sensitive"] = 0;
        one["standardid"] = 29;
        data.push(one);
      }
      // for (let i = 0; i < json["geometries"].length; i++) {
      //   let one = {};
      //   one["latitude"] = json["geometries"][i]["coordinates"][1];
      //   one["longitude"] = json["geometries"][i]["coordinates"][0];
      //   one["layercode"] = 71;
      //   one["featureid"] = i.toString();
      //   one["show_label"] = i;
      //   one["sensitive"] = 1;
      //   one["standardid"] = 27;
      //   data.push(one);
      // }
      // console.log(json["geometries"][0])

      multiaddFeatures(data).then((response) => {});
    },
    polygon_post() {
      // let json = {};
      let json ={"type":"GeometryCollection", "geometries": [
{"type":"Polygon","coordinates":[[[113.09195962543242,27.872399597887345],[113.0919453004053,27.872370729442064],[113.09207365968535,27.872320182895855],[113.09195962543242,27.872399597887345]]]},
{"type":"Polygon","coordinates":[[[113.09018849734429,27.868705962245365],[113.08971483666697,27.868964651560105],[113.08955973811423,27.868871110956462],[113.08950035637059,27.868617348025314],[113.08957512576747,27.868567319754376],[113.08995010526563,27.868492970979403],[113.09018849734429,27.868705962245365]]]},
{"type":"Polygon","coordinates":[[[113.0645466182809,27.870379667314097],[113.06457353735797,27.8704528753627],[113.06422146690366,27.870593564590052],[113.06417065847934,27.870528866541243],[113.06415885559981,27.870400335249542],[113.06428341767656,27.87029135760954],[113.06446387982164,27.870284446643126],[113.0645466182809,27.870379667314097]]]},
{"type":"Polygon","coordinates":[[[113.05964567041228,27.87198947657581],[113.05952691876571,27.872054849873503],[113.0594074278438,27.872045800372582],[113.05929167600488,27.871937374383002],[113.05929777520338,27.871805860046415],[113.05934666134021,27.871737469476518],[113.0597127773407,27.871885694038692],[113.05967647353886,27.87194989716489],[113.05964567041228,27.87198947657581]]]},
{"type":"Polygon","coordinates":[[[113.06260788488757,27.86138655361766],[113.06258400024593,27.861491592593655],[113.06259077905231,27.86152442349551],[113.06236866996232,27.861607701119375],[113.06221757742165,27.861467240543355],[113.06225110686523,27.861282543776074],[113.06250899255771,27.86127091354558],[113.06260788488757,27.86138655361766]]]},
{"type":"Polygon","coordinates":[[[113.06085505467942,27.873483512281204],[113.06014319951399,27.873546282894914],[113.05956963898232,27.873663642949804],[113.0594906388554,27.873613017486907],[113.05945747725627,27.873519773324738],[113.05943928073481,27.873391829788748],[113.05942737742107,27.87334114760157],[113.05936110836222,27.873331100347905],[113.05921887670499,27.873375488615796],[113.05912266840276,27.87341132189243],[113.05906982824924,27.873298527331368],[113.06065305369317,27.872879259938404],[113.06074243798042,27.872902248936025],[113.06078723626791,27.87302464200287],[113.06101810230751,27.872973288823296],[113.06109873255733,27.873010118171916],[113.06092080696192,27.873223122006106],[113.06085505467942,27.873483512281204]]]},
{"type":"Polygon","coordinates":[[[113.06060280772219,27.87261907123957],[113.06036373419359,27.872865967481708],[113.06020921889403,27.872695568680058],[113.0601700035017,27.872608761145134],[113.06019398426962,27.872533176908508],[113.0602627067614,27.872481373139337],[113.06035523046428,27.872399128545677],[113.06060280772219,27.87261907123957]]]},
{"type":"Polygon","coordinates":[[[113.05894156839163,27.872725336333453],[113.05894743535985,27.872877020556825],[113.05896644296672,27.87322793024358],[113.05886269568104,27.87326185582883],[113.05875797146695,27.873293321268676],[113.058727125964,27.873246327432934],[113.05871317461224,27.873135423255004],[113.05873565846382,27.873059879609524],[113.05880689566835,27.872947385010153],[113.05886852032371,27.872875158306268],[113.05889208044972,27.872812288691563],[113.05889075192025,27.872719516091813],[113.05894156839163,27.872725336333453]]]},
{"type":"Polygon","coordinates":[[[113.05971354981854,27.872956323097107],[113.05969849723256,27.873019172368284],[113.0596713902608,27.87306646110346],[113.05947277482842,27.873123977340764],[113.05927815558964,27.87291881204457],[113.05911631993052,27.873102039439512],[113.05910353456697,27.872866013626137],[113.0590984892368,27.87274330929237],[113.05955370568626,27.872795445481238],[113.05962291271828,27.872828333157432],[113.05969066023933,27.872891963596235],[113.05971354981854,27.872956323097107]]]},
{"type":"Polygon","coordinates":[[[113.0594074278438,27.872045800372582],[113.05932602647503,27.872128251032063],[113.05911887733019,27.872153328054814],[113.05913761509419,27.871990327007442],[113.05916200739712,27.871827917650702],[113.05919203155192,27.871666255024856],[113.05921921024209,27.87168587002242],[113.05934666134021,27.871737469476518],[113.05929777520338,27.871805860046415],[113.05929167600488,27.871937374383002],[113.0594074278438,27.872045800372582]]]},
{"type":"Polygon","coordinates":[[[113.05900146549796,27.87183832319418],[113.05897782460686,27.872005166214603],[113.05895991263023,27.87217257166334],[113.05886670877442,27.872183854308968],[113.05889948067232,27.872035987986308],[113.05892875536296,27.87199823723801],[113.05897131340264,27.871867987728802],[113.05903081160764,27.871672196733137],[113.05900146549796,27.87183832319418]]]},
{"type":"Polygon","coordinates":[[[113.05478184588505,27.86919703602714],[113.05482830125773,27.869272506525274],[113.05483042005409,27.869357477723725],[113.05479023306809,27.869432038595626],[113.05464754198108,27.869410663694076],[113.05447426384985,27.869278129250052],[113.05446674585824,27.869214073716012],[113.05455937502074,27.86915037451814],[113.05466936192263,27.869141491741242],[113.05478184588505,27.86919703602714]]]},
{"type":"Polygon","coordinates":[[[113.06412620789882,27.869992877992956],[113.06416252242718,27.870148486344686],[113.06396013262031,27.870284299330024],[113.06389563412691,27.870273494813418],[113.0637676966716,27.870140921380816],[113.06381308390444,27.869986239339656],[113.06398440820028,27.869924642467282],[113.06412620789882,27.869992877992956]]]},
{"type":"Polygon","coordinates":[[[113.05664464356106,27.860851369426257],[113.05654844108109,27.860828754476614],[113.05647874495908,27.860763283834025],[113.0564436763553,27.860591537759255],[113.05639482548042,27.860533395719496],[113.05632120597576,27.860511606421596],[113.05625233712317,27.860542543125312],[113.05620021425494,27.860612025879128],[113.05615895008958,27.86075142769754],[113.05610755924675,27.86079463903387],[113.05595405606888,27.860828598471027],[113.05571300749082,27.860767811560894],[113.05564448334077,27.860647779079365],[113.05564837610174,27.86043011533707],[113.05522064459954,27.860384921842805],[113.05525992709752,27.860184269169725],[113.05735517157262,27.86045917910763],[113.05733774770917,27.860727055599504],[113.05726875047827,27.860816025395476],[113.05716404379446,27.860853381235238],[113.05688353058632,27.86084363148037],[113.05664464356106,27.860851369426257]]]},
{"type":"Polygon","coordinates":[[[113.05564252374016,27.860928683232068],[113.05547605070765,27.861308640750575],[113.05621805008367,27.8613667686217],[113.05627064841072,27.861643649071105],[113.05620963972422,27.861661742690885],[113.05613619334197,27.86172864233848],[113.05570303012891,27.86168681211583],[113.05562357263531,27.86160136278737],[113.05551501127606,27.861543078712447],[113.05543296330534,27.86143897868774],[113.05533754405003,27.86125176573307],[113.05552327755976,27.860827850331773],[113.05564252374016,27.860928683232068]]]},
{"type":"Polygon","coordinates":[[[113.06421299736908,27.862274371403917],[113.06437174792566,27.862282183225748],[113.06487780754289,27.862398130477697],[113.06465054130928,27.862722572847098],[113.064606259931,27.862701921669704],[113.06433790194673,27.862598685461112],[113.06420972702203,27.862533480633694],[113.0641746393606,27.862489416074762],[113.06414943236163,27.862471374637067],[113.06418390265783,27.862269829350883],[113.06421299736908,27.862274371403917]]]},
{"type":"Polygon","coordinates":[[[113.06289928885899,27.86235551567412],[113.06288495832057,27.862382631330217],[113.06277061051564,27.862377526894026],[113.06272092926089,27.862332099569283],[113.06263516598119,27.862354489793532],[113.06257101846472,27.86232021060041],[113.06257464887065,27.86220519601751],[113.062525282949,27.86206638804944],[113.06233692618613,27.862032377968948],[113.06230740240693,27.862042788529795],[113.0623107017165,27.861981726723123],[113.06243276216105,27.861878885488068],[113.06317013704735,27.86200551452323],[113.06315343367288,27.862086614237025],[113.06311236027689,27.862220138239916],[113.06299281066431,27.86219409555333],[113.06289928885899,27.86235551567412]]]},
{"type":"Polygon","coordinates":[[[113.06208910792213,27.861624551575414],[113.06218908085002,27.861709115327002],[113.06220524281142,27.861830526554385],[113.06213452441774,27.86193051165104],[113.0620510028081,27.861966025636875],[113.06191885084108,27.861952147105892],[113.06180900177627,27.86182802152187],[113.06181527512305,27.861731471031487],[113.06193216366877,27.861622169654257],[113.06208910792213,27.861624551575414]]]},
{"type":"Polygon","coordinates":[[[113.05938502739183,27.86082617399444],[113.05941678656129,27.86099654245338],[113.05940451341583,27.8611577138004],[113.05925680478836,27.861236951433323],[113.0591049605656,27.861202286378838],[113.05894462371377,27.86114010749299],[113.05895749081633,27.860898492297974],[113.05908707969907,27.860795022348558],[113.05938502739183,27.86082617399444]]]},
{"type":"Polygon","coordinates":[[[113.0645466182809,27.870379667314097],[113.06457353735797,27.8704528753627],[113.06422146690366,27.870593564590052],[113.06417065847934,27.870528866541243],[113.06415885559981,27.870400335249542],[113.06428341767656,27.87029135760954],[113.06446387982164,27.870284446643126],[113.0645466182809,27.870379667314097]]]},
{"type":"MultiPolygon","coordinates":[[[[113.05759412870836,27.861404552212758],[113.05754461892056,27.861409793878366],[113.05757146669241,27.861391048494582],[113.05759412870836,27.861404552212758]]],[[[113.05793474205542,27.861392802752594],[113.05787293340677,27.861401540935237],[113.05779256136196,27.86140804898797],[113.05775153178635,27.861420384023923],[113.05772175348064,27.861427677962283],[113.0576691542145,27.861423878098552],[113.05761678971477,27.861418055920385],[113.05759412870836,27.861404552212758],[113.05765367907783,27.86140148513317],[113.05770627832467,27.8614052859048],[113.05773605663295,27.861397991067367],[113.05777708620165,27.861385656035818],[113.05785745823054,27.8613791479917],[113.05793474205542,27.861392802752594]]],[[[113.05793474205542,27.861392802752594],[113.05800498548618,27.86138830980095],[113.05805275284521,27.86139483221856],[113.05812244388676,27.861408668725264],[113.05818635986442,27.861425225955703],[113.05824977859305,27.861445986366956],[113.05829982051283,27.86146187224017],[113.05835618607479,27.86148557563393],[113.05831529580055,27.861484264234065],[113.05826525386036,27.86146837926847],[113.05820183511565,27.861447618864013],[113.05813791913017,27.861431060738155],[113.05806822807219,27.861417224238913],[113.0580204606945,27.86141070272868],[113.05796319212365,27.86140549686034],[113.05793474205542,27.861392802752594]]],[[[113.05758588370944,27.86148189127013],[113.05756085622752,27.86149982527712],[113.05752498950177,27.861501221532677],[113.05749107581421,27.861487754614124],[113.05754021432999,27.861478489704634],[113.05756869902203,27.861456661459208],[113.05758588370944,27.86148189127013]]],[[[113.05835618607479,27.86148557563393],[113.0584281044587,27.861490046698062],[113.0584978595322,27.86150259584648],[113.05855371393167,27.861524482012904],[113.05851333485904,27.861524988721435],[113.05844357976926,27.861512439580487],[113.05838394786873,27.861501440213374],[113.05835618607479,27.86148557563393]]],[[[113.05863612835716,27.861543873146772],[113.0586640155638,27.861554042194747],[113.05864844899045,27.8615783977949],[113.05859067161688,27.861537004870026],[113.05863612835716,27.861543873146772]]],[[[113.0575505625399,27.861615992397343],[113.0575105669795,27.861619577432414],[113.05753242380233,27.86158849485581],[113.0575505625399,27.861615992397343]]]]},
{"type":"Polygon","coordinates":[[[113.05866062781013,27.861960470791587],[113.05861928823153,27.861977766714404],[113.05857912367209,27.861997372456514],[113.05853556990922,27.862019934506847],[113.05856364826742,27.861974979588478],[113.0586038128133,27.86195537475294],[113.05864515238562,27.86193807883456],[113.05866062781013,27.861960470791587]]]},
{"type":"Polygon","coordinates":[[[113.0620780961124,27.872414692942428],[113.0620284251228,27.872455653240845],[113.06199977664787,27.87246796358675],[113.06179354201471,27.872512984829935],[113.06198429808373,27.87244557197785],[113.06201294757744,27.872433260739662],[113.06206261856222,27.872392300446577],[113.06214568953024,27.872345089555676],[113.0620780961124,27.872414692942428]]]},
{"type":"Polygon","coordinates":[[[113.06257862674273,27.862348682623974],[113.06238359016973,27.86236454163937],[113.06237181464377,27.862424964733975],[113.06235667193339,27.862535578040166],[113.06234352695606,27.862631601806196],[113.06231894331303,27.86271834687087],[113.0623280506706,27.862609210243697],[113.06234119566601,27.862513185576837],[113.06235633838045,27.86240257317457],[113.06236811391993,27.862342149178975],[113.06257862674273,27.862348682623974]]]},
{"type":"Polygon","coordinates":[[[113.05978646546941,27.86235003111759],[113.05973263317331,27.86236539878273],[113.059665046358,27.86238069250991],[113.05959832913409,27.862398748713012],[113.05946695961968,27.862437460241583],[113.05942765348192,27.862456416999947],[113.0593898927494,27.862477708655824],[113.05936197321375,27.86249876513691],[113.05932510059223,27.86251479329551],[113.05934649757738,27.86247637235263],[113.05937441608702,27.862455316769882],[113.05941217783756,27.862434024222715],[113.05945148396968,27.862415067468568],[113.05958285345409,27.862376356856352],[113.0596495706743,27.862358299758135],[113.05971715747755,27.862343006038213],[113.05978646546941,27.86235003111759]]]},
{"type":"MultiPolygon","coordinates":[[[[113.05973007929528,27.862733888848556],[113.05989336620212,27.86265912956433],[113.05989456046271,27.86268698232798],[113.05973007929528,27.862733888848556]]],[[[113.05973007929528,27.862733888848556],[113.05974691409692,27.862768094976705],[113.05934396799205,27.862780044558285],[113.05973007929528,27.862733888848556]]],[[[113.05945876285703,27.863790737352353],[113.05952261702484,27.863581189922492],[113.05959787668253,27.863599951531288],[113.0596251788946,27.863460364163203],[113.0596133525317,27.86362234338668],[113.05953809284794,27.863603582688206],[113.05945876285703,27.863790737352353]]],[[[113.05953817784444,27.863893286763297],[113.05946488662899,27.86415806024577],[113.05951274255756,27.86387669295711],[113.05953817784444,27.863893286763297]]]]},
{"type":"MultiPolygon","coordinates":[[[[113.05468144813204,27.865293252792778],[113.05473114045213,27.86530533702074],[113.05478412898833,27.86531830102129],[113.05483876666355,27.86533170400094],[113.05485188532037,27.86536005084852],[113.05479960406424,27.86534069339303],[113.05474661550737,27.86532773030041],[113.05469692317526,27.86531564607777],[113.05465217718968,27.86530488154148],[113.05462536390364,27.86528918242303],[113.05468144813204,27.865293252792778]]],[[[113.05430558613914,27.86532847781818],[113.0542832023966,27.865351175507627],[113.05416920877938,27.865447411812053],[113.05413358161867,27.865473216466718],[113.05410109921287,27.865493253415924],[113.05407113484908,27.86551258126201],[113.05401001385496,27.865559216062383],[113.05396245671345,27.865621486273643],[113.05395511219524,27.865588717899243],[113.0539945389145,27.865536823605982],[113.05405565990218,27.86549018881217],[113.05408562426233,27.865470860969307],[113.05411810667188,27.865450823121318],[113.05415373382864,27.865425018470475],[113.05426772743509,27.865328782178292],[113.05429011117603,27.865306084491262],[113.05435900407251,27.86523501397323],[113.05430558613914,27.86532847781818]]],[[[113.05396993699007,27.865797852934723],[113.05394481838225,27.86582001658322],[113.05391327160685,27.86584441989577],[113.0538800532634,27.865871082864743],[113.05384547175373,27.86587934455737],[113.05386457830781,27.86584869039432],[113.05389779563266,27.865822027421956],[113.05392934342788,27.865797623217496],[113.05395446203346,27.86577545957169],[113.05398799200398,27.8657613093394],[113.05396993699007,27.865797852934723]]]]},
{"type":"Polygon","coordinates":[[[113.05967647353886,27.87194989716489],[113.05996291662952,27.87208121156724],[113.05969659318383,27.8719747199303],[113.05942874870381,27.872251544020862],[113.05964567041228,27.87198947657581],[113.05967647353886,27.87194989716489]]]},
{"type":"MultiPolygon","coordinates":[[[[113.06386264798691,27.86180805263386],[113.06391402520507,27.861368854900682],[113.06430389264133,27.861413351447855],[113.06392950165367,27.86139124629284],[113.06386264798691,27.86180805263386]]],[[[113.0640100450064,27.862007775008554],[113.06384355472127,27.86198479461047],[113.06382162676324,27.861954878300565],[113.06399456846503,27.8619853827226],[113.06403886384462,27.861921984123768],[113.06405278963194,27.861885805413657],[113.06407861103598,27.861915629902096],[113.06405434039439,27.86194437550269],[113.0640100450064,27.862007775008554]]],[[[113.06358809164124,27.86208233454006],[113.06352055121918,27.86224207992485],[113.06357261517019,27.86205994311112],[113.06361440211664,27.86189541923825],[113.06379280133099,27.861920075136332],[113.06362987857409,27.861917810662664],[113.06358809164124,27.86208233454006]]],[[[113.06394064252007,27.86240204579634],[113.06392052293772,27.86237198206373],[113.06395608842224,27.862253354701288],[113.06394064252007,27.86240204579634]]],[[[113.06394064252007,27.86240204579634],[113.06395611911447,27.86242443718592],[113.06395445120994,27.862481014765006],[113.06386466415059,27.862760903717],[113.0638176257743,27.862761118637458],[113.0636883063524,27.862725493480966],[113.06380214917091,27.862738726330686],[113.06384918752964,27.862738512317534],[113.0639389746082,27.862458623375236],[113.06394064252007,27.86240204579634]]],[[[113.0633233164751,27.862742383651142],[113.06323312875857,27.862785978452127],[113.06318175138232,27.862848963231368],[113.06314584014724,27.862942148057908],[113.06316627489215,27.86282657175867],[113.06321765226623,27.862763586984947],[113.0633078399776,27.862719991291375],[113.06343335061052,27.86254282880001],[113.06367607123407,27.862629784535613],[113.06344882711798,27.862565220244004],[113.0633233164751,27.862742383651142]]]]},
{"type":"Polygon","coordinates":[[[113.06857570320034,27.866569105290537],[113.06780071931479,27.866659482658747],[113.06781189628475,27.866591951093174],[113.06786309990824,27.866515954706635],[113.06792361747186,27.866460913524875],[113.06802463209262,27.86639605444198],[113.0681550253101,27.866352653303732],[113.06816768015806,27.86632656525076],[113.06840707990897,27.866296566148502],[113.0683631386291,27.86612893526648],[113.06840666622617,27.865999819651925],[113.0684812800556,27.86596721032044],[113.06850897781132,27.865913458584355],[113.0684952702242,27.865890983091138],[113.06848123319195,27.865804568878968],[113.06830975779917,27.865809144880306],[113.0683172273775,27.865759423444175],[113.06846584104997,27.865742812196657],[113.06871870090866,27.865877020762312],[113.06909687059905,27.866019090231426],[113.06907779205706,27.866069294600624],[113.0690593127913,27.86620488852391],[113.0690211836214,27.866283009259977],[113.06870106515908,27.866512082545995],[113.06869661617667,27.866555524408113],[113.06857570320034,27.866569105290537]]]},
{"type":"Polygon","coordinates":[[[113.0667975869179,27.86677359869155],[113.06660309893891,27.866793289468895],[113.0665964451241,27.866742854476644],[113.06659874133318,27.866689116212708],[113.06660609808088,27.866621262041516],[113.06662961842095,27.86650736638422],[113.06665381702403,27.866444059272812],[113.06669246242441,27.866379243791176],[113.06662443247274,27.866278162297366],[113.0668803522391,27.86620592282586],[113.06710552836742,27.86616655301782],[113.06735473085925,27.866055574902894],[113.06744189683653,27.86597927955086],[113.06748990287501,27.86600863622962],[113.0674559328552,27.866404077689396],[113.06763148204183,27.86656184926829],[113.06771351501347,27.86666999083424],[113.06701884773724,27.866750869278466],[113.0667975869179,27.86677359869155]]]},
{"type":"Polygon","coordinates":[[[113.08354489493779,27.858874751029173],[113.08337324548036,27.85903675391947],[113.08313737652624,27.858843968216505],[113.08338129326984,27.858709952205125],[113.08345082852418,27.85875181635834],[113.08348863059534,27.858702219659616],[113.08326652769115,27.858545312617334],[113.08363207510325,27.858498612679195],[113.0837054279247,27.858446036195964],[113.0837221962065,27.858401932004742],[113.08366919841289,27.858057418205593],[113.08405304984642,27.85802910169529],[113.08423372301,27.85815839030295],[113.08418601181111,27.858183798761925],[113.08417766409728,27.85821415339382],[113.08416429167247,27.858249727081596],[113.08413287434294,27.858281163828185],[113.0841056733994,27.858332403846678],[113.08408174587275,27.858399798204896],[113.08407421577257,27.85847974896145],[113.0840847885781,27.85851804692632],[113.08408418600902,27.85854625130947],[113.08411522542329,27.85860375302473],[113.0841098790062,27.85865340387687],[113.08354489493779,27.858874751029173]]]},
{"type":"Polygon","coordinates":[[[113.08948355264353,27.858810245909897],[113.08967663564117,27.85869192638632],[113.08976628539769,27.858787178820158],[113.08992744356206,27.85895386884362],[113.09008860120237,27.859120558679823],[113.08955269874964,27.85930031421405],[113.08951573913284,27.859310506534577],[113.08901679356698,27.859480067612797],[113.0888186804192,27.859389496894718],[113.08871225543778,27.85925847596705],[113.08948355264353,27.858810245909897]]]},
{"type":"Polygon","coordinates":[[[113.06660309893891,27.866793289468895],[113.06639829588829,27.866813009401596],[113.06601508951522,27.86684211512413],[113.06551704105155,27.866871067012482],[113.06500816483498,27.8668945803152],[113.06506710588951,27.86679628072784],[113.06516327383476,27.866581225353816],[113.0652023310059,27.866373651041652],[113.06522650022593,27.865887450956468],[113.06536084921264,27.86651752169813],[113.06541710760956,27.86666035188399],[113.06568946077967,27.866759319059813],[113.0658710671269,27.866693714491397],[113.06606669282833,27.86656772854196],[113.06633967125876,27.86635854256585],[113.06662443247274,27.866278162297366],[113.06669246242441,27.866379243791176],[113.06665381702403,27.866444059272812],[113.06662961842095,27.86650736638422],[113.06660609808088,27.866621262041516],[113.06659874133318,27.866689116212708],[113.0665964451241,27.866742854476644],[113.06660309893891,27.866793289468895]]]},
{"type":"Polygon","coordinates":[[[113.06775850548931,27.866664397391443],[113.06771351501347,27.86666999083424],[113.06763148204183,27.86656184926829],[113.0674559328552,27.866404077689396],[113.0677274493049,27.866381729321738],[113.06816768015806,27.86632656525076],[113.0681550253101,27.866352653303732],[113.06802463209262,27.86639605444198],[113.06792361747186,27.866460913524875],[113.06786309990824,27.866515954706635],[113.06781189628475,27.866591951093174],[113.06780071931479,27.866659482658747],[113.06775850548931,27.866664397391443]]]},
{"type":"Polygon","coordinates":[[[113.06830975779917,27.865809144880306],[113.06829654364019,27.86595654680736],[113.06775903130453,27.86584060043406],[113.06775938189408,27.865799634836232],[113.06755866256789,27.86572125248663],[113.06740649830144,27.86576062499492],[113.06733591903891,27.86572411816616],[113.06728070224517,27.865720268135796],[113.06725270893227,27.865730569180073],[113.06727375465783,27.86537920883181],[113.0675145042648,27.865173034553884],[113.06785990337103,27.865302903008377],[113.06780579213698,27.865333734059487],[113.06784745343062,27.865535946406588],[113.06811333241431,27.86552703346001],[113.06811524717989,27.865399462154752],[113.06839341107003,27.865503583913],[113.06814722723604,27.86553731429611],[113.06812080212569,27.86573686848982],[113.06812404498079,27.865757885548767],[113.06821616302346,27.865770719891245],[113.0683172273775,27.865759423444175],[113.06830975779917,27.865809144880306]]]},
{"type":"Polygon","coordinates":[[[113.06948951993596,27.865959922890454],[113.06945842136169,27.86602103736555],[113.06943359450155,27.86606966274564],[113.06940879984856,27.866116892450798],[113.06937971601563,27.866171301834044],[113.06934370439828,27.866228940782904],[113.06932027916365,27.866275122192704],[113.06929293166695,27.8663229707823],[113.06925770772253,27.866396071739715],[113.0692304191609,27.866442363310806],[113.06920261150276,27.86649652500497],[113.06913988579734,27.866503733480045],[113.0690211836214,27.866283009259977],[113.0690593127913,27.86620488852391],[113.06907779205706,27.866069294600624],[113.06909687059905,27.866019090231426],[113.06911759725402,27.866041805234868],[113.06914982612581,27.866026904404368],[113.06921280958053,27.865967754780442],[113.06927008380919,27.86591074299198],[113.06931509380466,27.8658577810413],[113.06936891032765,27.865871530075502],[113.0694061988019,27.865885470750946],[113.06947754974316,27.865912442425536],[113.06950991597097,27.86592578681749],[113.06948951993596,27.865959922890454]]]},
{"type":"Polygon","coordinates":[[[113.08481744682503,27.860373289086404],[113.08471595187748,27.86034451827917],[113.0846008886822,27.860383803394985],[113.08452698551271,27.86047470458777],[113.08449383527305,27.860515479753065],[113.08421574204073,27.86065861249406],[113.08407970048262,27.860716398045582],[113.08322263526968,27.861009007422815],[113.08306639899554,27.86094010175345],[113.0832354528247,27.860766762475684],[113.08342244822748,27.860592440460653],[113.08351644318351,27.860479027808694],[113.08361043793462,27.860365615988428],[113.08366187699035,27.860312358905585],[113.08371375855343,27.86027396327016],[113.08378434480964,27.860230938423207],[113.08411022378313,27.860073616297093],[113.08443610285465,27.85991629247947],[113.0846921488127,27.859773705933996],[113.08479713631012,27.85971042701318],[113.08479623116558,27.859818188000244],[113.08484421749945,27.86011655947025],[113.08484977777931,27.860150932406597],[113.08491896963052,27.860339636488398],[113.08493498429097,27.86038331042624],[113.08489770309492,27.860396038493665],[113.08481744682503,27.860373289086404]]]},
{"type":"Polygon","coordinates":[[[113.08458878430679,27.858449095598385],[113.08444671754948,27.858536797781053],[113.0841098790062,27.85865340387687],[113.08411522542329,27.85860375302473],[113.08408418600902,27.85854625130947],[113.0840847885781,27.85851804692632],[113.08407421577257,27.85847974896145],[113.08408174587275,27.858399798204896],[113.0841056733994,27.858332403846678],[113.08413287434294,27.858281163828185],[113.08416429167247,27.858249727081596],[113.08417766409728,27.85821415339382],[113.08418601181111,27.858183798761925],[113.08423372301,27.85815839030295],[113.08405304984642,27.85802910169529],[113.08405028560108,27.85799102160079],[113.08451859205395,27.85794233877593],[113.08461300488504,27.857990745955057],[113.08466193945101,27.858092825505896],[113.08468709149521,27.85821741807856],[113.08470364883247,27.858414965898252],[113.08458878430679,27.858449095598385],[113.08453740771382,27.858283845407932],[113.08438855630604,27.858288284974368],[113.08436829567107,27.858319963657788],[113.08438588405566,27.85840187046244],[113.08442106325633,27.858487590831036],[113.08443477329232,27.858510064821772],[113.08458878430679,27.858449095598385]]]},
{"type":"Polygon","coordinates":[[[113.08901679356698,27.859480067612797],[113.08671179863164,27.860249886940892],[113.08824908899284,27.859527766077665],[113.08832105066162,27.859472494419162],[113.08871225543778,27.85925847596705],[113.0888186804192,27.859389496894718],[113.08901679356698,27.859480067612797]]]},
{"type":"Polygon","coordinates":[[[113.08222868433583,27.85944636996403],[113.0823258407138,27.859446429821727],[113.08260446048583,27.85942034177061],[113.08267695375655,27.85961145190877],[113.08251993302451,27.859666369610416],[113.08246183121398,27.859682290810863],[113.08241594886816,27.859672567183765],[113.08234487289566,27.859691506017025],[113.08229883088003,27.85966469854026],[113.08222273125466,27.859681719842182],[113.08215650343995,27.859689174506066],[113.08211370155088,27.85957193532101],[113.08216431393109,27.85955996713244],[113.08219888414528,27.85952581238595],[113.08224371983324,27.85948151616108],[113.08222868433583,27.85944636996403]]]},
{"type":"Polygon","coordinates":[[[113.08427294489046,27.858796186158738],[113.08428096156538,27.85897254312539],[113.08401757769046,27.859038798846264],[113.08386108860319,27.858780100775874],[113.08422277681325,27.85864083874792],[113.08427294489046,27.858796186158738]]]},
{"type":"Polygon","coordinates":[[[113.07342085484882,27.860422866523137],[113.07328411960896,27.860374072680145],[113.07311535394602,27.860383127772483],[113.07308858844598,27.860477510151984],[113.0731016460477,27.860360653615416],[113.07327041168406,27.860351597636733],[113.07342085484882,27.860422866523137]]]},
{"type":"Polygon","coordinates":[[[113.08453740771382,27.858283845407932],[113.08438855630604,27.858288284974368],[113.08436829567107,27.858319963657788],[113.08437484629867,27.858265811881488],[113.08453740771382,27.858283845407932]]]},
{"type":"Polygon","coordinates":[[[113.06839341107003,27.865503583913],[113.0692865084134,27.86585041020271],[113.06839757369427,27.865520345528612],[113.068160934708,27.865559789822235],[113.06812080212569,27.86573686848982],[113.06814722723604,27.86553731429611],[113.06839341107003,27.865503583913]]]},
{"type":"Polygon","coordinates":[[[113.08222868433583,27.85944636996403],[113.08215888217697,27.859415345717267],[113.0818800480438,27.85944614065498],[113.08214517250144,27.859392872413995],[113.08222589183991,27.859419672447693],[113.08222868433583,27.85944636996403]]]},
{"type":"Polygon","coordinates":[[[113.0604502546442,27.861959744059682],[113.06044623707515,27.861934441866065],[113.06055147280605,27.861903667746283],[113.06055421267882,27.861862030898056],[113.06055471276929,27.86182522875405],[113.06054213065296,27.861771973973447],[113.06054371109882,27.861742343591953],[113.06051973659247,27.861689196192465],[113.06051343813098,27.861640175473415],[113.06053371554276,27.861612837998507],[113.06056213065389,27.861593128196212],[113.06122420487863,27.86158199948757],[113.06131359943598,27.8615994442173],[113.061400608707,27.861717699489645],[113.0613930029284,27.8618024665393],[113.06157493684958,27.861969841031918],[113.06175163878659,27.8620123376745],[113.06187376931999,27.862078873364762],[113.06177940080816,27.862225844438953],[113.0617155036997,27.862280654226183],[113.06161012572113,27.862310255250865],[113.06153716083806,27.862343034525004],[113.0614647278156,27.86238313337313],[113.06142766346507,27.86241438470556],[113.06144018691067,27.86234864130882],[113.06146790104137,27.86223941479773],[113.0614828441473,27.86217800003649],[113.06140936574857,27.862169159037368],[113.06138814728274,27.86216573743358],[113.0613649849284,27.862050436815398],[113.06119370372424,27.86196469688841],[113.0604502546442,27.861959744059682]]]},
{"type":"Polygon","coordinates":[[[113.05938502739183,27.86082617399444],[113.05980139895236,27.86084368521876],[113.05985668192481,27.86096626113882],[113.05986357883545,27.861157089745188],[113.05994340408955,27.861281110580915],[113.06011853270785,27.861349131458695],[113.0601214266304,27.86138721997235],[113.06011847975415,27.861441654781796],[113.06006525411632,27.861457488707995],[113.06003882061466,27.8614310872222],[113.06001933309103,27.861399810920936],[113.05998328812478,27.861365976500625],[113.05995343909125,27.8613459491569],[113.05991755387227,27.861337141596636],[113.05988373857122,27.861335539608657],[113.05985077423485,27.86133297793219],[113.05979747003437,27.861323798967224],[113.05975521601141,27.861316517987404],[113.05968360974802,27.861321060290752],[113.05963922839466,27.86133205024586],[113.05960841068278,27.861334862914024],[113.05955334271464,27.86133159374281],[113.05925680478836,27.861236951433323],[113.05940451341583,27.8611577138004],[113.05941678656129,27.86099654245338],[113.05938502739183,27.86082617399444]]]},
{"type":"Polygon","coordinates":[[[113.06138814728274,27.86216573743358],[113.06134020783689,27.862160504404017],[113.06127585039762,27.862149707819665],[113.06120433837279,27.862145611849876],[113.06108102937905,27.862139990259084],[113.06107291006415,27.862173808008865],[113.06106451457346,27.862198438280736],[113.06103150193945,27.862270949409734],[113.06102440094455,27.86230288102452],[113.06091284351754,27.862287628531696],[113.06060189840812,27.862432541197855],[113.0602405629282,27.86232187930975],[113.06027237731762,27.86225016057272],[113.06031358448108,27.86217168699953],[113.06035073555877,27.862099682470014],[113.06039554448205,27.862021486053695],[113.06045332728475,27.86197994893895],[113.0604502546442,27.861959744059682],[113.06119370372424,27.86196469688841],[113.0613649849284,27.862050436815398],[113.06138814728274,27.86216573743358]]]},
{"type":"Polygon","coordinates":[[[113.05559962643719,27.86920821481308],[113.05564588057413,27.86930274509957],[113.05558956457259,27.869316496051283],[113.0553961833903,27.869338388248163],[113.05528621507005,27.869321465484944],[113.05524456107352,27.869291866594775],[113.05535871384025,27.869160792166923],[113.05548025065495,27.869146837432528],[113.05559962643719,27.86920821481308]]]},
{"type":"Polygon","coordinates":[[[113.06934370439828,27.866228940782904],[113.06932027916365,27.866275122192704],[113.06929293166695,27.8663229707823],[113.06925770772253,27.866396071739715],[113.0692304191609,27.866442363310806],[113.06920261150276,27.86649652500497],[113.06913988579734,27.866503733480045],[113.0690211836214,27.866283009259977],[113.0690593127913,27.86620488852391],[113.06907779205706,27.866069294600624],[113.06909687059905,27.866019090231426],[113.06911759725402,27.866041805234868],[113.06915440631325,27.866065037527598],[113.06922187861079,27.86610925624423],[113.06928670454732,27.866151391663124],[113.06932124101724,27.8661734779712],[113.06934370439828,27.866228940782904]]]},
{"type":"Polygon","coordinates":[[[113.07084406373129,27.861479806410017],[113.07035292340153,27.861563365277004],[113.07016883698391,27.861434797282218],[113.07029031670771,27.861286530387435],[113.07037496570663,27.861195510059435],[113.07045363600787,27.861106938885982],[113.07084406373129,27.861479806410017]]]},
{"type":"Polygon","coordinates":[[[113.07126180357034,27.861366703217048],[113.07084406373129,27.861479806410017],[113.07045363600787,27.861106938885982],[113.07054643852223,27.861002459350843],[113.070578171968,27.860970812269034],[113.07063601928759,27.860918225041726],[113.07075810813295,27.86087279014681],[113.0708209958463,27.860853335681043],[113.07085386259395,27.86089188580375],[113.0709115744712,27.860949219020785],[113.07097939472773,27.860986167416414],[113.0710335475702,27.860971172841374],[113.0711105019006,27.86118882526731],[113.07126180357034,27.861366703217048]]]},
{"type":"Polygon","coordinates":[[[113.07485096801989,27.861453329769425],[113.07485934472136,27.86142145284344],[113.07488365780713,27.861373254256947],[113.07489828761868,27.861254687353252],[113.07491685722657,27.86112254439146],[113.07493163951747,27.8609947387429],[113.07494463097905,27.860877078498444],[113.07497938672309,27.860870174221766],[113.07501475988362,27.860872821526463],[113.07509829726298,27.86091584125999],[113.07517871315287,27.86096275788997],[113.07518485103977,27.860997024047062],[113.07519373365687,27.861072505839033],[113.07520288477707,27.86111695412709],[113.0752225911884,27.861148194636428],[113.07525031531812,27.861186608200892],[113.0752890026246,27.861227516180364],[113.07531059760271,27.861278483229434],[113.07534422246034,27.861338687662137],[113.07535347275831,27.861404477379338],[113.07535765184826,27.861507816541113],[113.07505729144563,27.861509349814593],[113.07487729063429,27.861486644920966],[113.07485096801989,27.861453329769425]]]},
{"type":"Polygon","coordinates":[[[113.06328214392869,27.8699005962846],[113.06339382805116,27.870005491272085],[113.06346069485343,27.87013039479241],[113.06351363918822,27.870176295185775],[113.06361227206305,27.870201742563534],[113.06367042253748,27.870223164089186],[113.06387297223448,27.870392920595574],[113.06385853912867,27.87045041212536],[113.06386134012764,27.870489912034813],[113.06349670091943,27.870489914992714],[113.06314490130995,27.870484574065397],[113.0631143179469,27.870090291864063],[113.06318583574905,27.869840068834595],[113.06328214392869,27.8699005962846]]]},
{"type":"Polygon","coordinates":[[[113.08948355264353,27.858810245909897],[113.08967663564117,27.85869192638632],[113.08976628539769,27.858787178820158],[113.08992744356206,27.85895386884362],[113.09008860120237,27.859120558679823],[113.08955269874964,27.85930031421405],[113.08951573913284,27.859310506534577],[113.08950549140775,27.859166850515226],[113.08949142574951,27.859089600079532],[113.08948839455685,27.858961495392993],[113.08959166229761,27.858906169812446],[113.08955379365656,27.858839265319077],[113.08948355264353,27.858810245909897]]]},
{"type":"Polygon","coordinates":[[[113.06157204066241,27.879914407141314],[113.06143821281204,27.880058483917782],[113.06135811874618,27.880014798956],[113.06149918231355,27.879859701899164],[113.06157204066241,27.879914407141314]]]},
{"type":"Polygon","coordinates":[[[113.07032844361007,27.883544987564996],[113.0703655640661,27.883537582621177],[113.07043917937393,27.88372409337248],[113.070545903373,27.883942909167565],[113.07062768774855,27.884057719066632],[113.07068241161289,27.884127901100918],[113.07056884305425,27.884147613579852],[113.07057289934922,27.88408596217319],[113.07046893670629,27.883880891058343],[113.06982566392051,27.883691042416558],[113.06975739058626,27.8836452854696],[113.06974121677031,27.883608701994813],[113.06983624279643,27.883613502839033],[113.0698925934632,27.883660664524523],[113.06994866135935,27.883685780686502],[113.07002477471498,27.883708203282918],[113.07016876990274,27.88373332142988],[113.07014708961897,27.883687028930527],[113.07010037972769,27.883553707001294],[113.07012710223896,27.883569644396406],[113.0702009772056,27.883720124810505],[113.07027139300973,27.88376593478929],[113.07029935308661,27.88378893300423],[113.07036263462783,27.883801036613],[113.07041577589297,27.883784198590913],[113.07041273588165,27.88375775826252],[113.07038606978674,27.88368502768971],[113.07032844361007,27.883544987564996]]]},
{"type":"Polygon","coordinates":[[[113.06255370273078,27.875742334145038],[113.06240498899186,27.875841055174035],[113.06233248414448,27.875807346079814],[113.06249537723264,27.87575225018311],[113.06255370273078,27.875742334145038]]]},
{"type":"Polygon","coordinates":[[[113.06323363202509,27.875617991353792],[113.06319181516317,27.875643023560283],[113.06312072441538,27.875628225310518],[113.06293120585678,27.875653089366136],[113.06281807105401,27.875694313395968],[113.06284545835692,27.875648000454092],[113.06289937024323,27.87561620196919],[113.06296396449457,27.875577530924037],[113.06289975270818,27.87563795129974],[113.06302413949192,27.87560873138197],[113.06312014587371,27.875603650396624],[113.06323363202509,27.875617991353792]]]},
{"type":"MultiPolygon","coordinates":[[[[113.06227400317722,27.87600579817922],[113.0622435621037,27.875837422838682],[113.06233248414448,27.875807346079814],[113.06240498899186,27.875841055174035],[113.06244324961253,27.875860658282622],[113.06229330436119,27.875947654232622],[113.06227400317722,27.87600579817922]]],[[[113.06227400317722,27.87600579817922],[113.06247424980951,27.875875333191672],[113.06252332312816,27.875895347260702],[113.06207531865621,27.876148538676944],[113.06212252079168,27.87608436126123],[113.06227400317722,27.87600579817922]]]]},
{"type":"MultiPolygon","coordinates":[[[[113.06255822325028,27.875769354968487],[113.06255370273078,27.875742334145038],[113.06261596336148,27.87573838568512],[113.06255822325028,27.875769354968487]]],[[[113.06281807105401,27.875694313395968],[113.06278954694577,27.875704707309566],[113.06270192620688,27.875795963956094],[113.0625764421472,27.875869450982535],[113.06256518368268,27.87580759554075],[113.06259619129165,27.8758012410848],[113.06269186115613,27.875726162714933],[113.0627261588981,27.87571046364589],[113.06284545835692,27.875648000454092],[113.06281807105401,27.875694313395968]]]]},
{"type":"Polygon","coordinates":[[[113.06931572071227,27.881407520806565],[113.06928676080874,27.88145844516739],[113.06933410521133,27.881568767096656],[113.06918777748731,27.8816227438959],[113.06917159440249,27.881548585114974],[113.06906416141025,27.88141587066619],[113.06899994525406,27.881385350204987],[113.06903296899021,27.881336821927892],[113.06921817756361,27.881396509140746],[113.06931243745642,27.88135683265526],[113.06931572071227,27.881407520806565]]]},
{"type":"MultiPolygon","coordinates":[[[[113.06634278629441,27.871934225878046],[113.06605826340805,27.872139206968342],[113.06604354350326,27.872106401878558],[113.06632186711514,27.871904182345002],[113.06634278629441,27.871934225878046]]],[[[113.06701514855163,27.8725611743082],[113.0664636756368,27.872405857330964],[113.06645781451722,27.872377941457035],[113.06701514855163,27.8725611743082]]],[[[113.0662175259315,27.87248558522781],[113.06605266120759,27.87295427745888],[113.0661994958675,27.87245395421317],[113.0662175259315,27.87248558522781]]]]},
{"type":"Polygon","coordinates":[[[113.06954894275496,27.872582412770917],[113.06915677624455,27.87250151355958],[113.06912208996594,27.87269901786539],[113.0691001824757,27.872689456098488],[113.06913874532009,27.8724698820063],[113.06954208663045,27.8725530871969],[113.06954894275496,27.872582412770917]]]},
{"type":"Polygon","coordinates":[[[113.06912968498641,27.873014520345222],[113.0688033419188,27.872945020368157],[113.0687436957148,27.873138462501753],[113.06858395517847,27.873114979106614],[113.06852809360662,27.873315099484696],[113.06850307490967,27.873308502376165],[113.0685659243266,27.873083347482776],[113.0687256648045,27.87310683179996],[113.06878531102895,27.87291338877137],[113.06913535877219,27.87298793756309],[113.06912968498641,27.873014520345222]]]},
{"type":"Polygon","coordinates":[[[113.06584879648221,27.871418652899173],[113.06546789512132,27.871146593269582],[113.06514585243116,27.871405062074146],[113.06511805093201,27.871381705703435],[113.06544986549554,27.8711149612593],[113.06584879648221,27.871418652899173]]]},
{"type":"MultiPolygon","coordinates":[[[[113.06669542196681,27.878133427766738],[113.06631592890166,27.878298684923383],[113.06630296819317,27.878265490255473],[113.06667527236075,27.87810289954209],[113.06669542196681,27.878133427766738]]],[[[113.06746802345894,27.879123959926588],[113.06738531609105,27.879098263780396],[113.06736728465475,27.879066632011284],[113.06744999198654,27.879092329069987],[113.06784678584802,27.878998288360588],[113.06788233878436,27.878940630652018],[113.06845468620944,27.878521731645726],[113.06851020678374,27.87816837319872],[113.06879688493264,27.878268143331233],[113.06901456936326,27.878163684892336],[113.06927849812622,27.87787787835118],[113.06927510903019,27.877932706434517],[113.06903260115105,27.878195315555807],[113.06881491667266,27.87829977402159],[113.06852823842368,27.8782000039246],[113.06847271788841,27.878553362378295],[113.06790037035265,27.87897226235746],[113.06786481742259,27.879029919168136],[113.06746802345894,27.879123959926588]]]]},
{"type":"Polygon","coordinates":[[[113.07147713185793,27.878554769016844],[113.0716070727999,27.87861932596014],[113.07179285797919,27.878694868182645],[113.07180719251146,27.87871910347768],[113.07162510643819,27.878650956309365],[113.0714971138743,27.87859833031162],[113.07146374940973,27.87860369548558],[113.07143659065453,27.87862533152498],[113.0714023728345,27.878691338396745],[113.07137703790015,27.87872641318938],[113.07137218955238,27.878697318697224],[113.07138434027858,27.878659707124545],[113.07141855809118,27.878593701159243],[113.07144571684947,27.878572064220933],[113.07147713185793,27.878554769016844]]]},
{"type":"Polygon","coordinates":[[[113.07557156408197,27.869087690090005],[113.0756602776598,27.869076801793817],[113.07569200352489,27.869072004751683],[113.07572249335203,27.869090819429434],[113.07567830998067,27.869108431639606],[113.07559078141615,27.869122655643224],[113.07552136154702,27.869134384255617],[113.07549408172031,27.869146139971605],[113.0754394482876,27.869176307301142],[113.07538872027433,27.86923202379218],[113.07537444169301,27.869296445688686],[113.07535300394363,27.869351044759977],[113.07532605792493,27.869340097622153],[113.07533598894857,27.869315243054533],[113.07535784746509,27.869263107431095],[113.07537459211206,27.869202899658568],[113.07542929885068,27.869150345405206],[113.07547604944776,27.869114510103046],[113.07550515343762,27.869102445393075],[113.07557156408197,27.869087690090005]]]},
{"type":"Polygon","coordinates":[[[113.07503680138439,27.869616828332592],[113.07502799240888,27.86957662417244],[113.07506645295925,27.869525599719186],[113.07520600137823,27.869526967773243],[113.07523759942246,27.869562115649018],[113.07508448517562,27.869557229638225],[113.07503680138439,27.869616828332592]]]},
{"type":"MultiPolygon","coordinates":[[[[113.07471002187387,27.870653273959523],[113.07468274330908,27.87062359593112],[113.07470246111185,27.870585071985623],[113.07474210521951,27.870525904933235],[113.07476506895755,27.87050855401338],[113.07481351339987,27.870539244761346],[113.07484429210359,27.870571295883742],[113.07478310225453,27.870540183976],[113.07476013851246,27.87055753489869],[113.0747204933871,27.87061670194915],[113.07471002187387,27.870653273959523]]],[[[113.07471002187387,27.870653273959523],[113.07473637749133,27.870674824017858],[113.07471510921839,27.87070032071239],[113.074664468633,27.870763065654522],[113.07464412934495,27.870730250798914],[113.07471002187387,27.870653273959523]]]]},
{"type":"MultiPolygon","coordinates":[[[[113.07239280488803,27.86946350002748],[113.07235311237737,27.86946625942247],[113.07226986655765,27.869472659939117],[113.07200607586351,27.869475847918164],[113.0718333602479,27.869485644280548],[113.07164971418068,27.869491521166125],[113.07162529201814,27.869507931456514],[113.07162058571745,27.869467207010565],[113.07181532900002,27.869454013959142],[113.07198804355102,27.86944421761129],[113.07225183416799,27.86944102966488],[113.07233508097949,27.869434629165365],[113.07238086077552,27.869433035008882],[113.07239280488803,27.86946350002748]]],[[[113.07250946604636,27.86993808408696],[113.0724780785541,27.869910734855306],[113.07251496552051,27.86990478671366],[113.07250946604636,27.86993808408696]]],[[[113.07170399449669,27.86963717878845],[113.07169771656035,27.86970543482974],[113.07168461434121,27.86976428428088],[113.07163268822569,27.869859409068663],[113.07160553946709,27.86993624100212],[113.07158234944376,27.86990422041018],[113.07161465697834,27.86982777872262],[113.07166658310116,27.869732653038948],[113.07167968430268,27.86967380448483],[113.07168596327087,27.86960554754885],[113.07170399449669,27.86963717878845]]]]},
{"type":"MultiPolygon","coordinates":[[[[113.07306539790417,27.876379216245716],[113.07308402409795,27.87640494472746],[113.0729955555955,27.876379996434988],[113.07296484420019,27.87635244070744],[113.07306539790417,27.876379216245716]]],[[[113.07265152570915,27.87623928472771],[113.07261076014677,27.876273317588858],[113.07258759426873,27.87629478312317],[113.07256442837385,27.876316249555575],[113.07253252535844,27.87634193781253],[113.07251333341328,27.876367503125852],[113.07247846897292,27.876413147864913],[113.07243914556179,27.87647240654742],[113.07239753018864,27.876540617033495],[113.07235373258874,27.876616100845364],[113.0723113275568,27.87669617598018],[113.0723022913748,27.876734063964808],[113.07228157653422,27.876703216916617],[113.07229329504588,27.876664544819434],[113.07233570007789,27.876584469689828],[113.07237949766903,27.876508986785606],[113.07242111202524,27.876440776297816],[113.07246043645713,27.876381516724713],[113.07249530089439,27.876335871989934],[113.07251449283021,27.876310307581242],[113.07254639584023,27.876284619328217],[113.07256956173165,27.876263152898673],[113.07259272761394,27.876241686464947],[113.07263349215428,27.876207653602002],[113.07267136168073,27.876189003823644],[113.07279056052991,27.876245564139502],[113.07293029066116,27.87633118258537],[113.07280859312931,27.87627719433665],[113.07268939524384,27.87622063494467],[113.07265152570915,27.87623928472771]]]]},
{"type":"MultiPolygon","coordinates":[[[[113.07180668390518,27.877165921895894],[113.07177745890338,27.877193903639935],[113.07177472628989,27.87714591442894],[113.07180668390518,27.877165921895894]]],[[[113.07180668390518,27.877165921895894],[113.0719438144379,27.877212282042915],[113.07210583431734,27.877262214895683],[113.07213491130976,27.877279713408363],[113.0721541300498,27.877307274996674],[113.07211683936335,27.877302509763805],[113.07196184693174,27.87724391324663],[113.07182829964579,27.877202097848823],[113.07180668390518,27.877165921895894]]],[[[113.07182920063788,27.877478999931405],[113.07179942224094,27.87752376466913],[113.07178653216756,27.87749412699475],[113.071823062928,27.877450226115467],[113.07182920063788,27.877478999931405]]]]},
{"type":"Polygon","coordinates":[[[113.0714493866255,27.878111304285397],[113.07141494667154,27.878106821533354],[113.07138717600466,27.878114495496572],[113.07135490713051,27.878147028683667],[113.07134332758568,27.878118277752595],[113.07136914353595,27.87808286512446],[113.07139691419584,27.878075191164672],[113.07142824145235,27.87808483677263],[113.0714493866255,27.878111304285397]]]},
{"type":"MultiPolygon","coordinates":[[[[113.07210058926294,27.877961887227706],[113.07216630522228,27.8779889433109],[113.07212250531359,27.877993356862643],[113.07210289907432,27.878019351528255],[113.0720854657157,27.878048699388746],[113.07204177251123,27.878118149073718],[113.07197104990762,27.87819217113399],[113.0719415567561,27.878255393818282],[113.071909717487,27.8782599392363],[113.0718569565261,27.878245733517293],[113.07179057269244,27.878339883808366],[113.07176132381754,27.878325011613125],[113.0717547465597,27.878303841374535],[113.07183923112015,27.878213442068077],[113.07188999378744,27.878230136469327],[113.07191787384838,27.878212607126695],[113.07195122039917,27.878159532581517],[113.07200686716642,27.878093566920217],[113.07202477367589,27.878072328675792],[113.0720627517323,27.87801458509925],[113.07207988010751,27.877984921182524],[113.07210058926294,27.877961887227706]]],[[[113.07155281917406,27.87845387805959],[113.07153850596569,27.878428581757056],[113.07159434544432,27.87836197331456],[113.07162389813337,27.87835943466791],[113.0717056946896,27.87826251885742],[113.07172795038022,27.878283920976138],[113.07164083601612,27.878390357439365],[113.07160202436218,27.878388152523662],[113.07155281917406,27.87845387805959]]]]},
{"type":"Polygon","coordinates":[[[113.0714716224168,27.879422204499267],[113.07143851607334,27.879434660005167],[113.07143803292752,27.879399990622453],[113.07146461664459,27.879385436613894],[113.07150400273068,27.879377479935414],[113.07154164274031,27.87938565755412],[113.07155554766666,27.879410499947177],[113.0715187475955,27.879408969946148],[113.0714716224168,27.879422204499267]]]},
{"type":"Polygon","coordinates":[[[113.0801726302705,27.866145230226742],[113.08007119463606,27.866143583704066],[113.07995522998343,27.86615235763289],[113.07988945068286,27.866158278373266],[113.07979876262331,27.86617317881376],[113.07967774713498,27.866208936080614],[113.07966475132532,27.866185455808896],[113.07978072954941,27.86614154947641],[113.07987141758461,27.866126649047143],[113.07993719687435,27.86612072741263],[113.08005316047897,27.866111953491387],[113.08015915163469,27.86611518961827],[113.0801726302705,27.866145230226742]]]},
{"type":"MultiPolygon","coordinates":[[[[113.07665174148151,27.864713156436366],[113.07664825253838,27.864738948453162],[113.07660928259845,27.864723993283242],[113.07659125069823,27.86469236264804],[113.07665174148151,27.864713156436366]]],[[[113.07660104538958,27.864605527593223],[113.07660178063331,27.864636172593954],[113.07652696453312,27.864697578058944],[113.07636797713567,27.864835098092787],[113.07626250782457,27.864910339132827],[113.07621409223613,27.86494173772839],[113.07617288388968,27.864964810150084],[113.07615981734347,27.865004848793067],[113.07615153517247,27.86497231251105],[113.07615277385827,27.86493220637484],[113.07619203899824,27.86490576792308],[113.07623982240926,27.86487384626701],[113.0763440749311,27.864797457465095],[113.07650911375518,27.864666143527153],[113.07657374407101,27.864614697359258],[113.07660104538958,27.864605527593223]]],[[[113.07616460415068,27.86506020840048],[113.07618264482991,27.86509223255899],[113.07618658133786,27.865180095248345],[113.0761867872526,27.86521759162504],[113.0761795649852,27.86526084738281],[113.0761641440161,27.8652170654978],[113.0761616819919,27.8651807757506],[113.07616121282899,27.8651484614379],[113.07616460415068,27.86506020840048]]]]},
{"type":"Polygon","coordinates":[[[113.06878245093374,27.874534006859694],[113.06881335094081,27.874531366910734],[113.06893108274221,27.874558474372115],[113.06906618872604,27.874592406857982],[113.06909944265644,27.87457715299719],[113.06917232983378,27.874487304986655],[113.0692361423231,27.874432014903004],[113.06933510356764,27.874371065368358],[113.06941625033647,27.874327242440827],[113.06951103079871,27.87432014285314],[113.06957189192124,27.87433809547589],[113.06959679111696,27.874365369100722],[113.06952906213044,27.874351773457146],[113.06943428265674,27.87435887306341],[113.06935313485552,27.87440269599411],[113.0692541735914,27.87446364554096],[113.06919036108421,27.87451893653475],[113.06911747390721,27.874608783651993],[113.06908422098475,27.874624037523745],[113.06894911393276,27.874590105950023],[113.06883138210014,27.874562997600954],[113.06879792151341,27.874569641891554],[113.06872178934871,27.874906842638993],[113.06878245093374,27.874534006859694]]]},
{"type":"MultiPolygon","coordinates":[[[[113.0727816049464,27.87454772939934],[113.07287013759311,27.874513802883534],[113.07295421194824,27.874485315287828],[113.07301810532738,27.874488409363536],[113.07309083696194,27.87450567868502],[113.07325525547269,27.874521176661535],[113.0733441989865,27.874541087611163],[113.07337125837122,27.874564134191665],[113.07327328895401,27.8745528068089],[113.07310886937707,27.87453730884592],[113.07303613771838,27.874520039533447],[113.07297224431227,27.874516946367926],[113.07288817095986,27.87454543307858],[113.07279844477776,27.87458417807982],[113.0727816049464,27.87454772939934]]],[[[113.07312918733727,27.874917522577253],[113.07306880210928,27.874972737369895],[113.07303838142502,27.874985862821546],[113.07301369576652,27.875065304791615],[113.07299233526837,27.875150861561437],[113.07297915387578,27.8751093962486],[113.07299566330434,27.875033673716942],[113.07302034896036,27.874954232652154],[113.07305076963769,27.87494110720427],[113.07311115384121,27.874885892412234],[113.07312918733727,27.874917522577253]]]]},
{"type":"MultiPolygon","coordinates":[[[[113.06548183513675,27.86964828920317],[113.0654457823403,27.869678399764595],[113.06543571780205,27.86973606094451],[113.06541709964347,27.869773040784874],[113.06541768840664,27.869704428929545],[113.06542775294322,27.869646768653116],[113.0654638621468,27.869620615141507],[113.06548183513675,27.86964828920317]]],[[[113.06542641327064,27.869794607033096],[113.06542494364126,27.869878192293747],[113.06538051341974,27.869931090941993],[113.06530597072914,27.869991662720906],[113.06527894442365,27.869967341646213],[113.06536248400232,27.86989945982256],[113.06540691320373,27.869846561172917],[113.06542641327064,27.869794607033096]]]]},
{"type":"Polygon","coordinates":[[[113.07418014463873,27.86998006358677],[113.07392930251811,27.87000129558986],[113.07391933596269,27.870348989567443],[113.07379107767626,27.870370752069583],[113.07368072378463,27.870019515960276],[113.07418042669876,27.869946882702166],[113.07418014463873,27.86998006358677]]]},
{"type":"MultiPolygon","coordinates":[[[[113.07670746159684,27.86541720813111],[113.07621804087461,27.86548145970315],[113.0761670083138,27.865560292841394],[113.07615730950242,27.8655252693026],[113.07620000794795,27.865449829915406],[113.07668501370651,27.86538272910005],[113.07670746159684,27.86541720813111]]],[[[113.07621394255736,27.865689120096803],[113.0762131209336,27.865869691332193],[113.07619591062227,27.8656574894132],[113.07621394255736,27.865689120096803]]]]},
{"type":"MultiPolygon","coordinates":[[[[113.06732382397021,27.866753704383555],[113.06775654215855,27.866695323716506],[113.06840320490961,27.86691941585434],[113.06842477334617,27.86694901050753],[113.06777457279445,27.8667269545483],[113.06735225287265,27.866781615848602],[113.06732382397021,27.866753704383555]]],[[[113.06861279616561,27.867109039705102],[113.06850345826004,27.867063866613947],[113.06848542735676,27.86703223587248],[113.06861279616561,27.867109039705102]]],[[[113.06826851798361,27.867311584806412],[113.06815115330868,27.867451849504988],[113.06813804170109,27.86741868282622],[113.06825048812597,27.867279954042868],[113.06826004609553,27.867232285970733],[113.06826851798361,27.867311584806412]]]]},
{"type":"Polygon","coordinates":[[[113.06944257964297,27.87998810778911],[113.06942866643568,27.880019522793404],[113.06928049102227,27.880157317924652],[113.0691336881907,27.880201882142355],[113.06908408458288,27.88029611545811],[113.0689743450568,27.880354174850172],[113.06896589102278,27.880470337072833],[113.06895631193242,27.880322544173737],[113.06906605143527,27.88026448479523],[113.06911565606637,27.880170250590158],[113.06926245784628,27.880125686383746],[113.06939698934369,27.87998780008402],[113.06944257964297,27.87998810778911]]]},
{"type":"Polygon","coordinates":[[[113.07313479093966,27.877203690240705],[113.07316191820976,27.8772269439515],[113.07305315259508,27.877228475824335],[113.07304109154106,27.877329708792022],[113.07303511875917,27.877196845651135],[113.07313479093966,27.877203690240705]]]},
{"type":"Polygon","coordinates":[[[113.06608663824937,27.86922877323468],[113.06589249420105,27.869321252522617],[113.06582639133399,27.869393722881387],[113.06579612533534,27.86942997691645],[113.06575634348484,27.869476045056782],[113.0657276300529,27.869460084343892],[113.065778095874,27.869398345848175],[113.0658083618694,27.869362091816836],[113.0658744647361,27.86928962056394],[113.06606492516201,27.869205178564833],[113.06608663824937,27.86922877323468]]]},
{"type":"Polygon","coordinates":[[[113.06894950870735,27.873707884700938],[113.06866062891972,27.87364786439637],[113.06860677081262,27.87381067936579],[113.06858005706223,27.873805297070405],[113.06864259796178,27.87361623278229],[113.06895681248265,27.87368151685924],[113.06894950870735,27.873707884700938]]]},
{"type":"Polygon","coordinates":[[[113.0688527363111,27.87412468402798],[113.06884316389139,27.87415356664089],[113.0682100560462,27.87402616793157],[113.0681353072766,27.874168449153405],[113.06810799898315,27.87415529108727],[113.06819202515398,27.873994537164197],[113.06825535592004,27.874006723194704],[113.06843956514544,27.874043097674676],[113.06876175369445,27.874106718067534],[113.0688527363111,27.87412468402798]]]},
{"type":"Polygon","coordinates":[[[113.06505897388114,27.87831168965171],[113.065107391027,27.8780893740443],[113.06523546355385,27.878107760835597],[113.06523020239484,27.878136047983055],[113.06512542265976,27.878121006100383],[113.06505897388114,27.87831168965171]]]},
{"type":"Polygon","coordinates":[[[113.07169402047678,27.863881423798816],[113.07148513812834,27.86346371924491],[113.07093373166322,27.863276837208186],[113.07267411998099,27.86332826276314],[113.0730476965904,27.86329355948088],[113.07269472677486,27.863886098825937],[113.07210665894647,27.86369987545273],[113.07169402047678,27.863881423798816]]]},
{"type":"Polygon","coordinates":[[[113.07817351283097,27.867466986486473],[113.07800491767837,27.86720693072693],[113.0778391246626,27.86714763439519],[113.07778587586343,27.866902685617085],[113.07788365311288,27.866875638160085],[113.07788060780321,27.86682698185747],[113.07794596519197,27.86678244177885],[113.07802768557431,27.866797767186473],[113.07819800523473,27.86663969941134],[113.07836994771543,27.866666817260626],[113.07834240021667,27.866715836682555],[113.07869760636332,27.866901062335092],[113.07884565820032,27.867161862541977],[113.07893551567675,27.867157044234936],[113.07904432821354,27.867273664850988],[113.07887603061484,27.86736925970743],[113.078849294657,27.86726193065055],[113.07868876487804,27.867240892755806],[113.07856084465283,27.86735909567629],[113.07831938901451,27.867357403786755],[113.07817351283097,27.867466986486473]]]},
{"type":"Polygon","coordinates":[[[113.07873442339077,27.865938387528757],[113.07883174794323,27.86640621560021],[113.07839793230403,27.866424287409373],[113.07780678136095,27.86617510893453],[113.07845086510798,27.866011731343725],[113.07865733109735,27.865749876881473],[113.07873442339077,27.865938387528757]]]},
{"type":"Polygon","coordinates":[[[113.08015915163469,27.86611518961827],[113.08009703632415,27.865939607005032],[113.0798625453781,27.865275306619797],[113.07967362310082,27.865335598819108],[113.07947120459349,27.86515875933958],[113.07960504851205,27.864854907405757],[113.07996542619921,27.864786089809307],[113.0802959870775,27.864594321671014],[113.08093406244899,27.864568625074185],[113.08117123330952,27.864728032836425],[113.08131634318602,27.865773870385347],[113.08124304514872,27.865822109250914],[113.08122454828192,27.865846025657085],[113.08122798753726,27.865909303035806],[113.08128980211478,27.866002179183965],[113.08104212403148,27.866209940586884],[113.08097674054972,27.86641649361068],[113.0808726427258,27.866547896916472],[113.08078783278532,27.86662842322899],[113.08069892289834,27.866737570826835],[113.0806082857951,27.86671330782355],[113.0803945255768,27.86670754255134],[113.08034663240906,27.86683740996821],[113.08034791230756,27.86686824807685],[113.08034963898504,27.86692746352524],[113.08037188943936,27.867025549722754],[113.08044986029158,27.86705704444695],[113.08052382093057,27.867075149932806],[113.08047656605049,27.867262067226708],[113.08032298766737,27.86730888422673],[113.08024557843896,27.867414673962813],[113.08032080831835,27.867456004721323],[113.08048093458383,27.867313118948214],[113.08042252340776,27.867442374860047],[113.08038857019167,27.867524902956433],[113.08038608721664,27.867701260204978],[113.08000336829339,27.867698590454616],[113.08003952225593,27.86791105097569],[113.07980829873755,27.8679421967722],[113.07952413898695,27.867708548681467],[113.07928296232461,27.867447335964712],[113.07912829795627,27.867241929699155],[113.07897620183452,27.866858099418216],[113.07896506881993,27.866763582846172],[113.07889552510915,27.866411833498326],[113.07879179067909,27.865896323763295],[113.07868848223161,27.865697299244225],[113.0783944065034,27.86543129493674],[113.07805987652767,27.865140134527554],[113.07744857494308,27.864591023172075],[113.07735419300576,27.86443248042389],[113.07728778149186,27.864278805968024],[113.07710460413784,27.863883812453732],[113.07700716455119,27.863673695854793],[113.07722282790316,27.86358805322124],[113.0775542902289,27.863592826629485],[113.07825358691936,27.863602894746215],[113.07953191056728,27.86371717258385],[113.0794585776372,27.86441832483958],[113.07919138333226,27.86465252784964],[113.07896185250524,27.86485761491163],[113.07857468649348,27.86498013747246],[113.07837159321119,27.86516716513893],[113.07857206057957,27.8652905803263],[113.07879801934453,27.865429689003825],[113.07934362885757,27.86521341225443],[113.0795895154819,27.8654046344377],[113.07962019296183,27.865856519918005],[113.0795006416128,27.865973890840323],[113.07956725049357,27.866113104999517],[113.07966475132532,27.866185455808896],[113.07967774713498,27.866208936080614],[113.07969436126807,27.866241947340445],[113.07971904301759,27.86628940353409],[113.07978802792164,27.866413751475953],[113.07980473355045,27.866445915152145],[113.07982341838046,27.866481888092046],[113.079841545802,27.866513414286114],[113.0798522987248,27.86654327612558],[113.0798928583356,27.86662114715202],[113.07995082332876,27.86661301232826],[113.07996888249004,27.866640966667422],[113.08009752853609,27.86664272708963],[113.08014032428943,27.866635333776774],[113.08012225539939,27.86660359686814],[113.08011677585715,27.866563055167834],[113.08013284571784,27.866497144088868],[113.08013170853211,27.86646684741938],[113.08016320891092,27.866403514313003],[113.08018080973311,27.866308878145986],[113.0801726302705,27.866145230226742],[113.08015915163469,27.86611518961827]]]},
{"type":"Polygon","coordinates":[[[113.0741365414886,27.868068668180534],[113.07415787146974,27.86811470151966],[113.07423553601406,27.86811341552211],[113.07423390499937,27.868305309810136],[113.07411223943703,27.868401767579],[113.07415448815408,27.86860278743107],[113.07410194123939,27.86861622661027],[113.07370433743122,27.868711481764542],[113.07350330394661,27.86852445308107],[113.073357929355,27.868489241506644],[113.07318850011839,27.8684563116107],[113.07335254708987,27.868230729749264],[113.07351191991813,27.868007156417306],[113.07404974513972,27.867881344203663],[113.0741365414886,27.868068668180534]]]},
{"type":"Polygon","coordinates":[[[113.07099947720452,27.86369262211228],[113.07112978878288,27.86420603150413],[113.07116054162486,27.864410232221523],[113.07139363413074,27.864555830820954],[113.07143331028372,27.864822665585038],[113.07108643832365,27.865035320955087],[113.07078993409523,27.865459349133115],[113.07078439986256,27.864862514427834],[113.07077524018426,27.863683469885757],[113.07099947720452,27.86369262211228]]]},
{"type":"Polygon","coordinates":[[[113.0749122375511,27.864778210213178],[113.07462462967572,27.864648501609487],[113.07451756193335,27.864491696370493],[113.0744322230509,27.864481050231085],[113.0743953459647,27.86447172452342],[113.07429614344339,27.864458162807704],[113.07421549062047,27.86443803753656],[113.07433260474573,27.86458524207241],[113.0742946762198,27.864754606460785],[113.07422093892754,27.86486978891802],[113.07401660607519,27.864766909017096],[113.07388430143783,27.864825794872107],[113.07398397730302,27.864989022393065],[113.07388691413519,27.865087066397408],[113.07373362897351,27.864948279951385],[113.07360900197425,27.864881663851428],[113.0734692933397,27.864871308812948],[113.07340017301132,27.86487449796615],[113.07321807409689,27.86492606920101],[113.07310118242171,27.865008932326393],[113.07305626470912,27.86515618674767],[113.07308621693187,27.865270098327965],[113.07310687681961,27.865591059517342],[113.07282385732088,27.865615347965537],[113.07271226908277,27.86562480662271],[113.07240493955729,27.86564432713221],[113.07218353413357,27.86566962686504],[113.07202105781259,27.86544131628623],[113.07182107461426,27.865160298598912],[113.07192687842783,27.86423983193656],[113.07245724629048,27.864259635013926],[113.07257711173801,27.86426284571612],[113.07316485368534,27.863980167397422],[113.07346925548022,27.86420678453144],[113.07370834400501,27.864219973470377],[113.07401233766282,27.864206596741443],[113.07435052945488,27.864004120525234],[113.07480915842302,27.8638358507265],[113.07503057411283,27.86386181386942],[113.07513743771389,27.86388840899792],[113.07554918045534,27.863990879206966],[113.07563042941344,27.86401109882726],[113.07560948876214,27.864389312932456],[113.07600764078857,27.864627055844654],[113.07611169415017,27.86468918732066],[113.07619711753998,27.864740194662332],[113.07636449033737,27.864611312943094],[113.07638188587842,27.864469386229352],[113.07640055323165,27.86431707871418],[113.07646592685055,27.864134940129045],[113.07656477812512,27.864296540670967],[113.07660268737177,27.86435851496106],[113.07676786036824,27.864388200741285],[113.07672685253678,27.864591306462792],[113.07661666009838,27.8645877752182],[113.07660104538958,27.864605527593223],[113.07657374407101,27.864614697359258],[113.07650911375518,27.864666143527153],[113.0763440749311,27.864797457465095],[113.07623982240926,27.86487384626701],[113.07619203899824,27.86490576792308],[113.07615277385827,27.86493220637484],[113.07615153517247,27.86497231251105],[113.07615981734347,27.865004848793067],[113.07616460415068,27.86506020840048],[113.07616121282899,27.8651484614379],[113.0761616819919,27.8651807757506],[113.0761641440161,27.8652170654978],[113.07615730950242,27.8655252693026],[113.0759345337547,27.865552557319536],[113.07530205297049,27.865407513194288],[113.0750978847967,27.865360691677537],[113.07552091876288,27.86492438325536],[113.07582253107597,27.864751982516225],[113.07574591968961,27.864615540997185],[113.07544336333861,27.864436478084674],[113.07509915245836,27.864800740441456],[113.07505311435207,27.864850686409536],[113.0749122375511,27.864778210213178]]]},
{"type":"MultiPolygon","coordinates":[[[[113.07119883411151,27.87285407134528],[113.0712182011561,27.872803292998512],[113.07177355720903,27.872693533295063],[113.07183028020101,27.87275603158143],[113.07182351574208,27.872804749132673],[113.07172940175944,27.872819000281705],[113.07170280780734,27.872748830245037],[113.07146619520478,27.872785240185483],[113.07147349491198,27.87281238234204],[113.07138928626532,27.872816123882316],[113.07119883411151,27.87285407134528]]],[[[113.07119883411151,27.87285407134528],[113.07126677613977,27.87306798221439],[113.07120587252624,27.87295803331397],[113.07119883411151,27.87285407134528]]]]},
{"type":"Polygon","coordinates":[[[113.07290496950328,27.870882341827006],[113.07269089645975,27.87099423915555],[113.07245524690921,27.87092199203143],[113.07245592409548,27.870842480666216],[113.07253413090385,27.870745794459445],[113.0726454194064,27.87084656397532],[113.07287580376314,27.87080030816213],[113.07290496950328,27.870882341827006]]]},
{"type":"Polygon","coordinates":[[[113.07230197738858,27.870458332424878],[113.07222763358466,27.870522297547033],[113.07212471415212,27.870414650595098],[113.07198092322142,27.87052020357247],[113.07195930691874,27.87043967055111],[113.07181074068274,27.8704296412064],[113.07181018913776,27.870368427815233],[113.07162109721898,27.870286990323443],[113.07164777373494,27.870128107389725],[113.07173655931398,27.870055421426624],[113.07175187055334,27.870078584138113],[113.07178382774656,27.870092087679097],[113.07182084110217,27.870097531445218],[113.07185103939113,27.870073898137804],[113.071917618841,27.870071747533135],[113.07198728943779,27.87005775491464],[113.07206669416912,27.870058674507977],[113.07209631495702,27.870065872193475],[113.07216723101726,27.870100907224344],[113.07219865793977,27.870128034820514],[113.07222545238753,27.87015830830892],[113.07225859035323,27.870178031246027],[113.07227828037166,27.870206272732702],[113.07231775031639,27.87023634994847],[113.07226304195166,27.87035655966292],[113.07230197738858,27.870458332424878]]]},
{"type":"Polygon","coordinates":[[[113.07236401730235,27.87892444207492],[113.07236195987848,27.87916590553881],[113.07227456302154,27.87918238304573],[113.07199684298136,27.87892197130059],[113.07236401730235,27.87892444207492]]]},
{"type":"Polygon","coordinates":[[[113.07264466380781,27.87955892759375],[113.07251505272131,27.8796764308082],[113.07259595672258,27.87979434305255],[113.07261436683493,27.87982844364595],[113.07249250998042,27.879825379900574],[113.07246290609875,27.879636392485807],[113.07252926900821,27.879556766355154],[113.07264466380781,27.87955892759375]]]},
{"type":"Polygon","coordinates":[[[113.07162389813337,27.87835943466791],[113.07160202436218,27.878388152523662],[113.07155281917406,27.87845387805959],[113.07147713185793,27.878554769016844],[113.07109206520553,27.878324806719835],[113.07100039131717,27.878209725612656],[113.0715633327378,27.877890687085088],[113.07160830322329,27.877816037976526],[113.07167759171021,27.877805052273292],[113.0717352608219,27.877849059459113],[113.07188548696946,27.877927494091754],[113.07210058926294,27.877961887227706],[113.07207988010751,27.877984921182524],[113.0720627517323,27.87801458509925],[113.07202477367589,27.878072328675792],[113.07200686716642,27.878093566920217],[113.07195122039917,27.878159532581517],[113.07191787384838,27.878212607126695],[113.07188999378744,27.878230136469327],[113.07183923112015,27.878213442068077],[113.0717547465597,27.878303841374535],[113.07172795038022,27.878283920976138],[113.0717056946896,27.87826251885742],[113.07162389813337,27.87835943466791]],[[113.0714493866255,27.878111304285397],[113.07141494667154,27.878106821533354],[113.07138717600466,27.878114495496572],[113.07135490713051,27.878147028683667],[113.07135726962387,27.878178389299126],[113.07137647564089,27.878207317916964],[113.07139612831674,27.87823304902028],[113.07143059070044,27.878269552468456],[113.07145910903496,27.87829292235072],[113.07149251913825,27.878270049817495],[113.07151303546328,27.87823285549064],[113.0715359522339,27.878173399105513],[113.07151791971212,27.87814176875184],[113.07148930670593,27.87813390817947],[113.0714493866255,27.878111304285397]]]},
{"type":"Polygon","coordinates":[[[113.07213574777474,27.87791684552805],[113.07204145665438,27.87792991808697],[113.07186289703255,27.877878838855267],[113.07186828649618,27.87781540521254],[113.07192421727511,27.87784797547426],[113.0719637712673,27.877876241517527],[113.0719989757776,27.877864524555754],[113.07201832219646,27.877841134951215],[113.07206549576223,27.87780378698496],[113.07209468116204,27.877749127896877],[113.07211511786497,27.87768132542015],[113.07214008112929,27.877573393948108],[113.07225949547109,27.87756309805411],[113.07227249674938,27.877851882064082],[113.07213574777474,27.87791684552805]]]},
{"type":"Polygon","coordinates":[[[113.07187040446024,27.876594344561834],[113.07180175658439,27.87639186796843],[113.07202852159874,27.876281194642946],[113.07194609698509,27.87620528735497],[113.07196436610292,27.87618578760747],[113.07210828811756,27.876032627650893],[113.07213150194035,27.87600792319855],[113.07238622829225,27.87603146951304],[113.07238443172636,27.876161658287238],[113.07249698472191,27.876271710469585],[113.07246055523407,27.87630022680584],[113.0722677348155,27.8762740103125],[113.07216568478516,27.876525342839038],[113.0719925754341,27.87648935835736],[113.07187040446024,27.876594344561834]]]},
{"type":"Polygon","coordinates":[[[113.07331303953286,27.876837541157578],[113.07338784610891,27.87724809142467],[113.0733826863608,27.877545817130386],[113.07327386502783,27.87756375925152],[113.07320125359698,27.877562664852615],[113.07321067489411,27.877452189734036],[113.07321844398984,27.87727992992602],[113.07319982482747,27.877259438562486],[113.07305033579988,27.876821759674055],[113.0730883608181,27.876757786500626],[113.07331303953286,27.876837541157578]]]},
{"type":"Polygon","coordinates":[[[113.07318063132591,27.875388103317874],[113.07322041608592,27.875395516176],[113.07342192718215,27.875433065082063],[113.07341338675113,27.875562864802877],[113.07341438947086,27.876010267003796],[113.0732175125948,27.876078069580746],[113.07299424123774,27.876302400889077],[113.07269705636136,27.876121105758827],[113.07272798542193,27.875998130210824],[113.07282799073815,27.87578887750561],[113.07308142735589,27.875548077084257],[113.07307512262686,27.875368442731205],[113.07318063132591,27.875388103317874]]]},
{"type":"Polygon","coordinates":[[[113.07198808266523,27.875668795485378],[113.0720176096303,27.87560115703916],[113.07211205534819,27.875456983216868],[113.07215109797421,27.875393830126978],[113.07216260713486,27.875313816024676],[113.072279838891,27.87531460479372],[113.0723365399932,27.875553992238547],[113.07252819338231,27.875537302766144],[113.07257978629401,27.875763490035318],[113.07234698743969,27.875880460690624],[113.07223874117982,27.875817742284028],[113.0721556284675,27.87576719735296],[113.0721048465966,27.87576670675827],[113.07198082563016,27.87569141557692],[113.07198808266523,27.875668795485378]]]},
{"type":"Polygon","coordinates":[[[113.07207542980017,27.87259964937482],[113.0719275198406,27.87232735308503],[113.07161516171125,27.87245438314637],[113.07150399283995,27.872263409763956],[113.0716015741045,27.872221264375856],[113.07169088813367,27.872286431920585],[113.07193346560186,27.872198832593018],[113.07219554632213,27.87241166641947],[113.0722573923598,27.87243145798789],[113.07229251433557,27.87255508359228],[113.07226530207008,27.872581413342488],[113.0721950307069,27.872539641463135],[113.07207542980017,27.87259964937482]]]},
{"type":"Polygon","coordinates":[[[113.07421486163403,27.8706363447293],[113.07358420304236,27.871163792802513],[113.07357866855229,27.871402480266642],[113.07343561132114,27.871301981684475],[113.07354182464218,27.871060876577825],[113.07346361223831,27.87093917333262],[113.07367414464296,27.87083923470012],[113.07383712668943,27.870690009370513],[113.07417653427778,27.87041038680743],[113.07421486163403,27.8706363447293]]]},
{"type":"Polygon","coordinates":[[[113.07302439606688,27.870268618699495],[113.07300514233614,27.87038318301111],[113.07307725324569,27.870467815243437],[113.07297406712777,27.870621151967367],[113.07284144030238,27.8703201609198],[113.07287505522456,27.870208134854423],[113.07277975703373,27.870134206028766],[113.07264838237015,27.87018497771704],[113.07261123408301,27.870137300239456],[113.07257174247842,27.86988404436093],[113.07275667428235,27.869793652000777],[113.07284762791265,27.869876470150974],[113.0727813880442,27.86998508627127],[113.07287200835839,27.870042432414863],[113.07284431041539,27.87011421695116],[113.07302439606688,27.870268618699495]]]},
{"type":"Polygon","coordinates":[[[113.07370412039364,27.86945236808842],[113.0736642342556,27.869617929252477],[113.07382214782918,27.86981555731872],[113.07358267722485,27.869918895773562],[113.07347343015427,27.86953173298411],[113.07376741023228,27.8691732782193],[113.07409264133125,27.869059617893058],[113.07425817094928,27.869363222542535],[113.0741775769292,27.86941542748498],[113.07431141092273,27.86957016584385],[113.07439716809736,27.86952954967307],[113.07461415718973,27.869829995565127],[113.07412974771742,27.869888382605517],[113.07404125426461,27.86946675292032],[113.07391364001599,27.869347698573097],[113.07370412039364,27.86945236808842]]]},
{"type":"Polygon","coordinates":[[[113.07279844477776,27.87458417807982],[113.0728201697436,27.87462002978712],[113.072840039421,27.874651487359866],[113.0728600283587,27.874682892494892],[113.07288120702707,27.874712190592447],[113.0729439762621,27.874830044793516],[113.07299422234749,27.87491679759347],[113.07288551156405,27.874938039979813],[113.0727299491738,27.87499285829862],[113.07269869075445,27.874981299642094],[113.07267456482138,27.874865146215782],[113.07261305873737,27.87483626715],[113.07260992925107,27.874606761349643],[113.0727816049464,27.87454772939934],[113.07279844477776,27.87458417807982]]]},
{"type":"Polygon","coordinates":[[[113.07206427449046,27.871087596412416],[113.07206689927456,27.871316274202346],[113.07211737205054,27.87137997100454],[113.07229323912193,27.87142991729321],[113.07198404627374,27.87173563581082],[113.07191512593081,27.87174057869002],[113.07192203799676,27.87102314040845],[113.0720208240694,27.870989118254403],[113.07206427449046,27.871087596412416]]]},
{"type":"Polygon","coordinates":[[[113.07169402047678,27.863881423798816],[113.07148513812834,27.86346371924491],[113.07093373166322,27.863276837208186],[113.07267411998099,27.86332826276314],[113.0730476965904,27.86329355948088],[113.07269472677486,27.863886098825937],[113.07210665894647,27.86369987545273],[113.07169402047678,27.863881423798816]]]},
{"type":"Polygon","coordinates":[[[113.07479071118004,27.869528446688093],[113.07467276784142,27.869572700056207],[113.07461618449712,27.86969571883566],[113.0745066629644,27.86951453994928],[113.07469049381389,27.869398231080687],[113.07461454086915,27.8692814937403],[113.07440668582991,27.869175568830713],[113.07430977131455,27.869021562920743],[113.0745908211738,27.86899850988264],[113.07465879731592,27.8691819292356],[113.0747146706989,27.86925944788462],[113.07477527278516,27.869224600858285],[113.07481372628462,27.86918910714206],[113.07484381252084,27.869185971294236],[113.07488175255044,27.869208294722743],[113.07493706687555,27.86915930710054],[113.0750575917751,27.86924704129874],[113.0749778780319,27.869240844602924],[113.07479071118004,27.869528446688093]]]},
{"type":"Polygon","coordinates":[[[113.07537459211206,27.869202899658568],[113.07542589647137,27.869040654719132],[113.07533732152487,27.868936905041277],[113.07560261514544,27.86891583857444],[113.0757113106652,27.869044824554674],[113.07557156408197,27.869087690090005],[113.07550515343762,27.869102445393075],[113.0754394482876,27.869176307301142],[113.07538872027433,27.86923202379218],[113.07535784746509,27.869263107431095],[113.07537459211206,27.869202899658568]]]},
{"type":"Polygon","coordinates":[[[113.0812722022833,27.86767258623502],[113.08131246257297,27.867737961336516],[113.08108938705672,27.86776908326331],[113.08105086812778,27.86770780901696],[113.08099099184186,27.86761256085433],[113.08076949502293,27.86755493335656],[113.08071859422336,27.867549966992456],[113.08072000000259,27.867384362713064],[113.08077417485022,27.86735893097628],[113.0809024052049,27.86738491067774],[113.08093277244423,27.867352005110373],[113.08095563572901,27.86732723086963],[113.08090048664042,27.86726152274643],[113.08109807162255,27.867261871134254],[113.08114444760447,27.867153860173577],[113.08111874718058,27.866898963930495],[113.08114256166067,27.866808114563785],[113.08113544509165,27.866736991379504],[113.08124071659735,27.86674039964834],[113.08128740446574,27.86673886089564],[113.08135333647297,27.866720044548103],[113.08150781590213,27.86665062924928],[113.08158851676406,27.866607016120724],[113.08173885629098,27.866579404564494],[113.08184423076636,27.866574195895573],[113.08180143191426,27.86642755459474],[113.08168476796966,27.866247189026403],[113.08160118079458,27.866147259906963],[113.08165313061897,27.866087820772968],[113.08171388638205,27.86607498464611],[113.08174935789708,27.866019696517967],[113.08188838199624,27.86617010315417],[113.08206382879196,27.86671480896095],[113.08182627594915,27.866626796243747],[113.08157907670504,27.866643443998814],[113.08130759287813,27.86678502544068],[113.08124352223626,27.86687795722193],[113.08134735623167,27.867138629015418],[113.08150268507814,27.867070298569693],[113.0815091992477,27.867168580273255],[113.08127533322056,27.86724769816712],[113.0812157740808,27.86726194967767],[113.0811777666374,27.867294601388373],[113.08114748580977,27.867328467655977],[113.08113085433787,27.867349796882852],[113.08111679769829,27.867370772408798],[113.0812722022833,27.86767258623502]]]},
{"type":"Polygon","coordinates":[[[113.07210583431734,27.877262214895683],[113.07151603614678,27.87696580438723],[113.07132118279752,27.877070916021868],[113.07135764436688,27.87726966694735],[113.07128233642995,27.87747484573124],[113.07106205347183,27.877544489736206],[113.07110189869178,27.87775579038],[113.07098625886513,27.877880277314635],[113.07087307438279,27.876894315707467],[113.07093838044835,27.87694002231018],[113.07106680375813,27.876974275102576],[113.07111350958712,27.876971630146727],[113.07115206083289,27.87694526155086],[113.071159317115,27.87692264150635],[113.0711745016084,27.876855293746857],[113.07119662677404,27.876738159539535],[113.07121433699284,27.876680166871328],[113.07125158125001,27.876635109660874],[113.07130296071045,27.87658856136856],[113.07137313434826,27.87653430390257],[113.07140510678846,27.876507657224245],[113.07163606376112,27.876450376760207],[113.07158229541785,27.876381865392556],[113.07159307335493,27.876356351839558],[113.07168856340228,27.87629766193635],[113.07175598105165,27.876419774396275],[113.07176767177396,27.87666499928802],[113.07171088549445,27.87673237113667],[113.07194580222303,27.876922371725644],[113.07205758940665,27.876851382590853],[113.07239144083316,27.876891251053],[113.07220797589615,27.87698665764354],[113.07210583431734,27.877262214895683]]]},
{"type":"Polygon","coordinates":[[[113.09271012314518,27.86385153036548],[113.09244851863198,27.863856296106537],[113.09225089199477,27.863860788532502],[113.09193193428015,27.86385147586817],[113.0919337471893,27.863618878151218],[113.09183217787239,27.863619621568144],[113.09184116658845,27.863588782530687],[113.09174868602848,27.863580792597798],[113.09168729019594,27.863613218395653],[113.09167294453215,27.863558591178535],[113.0916297462882,27.863527544726082],[113.09163111615261,27.863403803861704],[113.09167745737199,27.863369501372933],[113.09167724649687,27.863297374658824],[113.09193551747076,27.86339187905564],[113.09201323449568,27.863420316651705],[113.09223170255002,27.863574463656477],[113.09232473811967,27.863644162230024],[113.09243545730729,27.86371302063737],[113.09250231252858,27.863713352240545],[113.09271012314518,27.86385153036548]]]},
{"type":"Polygon","coordinates":[[[113.09656023408314,27.85976851412978],[113.09660528264078,27.859766926914055],[113.09672259774129,27.859799930666664],[113.09686615010509,27.86015096757368],[113.09682681760138,27.86019282509315],[113.0966837028179,27.860200610738904],[113.09667365532542,27.860250613963625],[113.09663151933755,27.86028649502493],[113.0966285796075,27.86033027184124],[113.09654254105612,27.86040079428807],[113.09654281129924,27.860441790411198],[113.09640608438072,27.86058423070032],[113.09645527681818,27.860638203268596],[113.09641196812586,27.860660964916107],[113.09641204618629,27.860982703220174],[113.09636153570717,27.861061559320294],[113.09625130212578,27.86114090117754],[113.09598463938306,27.860625072310892],[113.09587121321518,27.86068676155371],[113.09547931178638,27.86037104825446],[113.09529797885367,27.86006603333939],[113.09517557121976,27.859857967736186],[113.09513505028355,27.85978613417292],[113.09501803831925,27.85957208893932],[113.09482311225632,27.859215410143545],[113.09477594142083,27.859067608656144],[113.09489258227019,27.859064776460723],[113.09493021677274,27.859025336503258],[113.09511028619494,27.8590276385143],[113.09514221339421,27.859067593481324],[113.09527789834956,27.859066377418987],[113.09542824164566,27.859199202731613],[113.0954283511965,27.85924568663569],[113.09547251475169,27.859280971937153],[113.09548189314013,27.859368372914997],[113.09554780436923,27.85938646535738],[113.09555745970611,27.85954435222801],[113.09564193406999,27.859623625651775],[113.09565117003085,27.859677563926095],[113.09570844621815,27.85964664774233],[113.09574678170775,27.85968531636222],[113.09604611857823,27.859685357211276],[113.09604309602469,27.85973590992063],[113.09604541655531,27.8597862522113],[113.09605785089586,27.8598230501326],[113.09610147978313,27.859858219845442],[113.09615592717577,27.85987090144547],[113.09619831161308,27.859878137871544],[113.09622896255377,27.859883783311567],[113.09630003943127,27.85989777389658],[113.09634537534097,27.859906227898982],[113.09640347742369,27.859910136593108],[113.09643533695665,27.859908878107415],[113.09649190560906,27.859903037041406],[113.09654518406936,27.859898505330115],[113.09659179876954,27.85989379190101],[113.09658374591244,27.85982285985391],[113.09656023408314,27.85976851412978]]]},
{"type":"Polygon","coordinates":[[[113.09281024903223,27.867462290445335],[113.09271211839085,27.867506153765188],[113.09259608220606,27.867374496861352],[113.09253038614027,27.86728716650573],[113.09248774393842,27.86723438974053],[113.09263734600542,27.867152259370137],[113.09265617203984,27.867180828020032],[113.09268638142,27.867165106190335],[113.09258338852277,27.86700994207036],[113.09253665057079,27.867038937463487],[113.09251796883245,27.867013042424592],[113.09243515620906,27.866924526539215],[113.09237844098351,27.86686390618928],[113.09254311313776,27.866703909953124],[113.09256358917891,27.86672355919163],[113.09271253096769,27.866663315610243],[113.09277882415404,27.86663650246959],[113.0930792991393,27.866514320905512],[113.09299857710812,27.8662221532769],[113.09313321533772,27.866087842790964],[113.09318049710166,27.866254213421026],[113.09323428024577,27.866413135698846],[113.09331146441815,27.86657236699346],[113.093428884778,27.866782806028223],[113.09357417924075,27.867043198439312],[113.09354948829933,27.86712969607711],[113.09281024903223,27.867462290445335]]]},
{"type":"Polygon","coordinates":[[[113.09414039898176,27.863421568631818],[113.09411761393841,27.86344264071537],[113.09408275131344,27.86340187219705],[113.09399115428408,27.86340361841284],[113.09391742780554,27.863335394958042],[113.09381894394468,27.86324426216711],[113.09378400401974,27.863191691590263],[113.09391066165524,27.863179160275237],[113.09391968595467,27.863132614593862],[113.0940489686089,27.863132471237186],[113.09413036103139,27.863065836907044],[113.0942259577965,27.862988043840218],[113.09424802745882,27.863046531143723],[113.0942760064623,27.863110971069656],[113.09426237140167,27.86316098751239],[113.09419989262834,27.863155749803518],[113.09417881519214,27.863192353964585],[113.09416245340428,27.863256482861395],[113.09414623474804,27.863325618781214],[113.09415682058457,27.863395552434913],[113.09414039898176,27.863421568631818]]]},
{"type":"Polygon","coordinates":[[[113.09565391966191,27.864732011736407],[113.09579785088278,27.864915514194298],[113.0958671476102,27.864954882029714],[113.09587378416724,27.865017341897627],[113.09576015584048,27.86505046658419],[113.09550643471712,27.8651571827347],[113.09522982680049,27.865229783954465],[113.0951613342263,27.865257284077344],[113.09512906730177,27.865270239081724],[113.09506770073841,27.865371253004483],[113.0950700922219,27.865430238176007],[113.0949728759372,27.865424501279197],[113.09489651222725,27.865404241123144],[113.09489885075605,27.86533688095356],[113.09479653103503,27.865152816037256],[113.09482715105415,27.865120073198263],[113.0949047515798,27.86506929082839],[113.09512212332594,27.864927040269027],[113.09536921191462,27.864765340700092],[113.09559563444819,27.864617165427333],[113.09565391966191,27.864732011736407]]]},
{"type":"Polygon","coordinates":[[[113.09937393556321,27.86763458057387],[113.09938183646322,27.86768511261663],[113.09931562842416,27.86773955772216],[113.09924914773268,27.867683190363756],[113.09924948516391,27.86764238682455],[113.09926983765527,27.867624226956544],[113.09937393556321,27.86763458057387]]]},
{"type":"Polygon","coordinates":[[[113.09634207647802,27.86441866170718],[113.09620977175315,27.86442785392463],[113.0956515160989,27.864478269160653],[113.09562278257098,27.86441199645337],[113.0956506092407,27.864404052587954],[113.09560208617098,27.864378148168434],[113.09564352466359,27.864368550268907],[113.09570231661496,27.86435543879462],[113.09577138971977,27.864334731269455],[113.09580116528005,27.86433027048268],[113.09579327934729,27.86429516264584],[113.09577030330264,27.864225257964005],[113.09575635489966,27.864180616140874],[113.09578979733766,27.86414329694997],[113.09592967237786,27.86414432483019],[113.09607758203086,27.86427329052804],[113.09607804662899,27.864390441234033],[113.0963409447621,27.864383979832585],[113.09634207647802,27.86441866170718]]]},
{"type":"Polygon","coordinates":[[[113.09290160171544,27.86905888834441],[113.09266636360034,27.86906171175513],[113.09287328482422,27.869040187353416],[113.09290160171544,27.86905888834441]]]},
{"type":"Polygon","coordinates":[[[113.0978738526217,27.86973713155505],[113.09776276165223,27.869802088473914],[113.09784196408063,27.869727816720154],[113.0978738526217,27.86973713155505]]]},
{"type":"MultiPolygon","coordinates":[[[[113.09784789894175,27.869640532398304],[113.09786591441019,27.869670580277553],[113.09775456299843,27.869606664912958],[113.09784789894175,27.869640532398304]]],[[[113.09762987939816,27.869705081143255],[113.0975998757149,27.86971325295906],[113.09760461785997,27.869686122282978],[113.09767392231458,27.869617393792375],[113.09771477696728,27.869599806838128],[113.09762987939816,27.869705081143255]]]]},
{"type":"Polygon","coordinates":[[[113.09744575995927,27.86935826250584],[113.09736462695157,27.869376223707842],[113.09742029980339,27.86934147510505],[113.09744575995927,27.86935826250584]]]},
{"type":"MultiPolygon","coordinates":[[[[113.09646198243568,27.869334481735578],[113.09653995612508,27.8693030106534],[113.09655516667326,27.869331109353833],[113.09646198243568,27.869334481735578]]],[[[113.09646198243568,27.869334481735578],[113.09635086153241,27.869383172960283],[113.09633076641865,27.86936385070115],[113.09646198243568,27.869334481735578]]]]},
{"type":"Polygon","coordinates":[[[113.096438713939,27.868820741026514],[113.09634454239884,27.86886129246901],[113.09641846887868,27.86878743721701],[113.096438713939,27.868820741026514]]]},
{"type":"MultiPolygon","coordinates":[[[[113.09583794362997,27.868966133499068],[113.09592189562163,27.868909466713447],[113.09603747292715,27.868853642402584],[113.09604496477041,27.868875964428508],[113.09597738095742,27.86890895607995],[113.09583794362997,27.868966133499068]]],[[[113.09583794362997,27.868966133499068],[113.09575645250426,27.86905242967594],[113.09575594861778,27.86902531159272],[113.09583794362997,27.868966133499068]]]]},
{"type":"MultiPolygon","coordinates":[[[[113.09638478338096,27.86494355556043],[113.09634690309237,27.864963597014352],[113.09635725725914,27.86493484105438],[113.09638478338096,27.86494355556043]]],[[[113.09685555776109,27.865012476976936],[113.09687032729553,27.86504423529124],[113.09681300430024,27.86500811441696],[113.09685555776109,27.865012476976936]]]]},
{"type":"MultiPolygon","coordinates":[[[[113.09572523166727,27.861738356425416],[113.09571042722604,27.861717133281875],[113.09577093895176,27.86161798569227],[113.09572523166727,27.861738356425416]]],[[[113.09572523166727,27.861738356425416],[113.09573855606497,27.86176077356376],[113.09570140227599,27.861806311156688],[113.09572523166727,27.861738356425416]]]]},
{"type":"Polygon","coordinates":[[[113.09509735086701,27.864863078127396],[113.0949590291247,27.864916219684826],[113.09479557580647,27.864917218780814],[113.09467515075322,27.864927983528258],[113.09451187195009,27.865060426549245],[113.09435236251855,27.864978919184658],[113.09435298358608,27.864867576673788],[113.09432485418138,27.864675233379675],[113.09434351068039,27.86458668465322],[113.09441304559313,27.864581921277512],[113.09447667206393,27.864643764616233],[113.09448781324521,27.86468735677362],[113.0945260886465,27.864758449389864],[113.09470365001766,27.864833876083857],[113.09476418847296,27.864843025948364],[113.09490331373868,27.86471761382344],[113.09502911009243,27.864778894868348],[113.09509478884993,27.864817042868413],[113.0951309755218,27.864841644789106],[113.09509735086701,27.864863078127396]]]},
{"type":"Polygon","coordinates":[[[113.09656023408314,27.85976851412978],[113.09658374591244,27.85982285985391],[113.09659179876954,27.85989379190101],[113.09654518406936,27.859898505330115],[113.09649190560906,27.859903037041406],[113.09643533695665,27.859908878107415],[113.09640347742369,27.859910136593108],[113.09634537534097,27.859906227898982],[113.09630003943127,27.85989777389658],[113.09622896255377,27.859883783311567],[113.09619831161308,27.859878137871544],[113.09615592717577,27.85987090144547],[113.09610147978313,27.859858219845442],[113.09605785089586,27.8598230501326],[113.09604541655531,27.8597862522113],[113.09604309602469,27.85973590992063],[113.09604611857823,27.859685357211276],[113.09605907381473,27.859595974039596],[113.09607576610225,27.859568041919093],[113.09611798885295,27.8595398024652],[113.0961785492115,27.859511703901774],[113.0962228223877,27.85949734024355],[113.0963101106162,27.859480018130498],[113.0963799058161,27.859458035467576],[113.09642187040278,27.85948943870787],[113.09647026525727,27.859558241145855],[113.09653058384364,27.85969997796223],[113.09656023408314,27.85976851412978]]]},
{"type":"Polygon","coordinates":[[[113.09712729339181,27.86541863741039],[113.09718293908759,27.86542870072915],[113.09718394184561,27.86556546513569],[113.09712487957374,27.865575484104113],[113.09708316557925,27.86561313385194],[113.09704026950375,27.865572907200757],[113.09698428713354,27.865563889216023],[113.09697579045276,27.865438523516872],[113.09699560197906,27.865419230728467],[113.09704344792557,27.865419007088356],[113.09708554724001,27.865380430480485],[113.09712729339181,27.86541863741039]]]},
{"type":"Polygon","coordinates":[[[113.09635373648595,27.86555816054089],[113.096414818466,27.865613361481472],[113.09643048683124,27.865640674570322],[113.0963585506579,27.865656259212805],[113.09629155054824,27.8656099687069],[113.09626814518018,27.86554964396418],[113.09632736957468,27.865530492213946],[113.09635373648595,27.86555816054089]]]},
{"type":"Polygon","coordinates":[[[113.09607102945832,27.865396762052715],[113.09571422286767,27.865609771467817],[113.09568960084538,27.86565262374959],[113.09571518055559,27.865738043797418],[113.095733902868,27.865859412526515],[113.09552495002451,27.86585921814184],[113.09549431777631,27.865875091231175],[113.0953317688219,27.865866048606204],[113.09533391638305,27.865748910557674],[113.09548368495413,27.865698684226068],[113.09566952949697,27.86560350505864],[113.0957206275356,27.86558433187043],[113.09574864954644,27.865572216932748],[113.09589815462634,27.865483100116162],[113.09602188693655,27.86540053652034],[113.09607185432449,27.865363919305942],[113.09607102945832,27.865396762052715]]]},
{"type":"Polygon","coordinates":[[[113.09204118687886,27.867156231306772],[113.09199958479904,27.86720904101584],[113.09193141360198,27.867259982122917],[113.09190100772743,27.867338594319488],[113.09195756534538,27.867389860356134],[113.09200829108848,27.867391651569697],[113.09205021609606,27.86739280463474],[113.09209695728225,27.867400973362265],[113.09205291794359,27.86751448698019],[113.09194553117656,27.86749159821082],[113.0918093198865,27.867242210936645],[113.09198843049755,27.867121805999652],[113.09204118687886,27.867156231306772]]]},
{"type":"Polygon","coordinates":[[[113.0980110439936,27.865827153466054],[113.09801096714229,27.86585727971833],[113.09789747437193,27.86590048508848],[113.09791089887132,27.865928337364984],[113.09800315275278,27.865955179366033],[113.09785611268951,27.865964265034197],[113.09779356773258,27.865906118088557],[113.09779330785453,27.865866761579674],[113.09783844712811,27.865830986489403],[113.09784697604013,27.865779231802946],[113.09794694481265,27.865770815507393],[113.0980110439936,27.865827153466054]]]},
{"type":"Polygon","coordinates":[[[113.10016616641373,27.870662828751488],[113.10002265450834,27.870667013861723],[113.09999751746314,27.87069090663723],[113.09989241490837,27.870641914852637],[113.09985960443188,27.870624066611036],[113.09991262529017,27.870516797180063],[113.09995815549033,27.87040684405709],[113.09999602613249,27.870294620313544],[113.10002609465765,27.870180546410303],[113.10004824789327,27.87006505021749],[113.10009172951044,27.870057121918144],[113.10034190708302,27.87063002724455],[113.10018447598264,27.870628374827962],[113.10016616641373,27.870662828751488]]]},
{"type":"Polygon","coordinates":[[[113.0939048298476,27.86580385610131],[113.09386135338099,27.865842567939943],[113.09390719356868,27.865879164106026],[113.09390202638956,27.86611000374175],[113.09386114128617,27.866145375962116],[113.09385744297448,27.86622769849148],[113.09372842807714,27.86633482809648],[113.09371813884884,27.86638814006133],[113.09365908098465,27.866396198618535],[113.09362692236475,27.866433292894232],[113.09355193221828,27.8664339884235],[113.09351568646177,27.86635924636866],[113.09348501282513,27.86628256033096],[113.09346004158832,27.866204256908485],[113.09344088062646,27.866124670672342],[113.09342760934108,27.866044141419746],[113.09342028779017,27.865963015136312],[113.09341894457295,27.865881635795468],[113.09345054445488,27.865873358964443],[113.09362564635326,27.86584547304054],[113.09390835506827,27.865763452515846],[113.0939048298476,27.86580385610131]]]},
{"type":"Polygon","coordinates":[[[113.09105942889646,27.86431852495638],[113.09106164834915,27.864348462386168],[113.09098420963575,27.864327750863605],[113.09080310923218,27.864291021960504],[113.09059242119403,27.864224196597963],[113.09079173736231,27.864211628381888],[113.09093952026453,27.86420782918296],[113.09105942889646,27.86431852495638]]]},
{"type":"Polygon","coordinates":[[[113.0993601779392,27.869500108740482],[113.09944490999459,27.869472716228394],[113.09961023203182,27.869494729553942],[113.09972464091356,27.8694668592894],[113.09963633930359,27.86914931043509],[113.09962918408779,27.8691016517655],[113.09960731647051,27.869036781787468],[113.09955065981221,27.868855344599833],[113.09969581597703,27.869187759586534],[113.09973209209991,27.86927836942137],[113.09976253128457,27.86937066097235],[113.09978703647079,27.869464336745363],[113.09980143028312,27.869562487000753],[113.09979395153701,27.86961341760688],[113.09974968415575,27.86964640901257],[113.09975285069643,27.869766223834304],[113.09982484025997,27.869829959190234],[113.09981966254918,27.86992951022506],[113.09980791499652,27.870028618645556],[113.09978963899269,27.870126942739695],[113.09976489722831,27.870224143640577],[113.09973377470952,27.870319885333103],[113.0996963787284,27.87041383826316],[113.0996528398935,27.87050567753974],[113.09960198254295,27.87059084055728],[113.0995776123317,27.870548992341064],[113.0995368177894,27.870477879232382],[113.09949602431466,27.87040676611879],[113.09941290628448,27.870215921746006],[113.09936782049004,27.870198161962428],[113.09931440003214,27.870143755847995],[113.09931563299054,27.87010013299952],[113.09925270765144,27.87004524791246],[113.09916170579417,27.87004458042416],[113.09912413308496,27.870007515723668],[113.09899131081754,27.870006420635104],[113.09895191646618,27.87004362497502],[113.09885769108323,27.870043294446877],[113.09882263657528,27.870082190086535],[113.09873003021414,27.87008044257609],[113.09870769458688,27.87005916421594],[113.09870393415802,27.869820706357004],[113.09860285071584,27.869810864573534],[113.0985812337375,27.86978999152174],[113.09860506524109,27.869770500119724],[113.09865275448271,27.869771899109804],[113.09867831961391,27.869745609197885],[113.09871516268579,27.869718301175435],[113.0987157419348,27.869673211396858],[113.09875808130411,27.869642201861982],[113.09876011810657,27.869523425322228],[113.09871482091049,27.86948708783588],[113.09871616544646,27.869445714309457],[113.09867478559765,27.869413175923526],[113.09863211903901,27.869371591453884],[113.09863109607797,27.86932858729738],[113.09867515337776,27.8692937676769],[113.09867720842016,27.869172182323194],[113.09873976593992,27.86912086460964],[113.09878159046002,27.86916112976244],[113.09891653436539,27.869158228074156],[113.09897395287035,27.869541781696338],[113.09905712542015,27.8696238823887],[113.09927075818605,27.869622618690343],[113.09935840513394,27.869549221407667],[113.0993601779392,27.869500108740482]]]},
{"type":"Polygon","coordinates":[[[113.09934329963298,27.866360449495154],[113.09935885686369,27.8663967622084],[113.09906673434766,27.866393317661814],[113.09915568257524,27.86635698282423],[113.09934329963298,27.866360449495154]]]},
{"type":"Polygon","coordinates":[[[113.0993601779392,27.869500108740482],[113.09935840513394,27.869549221407667],[113.09927075818605,27.869622618690343],[113.09905712542015,27.8696238823887],[113.09897395287035,27.869541781696338],[113.09891653436539,27.869158228074156],[113.09898917925634,27.869091211675364],[113.09906619209704,27.869029477092337],[113.09906817585681,27.868911053895804],[113.0990233340358,27.868876760538704],[113.09902503972249,27.868831113256153],[113.09898087975246,27.868797127520477],[113.09898287433434,27.86867765138299],[113.099041998745,27.86862458675388],[113.09910500770609,27.86862395527412],[113.0991112605551,27.86865706353677],[113.09907623282393,27.868671797939655],[113.09906747017844,27.868746446694214],[113.09915576088311,27.86875743623244],[113.09917181494886,27.86880528027832],[113.09919005406213,27.868908002516203],[113.09911961807462,27.869038207767147],[113.09914226270952,27.8691975344108],[113.09919438887114,27.869265836024375],[113.09929845963386,27.869520062069324],[113.0993601779392,27.869500108740482]]]},
{"type":"Polygon","coordinates":[[[113.09353271759223,27.869599063091155],[113.09350965324556,27.869625826846022],[113.09333037972546,27.869624862216323],[113.09329338379452,27.869583659900766],[113.09324478310232,27.869584315774077],[113.09322436216493,27.86956394604069],[113.0932244965447,27.869485851884146],[113.09317862844048,27.8694466051854],[113.09322564761521,27.86941430534155],[113.09322868880753,27.869328668839625],[113.09333395539203,27.869239364257677],[113.0935108827902,27.869240207879464],[113.09361700220242,27.86933181517479],[113.09361371064232,27.869534931434888],[113.09356186773734,27.8695801399032],[113.09353271759223,27.869599063091155]]]},
{"type":"Polygon","coordinates":[[[113.09592189562163,27.868909466713447],[113.09576163783636,27.868910939863582],[113.09563882706134,27.868832113507622],[113.09554869880348,27.86882700544418],[113.09541613032246,27.868945056622284],[113.09536716491849,27.868942225186576],[113.0953302148723,27.86898381265704],[113.09514550466596,27.868893193410365],[113.09534987836494,27.86860276199343],[113.09537895714912,27.868566932935742],[113.09543869986436,27.86859598705374],[113.09549928708057,27.86861664155424],[113.09570305872631,27.868643748141647],[113.09582392194928,27.868644044303473],[113.09612381382075,27.868584090027813],[113.09612604272844,27.86874214276176],[113.09608497862585,27.86877286478449],[113.09608210991492,27.868817316029123],[113.09603747292715,27.868853642402584],[113.09597738095742,27.86890895607995],[113.09592189562163,27.868909466713447]]]},
{"type":"Polygon","coordinates":[[[113.09937393556321,27.86763458057387],[113.09938183646322,27.86768511261663],[113.09931562842416,27.86773955772216],[113.09924914773268,27.867683190363756],[113.09924948516391,27.86764238682455],[113.09926983765527,27.867624226956544],[113.09937393556321,27.86763458057387]]]},
{"type":"Polygon","coordinates":[[[113.09480544701638,27.863408739136318],[113.09472892960683,27.863441603950264],[113.09461910782096,27.863435653263334],[113.09462720972671,27.863386324128786],[113.09462540075278,27.86327853432233],[113.09462108618358,27.863214216412448],[113.09471999847428,27.86318728072324],[113.09479855041462,27.863187036498285],[113.09480544701638,27.863408739136318]]]},
{"type":"Polygon","coordinates":[[[113.09441960849843,27.867692481356325],[113.09437763033266,27.867770852110223],[113.09433280616791,27.867774236536235],[113.09421131476279,27.86778464461852],[113.09416836904417,27.86774284762561],[113.09423093031545,27.867676209663244],[113.09448019985497,27.867473172779203],[113.09462554400947,27.867370700104203],[113.09514187157049,27.867010520398463],[113.09530859551894,27.86689532734334],[113.09534113293914,27.866929445530733],[113.09537113895692,27.866983513695285],[113.09511040364755,27.867131585152674],[113.09482299840705,27.867386598441893],[113.09472467028763,27.86771918063961],[113.09472123455595,27.86778537048567],[113.09465311256103,27.867775527441378],[113.09459146663829,27.86775540160636],[113.0945391559043,27.867718044028923],[113.0945474213891,27.867682064962278],[113.09442935084073,27.867656685240274],[113.09441960849843,27.867692481356325]]]},
{"type":"Polygon","coordinates":[[[113.0947674883962,27.862913189741324],[113.09479108817251,27.862947142923954],[113.09471301347823,27.862978924654982],[113.09463124606827,27.86299665910515],[113.0946023408438,27.862997589155714],[113.09458436192924,27.862962156936028],[113.09457130262085,27.86292031622803],[113.09455195800102,27.86287989331552],[113.09441374656552,27.862932132780617],[113.09433007104153,27.86293036886609],[113.09429064829528,27.862901260949766],[113.09429802065378,27.862870697158954],[113.09429972051032,27.86282474761175],[113.09453632098588,27.862713313024862],[113.09457094945779,27.862733751465406],[113.09472144831506,27.862879011677613],[113.0947674883962,27.862913189741324]]]},
{"type":"Polygon","coordinates":[[[113.09603634592776,27.862054534006134],[113.09560185238314,27.8622534290455],[113.09570133028316,27.86219173254097],[113.09581664942304,27.86213019033408],[113.09590124228137,27.862077622359603],[113.09595824004833,27.861999406309106],[113.0959852331968,27.8619603014895],[113.09603634592776,27.862054534006134]]]},
{"type":"Polygon","coordinates":[[[113.09555831850145,27.86164022086028],[113.09560958163402,27.86173315156225],[113.09557680018641,27.86179183215105],[113.09546929943946,27.861764907548356],[113.09535346017616,27.8617469089963],[113.09529222958452,27.86169549728555],[113.09531781632862,27.861681137702234],[113.09536650800699,27.861645866719066],[113.09540148981777,27.861632776945466],[113.09547168250405,27.861535467846934],[113.09550001059198,27.861508985448356],[113.09553086662848,27.861502205601397],[113.09555831850145,27.86164022086028]]]},
{"type":"Polygon","coordinates":[[[113.09280486654649,27.865699834280623],[113.09290984101825,27.86578848487524],[113.0929120258336,27.86583764241388],[113.09295152955617,27.865870152108727],[113.092955194048,27.865949266546068],[113.0929107267844,27.865986204814803],[113.09243239199793,27.865932380975625],[113.09243244749548,27.865829568962393],[113.09254062890683,27.86573653312261],[113.09258955713781,27.865735110844405],[113.0926226084577,27.86569837097875],[113.09280486654649,27.865699834280623]]]},
{"type":"Polygon","coordinates":[[[113.08829578629455,27.866444858778966],[113.08832972332974,27.866461895161127],[113.08842186179538,27.866397093990365],[113.08850764437162,27.86637049113333],[113.08848782007851,27.86647434724725],[113.08844869349888,27.866523817394384],[113.08839414257389,27.866590803406353],[113.08794105344118,27.86716565446506],[113.08767483514522,27.86711019928051],[113.08767245414423,27.867394470650577],[113.0877526319041,27.867403884353273],[113.08758324166277,27.86761805044278],[113.08746252858323,27.867748936536326],[113.08656203755012,27.867093036329088],[113.08526060827278,27.867577835976306],[113.08510342407186,27.867366426291863],[113.08506872994029,27.86731976271146],[113.08487846290753,27.867063855521543],[113.08480594460303,27.866966318898427],[113.08483452581572,27.866936288022497],[113.08483952456079,27.86689396173994],[113.08476486889876,27.8667720419342],[113.08475879180682,27.86671649353532],[113.08568414247557,27.865980491863485],[113.08622180503471,27.865568362023588],[113.08628798297286,27.865518471679938],[113.08635758231738,27.865895197973963],[113.08787660861134,27.86586925033604],[113.08838354823804,27.8654932425087],[113.08853484204927,27.865576061312957],[113.08851634655787,27.866304387729404],[113.08835360980486,27.86630044999393],[113.08829578629455,27.866444858778966]],[[113.0862449629545,27.866927561741324],[113.08622229851134,27.86707220703591],[113.08642768653989,27.867060893667947],[113.08640449545804,27.86690276619184],[113.0862449629545,27.866927561741324]]]},
{"type":"Polygon","coordinates":[[[113.08851634655787,27.866304387729404],[113.08835360980486,27.86630044999393],[113.08829578629455,27.866444858778966],[113.08834038190793,27.86628445643684],[113.08851634655787,27.866304387729404]]]},
{"type":"Polygon","coordinates":[[[113.08712971523198,27.86539514513929],[113.08712805895176,27.865592787666866],[113.08693134051428,27.865679570122737],[113.08675970465501,27.865637822999336],[113.08676232866236,27.865347597000742],[113.08699006839761,27.865312581474495],[113.08712971523198,27.86539514513929]]]},
{"type":"Polygon","coordinates":[[[113.08794533582963,27.865019687331614],[113.0879438036248,27.865202690559226],[113.08772861193434,27.865281569499185],[113.0875732564168,27.865195045994927],[113.08757464288524,27.86495654273118],[113.08786003891987,27.864908007788372],[113.08794533582963,27.865019687331614]]]},
{"type":"Polygon","coordinates":[[[113.08968071830962,27.873609377983115],[113.08946807947382,27.873638893027685],[113.08946342611947,27.873619072605656],[113.08968071830962,27.873609377983115]]]},
{"type":"MultiPolygon","coordinates":[[[[113.08990558850208,27.87290495507914],[113.08989319623306,27.872874631110424],[113.09000936378712,27.87280043923869],[113.08990558850208,27.87290495507914]]],[[[113.08990558850208,27.87290495507914],[113.0899223914237,27.872932510960567],[113.08987842565597,27.872964739539032],[113.08990558850208,27.87290495507914]]],[[[113.08975444228248,27.873131504733283],[113.08974294120314,27.873102922699946],[113.08977469292488,27.873080165514725],[113.08975444228248,27.873131504733283]]],[[[113.08979608395987,27.873238610760527],[113.08980430409619,27.873258594575212],[113.08974402916374,27.87337193244297],[113.08979608395987,27.873238610760527]]],[[[113.08973102929903,27.873403848337823],[113.0896261737596,27.87346804383297],[113.08960250519758,27.87350358699197],[113.0895794396621,27.87348776862145],[113.08961231358856,27.873449095633262],[113.08973102929903,27.873403848337823]]]]},
{"type":"MultiPolygon","coordinates":[[[[113.08768667585069,27.87138928833805],[113.08764993431974,27.87138057067395],[113.08767273238969,27.871365808845002],[113.08768667585069,27.87138928833805]]],[[[113.08756345078747,27.871437013427105],[113.08749025686242,27.87153884957974],[113.08746250808225,27.87157114138605],[113.08745379118389,27.871546889782106],[113.08747830918999,27.87151918294607],[113.08756345078747,27.871437013427105]]]]},
{"type":"MultiPolygon","coordinates":[[[[113.09009147705451,27.870086765203048],[113.09011488007637,27.870115588159237],[113.0900719393537,27.870103782201696],[113.08988369770321,27.870172289479363],[113.09006330570807,27.870075949986333],[113.09009147705451,27.870086765203048]]],[[[113.08961063541351,27.87030391699762],[113.08959050815955,27.87027496128636],[113.08974587789366,27.87023873996173],[113.08961063541351,27.87030391699762]]]]},
{"type":"Polygon","coordinates":[[[113.09158749447869,27.86965304006839],[113.09154206830371,27.869648520684223],[113.09158164231279,27.869627429730677],[113.09158749447869,27.86965304006839]]]},
{"type":"Polygon","coordinates":[[[113.09217853974359,27.869513357283477],[113.09217047813614,27.869538164077497],[113.09196619421861,27.86949520772942],[113.09192299171558,27.86951382871052],[113.09193987117581,27.869463155392488],[113.09197173003093,27.86946999000331],[113.09217853974359,27.869513357283477]]]},
{"type":"Polygon","coordinates":[[[113.09006330570807,27.870075949986333],[113.0901500787987,27.870038284827757],[113.09009147705451,27.870086765203048],[113.09006330570807,27.870075949986333]]]},
{"type":"Polygon","coordinates":[[[113.0899526940763,27.870857000151744],[113.08982582916435,27.87091958074373],[113.0898683373317,27.870883186448562],[113.0899373560287,27.870830853438076],[113.09000206984884,27.870805088801347],[113.09005547245097,27.870786243390864],[113.0899526940763,27.870857000151744]]]},
{"type":"Polygon","coordinates":[[[113.0929726063017,27.874080565473296],[113.09297343519016,27.873982882035847],[113.09298572569342,27.873950934989683],[113.0933922770395,27.87393260604058],[113.09353476631965,27.873987271478715],[113.09328906658253,27.87409697190322],[113.09322653827947,27.8741224221727],[113.0931065738497,27.874171249194497],[113.09297182200648,27.87417289482949],[113.09297875592887,27.874116852160338],[113.0929726063017,27.874080565473296]]]},
{"type":"Polygon","coordinates":[[[113.09328906658253,27.87409697190322],[113.09322653827947,27.8741224221727],[113.09297875592887,27.874116852160338],[113.0929726063017,27.874080565473296],[113.09299971255393,27.874090069252524],[113.09328906658253,27.87409697190322]]]},
{"type":"Polygon","coordinates":[[[113.08960250519758,27.87350358699197],[113.08971610976141,27.87354588340859],[113.08986890237719,27.873572670325924],[113.08988317892639,27.873614944434003],[113.08991563649427,27.87362924116656],[113.0902105909515,27.873677948424444],[113.09026156250525,27.873551361558718],[113.09030477744479,27.87342621774423],[113.09033291115165,27.87343277101236],[113.09020381455133,27.87374365312127],[113.09017662178972,27.873729596018638],[113.08994445537245,27.873668021810737],[113.08983740743227,27.87364960906972],[113.08968071830962,27.873609377983115],[113.08946342611947,27.873619072605656],[113.08945912900046,27.873599879843866],[113.08942268571381,27.873602382259165],[113.0894053726799,27.873389332896185],[113.08942552899417,27.87336022899972],[113.08949774329476,27.87336517231326],[113.08952852399821,27.873350117302024],[113.08955075498669,27.873377577326178],[113.08963285837707,27.873313395908593],[113.08960659400327,27.873264221991423],[113.08972100391908,27.873088794628913],[113.08974294120314,27.873102922699946],[113.08975444228248,27.873131504733283],[113.08976464064034,27.873163120792295],[113.08977373525049,27.873196561276167],[113.08979271151705,27.873216295764678],[113.08979608395987,27.873238610760527],[113.08974402916374,27.87337193244297],[113.08973102929903,27.873403848337823],[113.08961231358856,27.873449095633262],[113.0895794396621,27.87348776862145],[113.08960250519758,27.87350358699197]]]},
{"type":"Polygon","coordinates":[[[113.090974873851,27.873413564715978],[113.09097417054699,27.87349781609586],[113.09097386879651,27.873533963787498],[113.09080676611192,27.87382456983513],[113.09071702929762,27.87367885518789],[113.09034011706532,27.87306681466908],[113.090974873851,27.873413564715978]]]},
{"type":"Polygon","coordinates":[[[113.0907605619886,27.874253273600768],[113.09039134601099,27.874242625702067],[113.09030877374917,27.874244877295414],[113.09010482979471,27.87420220455308],[113.09007873404012,27.87412794100683],[113.09014115855541,27.87403005138449],[113.09018885729627,27.873873133106983],[113.09019378767037,27.873824083901138],[113.09022367962669,27.873785609454472],[113.09023169592477,27.87386318522616],[113.0903339659253,27.873866494683572],[113.09033020818687,27.873903414514697],[113.09032256864865,27.874027839261142],[113.09035971487165,27.874028357705267],[113.0903709435765,27.874077542384512],[113.09045621449285,27.874087588234232],[113.09045349842206,27.87402946357199],[113.09062780507752,27.8740270914034],[113.09062055485302,27.87393556450829],[113.09072955008975,27.873949071839444],[113.09087139507552,27.874132311958952],[113.09092520218529,27.874156050332452],[113.0907371458608,27.87417713386905],[113.0907423823103,27.874229422693684],[113.0907605619886,27.874253273600768]]]},
{"type":"Polygon","coordinates":[[[113.08814188760097,27.87379316386189],[113.08806515434118,27.873825470220435],[113.08806342168933,27.87395767577084],[113.08825782569551,27.87440138970263],[113.08834202562014,27.874578414088653],[113.08835934755383,27.874692895906847],[113.08838322453879,27.87473090158561],[113.08846850416879,27.874781547728983],[113.08899394901688,27.874926135800674],[113.08897697457525,27.874965557020403],[113.08894038394655,27.874943987125157],[113.08888946707677,27.874927613769714],[113.08876407493197,27.874884663085986],[113.0886711559343,27.8748538185853],[113.08851177922602,27.874829788503167],[113.08845530411341,27.874815114313087],[113.08833725395657,27.874754909786905],[113.08821988637735,27.874716886001206],[113.08803244442647,27.8746232218109],[113.08765860369864,27.87438700645371],[113.08738564067642,27.87414536619554],[113.08739777235984,27.874033094976102],[113.0874255505199,27.87392673914446],[113.08754212507453,27.873480393682055],[113.08756639384771,27.873330518232777],[113.08803076388647,27.873242747117782],[113.08814188760097,27.87379316386189]]]},
{"type":"Polygon","coordinates":[[[113.08745379118389,27.871546889782106],[113.08741864573312,27.871445725433148],[113.08750920126293,27.87136295563682],[113.08757467612539,27.871332263303007],[113.08766934382196,27.871292751689893],[113.08771836304017,27.8712996782536],[113.08773161719867,27.871340111397338],[113.08777300427334,27.871378261888825],[113.08781227410276,27.87137413005327],[113.08785079266093,27.87134913338749],[113.08790310455308,27.871300076423122],[113.08791321139289,27.87127379460135],[113.08790724545386,27.871229371792012],[113.08793104307802,27.871211277943118],[113.087986030823,27.87121818523445],[113.08809818609127,27.87123227313149],[113.08820894873843,27.871246186605486],[113.08827579482266,27.87125458341464],[113.0883597477579,27.87127052840233],[113.08844082742479,27.87133557669057],[113.08852475145808,27.87140290675236],[113.08856699491604,27.871436797400154],[113.08802328500676,27.871465296626734],[113.08799374457017,27.871466875233136],[113.08787420172668,27.871489091983452],[113.08769596009863,27.871574418431656],[113.08775016523515,27.87144664477188],[113.0877296931458,27.871419738394593],[113.08768667585069,27.87138928833805],[113.08764993431974,27.87138057067395],[113.08756345078747,27.871437013427105],[113.08747830918999,27.87151918294607],[113.08745379118389,27.871546889782106]]]},
{"type":"Polygon","coordinates":[[[113.08879697323336,27.871325378176522],[113.08879153131643,27.871351530276815],[113.08875212893061,27.87135282101024],[113.08874678341844,27.871409194274342],[113.08869236767646,27.871427952165536],[113.08860457599877,27.871322517803033],[113.08870446250477,27.871309200047982],[113.08874309735408,27.871247465002114],[113.088797746249,27.871285535893666],[113.08914364793718,27.870953474086527],[113.0891423637501,27.870888127643383],[113.08919817552314,27.870869705427406],[113.08922458069281,27.870920532505494],[113.08923708664919,27.87085683724805],[113.08920249888693,27.870840820910527],[113.08923641109709,27.87072441086867],[113.0891178635677,27.87064158979194],[113.08894080806708,27.87051974111561],[113.08912923747918,27.870445070829962],[113.0893277858347,27.870366389512988],[113.08929220042063,27.870683647898957],[113.08925582597192,27.871007931029578],[113.08923572350128,27.87118714989375],[113.08908070612163,27.87132382290977],[113.08889543472324,27.87130143055062],[113.08879697323336,27.871325378176522]]]},
{"type":"Polygon","coordinates":[[[113.08762445843328,27.871896277781055],[113.08785669841589,27.872517495388603],[113.08762694239425,27.87267844010119],[113.08763134443535,27.87249697106469],[113.08757416347686,27.87201395411383],[113.08756176354751,27.87189446889033],[113.08762445843328,27.871896277781055]]]},
{"type":"Polygon","coordinates":[[[113.06906976683068,27.88290321595177],[113.06903092484077,27.88293014317493],[113.0689748627216,27.882969009047795],[113.06893045328049,27.88299979665137],[113.06876222815488,27.882990081234624],[113.06877554738789,27.88293783503983],[113.06876240732088,27.882879402500894],[113.0688013314963,27.88278613308857],[113.06883287139927,27.88274790111499],[113.06906976683068,27.88290321595177]]]},
{"type":"Polygon","coordinates":[[[113.0671380228721,27.884741095007055],[113.06709121496955,27.884743995924467],[113.06708368073028,27.884711799029958],[113.06703031122744,27.884711437865153],[113.06702900009346,27.884642028258906],[113.06700046741658,27.884635064183392],[113.06700651906644,27.884596172007512],[113.0670467373859,27.884574073062016],[113.0670498017155,27.884523536130065],[113.0671380228721,27.884741095007055]]]},
{"type":"Polygon","coordinates":[[[113.0685382114018,27.88427846884264],[113.0684545487378,27.88428725786857],[113.06843399041247,27.884237261468485],[113.06854211077912,27.884186280269148],[113.0685382114018,27.88427846884264]]]},
{"type":"Polygon","coordinates":[[[113.06629941130052,27.882631884592726],[113.06625054324994,27.882734180360913],[113.06612193160025,27.882831479430568],[113.06609696897003,27.882771478659258],[113.06603825339516,27.88264726329155],[113.06599378613716,27.88256364037432],[113.06596110053846,27.882505459564104],[113.06593136900419,27.88244408290555],[113.06600822100219,27.882441403947507],[113.06601870070048,27.882415961952784],[113.06606998400264,27.88241813203628],[113.06608206144448,27.882445548614424],[113.06616827637271,27.88244248814901],[113.06620887885431,27.882493789136493],[113.06626011632035,27.882501425973153],[113.06627501363783,27.88255893131944],[113.06629941130052,27.882631884592726]]]},
{"type":"Polygon","coordinates":[[[113.06593136900419,27.88244408290555],[113.06589306433709,27.8823844221087],[113.06584146297871,27.88228974525724],[113.06579375057325,27.882202925037895],[113.06572007807203,27.882074643410117],[113.06563548677977,27.8819612192738],[113.06557473807234,27.881881020253864],[113.0654771058401,27.881454438213495],[113.06563456387643,27.881633375387683],[113.06569277567401,27.881705076320774],[113.06575098856298,27.88177677723729],[113.06578183653531,27.88182375421804],[113.06584168471258,27.881915778217635],[113.0659015329972,27.882007801290236],[113.06601305741907,27.882136920346497],[113.06635772950104,27.8823676013242],[113.06636582684119,27.882501515668498],[113.06629941130052,27.882631884592726],[113.06627501363783,27.88255893131944],[113.06626011632035,27.882501425973153],[113.06620887885431,27.882493789136493],[113.06616827637271,27.88244248814901],[113.06608206144448,27.882445548614424],[113.06606998400264,27.88241813203628],[113.06601870070048,27.882415961952784],[113.06600822100219,27.882441403947507],[113.06593136900419,27.88244408290555]]]},
{"type":"Polygon","coordinates":[[[113.06893901458226,27.883636874547072],[113.06893958646783,27.883670690009883],[113.06891925265924,27.88372395177031],[113.0687636990623,27.88370386948145],[113.06879005255898,27.883579293224646],[113.06895765315664,27.883519544988662],[113.06893901458226,27.883636874547072]]]},
{"type":"Polygon","coordinates":[[[113.06923012954461,27.880659576572437],[113.06920109644138,27.880702336266612],[113.06916117190694,27.880791360000174],[113.06915474280682,27.88085396896221],[113.06915728407391,27.88092123669254],[113.0691211968789,27.880942331938122],[113.06905851235165,27.88094232286184],[113.06897753085971,27.88096336848082],[113.06895605088171,27.880940080810653],[113.06891550799709,27.88078864189621],[113.06884933476584,27.880712495137796],[113.06889423727714,27.88069435412711],[113.06919860804426,27.88061273023364],[113.06923393671853,27.88060325619656],[113.06923012954461,27.880659576572437]]]},
{"type":"Polygon","coordinates":[[[113.0671380228721,27.884741095007055],[113.06717307987805,27.884822622773594],[113.06709595879127,27.884828185234635],[113.06706971234482,27.884794873677173],[113.06686767202247,27.884798964396843],[113.06685897573226,27.884769773361228],[113.06671639429788,27.88475558746374],[113.06656614975572,27.88424527246029],[113.06658252288614,27.884219658288416],[113.06686596968898,27.88422890030293],[113.06687924212865,27.884204625799818],[113.06692465817501,27.884202956214523],[113.0670498017155,27.884523536130065],[113.0670467373859,27.884574073062016],[113.06700651906644,27.884596172007512],[113.06700046741658,27.884635064183392],[113.06702900009346,27.884642028258906],[113.06703031122744,27.884711437865153],[113.06708368073028,27.884711799029958],[113.06709121496955,27.884743995924467],[113.0671380228721,27.884741095007055]]]},
{"type":"Polygon","coordinates":[[[113.07010037972769,27.883553707001294],[113.07014708961897,27.883687028930527],[113.07016876990274,27.88373332142988],[113.07002477471498,27.883708203282918],[113.06994866135935,27.883685780686502],[113.0698925934632,27.883660664524523],[113.06983624279643,27.883613502839033],[113.0699017442568,27.88362356074361],[113.069996376221,27.883625280115112],[113.07005395405692,27.88360607289976],[113.07008038738596,27.883559223360578],[113.07010037972769,27.883553707001294]]]},
{"type":"Polygon","coordinates":[[[113.07038606978674,27.88368502768971],[113.07032441399848,27.88371633377763],[113.07027139300973,27.88376593478929],[113.0702009772056,27.883720124810505],[113.07012710223896,27.883569644396406],[113.07032844361007,27.883544987564996],[113.07038606978674,27.88368502768971]]]},
{"type":"Polygon","coordinates":[[[113.07032844361007,27.883544987564996],[113.0703655640661,27.883537582621177],[113.07043917937393,27.88372409337248],[113.070545903373,27.883942909167565],[113.07062768774855,27.884057719066632],[113.07068241161289,27.884127901100918],[113.07056884305425,27.884147613579852],[113.07057289934922,27.88408596217319],[113.07046893670629,27.883880891058343],[113.06982566392051,27.883691042416558],[113.06975739058626,27.8836452854696],[113.06974121677031,27.883608701994813],[113.06983624279643,27.883613502839033],[113.0698925934632,27.883660664524523],[113.06994866135935,27.883685780686502],[113.07002477471498,27.883708203282918],[113.07016876990274,27.88373332142988],[113.07014708961897,27.883687028930527],[113.07010037972769,27.883553707001294],[113.07012710223896,27.883569644396406],[113.0702009772056,27.883720124810505],[113.07027139300973,27.88376593478929],[113.07029935308661,27.88378893300423],[113.07036263462783,27.883801036613],[113.07041577589297,27.883784198590913],[113.07041273588165,27.88375775826252],[113.07038606978674,27.88368502768971],[113.07032844361007,27.883544987564996]]]},
{"type":"Polygon","coordinates":[[[113.06931572071227,27.881407520806565],[113.06928676080874,27.88145844516739],[113.06933410521133,27.881568767096656],[113.06918777748731,27.8816227438959],[113.06917159440249,27.881548585114974],[113.06906416141025,27.88141587066619],[113.06899994525406,27.881385350204987],[113.06903296899021,27.881336821927892],[113.06921817756361,27.881396509140746],[113.06931243745642,27.88135683265526],[113.06931572071227,27.881407520806565]]]},
{"type":"Polygon","coordinates":[[[113.06414917903597,27.872908126824974],[113.06408678147166,27.872955729179083],[113.06408514042899,27.872993201194774],[113.06403367462963,27.87299636551307],[113.06401496922821,27.873024352044993],[113.06396616238952,27.873025191970243],[113.06396066524285,27.873050923929007],[113.06384402283196,27.873039174391582],[113.06379179576527,27.872947109228694],[113.0637152236181,27.872783739178168],[113.0636572157336,27.872659841574666],[113.06372439132238,27.872612402689704],[113.06378938738959,27.87256950387049],[113.06402012378533,27.872578098296213],[113.06412611482587,27.872676040516904],[113.06414818104975,27.872734307612184],[113.06408572926385,27.872754323060235],[113.06391390108753,27.87267450991619],[113.0638481295429,27.872730485321636],[113.06388187861322,27.872773285745847],[113.06408942569345,27.872820317452373],[113.06413899977396,27.872804861542495],[113.06414917903597,27.872908126824974]]]},
{"type":"Polygon","coordinates":[[[113.06136387675726,27.87620781709951],[113.06079644499415,27.87623731104599],[113.06057997958193,27.876238067891965],[113.06050097071734,27.87614946985332],[113.0604995325662,27.876062069833605],[113.06058896033817,27.875892830727082],[113.06071866108674,27.875892045000448],[113.06073257648868,27.876043875085134],[113.06087392531124,27.87601577153164],[113.06089322539651,27.87597149819185],[113.06099026223299,27.87574889441206],[113.06101703416395,27.875668411451475],[113.06115396788371,27.875661804094165],[113.06123163360675,27.875575618466172],[113.06123111831121,27.8754949984083],[113.0612927528409,27.87551596013814],[113.06134300954653,27.875528811969737],[113.06141568084757,27.875555992646653],[113.06144555548957,27.8755628036539],[113.06147652826702,27.875565083477664],[113.06150755179674,27.875561475123337],[113.06153751645456,27.875553366019997],[113.06156530063183,27.87554282747194],[113.06164799156862,27.875513865515433],[113.06170566793948,27.875511398551087],[113.06174400884095,27.87551128678331],[113.06177392951373,27.87551263901853],[113.06180458379309,27.875513935783435],[113.06184351330805,27.875513154864798],[113.06187765831645,27.87550564258747],[113.06190597406068,27.8754858471128],[113.06192768331994,27.875449574603863],[113.06194175149635,27.87540235193199],[113.0619470548697,27.875352155150946],[113.06194512375035,27.875324080874474],[113.06193724448596,27.875297052522512],[113.06192131668864,27.875270895192898],[113.06189732512819,27.875249852373646],[113.06175227964289,27.875159617410226],[113.06207547771962,27.87528864303379],[113.06212779008713,27.8753002606581],[113.06210673684694,27.875539299902886],[113.06187826744868,27.87560984081749],[113.06180757992975,27.87559364063294],[113.06177796019409,27.87557291591453],[113.0617126216063,27.875610955124117],[113.0616428330668,27.875668595716803],[113.06136387675726,27.87620781709951]]]},
{"type":"Polygon","coordinates":[[[113.05790245694098,27.879266713269267],[113.05791696692032,27.879295667555056],[113.05791274180174,27.87933155715351],[113.05780628426722,27.879421206523784],[113.05776733147731,27.879427447832143],[113.05773791505516,27.879449493387384],[113.05770396898303,27.879449450881637],[113.05757620142393,27.879357577323976],[113.05748063800834,27.87924740016602],[113.05746995822389,27.87920345478558],[113.0574665647284,27.8790902550805],[113.05746363786538,27.87906097298678],[113.05764680244415,27.87912541591485],[113.05771999191597,27.879050302992848],[113.05759553943331,27.879006382200615],[113.05761498009177,27.87896274556232],[113.05774442489371,27.87897505535111],[113.05778842441883,27.878997661268016],[113.05776927884529,27.87907162315851],[113.05790245694098,27.879266713269267]]]},
{"type":"Polygon","coordinates":[[[113.06306640654287,27.874001871653903],[113.06308280121804,27.874055679918236],[113.06309542542104,27.874107399866723],[113.06300416788464,27.87414687605667],[113.06300521966627,27.87406393953938],[113.06303174388745,27.874053322644613],[113.06303289253917,27.87402615357034],[113.06306640654287,27.874001871653903]]]},
{"type":"Polygon","coordinates":[[[113.0628951005624,27.877533481686154],[113.06285527348146,27.877574870045454],[113.06288170058048,27.877611621439094],[113.06291153875443,27.877637965233696],[113.0627432483319,27.877637349252606],[113.06265802056551,27.87757890616057],[113.0626649811745,27.877549085907688],[113.0627360262842,27.87749406647396],[113.06278587236346,27.87746828052665],[113.0628951005624,27.877533481686154]]]},
{"type":"Polygon","coordinates":[[[113.0628376338984,27.87656096974829],[113.06281858819946,27.87657057629614],[113.062731903175,27.87656520211364],[113.06273182332792,27.876466780505158],[113.06300799559358,27.876469142901556],[113.06300622387026,27.87649319203297],[113.06287666768274,27.876541274896002],[113.0628376338984,27.87656096974829]]]},
{"type":"Polygon","coordinates":[[[113.06300416788464,27.87414687605667],[113.06297515090519,27.87416491831544],[113.06275421316414,27.874275447570326],[113.06283008618625,27.87446631326786],[113.06284122478841,27.874534077157307],[113.06288521885183,27.87464348788577],[113.06291005373637,27.874695742889244],[113.06294538044891,27.874725623156007],[113.06297779122633,27.87473871404396],[113.06303292670975,27.874753229799005],[113.0630643631842,27.87475871383315],[113.06309622995504,27.874759505127702],[113.06312682004258,27.874752780465943],[113.06315443050265,27.874735719366974],[113.0631775982449,27.874706656141313],[113.0631958397747,27.874668559737554],[113.06320891754949,27.874625553935864],[113.0632162782681,27.874581641265163],[113.06324479290572,27.874573489448473],[113.06327684083577,27.874549556647505],[113.063300375006,27.874646683983265],[113.0633092617344,27.87481360256405],[113.0628758046105,27.874856264166844],[113.06279799833159,27.874475764412075],[113.0626964921185,27.874269852482417],[113.06269346676157,27.87417494700058],[113.06279566307781,27.87407993287699],[113.06271077093803,27.87393597775583],[113.06296796570587,27.873781682624674],[113.06306192799792,27.873785984487625],[113.06306640654287,27.874001871653903],[113.06303289253917,27.87402615357034],[113.06303174388745,27.874053322644613],[113.06300521966627,27.87406393953938],[113.06300416788464,27.87414687605667]]]},
{"type":"Polygon","coordinates":[[[113.06300622387026,27.87649319203297],[113.06299177400464,27.876689461359998],[113.06294338563947,27.876686792824113],[113.06292886145562,27.876664207492144],[113.0628376338984,27.87656096974829],[113.06287666768274,27.876541274896002],[113.06300622387026,27.87649319203297]]]},
{"type":"Polygon","coordinates":[[[113.06142751176601,27.87514836332546],[113.06122285378251,27.875141684389057],[113.06118138686548,27.875145883879977],[113.06102219703338,27.875128354352384],[113.06103167464028,27.874903944234507],[113.06096981932959,27.874909924958708],[113.0608633942428,27.874744431799066],[113.06095936516903,27.87463917780128],[113.06103519787159,27.874468988556504],[113.06092701977794,27.87421303710923],[113.06085253633738,27.874144256080935],[113.06078736455133,27.874199986821022],[113.06074592360306,27.8741261107285],[113.06093855509769,27.87402848908405],[113.06101804362417,27.873988205964306],[113.06112654907827,27.87387938550054],[113.06116753993786,27.873910089792854],[113.06132887472683,27.873677642411007],[113.06145427373421,27.87402285514309],[113.06151577705845,27.874159094028286],[113.06153318587492,27.87422721739795],[113.06153250024373,27.874306771784905],[113.06153766734832,27.874366654898317],[113.06155079102032,27.87443362210805],[113.06154870391565,27.874506958115315],[113.06151352779335,27.874501836282715],[113.06135535069183,27.874459274764114],[113.06138407132666,27.87443889834791],[113.06136213207975,27.874418455913393],[113.06129107891111,27.8744102583391],[113.06125283122283,27.87440584550521],[113.06117156607029,27.874413088266742],[113.06116750686431,27.874609369498728],[113.06118894736309,27.874706503659972],[113.06121854303457,27.8747563614279],[113.06129532843097,27.874933693967073],[113.06134488388433,27.874931863039382],[113.06143847127521,27.874998023579924],[113.06144514276923,27.875062195714627],[113.06149035545873,27.875079676329467],[113.06142751176601,27.87514836332546]]]},
{"type":"Polygon","coordinates":[[[113.06150196104551,27.87657024293387],[113.06121300233738,27.876623006799097],[113.06121104274077,27.87654679105076],[113.06152400366136,27.876534095484164],[113.06150196104551,27.87657024293387]]]},
{"type":"Polygon","coordinates":[[[113.06207531865621,27.876148538676944],[113.06202815449907,27.876212662194288],[113.06201622932375,27.876149376520477],[113.0620046135699,27.876120071477533],[113.06198029013845,27.87609898580986],[113.0620520837321,27.87605531301308],[113.0621643883409,27.87602743826202],[113.06212252079168,27.87608436126123],[113.06207531865621,27.876148538676944]]]},
{"type":"Polygon","coordinates":[[[113.0625764421472,27.875869450982535],[113.06252332312816,27.875895347260702],[113.06247424980951,27.875875333191672],[113.06244324961253,27.875860658282622],[113.06240498899186,27.875841055174035],[113.06255370273078,27.875742334145038],[113.06255822325028,27.875769354968487],[113.06256518368268,27.87580759554075],[113.0625764421472,27.875869450982535]]]},
{"type":"Polygon","coordinates":[[[113.06323363202509,27.875617991353792],[113.06312014587371,27.875603650396624],[113.06302413949192,27.87560873138197],[113.06289975270818,27.87563795129974],[113.06296396449457,27.875577530924037],[113.06311826937689,27.875540633390735],[113.06328947850662,27.875506714468994],[113.06325785883622,27.875621053275793],[113.06323363202509,27.875617991353792]]]},
{"type":"Polygon","coordinates":[[[113.06207531865621,27.876148538676944],[113.06202815449907,27.876212662194288],[113.06201622932375,27.876149376520477],[113.0620046135699,27.876120071477533],[113.06198029013845,27.87609898580986],[113.0620520837321,27.87605531301308],[113.0621643883409,27.87602743826202],[113.06212252079168,27.87608436126123],[113.06207531865621,27.876148538676944]]]},
{"type":"MultiPolygon","coordinates":[[[[113.06198029013845,27.87609898580986],[113.0620046135699,27.876120071477533],[113.06201622932375,27.876149376520477],[113.06195671158879,27.87619334034119],[113.06192400266991,27.87619890888868],[113.06190819811668,27.876120011104323],[113.06198029013845,27.87609898580986]]],[[[113.06152400366136,27.876534095484164],[113.06191224564559,27.876525785928873],[113.06188652460808,27.876539739408148],[113.06170463886642,27.876546257246535],[113.06160913773489,27.876553171467634],[113.06150196104551,27.87657024293387],[113.06152400366136,27.876534095484164]]]]},
{"type":"Polygon","coordinates":[[[113.06150196104551,27.87657024293387],[113.06121300233738,27.876623006799097],[113.06121104274077,27.87654679105076],[113.06152400366136,27.876534095484164],[113.06150196104551,27.87657024293387]]]},
{"type":"Polygon","coordinates":[[[113.06269186115613,27.875726162714933],[113.06259619129165,27.8758012410848],[113.06256518368268,27.87580759554075],[113.0625764421472,27.875869450982535],[113.06252332312816,27.875895347260702],[113.06247424980951,27.875875333191672],[113.06244324961253,27.875860658282622],[113.06240498899186,27.875841055174035],[113.06255370273078,27.875742334145038],[113.06255822325028,27.875769354968487],[113.06261596336148,27.87573838568512],[113.06269186115613,27.875726162714933]]]},
{"type":"Polygon","coordinates":[[[113.06323363202509,27.875617991353792],[113.06312014587371,27.875603650396624],[113.06302413949192,27.87560873138197],[113.06289975270818,27.87563795129974],[113.06296396449457,27.875577530924037],[113.06311826937689,27.875540633390735],[113.06328947850662,27.875506714468994],[113.06325785883622,27.875621053275793],[113.06323363202509,27.875617991353792]]]},
{"type":"Polygon","coordinates":[[[113.06269888034437,27.873973759949443],[113.06258190992435,27.874044012351305],[113.06247608419429,27.873917448601084],[113.06267521706872,27.873898904422763],[113.06269888034437,27.873973759949443]]]},
{"type":"Polygon","coordinates":[[[113.05916971566079,27.877454025044738],[113.05920290659566,27.877459715034544],[113.05923376097343,27.877472345026884],[113.05929767308132,27.877501853688962],[113.05935211523422,27.877526670642887],[113.05943091022495,27.877561509694313],[113.05945717609495,27.877572827048752],[113.05948377690719,27.87759556458714],[113.0594460267129,27.87761983834582],[113.05943216015264,27.877653552627294],[113.05944056107313,27.877681145904326],[113.05944236914699,27.87770928612791],[113.05941814638594,27.87773933223047],[113.0593750361004,27.877751918702614],[113.05930966622249,27.877748553751495],[113.05926419123833,27.87774195435768],[113.05923129199186,27.87773469634203],[113.05919878303568,27.877717878239295],[113.0591762589366,27.877656982460906],[113.05916887437498,27.87761025347506],[113.05915527936888,27.877550959774112],[113.05913025939958,27.877519439893522],[113.05911912232884,27.877483111557687],[113.05913417495555,27.877452690733143],[113.05916971566079,27.877454025044738]]]},
{"type":"MultiPolygon","coordinates":[[[[113.06950991597097,27.86592578681749],[113.06948951993596,27.865959922890454],[113.06947754974316,27.865912442425536],[113.06950991597097,27.86592578681749]]],[[[113.06914982612581,27.866026904404368],[113.06921467987337,27.86606720202079],[113.06927121065048,27.866097920370848],[113.06929864467668,27.86610803010217],[113.06934967562076,27.86612767955907],[113.06937971601563,27.866171301834044],[113.06934370439828,27.866228940782904],[113.06932124101724,27.8661734779712],[113.06928670454732,27.866151391663124],[113.06922187861079,27.86610925624423],[113.06915440631325,27.866065037527598],[113.06911759725402,27.866041805234868],[113.06914982612581,27.866026904404368]]]]},
{"type":"Polygon","coordinates":[[[113.07217133578222,27.861071165997974],[113.07190630696502,27.861158445623794],[113.0715053676847,27.861137130735646],[113.07143283660265,27.860801728503723],[113.07153949880923,27.860803959669813],[113.07163732048538,27.860804345564407],[113.07171616917674,27.860805148710703],[113.07188243398248,27.860808244495157],[113.07203214265704,27.860812654366665],[113.07204533150374,27.860827985077613],[113.07217133578222,27.861071165997974]]]},
{"type":"Polygon","coordinates":[[[113.07383415504431,27.860482753578296],[113.07225578017726,27.861047849572895],[113.07217133578222,27.861071165997974],[113.07204533150374,27.860827985077613],[113.07208160837841,27.86081320188307],[113.07214688684712,27.86079362393303],[113.07225473134842,27.86076312723839],[113.07233520768428,27.860743042347938],[113.07240925964591,27.86072291962267],[113.07252662231305,27.86068108139504],[113.07256334500984,27.860665555752846],[113.0726469600298,27.860600311721768],[113.07270007022805,27.860569159752995],[113.07272819876508,27.86056172243546],[113.07276521276275,27.860542977414152],[113.07281394526377,27.86051764481104],[113.07295966184414,27.86044314512379],[113.07306025769056,27.86038675843302],[113.0731016460477,27.860360653615416],[113.07308858844598,27.860477510151984],[113.0731042601924,27.860506871379833],[113.07313509003198,27.860588741202125],[113.07314879897979,27.860611215362816],[113.07325254031888,27.860611751771746],[113.07328427516072,27.8606192268488],[113.07340226393974,27.860615099124235],[113.07344455212387,27.860514463202403],[113.07343084414094,27.860491989076436],[113.07350931386583,27.860466295629813],[113.07372200887532,27.86040775585806],[113.0737357631129,27.8604341102431],[113.07382999089491,27.86043838290364],[113.07383415504431,27.860482753578296]]]},
{"type":"Polygon","coordinates":[[[113.07383415504431,27.860482753578296],[113.07382999089491,27.86043838290364],[113.0737357631129,27.8604341102431],[113.07372200887532,27.86040775585806],[113.07350931386583,27.860466295629813],[113.07343084414094,27.860491989076436],[113.07342085484882,27.860422866523137],[113.07327041168406,27.860351597636733],[113.0731016460477,27.860360653615416],[113.07321439975782,27.860303297300515],[113.07331906698023,27.86025235529897],[113.07338783358279,27.860218068906146],[113.07343167695475,27.860192772714726],[113.07347950286007,27.860193546020295],[113.07353996634758,27.860171574587778],[113.07360079643323,27.860164516429645],[113.07369675830968,27.86018476196331],[113.07367763053408,27.860253554528324],[113.0737153809372,27.860308184544692],[113.07387464107299,27.860395925349305],[113.07390312161307,27.860462327006175],[113.07383415504431,27.860482753578296]]]},
{"type":"Polygon","coordinates":[[[113.08484421749945,27.86011655947025],[113.08481678411313,27.86010540433089],[113.08475865985697,27.85990233918986],[113.0847189273483,27.859877550457643],[113.08463738372662,27.859911044948834],[113.08448367550521,27.859960139830548],[113.0842521477051,27.860053797934288],[113.08404550628191,27.86015199715208],[113.08379001911857,27.860258714378407],[113.08371375855343,27.86027396327016],[113.08378434480964,27.860230938423207],[113.08411022378313,27.860073616297093],[113.08443610285465,27.85991629247947],[113.0846921488127,27.859773705933996],[113.08479713631012,27.85971042701318],[113.08479623116558,27.859818188000244],[113.08484421749945,27.86011655947025]]]},
{"type":"Polygon","coordinates":[[[113.08354489493779,27.858874751029173],[113.08337324548036,27.85903675391947],[113.08313737652624,27.858843968216505],[113.08338129326984,27.858709952205125],[113.08345082852418,27.85875181635834],[113.08357915271478,27.858842419243203],[113.08354489493779,27.858874751029173]]]},
{"type":"Polygon","coordinates":[[[113.0646277603404,27.86879352380913],[113.06462190287772,27.869306738600667],[113.06450664560298,27.86926681519136],[113.06433099674068,27.8692503446617],[113.06426719046947,27.869240226273654],[113.06415369260287,27.869204840534877],[113.06388942106038,27.86919259092627],[113.06376038506542,27.86917212929967],[113.06354855557036,27.869174532261862],[113.06349119847536,27.86916706680982],[113.06367135481845,27.868721900955713],[113.06433876661531,27.868829182885545],[113.06453010775643,27.868827010577867],[113.0646277603404,27.86879352380913]]]},
{"type":"Polygon","coordinates":[[[113.0646239876927,27.86824571918396],[113.06462854725336,27.86855741696807],[113.0644877472515,27.868517068566007],[113.06430931020226,27.868536555422956],[113.0640538325314,27.868440841884834],[113.06400167267459,27.868410296347957],[113.06412599077757,27.86821306323933],[113.06421138368164,27.868107602301535],[113.06424501941424,27.868070086573603],[113.06429709574152,27.86807016018204],[113.06437676826667,27.86807860500867],[113.06440922326331,27.86809934388569],[113.0644784044154,27.868181418795416],[113.06453367572169,27.86820671572245],[113.06456366525963,27.868220156136747],[113.0646239876927,27.86824571918396]]]},
{"type":"Polygon","coordinates":[[[113.06385914201232,27.868430542434623],[113.06389329582292,27.86843732508673],[113.06392868263637,27.868468992996053],[113.06396552259743,27.868494616207908],[113.06399686566556,27.86850414987313],[113.06404654341432,27.868512792853302],[113.06406280911575,27.868536325600427],[113.06399256097531,27.868530098382127],[113.06395845243905,27.868520997105087],[113.06393014522064,27.868515012098356],[113.06389922808339,27.868511445628464],[113.06373019644494,27.86850396394351],[113.06376649581857,27.86843312668941],[113.06381899210415,27.86842676890551],[113.06385914201232,27.868430542434623]]]},
{"type":"Polygon","coordinates":[[[113.06971864461833,27.86844297285598],[113.06984189077028,27.868447348445454],[113.06985965798826,27.868571754523686],[113.07001683546085,27.868950802916977],[113.07002031462679,27.868981654087413],[113.07003971921031,27.869153705471213],[113.06941292239178,27.869254633653153],[113.06946127301573,27.86918090212287],[113.06944658054297,27.86902418578808],[113.06944495243609,27.86896220899188],[113.06944931096008,27.86890033755621],[113.06945962379915,27.86883902512842],[113.06947581599565,27.868778725067425],[113.06949776698164,27.86871988140051],[113.06952531668645,27.868662927060008],[113.06955826047582,27.86860828204461],[113.06958445003643,27.86856232499431],[113.06960360565347,27.868513704665062],[113.06967817092601,27.86844153494798],[113.06971864461833,27.86844297285598]]]},
{"type":"Polygon","coordinates":[[[113.06857570320034,27.866569105290537],[113.06900377256959,27.8667939676973],[113.06880207270395,27.867184835760977],[113.06844763052199,27.866918263193412],[113.06775850548931,27.866664397391443],[113.06780071931479,27.866659482658747],[113.06857570320034,27.866569105290537]]]},
{"type":"Polygon","coordinates":[[[113.06735225287265,27.866781615848602],[113.06756184086738,27.867005057426194],[113.06764669810892,27.86702514012398],[113.06800603232541,27.86711018237109],[113.06800444348906,27.867413705216613],[113.06820726759236,27.867576164766835],[113.06846568536675,27.86747516975789],[113.06879704676054,27.867460254391855],[113.06878580446283,27.867741656721137],[113.06896608733554,27.86803161576887],[113.0690973509615,27.86803684469091],[113.06920029614682,27.868040945762324],[113.06932453296264,27.868045895148217],[113.06936292504169,27.86846301180099],[113.06920597981663,27.86853321415359],[113.06915451916741,27.868556232366387],[113.0690976681702,27.868668092533103],[113.06905098505274,27.868790136296962],[113.06878708622094,27.868779331481086],[113.06862386793952,27.868868461135513],[113.06886530149823,27.86917259541324],[113.06870621645707,27.86939005729204],[113.06836111656534,27.869464668929716],[113.06801752034343,27.869544575635366],[113.06767553151298,27.869629753757838],[113.06733525278128,27.869720179640105],[113.06699678487249,27.869815824198774],[113.06666023052713,27.86991666016966],[113.06462294219203,27.87058620754767],[113.06462437126025,27.870393335152663],[113.0646263173412,27.87005171290127],[113.06482753150621,27.86992555205334],[113.06502220770214,27.86995747863803],[113.06524565023113,27.869916292941184],[113.06532306776117,27.869805039449325],[113.06542641327064,27.869794607033096],[113.06542494364126,27.869878192293747],[113.06538051341974,27.869931090941993],[113.06530597072914,27.869991662720906],[113.06537819764416,27.870052219511404],[113.06546466544262,27.869958670292508],[113.06552097441968,27.869926826482196],[113.06555473142251,27.869907736594946],[113.06560808584757,27.869865218161273],[113.0656310231768,27.869837247423774],[113.0656129937003,27.869805616335277],[113.06558950433772,27.869777098242185],[113.06595847359758,27.869740892780673],[113.06631531268042,27.86944441183538],[113.06624264219593,27.86926361416054],[113.0663405711141,27.869147422494816],[113.06663365807422,27.869192324218364],[113.06677677873103,27.8691024555111],[113.06695888987987,27.868855284967324],[113.06698295139468,27.868738093171903],[113.06702892123667,27.868514197073896],[113.06708128972204,27.867594789584295],[113.06751650520935,27.86762486645239],[113.06748026174289,27.867245583661795],[113.06720868667229,27.866945982141306],[113.06732382397021,27.866753704383555],[113.06735225287265,27.866781615848602]]]},
{"type":"Polygon","coordinates":[[[113.0667975869179,27.86677359869155],[113.06664532407831,27.86698838392654],[113.06605972471884,27.867136716559134],[113.06573251473242,27.867405195823874],[113.06588217563198,27.86771299768491],[113.06618180627503,27.86756843347446],[113.066305438484,27.867260178742463],[113.06679931676409,27.86719387323098],[113.06652141628896,27.867762441715847],[113.06665685287807,27.86791703935472],[113.06680044691512,27.868079956392464],[113.06689203878113,27.868532490389573],[113.06677235258198,27.868567094735806],[113.06673372322314,27.868432295011658],[113.06670756418418,27.868341011841654],[113.06666644766464,27.868197529403613],[113.06665050317172,27.86816097867781],[113.0666303735537,27.86804834684648],[113.06652765726236,27.868052384315806],[113.06652162717573,27.868229732009354],[113.06651864572576,27.868321948582143],[113.06653705367353,27.868450049841297],[113.06658043718903,27.868622581540713],[113.06607579650853,27.86876848161246],[113.06522830041634,27.86936883215771],[113.06526581484522,27.869730013498053],[113.06498021405598,27.869881471437658],[113.0649403360162,27.86986571458451],[113.06462739375014,27.86974206738058],[113.06462190287772,27.869306738600667],[113.0646277603404,27.86879352380913],[113.06462854725336,27.86855741696807],[113.0646239876927,27.86824571918396],[113.06464673063414,27.867999765357077],[113.06466164745173,27.867903235505967],[113.06468476955239,27.867750974596486],[113.0647339854768,27.86754542108152],[113.06481074832962,27.867311718842767],[113.06489773527548,27.867106280596907],[113.06500816483498,27.8668945803152],[113.06551704105155,27.866871067012482],[113.06601508951522,27.86684211512413],[113.06639829588829,27.866813009401596],[113.06660309893891,27.866793289468895],[113.0667975869179,27.86677359869155]]]},
{"type":"Polygon","coordinates":[[[113.07027908665854,27.876544781196294],[113.07023212145734,27.87655867512046],[113.0701056028153,27.87644167294329],[113.07011420186586,27.876416889230214],[113.07007330952995,27.876411808615885],[113.06917438370658,27.875580492799063],[113.06910415048424,27.874932953257613],[113.06933524578156,27.874835465748898],[113.06950492835766,27.874721999374213],[113.06967677612573,27.87453524039537],[113.06992804856253,27.87414240599585],[113.07009930912437,27.87392041148649],[113.07014279063067,27.873959640611773],[113.07039778120667,27.873826012134852],[113.07030012650371,27.873688743759462],[113.0704983933943,27.873576743780838],[113.07080334500752,27.873442890936367],[113.07064630313458,27.873943296747616],[113.07055274180459,27.874498421769538],[113.07023001115701,27.87444748033946],[113.07013454647237,27.874925065023362],[113.07018550985167,27.875307478859014],[113.07026814396585,27.875927538450863],[113.07033129879476,27.87595811249671],[113.07071670456368,27.87614468575013],[113.07077132725517,27.87639916184081],[113.07053476709098,27.876469143804968],[113.0702952372677,27.876439383006435],[113.07027908665854,27.876544781196294]]]},
{"type":"Polygon","coordinates":[[[113.06872178934871,27.874906842638993],[113.06869923423066,27.87497889104724],[113.06710753728684,27.875346139645377],[113.06689396753491,27.875372592440822],[113.0667077879574,27.87539151818629],[113.06635326505207,27.875320101786244],[113.06627381023901,27.875265975174564],[113.06639720672129,27.87488751175474],[113.06673675622048,27.874381115363978],[113.06697351897373,27.87453418685004],[113.06704472857506,27.874520519414357],[113.06725557863415,27.874480049404585],[113.0676876483958,27.87439711852772],[113.06800039705476,27.874094420808127],[113.06810799898315,27.87415529108727],[113.0681353072766,27.874168449153405],[113.06812370445925,27.874190854691587],[113.0682177224038,27.874215070280307],[113.06878245093374,27.874534006859694],[113.06872178934871,27.874906842638993]]]},
{"type":"Polygon","coordinates":[[[113.06964062315869,27.870590257398955],[113.06941555514054,27.870128785768635],[113.07000686271928,27.87004025532571],[113.0702909153163,27.870098560026374],[113.07046108610105,27.87000410468477],[113.07046815878161,27.869971189763323],[113.0705264002435,27.869700128838595],[113.07051936506572,27.869654294177458],[113.07128472474452,27.869561512716007],[113.07137463323213,27.86983546472037],[113.07149520851165,27.87038151515984],[113.07153544982565,27.870796785806736],[113.07145519228011,27.87178411260232],[113.07124856401947,27.872367340356607],[113.07088267564968,27.872412640771888],[113.07059303979126,27.872591500945756],[113.07037702617068,27.87268895160544],[113.07012042033742,27.87301205598969],[113.06996773526484,27.873056142221284],[113.06997750330214,27.873101323994813],[113.07028179500276,27.873139468584014],[113.07029140911449,27.873202695658247],[113.07018910534067,27.873292237685533],[113.070137028852,27.873445280581855],[113.07018478852406,27.873519177622914],[113.07022110463284,27.873575368905335],[113.07000487793603,27.8737571842092],[113.06980386794667,27.873926203170686],[113.06971263987599,27.87382678846803],[113.0697088149203,27.873649925521427],[113.06927533617845,27.873485980079327],[113.06927439247649,27.873596393040003],[113.06876672396044,27.873592965653643],[113.06877008470232,27.873623150121634],[113.06927354373111,27.873652571027858],[113.06927230371964,27.87373456800083],[113.06942289359769,27.873773136071325],[113.06935515444496,27.874014672418784],[113.06909800193459,27.873957722067612],[113.0690484359051,27.874159789933767],[113.0688527363111,27.87412468402798],[113.06876175369445,27.874106718067534],[113.06843956514544,27.874043097674676],[113.06825535592004,27.874006723194704],[113.06826054675247,27.873415253903122],[113.06811697426951,27.87337750528496],[113.0679683758814,27.873217184211146],[113.06841348866077,27.872788171232358],[113.06873389118114,27.872479355124153],[113.06859728109728,27.871980513687177],[113.06878521476261,27.871946560892308],[113.06900072904631,27.871907623759725],[113.06930026318031,27.871553791258044],[113.0693024993053,27.871292134122278],[113.06904129387351,27.8709655365588],[113.06903904905053,27.870868710798774],[113.06934374176501,27.870337530706955],[113.06942037177912,27.87058726899211],[113.06972274410322,27.870920353318297],[113.06974636768737,27.870807072332695],[113.06964062315869,27.870590257398955],[113.0697001064728,27.87063815760711],[113.06981712545523,27.870706177773748],[113.06992181994418,27.870778963782133],[113.0699878887663,27.870837969801777],[113.07001997777597,27.870886571207862],[113.0700928497045,27.870955684805583],[113.07010392717012,27.8709890090241],[113.07009608242228,27.871018379821045],[113.07007544234649,27.871038429110236],[113.07006376378439,27.871065631047134],[113.07005055423257,27.87111017062804],[113.07003304152876,27.871178371552357],[113.07002098664015,27.871228237178936],[113.07000418249164,27.871279213111066],[113.0699567018027,27.871338633585186],[113.06991074432003,27.871395653320697],[113.06986945534547,27.87145435396499],[113.0698507501003,27.871498458532688],[113.06979484728126,27.871555906518275],[113.0697408478587,27.871599253260264],[113.0697240304063,27.87161562877425],[113.06987470229615,27.87171417846148],[113.06984782103433,27.871784334649472],[113.06984056485706,27.871806954643297],[113.06991164568404,27.871827733514316],[113.07003410223665,27.871812658716962],[113.07006287305741,27.871795410924065],[113.07007013020335,27.871772790924215],[113.07012819857079,27.87169729392404],[113.0701629528932,27.871652108277257],[113.07018332945736,27.871622143432482],[113.07010604700734,27.87158968478565],[113.07011330412935,27.87156706478231],[113.070115922355,27.87153453221285],[113.07012238021531,27.87146697949712],[113.07012577863928,27.871431427617296],[113.07013336024951,27.871395418496494],[113.07045526428298,27.871413786171328],[113.07046252132017,27.871391166146996],[113.07044407065463,27.871283897810436],[113.07039096870994,27.871191102778397],[113.07040221128273,27.87117797584295],[113.07045083393348,27.871137234577017],[113.07044387415725,27.871071973516944],[113.0703995820565,27.870995073554713],[113.07021361194604,27.87084126309354],[113.07003375452337,27.870732085272056],[113.06989704111172,27.87065849779835],[113.06979564198768,27.870615388687575],[113.06980289910253,27.870592768697406],[113.06979890693012,27.870544354956092],[113.06967584616763,27.87058064080084],[113.06964062315869,27.870590257398955]],[[113.06954894275496,27.872582412770917],[113.06915677624455,27.87250151355958],[113.06912208996594,27.87269901786539],[113.06911821444623,27.87272108676101],[113.0692873107478,27.872794893583052],[113.06957129470494,27.872832902661038],[113.06954894275496,27.872582412770917]],[[113.06852809360662,27.873315099484696],[113.06852110577829,27.873340134007666],[113.06904792274653,27.873479039210363],[113.06905877031615,27.87339790384612],[113.06904073928011,27.873366272281164],[113.06891627096702,27.873253971331703],[113.06888959626816,27.87322990416606],[113.06887613037536,27.87318629445771],[113.06911107967143,27.873217793421205],[113.0691533897768,27.87301956911653],[113.06912968498641,27.873014520345222],[113.0688033419188,27.872945020368157],[113.0687436957148,27.873138462501753],[113.06858395517847,27.873114979106614],[113.06852809360662,27.873315099484696]],[[113.06860677081262,27.87381067936579],[113.06859808803137,27.87383692869213],[113.06892245655395,27.873902281439268],[113.06897484354336,27.873713148434412],[113.06894950870735,27.873707884700938],[113.06866062891972,27.87364786439637],[113.06860677081262,27.87381067936579]]]},
{"type":"Polygon","coordinates":[[[113.06903107918244,27.870524984794255],[113.06902414220856,27.87022577258841],[113.06932968246791,27.870004419962328],[113.06903107918244,27.870524984794255]]]},
{"type":"Polygon","coordinates":[[[113.06550673131288,27.876240296180505],[113.06534460101602,27.876346551352583],[113.0653447472466,27.876301599821897],[113.06533876155181,27.87620386811224],[113.06533277586506,27.876106136401226],[113.06531644070601,27.876009391148504],[113.06530010456581,27.875912644984073],[113.06528089394912,27.87581635575499],[113.06526168336389,27.87572006652273],[113.06516420861497,27.87556891731313],[113.06529097171786,27.875629609281596],[113.06574208719165,27.875285285263445],[113.06584382329194,27.875207636253744],[113.0660671438606,27.875293657273968],[113.06608275418503,27.87536274784671],[113.06594643135293,27.87585442641097],[113.0658826470821,27.87585429480026],[113.06574838234239,27.87585338517846],[113.06550673131288,27.876240296180505]]]},
{"type":"Polygon","coordinates":[[[113.05607297448444,27.868858406085906],[113.05612520251529,27.868859872490926],[113.05610764403504,27.86894587391021],[113.05608614722992,27.869081872791643],[113.05607754514114,27.869147952804813],[113.05581579945083,27.869143633680114],[113.05571268648843,27.869096310430113],[113.05565078857924,27.86897640187093],[113.05569546335536,27.868853041706256],[113.05607297448444,27.868858406085906]]]},
{"type":"MultiPolygon","coordinates":[[[[113.05628047421207,27.869311561827484],[113.05623639251661,27.8693027874212],[113.0562069143638,27.869299553908405],[113.05615690295532,27.86930074558554],[113.05606600039609,27.86928902945388],[113.05606824683596,27.869219384201408],[113.05617403159832,27.86916510750521],[113.05632428479026,27.869166121272233],[113.0563059589606,27.869227261354318],[113.05628047421207,27.869311561827484]]],[[[113.0561158483128,27.86932404213494],[113.05615087813642,27.869326957247395],[113.05618291121377,27.869337070373316],[113.05621712328032,27.869342375522574],[113.0562714710848,27.8693522217579],[113.05627201532218,27.869391358943627],[113.05627468020646,27.869429491023244],[113.05626651699251,27.86947399154454],[113.05626196980515,27.869505093049337],[113.05615936906099,27.86948846682454],[113.05607945470165,27.86943256186982],[113.05604945217,27.869363772353548],[113.0560587160934,27.86932231928351],[113.0561158483128,27.86932404213494]]]]},
{"type":"Polygon","coordinates":[[[113.06934370439828,27.866228940782904],[113.06932027916365,27.866275122192704],[113.06929293166695,27.8663229707823],[113.06925770772253,27.866396071739715],[113.0692304191609,27.866442363310806],[113.06920261150276,27.86649652500497],[113.06913988579734,27.866503733480045],[113.0690211836214,27.866283009259977],[113.0690593127913,27.86620488852391],[113.06907779205706,27.866069294600624],[113.06909687059905,27.866019090231426],[113.06911759725402,27.866041805234868],[113.06915440631325,27.866065037527598],[113.06922187861079,27.86610925624423],[113.06928670454732,27.866151391663124],[113.06932124101724,27.8661734779712],[113.06934370439828,27.866228940782904]]]},
{"type":"MultiPolygon","coordinates":[[[[113.07222840215248,27.881576107939672],[113.07177814659592,27.881653273467574],[113.07184211146688,27.88160166476338],[113.0720511747097,27.881540298726573],[113.07222840215248,27.881576107939672]]],[[[113.07290873022875,27.881718081998574],[113.07327864627172,27.881793483391284],[113.07327823704567,27.881876263738764],[113.073278523806,27.881941702616505],[113.07288699146709,27.88173460071538],[113.07262068493674,27.881657952548196],[113.07290873022875,27.881718081998574]]],[[[113.07328186423588,27.88377506296524],[113.07300122753752,27.8838341566426],[113.0727563764854,27.883859873713643],[113.07251057287944,27.883848755874855],[113.0727200750441,27.883826454067073],[113.07287915150397,27.88377522563622],[113.07305364728155,27.883689624964802],[113.07325822795323,27.883670546605554],[113.07328035471812,27.88235930282689],[113.07328186423588,27.88377506296524]]],[[[113.071533817601,27.88362856406569],[113.07177862049618,27.883811137846955],[113.07235082143029,27.883841529952576],[113.07176154921099,27.8838907850053],[113.07144939637543,27.883937412546118],[113.07122847269278,27.883298350082622],[113.0712351974177,27.882527232102856],[113.07126017201568,27.882479397987687],[113.071533817601,27.88362856406569]]]]},
{"type":"MultiPolygon","coordinates":[[[[113.07202546848639,27.875117953716124],[113.07210996837732,27.875173304777277],[113.07213360970094,27.875200649797094],[113.07216716589399,27.875254404699785],[113.07216540454422,27.875277357742352],[113.07212635273777,27.87522326899703],[113.07210271241894,27.875195924885084],[113.07201821251462,27.875140573819326],[113.0718432611557,27.875049108596233],[113.07202546848639,27.875117953716124]]],[[[113.0708946942123,27.875392635763827],[113.07082261015734,27.87542475259267],[113.07088751318689,27.875379548886976],[113.0708946942123,27.875392635763827]]],[[[113.0721556284675,27.87576719735296],[113.07223874117982,27.875817742284028],[113.07222592589625,27.875840469362235],[113.0721048465966,27.87576670675827],[113.07198082563016,27.87569141557692],[113.07198808266523,27.875668795485378],[113.0721556284675,27.87576719735296]]]]},
{"type":"MultiPolygon","coordinates":[[[[113.07163111715079,27.874393777900824],[113.07180048762105,27.87427857047847],[113.07184587553058,27.87430913521999],[113.07179323064882,27.874301190565937],[113.07163111715079,27.874393777900824]]],[[[113.07176310272106,27.87457014471146],[113.0717327856205,27.874543361950458],[113.0717400416075,27.874520741860813],[113.07176310272106,27.87457014471146]]],[[[113.07134713636162,27.87466819878973],[113.07127987197137,27.8746853229322],[113.0711692802742,27.8746548196073],[113.07110007401755,27.874621759000913],[113.07110050023194,27.874592031400223],[113.07117653637783,27.874632200452947],[113.07128712805442,27.874662703771627],[113.07135439242955,27.874645579625188],[113.07134713636162,27.87466819878973]]],[[[113.07093831479145,27.874687100592805],[113.07086013756961,27.874698415871357],[113.07094557094503,27.874664481451926],[113.07098981493243,27.874662135744604],[113.07106054916721,27.874667843910192],[113.07110092426542,27.874676709570732],[113.07109366814296,27.874699328720506],[113.07105329201403,27.87469046395311],[113.07098255878043,27.87468475579031],[113.07093831479145,27.874687100592805]]],[[[113.07173889619261,27.874830556752908],[113.07176961721497,27.87488441267248],[113.07186636124166,27.87500520750513],[113.07185751851885,27.875026594278847],[113.07176236121519,27.874907031859806],[113.0717316391674,27.874853176834147],[113.07170870387695,27.874802588278353],[113.07171595988017,27.874779969093623],[113.07173889619261,27.874830556752908]]]]},
{"type":"MultiPolygon","coordinates":[[[[113.06967584616763,27.87058064080084],[113.06965991545137,27.870563002191375],[113.06979890693012,27.870544354956092],[113.06967584616763,27.87058064080084]]],[[[113.06980289910253,27.870592768697406],[113.06990429820883,27.870635877802542],[113.07004101159765,27.870709465268718],[113.07022086899123,27.870818643080366],[113.07040683805928,27.87097245352472],[113.07044387415725,27.871071973516944],[113.0703995820565,27.870995073554713],[113.07021361194604,27.87084126309354],[113.07003375452337,27.870732085272056],[113.06989704111172,27.87065849779835],[113.06979564198768,27.870615388687575],[113.06980289910253,27.870592768697406]]],[[[113.07044407065463,27.871283897810436],[113.07039096870994,27.871191102778397],[113.07040221128273,27.87117797584295],[113.07044407065463,27.871283897810436]]],[[[113.07011330412935,27.87156706478231],[113.0701962013851,27.87160204626636],[113.07018332945736,27.871622143432482],[113.07010604700734,27.87158968478565],[113.07011330412935,27.87156706478231]]]]},
{"type":"MultiPolygon","coordinates":[[[[113.08405967301019,27.869502282386488],[113.08367129661862,27.869561806436895],[113.08355922725634,27.86956675089483],[113.08367854978128,27.869539185635418],[113.08406692608845,27.869479661562373],[113.08405967301019,27.869502282386488]]],[[[113.0859013104375,27.87023350468538],[113.08550180791465,27.869621057948546],[113.08546097439311,27.86963771560904],[113.0850459062838,27.86928582221618],[113.08488862913732,27.869376361526715],[113.0846477562639,27.869345590988846],[113.08455186179091,27.869332780375114],[113.08407600163247,27.86923682620473],[113.08455911475536,27.869310159521856],[113.08465501022484,27.869322970136867],[113.08489588203555,27.869353740654276],[113.08505315914299,27.869263201334263],[113.08546822820769,27.86961509471167],[113.0855090607043,27.869598437042004],[113.0859013104375,27.87023350468538]]],[[[113.08600582264783,27.870539912608514],[113.0859289640394,27.870377097393416],[113.08593621678851,27.870354477368217],[113.08600582264783,27.870539912608514]]],[[[113.08612795623824,27.870828891599828],[113.0860373548691,27.87082328691109],[113.08604460763597,27.87080066597954],[113.08612795623824,27.870828891599828]]]]},
{"type":"Polygon","coordinates":[[[113.08153626681623,27.86220129408036],[113.08253813217448,27.862207193642696],[113.08253690555335,27.861782942961675],[113.08295590198244,27.86174960568259],[113.0832077429758,27.862360115594548],[113.08453453923242,27.86190703222702],[113.08437225674815,27.861513643772156],[113.08451043590416,27.861514511306197],[113.08452081166935,27.861320514277487],[113.08505507333692,27.861345168884434],[113.0849174364606,27.864477756265362],[113.08490597937227,27.86473680883726],[113.08477759374874,27.864729193188694],[113.08469323429813,27.864671182607392],[113.08453148982537,27.864567005433027],[113.08436695662411,27.86446125486061],[113.08424929739725,27.864387903657185],[113.08420065470231,27.864357721987417],[113.08403567869142,27.864252546475235],[113.08386993745867,27.86414833658441],[113.08248086107052,27.86329887920591],[113.08232312189288,27.86327837218932],[113.08223052278737,27.863142973700462],[113.08203707661522,27.863013440448054],[113.08187000282255,27.862910825463448],[113.08183262622006,27.862889433483026],[113.08170115014413,27.862810185347982],[113.08152431543351,27.862702932006084],[113.08149968587475,27.86268781834747],[113.0815245399756,27.86262463370264],[113.08153626681623,27.86220129408036],[113.08161131669743,27.862281804396172],[113.08173939971255,27.862403606939612],[113.08189271117533,27.862507202428553],[113.08205479632782,27.862615831537294],[113.08221645193714,27.862725230890437],[113.0823783252964,27.862834250727115],[113.08253966983362,27.86294401488435],[113.08270119899669,27.86305371601974],[113.08286411268855,27.86316132557245],[113.08302681810682,27.863269472237654],[113.08319115634553,27.863375460388095],[113.08335628091416,27.863480463726084],[113.0835212251469,27.86358570027551],[113.08357833548185,27.863581300137422],[113.0838402122328,27.863757054244893],[113.08378723981797,27.863565204579476],[113.08357833548185,27.863581300137422],[113.08153626681623,27.86220129408036]]]},
{"type":"Polygon","coordinates":[[[113.0849174364606,27.864477756265362],[113.08487194739878,27.864449472579626],[113.08484250385935,27.864430313140232],[113.08467672901256,27.86432139837607],[113.0845136546196,27.864213884598893],[113.08435047730438,27.86410657477641],[113.084188552523,27.86399741339738],[113.08401612824416,27.863901355994063],[113.08385104459931,27.863796284223632],[113.0838402122328,27.863757054244893],[113.08357833548185,27.863581300137422],[113.0835212251469,27.86358570027551],[113.08335628091416,27.863480463726084],[113.08319115634553,27.863375460388095],[113.08302681810682,27.863269472237654],[113.08286411268855,27.86316132557245],[113.08270119899669,27.86305371601974],[113.08253966983362,27.86294401488435],[113.0823783252964,27.862834250727115],[113.08221645193714,27.862725230890437],[113.08205479632782,27.862615831537294],[113.08189271117533,27.862507202428553],[113.08173939971255,27.862403606939612],[113.08161131669743,27.862281804396172],[113.08153626681623,27.86220129408036],[113.08253813217448,27.862207193642696],[113.08253690555335,27.861782942961675],[113.08295590198244,27.86174960568259],[113.0832077429758,27.862360115594548],[113.08453453923242,27.86190703222702],[113.08437225674815,27.861513643772156],[113.08451043590416,27.861514511306197],[113.08452081166935,27.861320514277487],[113.08505507333692,27.861345168884434],[113.0849174364606,27.864477756265362]]]},
{"type":"Polygon","coordinates":[[[113.08061753568757,27.862939892236227],[113.08065139458294,27.862962665106966],[113.08065973902525,27.8630559439907],[113.08021956660998,27.863493627981768],[113.08000805953435,27.863325924231194],[113.08002067283346,27.863279010089183],[113.08008359619991,27.863302928897863],[113.08022522312366,27.863170107058092],[113.07974852103739,27.86271496857472],[113.08007829332487,27.862624536079643],[113.08013857314364,27.862651866047162],[113.08029509479462,27.862706509435192],[113.08033827965205,27.862729090109458],[113.08043299154362,27.862841197873742],[113.08046456257641,27.86287447479183],[113.08053782210816,27.862936100802834],[113.08056185817284,27.86296017342703],[113.08061753568757,27.862939892236227]]]},
{"type":"Polygon","coordinates":[[[113.0803652567322,27.861817777097613],[113.08019629115154,27.861887934732852],[113.07989293003706,27.862007322357186],[113.07987903051695,27.861977533360903],[113.07982855103602,27.861786436989718],[113.07980217036508,27.86145603956582],[113.07975401943358,27.86137479008625],[113.07988451403602,27.861343867337876],[113.07990980303349,27.861433635582184],[113.08012846948355,27.861371506532173],[113.08025630560367,27.8616556092282],[113.0803652567322,27.861817777097613]]]},
{"type":"MultiPolygon","coordinates":[[[[113.07163111715079,27.874393777900824],[113.07180048762105,27.87427857047847],[113.07184587553058,27.87430913521999],[113.07179323064882,27.874301190565937],[113.07163111715079,27.874393777900824]]],[[[113.07176310272106,27.87457014471146],[113.0717327856205,27.874543361950458],[113.0717400416075,27.874520741860813],[113.07176310272106,27.87457014471146]]],[[[113.07134713636162,27.87466819878973],[113.07127987197137,27.8746853229322],[113.0711692802742,27.8746548196073],[113.07110007401755,27.874621759000913],[113.07110050023194,27.874592031400223],[113.07117653637783,27.874632200452947],[113.07128712805442,27.874662703771627],[113.07135439242955,27.874645579625188],[113.07134713636162,27.87466819878973]]],[[[113.07093831479145,27.874687100592805],[113.07086013756961,27.874698415871357],[113.07094557094503,27.874664481451926],[113.07098981493243,27.874662135744604],[113.07106054916721,27.874667843910192],[113.07110092426542,27.874676709570732],[113.07109366814296,27.874699328720506],[113.07105329201403,27.87469046395311],[113.07098255878043,27.87468475579031],[113.07093831479145,27.874687100592805]]],[[[113.07173889619261,27.874830556752908],[113.07176961721497,27.87488441267248],[113.07186636124166,27.87500520750513],[113.07185751851885,27.875026594278847],[113.07176236121519,27.874907031859806],[113.0717316391674,27.874853176834147],[113.07170870387695,27.874802588278353],[113.07171595988017,27.874779969093623],[113.07173889619261,27.874830556752908]]]]},
{"type":"MultiPolygon","coordinates":[[[[113.08405967301019,27.869502282386488],[113.08367129661862,27.869561806436895],[113.08355922725634,27.86956675089483],[113.08367854978128,27.869539185635418],[113.08406692608845,27.869479661562373],[113.08405967301019,27.869502282386488]]],[[[113.0859013104375,27.87023350468538],[113.08550180791465,27.869621057948546],[113.08546097439311,27.86963771560904],[113.0850459062838,27.86928582221618],[113.08488862913732,27.869376361526715],[113.0846477562639,27.869345590988846],[113.08455186179091,27.869332780375114],[113.08407600163247,27.86923682620473],[113.08455911475536,27.869310159521856],[113.08465501022484,27.869322970136867],[113.08489588203555,27.869353740654276],[113.08505315914299,27.869263201334263],[113.08546822820769,27.86961509471167],[113.0855090607043,27.869598437042004],[113.0859013104375,27.87023350468538]]],[[[113.08600582264783,27.870539912608514],[113.0859289640394,27.870377097393416],[113.08593621678851,27.870354477368217],[113.08600582264783,27.870539912608514]]],[[[113.08612795623824,27.870828891599828],[113.0860373548691,27.87082328691109],[113.08604460763597,27.87080066597954],[113.08612795623824,27.870828891599828]]]]},
{"type":"Polygon","coordinates":[[[113.08061753568757,27.862939892236227],[113.08065139458294,27.862962665106966],[113.08065973902525,27.8630559439907],[113.08021956660998,27.863493627981768],[113.08000805953435,27.863325924231194],[113.08002067283346,27.863279010089183],[113.08008359619991,27.863302928897863],[113.08022522312366,27.863170107058092],[113.07974852103739,27.86271496857472],[113.08007829332487,27.862624536079643],[113.08013857314364,27.862651866047162],[113.08029509479462,27.862706509435192],[113.08033827965205,27.862729090109458],[113.08043299154362,27.862841197873742],[113.08046456257641,27.86287447479183],[113.08053782210816,27.862936100802834],[113.08056185817284,27.86296017342703],[113.08061753568757,27.862939892236227]]]},
{"type":"Polygon","coordinates":[[[113.0803652567322,27.861817777097613],[113.08019629115154,27.861887934732852],[113.07989293003706,27.862007322357186],[113.07987903051695,27.861977533360903],[113.07982855103602,27.861786436989718],[113.07980217036508,27.86145603956582],[113.07975401943358,27.86137479008625],[113.07988451403602,27.861343867337876],[113.07990980303349,27.861433635582184],[113.08012846948355,27.861371506532173],[113.08025630560367,27.8616556092282],[113.0803652567322,27.861817777097613]]]},
{"type":"Polygon","coordinates":[[[113.07327864627172,27.881793483391284],[113.07327823704567,27.881876263738764],[113.07320474669349,27.881875490925616],[113.07290873022875,27.881718081998574],[113.07255360905931,27.881609553119322],[113.0723981387907,27.881593898686855],[113.07229309213778,27.8815636635633],[113.07222840215248,27.881576107939672],[113.07177814659592,27.881653273467574],[113.07129282012805,27.88171269993729],[113.07107299198654,27.88171387089999],[113.07109619175252,27.881496061713776],[113.07141900891769,27.88133090520616],[113.07189608163323,27.88092276824638],[113.07196615042403,27.880739123877202],[113.07195923213975,27.88035424893005],[113.07201079560623,27.880212553206317],[113.07201826202011,27.880177916577896],[113.0720540119764,27.880088715888302],[113.07266495244058,27.880119586351036],[113.07307001035244,27.880187782263167],[113.07334186152836,27.880504283820294],[113.07327864627172,27.881793483391284]]]},
{"type":"Polygon","coordinates":[[[113.07109619175252,27.881496061713776],[113.07102589351703,27.881512281832748],[113.07078201145782,27.881607299958002],[113.07073315539324,27.88162737296078],[113.07063434291635,27.881668414715246],[113.0705745447814,27.881689356822914],[113.07049313882726,27.881726542010927],[113.07041341136218,27.881701300846252],[113.07034713407886,27.88166961214182],[113.07033003125387,27.881594376231646],[113.07030925498623,27.881570565656954],[113.07016215040034,27.881384574309113],[113.07025884575475,27.881334827497003],[113.07040719402981,27.881255681304893],[113.07052542082414,27.881196573563376],[113.07070982434927,27.881097742428768],[113.07074838229788,27.881062447411452],[113.07077082407812,27.88104412823552],[113.07080159894772,27.881019005802866],[113.070884669801,27.880950033082737],[113.07091200050981,27.880979720318727],[113.07096286725941,27.88094258624818],[113.07100849235293,27.880741692309357],[113.07101066202621,27.880708774159483],[113.07100527436342,27.880676839143934],[113.07098673544434,27.880594929109044],[113.07096663884327,27.880506116677147],[113.07094428130878,27.88040416119507],[113.07091973198274,27.88033022232302],[113.0711580981759,27.8802672116177],[113.07136168452772,27.880213027315758],[113.07149876862887,27.880207390704435],[113.07160032926637,27.880187906012743],[113.07179777404531,27.880076046895603],[113.07183440261912,27.88005662837562],[113.07186696805557,27.880098345169678],[113.0719112557122,27.880092326166842],[113.07202108728652,27.88009699863328],[113.07201826202011,27.880177916577896],[113.07201079560623,27.880212553206317],[113.07196028628107,27.88021737088489],[113.07192981999373,27.880232082923428],[113.07189650739146,27.88023893104892],[113.07189103832813,27.880343129022783],[113.07189775876095,27.880378490056383],[113.07185933446787,27.880370309956998],[113.07179812611032,27.88034393282487],[113.0717908153743,27.880372568272893],[113.07177401227705,27.88043834235446],[113.07176895453168,27.880470824207574],[113.07172455566327,27.880626816556514],[113.07170477960814,27.880703618581364],[113.07162023335901,27.880715033891352],[113.0715985883775,27.880794024065537],[113.0715873588753,27.880865762969382],[113.07157186508105,27.880959092674747],[113.07155341530841,27.88107205944951],[113.07152983664426,27.88109831870811],[113.07146110316711,27.881175539010282],[113.07144226620524,27.88119709302207],[113.07134490835193,27.881306243867854],[113.07125652586838,27.88135173617821],[113.07109619175252,27.881496061713776]]]},
{"type":"MultiPolygon","coordinates":[[[[113.07163111715079,27.874393777900824],[113.07180048762105,27.87427857047847],[113.07184587553058,27.87430913521999],[113.07179323064882,27.874301190565937],[113.07163111715079,27.874393777900824]]],[[[113.07176310272106,27.87457014471146],[113.0717327856205,27.874543361950458],[113.0717400416075,27.874520741860813],[113.07176310272106,27.87457014471146]]],[[[113.07134713636162,27.87466819878973],[113.07127987197137,27.8746853229322],[113.0711692802742,27.8746548196073],[113.07110007401755,27.874621759000913],[113.07110050023194,27.874592031400223],[113.07117653637783,27.874632200452947],[113.07128712805442,27.874662703771627],[113.07135439242955,27.874645579625188],[113.07134713636162,27.87466819878973]]],[[[113.07093831479145,27.874687100592805],[113.07086013756961,27.874698415871357],[113.07094557094503,27.874664481451926],[113.07098981493243,27.874662135744604],[113.07106054916721,27.874667843910192],[113.07110092426542,27.874676709570732],[113.07109366814296,27.874699328720506],[113.07105329201403,27.87469046395311],[113.07098255878043,27.87468475579031],[113.07093831479145,27.874687100592805]]],[[[113.07173889619261,27.874830556752908],[113.07176961721497,27.87488441267248],[113.07186636124166,27.87500520750513],[113.07185751851885,27.875026594278847],[113.07176236121519,27.874907031859806],[113.0717316391674,27.874853176834147],[113.07170870387695,27.874802588278353],[113.07171595988017,27.874779969093623],[113.07173889619261,27.874830556752908]]]]},
{"type":"Polygon","coordinates":[[[113.0849174364606,27.864477756265362],[113.08487194739878,27.864449472579626],[113.08484250385935,27.864430313140232],[113.08467672901256,27.86432139837607],[113.0845136546196,27.864213884598893],[113.08435047730438,27.86410657477641],[113.084188552523,27.86399741339738],[113.08401612824416,27.863901355994063],[113.08385104459931,27.863796284223632],[113.0838402122328,27.863757054244893],[113.08378723981797,27.863565204579476],[113.08357833548185,27.863581300137422],[113.0835212251469,27.86358570027551],[113.08335628091416,27.863480463726084],[113.08319115634553,27.863375460388095],[113.08302681810682,27.863269472237654],[113.08286411268855,27.86316132557245],[113.08270119899669,27.86305371601974],[113.08253966983362,27.86294401488435],[113.0823783252964,27.862834250727115],[113.08221645193714,27.862725230890437],[113.08205479632782,27.862615831537294],[113.08189271117533,27.862507202428553],[113.08173939971255,27.862403606939612],[113.08161131669743,27.862281804396172],[113.08153626681623,27.86220129408036],[113.08253813217448,27.862207193642696],[113.08253690555335,27.861782942961675],[113.0825359808347,27.861712748856995],[113.08272975888677,27.861711861203805],[113.08294162493439,27.861714996977074],[113.08295590198244,27.86174960568259],[113.0832077429758,27.862360115594548],[113.08453453923242,27.86190703222702],[113.08437225674815,27.861513643772156],[113.08451043590416,27.861514511306197],[113.08452081166935,27.861320514277487],[113.08505507333692,27.861345168884434],[113.0849174364606,27.864477756265362]]]},
{"type":"Polygon","coordinates":[[[113.08149968587475,27.86268781834747],[113.08152431543351,27.862702932006084],[113.08170115014413,27.862810185347982],[113.08183262622006,27.862889433483026],[113.08187000282255,27.862910825463448],[113.08203707661522,27.863013440448054],[113.08220840582754,27.86311063443331],[113.08223052278737,27.863142973700462],[113.08232312189288,27.86327837218932],[113.08248086107052,27.86329887920591],[113.08254905429271,27.86330774424499],[113.0827162727734,27.863410205990277],[113.0828825082376,27.863513694158083],[113.08305007150798,27.86361579777292],[113.08321704176163,27.863718551429205],[113.08338271487814,27.863822860891748],[113.08354675232677,27.86392926079691],[113.08371100482864,27.864035359661933],[113.08386993745867,27.86414833658441],[113.08403567869142,27.864252546475235],[113.08420065470231,27.864357721987417],[113.08424929739725,27.864387903657185],[113.08436695662411,27.86446125486061],[113.08453148982537,27.864567005433027],[113.08469323429813,27.864671182607392],[113.08477759374874,27.864729193188694],[113.08427684112989,27.86469948564368],[113.08290684680804,27.863854926093662],[113.08143235188318,27.862858999505534],[113.08149968587475,27.86268781834747]]]},
{"type":"Polygon","coordinates":[[[113.0812722022833,27.86767258623502],[113.08105086812778,27.86770780901696],[113.08101766191737,27.86771291595922],[113.08078306286838,27.867746609816763],[113.08076454174801,27.867630780956873],[113.08076949502293,27.86755493335656],[113.0807579683499,27.86738295190334],[113.08077417485022,27.86735893097628],[113.08080760456907,27.867351751146224],[113.08093277244423,27.867352005110373],[113.08108694706536,27.867352316879916],[113.08113085433787,27.867349796882852],[113.08114748580977,27.867328467655977],[113.0811777666374,27.867294601388373],[113.0812157740808,27.86726194967767],[113.08127533322056,27.86724769816712],[113.0815091992477,27.867168580273255],[113.08154009837125,27.867143611309427],[113.08150268507814,27.867070298569693],[113.08148672920001,27.86701754372082],[113.08147879726916,27.866986734404524],[113.08145658566939,27.866942920488903],[113.08149338501437,27.866929009965236],[113.0815379307925,27.86693732283418],[113.08157263285656,27.86692890247674],[113.08155419629294,27.866742148269193],[113.08156237179398,27.866681333080283],[113.08157907670504,27.866643443998814],[113.08175339312305,27.86661790861742],[113.08182627594915,27.866626796243747],[113.08187553881004,27.866628611214242],[113.08192515363308,27.86664239508386],[113.08198694194319,27.866665860653868],[113.08206382879196,27.86671480896095],[113.08214014266983,27.866825255575712],[113.08233051887282,27.86710474389249],[113.08242593831862,27.867239968868184],[113.08246871518286,27.86731594911843],[113.08251591250274,27.86739583332618],[113.0825448688996,27.86744442281104],[113.08254338715143,27.867508234078535],[113.0823775261379,27.867530527808118],[113.0822957662894,27.86755481114885],[113.08179765121167,27.867641863174878],[113.0813421829935,27.867724320420173],[113.08131856686897,27.867671142775926],[113.0812722022833,27.86767258623502]]]},
{"type":"Polygon","coordinates":[[[113.07525823113313,27.871847956091333],[113.07517913709604,27.871885735437047],[113.0751089408801,27.87191465679575],[113.07504670713308,27.87192004039974],[113.07498893989978,27.871927831545513],[113.07480206496938,27.871940756057114],[113.07464988597812,27.871913721150214],[113.07453579017941,27.871885940082628],[113.07445969734272,27.871871867555768],[113.07440441554682,27.871861643200376],[113.07436162963195,27.871849914617645],[113.07432113517798,27.871838814077634],[113.07426816664153,27.871811366397203],[113.07422799815487,27.871790112421518],[113.0741699109073,27.87176293081323],[113.07413261676017,27.87174552645015],[113.07409615521968,27.871728482278613],[113.07404275543988,27.87170352111488],[113.07396527515982,27.871666835017166],[113.0739338088026,27.871670988230534],[113.07397143396157,27.871620560356323],[113.07401403338487,27.87157825696328],[113.07413322472361,27.871461187351514],[113.07423875828636,27.87136403035264],[113.07426594870446,27.87138210586075],[113.07435556239253,27.87129446061797],[113.07432884176403,27.871262925684764],[113.07435442065142,27.871250194218526],[113.07447116003401,27.871117606001466],[113.07458697926064,27.87100162048643],[113.07488170657923,27.870704434089976],[113.07492716846728,27.870687372120138],[113.07496819780647,27.870705508739164],[113.07505728035383,27.870653848441247],[113.07502969953346,27.87062985937828],[113.07500521042589,27.87060839227528],[113.07502583561327,27.870588426947677],[113.07504222666772,27.87055531530513],[113.0751093836465,27.87046056023511],[113.07519984849505,27.87036756936372],[113.0753042473295,27.870273828190587],[113.07536509627258,27.870288167080748],[113.07542849689304,27.87033192331299],[113.07547770391778,27.870282243970397],[113.07554183766325,27.870274445652107],[113.07561494164361,27.870273048026647],[113.07565584901485,27.870271216204717],[113.07571707281875,27.870418340925212],[113.076062296743,27.870437477075132],[113.07620359571536,27.870455140021495],[113.07619253463552,27.87053625930997],[113.07627370419908,27.870566067033135],[113.0763418329662,27.87059173866103],[113.0764062085621,27.87061518255904],[113.07644504124477,27.870629323901287],[113.07644731398649,27.870692982398495],[113.07644958774506,27.870756640901938],[113.0764971163219,27.870811470091894],[113.0764487448728,27.87086896586871],[113.0764125756782,27.870899813047057],[113.07638150788073,27.87092584892809],[113.07632769475455,27.870973070501762],[113.0762609602266,27.87103163156893],[113.07629235857905,27.871059886860575],[113.07623785664416,27.87110738079471],[113.07599424196246,27.871318983857805],[113.07596551248885,27.87135529557647],[113.07593775146005,27.87139306741379],[113.0759172167063,27.871423556325748],[113.07589844251581,27.871459799389815],[113.07587028181328,27.871514152254125],[113.07583371614207,27.871584735643236],[113.07579761246416,27.871571201629575],[113.07564523074252,27.871661509432087],[113.07553405976252,27.87172839843705],[113.07555874234511,27.8717647938072],[113.0754087603655,27.871856673924448],[113.07534903205197,27.871807831566326],[113.07525823113313,27.871847956091333]]]},
{"type":"Polygon","coordinates":[[[113.07776330784812,27.8700076673845],[113.0779556545787,27.868658943629598],[113.078028102776,27.868589030799466],[113.07806813090937,27.86854884920048],[113.07940459241485,27.868375171536563],[113.07950550344718,27.868439135610764],[113.07945198250924,27.868849136302465],[113.07843681734848,27.86973569354492],[113.07839561965012,27.869702027005058],[113.07819344515273,27.8696804223383],[113.07813195716004,27.869629294660523],[113.07776330784812,27.8700076673845]]]},
{"type":"Polygon","coordinates":[[[113.07676786036824,27.864388200741285],[113.07684018136695,27.86428236083171],[113.07713421262234,27.864103365481878],[113.07736576428145,27.86462563266634],[113.07763979757448,27.86486627441408],[113.07810649804031,27.865266210624753],[113.07808626281061,27.86547482711762],[113.07797693393081,27.86575469075508],[113.07787648134357,27.865869052354924],[113.07784476359522,27.86587696929417],[113.07775184827665,27.86585009142229],[113.07760444590565,27.86596322752691],[113.07712117753397,27.865745556576506],[113.07678785899601,27.86568648873605],[113.07679358031695,27.865549320276507],[113.07678920844349,27.865519238347826],[113.07670746159684,27.86541720813111],[113.07668501370651,27.86538272910005],[113.07660016503459,27.865308273704862],[113.07662387115707,27.86511082436143],[113.07672685253678,27.864591306462792],[113.07676786036824,27.864388200741285]]]},
{"type":"Polygon","coordinates":[[[113.07080219519416,27.873283004170112],[113.07080043913997,27.87335719084879],[113.0706644690073,27.87340939674269],[113.070536367376,27.873461325287057],[113.07028896348717,27.87360094334902],[113.07029091082791,27.873537813174124],[113.07029238162963,27.873509447899266],[113.07030100735817,27.87345462617617],[113.07038680576039,27.873417444394867],[113.07048377258963,27.873375127857273],[113.07049989160329,27.873315334325905],[113.07051523382614,27.87325803858606],[113.07055349894623,27.87326291095455],[113.0706876866688,27.87327724722782],[113.0707900007463,27.87315515286756],[113.07080219519416,27.873283004170112]]]},
{"type":"Polygon","coordinates":[[[113.06406165702445,27.873597781900305],[113.063894935792,27.87399187948464],[113.06323796027526,27.872595928094626],[113.06322095564437,27.872561694170848],[113.06319736774635,27.872520558816234],[113.0631698407583,27.872480890032197],[113.06314631047269,27.872450884238273],[113.06312925695912,27.8724301278803],[113.06310819100685,27.872404019687544],[113.06307387462827,27.872358283596746],[113.06286675081485,27.871918151638393],[113.06284870477056,27.8718797707618],[113.0628306525709,27.87184128066067],[113.06281261970761,27.871802668875805],[113.0627946336487,27.871763929277662],[113.06277689435174,27.871725424152032],[113.06260101162604,27.871655249274422],[113.06244496170535,27.870936587426534],[113.06241845904577,27.87080997457484],[113.06239828094692,27.87068244374867],[113.0623844668628,27.870554245160445],[113.06237704507076,27.870425629848082],[113.06237602964137,27.870296847849712],[113.06238142243815,27.87016815182653],[113.06239321212577,27.870039794349157],[113.06241137623202,27.86991202430233],[113.06246142023934,27.869739702509474],[113.0624568034169,27.869586599317813],[113.06248682256678,27.869413072124225],[113.06259646109748,27.869324307520245],[113.0626094109233,27.869291394187716],[113.06262579401539,27.86925077042751],[113.06264037155752,27.869215483330134],[113.0626552242404,27.86918031540217],[113.0628783446859,27.868688744113015],[113.06301457070428,27.86840799325377],[113.06303225087812,27.868380144235484],[113.0630506957017,27.86835594216291],[113.063070635795,27.868332250129715],[113.0630929711578,27.868305243911433],[113.06311075347287,27.868280743173926],[113.06313156428378,27.868244351513034],[113.06343996421946,27.867607399553002],[113.06366443111271,27.867143234785086],[113.06373803275541,27.866983881638404],[113.06380571320364,27.866822468865056],[113.0638673999138,27.866659170128987],[113.06393022486702,27.86646996722122],[113.06393818328836,27.866438034066082],[113.06394255080421,27.866409254502766],[113.06394495586581,27.86637631907879],[113.06394689557612,27.866337159916768],[113.06395215334777,27.866292095947315],[113.06399960486905,27.866095805616283],[113.06403610515775,27.86591792312305],[113.06406565705895,27.86573902527546],[113.06408822425738,27.86555932477913],[113.06410378156772,27.865379038925777],[113.06411230891264,27.86519838143148],[113.06399111912516,27.864749073579137],[113.06411037264392,27.864573220656233],[113.06411174742351,27.864528542678524],[113.06411369556439,27.86448259812699],[113.06411732390765,27.86444375990352],[113.06412452638025,27.864413166049637],[113.06413519789562,27.864382130137127],[113.0641472302145,27.864348341460786],[113.06415447635304,27.86432211782789],[113.0641589912754,27.86429507079537],[113.06418071626726,27.864142316769836],[113.06420696686065,27.864007357379954],[113.06423982629552,27.863873545451057],[113.0642791000018,27.863741544666667],[113.06432480461307,27.863611189107303],[113.06437685269741,27.86348272631075],[113.06443514771837,27.86335640014306],[113.0644964196793,27.863238205979],[113.06457097484852,27.863109581738183],[113.06459181244085,27.86307604221442],[113.0646096802906,27.86304794067183],[113.06462953639868,27.863017437103398],[113.06465667469668,27.862976705506934],[113.06467972816309,27.862942865183093],[113.06469583645166,27.86291961338818],[113.064761486591,27.86282592957965],[113.06508491028258,27.862392485458198],[113.06524597283163,27.862085777217484],[113.06527146308458,27.86201389530202],[113.0653033503321,27.861944058973833],[113.06534142665637,27.861876715271887],[113.06538544972447,27.86181229927124],[113.06543513476751,27.861751222298693],[113.0653889856274,27.862505168593955],[113.06536598775816,27.862537890545656],[113.06534277138064,27.862570399869938],[113.0653257084306,27.86259394394333],[113.06530412527746,27.862623418100103],[113.06528500884801,27.862649273527648],[113.06526776342923,27.862672426555047],[113.06503749231291,27.862979851321157],[113.06501487575315,27.863011180808797],[113.06499583875905,27.863037819943315],[113.06497619603898,27.86306571189842],[113.06495679153343,27.863093646971947],[113.06493687648506,27.863122864385197],[113.06491242449408,27.8631594834348],[113.06489247306706,27.863190097383253],[113.06487758752147,27.863213429675486],[113.06485918117762,27.86324300018569],[113.06478105353253,27.863378351507965],[113.0647203843558,27.86349778967302],[113.0646659673503,27.863619583748694],[113.06461791745623,27.863743474654374],[113.06457633644062,27.863869200512482],[113.0645413119052,27.863996493934735],[113.06451291927783,27.86412508654717],[113.06449121881316,27.86425470355582],[113.06447602702598,27.86438767891922],[113.06447399771467,27.864416728824732],[113.0644730728262,27.86445171715869],[113.06447573507243,27.864485990824466],[113.0644813228315,27.86451998115403],[113.0644865146078,27.8645456972465],[113.06449242920714,27.864580171630205],[113.06449521039848,27.86461738404994],[113.06449496634585,27.86464462067384],[113.06449476076119,27.864674589778016],[113.0644946839789,27.864724674232548],[113.0645838663002,27.864876808093687],[113.06449525406349,27.865284186631047],[113.06448370085955,27.865469906391816],[113.06446517415304,27.86565518002042],[113.06443969193528,27.865839800102357],[113.06440728538891,27.866023560213915],[113.06436798872774,27.866206255755586],[113.06431429186229,27.866407824820488],[113.06429645160554,27.866442330237984],[113.0642799315492,27.866468883458623],[113.06426108776675,27.86650283976941],[113.0642460606939,27.866540093777374],[113.06418162954665,27.86673372083013],[113.06411534583725,27.866910372599314],[113.06404242019958,27.867084944527882],[113.06396293248082,27.86725723953928],[113.0638231607028,27.867546270508907],[113.0638603564834,27.867663595101916],[113.06413080123446,27.867766883533257],[113.06407182710863,27.867980061037517],[113.06379212798784,27.867873238448674],[113.06367074538217,27.867929998530077],[113.06321779634705,27.86886662229781],[113.06319941003002,27.868904674458204],[113.0631811045365,27.868942654077028],[113.06316290312519,27.86898057214011],[113.06314483313928,27.86901843695411],[113.06312692089116,27.869056258623313],[113.0631091906705,27.869094046335967],[113.06309166879748,27.86913180929413],[113.06307438058485,27.869169555790716],[113.06305735236063,27.869207294125523],[113.06304060843786,27.869245030780075],[113.06302417513685,27.86928277495646],[113.06300807779377,27.86932053224084],[113.06299425414363,27.86935364901339],[113.06298171010783,27.869384373411904],[113.06296757281439,27.869419836782267],[113.06295290518364,27.869457696711585],[113.06293869107739,27.86949559491089],[113.06292485155062,27.86953243994226],[113.06291206922509,27.869557811972047],[113.06289550733209,27.869583348707263],[113.06287926995621,27.869607160610045],[113.06286278927513,27.86963564756804],[113.06284778610055,27.869673082919256],[113.06283748964302,27.869707741339038],[113.06282951185932,27.869736664143918],[113.06281952952176,27.869774817566686],[113.06279587079709,27.86987804430368],[113.0627792344177,27.869968155753583],[113.06276460191022,27.87007235696728],[113.06276137488564,27.870110373121918],[113.06276121258054,27.87015566293026],[113.06276601568011,27.870201156119162],[113.06277520052441,27.870248721029903],[113.06278363664131,27.870286658540728],[113.06279066313617,27.870324395180056],[113.06279419790701,27.87035716339134],[113.06279950532269,27.870491308158986],[113.06281118390822,27.87061498242157],[113.06282964572594,27.870738002580154],[113.062854847633,27.870860075086167],[113.06319312454856,27.871646378766403],[113.06321066935399,27.87168401990493],[113.06322849588211,27.871722080727775],[113.06324193101773,27.87175068611392],[113.06325429160042,27.871776964342335],[113.06345263278692,27.872198428521397],[113.06351639873077,27.872333509831513],[113.06352755834156,27.87236686126416],[113.06353586114074,27.87240417251405],[113.06354130856437,27.87243819166917],[113.06354834501556,27.872479655804845],[113.06355700284,27.87251488511164],[113.06356895674102,27.872548564061596],[113.06358164690204,27.872577626342164],[113.06406165702445,27.873597781900305]]]},
{"type":"Polygon","coordinates":[[[113.09096602070058,27.857181920819787],[113.09097502246601,27.857200348724827],[113.09078599808593,27.857338908041058],[113.0907576583158,27.857360827264284],[113.08896689084978,27.858631928529647],[113.08875573350281,27.858769920097895],[113.08870069184178,27.858800428553682],[113.08842256404625,27.858951775474555],[113.08814243224666,27.859100589287134],[113.0878605941106,27.85924696939863],[113.08757659301075,27.859389918419563],[113.08706500976027,27.85964629413106],[113.08683976071207,27.859711778967544],[113.08644917674577,27.8598516162259],[113.08618065765715,27.85995443932166],[113.08590308867643,27.86005717394215],[113.08559165713203,27.860172085035913],[113.0855405454561,27.860048186774723],[113.08465045094852,27.85789049381124],[113.08488011857874,27.85786203429834],[113.0880820949471,27.857265134636616],[113.09032592334768,27.856650074421815],[113.0905277817555,27.85662549603805],[113.0906753655638,27.85658689573924],[113.09096602070058,27.857181920819787]]]},
{"type":"Polygon","coordinates":[[[113.09547931178638,27.86037104825446],[113.09574361340128,27.860810987135586],[113.09611183972342,27.861453575351735],[113.09504285522104,27.861458745868067],[113.09501496606322,27.861781828214458],[113.09497869962223,27.862146210835515],[113.0940789203131,27.862182994984693],[113.09374241196086,27.8621076340869],[113.09296781249516,27.861642673960343],[113.09295879305746,27.85956522305338],[113.09293908760914,27.858813232865472],[113.09293863124998,27.858561077497455],[113.09294175447754,27.858185884127476],[113.0929143131336,27.857337394506104],[113.09464921773905,27.857898640999405],[113.09484562578521,27.857959487722788],[113.0946248179577,27.858589651510595],[113.09477594142083,27.859067608656144],[113.09482311225632,27.859215410143545],[113.09501803831925,27.85957208893932],[113.09513505028355,27.85978613417292],[113.09517557121976,27.859857967736186],[113.09529797885367,27.86006603333939],[113.09547931178638,27.86037104825446]]]},
{"type":"Polygon","coordinates":[[[113.06406165702445,27.873597781900305],[113.06426302298699,27.8740256565594],[113.06438074121598,27.874143835029685],[113.06446939059214,27.874295247937475],[113.06444751689071,27.874417678391477],[113.06455876849977,27.87465406959551],[113.0646283669753,27.87480837682726],[113.06469275760332,27.874964458747797],[113.06475188468248,27.875122177834008],[113.06480569559515,27.875281392071585],[113.0648541417686,27.87544196127777],[113.06490413841924,27.875632112610365],[113.06494661286484,27.875823702638993],[113.06498151225205,27.87601649640906],[113.06500879388778,27.876210258131362],[113.06505428761668,27.876318709272557],[113.06508845459194,27.87657129457378],[113.0650025804435,27.876685738736064],[113.06500398977724,27.876827523904858],[113.0650013141622,27.876969295808276],[113.06499455744213,27.8771109597286],[113.06497988075077,27.877292778973967],[113.0649584802838,27.87747407077929],[113.06493037902025,27.87765463859171],[113.06489560906272,27.877834287723957],[113.06460434699892,27.87920384213485],[113.0645960900883,27.87924276077065],[113.06459050507262,27.87926924015316],[113.06458459758404,27.87929744077174],[113.06457875546475,27.87932559671757],[113.06457299391457,27.879353711703047],[113.06456732409515,27.879381786706237],[113.06456176122967,27.879409822732736],[113.06455631645646,27.8794378234674],[113.06455002781121,27.879471027548405],[113.06454393754292,27.879504188761327],[113.0645389902783,27.879532077373707],[113.06453421893723,27.87955993650059],[113.0645296367277,27.879587765329305],[113.0645243404728,27.879621642050694],[113.0645185987479,27.87966068150991],[113.06451480641974,27.879688407418868],[113.06451054749877,27.87972209988623],[113.06450607033054,27.87976098280024],[113.06450323548799,27.87978859970839],[113.06450069235643,27.879816184307597],[113.06449845515158,27.87984373669433],[113.06449664011343,27.8798695468657],[113.06449203558941,27.879987650475243],[113.06449372519018,27.880109377179714],[113.06449653198027,27.880148128147646],[113.06450356991455,27.880193881825907],[113.06451560349561,27.880239210120084],[113.06453232809817,27.8802860031192],[113.06454675976386,27.880323111338853],[113.06455640446785,27.88034959569147],[113.06456563686842,27.88038081079683],[113.06459623173025,27.880529821135646],[113.0647249145386,27.880658570365853],[113.06412001500476,27.880641171868128],[113.06420894434969,27.88051957120241],[113.06418901851058,27.880400082995834],[113.06418623734132,27.88035741885363],[113.06418637731761,27.880320817349308],[113.06418862452902,27.88029317480736],[113.06419237104542,27.880265947581474],[113.06419895896104,27.880231260342068],[113.064207503843,27.88018804596192],[113.064211030866,27.880155519746992],[113.06420755999953,27.88000337019316],[113.06421293027947,27.879852921955397],[113.06421476730603,27.879826806052925],[113.06421705556411,27.87979863863883],[113.06422054063599,27.879761185490295],[113.0642242726915,27.87972571369951],[113.06422773650544,27.87969593099634],[113.06423197623432,27.87966247301108],[113.06423849662714,27.87961531529722],[113.0642447129894,27.879573875301933],[113.06424939481731,27.879544506906146],[113.06425426788437,27.879515217407132],[113.06425964031166,27.87948418351019],[113.06426519071533,27.879453235638447],[113.06427056537491,27.879424185949322],[113.06427782050257,27.879386173681723],[113.06428453997931,27.87935188253988],[113.06429030748168,27.879323083652405],[113.06429615461488,27.87929435297865],[113.06430206719445,27.879265686813078],[113.06430953022729,27.879229947083633],[113.06431704428746,27.879194295224487],[113.06432439857393,27.87915962851215],[113.06461623757872,27.877787373513016],[113.06464931573431,27.877616533125803],[113.06467607412036,27.87744482062665],[113.06469523873312,27.87728472716986],[113.06470890957179,27.877124189496456],[113.0647166713484,27.876974910545496],[113.0647196830839,27.876825496507305],[113.06471794175174,27.876676065565483],[113.06463590544672,27.876565220730903],[113.06458860667652,27.87631091125491],[113.06467917207652,27.876189268904316],[113.06465157900128,27.87600759876562],[113.06461691656152,27.87582688855116],[113.06457522558419,27.875647354186956],[113.06452655704106,27.875469212569147],[113.0644701521672,27.8752902514762],[113.06440670374458,27.875113161796985],[113.06433629216406,27.874938163330945],[113.0642590039456,27.874765471406615],[113.063894935792,27.87399187948464],[113.06406165702445,27.873597781900305]]]},
{"type":"Polygon","coordinates":[[[113.0838402122328,27.863757054244893],[113.08385104459931,27.863796284223632],[113.08401612824416,27.863901355994063],[113.084188552523,27.86399741339738],[113.08435047730438,27.86410657477641],[113.0845136546196,27.864213884598893],[113.08467672901256,27.86432139837607],[113.08484250385935,27.864430313140232],[113.08487194739878,27.864449472579626],[113.0849174364606,27.864477756265362],[113.08490597937227,27.86473680883726],[113.08477759374874,27.864729193188694],[113.08469323429813,27.864671182607392],[113.08453148982537,27.864567005433027],[113.08436695662411,27.86446125486061],[113.08424929739725,27.864387903657185],[113.08420065470231,27.864357721987417],[113.08403567869142,27.864252546475235],[113.08386993745867,27.86414833658441],[113.08371100482864,27.864035359661933],[113.08354675232677,27.86392926079691],[113.08338271487814,27.863822860891748],[113.08321704176163,27.863718551429205],[113.08305007150798,27.86361579777292],[113.0828825082376,27.863513694158083],[113.0827162727734,27.863410205990277],[113.08254905429271,27.86330774424499],[113.08248086107052,27.86329887920591],[113.08232312189288,27.86327837218932],[113.08223052278737,27.863142973700462],[113.08220840582754,27.86311063443331],[113.08203707661522,27.863013440448054],[113.08187000282255,27.862910825463448],[113.08183262622006,27.862889433483026],[113.08170115014413,27.862810185347982],[113.08152431543351,27.862702932006084],[113.08149968587475,27.86268781834747],[113.0815245399756,27.86262463370264],[113.08153626681623,27.86220129408036],[113.08161131669743,27.862281804396172],[113.08173939971255,27.862403606939612],[113.08189271117533,27.862507202428553],[113.08205479632782,27.862615831537294],[113.08221645193714,27.862725230890437],[113.0823783252964,27.862834250727115],[113.08253966983362,27.86294401488435],[113.08270119899669,27.86305371601974],[113.08286411268855,27.86316132557245],[113.08302681810682,27.863269472237654],[113.08319115634553,27.863375460388095],[113.08335628091416,27.863480463726084],[113.0835212251469,27.86358570027551],[113.08357833548185,27.863581300137422],[113.08378723981797,27.863565204579476],[113.0838402122328,27.863757054244893]]]},
{"type":"MultiPolygon","coordinates":[[[[113.08253690555335,27.861782942961675],[113.08272975888677,27.861711861203805],[113.08291215114417,27.861643472527756],[113.08347849900373,27.861430605671835],[113.08385159167375,27.861287050662888],[113.08421120001273,27.861143183130462],[113.08439670483502,27.861087173117483],[113.08468645626779,27.861024905854126],[113.0849881407703,27.860896415443168],[113.08510261569732,27.860857350790358],[113.08513386598366,27.861171480263184],[113.08510459931414,27.861347536628415],[113.08505507333692,27.861345168884434],[113.08452081166935,27.861320514277487],[113.08451043590416,27.861514511306197],[113.08437225674815,27.861513643772156],[113.08338171444763,27.86150741962445],[113.08337736892764,27.861717409639912],[113.08295590198244,27.86174960568259],[113.08253690555335,27.861782942961675]]],[[[113.08253690555335,27.861782942961675],[113.08253813217448,27.862207193642696],[113.08153626681623,27.86220129408036],[113.08161989534912,27.862162632429623],[113.08199430470327,27.8620218424897],[113.08235673032054,27.861853851626808],[113.08253690555335,27.861782942961675]]],[[[113.08153626681623,27.86220129408036],[113.0815245399756,27.86262463370264],[113.08149968587475,27.86268781834747],[113.08143235188318,27.862858999505534],[113.08138236413042,27.862825234712243],[113.08114421787731,27.862668521485254],[113.08106104680212,27.862659864568975],[113.0807128921036,27.862908895136503],[113.08061753568757,27.862939892236227],[113.08056185817284,27.86296017342703],[113.08053782210816,27.862936100802834],[113.08046456257641,27.86287447479183],[113.08043299154362,27.862841197873742],[113.08035589950617,27.8627766714621],[113.08027337457699,27.86271985791283],[113.08013857314364,27.862651866047162],[113.08007829332487,27.862624536079643],[113.08046254530127,27.862503966640208],[113.08085190467732,27.862398285055228],[113.0812440059322,27.862298947693493],[113.08153626681623,27.86220129408036]]]]},
{"type":"Polygon","coordinates":[[[113.08437225674815,27.861513643772156],[113.08453453923242,27.86190703222702],[113.0832077429758,27.862360115594548],[113.08295590198244,27.86174960568259],[113.08294162493439,27.861714996977074],[113.08291215114417,27.861643472527756],[113.08347849900373,27.861430605671835],[113.08385159167375,27.861287050662888],[113.08421120001273,27.861143183130462],[113.08437225674815,27.861513643772156]]]},
{"type":"Polygon","coordinates":[[[113.08671179863164,27.860249886940892],[113.08541782327434,27.860574225300358],[113.08537561148826,27.860468957579233],[113.08533025068158,27.86036462362076],[113.08528768304879,27.86025979745519],[113.08539132782283,27.860091857002715],[113.0855405454561,27.860048186774723],[113.08571937604523,27.859995849152703],[113.08590308867643,27.86005717394215],[113.08618065765715,27.85995443932166],[113.08644917674577,27.8598516162259],[113.08671301554662,27.85973891005844],[113.08697695186291,27.85962698182206],[113.08723837754053,27.85951049146031],[113.08757659301075,27.859389918419563],[113.0878605941106,27.85924696939863],[113.08814243224666,27.859100589287134],[113.08842256404625,27.858951775474555],[113.08870069184178,27.858800428553682],[113.08875573350281,27.858769920097895],[113.08896689084978,27.858631928529647],[113.08923388509879,27.858464874233103],[113.08949571100611,27.858291607988484],[113.08975323575505,27.85811332390543],[113.09000633781301,27.857930106024057],[113.09025489765786,27.857742041105215],[113.0907576583158,27.857360827264284],[113.09078599808593,27.857338908041058],[113.09096602070058,27.857181920819787],[113.09109173198426,27.857077795440137],[113.09129166100738,27.856909439721225],[113.09149653654741,27.856745849860534],[113.09170621552173,27.856587140391742],[113.09192055082008,27.85643342221311],[113.09213939229711,27.856284805301105],[113.0923625858174,27.85614139148557],[113.09258997419525,27.856003283479232],[113.09282139929283,27.85587057677067],[113.09362302542975,27.855632282525466],[113.09339242619835,27.855795493667248],[113.09316618072482,27.855963450373565],[113.09294441261639,27.856136059636423],[113.09272724245247,27.85631322662369],[113.09251478878474,27.85649485649025],[113.09230716818983,27.856680848062013],[113.09223885210784,27.856731604484736],[113.0921758039967,27.856787486446315],[113.09200839190802,27.856949489494223],[113.09196887681811,27.856985646262743],[113.09192715207638,27.85701978621932],[113.09136231951179,27.857456661444562],[113.09101900634099,27.857842074639077],[113.09085928021415,27.857842748220396],[113.09057147048637,27.85806535266667],[113.09040459099499,27.85819258436385],[113.09023569324302,27.85831769381162],[113.09017361287448,27.858359578048546],[113.09010810071744,27.85839710576496],[113.08987036487422,27.858522077397556],[113.08973433934018,27.85860753756805],[113.0896005134341,27.858695698330706],[113.08934123683458,27.85886303617703],[113.08907810720261,27.85902555584042],[113.08881123986426,27.85918318768009],[113.08854074912513,27.85933586295144],[113.08826675128586,27.85948351743532],[113.0879893646872,27.859626086024413],[113.08770870864964,27.859763508130236],[113.08746404132404,27.859877886918685],[113.08721710870007,27.859988354046],[113.08717557622971,27.86000759102655],[113.08713508654678,27.860028510507185],[113.08671179863164,27.860249886940892]]]},
{"type":"Polygon","coordinates":[[[113.08528768304879,27.86025979745519],[113.08533025068158,27.86036462362076],[113.08537561148826,27.860468957579233],[113.08541782327434,27.860574225300358],[113.08548254744956,27.860726600889766],[113.08536580398952,27.860763689174203],[113.08510261569732,27.860857350790358],[113.0849881407703,27.860896415443168],[113.0845980851103,27.861025641328737],[113.08439670483502,27.861087173117483],[113.08421120001273,27.861143183130462],[113.08385159167375,27.861287050662888],[113.08347849900373,27.861430605671835],[113.08291215114417,27.861643472527756],[113.08272975888677,27.861711861203805],[113.08253690555335,27.861782942961675],[113.08235673032054,27.861853851626808],[113.08199430470327,27.8620218424897],[113.08161989534912,27.862162632429623],[113.08153626681623,27.86220129408036],[113.0812440059322,27.862298947693493],[113.08085190467732,27.862398285055228],[113.08046254530127,27.862503966640208],[113.08007829332487,27.862624536079643],[113.07974852103739,27.86271496857472],[113.07969117465606,27.862732207384592],[113.07931296252548,27.862859331516322],[113.0789586272362,27.863033060979284],[113.07859381576968,27.86317500296322],[113.07823267974167,27.86331754871684],[113.0778701889661,27.863452827086288],[113.0775542902289,27.863592826629485],[113.07752067326675,27.86360772469027],[113.0773520013977,27.863697808447917],[113.07710460413784,27.863883812453732],[113.07660031641706,27.86426295422942],[113.07656477812512,27.864296540670967],[113.07638188587842,27.864469386229352],[113.07635658361653,27.86449329790748],[113.07611169415017,27.86468918732066],[113.07607504038741,27.864718507207336],[113.07572661679073,27.86489469316046],[113.07548292138854,27.86516044159094],[113.07530205297049,27.865407513194288],[113.0752726104299,27.865447733401652],[113.07503043731386,27.86571639393928],[113.07497730926157,27.865791749462005],[113.07501704613841,27.865975748978094],[113.07496317173158,27.866271927748645],[113.07458229726613,27.866512676829366],[113.07452557322335,27.86664192702669],[113.07441400989899,27.866970123401273],[113.0742837235737,27.867292762028132],[113.07419234778082,27.867626220646024],[113.07415827038575,27.8679710170903],[113.0741365414886,27.868068668180534],[113.07408242437667,27.868311875089315],[113.07404619194013,27.868453616253444],[113.07409154534069,27.8685484729597],[113.07410194123939,27.86861622661027],[113.0741134511994,27.868691241481894],[113.07320379731405,27.868787560951404],[113.07321019321049,27.868654252021784],[113.073357929355,27.868489241506644],[113.07335254708987,27.868230729749264],[113.07338748145361,27.86786225344479],[113.07349999844301,27.867497143324368],[113.07359731774172,27.86712861407266],[113.07370038224308,27.866759950062324],[113.07384404580776,27.866456626626988],[113.07389712608395,27.866313934763742],[113.07385441944662,27.866142915639923],[113.07385840797436,27.8658428968677],[113.07425956258614,27.86570550039229],[113.0743051731488,27.865632353204376],[113.07444804296856,27.865400078665722],[113.07464899166366,27.865063906235495],[113.0749122375511,27.864778210213178],[113.07519409056067,27.86447961162446],[113.0753983870817,27.864127008438125],[113.07554918045534,27.863990879206966],[113.0757026397661,27.863852342230842],[113.07605814551358,27.863630103265137],[113.07612243694504,27.863595341628148],[113.07693001749132,27.863185062284803],[113.07717171761209,27.86305706850041],[113.0775381149928,27.86287116001197],[113.07790623963618,27.862691193924373],[113.07828676400214,27.862539534270965],[113.07867152069024,27.862403530007033],[113.07907194965772,27.86231062576649],[113.0794512658474,27.86217736572465],[113.07982449950273,27.862034253110686],[113.07989293003706,27.862007322357186],[113.08019629115154,27.861887934732852],[113.0803652567322,27.861817777097613],[113.08056513218828,27.86173478494659],[113.08093122762709,27.861575286979555],[113.08131047329819,27.86144621434177],[113.0816973165345,27.86133472061487],[113.08209308202244,27.86124386891082],[113.08247823478027,27.861128466393733],[113.08306639899554,27.86094010175345],[113.08324143923508,27.86088123195267],[113.08362834436511,27.860769884732232],[113.08400848218206,27.860668044350607],[113.08438188521352,27.860525461695623],[113.08452698551271,27.86047470458777],[113.08476896546144,27.860389358999814],[113.08481744682503,27.860373289086404],[113.08491896963052,27.860339636488398],[113.08514947749185,27.86026322831044],[113.08526413299593,27.860221312466155],[113.08528768304879,27.86025979745519]]]},
{"type":"Polygon","coordinates":[[[113.07487729063429,27.861486644920966],[113.0755738498799,27.862365348171217],[113.07609187936146,27.8634047501297],[113.07513743771389,27.86388840899792],[113.07433456629123,27.864295252410752],[113.07288468401032,27.86499085831165],[113.07202105781259,27.86544131628623],[113.07134119502079,27.865795918407436],[113.0707558464527,27.866316214192317],[113.07054959854725,27.866323146533464],[113.06950991597097,27.86592578681749],[113.06947754974316,27.865912442425536],[113.0694061988019,27.865885470750946],[113.06936891032765,27.865871530075502],[113.06931509380466,27.8658577810413],[113.0692865084134,27.86585041020271],[113.06839341107003,27.865503583913],[113.06811524717989,27.865399462154752],[113.06785990337103,27.865302903008377],[113.0675145042648,27.865173034553884],[113.06659565793194,27.865003693714282],[113.06609808097409,27.864924164409214],[113.06491837401713,27.86490360494059],[113.06467537255567,27.864894297497965],[113.06472312624231,27.86453545446161],[113.06483872580536,27.864341561316923],[113.06496584380712,27.86394690542649],[113.06518114337598,27.863589691424565],[113.06560520291173,27.86305363523711],[113.06602541179716,27.862497977558924],[113.06614786961732,27.862330560340297],[113.06648580434751,27.861378659199374],[113.06725513257442,27.861418294290697],[113.06769584472522,27.861442779591478],[113.06803945927693,27.861452580037785],[113.06814597043686,27.86145733660461],[113.06846402430082,27.861538270890268],[113.06883677282511,27.861591548552596],[113.06908826882209,27.861632772177362],[113.06961263857785,27.86166584026487],[113.06973530901307,27.86168418705802],[113.07004270665647,27.86162996053373],[113.07094511214645,27.86147643201823],[113.07126180357034,27.861366703217048],[113.07190630696502,27.861158445623794],[113.07217133578222,27.861071165997974],[113.07225578017726,27.861047849572895],[113.07383415504431,27.860482753578296],[113.07390312161307,27.860462327006175],[113.07481070628684,27.86139948717894],[113.07485096801989,27.861453329769425],[113.07487729063429,27.861486644920966]]]}
]}
      let data = [];

      for (let i = 0; i < json["geometries"].length; i++) {
        // let coor="[[["
        // for (let j = 0; j < json["geometries"][i]["coordinates"].length; j++) {
        //   coor+=json["geometries"][i]["coordinates"][j]
        // }
        let one = {};
        one["name"] = "片区土壤治理";
        one["geometry"] = JSON.stringify(json["geometries"][i]);
        one["layercode"] = 65;
        one["fid"] = 1;
        one["featureid"] = i.toString();
        data.push(one);
      }

      // console.log(json["geometries"][0])

      multiaddborders(data).then((response) => {});
    },
    choose_feature() {
      let box;
      Tool.set_map_operation_mode(this.map, 2, box).then((data) => {
        Tool.show_around_point(
          this.map,
          this.map.getLayers().getArray()[3].getLayers().getArray()[3],
          data["features_list"][0].get("label")
        );
      });
    },
    point_select() {
      Tool.no_feature_locker(this.map, false);

      Tool.point_select(this.map, this.ROOT).then((response) => {
        setTimeout(() => {
          Tool.no_feature_locker(this.map, true);
        }, 300);
      });
    },
    show_all() {
      this.progress_data = 0;
      this.progress_show = true;
      this.progress_status = null;
      var timestamp = Date.parse(new Date()) / 1000;
      this.time_go(timestamp, 5);
      Tool.no_feature_locker(this.map, false);
      let group = this.map.getLayers().getArray()[4];
      let input = [];
      for (let j = 0; j < group.getLayers().getArray().length; j++) {
        let se_group = group.getLayers().getArray()[j];
        input.push(group.getLayers().getArray()[j].get("layercode"));
        for (let p = 0; p < se_group.getLayers().getArray().length; p++) {
          let layer = se_group.getLayers().getArray()[p];

          layer.setVisible(true);
          layer.getSource().clear();
        }
      }

      if (this.inside_mode) {
        Tool.add_features_by_ids_fids(this.map, [], input).then((response) => {
          setTimeout(() => {
            this.progress_show = false;
            Tool.no_feature_locker(this.map, true);
          }, 1000);
        });
      } else {
        Tool.new_add_home_points(this.map).then((response) => {
          this.progress_data = 100;
          this.progress_status = "success";
          setTimeout(() => {
            this.progress_show = false;
            Tool.no_feature_locker(this.map, true);
          }, 1000);
        });
      }
    },
    change_show() {
      this.show_button = true;

      // Tool.add_layers_by_ids_fids(this.map, [59, 71], [59]).then((data) => {
      //   Tool.add_features_by_ids_fids(this.map, [59, 71], [59]);
      //   Tool.zoom_listener(this.map);
      // });
    },
    legend() {
      this.$refs.legend_ref.getdatatable();
    },
    show_info() {
      let box = [];
      Tool.set_map_operation_mode(this.map, 4, box).then((response) => {
        if (response.length > 0) {
          let json = {};
          json["name"] = response[0].label;
          json["info"] = response[0].note;

          this.$refs.popup_ref.feature_info = json;
          this.$refs.popup_ref.set_info();
          this.$refs.popup_ref.pop_mode = 6;
          this.$refs.popup_ref.show = true;
          this.$refs.popup_ref.overlay.setPosition(response[0]["coordinate"]);
        }
        this.map_mode = 2;
        if (this.map_mode == 2) {
          this.show_info();
        }
      });
    },
    search() {
      Tool.set_extent_by_feature(65, "区域8 T8-7-1", 200, this.map);
    },
    mouthtype(command) {
      if (command === "a") {
        let box = [];
        Tool.set_map_operation_mode(this.map, 1, box);
        this.mouthtype_name = "平移";
        this.map_mode = 1;
      } else if (command === "b") {
        this.choose();
        this.mouthtype_name = "点选";
      } else {
        this.show_info();
        this.mouthtype_name = "显示信息";
      }
    },
    set_Progress(now, intervel) {
      if (this.progress_data === 100) return;
      if (now === intervel) {
        this.progress_data = 99;
      } else {
        this.progress_data = parseFloat((99 * now) / intervel);
      }
    },
    time_go(input, intervel) {
      if (this.progress_data === 100) return;
      setTimeout(() => {
        var timestamp = Date.parse(new Date()) / 100;
        let res = timestamp - input * 10.0;

        if (input + intervel === timestamp / 10) {
          this.set_Progress(res / 10.0, intervel);
          return;
        } else {
          this.set_Progress(res / 10.0, intervel);
          this.time_go(input, intervel);
        }
      }, 1000);
    },
    add_test() {
      let polygon = [
        [
          [12840000, 3360000],
          [12850000, 3360000],
          [12850000, 3370000],
          [12840000, 3370000],
          [12840000, 3360000],
        ],
        [
          [12842000, 3362000],
          [12848000, 3362000],
          [12848000, 3362000],
          [12842000, 3368000],
          [12842000, 3362000],
        ],
      ];
      let feature0 = new Feature({
        type: "polygon_border",
        geometry: new Polygon(polygon),
        // geometry: new Polygon([[[113,28],[114,28],[114,29],[113,29],[113,28]]]),
      });
      // border_layer.getSource().addFeature(feature0)
      this.map
        .getLayers()
        .getArray()[1]
        .getLayers()
        .getArray()[3]
        .getSource()
        .addFeatures(feature0);
    },

    initDB() {
      let request = indexedDB.open("myDB");

      // err
      request.onerror = (event) => {
        console.log("数据库打开/创建报错", event);
      };

      //如果指定的版本号，大于数据库的实际版本号，就会发生数据库升级事件upgradeneeded。
      //升级后自动触发success
      request.onupgradeneeded = (event) => {
        let db = event.target.result;
        this.db = db;
        //建表 名为person,主键为id
        let store = db.createObjectStore("person", {
          keyPath: "id",
        });
        //新建索引名称、索引所在的属性、配置对象（说明该属性是否允许有重复的值）
        store.createIndex("name", "name", {
          unique: false,
        });
        store.createIndex("age", "age", {
          unique: false,
        });
        store.createIndex("height", "height", {
          unique: false,
        });

        console.log("数据库升级");
      };

      // success
      request.onsuccess = (event) => {
        this.db = event.target.result;
        console.log("数据库打开/创建成功", event);
        this.getList();
      };
    },
    set_no_overweights() {
      let group = this.map.getLayers().getArray()[3];
      TablesList().then((response) => {
        let standarddata = response.data.data;
        for (let i = 0; i < 4; i++) {
          for (let j = 0; j < group.getLayers().getArray()[i].length; j++) {
            features = group
              .getLayers()
              .getArray()
              [i].getSource()
              .getFeatures();
            let show_features = [];
            for (let k = 0; k < features.length; k++) {
              if (
                features[k].cd < standarddata[features[k].standardid - 1].cd &&
                features[k].pb < standarddata[features[k].standardid - 1].pb &&
                features[k].as < standarddata[features[k].standardid - 1].as
              ) {
                show_features.push(features[k]);
              }
            }
          }
        }
      });
    },
    change_another_feature(feature) {
      function find_layer(layercode, map) {
        let layer;
        for (let i = 2; i < map.getLayers().getArray().length; i++) {
          if (
            map.getLayers().getArray()[i] instanceof VectorLayer &&
            map.getLayers().getArray()[i].get("layercode") === layercode
          ) {
            layer = map.getLayers().getArray()[i];
            return layer;
          } else if (map.getLayers().getArray()[i] instanceof LayerGroup) {
            let group = map.getLayers().getArray()[i];
            if (group.get("layercode") === layercode) {
              layer = group;
              return layer;
            } else {
              for (let j = 0; j < group.getLayers().getArray().length; j++) {
                if (
                  group.getLayers().getArray()[j] instanceof VectorLayer &&
                  group.getLayers().getArray()[j].get("layercode") === layercode
                ) {
                  layer = group.getLayers().getArray()[j];
                  return layer;
                } else if (
                  group.getLayers().getArray()[j] instanceof LayerGroup
                ) {
                  let se_group = group.getLayers().getArray()[j];
                  if (se_group.get("layercode") === layercode) {
                    layer = se_group;
                    return layer;
                  } else {
                    for (
                      let k = 0;
                      k < se_group.getLayers().getArray().length;
                      k++
                    ) {
                      if (
                        se_group.getLayers().getArray()[k].get("layercode") ===
                        layercode
                      ) {
                        layer = se_group.getLayers().getArray()[k];
                        return layer;
                      } else if (
                        se_group.getLayers().getArray()[k] instanceof LayerGroup
                      ) {
                        let th_group = se_group.getLayers().getArray()[k];
                        if (th_group.get("layercode") === layercode) {
                          layer = th_group;
                          return layer;
                        } else {
                          for (
                            let m = 0;
                            m < th_group.getLayers().getArray().length;
                            m++
                          ) {
                            if (
                              th_group
                                .getLayers()
                                .getArray()
                                [m].get("layercode") === layercode
                            ) {
                              layer = th_group.getLayers().getArray()[m];
                              return layer;
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
          // return layer
        }
      }
      let features = find_layer(feature.get("layercode"), this.map)
        .getSource()
        .getSource()
        .getFeatures();

      let start_index = feature.get("id") % features.length;
      let res_feature = feature;
      return new Promise((resolve) => {
        TablesList().then((response) => {
          let standarddata = response.data.data;
          let count = 0;
          if (
            feature.get("Cd") <
              standarddata[feature.get("standardid") - 1].cd &&
            feature.get("Pb") <
              standarddata[feature.get("standardid") - 1].pb &&
            feature.get("As") < standarddata[feature.get("standardid") - 1].as
          ) {
            res_feature = feature;
          } else {
            while (count < features.length) {
              start_index = start_index % features.length;

              if (
                features[start_index].get("Cd") <
                  standarddata[features[start_index].get("standardid") - 1]
                    .cd &&
                features[start_index].get("Pb") <
                  standarddata[features[start_index].get("standardid") - 1]
                    .pb &&
                features[start_index].get("As") <
                  standarddata[features[start_index].get("standardid") - 1]
                    .as &&
                features[start_index].get("standardid") ===
                  feature.get("standardid")
              ) {
                res_feature = features[start_index];
                res_feature.set("setype", feature.get("setype"));
                count++;
                break;
              } else {
                start_index = start_index + 1;
                count++;
              }
            }
          }
          resolve(res_feature);
        });
      });
    },
    re_add_point() {
      let group = map.getLayers().getArray()[4];
      for (let j = 0; j < group.getLayers().getArray().length; j++) {
        let se_group = group.getLayers().getArray()[j];
        for (let p = 0; p < se_group.getLayers().getArray().length; p++) {
          let layer = se_group.getLayers().getArray()[p];
        }
      }
    },
    set_over_layers() {
      let cd_over_sj = cd_over_sheji();
      let pb_over_sj = pb_over_sheji();
      let as_over_sj = as_over_sheji();
      let cd_over_ys = cd_over_yanshou();
      let pb_over_ys = pb_over_yanshou();
      let as_over_ys = as_over_yanshou();

      let group = new LayerGroup({
        title: "重金属含量超限比",
        layercode: 1014,
        allwaysOnTop: true,
        openInLayerSwitcher: false,
        layers: [
          cd_over_ys,
          pb_over_ys,
          as_over_ys,
          cd_over_sj,
          pb_over_sj,
          as_over_sj,
        ],
      });
      this.map.getLayers().getArray()[3].getLayers().push(group);

      function cd_over_sheji() {
        let extent = [
          12584009.345097879, 3229865.1851135343, 12591150.2826624,
          3235557.999527343,
        ];

        return new Image({
          title: "设计阶段镉含量超限比",
          layercode: 1003,
          source: new ImageStatic({
            url: "static/images/设计阶段镉含量（相对于限值）.png",

            projection: "EPSG:3857",
            imageExtent: extent,
          }),
          visible: false,
          opacity: 1,
        });
      }

      function pb_over_sheji() {
        let extent = [
          12584009.345097879, 3229855.1851135343, 12591190.2826624,
          3235517.999527343,
        ];

        return new Image({
          title: "设计阶段铅含量超限比",
          layercode: 1003,
          source: new ImageStatic({
            url: "static/images/设计阶段铅含量（相对于限值）.png",

            projection: "EPSG:3857",
            imageExtent: extent,
          }),
          visible: false,
          opacity: 1,
        });
      }

      function as_over_sheji() {
        let extent = [
          12584009.345097879, 3229855.1851135343, 12591190.2826624,
          3235517.999527343,
        ];

        return new Image({
          title: "设计阶段砷含量超限比",
          layercode: 1003,
          source: new ImageStatic({
            url: "static/images/设计阶段砷含量（相对于限值）.png",

            projection: "EPSG:3857",
            imageExtent: extent,
          }),
          visible: false,
          opacity: 1,
        });
      }

      function cd_over_yanshou() {
        let extent = [
          12583809.345097879, 3229955.1851135343, 12590990.2826624,
          3235617.999527343,
        ];

        return new Image({
          title: "验收阶段镉含量超限比",
          layercode: 1003,
          source: new ImageStatic({
            url: "static/images/验收阶段镉含量超限比.png",

            projection: "EPSG:3857",
            imageExtent: extent,
          }),
          visible: false,
          opacity: 1,
        });
      }

      function pb_over_yanshou() {
        let extent = [
          12583809.345097879, 3229955.1851135343, 12590990.2826624,
          3235617.999527343,
        ];

        return new Image({
          title: "验收阶段铅含量超限比",
          layercode: 1003,
          source: new ImageStatic({
            url: "static/images/验收阶段铅含量超限比.png",

            projection: "EPSG:3857",
            imageExtent: extent,
          }),
          visible: false,
          opacity: 1,
        });
      }

      function as_over_yanshou() {
        let extent = [
          12583809.345097879, 3229955.1851135343, 12590990.2826624,
          3235617.999527343,
        ];

        return new Image({
          title: "验收阶段砷含量超限比",
          layercode: 1003,
          source: new ImageStatic({
            url: "static/images/验收阶段砷含量超限比.png",

            projection: "EPSG:3857",
            imageExtent: extent,
          }),
          visible: false,
          opacity: 1,
        });
      }
    },
  },
  watch: {
    "$store.getters.getDemoValue": {
      handler: function (newVal, oldVal) {
        if (newVal) {
          this.change_show();
          this.menutype = 2;
        }
      },
    },
    "$store.getters.getRoot": {
      handler: function (newVal, oldVal) {
        this.ROOT = newVal;
        console.log(this.ROOT);
        if (this.ROOT === 0) {
        }
      },
    },
    "$store.getters.menutype": {
      handler: function (newVal, oldVal) {
        if (newVal) {
          this.menutype = newVal;
        }
      },
    },
    ROOT: {
      handler: function (newVal, oldVal) {
        if (newVal) {
          console.log("root");
          console.log(newVal);
        }
      },
    },
  },
  mounted: function () {
    // axios.get("../../片区边界.json").then((res) => {
    //   // 获取public下的test.json文件数据
    //   console.log(res);
    // });
    // this.polygon_post()

    this.map = Tool.set_map("map", true, true, true, false, true);
    let that = this;
    Tool.add_baselayers(this.map);
    Tool.open_levels(false, this.map);
    let count = 0;
    Tool.add_layers_by_ids_fids(
      this.map,
      [1, 2, 900],
      [2, 1, 72, 59, 29, 99, 90, 91, 92, 93, 900, 901, 902, 903, 904]
    ).then((data) => {
      this.set_over_layers();
      Tool.new_add_home_points(this.map, this.ROOT).then((response) => {
        count++;
        if (count === 2) {
          this.progress_data = 100;
          this.progress_status = "success";
          setTimeout(() => {
            this.progress_show = false;
            // Tool.no_feature_locker(this.map, true);
          }, 1000);
        }
      });
      Tool.add_features_by_ids_fids(
        this.map,
        [2, 1],
        [2, 1, 72, 29, 59, 99, 90, 91, 92, 93]
      ).then((response) => {
        count++;
        if (count === 2) {
          this.progress_data = 100;
          this.progress_status = "success";
          setTimeout(() => {
            this.progress_show = false;
            // Tool.no_feature_locker(this.map, true);
          }, 1000);
        }
        that.$refs.legend_ref.map_listener();
      });
      // Tool.add_features_by_ids_fids(this.map, [133,134], []);
      Tool.change_visible(2, this.map, true);
      Tool.change_visible(72, this.map, false);
      Tool.change_visible(1, this.map, true);
      Tool.change_visible(29, this.map, false);
      Tool.change_visible(59, this.map, false);
      Tool.change_visible(99, this.map, false);
      Tool.change_visible(64, this.map, false);
      Tool.change_visible(900, this.map, true);
      Tool.change_visible(901, this.map, false);
      Tool.change_visible(902, this.map, false);
      Tool.change_visible(903, this.map, false);
      Tool.change_visible(904, this.map, false);
    });
    this.add_test();

    var timestamp = Date.parse(new Date()) / 1000;
    this.time_go(timestamp, 5);

    const h = this.$createElement;

    // this.$notify({
    //   title: "更新日志",
    //   dangerouslyUseHTMLString: true,
    //   // message: h('i', { style: 'color: teal'}, '<span>4.3日更新：</span>\n1.清石片区治理信息更新\n2.无要素图层锁定且无法打开\n3.点要素基本信息')
    //   message:
    //     "<strong>4.7日更新<br/> 1.三个阶段要素和面的比较<br/>2.点要素的坐标偏移</strong>",
    // });
  },
};
</script>
