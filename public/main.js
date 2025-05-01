new Vue({
  el: '#app',
  data: {
    output: '',
    loading: false,
    isReady: false,    // 控制“导出数据”按钮是否启用
    cookiesValue: ''  // 用来绑定输入框的内容

  },
  methods: {
    runAll() {
      this.loading = true;
      this.isReady = false; // 等待抓取数据完成，按钮不可用
      fetch('/run-all')
        .then(res => res.text())
        .then(text => {
          this.isReady = true;   // 设置导出按钮可用
          this.output = '成功抓取小红书数据';
        })
        .catch(err => {
          this.output = '执行出错: ' + err.message;
        })
        .finally(() => {
          this.loading = false;
        });
    },
    downloadZip() {
      const a = document.createElement('a');
      a.href = '/download-jsons';
      a.download = 'data.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    },
    // 更新 COOKIES
    updateCookies() {
      if (!this.cookiesValue) {
        this.output = '请输入有效的 COOKIES 值';
        return;
      }

      fetch('/update-cookies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          cookies: this.cookiesValue
        })
      })
      .then(res => res.text())
      .then(result => {
        this.output = result;  // 显示成功消息
      })
      .catch(error => {
        this.output = '更新 COOKIES 出错: ' + error;
      });
    }
    
    
  }
});
