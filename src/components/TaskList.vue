<template>
  <transition-group name="list" tag="section" class="task-list">
    <task-list-item
        v-for="task in tasksSortByDue"
        :key="task.id"
        :task="task"
        @updateTask="updateTask"
        @toggleDone="toggleDone"
        @deleteTask="deleteTask" />
  </transition-group>
</template>

<script>
import TaskListItem from '@/components/TaskListItem'

export default {
  data () {
    return {
      priorityOptions: [
        {id: 1, order: 1, name: 'low'},
        {id: 2, order: 2, name: 'medium'},
        {id: 3, order: 3, name: 'high'}
      ],
      selectedPriority: ''
    }
  },

  components: { TaskListItem },
  props: ['tasks'],
  computed: {
    tasksSortByDue () {
      let sortedTasks = [ ...this.tasks ]
      return sortedTasks.sort((a, b) => new Date(a.dueAt) - new Date(b.dueAt))
    },

    // sortedTasks () {
    //   return [... this.allTask].sort((a, b) => {
    //     const dateOne = new Date(a.dueAt)
    //     const dateTwo = new Date(b.dueAt)
    //     return this.sortAscending ? (dateOne - dateTwo) : (dateTwo - dateOne)
    //   })
    // }
  },
  methods: {
    toggleDone (task) {
      this.$emit('toggleDone', task)
    },
    deleteTask (task) {
      this.$emit('deleteTask', task)
    },
    updateTask (task) {
      this.$emit('updateTask', task)
    }
  }
}
</script>

<style>
.list-move {
  transition: all 400ms ease-in-out 50ms;
}
.list-enter {
  opacity: 0;
  transform: translateY(-2em);
}
.list-leave-to {
  opacity: 0;
  transform: translateY(-2em);
}
.list-leave-active {
  position: absolute;
}
</style>
