new Vue({
  el: '#app',
  data: {
    output: '',
    loading: false,
    isReady: false,    // 控制“导出数据”按钮是否启用
    cookiesValue: localStorage.getItem('cookies') || '',  // 用来绑定输入框的内容
    keyword: localStorage.getItem('keyword') || '',
    queryNum: localStorage.getItem('queryNum') || '',
  },
  methods: {
    runAll() {
      this.loading = true;
      this.isReady = false; // 等待抓取数据完成，按钮不可用
      fetch('/run-all')
        .then(res => res.text())
        .then(text => {
          this.isReady = true;   // 设置导出按钮可用
          // this.output = '成功抓取小红书数据';
          this.$message.success('成功抓取小红书数据');
          
        })
        .catch(err => {
          const msg = '执行出错: ' + err.message;
          this.$message.success(msg);
          
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
        this.$message.error('Cookies 不能为空');
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
        localStorage.setItem('cookies', this.cookies)
        this.output = result;  // 显示成功消息
        this.$message.success(msg);
      })
      .catch(error => {
        const msg = '更新 COOKIES 出错: ' + error;
        this.$message.error(msg);
      });
    },
    updateQuery() {
      if (!this.queryNum || !this.keyword) {
        this.$message.error('关键字或者数量不能为空');
        return;
      }

      fetch('/update-query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          keyword: this.keyword,
          queryNum: this.queryNum,
        })
      })
      .then(res => res.text())
      .then(result => {
        // this.output = result;  // 显示成功消息
        localStorage.setItem('keyword', this.keyword);
        localStorage.setItem('queryNum', this.queryNum)
        this.$message.success(result);
      })
      .catch(error => {
        // this.output = '更新 COOKIES 出错: ' + error;
        const msg = '更新 COOKIES 出错: ' + error;
        this.$message.error(msg);
      });
    }
    
    
  }
});
