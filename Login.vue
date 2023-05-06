<template>
  <div class="home">
    <div id="header">
      <div id="head_flex">
        <div class="font_img">
          <img
            src="../../static/images/首页图片.png"
            style="width: 100%"
            alt=""
          />
        </div>

        <div class="font_title">
          <h2>世界银行贷款湖南株洲清水塘区域重金属污染环境治理工程</h2>
        </div>
      </div>
    </div>
    <div id="container">
      <div id="extraContent">
        <div id="content">
          <el-radio-group v-model="radio1" class="language">
            <el-radio-button label="中文"></el-radio-button>
            <el-radio-button label="English"></el-radio-button>
          </el-radio-group>
          <div class="topleft">
            <div id="topleft-border">
              <div id="topleft-img" class="animated puffIn"></div>
            </div>

            <h3 v-if="radio1 === '中文'">
              株洲市清水塘工业区是二十世纪六十年代国家重点投资建设的老工业区基地，主导产业以铅锌冶炼、重化工业为主。60多年冶化工业的发展历史，使得清水塘工业区成为湖南省乃至全国著名的重金属污染区。株洲市政府高度重视清水塘工业区的污染问题，在国家发改委、国家生态环境部、湖南省人民政府等部门的高度关注和支持下，先行启动的清水塘工业区的环境综合治理有效地清除了污染来源。
            </h3>
            <h4 v-if="radio1 === 'English'">
              Qingshuitang Industrial Zone in Zhuzhou City is an old industrial
              center invested and constructed by the state in the 1960s. The
              major industries are lead and zinc smelting and heavy chemical
              industry. With more than 60 years of development of metallurgy and
              chemical industry, Qingshuitang Industrial Zone has become a
              well-known heavy metal pollution area in Hunan Province, and even
              in the Country. The Zhuzhou Municipal Government paid great
              attention to the pollution problem of Qingshuitang Industrial
              Zone, initiated a comprehensive environmental remediation and
              management operation and has effectively eliminated the source of
              pollution, with the high attention and strong support of the
              National Development and Reform Commission, the Ministry of
              Ecology and Environment, the Government of Hunan Province and
              other departments.
            </h4>
          </div>
          <div class="topright">
            <div id="topright-border">
              <div id="topright-img" class="animated puffIn"></div>
            </div>

            <h3 v-if="radio1 === '中文'">
              本项目为中国首个污染地块修复及再开发的世界银行贷款项目，项目区域总面积8.48
              km2，项目建设内容包括地块风险管制及修复如片区污染土壤治理、关停企业污染地块治理、历史遗留废渣治理、水体污染底泥治理等；修复配套工程如污染土壤处理场、水塘底泥脱水场、固体废物填埋场建设等；技术援助及示范工程如项目实施能力加强、公众参与、战略规划、环保信息与示范中心建设等。
            </h3>
            <h4 v-if="radio1 === 'English'">
              This project is the first World Bank loan project for the
              restoration and redevelopment of contaminated field in China, with
              an area of approximately 8.48 km2 (project area). It includes land
              risk control of polluted area and remediation of contaminated
              soil, the treatment of polluted parcels of shutting down
              enterprises, clean up historical waste and polluted pond as well
              as their bottom mud, etc.; remediation supporting projects such as
              contaminated soil treatment sites, pond sediment dewatering sites,
              solid waste landfill construction, etc.; technical assistance and
              demonstration projects such as project implementation capacity
              enhancement, public participation, strategic planning,
              environmental protection information and demonstration Center
              construction, etc.
            </h4>
          </div>
          <div class="bottomleft">
            <div id="bottomleft-border">
              <div id="bottomleft-img" class="animated puffIn"></div>
            </div>

            <h3 v-if="radio1 === '中文'">
              为进一步管控和修复清水塘工业区污染地块，助力工业区产业转型，并为其他区域污染地块治理提供经验。2016年3月31日，世界银行执行董事会批准湖南株洲清水塘区域重金属污染环境治理项目贷款1.5亿美元，用于开展老工业区污染地块的清理与修复。
            </h3>

            <h4 v-if="radio1 === 'English'">
              In order to further control and remedial the polluted area in
              Qingshuitang Industrial Zone, help the innovation of the
              industrial zone, and provide experience for the treatment of
              polluted area in other regions, on March 31, 2016, the Executive
              Board of the World Bank approved a loan of US$150 million for the
              Environmental Treatment Project of Heavy Metal Pollution in
              Qingshuitang, Zhuzhou, Hunan, for the cleanup and restoration of
              polluted area in old industrial zone.
            </h4>
          </div>
          <div class="bottomright">
            <div id="bottomright-border">
              <div id="bottomright-img"></div>
            </div>

            <h3 v-if="radio1 === '中文'">
              项目实施期为2016年至2022年，预计直接受益人包括项目区居民6237人以及清水塘工业区所在的石峰区居民26.2万人，株洲市及其周边30万居民也将得益于环境治理带来的饮用水、农产品及大气安全改善。本项目获得的工程经验和技术成果将为未来污染地块的可持续发展提供有益借鉴。
            </h3>
            <h4 v-if="radio1 === 'English'">
              The project implementation period is from 2016 to 2022. It is
              estimated that the direct beneficiaries include 6,237 residents in
              the project area and 262,000 residents in Shifeng District, where
              Qingshuitang Industrial Zone is located. Zhuzhou City and its
              surrounding 300,000 residents will also benefit from the
              environment clean-up by clean air, safe drinking water and food
              safety improvements . The engineering experience and technical
              achievements obtained in this project will provide useful
              reference for the sustainable development of brownfield in the
              future.
            </h4>
            <el-button type="primary" id="Scream" @click="Scream"
              >大屏展示</el-button
            >
            <el-button type="primary" id="enter" @click="login"
              >了解详情</el-button
            >
          </div>
        </div>
      </div>
      <div id="sidebar" v-show="false">
        <el-form
          ref="AccountFrom"
          :model="account"
          :rules="rules"
          label-position="left"
          label-width="0px"
          class="demo-ruleForm login-container"
        >
          <h3 class="title">管理员登录</h3>
          <el-form-item prop="username">
            <el-input
              type="text"
              v-model="account.username"
              auto-complete="off"
              placeholder="账号"
            ></el-input>
          </el-form-item>
          <el-form-item prop="pwd">
            <el-input
              type="password"
              v-model="account.pwd"
              auto-complete="off"
              placeholder="密码"
            ></el-input>
          </el-form-item>

          <el-form-item style="width: 100%">
            <el-button type="primary" style="width: 100%" :loading="loading"
              >登录</el-button
            >
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script>
import API from "../api/api_user";

export default {
  data() {
    return {
      loading: false,
      account: {
        username: "admin",
        pwd: "123456",
      },
      rules: {
        username: [
          { required: true, message: "请输入账号", trigger: "blur" },
          //{ validator: validaePass }
        ],
        pwd: [
          { required: true, message: "请输入密码", trigger: "blur" },
          //{ validator: validaePass2 }
        ],
      },
      checked: true,
      imagebox: [
        { id: 0, idView: require("../../static/images/img1.png") },
        { id: 1, idView: require("../../static/images/img2.png") },
        { id: 2, idView: require("../../static/images/img3.png") },
        //imagebox是assets下一个放图片的文件夹
      ],
      radio1: "中文",
    };
  },
  methods: {
    handleLogin() {
      let that = this;
      this.$refs.AccountFrom.validate((valid) => {
        if (valid) {
          this.loading = true;
          let loginParams = {
            username: this.account.username,
            pwd: this.account.pwd,
          };
          API.login(loginParams)
            .then(
              function (result) {
                that.loading = false;
                if (result && result.id) {
                  localStorage.setItem("access-user", JSON.stringify(result));
                  //                that.$store.commit('SET_ROUTERS', user.permissions)
                  //                that.$router.addRoutes(that.$store.getters.addRouters);
                  //                that.$router.options.routes = that.$store.getters.routers;
                  that.$router.push({ path: "/" });
                } else {
                  that.$message.error({
                    showClose: true,
                    message: result.errmsg || "登录失败",
                    duration: 2000,
                  });
                }
              },
              function (err) {
                that.loading = false;
                that.$message.error({
                  showClose: true,
                  message: err.toString(),
                  duration: 2000,
                });
              }
            )
            .catch(function (error) {
              that.loading = false;
              console.log(error);
              that.$message.error({
                showClose: true,
                message: "请求出现异常",
                duration: 2000,
              });
            });
        }
      });
    },
    login() {
      localStorage.setItem("access-user", JSON.stringify("success"));
      this.$router.push({ path: "/dashboard" });
    },
    Scream() {
      localStorage.setItem("access-user", JSON.stringify("success"));
      this.$router.push({ path: "/Scream2" });
    },
  },
};
</script>

<style>
.background {
  width: 100%;
  height: 100%;
  /**宽高100%是为了图片铺满屏幕 */
  z-index: -1;
  position: absolute;
}

body {
  background: rgb(255, 255, 255);
}
</style>

<style lang="scss" scoped>
.home {
  width: 100%;
  height: 100%; // background-image: url('../../static/images/清水塘.png');
  //   background-size: 100% ;
  background: rgb(255, 255, 255);
}

.language {
  position: absolute;
  top: 50px;
  right: 0;
}

@media screen and (min-width: 1680px) and (max-width: 1920px) {
  h3 {
    font-family: "宋体", "Times New Roman", Times, serif;
    font-size: 1.5vw;
  }
}


@media screen and (min-width: 960px) and (max-width: 1680px){
  h3 {
    font-family: "宋体", "Times New Roman", Times, serif;
    font-size: 1vw;
  }
}

#header,
#footer {
  top: -1em;
  width: 100%;
  height: 50px; // background: #ff0;
  // border: 1px dashed #f00;
}

#word {
  width: 90%;
  left: 5em;
  top: 22em;
  position: absolute;
  font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB",
    "Microsoft YaHei", "楷体", Arial, sans-serif; // font-family:"楷体";
  color: #000000;
  background: rgba($color: #ffffff, $alpha: 0.4);
}

.img_div {
  // margin: 0px auto 40px auto;
  // top:10em;
  width: 15%;
  height: 50px; // float: left;
  // text-align: center;
}

#head_flex {
  display: flex; // justify-content:center;
  justify-content: center;
  align-items: center;
}

.font_img {
  width: 15%;
  vertical-align: center;
  top: -0.5em;
  position: relative;
}

.font_title {
  width: 85%;
  text-align: center;
  top: -0.8em;
  position: relative;
}

.word_title {
  // margin: 0px auto 0px auto;
  // top:10em;
  width: 85%;
  height: 100%;
  top: -50%;
  position: relative;
  float: right;
  text-align: center;
  color: #000000;
}

#container {
  width: 100%;
  height: calc(100vh - 50px); // border: 1px dashed #0f0;
  // background: #ffd;
  background-image: url("../assets/images/影像图.jpg");
  background-size: 100% 100%;
}

// h3{
//   font-family;
// }
#sidebar {
  width: 40%; // width: 500px;
  // background: orange;
  border: 2px dotted inherit;
  float: right;
  height: 100%;
}

#extraContent {
  float: left;
  width: 100%; // width: 800px;
  // margin-left: -300px;
  height: 100%;
  background: rgba($color: #ffffff, $alpha: 0.4);
}

#content {
  width: 100%; // margin-left: 304px;
  // background: #dec;
  height: 100%;
}

#enter {
  position: relative; // right: -42em;
  right: -35em;
  bottom: 2em;
}

#light {
  // float: right;
  margin: 10px auto 0px auto;
  width: 90%;
  left: 2em; // background:rgba($color: #c02626, $alpha: 1.0)
}

.topleft {
  width: 50%;
  float: left;
  height: 55%; // background: #ff0;
  // border: 1px dashed rgb(0, 0, 0);
  background: rgba($color: #ffffff, $alpha: 0.4);
  h3 {
    padding: 40px;
    line-height: 40px;
  }
  h4 {
    padding: 40px;
    line-height: 25px;
  }
  #topleft-border {
    width: 42%;
    float: left; // left:2em;
    height: 40%;
  }
  #topleft-img {
    width: 75%; // float: left;
    height: 75%;
    left: 15%;
    top: 35%;
    position: relative; // background: #ff0;
    background-image: url("../assets/images/老航拍.jpg");
    background-repeat: no-repeat;
    background-size: contain;
    shape-outside: polygon(
      10px 10px,
      10px 10px,
      10px 10px
    ); // border: 1px dashed rgb(0, 0, 0);
  }
}

.topright {
  width: 50%;
  height: 55%;
  float: right; // background: #ff0;
  // border: 1px dashed rgb(0, 0, 0);
  background: rgba($color: #ffffff, $alpha: 0.4);
  h3 {
    padding: 40px;
    line-height: 40px;
  }
  h4 {
    padding: 40px;
    line-height: 25px;
  }
  #topright-border {
    width: 40%;
    float: left;
    height: 45%;
  }
  #topright-img {
    width: 80%;
    float: left;
    height: 80%;
    left: 15%;
    top: 25%;
    position: relative; // background: #ff0;
    background-image: url("../assets/images/影像图.jpg");
    background-repeat: no-repeat;
    background-size: contain; // border: 1px dashed rgb(0, 0, 0);
  }
}

.bottomleft {
  width: 50%;
  float: left;
  height: 45%;
  h3 {
    padding: 40px;
    line-height: 40px;
  }
  h4 {
    padding: 40px;
    line-height: 25px;
  }
  background: rgba($color: #ffffff, $alpha: 0.4);
  #bottomleft-border {
    width: 37%;
    float: left;
    height: 55%;
  }
  #bottomleft-img {
    width: 70%;
    float: left;
    height: 80%;
    top: 25%;
    left: 20%;
    position: relative; // background: #ff0;
    background-image: url("../assets/images/图3.jpg");
    background-repeat: no-repeat;
    background-size: contain; // border: 1px dashed rgb(0, 0, 0);
  }
}

.animated {
  animation-duration: 1s;
  animation-fill-mode: both;
}

@keyframes puffIn {
  0% {
    opacity: 0;
    transform-origin: 50% 50%;
    transform: scale(2, 2);
    filter: blur(2px);
  }
  100% {
    opacity: 1;
    transform-origin: 50% 50%;
    transform: scale(1, 1);
    filter: blur(0px);
  }
}

.puffIn {
  animation-name: puffIn;
}

.bottomright {
  width: 50%;
  float: right;
  height: 45%; // background: #ff0;
  // border: 1px dashed rgb(0, 0, 0);
  background: rgba($color: #ffffff, $alpha: 0.4);
  h3 {
    padding: 40px;
    line-height: 40px;
  }
  h4 {
    padding: 40px;
    line-height: 25px;
  } //   #bottomright-img {
  //   width: 49.6%;
  //   float: left;
  //   height: 50%;
  //   // background: #ff0;
  //   border: 1px dashed rgb(190, 178, 178);
  // }
  #enter {
    bottom: 1em;
    right: 5em;
    position: absolute;
  }
  #Scream {
    bottom: 1em;
    right: 20em;
    position: absolute;
  }
}

.red {
  color: #e71111;
}

.login-container {
  /*box-shadow: 0 0px 8px 0 rgba(0, 0, 0, 0.06), 0 1px 0px 0 rgba(0, 0, 0, 0.02);*/
  -webkit-border-radius: 5px; // right:25em;
  border-radius: 5px; // -moz-border-radius: 5px;
  // background-clip: padding-box;
  margin: 2cm 0cm 2cm 3cm;
  width: 350px;
  padding: 35px 35px 15px 35px;
  background: #fff;
  border: 1px solid #eaeaea;
  box-shadow: 0 0 25px #cac6c6;
  background: -ms-linear-gradient(top, #ace, #00c1de);
  /* IE 10 */
  background: -moz-linear-gradient(top, #ace, #00c1de);
  /*火狐*/
  background: -webkit-gradient(linear, 0% 0%, 0% 100%, from(#ace), to(#00c1de));
  /*谷歌*/
  background: -webkit-linear-gradient(top, #ace, #00c1de);
  /*Safari5.1 Chrome 10+*/
  background: -o-linear-gradient(top, #ace, #00c1de);
  /*Opera 11.10+*/
  .title {
    // margin: 0px auto 40px auto;
    margin: 0px auto 40px auto;
    text-align: center;
    color: #505458;
  }
  .remember {
    margin: 0px 0px 35px 0px;
  }
}
</style>
