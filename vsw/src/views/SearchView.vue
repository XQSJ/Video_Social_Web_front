<script>
export default {
  data() {
    return {
      searching:''
    }
  },
  mounted() {

  }
}
</script>

<template>
  <div>
    <i>搜索</i>
    <i >{{this.$route.query.key}}</i>
  </div>

</template>

<style scoped lang="stylus">

</style>