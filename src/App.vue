<script setup>
import { RouterView } from "vue-router";
</script>

<template>
  <div id="app">
    <RouterView />
  </div>
</template>

<style>
/* 全局样式重置 */

body {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen",
    "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue",
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Element Plus 样式调整 */
.el-header {
  padding: 0 !important;
}

.el-main {
  padding: 0 !important;
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 6px;
  height: 3px;
}

::-webkit-scrollbar-track {
  background: #862f2f;
}

::-webkit-scrollbar-thumb {
  background: #0c0caf;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .el-aside {
    width: 100% !important;
    position: fixed;
    top: 0;
    left: 0;
    z-index: 1000;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
  }

  .el-aside.mobile-show {
    transform: translateX(0);
  }
}
</style>
