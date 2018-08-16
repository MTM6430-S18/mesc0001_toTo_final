<template>
  <header class="the-header">
    <h1 class="app-title">
      <img class="logo" src="@/assets/checklist.png" alt="V">Vue Todos
    </h1>
    <p class="current-date">{{ (new Date()).toDateString() }}</p>
  </header>
</template>

<script>
export default {
  name: 'the-header'
}
</script>

<style lang="scss">
.the-header {
  text-align: center;

  .app-title {
    align-items: center;
    display: flex;
    justify-content: center;

    .logo {
      height: 3rem;
      width: auto;
    }
  }

  .current-date {
    font-size: 1.1em;
  }
}
</style>
