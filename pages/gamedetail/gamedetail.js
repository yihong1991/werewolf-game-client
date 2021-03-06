// gamedetail.js

var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: null,
    gameDetail: null,
    // area: null,
    introTruncate: true,
    hasEntrance: false,
    nickName: "",
    now: (new Date()).getTime(),
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.getUserInfo(userInfo => {
      console.log(userInfo)
      this.setData({
        userInfo,
        // nickName: userInfo.nickName,
      })
    })
    let {
      id
    } = options
    if (!id && id !== 0) {
      wx.redirectTo({
        url: '../gamelist/gamelist',
      })
    }
    this.gameID = parseInt(id)

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.fetchGameDetail()
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.fetchGameDetail()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
      title: this.data.gameDetail.game_title,
    }
  },
  fetchGameDetail: function () {
    let that = this
    app.requestWithOpenID({
      url: `/games/${this.gameID}`,
      success: data => {
        let entrances = data.entrances
        if (entrances.length < 6 && data.judge) {
          entrances = entrances.concat([data.judge])
          entrances = entrances.reduce((prev, curr) => {
            if (prev.filter(item => item.openid == curr.openid).length === 0) {
              return prev.concat([curr])
            }
            return prev.slice(0)
          }, [])
        }
        that.setData({
          gameDetail: Object.assign({}, data, {
            displayTime: this.getDisplayTime(data),
            entrances,
          })
        })
        wx.setNavigationBarTitle({
          title: data.game_title,
        })
      },
    })
  },
  togglePlaceIntroTruncate: function () {
    this.setData({
      introTruncate: !this.data.introTruncate
    })
  },
  entranceAction: function () {
    wx.navigateTo({
      url: `../entranceinfo/entranceinfo?id=${this.gameID}`,
    })
  },

  onNickNameChanged: function (e) {
    this.setData({
      nickName: e.detail.value,
    })
    return e.detail.value
  },
  cancelEntrance: function () {
    app.requestWithOpenID({
      url: "/entrances/cancel",
      method: "POST",
      data: {
        game_id: this.gameID,
      },
      success: () => this.fetchGameDetail()
    })
  },
  pay: function () {
    let {
      prepay_id
    } = this.data.gameDetail
    app.pay({
      prepay_id,
      complete: () => this.fetchGameDetail()
    })
  },
  getDisplayTime: function (gameDetail) {
    if (!gameDetail || !gameDetail.start_time) {
      return ""
    }
    let dt = new Date(gameDetail.start_time)
    return `${dt.getFullYear()}年${dt.getMonth() + 1}月${dt.getDate()}日 ${dt.getHours()}:${dt.getMinutes()}`
  },
  cancelGame: function () {
    app.request({
      method: 'DELETE',
      url: `/games/${this.gameID}`,
      success: () => wx.navigateBack({

      })
    })
  }
})