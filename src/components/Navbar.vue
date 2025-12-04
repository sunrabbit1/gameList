<template>
  <nav class="navbar">
    <ul class="nav-list">
      <li class="nav-item"><RouterLink to="gameList">首页</RouterLink></li>
      <li class="nav-item"><RouterLink to="2024">2024年合集</RouterLink></li>
      <!-- <li class="nav-item"><a href="">难</a></li>
      <li class="nav-item"><a href="">受</a></li>
      <li class="nav-item"><a href="">了</a></li> -->
    </ul>
  </nav>
</template>

<script>
export default {
  name: 'Navbar'
};
</script>

<style scoped>
.navbar {
  background-color: #333;
  overflow: hidden;
  width: 100%;
  z-index: 999;
  position: fixed;
  top: 0
}

.nav-list {
  list-style-type: none;
  margin: 0;
  padding: 0;
  display: flex;
  justify-content: center;
}

.nav-item {
  margin: 0 15px;
}

.nav-item a {
  color: white;
  text-align: center;
  padding: 14px 16px;
  text-decoration: none;
  display: block;
}

.nav-item a:hover {
  background-color: #ddd;
  color: black;
}
</style>
