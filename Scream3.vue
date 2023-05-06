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
          <!-- <dv-decoration-3 style="width: 100%; height: 30px" /> -->
          <!-- 
          <el-button type="text" @click="go_one">大屏1</el-button>
          <el-button type="text" @click="go_two">大屏2</el-button> -->
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
          <!-- <span>世界银行贷款湖南株洲清水塘区域重</span>
          <span>金属污染环境治理工程</span> -->
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
            <dv-border-box-1
              class="flex-vertical"
              style="width: 95%; height: calc(100vh - 110px)"
            >
              <!-- 左上角两个charts -->
              <el-scrollbar
                style="height: 100%"
                ref="azeScroll"
                class="scrollbar_panel"
              >
                <el-timeline>
                  <el-timeline-item
                    v-for="(activity, index) in activities"
                    :key="index"
                    :timestamp="activity.timestamp"
                    :color="activity.color"
                    size="large"
                    font-size="20px"
                    font-color="white"
                    type="warning"
                    style="top: 2em; position: relative; left: -1.5em"
                    placement="top"
                  >
                    <el-card
                      body-style="height:18px;width:200px;top:-0.5em;position:relative"
                      style="background-color: rgba(19, 25, 47, 0.6)"
                      :style="{ height: activity.height }"
                    >
                      <p class="timeline-title">{{ activity.content }}</p>
                      <p
                        class="timeline-content"
                        v-if="activity.color === 'green'"
                      >
                        {{ activity.txt }}
                      </p>
                    </el-card>
                  </el-timeline-item>
                </el-timeline>
              </el-scrollbar>
            </dv-border-box-1>
          </div>
          <div>
            <dv-border-box-8 style="width: 100%; height: calc(100vh - 110px)">
              <div class="map1" id="map1">
                <el-button-group class="group">
                  <el-button
                    type="primary"
                    icon="el-icon-video-pause"
                    @click="pause"
                    >{{ pause_text }}</el-button
                  >
                </el-button-group>

                <div class="imggroup">
                  <div class="img1" v-if="img_show === 1"></div>
                  <div class="img2" v-if="img_show === 1"></div>

                  <div class="img3" v-if="img_show === 2"></div>
                  <div class="img4" v-if="img_show === 2"></div>
                </div>
              </div>
            </dv-border-box-8>
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
import {
  Group as LayerGroup,
  Tile as TileLayer,
  Vector as VectorLayer,
  VectorTile,
  Image,
} from "ol/layer";
import map_legend from "./zujian/popup_inner/legend.vue";
import { bordersbylayercodes } from "./api/map_api/CSXBorder";
import { Point, Polygon, Circle, MultiPolygon } from "ol/geom";

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
      myradio: "1",
      map_type: 0,
      panelheight: "200px",
      activities: [
        {
          content: "世行项目",
          timestamp: "2014-03  可研",
          color: "white",
          height: "50px",
          init_height: "50px",
          txt: "本项目位于株洲市清水塘工业区，项目区域总面积8.48 km2，通过场地环境污染调查及风险评估，制定了以风险控制为基础的修复目标和技术路线，提出片区污染土壤治理、关停企业污染地块治理、历史遗留废渣治理、水体污染底泥治理等污染修复治理方案，以达到控制环境污染风险、保护人体健康和生态环境的目标。可研编制单位：湖南省国际工程咨询中心；湖南新九方科技有限公司",
          //1
        },
        {
          content: "铜霞片区土壤治理工程",
          timestamp: "2015-10  设计",
          color: "white",
          height: "50px",
          init_height: "50px",
          txt: "铜霞片区总面积 1.05km2，项目对受重金属镉、铅、砷污染的土壤进行治理，治理面积为 0.74km2；对于重度污染土壤进行异位稳定化/固化后回填用作道路路基，对于轻度污染土壤进行预处理+改良及换填至非敏感用地低洼地段回填。设计单位：中机国际工程设计研究院有限责任公司",
          //2
        },
        {
          content: "清水片区土壤治理工程",
          timestamp: "2015-10  设计",
          color: "white",
          height: "50px",
          init_height: "50px",
          txt: "清水片区总面积 1.10km2，项目对受重金属镉、铅、砷污染的土壤进行治理，治理面积为 0.56km2；项目采用异位稳定化/固化+填埋、原位稳定化/固化+生态恢复、异位换填、生态拦截等多种技术对污染土壤进行治理。设计单位：中机国际工程设计研究院有限责任公司",
          //3
        },
        {
          content: "第三方-清水湖湿地公园",
          timestamp: "2016-09   施工",
          color: "white",
          height: "50px",
          init_height: "50px",
          txt: "",
          //4
        },
        {
          content: "第三方-清湖路(原环保大道)",
          timestamp: "2016-10   施工",
          color: "white",
          height: "50px",
          init_height: "50px",
          txt: "",
          //5
        },
        {
          content: "第三方-江湾名府",
          timestamp: "2016-11   施工",
          color: "white",
          height: "50px",
          init_height: "50px",
          txt: "",
          //6
        },
        {
          content: "第三方-B保物流",
          timestamp: "2016-12   施工",
          color: "white",
          height: "50px",
          init_height: "50px",
          txt: "",
          //7
        },
        {
          content: "第三方-清霞路(原疏港大道)",
          timestamp: "2017-03   施工",
          color: "white",
          height: "50px",
          init_height: "50px",
          txt: "",
          //8
        },
        {
          content: "铜霞片区土壤治理工程",
          timestamp: "2017-05   施工",
          color: "white",
          height: "50px",
          init_height: "50px",
          txt: "铜霞片区总面积为 1.05km2，本项目治理受重金属污染土壤 39.86万 m3，其中重度污染土壤 4.62 万 m3，受控轻度污染土壤 32.65 万 m3，换填轻度污染土壤 2.60 万 m3。施工单位：湖南高岭建设集团股份有限公司。项目合同金额：2749.99万元。",
          //9
        },
        {
          content: "清水片区土壤治理工程",
          timestamp: "2017-06   施工",
          color: "white",
          height: "50px",
          init_height: "50px",
          txt: "清水片区总面积为 1.10km2，本项目治理受重金属污染土壤面积 0.56km2，受重金属污染土壤 21.1万 m3。施工单位：博天环境集团股份有限公司。项目合同金额：3512.31万元。",
          //10
        },
        {
          content: "铜塘湾污染土地综合治理工程",
          timestamp: "2018-06   设计",
          color: "white",
          height: "50px",
          init_height: "70px",
          txt: "铜塘湾片区总面积为 1.23km2，本治理范围包括水塘、土壤，治理面积为 75970m2。项目采用原位稳定化/固化+生态恢复技术对污染土壤进行治理，采用脱水+异位稳定化/固化+填埋技术对污染水塘底泥进行治理。设计单位：湖南新九方科技有限公司",
          //11
        },
        {
          content: "清水湖污染土壤治理工程",
          timestamp: "2018-06   设计",
          color: "white",
          height: "50px",
          init_height: "50px",
          txt: "清水湖片区区域面积为 1.78km2，项目范围包括土壤及水塘，总治理面积为 0.95km2。项目对重金属总量超标土壤采用直接填埋；对浸出超标土壤采用异位稳定化固化技术，对污染水塘底泥采用采用脱水+异位稳定化/固化+填埋技术进行治理。设计单位：湖南新九方科技有限公司",
          //12
        },
        {
          content: "铜霞历史遗留废渣治理工程",
          timestamp: "2018-7   设计",
          color: "white",
          height: "50px",
          init_height: "50px",
          txt: "铜霞片区历史遗留废渣场面积为 20064m2，需要治理废渣共计 126616m3，其中 I 类废渣 64860万 m3，II 类废渣 61756m3。项目对废渣进行预处理、稳定化/固化治理及安全处置。设计单位：湖南新九方科技有限公司",
          //13
        },
        {
          content: "清水历史堆存废渣治理工程",
          timestamp: "2018-07   设计",
          color: "white",
          height: "50px",
          init_height: "50px",
          txt: "清水片区历史堆存废渣项目占地面积 11190.47 m2，治理范围面积 4070m2。项目的治理对象包括危险废物、Ⅱ类废渣、Ⅰ类废渣，分别采用回转窑焚烧处置、稳定化固化处理和暂存的技术对废渣进行治理。设计单位：中机国际工程设计研究院有限责任公司",
          //14
        },
        {
          content: "袁家冲废渣治理项目",
          timestamp: "2018-08   设计",
          color: "white",
          height: "50px",
          init_height: "50px",
          txt: "袁家冲废渣治理范围面积 5520.93m2，项目的治理对象包括危险废物、Ⅱ类废渣，分别采用回转窑焚烧、稳定化固化的技术对废渣进行治理。设计单位：中机国际工程设计研究院有限责任公司",
          //15
        },
        {
          content: "映峰片区重金属土壤治理工程",
          timestamp: "2019-01   设计",
          color: "white",
          height: "50px",
          init_height: "70px",
          txt: "映峰片区区域面积为 0.97km2，项目范围包括土壤、水塘及山体，总治理面积为188536.3m2。项目对重金属总量超标土壤采用直接填埋；对浸出超标土壤采用稳定化固化技术，对污染水塘底泥采用采用脱水+异位稳定化/固化+填埋技术进行治理，对污染山体进行风险管控。设计单位：湖南新九方科技有限公司",
          //16
        },

        {
          content: "株洲清水塘水塘治理工程",
          timestamp: "2019-03   设计",
          color: "white",
          height: "50px",
          init_height: "50px",
          txt: "本项目对清水片区及铜霞片区污染水塘进行治理，治理面积共 89521.2m2。项目对仅重金属总量超标底泥采用加石灰辅助重力脱水，加水泥进行固化，固化后的底泥暂存处理；对重金属浸出超标底泥采用稳定化固化处理后暂存。设计单位：湖南新九方科技有限公司",
          //17
        },
        {
          content: "铜塘湾片区污染土地综合治理工程",
          timestamp: "2019-04   施工",
          color: "white",
          height: "50px",
          init_height: "70px",
          txt: "铜塘湾片区总面积为 1.23km2，项目治理污染土壤量为95457m3，治理水塘底泥量为2941m3。施工单位：博天环境集团股份有限公司。项目合同金额：1346.99万元",
          //18
        },
        {
          content: "铜霞片区历史遗留废渣治理工程",
          timestamp: "2019-04   施工",
          color: "white",
          height: "50px",
          init_height: "70px",
          txt: "铜霞片区历史遗留废渣场面积为 20064m2，治理废渣共计 126616m3，其中 I 类废渣 64860万 m3，II 类废渣 61756m3。施工单位：宏林建设工程集团有限公司。合同金额：1643.30万元",
          //19
        },
        {
          content: "清石片区污染土壤治理工程",
          timestamp: "2019-06   设计",
          color: "white",
          height: "50px",
          init_height: "50px",
          txt: "清石片区总面积 1.20km2，项目治理对象为土壤、水塘及渠道，项目治理面积共 0.16km2，项目采用挖运、异位及原位稳定化处理、暂存、填埋等技术对污染土壤进行治理。对污染水塘及渠道底泥采用采用脱水+异位稳定化/固化+填埋技术进行治理。设计单位：湖南新九方科技有限公司",
          //20
        },
        {
          content: "响石岭片区污染土壤治理工程",
          timestamp: "2019-06   设计",
          color: "white",
          height: "50px",
          init_height: "70px",
          txt: "响石岭片区总面积 1.24km2，项目治理对象为重金属污染土壤及水塘，治理面积为 91341m2。项目对仅重金属总量超标土壤采用挖掘、暂存、填埋技术进行治理，对重金属浸出超标土壤采用原位稳定化技术进行治理，对污染水塘底泥采用采用脱水+异位稳定化/固化+填埋技术进行治理。设计单位：湖南新九方科技有限公司",
        }, //21
        {
          content: "宏基锌业土壤污染治理工程",
          timestamp: "2019-07   设计",
          color: "white",
          height: "50px",
          init_height: "50px",
          txt: "株洲宏基锌业有限公司厂区红线内场地面积 27.57 亩，本项目污染治理面积共 6482m2。（疏港大道经过宏基锌业有限公司的范围面积约为12120m2，已开展先期治理，不在本项目治理范围。）项目对区域内上层（0-0.5m）重金属总量和浸出均超标土壤进行异位固化/稳定化处理；对下层（0.5-9m）污染土壤采用三重管高压旋喷法进行原位固化/稳定化处理。设计单位：湖南新九方科技有限公司",
        }, ///22
        {
          content: "天源纺织场地修复项目",
          timestamp: "2019-07   设计",
          color: "white",
          height: "50px",
          init_height: "50px",
          txt: "株洲市天源纺织有限责任公司地块红线范围面积 34885m2，治理面积为17713m2。项目对于重金属总量超标浸出超综排标准土壤采用稳定化/固化场处理达标填埋；仅重金属总量超标土壤直接进入暂存场进行暂存后进入清水塘一般工业固废填埋场填埋。设计单位：湖南新九方科技有限公司",
        }, //23
        {
          content: "荷花水泥厂场地修复与风险管控项目",
          timestamp: "2019-07   设计",
          color: "white",
          height: "70px",
          init_height: "70px",
          txt: "清石片区、铜塘湾片区污染治理工程竣工验收",
        }, //24
        {
          content: "鑫达冶化场地修复治理工程",
          timestamp: "2019-07   设计",
          color: "white",
          height: "50px",
          init_height: "50px",
          txt: "株洲市鑫达冶化厂区地块治理总面积为 12813.39m2，其中包括高压电塔保护区风险管控面积 582 m2，污染土壤进行稳定化/固化治理面积 12231.39 m2；治理深度 0-5m，治理污染土方量 54343m3。治理内容包括：高压电线塔保护区风险管控、厂区混凝土地面破除及处置、污染土壤的挖运、污染土壤异位稳定化固化处理、污染土壤原位稳定化处理、场地客土回填及生态恢复工程等。设计单位：湖南新九方科技有限公司",
        }, //25
        {
          content: "清水历史堆存废渣治理工程",
          timestamp: "2019-07   施工",
          color: "white",
          height: "50px",
          init_height: "50px",
          txt: "清水片区历史堆存废渣项目占地面积 11190.47 m2，治理危险废物9695m3，治理Ⅱ类废渣 11095m3，治理为Ⅰ类废渣 4810m3 。施工单位：湖南高岭建设集团有限公司。合同金额：1460.52万元",
        }, //26
        {
          content: "袁家冲废渣治理项目",
          timestamp: "2019-07   施工",
          color: "white",
          height: "50px",
          init_height: "50px",
          txt: "袁家冲废渣治理范围面积 5520.93m2，治理危险废物2334m3，治理Ⅱ类废渣5969m3。施工单位：中湘环保股份有限公司。合同金额：651.05万元",
        }, //27
        {
          content: "清水湖片区污染土壤治理工程",
          timestamp: "2019-11   施工",
          color: "white",
          height: "50px",
          init_height: "70px",
          txt: "铜塘湾片区总面积为 1.23km2，项目治理污染土壤量为43910.3m3，治理水塘底泥量为20365.6m3。",
        }, //28
        {
          content: "袁家冲废渣治理项目",
          timestamp: "2019-12   施工",
          color: "white",
          height: "50px",
          init_height: "50px",
          txt: "竣工验收备案专家组验收结论：项目实施对消除区域环境安全隐患意义较大，项目验收资料较齐全，基本满足验收要求。",
        }, //29
        {
          content: "响石岭污染治理工程",
          timestamp: "2020-03",
          color: "white",
          height: "50px",
          init_height: "50px",
          txt: "响石岭片区总面积 1.24km2，治理面积共 913412m，外运暂存污染土壤 34827m3，原位稳定化固化治理土壤方量为15019m3，治理污染底泥 14413m3，山地污染区域风险管控面积 3307m2。施工单位：湖南恒凯环保科技投资有限公司。项目合同金额：896.13万元。",
        }, //30
        {
          content: "铜霞土壤治理工程",
          timestamp: "2020-03   验收",
          color: "white",
          height: "50px",
          init_height: "50px",
          txt: "效果评估结论：项目治理区域污染土壤按项目设计要求进行了处理;项目的污染治理效果基本达到风险评估报告提出的治理修复目标。",
        }, //31
        {
          content: "清水土壤治理工程",
          timestamp: "2020-03   验收",
          color: "white",
          height: "50px",
          init_height: "50px",
          txt: "效果评估专家评估结论：已治理45个地块治理效果达到了实施方案提出的治理修复目标要求。",
        }, //32
        {
          content: "清水湖污染土壤治理工程",
          timestamp: "2020-03   验收",
          color: "white",
          height: "50px",
          init_height: "50px",
          txt: "株洲市生态环境局对佛山市铁人环保科技有限公司编制的《清水湖片区土壤  治理工程验收调查报告》予以形式备案。报告中涉及的具体数据由编制单位和实施单位负责解释。",
        }, //33
        {
          content: "清水片区历史堆存废渣治理工程",
          timestamp: "2020-04   验收",
          color: "white",
          height: "50px",
          init_height: "70px",
          txt: "株洲市生态环境局对佛山市铁人环保科技有限公司编制的《清水片区历史堆存 废渣治理项目竣工验收调查报告》予以形式备案。",
        }, //34
        {
          content: "清石片区污染治理工程",
          timestamp: "2020-04   施工",
          color: "white",
          height: "50px",
          init_height: "50px",
          txt: "清石片区总面积 1.20km2，项目治理面积为159827.3m2。本项目治理污染土壤量为68546.3m3，治理水塘底泥量为31313.8m3，治理渠道底泥量为7792.4m3。",
        }, //35

        {
          content: "映峰重金属土壤治理工程",
          timestamp: "2020-06   施工",
          color: "white",
          height: "50px",
          init_height: "50px",
          txt: "映峰片区区域面积为 0.97km2，治理污染土壤量为43449.5m3，治理水塘底泥量为6421.6m3，山体风险管控面积132515.1m2。",
        }, //36
        {
          content: "清水塘老工业区一般固废填埋项目",
          timestamp: "2020-06   施工",
          color: "white",
          height: "50px",
          init_height: "70px",
          txt: "本项目回填区包括1#回填区和2#回填区，其中1#回填区为荷花水泥厂采石坑，用于回填I类工业固体废物，填埋库容为 75 万 m3，有效库容为 65 万 m3。2#回填 区在原新桥渣场顶部扩容改造，用于回填Ⅱ类工业固体废物，设计总库容为 11.5 万 m3，有效库容为 8.8 万 m3。",
        }, //37
        {
          content: "株洲清水塘水塘治理工程",
          timestamp: "2020-06   施工",
          color: "white",
          height: "50px",
          init_height: "50px",
          txt: "本项目对清水片区及铜霞片区污染水塘进行治理，治理面积共 89521.2m2，治理污染底泥 49236.7m3，生态恢复面积 42241.9m2。",
        }, //38
        {
          content: "天源纺织场地修复项目",
          timestamp: "2020-07   施工",
          color: "white",
          height: "50px",
          init_height: "50px",
          txt: "株洲市天源纺织有限责任公司地块红线范围面积 34885m2，治理面积17713m2，污染土壤总量为 77883m³，其中治理重金属总量超标且浸出超综排标准土壤量 14443m3治理仅重金属总量超标土壤量为 63440m3。施工单位：博天环境集团股份有限公司。项目合同金额：3280.74万元（天源纺织、宏基锌业、荷花水泥厂及鑫达冶化场地）。",
        }, //39
        {
          content: "宏基锌业土壤污染治理工程",
          timestamp: "2020-07   施工",
          color: "white",
          height: "50px",
          init_height: "50px",
          txt: "株洲宏基锌业有限公司土壤污染治理工程的治理面积为6482m2。项目治理污染土壤量为36640.3m3，其中异位治理污染土壤量为3188.3m3，原位治理污染土壤量为33452m3。",
        }, //40
        {
          content: "荷花水泥厂场地修复与风险管控项目",
          timestamp: "2020-07   施工",
          color: "white",
          height: "50px",
          init_height: "70px",
          txt: "株洲市荷花水泥厂占地面积为26787m2，项目异位土壤开挖面积为2170m2，治理土壤量为1302m3；原位治理面积为3079m2，治理土壤量为20997m3；土壤风险管控面积为15293m2。施工单位：博天环境集团股份有限公司。项目合同金额：3280.74万元（天源纺织、宏基锌业、荷花水泥厂及鑫达冶化场地）。",
        }, //41
        {
          content: "鑫达冶化场地修复治理工程",
          timestamp: "2020-07   施工",
          color: "white",
          height: "50px",
          init_height: "50px",
          txt: "株洲市鑫达冶化有限公司场地治理面积为12813.39m2，治理污染土壤量为54504.7m3，其中异位治理污染土壤量为6115.7m3，原位治理污染土壤量为48389m3。",
        }, //42
        {
          content: "康力冶炼污染场地土壤修复治理项目",
          timestamp: "2020-08   设计",
          color: "white",
          height: "50px",
          init_height: "70px",
          txt: "株洲市康力冶炼有限公司污染场地，位于株洲市清水塘工株洲市康力冶炼有限公司污染场地，位于株洲市清水塘工业区。项目治理场地面积达 11821.23m2，共计修复土方量为 6664m3。场地治理内容包括：厂区混凝土地面破除及处置、污染土壤的挖运、重金污染土壤异位稳定化/固化、污染阻隔以及场地覆土及绿化等。设计单位：湖南新九方科技有限公司",
        }, //43
        {
          content: "清水塘环保信息与示范中心",
          timestamp: "2020-10   施工",
          color: "white",
          height: "50px",
          init_height: "50px",
          txt: "株洲市清水塘环保信息与示范中心位于清水塘片区科技创新板块，基地呈南北向不规则形状，其中南北向约长152米，东西约长84m。项目基地总用地面积 6571.50m2，合计 9.86 亩，总建筑面积为 4781.13m2。中心由两馆三中心组成，其中两馆为世行项目展示馆、老工业区搬迁改造展示馆，三中心分别为环境数据中心、环保产业服务发展交流中心，会议中心。",
        }, //44
        {
          content: "第三方-火炬地块",
          timestamp: "2020-10   施工",
          color: "white",
          height: "50px",
          init_height: "50px",
          txt: "",
        }, //45
        {
          content: "清石污染治理工程",
          timestamp: "2020-12   验收",
          color: "white",
          height: "50px",
          init_height: "50px",
          txt: "株洲市生态环境局对湖南湘中博一检测技术有限公司编制的《株洲清水塘清石片区土壤治理工程验收调查报告》予以形式备案。报告中涉及的具体数据由编制单位和实施单位负责解释。",
        }, //46
        {
          content: "铜塘湾污染土地综合治理工程",
          timestamp: "2020-12   验收",
          color: "white",
          height: "50px",
          init_height: "70px",
          txt: "株洲市生态环境局对佛山市铁人环保科技有限公司编制的《株洲清水塘铜塘湾片区污染土地综合治理工程验收调查报告》予以形式备案。报告中涉及的具体数据由编制单位和实施单位负责解释。",
        }, //47
        {
          content: "铜霞片区历史遗留废渣治理工程",
          timestamp: "2020-12   验收",
          color: "white",
          height: "50px",
          init_height: "70px",
          txt: "株洲市生态环境局对佛山市铁人环保科技有限公司编制的《铜霞片区历史 遗留废渣治理工程效果验收调查报告》予以形式备案。",
        }, //48
        {
          content: "海利株洲精细化工地块土壤污染修复项目",
          timestamp: "2021-01   设计",
          color: "white",
          height: "50px",
          init_height: "70px",
          txt: "原湖南海利株洲精细化工有限公司场地红线范围面积 116246m2，项目治理面积 62164m2。，项目对0-6m污染土壤采用异位和原位相结合的治理方式，其中对重金属污染土壤土壤采用固化/稳定化处理，对于有机物污染土壤采用热脱附处理，对于有机物超标且重金属总量浸出超标土壤土壤先采用热脱附工艺处理有机污染物，检测达标后再进行固化/稳定化处理；对 6-10m污染土壤采用原位管控的治理方式。设计单位：中机国际工程设计研究院有限责任公司",
        }, //49
        {
          content: "盈德气体地块土壤污染综合治理工程",
          timestamp: "2021-01   设计",
          color: "white",
          height: "50px",
          init_height: "70px",
          txt: "原湖南海利株洲精细化工有限公司场地红线范围面积 116246m2，项目治理面积 62164m2。，项目对0-6m污染土壤采用异位和原位相结合的治理方式，其中对重金属污染土壤土壤采用固化/稳定化处理，对于有机物污染土壤采用热脱附处理，对于有机物超标且重金属总量浸出超标土壤土壤先采用热脱附工艺处理有机污染物，检测达标后再进行固化/稳定化处理；对 6-10m污染土壤采用原位管控的治理方式。设计单位：中机国际工程设计研究院有限责任公司",
        }, //50
        {
          content: "清水冶化地块土壤治理与修复项目",
          timestamp: "2021-01   设计",
          color: "white",
          height: "50px",
          init_height: "70px",
          txt: "原株洲市清水冶化有限责任公司地块总面积为25914m2，项目对危险废物的废渣运至株洲市周边有危险废物经营许可证的公司进行处置；对 II 类一般工业固体废物进行水泥窑协同处置；对I 类一般工业固体废物进行填埋；对仅总量超标的污染土壤清运后填埋处理，对总量超标浸出超标的污染土壤经稳定化/固化处理后填埋处理。设计单位：湖南新九方科技有限公司",
        }, //51
        {
          content: "清石片区重金属历史遗留废渣治理工程",
          timestamp: "2021-01   设计",
          color: "white",
          height: "50px",
          init_height: "70px",
          txt: "清石片区重金属历史遗留废渣治理项目红线范围面积 40667.5m2，堆存渣量 360252m3，项目对危险废物清运至水泥窑协同处置（实际施工时可考虑危险废物废渣中有，第 Ⅱ 类一般工业固体废物清运至水泥窑协同处置，第 Ⅰ 类一般工业固体废物清运至清水塘老工业区一般固废填埋场安全填埋处置。设计单位：湖南新九方科技有限公司",
        }, //52
        {
          content: "湖南省株洲清水塘污染土壤集中处置中心建设工程",
          timestamp: "2021-02   施工",
          color: "white",
          height: "50px",
          init_height: "70px",
          txt: "株洲清水塘污染土壤集中处置中心建设工程，位于株洲市中盐湖南株洲化工集团有限公司生产区，占地面积 34328m2。项目设计处理污染土壤规模60~90万m3/年，建设内容包括固化/稳定化生产线1条，总处理能力80~150m3 /h；热脱附生产线1条，处理能力15-20m3/h。",
        }, //53
        {
          content: "株洲市康力冶炼有限公司污染场地土壤修复治理项目",
          timestamp: "2021-03   施工",
          color: "white",
          height: "50px",
          init_height: "70px",
          txt: "株洲清水塘污染土壤集中处置中心建设工程，位于株洲市中盐湖南株洲化工集团有限公司生产区，占地面积 34328m2。项目设计处理污染土壤规模60~90万m3/年，建设内容包括固化/稳定化生产线1条，总处理能力80~150m3 /h；热脱附生产线1条，处理能力15-20m3/h。",
        }, //54
        {
          content: "响石岭片区污染治理工程",
          timestamp: "2021-03   验收",
          color: "white",
          height: "50px",
          init_height: "50px",
          txt: "株洲市生态环境局对湖南湘中博一检测技术有限公司编制的《株洲清水塘响石岭片区土壤治理工程验收调查报告》予以形式备案。报告中涉及的具体数据由编制单位和实施单位负责解释。",
        }, //55
        {
          content: "第三方-口岸一路",
          timestamp: "2021-03   施工",
          color: "white",
          height: "50px",
          init_height: "50px",
          txt: "",
        }, //56
        {
          content: "株洲清水塘水塘治理工程",
          timestamp: "2021-06   验收",
          color: "white",
          height: "50px",
          init_height: "50px",
          txt: "株洲市生态环境局对常德市常环环境科技有限公司  编制的《水塘治理工程效果评估报告》予以形式备案。报告中涉及的具体数据由编制单位和实施单位负责解释。",
        }, //57
        {
          content: "原湖南海利株洲精细化工有限公司地块土壤污染修复项目",
          timestamp: "2021-06   施工",
          color: "white",
          height: "50px",
          init_height: "90px",
          txt: "本项目治理面积为62164m2，治理污染土壤量为94866m3，其中异位治理污染土壤量为80864m3，原位治理污染土壤量为14002m3。施工单位：湖南凯迪工程科技有限公司。项目合同金额：1128.88万元。",
        }, //58
        {
          content: "原湖南盈德气体有限公司地块土壤污染综合治理工程",
          timestamp: "2021-06   施工",
          color: "white",
          height: "50px",
          init_height: "70px",
          txt: "盈德气体有限公司红线范围面积 17022.07m2，治理总面积15527.27m2， 对0-6m 污染土壤 24545m3 异位管控；对6m 以下污染土壤原位阻隔风险管控；对一般 I 类工业固废 5629.28m3 进行填埋处置。施工单位：广西博世科环保科技股份有限公司。项目合同金额：351.93万元。",
        }, //59
        {
          content: "原株洲市清水冶化有限责任公司地块土壤治理与修复项目",
          timestamp: "2021-06   施工",
          color: "white",
          height: "50px",
          init_height: "70px",
          txt: "原株洲市清水冶化有限责任公司地块总面积为25914m2，项目治理废渣总量 9500m3，其中危险废物 4705m3（水泥窑协同处置）、 II 类固体废物 2054m3（水泥窑协同处置）、I 类固体废物 2741m3（送I 类固体废物填埋场）；治理污染土壤 23030m3，其中总量超标浸出未超标 21251m3（送 I 类固体废物填埋场）、总量超标浸出超标 1779m3（稳定化处理后送 I 类固体废物填埋场）。施工单位：湖南恒凯环保科技投资有限公司。项目合同金额：573.22万元。",
        }, //60
        {
          content: "映峰片区重金属土壤治理工程",
          timestamp: "2021-06   验收",
          color: "white",
          height: "50px",
          init_height: "70px",
          txt: "株洲市生态环境局对佛山市铁人环保科技有限公司编制的《株洲清水塘映峰片区重金属土壤治理工程验收调查报告》予以形式备案。报告中涉及的具体数据由编制单位和实施单位负责解释。",
        }, //61
        {
          content: "株洲市天源纺织有限责任公司场地修复项目",
          timestamp: "2021-09   验收",
          color: "white",
          height: "50px",
          init_height: "70px",
          txt: "效果评估报告认为,项目治理区域土壤按实施方案要求进行了处置,修复后地块下步开发建设过程中在不扰动下层土壤的条件下,地块可按照《土壤 环境质量建设用地土壤污染风险管控标准(试行)》CGB 36600 2018)中的第二类用地使用。",
        }, //62

        {
          content: "株洲宏基锌业有限公司土壤污染治理工程",
          timestamp: "2021-09   验收",
          color: "white",
          height: "50px",
          init_height: "70px",
          txt: "效果评估报告认为,项目治理区域土壤按实施方案要求进行了处置，修复后地块下一步开发建设过程中在不扰动下层土壤的条件下,地块可按照《土壤环境质量建设用地土壤污染风险管控标准(试行)》(GB 36600-2018)中的第二类用地使用。",
        }, //63
        {
          content: "株洲市荷花水泥厂场地修复与风险管控项目",
          timestamp: "2021-09   验收",
          color: "white",
          height: "50px",
          init_height: "70px",
          txt: "株洲市生态环境局对湖南品标华测检测技术有限公司编制的《株洲市荷花水泥厂场地修复与风险管控项目竣工环境保护验收报告》予以备案。",
        }, //64
        {
          content: "株洲市鑫达冶化有限公司场地修复治理工程",
          timestamp: "2021-09   验收",
          color: "white",
          height: "50px",
          init_height: "70px",
          txt: "建设用地土壤污染风险评估、风险管控或修复效果评估报告备案申请表结论：效果评估报告引用的资料较齐全，内容较完整，报告格式基本符合国 家相关技术标准和导则要求，地块治理效果达到治理修复目标。",
        }, //65
        {
          content: "株洲市康力冶炼有限公司污染场地土壤修复治理项目",
          timestamp: "2021-09   验收",
          color: "white",
          height: "50px",
          init_height: "70px",
          txt: "已经按施工合同约定的质量要求完成施工，单位工程验收合格，质量控制资料齐全，有关安全和功能的检测资料完整，观感质量符合要求。",
        }, //66
        {
          content: "清石片区重金属历史遗留废渣治理工程",
          timestamp: "2021-10   施工",
          color: "white",
          height: "50px",
          init_height: "70px",
          txt: "清石片区重金属历史遗留废渣治理项目红线范围面积 40667.5m2，堆存渣量 360252m3，项目异位处置废渣量为 174697m3，其中外运处置危险废物 14125m3、Ⅱ类一般工业固体废物 75732m3，Ⅰ 类一般工业固体废物 84840m3；原位风险管控废渣量为 185555m3。施工单位：北京高能时代环境技术股份有限公司。项目合同金额：7986.13万元",
        }, //67
        {
          content: "原株洲市清水冶化有限责任公司地块土壤治理与修复项目",
          timestamp: "2021-11   验收",
          color: "white",
          height: "50px",
          init_height: "90px",
          txt: "已经按施工合同约定的质量要求完成施工，单位工程验收合格，质量控制资料齐全，有关安全和功能的检测资料完整，观感质量符合要求。",
        }, //68
      ],
      // start_time: 0,
      timer: null,
      pause_mode: false,
      pause_text: "暂停",
      img_show: 0,
    };
  },
  created() {},
  mounted() {
    this.begin_map();
    this.add_data();

    // setTimeout(() => {
    //   this.start_time = Date.parse(new Date()) / 1000;
    //   this.timeFn();
    // }, 1000);

    // setTimeout(() => {
    // // locationY替换你想要的高度
    // this.$refs.azeScroll.wrap.scrollTop = 100;
    // }, 1000);
  },
  methods: {
    timeFn() {
      let start_time = Date.parse(new Date()) / 1000;
      let start_type = this.map_type;
      //获取时间
      this.timer = setInterval(() => {
        this.dateDay = this.formatTimes(new Date(), "HH: mm: ss");
        this.dateYear = this.formatTimes(new Date(), "yyyy-MM-dd");
        this.dateWeek = this.weekday[new Date().getDay()];
        // console.log(new Date())
        // console.log(Date.parse(new Date()) / 1000-this.start_time)
        this.map_type =
          parseInt(
            (Date.parse(new Date()) / 1000 - start_time) / 4 + start_type
          ) % 69;
      }, 1000);
    },
    formatTimes(time, fmt) {
      if (!time) return "";
      else {
        const date = new Date(time);
        // this.map_type = (parseInt(date.getSeconds() / 6) % 4) + 1;
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
        center: fromLonLat([113.08, 27.8705]),

        // center:[113,30],
        zoom: 14.5,
        maxZoom: 18,
        minZoom: 14.3,
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

      Tool.add_baselayers(this.map1);
      // this.map1.addControl(controls.switcher);
    },
    login() {
      localStorage.setItem("access-user", JSON.stringify("success"));

      this.$router.push({ path: "/" });
    },
    add_data() {
      Tool.add_layers_by_ids_fids(
        this.map1,
        [
          5, 135, 159, 187, 214, 250, 283, 2, 18, 150, 174, 207, 229, 265, 298,
          541, 551, 552, 553, 306, 318, 365, 377, 380, 392, 350, 362, 423, 435,
          444, 456, 498, 510, 524, 536,
        ],
        [
          5,
          135,
          159,
          187,
          214,
          250,
          283,
          6,
          7,
          8,
          9,
          136,
          137,
          138,
          139,
          160,
          161,
          162,
          163,
          188,
          189,
          190,
          191,
          215,
          216,
          217,
          218,
          251,
          252,
          253, //
          254,
          284,
          285,
          286,
          287,
          2,
          59,
          64,
          18,
          150,
          174,
          207,
          229,
          265,
          298,
          19,
          20,
          151,
          152,
          175,
          176,
          208,
          209,
          230,
          231,
          266,
          305,
          72,
          541,
          547,
          542,
          551,
          566,
          567,
          552,
          573,
          574,
          553,
          560,
          561,
          306,
          318,
          307,
          308,
          309,
          347,
          348,
          349,
          539,
          365,
          377,
          366,
          367,
          368,
          380,
          392,
          381,
          382,
          383,
          420,
          421,
          422,
          350,
          362,
          351,
          352,
          353,
          423,
          435,
          424,
          425,
          426,
          540,
          444,
          456,
          445,
          446,
          447,
          488,
          489,
          490,
          491,
          492,
          498,
          510,
          499,
          500,
          501,
          511,
          512,
          524,
          536,
          525,
          526,
          527,
        ]
      ).then((data) => {
        Tool.add_features_scream(
          this.map1,
          [5, 135, 159, 187, 214, 250, 283, 80, 140, 541, 551, 552, 553, 636],
          [
            5, 135, 159, 187, 214, 250, 283, 6, 7, 8, 9, 136, 137, 138, 139,
            160, 161, 162, 163, 188, 189, 190, 191, 215, 216, 217, 218, 251,
            252, 253, 254, 284, 286, 287, 18, 307, 308, 309, 366, 367, 368, 381,
            382, 383, 351, 352, 353, 424, 425, 426, 541, 547, 542, 551, 566,
            567, 552, 573, 574, 553, 560, 561, 445, 446, 447, 499, 500, 501,
            525, 526, 527, 636,
          ]
        ).then((data) => {
          setTimeout(() => {
            this.start_time = Date.parse(new Date()) / 1000;
            this.timeFn();
          }, 1000);
          Tool.new_add_home_points(this.map1, 1);

          Tool.add_features_by_ids_fids(
            this.map1,
            [
              2, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 59, 60, 61, 62, 63,
              64, 65, 72, 150, 151, 152, 153, 154, 155, 174, 175, 176, 177, 178,
              179, 180, 181, 182, 207, 208, 209, 210, 211, 212, 213, 229, 230,
              231, 232, 233, 234, 235, 236, 237, 238, 239, 240, 265, 266, 277,
              278, 279, 298, 299, 300, 301, 305, 319, 320, 321, 322, 323, 324,
              325, 326, 327, 328, 329, 330, 331, 332, 333, 334, 335, 336, 337,
              338, 339, 340, 341, 342, 343, 344, 345, 346, 347, 348, 349, 363,
              364, 393, 394, 395, 396, 397, 398, 399, 400, 401, 402, 403, 404,
              405, 406, 407, 408, 409, 410, 411, 412, 413, 414, 415, 416, 417,
              418, 419, 420, 421, 422, 436, 437, 438, 439, 440, 441, 442, 443,
              457, 458, 459, 460, 461, 462, 463, 464, 465, 466, 467, 468, 469,
              470, 471, 472, 473, 474, 475, 476, 477, 478, 479, 480, 481, 482,
              483, 484, 485, 486, 487, 488, 489, 490, 491, 492, 493, 494, 495,
              496, 497, 513, 514, 515, 516, 517, 518, 519, 520, 521, 522, 523,
              537, 538, 539, 540,
            ],
            []
          );
        });
      });
      this.ini_visible();
    },
    ini_visible() {
      Tool.change_visible(5, this.map1, true);
      Tool.change_visible(135, this.map1, true);
      Tool.change_visible(159, this.map1, true);
      Tool.change_visible(187, this.map1, true);
      Tool.change_visible(214, this.map1, true);
      Tool.change_visible(250, this.map1, true);
      Tool.change_visible(283, this.map1, true);

      Tool.change_visible(288, this.map1, true);
      Tool.change_visible(255, this.map1, true);
      Tool.change_visible(2, this.map1, true);
      Tool.change_visible(2, this.map1, true);
      Tool.change_visible(18, this.map1, true);
      Tool.change_visible(150, this.map1, true);
      Tool.change_visible(174, this.map1, true);
      Tool.change_visible(207, this.map1, true);
      Tool.change_visible(229, this.map1, true);
      Tool.change_visible(265, this.map1, true);
      Tool.change_visible(298, this.map1, true);
      this.close_all_layer();
      Tool.change_visible(288, this.map1, true);
      Tool.change_visible(255, this.map1, true);
      Tool.change_visible(80, this.map1, true);
      Tool.change_visible(140, this.map1, true);
      Tool.change_visible(164, this.map1, true);
      Tool.change_visible(192, this.map1, true);
      Tool.change_visible(219, this.map1, true);
      Tool.change_visible(541, this.map1, true);
      Tool.change_visible(551, this.map1, true);
      Tool.change_visible(552, this.map1, true);
      Tool.change_visible(553, this.map1, true);

      Tool.change_visible(306, this.map1, true);
      Tool.change_visible(318, this.map1, true);
      Tool.change_visible(365, this.map1, true);
      Tool.change_visible(377, this.map1, true);
      Tool.change_visible(350, this.map1, true);
      Tool.change_visible(362, this.map1, true);
      Tool.change_visible(380, this.map1, true);
      Tool.change_visible(392, this.map1, true);

      Tool.change_visible(423, this.map1, true);
      Tool.change_visible(435, this.map1, true);
      Tool.change_visible(444, this.map1, true);
      Tool.change_visible(456, this.map1, true);
      Tool.change_visible(498, this.map1, true);
      Tool.change_visible(510, this.map1, true);
      Tool.change_visible(524, this.map1, true);
      Tool.change_visible(536, this.map1, true);
    },
    close_all_layer() {
      let map = this.map1;

      for (let i = 2; i < map.getLayers().getArray().length; i++) {
        if (map.getLayers().getArray()[i] instanceof VectorLayer) {
          map.getLayers().getArray()[i].setVisible(false);
        } else if (map.getLayers().getArray()[i] instanceof LayerGroup) {
          let group = map.getLayers().getArray()[i];

          for (let j = 0; j < group.getLayers().getArray().length; j++) {
            if (group.getLayers().getArray()[j] instanceof VectorLayer) {
              group.getLayers().getArray()[j].setVisible(false);
            } else if (group.getLayers().getArray()[j] instanceof LayerGroup) {
              let se_group = group.getLayers().getArray()[j];

              for (let k = 0; k < se_group.getLayers().getArray().length; k++) {
                se_group.getLayers().getArray()[k].setVisible(false);
              }
            }
          }
        }
      }
    },
    pause() {
      if (this.pause_mode) {
        this.timeFn();
        this.pause_mode = false;
        this.pause_text = "暂停";
      } else {
        console.log(this.timer);
        clearInterval(this.timer);
        this.pause_mode = true;
        this.pause_text = "继续";
      }
      // clearInterval(this.timer);
    },
    restart() {},
  },
  watch: {
    map_type(oldvalue, newvalue) {
      function flyTo(view, location, targetzoom, done) {
        var duration = 1000;

        var parts = 2;
        var called = false;
        function callback(complete) {
          --parts;
          if (called) {
            return;
          }
          if (parts === 0 || !complete) {
            called = true;
            done(complete);
          }
        }
        view.animate(
          {
            center: location,
            duration: duration,
          },
          callback
        );
        view.animate(
          {
            zoom: 14.3,
            center: fromLonLat([113.08, 27.8705]),
            duration: duration / 2,
          },
          {
            zoom: targetzoom,
            duration: duration / 2,
          },
          callback
        );
      }
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

      function show_layer_feature(layercode, featureid, map) {
        let layer = find_layer(layercode, map);
        let param = {};
        param["layercodes"] = layercode;

        bordersbylayercodes(param).then((res) => {
          let borderdata = res.data.data;

          let features = [];
          for (let j = 0; j < borderdata.length; j++) {
            if (featureid === borderdata[j].featureid) {
              let feature = null;

              if (JSON.parse(borderdata[j].geometry)["type"] === "Polygon") {
                feature = new Feature({
                  type: layer.get("title"),
                  label: borderdata[j].name,
                  geometry: new Polygon(
                    JSON.parse(borderdata[j].geometry).coordinates
                  ),
                  layercode: borderdata[j].layercode,
                  featureid: borderdata[j].featureid,
                  fid: borderdata[j].id,
                  note: borderdata[j].note,
                });
              } else {
                feature = new Feature({
                  type: layer.get("title"),
                  label: borderdata[j].name,
                  geometry: new MultiPolygon(
                    JSON.parse(borderdata[j].geometry).coordinates
                  ),
                  layercode: borderdata[j].layercode,
                  featureid: borderdata[j].featureid,
                  fid: borderdata[j].id,
                  note: borderdata[j].note,
                });
              }
              features.push(feature);
            }
          }
          if (layer !== undefined && layer instanceof VectorLayer) {
            layer.getSource().addFeatures(features);
          }
        });
      }

      for (let i = 0; i < this.activities.length; i++) {
        this.activities[i]["height"] = this.activities[i].init_height;
        this.activities[i]["color"] = "white";
      }
      if (newvalue !== 0) {
        this.activities[newvalue - 1]["color"] = "green";
        this.activities[newvalue - 1]["height"] =
          (
            parseInt(
              (this.activities[newvalue - 1]["txt"].length - 1) / 13 + 1
            ) *
              18 +
            20 +
            Number.parseInt(
              this.activities[newvalue - 1].init_height.split("px")[0]
            )
          ).toString() + "px";

        this.$refs.azeScroll.wrap.scrollTop = 0;
      }

      switch (newvalue) {
        case 1:
          this.activities[newvalue - 1]["height"] =
            Number.parseInt(
              this.activities[newvalue - 1]["height"].split("px")[0]
            ) +
            30 +
            "px";
          this.ini_visible();

          break;

        case 2:
          this.$refs.azeScroll.wrap.scrollTop = (newvalue - 4) * 100 + 50;
          Tool.change_visible(288, this.map1, false);
          Tool.change_visible(290, this.map1, true);
          Tool.change_visible(291, this.map1, true);
          flyTo(
            this.map1.getView(),
            [12587645.89709267, 3232728.4414745807],
            15.2114,
            function () {}
          );

          break;
        case 3:
          this.$refs.azeScroll.wrap.scrollTop = (newvalue - 4) * 100 + 50;
          this.activities[newvalue - 1]["height"] =
            Number.parseInt(
              this.activities[newvalue - 1]["height"].split("px")[0]
            ) +
            20 +
            "px";
          Tool.change_visible(255, this.map1, false);
          Tool.change_visible(257, this.map1, true);
          Tool.change_visible(258, this.map1, true);

          flyTo(
            this.map1.getView(),
            [12586587.172907192, 3233068.540116433],
            15.5147,
            function () {}
          );

          break;
        case 4:
          Tool.change_visible(64, this.map1, true);
          find_layer(64, this.map1).getSource().clear();
          show_layer_feature(64, "清水湖湿地公园", this.map1);
          flyTo(
            this.map1.getView(),
            [12587047.44403905, 3232070.0852316],
            16,
            function () {}
          );

          this.$refs.azeScroll.wrap.scrollTop = (newvalue - 4) * 100 + 50;
          break;
        case 5:
          show_layer_feature(64, "清湖路（原环保大道）", this.map1);
          flyTo(
            this.map1.getView(),
            [12586547.44403905, 3232670.0852316],
            15.2,
            function () {}
          );

          this.$refs.azeScroll.wrap.scrollTop = (newvalue - 4) * 100 + 50;
          break;
        case 6:
          show_layer_feature(64, "江湾名府", this.map1);

          flyTo(
            this.map1.getView(),
            [12589702.460622702, 3231162.888720221],
            16.5,
            function () {}
          );
          this.$refs.azeScroll.wrap.scrollTop = (newvalue - 4) * 100 + 50;
          break;
        case 7:
          show_layer_feature(64, "B保物流", this.map1);
          flyTo(
            this.map1.getView(),
            [12588847.44403905, 3231170.0852316],
            16.5,
            function () {}
          );
          this.$refs.azeScroll.wrap.scrollTop = (newvalue - 4) * 100 + 50;
          break;
        case 8:
          show_layer_feature(64, "清霞路（原疏港大道）", this.map1);
          flyTo(
            this.map1.getView(),
            [12588047.44403905, 3231470.0852316],
            15.5,
            function () {}
          );
          this.$refs.azeScroll.wrap.scrollTop = (newvalue - 4) * 100 + 50;
          break;
        case 9:
          this.$refs.azeScroll.wrap.scrollTop = (newvalue - 4) * 100 + 60;

          Tool.change_visible(290, this.map1, false);
          Tool.change_visible(291, this.map1, false);

          Tool.change_visible(292, this.map1, true);
          Tool.change_visible(293, this.map1, true);
          Tool.change_visible(294, this.map1, true);
          flyTo(
            this.map1.getView(),
            [12587645.89709267, 3232728.4414745807],
            15.2114,
            function () {}
          );
          break;
        //清水施工
        case 10:
          this.$refs.azeScroll.wrap.scrollTop = (newvalue - 4) * 100 + 60;
          Tool.change_visible(64, this.map1, false);
          Tool.change_visible(257, this.map1, false);
          Tool.change_visible(258, this.map1, false);

          Tool.change_visible(259, this.map1, true);
          Tool.change_visible(260, this.map1, true);
          Tool.change_visible(261, this.map1, true);
          flyTo(
            this.map1.getView(),
            [12586587.172907192, 3233068.540116433],
            15.5147,
            function () {}
          );
          break;
        case 11:
          this.$refs.azeScroll.wrap.scrollTop = (newvalue - 4) * 100 + 60;
          this.activities[newvalue - 1]["height"] =
            Number.parseInt(
              this.activities[newvalue - 1]["height"].split("px")[0]
            ) +
            10 +
            "px";
          Tool.change_visible(164, this.map1, false);
          Tool.change_visible(166, this.map1, true);
          Tool.change_visible(167, this.map1, true);
          flyTo(
            this.map1.getView(),
            [12588047.44403905, 3231470.0852316],
            15.50505,
            function () {}
          );
          break;
        case 12:
          this.$refs.azeScroll.wrap.scrollTop = (newvalue - 4) * 100 + 60;
          Tool.change_visible(192, this.map1, false);
          Tool.change_visible(194, this.map1, true);
          Tool.change_visible(195, this.map1, true);
          flyTo(
            this.map1.getView(),
            [12585691.418092232, 3232444.424431],
            15.37275175,
            function () {}
          );
          break;
        case 13:
          this.$refs.azeScroll.wrap.scrollTop = (newvalue - 4) * 100 + 60;
          // Tool.change_visible(60, this.map1, true);
          // find_layer(60, this.map1).getSource().clear();
          // show_layer_feature(60, "铜霞片区废渣", this.map1);
          Tool.change_visible(568, this.map1, true);
          Tool.change_visible(569, this.map1, true);
          flyTo(
            this.map1.getView(),
            [12587057.004977126, 3233343.342626203],
            18,
            function () {}
          );
          break;
        case 14:
          this.$refs.azeScroll.wrap.scrollTop = (newvalue - 4) * 100 + 60;

          // show_layer_feature(60, "清石片区历史堆存废渣", this.map1);
          Tool.change_visible(562, this.map1, true);
          Tool.change_visible(563, this.map1, true);

          flyTo(
            this.map1.getView(),
            [12586898.776010714, 3232739.795433753],
            18,
            function () {}
          );
          break;
        case 15:
          this.$refs.azeScroll.wrap.scrollTop = (newvalue - 4) * 100 + 60;
          this.activities[newvalue - 1]["height"] =
            Number.parseInt(
              this.activities[newvalue - 1]["height"].split("px")[0]
            ) +
            10 +
            "px";
          // show_layer_feature(60, "袁家冲废渣", this.map1);
          Tool.change_visible(575, this.map1, true);
          Tool.change_visible(576, this.map1, true);
          flyTo(
            this.map1.getView(),
            [12587039.064988513, 3233200.0742730517],
            18,
            function () {}
          );
          break;

        case 16:
          this.$refs.azeScroll.wrap.scrollTop = (newvalue - 4) * 100 + 60;
          this.activities[newvalue - 1]["height"] =
            Number.parseInt(
              this.activities[newvalue - 1]["height"].split("px")[0]
            ) +
            10 +
            "px";
          Tool.change_visible(219, this.map1, false);
          Tool.change_visible(222, this.map1, true);
          Tool.change_visible(221, this.map1, true);
          flyTo(
            this.map1.getView(),
            [12586121.300649274, 3233686.1519913],
            15.588702398,
            function () {}
          );
          break;
        case 17:
          this.$refs.azeScroll.wrap.scrollTop = (newvalue - 4) * 100 + 60;
          Tool.change_visible(63, this.map1, true);
          flyTo(
            this.map1.getView(),
            fromLonLat([113.08, 27.8705]),
            14.5,
            function () {}
          );
          break;
        case 18:
          this.$refs.azeScroll.wrap.scrollTop = (newvalue - 4) * 100 + 60;
          Tool.change_visible(63, this.map1, false);
          Tool.change_visible(166, this.map1, false);
          Tool.change_visible(167, this.map1, false);

          Tool.change_visible(168, this.map1, true);
          Tool.change_visible(169, this.map1, true);
          Tool.change_visible(170, this.map1, true);

          flyTo(
            this.map1.getView(),
            [12588047.44403905, 3231470.0852316],
            15.50505,
            function () {}
          );
          break;
        case 19:
          this.$refs.azeScroll.wrap.scrollTop = (newvalue - 4) * 100 + 60;
          // show_layer_feature(60, "铜霞片区废渣", this.map1);
          Tool.change_visible(568, this.map1, false);
          Tool.change_visible(569, this.map1, false);

          Tool.change_visible(570, this.map1, true);
          Tool.change_visible(571, this.map1, true);
          Tool.change_visible(572, this.map1, true);

          flyTo(
            this.map1.getView(),
            [12587057.004977126, 3233343.342626203],
            18,
            function () {}
          );
          break;
        case 20:
          this.$refs.azeScroll.wrap.scrollTop = (newvalue - 4) * 100 + 60;

          Tool.change_visible(80, this.map1, false);
          Tool.change_visible(82, this.map1, true);
          Tool.change_visible(83, this.map1, true);

          flyTo(
            this.map1.getView(),
            [12588947.058446938, 3232243.581735763],
            15.458831,
            function () {}
          );
          break;
        case 21:
          this.$refs.azeScroll.wrap.scrollTop = (newvalue - 4) * 100 + 110;
          this.activities[newvalue - 1]["height"] =
            Number.parseInt(
              this.activities[newvalue - 1]["height"].split("px")[0]
            ) +
            10 +
            "px";
          Tool.change_visible(140, this.map1, false);
          Tool.change_visible(142, this.map1, true);
          Tool.change_visible(143, this.map1, true);

          flyTo(
            this.map1.getView(),
            [12589702.460622702, 3231962.888720221],
            15.565434,
            function () {}
          );

          break;
        case 22:
          this.$refs.azeScroll.wrap.scrollTop = (newvalue - 4) * 100 + 110;

          Tool.change_visible(427, this.map1, true);

          flyTo(
            this.map1.getView(),
            [12588032.286814818, 3231641.7954547713],
            18,
            function () {}
          );
          break;
        case 23:
          this.$refs.azeScroll.wrap.scrollTop = (newvalue - 4) * 100 + 110;
          this.activities[newvalue - 1]["height"] =
            Number.parseInt(
              this.activities[newvalue - 1]["height"].split("px")[0]
            ) +
            10 +
            "px";
          Tool.change_visible(384, this.map1, true);

          flyTo(
            this.map1.getView(),
            [12587714.937360462, 3231971.0130967125],
            18,
            function () {}
          );
          break;
        case 24:
          this.$refs.azeScroll.wrap.scrollTop = (newvalue - 4) * 100 + 110;
          Tool.change_visible(528, this.map1, true);

          flyTo(
            this.map1.getView(),
            [12587142.09792999, 3233979.4761901875],
            18,
            function () {}
          );
          break;

        case 25:
          this.$refs.azeScroll.wrap.scrollTop = (newvalue - 4) * 100 + 180;
          Tool.change_visible(369, this.map1, true);

          flyTo(
            this.map1.getView(),
            [12587017.91843781, 3233968.1994281905],
            18,
            function () {}
          );

          break;

        case 26:
          this.$refs.azeScroll.wrap.scrollTop = (newvalue - 4) * 100 + 110;
          // show_layer_feature(60, "清水片区废渣", this.map1);
          Tool.change_visible(562, this.map1, false);
          Tool.change_visible(563, this.map1, false);

          Tool.change_visible(548, this.map1, true);
          Tool.change_visible(549, this.map1, true);
          Tool.change_visible(550, this.map1, true);

          flyTo(
            this.map1.getView(),
            [12586898.776010714, 3232739.795433753],
            18,
            function () {}
          );
          break;

        case 27:
          this.$refs.azeScroll.wrap.scrollTop = (newvalue - 4) * 100 + 200;
          // show_layer_feature(60, "袁家冲废渣", this.map1);
          Tool.change_visible(575, this.map1, false);
          Tool.change_visible(576, this.map1, false);

          Tool.change_visible(577, this.map1, true);
          Tool.change_visible(578, this.map1, true);
          Tool.change_visible(579, this.map1, true);

          flyTo(
            this.map1.getView(),
            [12587039.064988513, 3233200.0742730517],
            18,
            function () {}
          );

          break;
        case 28:
          this.$refs.azeScroll.wrap.scrollTop = (newvalue - 4) * 100 + 110;

          Tool.change_visible(194, this.map1, false);
          Tool.change_visible(195, this.map1, false);

          Tool.change_visible(196, this.map1, true);
          Tool.change_visible(197, this.map1, true);
          Tool.change_visible(198, this.map1, true);
          flyTo(
            this.map1.getView(),
            [12585691.418092232, 3232444.424431],
            15.37275175,
            function () {}
          );
          break;
        case 29:
          this.$refs.azeScroll.wrap.scrollTop = (newvalue - 4) * 100 + 110;

          Tool.change_visible(577, this.map1, false);
          Tool.change_visible(578, this.map1, false);
          Tool.change_visible(579, this.map1, false);

          show_layer_feature(60, "袁家冲废渣", this.map1);

          flyTo(
            this.map1.getView(),
            [12587039.064988513, 3233200.0742730517],
            18,
            function () {}
          );

          break;
        case 30:
          this.$refs.azeScroll.wrap.scrollTop = (newvalue - 4) * 100 + 110;

          Tool.change_visible(142, this.map1, false);
          Tool.change_visible(143, this.map1, false);
          Tool.change_visible(144, this.map1, true);
          Tool.change_visible(145, this.map1, true);
          Tool.change_visible(146, this.map1, true);

          flyTo(
            this.map1.getView(),
            [12589702.460622702, 3231962.888720221],
            15.565434,
            function () {}
          );
          break;
        case 31:
          this.$refs.azeScroll.wrap.scrollTop = (newvalue - 4) * 100 + 160;
          Tool.change_visible(292, this.map1, false);
          Tool.change_visible(293, this.map1, false);
          Tool.change_visible(294, this.map1, false);
          Tool.change_visible(295, this.map1, true);
          Tool.change_visible(296, this.map1, true);
          Tool.change_visible(297, this.map1, true);

          flyTo(
            this.map1.getView(),
            [12587645.89709267, 3232728.4414745807],
            15.2114,
            function () {}
          );
          break;
        case 32:
          this.$refs.azeScroll.wrap.scrollTop = (newvalue - 4) * 100 + 120;
          this.activities[newvalue - 1]["height"] =
            Number.parseInt(
              this.activities[newvalue - 1]["height"].split("px")[0]
            ) +
            10 +
            "px";
          Tool.change_visible(259, this.map1, false);
          Tool.change_visible(260, this.map1, false);
          Tool.change_visible(261, this.map1, false);
          Tool.change_visible(262, this.map1, true);
          Tool.change_visible(263, this.map1, true);
          Tool.change_visible(264, this.map1, true);

          Tool.change_visible(295, this.map1, false);
          Tool.change_visible(296, this.map1, false);
          Tool.change_visible(297, this.map1, false);

          Tool.change_visible(299, this.map1, true);
          Tool.change_visible(300, this.map1, true);
          Tool.change_visible(301, this.map1, true);

          flyTo(
            this.map1.getView(),
            [12586587.172907192, 3233068.540116433],
            15.5114,
            function () {}
          );

          break;
        case 33:
          this.$refs.azeScroll.wrap.scrollTop = (newvalue - 4) * 100 + 120;

          Tool.change_visible(196, this.map1, false);
          Tool.change_visible(197, this.map1, false);
          Tool.change_visible(198, this.map1, false);
          Tool.change_visible(199, this.map1, true);
          Tool.change_visible(200, this.map1, true);
          Tool.change_visible(201, this.map1, true);

          Tool.change_visible(262, this.map1, false);
          Tool.change_visible(263, this.map1, false);
          Tool.change_visible(264, this.map1, false);

          Tool.change_visible(277, this.map1, true);
          Tool.change_visible(278, this.map1, true);
          Tool.change_visible(279, this.map1, true);
          flyTo(
            this.map1.getView(),
            [12585691.418092232, 3232444.424431],
            15.37275175,
            function () {}
          );
          break;
        case 34:
          this.$refs.azeScroll.wrap.scrollTop = (newvalue - 4) * 100 + 120;
          Tool.change_visible(199, this.map1, false);
          Tool.change_visible(200, this.map1, false);
          Tool.change_visible(201, this.map1, false);

          Tool.change_visible(210, this.map1, false);
          Tool.change_visible(211, this.map1, false);
          Tool.change_visible(212, this.map1, false);
          Tool.change_visible(213, this.map1, false);

          show_layer_feature(60, "清水片区废渣", this.map1);

          flyTo(
            this.map1.getView(),
            [12586898.776010714, 3232739.795433753],
            18,
            function () {}
          );

          break;
        case 35:
          this.$refs.azeScroll.wrap.scrollTop = (newvalue - 4) * 100 + 120;

          Tool.change_visible(82, this.map1, false);
          Tool.change_visible(83, this.map1, false);
          Tool.change_visible(84, this.map1, true);
          Tool.change_visible(85, this.map1, true);
          Tool.change_visible(86, this.map1, true);

          flyTo(
            this.map1.getView(),
            [12588947.058446938, 3232243.581735763],
            15.458831,
            function () {}
          );
          break;
        case 36:
          this.$refs.azeScroll.wrap.scrollTop = (newvalue - 4) * 100 + 120;

          Tool.change_visible(221, this.map1, false);
          Tool.change_visible(222, this.map1, false);
          Tool.change_visible(223, this.map1, true);
          Tool.change_visible(224, this.map1, true);
          Tool.change_visible(225, this.map1, true);

          flyTo(
            this.map1.getView(),
            [12586121.300649274, 3233686.1519913],
            15.588702,
            function () {}
          );

          break;

        case 37:
          this.$refs.azeScroll.wrap.scrollTop = (newvalue - 4) * 100 + 130;

          Tool.change_visible(62, this.map1, true);

          show_layer_feature(62, "一般工业固废填埋场", this.map1);
          flyTo(
            this.map1.getView(),
            [12587136.127873046, 3234189.4726392496],
            18,
            function () {}
          );

          break;
        case 38:
          this.$refs.azeScroll.wrap.scrollTop = (newvalue - 4) * 100 + 130;
          Tool.change_visible(637, this.map1, false);
          Tool.change_visible(638, this.map1, true);

          break;
        case 39:
          this.$refs.azeScroll.wrap.scrollTop = (newvalue - 4) * 100 + 130;

          Tool.change_visible(384, this.map1, false);
          Tool.change_visible(386, this.map1, true);
          Tool.change_visible(387, this.map1, true);

          flyTo(
            this.map1.getView(),
            [12587714.937360462, 3231971.0130967125],
            18,
            function () {}
          );

          break;
        case 40:
          this.$refs.azeScroll.wrap.scrollTop = (newvalue - 4) * 100 + 180;

          Tool.change_visible(427, this.map1, false);
          Tool.change_visible(429, this.map1, true);
          Tool.change_visible(430, this.map1, true);
          Tool.change_visible(431, this.map1, true);

          flyTo(
            this.map1.getView(),
            [12588032.286814818, 3231641.7954547713],
            18,
            function () {}
          );
          break;
        case 41:
          this.$refs.azeScroll.wrap.scrollTop = (newvalue - 4) * 100 + 160;

          this.activities[newvalue - 1]["height"] =
            Number.parseInt(
              this.activities[newvalue - 1]["height"].split("px")[0]
            ) +
            10 +
            "px";
          Tool.change_visible(528, this.map1, false);
          Tool.change_visible(530, this.map1, true);
          Tool.change_visible(531, this.map1, true);
          Tool.change_visible(532, this.map1, true);

          flyTo(
            this.map1.getView(),
            [12587142.09792999, 3233979.4761901875],
            18,
            function () {}
          );

          break;

        case 42:
          this.$refs.azeScroll.wrap.scrollTop = (newvalue - 4) * 100 + 160;

          Tool.change_visible(369, this.map1, false);
          Tool.change_visible(371, this.map1, true);
          Tool.change_visible(372, this.map1, true);

          flyTo(
            this.map1.getView(),
            [12587017.91843781, 3233968.1994281905],
            18,
            function () {}
          );

          break;

        case 43:
          this.$refs.azeScroll.wrap.scrollTop = (newvalue - 4) * 100 + 130;

          Tool.change_visible(354, this.map1, true);

          flyTo(
            this.map1.getView(),
            [12588193.398331456, 3232241.7539923643],
            18,
            function () {}
          );

          break;
        case 44:
          this.$refs.azeScroll.wrap.scrollTop = (newvalue - 4) * 100 + 130;

          show_layer_feature(62, "环保示范中心", this.map1);

          this.img_show = 1;
          flyTo(
            this.map1.getView(),
            [12587061.417023066, 3232203.8065897888],
            18,
            function () {}
          );

          break;
        case 45:
          this.$refs.azeScroll.wrap.scrollTop = (newvalue - 4) * 100 + 160;
          this.img_show = 0;
          show_layer_feature(64, "火炬地块", this.map1);

          flyTo(
            this.map1.getView(),
            [12588047.44403905, 3231470.0852316],
            18,
            function () {}
          );

          break;
        case 46:
          this.$refs.azeScroll.wrap.scrollTop = (newvalue - 4) * 100 + 130;
          Tool.change_visible(84, this.map1, false);
          Tool.change_visible(85, this.map1, false);
          Tool.change_visible(86, this.map1, false);
          Tool.change_visible(87, this.map1, true);
          Tool.change_visible(88, this.map1, true);
          Tool.change_visible(89, this.map1, true);

          flyTo(
            this.map1.getView(),
            [12588947.058446938, 3232243.581735763],
            15.458831,
            function () {}
          );

          break;
        case 47:
          this.$refs.azeScroll.wrap.scrollTop = (newvalue - 4) * 100 + 130;
          Tool.change_visible(168, this.map1, false);
          Tool.change_visible(169, this.map1, false);
          Tool.change_visible(170, this.map1, false);
          Tool.change_visible(171, this.map1, true);
          Tool.change_visible(172, this.map1, true);
          Tool.change_visible(173, this.map1, true);

          Tool.change_visible(87, this.map1, false);
          Tool.change_visible(88, this.map1, false);
          Tool.change_visible(89, this.map1, false);
          for (let i = 23; i < 29; i++) {
            Tool.change_visible(i, this.map1, false);
          }

          flyTo(
            this.map1.getView(),
            [12588047.44403905, 3231470.0852316],
            15.50505,
            function () {}
          );

          break;
        case 48:
          this.$refs.azeScroll.wrap.scrollTop = (newvalue - 4) * 100 + 130;
          show_layer_feature(60, "铜霞片区废渣", this.map1);

          Tool.change_visible(171, this.map1, false);
          Tool.change_visible(172, this.map1, false);
          Tool.change_visible(173, this.map1, false);

          for (let i = 177; i < 182; i++) {
            Tool.change_visible(i, this.map1, false);
          }

          break;
        case 49:
          this.$refs.azeScroll.wrap.scrollTop = (newvalue - 4) * 100 + 280;

          Tool.change_visible(310, this.map1, true);

          flyTo(
            this.map1.getView(),
            [12588370.651635144, 3231718.1138479877],
            18,
            function () {}
          );

          break;
        case 50:
          this.$refs.azeScroll.wrap.scrollTop = (newvalue - 4) * 100 + 180;

          Tool.change_visible(502, this.map1, true);

          flyTo(
            this.map1.getView(),
            [12587857.421065427, 3232494.638801338],
            18,
            function () {}
          );

          break;
        case 51:
          this.$refs.azeScroll.wrap.scrollTop = (newvalue - 4) * 100 + 180;

          Tool.change_visible(448, this.map1, true);

          flyTo(
            this.map1.getView(),
            [12587476.967269912, 3232735.646572577],
            18,
            function () {}
          );

          break;
        case 52:
          this.$refs.azeScroll.wrap.scrollTop = (newvalue - 4) * 100 + 180;
          Tool.change_visible(562, this.map1, true);
          Tool.change_visible(563, this.map1, true);

          flyTo(
            this.map1.getView(),
            [12588544.39866877, 3232640.3591856677],
            18,
            function () {}
          );

          break;
        case 53:
          this.$refs.azeScroll.wrap.scrollTop = (newvalue - 4) * 100 + 280;
          this.img_show = 2;
          show_layer_feature(62, "污染土壤处置中心", this.map1);
          flyTo(
            this.map1.getView(),
            [12588261.273323443, 3234106.879096942],
            18,
            function () {}
          );

          break;
        case 54:
          this.$refs.azeScroll.wrap.scrollTop = (newvalue - 4) * 100 + 230;
          this.img_show = 0;
          Tool.change_visible(354, this.map1, false);
          Tool.change_visible(356, this.map1, true);
          Tool.change_visible(357, this.map1, true);
          Tool.change_visible(358, this.map1, true);

          flyTo(
            this.map1.getView(),
            [12588193.398331456, 3232241.7539923643],
            18,
            function () {}
          );

          break;
        case 55:
          this.$refs.azeScroll.wrap.scrollTop = (newvalue - 4) * 100 + 230;

          Tool.change_visible(144, this.map1, false);
          Tool.change_visible(145, this.map1, false);
          Tool.change_visible(146, this.map1, false);
          Tool.change_visible(147, this.map1, true);
          Tool.change_visible(148, this.map1, true);
          Tool.change_visible(149, this.map1, true);

          flyTo(
            this.map1.getView(),
            [12588193.398331456, 3232241.7539923643],
            18,
            function () {}
          );

          break;
        case 56:
          this.$refs.azeScroll.wrap.scrollTop = (newvalue - 4) * 100 + 130;
          Tool.change_visible(64, this.map1, true);
          show_layer_feature(64, "口岸一路", this.map1);

          Tool.change_visible(147, this.map1, false);
          Tool.change_visible(148, this.map1, false);
          Tool.change_visible(149, this.map1, false);

          for (let i = 152; i < 156; i++) {
            Tool.change_visible(i, this.map1, true);
          }

          flyTo(
            this.map1.getView(),
            [12588000.44403905, 3231470.0852316],
            18,
            function () {}
          );

          break;
        case 57:
          this.$refs.azeScroll.wrap.scrollTop = (newvalue - 4) * 100 + 130;

          flyTo(
            this.map1.getView(),
            fromLonLat([113.08, 27.8705]),
            14.5,
            function () {}
          );

          break;
        case 58:
          this.$refs.azeScroll.wrap.scrollTop = (newvalue - 4) * 100 + 130;

          Tool.change_visible(310, this.map1, false);
          Tool.change_visible(311, this.map1, false);
          Tool.change_visible(312, this.map1, true);
          Tool.change_visible(313, this.map1, true);
          Tool.change_visible(314, this.map1, true);

          flyTo(
            this.map1.getView(),
            [12588370.651635144, 3231718.1138479877],
            18,
            function () {}
          );

          break;
        case 59:
          this.$refs.azeScroll.wrap.scrollTop = (newvalue - 4) * 100 + 180;

          Tool.change_visible(502, this.map1, false);
          Tool.change_visible(503, this.map1, false);
          Tool.change_visible(504, this.map1, true);
          Tool.change_visible(505, this.map1, true);
          Tool.change_visible(506, this.map1, true);

          flyTo(
            this.map1.getView(),
            [12587857.421065427, 3232494.638801338],
            18,
            function () {}
          );

          break;
        case 60:
          this.$refs.azeScroll.wrap.scrollTop = (newvalue - 4) * 100 + 230;

          Tool.change_visible(408, this.map1, false);
          Tool.change_visible(409, this.map1, false);
          Tool.change_visible(410, this.map1, true);
          Tool.change_visible(412, this.map1, true);
          Tool.change_visible(413, this.map1, true);

          flyTo(
            this.map1.getView(),
            [12587476.967269912, 3232735.646572577],
            18,
            function () {}
          );

          break;

        case 61:
          this.$refs.azeScroll.wrap.scrollTop = (newvalue - 4) * 100 + 250;
          Tool.change_visible(223, this.map1, false);
          Tool.change_visible(224, this.map1, false);
          Tool.change_visible(225, this.map1, false);
          Tool.change_visible(226, this.map1, true);
          Tool.change_visible(227, this.map1, true);
          Tool.change_visible(228, this.map1, true);

          flyTo(
            this.map1.getView(),
            [12586121.300649274, 3233686.1519913],
            15.588702398,
            function () {}
          );

          break;
        case 62:
          this.$refs.azeScroll.wrap.scrollTop = (newvalue - 4) * 100 + 350;
          Tool.change_visible(226, this.map1, false);
          Tool.change_visible(227, this.map1, false);
          Tool.change_visible(228, this.map1, false);
          for (let i = 232; i < 240; i++) {
            Tool.change_visible(i, this.map1, true);
          }

          Tool.change_visible(389, this.map1, false);
          Tool.change_visible(390, this.map1, false);
          Tool.change_visible(391, this.map1, false);
          show_layer_feature(61, "株洲市天源纺织有限公司", this.map1);

          flyTo(
            this.map1.getView(),
            [12587714.937360462, 3231971.0130967125],
            18,
            function () {}
          );
          break;
        case 63:
          this.$refs.azeScroll.wrap.scrollTop = (newvalue - 4) * 100 + 350;
          Tool.change_visible(432, this.map1, false);
          Tool.change_visible(433, this.map1, false);
          Tool.change_visible(434, this.map1, false);
          show_layer_feature(61, "株洲市宏基锌业有限公司", this.map1);
          flyTo(
            this.map1.getView(),
            [12588032.286814818, 3231641.7954547713],
            18,
            function () {}
          );

          break;
        case 64:
          this.$refs.azeScroll.wrap.scrollTop = (newvalue - 4) * 100 + 350;
          Tool.change_visible(389, this.map1, false);
          Tool.change_visible(390, this.map1, false);
          Tool.change_visible(391, this.map1, false);
          show_layer_feature(61, "荷花水泥厂", this.map1);
          flyTo(
            this.map1.getView(),
            [12587142.09792999, 3233979.4761901875],
            18,
            function () {}
          );

          break;
        case 65:
          this.$refs.azeScroll.wrap.scrollTop = (newvalue - 4) * 100 + 350;
          Tool.change_visible(389, this.map1, false);
          Tool.change_visible(390, this.map1, false);
          Tool.change_visible(391, this.map1, false);
          show_layer_feature(61, "株洲市鑫达冶化有限责任公司", this.map1);
          flyTo(
            this.map1.getView(),
            [12587017.91843781, 3233968.1994281905],
            18,
            function () {}
          );

          break;
        case 66:
          this.$refs.azeScroll.wrap.scrollTop = (newvalue - 4) * 100 + 350;
          Tool.change_visible(359, this.map1, false);
          Tool.change_visible(360, this.map1, false);
          Tool.change_visible(361, this.map1, false);
          show_layer_feature(61, "康力冶炼厂", this.map1);
          flyTo(
            this.map1.getView(),
            [12588193.398331456, 3232241.7539923643],
            18,
            function () {}
          );

          break;
        case 67:
          this.$refs.azeScroll.wrap.scrollTop = (newvalue - 4) * 100 + 350;
          show_layer_feature(60, "清石片区历史堆存废渣", this.map1);
          flyTo(
            this.map1.getView(),
            [12588544.39866877, 3232640.3591856677],
            18,
            function () {}
          );

          break;
        case 68:
          this.$refs.azeScroll.wrap.scrollTop = (newvalue - 4) * 100 + 350;

          Tool.change_visible(453, this.map1, false);
          Tool.change_visible(454, this.map1, false);
          Tool.change_visible(455, this.map1, false);
          show_layer_feature(61, "清水冶化有限责任公司", this.map1);
          flyTo(
            this.map1.getView(),
            [12587476.967269912, 3232735.646572577],
            18,
            function () {}
          );

          break;
        case 69:
          flyTo(
            this.map1.getView(),
            fromLonLat([113.08, 27.8705]),
            14.5,
            function () {}
          );
          break;
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
      height: 99%;
      padding: 10px;
      display: grid;
      grid-template-columns: 3fr 14fr;
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
          width: 96%;
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
  }
}
.group {
  position: absolute;
  z-index: 3;
}
.imggroup {
  position: absolute;
  z-index: 3;
  width: 50%;
  height: 150px;
  right: 0em;
  top: 0em;

  .img1 {
    width: 50%;
    float: left;
    height: 100%;
    bottom: 0em;
    position: relative;

    // background: #ff0;
    background-image: url("../assets/images/环保中心1.jpg");
    background-repeat: no-repeat;
    background-size: 100%;
    z-index: 2;
    // border: 1px dashed rgb(0, 0, 0);
  }

  .img2 {
    width: 50%;
    float: left;
    height: 100%;
    bottom: 0em;
    position: relative;

    // background: #ff0;
    background-image: url("../assets/images/环保中心2.jpg");
    background-repeat: no-repeat;
    background-size: 100%;
    z-index: 2;
    // border: 1px dashed rgb(0, 0, 0);
  }

  .img3 {
    width: 50%;
    float: left;
    height: 100%;
    bottom: 0em;
    position: relative;

    // background: #ff0;
    background-image: url("../assets/images/污染土壤处置中心1.jpg");
    background-repeat: no-repeat;
    background-size: 100%;
    z-index: 2;
    // border: 1px dashed rgb(0, 0, 0);
  }

  .img4 {
    width: 50%;
    float: left;
    height: 100%;
    bottom: 0em;
    position: relative;

    // background: #ff0;
    background-image: url("../assets/images/污染土壤处置中心2.jpg");
    background-repeat: no-repeat;
    background-size: 100%;
    z-index: 2;
    // border: 1px dashed rgb(0, 0, 0);
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

.timeline-title {
  color: rgb(255, 98, 98);
  font-size: 16px;
  margin-top: 4px;
  // .timeline-content__idea {
  //   color: rgba(255, 255, 255, 1);
  // }
}

.timeline-content {
  color: rgba(255, 255, 255, 1);
  font-size: 15px;
  margin-top: 4px;
  // .timeline-content__idea {
  //   color: rgb(236, 13, 13);
  // }
}

.show_panel {
  height: 400px;
}
</style>
