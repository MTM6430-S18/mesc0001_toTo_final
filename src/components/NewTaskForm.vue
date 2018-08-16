<template>
  <form class="new-task-form" @submit.prevent="addTask">
    <label>
      Title
      <input v-model.trim="newTask.title" type="text">
    </label>
    <label>
      Description
      <input v-model="newTask.description" type="text">
    </label>
    <label>
      Due At
      <input v-model="newTask.dueAt" type="date">
    </label>
    <label>
      Priority
      <select v-model="newTask.priority">
    <option>Low</option>
    <option selected>Medium</option>
    <option>High</option>
      </select>
    </label>
     <label>
      Category
      <select v-model="newTask.category">
    <option>Personal</option>
    <option>Work</option>
    <option>School</option>
      </select>
    </label>
    <button type="submit">Add Task</button>
  </form>
</template>

<script>
import axios from 'axios'

export default {
  data: () => ({
    newTask: {},
    priority: '',
    category: ''
  }),

  created () {
    this.resetNewTask()
  },

  methods: {
    addTask (task) {
      // this.$emit('addTask', this.newTask)
      // this.resetNewTask()
      axios.post('/tasks', task, this.axiosOptions)
        .then(({data: {data: t}}) => {
          this.$set(this.taskList, t.id, t)
          this.resetForm()
        })
        .catch(error => this.handleAPIErrors(error))
    },

    resetNewTask () {
      this.newTask = {
        id: Date.now(),
        title: '',
        dueAt: (new Date()).toISOString().split('T')[0],
        isComplete: false
      }
    },
    handleAPIErrors (error) {
      // We will make this more robust net week
      console.log(error.message)
    }
  }
}

</script>

<style lang="scss">
.new-task-form {
  margin-bottom: 2rem;

  label {
    display: flex;
    flex-direction: column;
    margin-bottom: 1rem;
  }

  input, select {
    background: hsl(0, 0%, 97%);
    border: 1px solid hsl(0, 0%, 93%);
    font-size: 1.1rem;
    padding: 0.4em;
    border-radius: 0.25rem;
  }

  button {
    background: hsl(138, 76%, 38%);
    border: 1px solid hsl(83, 90%, 48%);
    border-radius: 0.25rem;
    padding: 0.5rem 0.5rem;
    color: hsl(0, 0%, 99%);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-weight: 500;
    font-size: 1.1rem;
    width: 100%;
    box-shadow: 0px 1px 3px 0px rgba(0, 0, 0, 0.25);
    outline: none;

    &:active {
      box-shadow: none;
      background: hsl(143, 89%, 41%);
      border: 1px solid hsl(61, 86%, 59%);
    }
  }
}
</style>
