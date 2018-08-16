import Vue from 'vue'
import Router from 'vue-router'
import TaskList from '@/components/TaskList.vue'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [{
    path: '/active',
    name: 'active',
    components: {
      overdue: TaskList,
      upcoming: TaskList
    }
  },
  {
    path: '/completed',
    name: 'completed',
    components: {
      completed: TaskList
    }
  },
  {
    path: '*',
    redirect: '/active'
  }
  ]
})
